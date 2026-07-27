import { NextResponse } from 'next/server'
import { passwortStimmt, adminToken, adminCookieName } from '@/lib/adminAuth'
import { protokolliere } from '@/lib/adminProtokoll'

export const runtime = 'nodejs'

// Kleine Bremse gegen Durchprobieren (pro Server-Instanz)
let fehlversuche = 0
let gesperrtBis = 0

export async function POST(req) {
  try {
    if (Date.now() < gesperrtBis) {
      return NextResponse.json({ error: 'Zu viele Fehlversuche – bitte kurz warten.' }, { status: 429 })
    }
    const { passwort } = await req.json()
    if (!process.env.ADMIN_PASSWORT) {
      return NextResponse.json({ error: 'ADMIN_PASSWORT ist in Vercel noch nicht gesetzt.' }, { status: 500 })
    }
    if (!passwortStimmt(passwort)) {
      fehlversuche += 1
      if (fehlversuche >= 6) { gesperrtBis = Date.now() + 5 * 60 * 1000; fehlversuche = 0 }
      return NextResponse.json({ error: 'Falsches Passwort.' }, { status: 401 })
    }
    fehlversuche = 0
    protokolliere('login', 'Admin angemeldet').catch(() => {})
    const res = NextResponse.json({ ok: true })
    res.cookies.set(adminCookieName(), adminToken(), {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8,
    })
    return res
  } catch (e) {
    return NextResponse.json({ error: 'Anmeldung fehlgeschlagen.' }, { status: 500 })
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(adminCookieName(), '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 })
  return res
}
