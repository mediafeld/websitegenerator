import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { sendeMail, mailRahmen } from '@/lib/mail'
import { holeMailVorlage } from '@/lib/mailVorlagen'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── Erinnerung an liegengebliebene Entwürfe ────────────────────────────────
// Läuft täglich (vercel.json → crons). Findet Entwürfe, die älter als 24 h
// sind und noch nie erinnert wurden, und schickt EINE freundliche Mail.
// Absicherung: Vercel-Cron schickt "Authorization: Bearer <CRON_SECRET>".
export async function GET(req) {
  const geheim = process.env.CRON_SECRET
  const kopf = req.headers.get('authorization') || ''
  if (!geheim || kopf !== `Bearer ${geheim}`) {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 401 })
  }
  try {
    const db = supabaseAdmin()
    const grenze = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: entwuerfe, error } = await db.from('projekte')
      .select('id,user_id,name,firma,geaendert_am,erinnert_am,status')
      .eq('status', 'entwurf')
      .is('erinnert_am', null)
      .lt('geaendert_am', grenze)
      .limit(50)
    if (error) throw error

    let verschickt = 0
    for (const p of entwuerfe || []) {
      if (!p.user_id) continue
      const { data: nutzerDaten } = await db.auth.admin.getUserById(p.user_id)
      const email = nutzerDaten?.user?.email
      if (!email) continue
      const vorlage = await holeMailVorlage('erinnerung', {
        name: p.name || p.firma || 'Meine Website',
        link: `https://websitegenerator24.de/editor?projekt=${p.id}`,
      })
      const ok = await sendeMail({ an: email, betreff: vorlage.betreff, html: mailRahmen(vorlage.titel || 'Deine Website ist fast fertig!', vorlage.inhalt) })
      // Immer markieren – auch wenn Mail (noch) nicht konfiguriert ist,
      // damit niemand später mehrfach erinnert wird.
      await db.from('projekte').update({ erinnert_am: new Date().toISOString() }).eq('id', p.id)
      if (ok) verschickt += 1
    }
    return NextResponse.json({ geprueft: (entwuerfe || []).length, verschickt })
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Fehler' }, { status: 500 })
  }
}
