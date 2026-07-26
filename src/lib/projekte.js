'use client'
import { supabase, supabaseBereit } from '@/lib/supabaseClient'

// Ist jemand angemeldet? Gibt den Nutzer oder null zurück.
export async function aktuellerNutzer() {
  if (!supabaseBereit) return null
  const { data } = await supabase.auth.getSession()
  return data?.session?.user || null
}

// Neues Projekt anlegen. Gibt die neue ID zurück.
export async function projektAnlegen({ name, firma, branche, form_data, pages, palette, font }) {
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
export async function projektAnlegenOderAktualisieren(daten) {
  const user = await aktuellerNutzer()
  if (!user) return null

  const { data: entwurf } = await supabase
    .from('projekte')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'entwurf')
    .order('geaendert_am', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (entwurf?.id) {
    const ok = await projektSpeichern(entwurf.id, {
      name: daten.name || daten.firma || 'Neue Website',
      firma: daten.firma || null,
      branche: daten.branche || null,
      form_data: daten.form_data || null,
      pages: daten.pages || null,
      palette: daten.palette || null,
      font: daten.font || null,
    })
    if (ok) return entwurf.id
  }
  return projektAnlegen(daten)
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
