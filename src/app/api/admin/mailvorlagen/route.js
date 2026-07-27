import { NextResponse } from 'next/server'
import { istAdmin } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { MAIL_STANDARD } from '@/lib/mailVorlagen'
import { protokolliere } from '@/lib/adminProtokoll'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// E-Mail-Vorlagen lesen/anpassen (Admin → Reiter „E-Mails").
// GET: Standard + gespeicherte Überschreibungen. POST: {schluessel, betreff, inhalt}.
// DELETE ?schluessel=…: zurück auf den Standardtext.
export async function GET(req) {
  if (!istAdmin(req)) return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 401 })
  try {
    let eigene = []
    try {
      const db = supabaseAdmin()
      const { data } = await db.from('mail_vorlagen').select('*')
      eigene = data || []
    } catch {}
    const vorlagen = Object.entries(MAIL_STANDARD).map(([schluessel, std]) => {
      const e = eigene.find(x => x.schluessel === schluessel)
      return {
        schluessel,
        name: std.name,
        hinweis: std.hinweis,
        standardBetreff: std.betreff,
        standardInhalt: std.inhalt,
        betreff: e?.betreff || std.betreff,
        inhalt: e?.inhalt || std.inhalt,
        angepasst: !!e,
      }
    })
    return NextResponse.json({ vorlagen })
  } catch (e) {
    return NextResponse.json({ error: `Laden fehlgeschlagen (${e?.message || e}).` }, { status: 500 })
  }
}

export async function POST(req) {
  if (!istAdmin(req)) return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 401 })
  try {
    const { schluessel, betreff, inhalt } = await req.json()
    if (!MAIL_STANDARD[schluessel]) return NextResponse.json({ error: 'Unbekannte Vorlage.' }, { status: 400 })
    const db = supabaseAdmin()
    const { error } = await db.from('mail_vorlagen').upsert({
      schluessel, betreff: (betreff || '').trim() || null, inhalt: (inhalt || '').trim() || null,
      geaendert_am: new Date().toISOString(),
    })
    if (error) throw error
    protokolliere('mail-vorlage', `Vorlage „${schluessel}" angepasst`).catch(() => {})
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: `Speichern fehlgeschlagen (${e?.message || e}). Wurde migration_v27.sql ausgeführt?` }, { status: 500 })
  }
}

export async function DELETE(req) {
  if (!istAdmin(req)) return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 401 })
  try {
    const schluessel = new URL(req.url).searchParams.get('schluessel')
    if (!schluessel) return NextResponse.json({ error: 'schluessel fehlt.' }, { status: 400 })
    const db = supabaseAdmin()
    const { error } = await db.from('mail_vorlagen').delete().eq('schluessel', schluessel)
    if (error) throw error
    protokolliere('mail-vorlage', `Vorlage „${schluessel}" auf Standard zurückgesetzt`).catch(() => {})
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: `Zurücksetzen fehlgeschlagen (${e?.message || e}).` }, { status: 500 })
  }
}
