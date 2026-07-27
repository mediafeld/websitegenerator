import { NextResponse } from 'next/server'
import { nutzerAusToken, supabaseAdmin } from '@/lib/supabaseServer'
import { sendeAdminMail } from '@/lib/mail'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── Domain nachträglich zur MIET-Website buchen ────────────────────────────
// Der Kunde wählt im Konto-Bereich (Domains) eine freie Domain für eine
// bereits gebuchte Miet-Website. Wir speichern den Wunsch am Projekt und
// benachrichtigen den Betreiber, der die Registrierung übernimmt.
export async function POST(req) {
  try {
    const { accessToken, projektId, domain } = await req.json()
    const nutzer = await nutzerAusToken(accessToken)
    if (!nutzer) return NextResponse.json({ error: 'Bitte zuerst anmelden.' }, { status: 401 })
    const d = String(domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    if (!/^[a-z0-9äöüß][a-z0-9äöüß-]{0,62}\.[a-z]{2,24}$/.test(d)) {
      return NextResponse.json({ error: 'Das sieht nicht nach einer gültigen Domain aus (z. B. meine-firma.de).' }, { status: 400 })
    }
    const db = supabaseAdmin()
    const { data: projekt } = await db.from('projekte')
      .select('id,user_id,firma,name,zahlungsart,status,domain')
      .eq('id', projektId).maybeSingle()
    if (!projekt || projekt.user_id !== nutzer.id) return NextResponse.json({ error: 'Website nicht gefunden.' }, { status: 404 })
    if (projekt.zahlungsart !== 'mieten') return NextResponse.json({ error: 'Domains gibt es nur bei Miet-Websites – beim Kauf nutzt du deine eigene Domain.' }, { status: 400 })
    if (projekt.domain) return NextResponse.json({ error: `Für diese Website ist bereits ${projekt.domain} hinterlegt.` }, { status: 400 })

    const { error } = await db.from('projekte').update({ domain: d }).eq('id', projekt.id)
    if (error) throw error
    sendeAdminMail(
      `DOMAIN-NACHBUCHUNG: ${d}`,
      `<p>Kunde: ${nutzer.email || nutzer.id}<br>Projekt: ${projekt.id} (${projekt.firma || projekt.name || '–'})<br>Gewünschte Domain: <b>${d}</b><br>Status der Website: ${projekt.status || '–'}</p><p>Bitte Domain registrieren und mit der Website verbinden.</p>`
    ).catch(() => {})
    return NextResponse.json({ ok: true, domain: d })
  } catch (e) {
    return NextResponse.json({ error: `Anfrage fehlgeschlagen (${e?.message || e}).` }, { status: 500 })
  }
}
