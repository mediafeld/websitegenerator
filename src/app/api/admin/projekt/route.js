import { NextResponse } from 'next/server'
import { istAdmin } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { protokolliere } from '@/lib/adminProtokoll'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Drossel für die automatische Versions-Sicherung (pro Server-Instanz)
const sicherungZuletzt = new Map()

// Volles Projekt lesen/schreiben – für den „im Editor fixen“-Modus.
// Der Editor lädt und speichert damit fremde Projekte, ausschließlich mit
// gültigem Admin-Cookie (Service-Role umgeht den Zeilenschutz).
export async function GET(req) {
  if (!istAdmin(req)) return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 401 })
  try {
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id fehlt.' }, { status: 400 })
    const db = supabaseAdmin()
    const { data, error } = await db.from('projekte').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Projekt nicht gefunden.' }, { status: 404 })
    return NextResponse.json({ projekt: data })
  } catch (e) {
    return NextResponse.json({ error: `Laden fehlgeschlagen (${e?.message || e}).` }, { status: 500 })
  }
}

export async function POST(req) {
  if (!istAdmin(req)) return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 401 })
  try {
    const { id, felder } = await req.json()
    if (!id || !felder || typeof felder !== 'object') return NextResponse.json({ error: 'id und felder nötig.' }, { status: 400 })
    // Nur inhaltliche Felder – Besitz/Zahlung bleiben unantastbar.
    const erlaubt = ['name', 'firma', 'branche', 'form_data', 'pages', 'palette', 'font', 'status']
    const sauber = {}
    for (const k of erlaubt) if (k in felder) sauber[k] = felder[k]
    if (!Object.keys(sauber).length) return NextResponse.json({ error: 'Keine erlaubten Felder.' }, { status: 400 })
    const db = supabaseAdmin()
    // Sicherheitsnetz: VOR Admin-Änderungen den Kundenstand im Verlauf ablegen
    // (höchstens alle 10 Minuten; still, falls migration_v27.sql noch fehlt).
    if ('pages' in sauber && Date.now() - (sicherungZuletzt.get(id) || 0) > 10 * 60 * 1000) {
      sicherungZuletzt.set(id, Date.now())
      try {
        const { data: alt } = await db.from('projekte').select('user_id,pages,palette,font,form_data').eq('id', id).maybeSingle()
        if (alt?.pages) await db.from('projekt_versionen').insert({
          projekt_id: id, user_id: alt.user_id, pages: alt.pages, palette: alt.palette,
          font: alt.font, form_data: alt.form_data, anlass: 'admin-fix',
        })
      } catch (e) { console.log('[admin] Versions-Sicherung übersprungen:', e?.message) }
    }
    const { error } = await db.from('projekte').update(sauber).eq('id', id)
    if (error) throw error
    protokolliere('projekt-fix', `Projekt ${id}: ${Object.keys(sauber).join(', ')}`).catch(() => {})
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: `Speichern fehlgeschlagen (${e?.message || e}).` }, { status: 500 })
  }
}
