import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { sendeMail, mailRahmen } from '@/lib/mail'
import { istBezahlt } from '@/lib/produkt'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── Kontaktformular-Versand für GEMIETETE Websites ─────────────────────────
// Die Website des Kunden läuft auf seiner Domain – das Formular schickt die
// Anfrage hierher, wir stellen sie per Resend an den Websitebesitzer zu
// (Absender ist UNSERE verifizierte Adresse, "Antworten an" ist der Besucher).
// Schutz: Honigtopf-Feld + Bremse pro Absender-IP + Bremse pro Projekt.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS })
}

// Einfache Bremse pro Server-Instanz: max. 5 Nachrichten je IP in 10 Minuten,
// max. 30 je Projekt pro Stunde (gegen Spam-Wellen über eine Kundenseite).
const proIp = new Map()
const proProjekt = new Map()
function bremse(map, schluessel, maxAnzahl, fensterMs) {
  const jetzt = Date.now()
  const liste = (map.get(schluessel) || []).filter(t => jetzt - t < fensterMs)
  if (liste.length >= maxAnzahl) { map.set(schluessel, liste); return false }
  liste.push(jetzt); map.set(schluessel, liste)
  if (map.size > 5000) map.clear() // Speicher-Backstop
  return true
}

const kurz = (s, n) => String(s || '').trim().slice(0, n)
const escHtml = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function POST(req) {
  const antwort = (body, status = 200) => NextResponse.json(body, { status, headers: CORS })
  try {
    const fd = await req.formData()
    // Honigtopf: Bots füllen das unsichtbare Feld → still "ok" melden
    if (kurz(fd.get('firma_hp'), 50)) return antwort({ ok: true })

    const projektId = kurz(fd.get('projekt'), 60)
    const name = kurz(fd.get('name'), 120)
    const email = kurz(fd.get('email'), 200)
    const telefon = kurz(fd.get('telefon'), 60)
    const nachricht = kurz(fd.get('nachricht'), 5000)
    if (!projektId) return antwort({ ok: false, error: 'Projekt fehlt.' }, 400)
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return antwort({ ok: false, error: 'E-Mail ungültig.' }, 400)
    if (!nachricht && !name) return antwort({ ok: false, error: 'Nachricht fehlt.' }, 400)

    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unbekannt'
    if (!bremse(proIp, ip, 5, 10 * 60 * 1000)) return antwort({ ok: false, error: 'Zu viele Nachrichten – bitte später erneut.' }, 429)
    if (!bremse(proProjekt, projektId, 30, 60 * 60 * 1000)) return antwort({ ok: false, error: 'Zu viele Nachrichten – bitte später erneut.' }, 429)

    // Nur für echte, GEMIETETE und bezahlte Websites zustellen
    const db = supabaseAdmin()
    const { data: projekt } = await db.from('projekte')
      .select('id,user_id,firma,name,zahlungsart,status,bezahlt_am,form_data')
      .eq('id', projektId).maybeSingle()
      .then(r => r.error ? db.from('projekte')
        .select('id,user_id,firma,name,zahlungsart,status,form_data')
        .eq('id', projektId).maybeSingle() : r)
    // Gemietet und bezahlt — auch bei offener Folgezahlung oder Kündigung
    // bleibt das Formular an, solange die Website läuft. Nur Entwürfe nicht.
    if (!projekt || projekt.zahlungsart !== 'mieten' || !istBezahlt(projekt)) {
      return antwort({ ok: false, error: 'Formular für diese Website nicht aktiv.' }, 404)
    }

    // Empfänger: die im Wizard angegebene Firmen-E-Mail, sonst Konto-Adresse
    let an = projekt.form_data?.email || ''
    if (!an && projekt.user_id) {
      try { const { data: u } = await db.auth.admin.getUserById(projekt.user_id); an = u?.user?.email || '' } catch {}
    }
    if (!an) return antwort({ ok: false, error: 'Kein Empfänger hinterlegt.' }, 500)

    const firma = projekt.firma || projekt.name || 'Ihre Website'
    const ok = await sendeMail({
      an,
      antwortAn: email,
      betreff: `Neue Anfrage über Ihre Website${name ? ` von ${name}` : ''}`,
      html: mailRahmen(`Neue Anfrage über ${escHtml(firma)}`, `
        <p><strong>Name:</strong> ${escHtml(name) || '–'}<br>
        <strong>E-Mail:</strong> ${escHtml(email)}<br>
        <strong>Telefon:</strong> ${escHtml(telefon) || '–'}</p>
        <p style="white-space:pre-wrap;border-left:3px solid #1d4ed8;padding-left:12px;">${escHtml(nachricht)}</p>
        <p style="font-size:12px;color:#8a8fa8;">Einfach auf „Antworten“ klicken – die Antwort geht direkt an den Absender.</p>
      `),
    })
    if (!ok) return antwort({ ok: false, error: 'Versand derzeit nicht möglich.' }, 500)
    return antwort({ ok: true })
  } catch (e) {
    return antwort({ ok: false, error: 'Fehler beim Senden.' }, 500)
  }
}
