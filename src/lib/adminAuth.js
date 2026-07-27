// ── Admin-Zugang ────────────────────────────────────────────────────────────
// Der Admin-Bereich liegt unter einem absichtlich kryptischen Pfad und ist
// zusätzlich mit einem Passwort geschützt, das NUR in den Vercel-Umgebungs-
// variablen liegt (ADMIN_PASSWORT). Nach dem Login wird ein httpOnly-Cookie
// gesetzt – der Browser-JavaScript-Code kann es nicht auslesen.
// Kein 'use client' – wird ausschließlich serverseitig benutzt.
import crypto from 'crypto'

const COOKIE_NAME = 'wg24_admin'

function passwort() {
  return process.env.ADMIN_PASSWORT || ''
}

// Aus dem Passwort abgeleitetes Sitzungs-Token (ändert sich mit dem Passwort).
export function adminToken() {
  const p = passwort()
  if (!p) return ''
  return crypto.createHmac('sha256', 'wg24-admin-sitzung').update(p).digest('hex')
}

export function adminCookieName() { return COOKIE_NAME }

// Prüft die Anfrage: gültiges Admin-Cookie vorhanden?
export function istAdmin(req) {
  const t = adminToken()
  if (!t) return false
  const c = req.cookies?.get?.(COOKIE_NAME)?.value || ''
  try {
    return c.length === t.length && crypto.timingSafeEqual(Buffer.from(c), Buffer.from(t))
  } catch { return false }
}

// Passwort in konstanter Zeit vergleichen
export function passwortStimmt(eingabe) {
  const p = passwort()
  if (!p || !eingabe) return false
  const a = crypto.createHash('sha256').update(String(eingabe)).digest()
  const b = crypto.createHash('sha256').update(p).digest()
  return crypto.timingSafeEqual(a, b)
}
