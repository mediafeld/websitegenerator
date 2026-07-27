import { NextResponse } from 'next/server'
import { istAdmin } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { protokolliere } from '@/lib/adminProtokoll'

export const runtime = 'nodejs'

// Kunden-Aktionen für Supportfälle:
//   passwort-reset   → erzeugt einen Wiederherstellungs-Link (zum Weitergeben)
//   sperren / entsperren
//   projekt-umhaengen → Website einem anderen Konto zuordnen
export async function POST(req) {
  if (!istAdmin(req)) return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 401 })
  try {
    const { aktion, user_id, email, projekt_id, ziel_user_id } = await req.json()
    const db = supabaseAdmin()

    if (aktion === 'passwort-reset') {
      if (!email) return NextResponse.json({ error: 'email fehlt.' }, { status: 400 })
      const { data, error } = await db.auth.admin.generateLink({ type: 'recovery', email })
      if (error) throw error
      await protokolliere('passwort-reset', email)
      return NextResponse.json({ link: data?.properties?.action_link || null })
    }

    if (aktion === 'sperren' || aktion === 'entsperren') {
      if (!user_id) return NextResponse.json({ error: 'user_id fehlt.' }, { status: 400 })
      const { error } = await db.auth.admin.updateUserById(user_id, { ban_duration: aktion === 'sperren' ? '876000h' : 'none' })
      if (error) throw error
      await protokolliere(aktion, `${email || user_id}`)
      return NextResponse.json({ ok: true })
    }

    if (aktion === 'projekt-umhaengen') {
      if (!projekt_id || !ziel_user_id) return NextResponse.json({ error: 'projekt_id und ziel_user_id nötig.' }, { status: 400 })
      const { error } = await db.from('projekte').update({ user_id: ziel_user_id }).eq('id', projekt_id)
      if (error) throw error
      await protokolliere('projekt-umhaengen', `Projekt ${projekt_id} → Nutzer ${ziel_user_id}`)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unbekannte Aktion.' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: `Aktion fehlgeschlagen (${e?.message || e}).` }, { status: 500 })
  }
}
