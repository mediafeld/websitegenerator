import { NextResponse } from 'next/server'
import { istAdmin } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { protokolliere } from '@/lib/adminProtokoll'

export const runtime = 'nodejs'

// Interne Notiz zu einem Kunden anlegen / löschen (Tabelle admin_notizen,
// siehe migration_admin.sql). Nur mit Admin-Cookie.
export async function POST(req) {
  if (!istAdmin(req)) return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 401 })
  try {
    const { user_id, text } = await req.json()
    if (!user_id || !text?.trim()) return NextResponse.json({ error: 'user_id und text nötig.' }, { status: 400 })
    const db = supabaseAdmin()
    const { data, error } = await db.from('admin_notizen').insert({ user_id, text: text.trim() }).select().single()
    if (error) throw error
    protokolliere('notiz', `Kunde ${user_id}`).catch(() => {})
    return NextResponse.json({ notiz: data })
  } catch (e) {
    return NextResponse.json({ error: `Notiz fehlgeschlagen (${e?.message || e}). Wurde migration_admin.sql ausgeführt?` }, { status: 500 })
  }
}

export async function DELETE(req) {
  if (!istAdmin(req)) return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 401 })
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id fehlt.' }, { status: 400 })
    const db = supabaseAdmin()
    const { error } = await db.from('admin_notizen').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: `Löschen fehlgeschlagen (${e?.message || e}).` }, { status: 500 })
  }
}
