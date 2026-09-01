'use client'
import { supabase, supabaseBereit } from '@/lib/supabaseClient'
import { paketIdFuer } from '@/lib/produkt'

// Ist jemand angemeldet? Gibt den Nutzer oder null zurück.
export async function aktuellerNutzer() {
  if (!supabaseBereit) return null
  const { data } = await supabase.auth.getSession()
  return data?.session?.user || null
}

// ── Produkt-Felder aus den Formulardaten ableiten ───────────────────────────
// Bisher wurde „mieten oder kaufen" ERST vom Stripe-Webhook in die Datenbank
// geschrieben. Bis dahin wusste das Kundenkonto nicht, was der Kunde eigentlich
// vorhat — deshalb stand auch bei einer Kauf-Website „Online schalten" und es
// kam die Mietpaket-Auswahl. Jetzt wird die Wahl aus dem Baukasten sofort
// mitgespeichert; der Webhook überschreibt sie später mit dem, was tatsächlich
// bezahlt wurde.
function produktFelder(daten) {
  const fd = daten?.form_data || {}
  const art = daten?.zahlungsart
    || (fd.zahlungsart === 'mieten' ? 'mieten' : fd.zahlungsart === 'kaufen' ? 'kaufen' : null)
  if (!art) return {}
  return { zahlungsart: art, paket_id: daten?.paket_id || paketIdFuer(art, fd.paket) }
}

// Neues Projekt anlegen. Gibt die neue ID zurück.
export async function projektAnlegen(daten) {
  const { name, firma, branche, form_data, pages, palette, font } = daten || {}
  const user = await aktuellerNutzer()
  if (!user) return null

  const { data, error } = await supabase
    .from('projekte')
    .insert({
      user_id: user.id,
      name: name || firma || 'Neue Website',
      firma: firma || null,
      branche: branche || null,
      status: 'entwurf',
      form_data: form_data || null,
      pages: pages || null,
      palette: palette || null,
      font: font || null,
      ...produktFelder(daten),
    })
    .select('id')
    .single()

  if (error) { console.warn('Projekt anlegen fehlgeschlagen:', error.message); return null }
  return data?.id || null
}

// Legt NUR DANN ein neues Projekt an, wenn es noch keinen unbezahlten Entwurf
// gibt. Sonst wird der vorhandene Entwurf überschrieben.
// Grund: Vorher entstand bei JEDER Generierung ein neuer Eintrag — nach ein
// paar Versuchen lagen 7 "Neue Website"-Entwürfe im Konto. Pro gebuchtem bzw.
// kostenlos getestetem Produkt soll es genau EINE Website geben.
// `daten.projektId` (aus /start?projekt=…) meint AUSDRÜCKLICH diese Website —
// dann wird genau sie neu aufgebaut und nicht irgendein anderer Entwurf.
export async function projektAnlegenOderAktualisieren(daten) {
  const user = await aktuellerNutzer()
  if (!user) return null

  let entwurf = null
  if (daten.projektId) {
    const { data } = await supabase
      .from('projekte').select('id,status,bezahlt_am').eq('id', daten.projektId).maybeSingle()
    // Bezahlte Websites werden NIE überschrieben.
    if (data && !data.bezahlt_am && !['online', 'gekauft', 'gekuendigt'].includes(data.status)) entwurf = data
  }
  if (!entwurf) {
    const { data } = await supabase
      .from('projekte')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'entwurf')
      .order('geaendert_am', { ascending: false })
      .limit(1)
      .maybeSingle()
    entwurf = data
  }

  if (entwurf?.id) {
    // Sicherungsstand anlegen, bevor der alte Aufbau überschrieben wird —
    // sonst wären Editor-Änderungen nach einer Neu-Konfiguration verloren.
    try {
      const alt = await projektLaden(entwurf.id)
      if (alt?.pages) {
        await versionAblegen(entwurf.id, {
          pages: alt.pages, palette: alt.palette, font: alt.font, form_data: alt.form_data,
        }, 'vor-neuerzeugung', 0)
      }
    } catch {}
    const ok = await projektSpeichern(entwurf.id, {
      name: daten.name || daten.firma || 'Neue Website',
      firma: daten.firma || null,
      branche: daten.branche || null,
      form_data: daten.form_data || null,
      pages: daten.pages || null,
      palette: daten.palette || null,
      font: daten.font || null,
      ...produktFelder(daten),
    })
    if (ok) return entwurf.id
  }
  return projektAnlegen(daten)
}

// ── Produkt einer Website festlegen/wechseln ────────────────────────────────
// Nur solange nichts bezahlt ist. Schreibt die Wahl in die Projekt-Spalten UND
// in die Formulardaten, damit Baukasten, Editor und Konto dasselbe anzeigen.
export async function produktSetzen(id, art, paketIdOderGroesse) {
  if (!id || !['mieten', 'kaufen'].includes(art)) return { error: 'Ungültige Produktart.' }
  const user = await aktuellerNutzer()
  if (!user) return { error: 'Bitte zuerst einloggen.' }

  const { data: p, error: leseFehler } = await supabase
    .from('projekte').select('id,status,bezahlt_am,paket_id,form_data').eq('id', id).maybeSingle()
  if (leseFehler) return { error: leseFehler.message }
  if (!p) return { error: 'Website nicht gefunden.' }
  if (p.bezahlt_am || ['online', 'gekauft', 'gekuendigt'].includes(p.status)) {
    return { error: 'Diese Website ist bereits bezahlt — das Produkt lässt sich nicht mehr wechseln.' }
  }

  const groesse = paketIdOderGroesse || p.form_data?.paket || p.paket_id || 'multipage'
  const paketId = paketIdFuer(art, groesse)
  const fd = { ...(p.form_data || {}), zahlungsart: art, paket: (p.form_data?.paket || 'multipage') }

  const { data, error } = await supabase.from('projekte')
    .update({ zahlungsart: art, paket_id: paketId, form_data: fd })
    .eq('id', id).select('id,zahlungsart,paket_id')
  if (error) return { error: error.message }
  if (!data || !data.length) return { error: 'Die Änderung konnte nicht gespeichert werden.' }
  return { zahlungsart: art, paket_id: paketId }
}

