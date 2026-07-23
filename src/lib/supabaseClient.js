'use client'
import { createClient } from '@supabase/supabase-js'

// Verbindung zu Supabase.
// Beide Werte sind öffentlich (sie stehen im Browser) – der Schutz der Daten
// passiert in der Datenbank selbst über den Zeilenschutz (Row Level Security).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseBereit = Boolean(url && key)

export const supabase = supabaseBereit
  ? createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

// Freundliche deutsche Texte für die häufigsten Fehlermeldungen
export function fehlerText(error) {
  const m = String(error?.message || error || '')
  if (/Invalid login credentials/i.test(m)) return 'E-Mail oder Passwort stimmt nicht.'
  if (/Email not confirmed/i.test(m)) return 'Bitte zuerst die Bestätigungs-Mail anklicken.'
  if (/User already registered/i.test(m)) return 'Diese E-Mail ist schon registriert. Bitte einloggen.'
  if (/Password should be at least/i.test(m)) return 'Das Passwort muss mindestens 6 Zeichen haben.'
  if (/rate limit|too many/i.test(m)) return 'Zu viele Versuche. Bitte kurz warten.'
  if (/Failed to fetch|NetworkError/i.test(m)) return 'Keine Verbindung zur Datenbank. Bitte später erneut versuchen.'
  return m || 'Unbekannter Fehler.'
}