// Bestehendes Projekt aktualisieren.
export async function projektSpeichern(id, felder) {
  if (!id) return false
  const user = await aktuellerNutzer()
  if (!user) return false

  const { error } = await supabase
    .from('projekte')
    .update(felder)
    .eq('id', id)

  if (error) { console.warn('Speichern fehlgeschlagen:', error.message); return false }
  return true
}

// Projekt laden.
export async function projektLaden(id) {
  if (!id) return null
  const user = await aktuellerNutzer()
  if (!user) return null

  const { data, error } = await supabase
    .from('projekte')
    .select('*')
    .eq('id', id)
    .single()

  if (error) { console.warn('Laden fehlgeschlagen:', error.message); return null }
  return data
}

// Projekt-ID aus der Adresse lesen (?projekt=...)
export function projektIdAusUrl() {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('projekt')
}

// Pflichtangaben, die für ein rechtsgültiges Impressum/eine Rechnung nötig sind.
// Wird sowohl im Dashboard (Anzeige) als auch in der Checkout-Route (serverseitig,
// nicht umgehbar) benutzt — bevor "Online schalten" wirklich zu Stripe führt.
// Liegen jetzt in lib/profil.js (bewusst OHNE 'use client'), damit auch
// Server-Routen sie echt importieren können. Hier nur weitergereicht, damit
// bestehender Client-Code unverändert weiterläuft.
export { PROFIL_PFLICHTFELDER, profilLuecken } from '@/lib/profil'


// ── Lokalen Zwischenstand dem Konto zuordnen ────────────────────────────────
// Wer erst baut und sich DANACH registriert/einloggt, hätte seinen Stand
// sonst nur im Browser-Zwischenspeicher – und sieht im Konto nichts.
// Diese Funktion hängt den lokalen Stand als Entwurf ans Konto.
export async function lokalenStandUebernehmen() {
  if (typeof window === 'undefined') return null
  const user = await aktuellerNutzer()
  if (!user) return null
  try {
    const pages = JSON.parse(sessionStorage.getItem('wg24_pages') || 'null')
    if (!pages || !Object.keys(pages).length) return null
    const form = JSON.parse(sessionStorage.getItem('wg24_formData') || 'null') || {}
    const palette = JSON.parse(sessionStorage.getItem('wg24_palette') || 'null')
    const font = sessionStorage.getItem('wg24_font') || null
    const id = await projektAnlegenOderAktualisieren({
      name: form.firma || 'Meine Website',
      firma: form.firma || null,
      branche: form.branche || null,
      form_data: form,
      pages, palette, font,
    })
    return id || null
  } catch { return null }
}

// ── Versionsverlauf (Tabelle projekt_versionen, siehe migration_v27.sql) ────
// Beim Arbeiten wird höchstens alle 10 Minuten ein Sicherungsstand abgelegt,
// es bleiben die letzten 20 Stände je Projekt. Wiederherstellen im Editor.
const versionZuletzt = {}

export async function versionAblegen(projektId, daten, anlass = 'speichern', mindestAbstandMin = 10) {
  try {
    if (!projektId) return false
    const user = await aktuellerNutzer()
    if (!user) return false
    const jetzt = Date.now()
    if (mindestAbstandMin > 0 && versionZuletzt[projektId] && jetzt - versionZuletzt[projektId] < mindestAbstandMin * 60000) return false
    versionZuletzt[projektId] = jetzt
    const { error } = await supabase.from('projekt_versionen').insert({
      projekt_id: projektId, user_id: user.id,
      pages: daten.pages || null, palette: daten.palette || null,
      font: daten.font || null, form_data: daten.form_data || null, anlass,
    })
    if (error) { console.warn('Version übersprungen:', error.message); return false }
    // Aufräumen: nur die letzten 20 Stände behalten
    const { data } = await supabase.from('projekt_versionen')
      .select('id').eq('projekt_id', projektId).order('erstellt_am', { ascending: false })
    const alt = (data || []).slice(20).map(v => v.id)
    if (alt.length) await supabase.from('projekt_versionen').delete().in('id', alt)
    return true
  } catch (e) { console.warn('Version übersprungen:', e?.message); return false }
}

export async function versionenListe(projektId) {
  if (!projektId) return []
  const { data, error } = await supabase.from('projekt_versionen')
    .select('id,anlass,erstellt_am').eq('projekt_id', projektId)
    .order('erstellt_am', { ascending: false }).limit(30)
  if (error) return []
  return data || []
}

export async function versionLaden(id) {
  const { data } = await supabase.from('projekt_versionen').select('*').eq('id', id).maybeSingle()
  return data || null
}
