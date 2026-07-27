// ── E-Mail-Versand über Resend ──────────────────────────────────────────────
// Nur serverseitig (Webhook, Cron, Admin). Ist RESEND_API_KEY nicht gesetzt,
// wird still übersprungen – nichts geht kaputt, es wird nur geloggt.
// Vercel-Umgebungsvariablen:
//   RESEND_API_KEY  – API-Schlüssel von resend.com (kostenloser Plan reicht)
//   MAIL_ABSENDER   – z. B. "websitegenerator24 <post@websitegenerator24.de>"
//                     (Domain vorher bei Resend verifizieren)
//   ADMIN_EMAIL     – deine Adresse für interne Benachrichtigungen

const ABSENDER = () => process.env.MAIL_ABSENDER || 'websitegenerator24 <onboarding@resend.dev>'

export async function sendeMail({ an, betreff, html, antwortAn }) {
  const key = process.env.RESEND_API_KEY
  if (!key || !an) { console.log('[mail] übersprungen (kein RESEND_API_KEY oder Empfänger):', betreff); return false }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ from: ABSENDER(), to: [an], subject: betreff, html, ...(antwortAn ? { reply_to: [antwortAn] } : {}) }),
    })
    if (!res.ok) { console.error('[mail] Versand fehlgeschlagen:', res.status, await res.text()); return false }
    return true
  } catch (e) { console.error('[mail] Fehler:', e?.message); return false }
}

export async function sendeAdminMail(betreff, html) {
  const an = process.env.ADMIN_EMAIL
  if (!an) { console.log('[mail] ADMIN_EMAIL nicht gesetzt:', betreff); return false }
  return sendeMail({ an, betreff: `[wg24] ${betreff}`, html })
}

// Einheitlicher, schlichter Rahmen für Kunden-Mails
export function mailRahmen(titel, inhaltHtml) {
  return `<!DOCTYPE html><html lang="de"><body style="margin:0;background:#f4f5fa;font-family:Arial,Helvetica,sans-serif;color:#25253d;">
  <div style="max-width:560px;margin:0 auto;padding:28px 16px;">
    <div style="font-size:18px;font-weight:800;color:#1d4ed8;margin-bottom:14px;">websitegenerator24.de</div>
    <div style="background:#fff;border-radius:14px;padding:26px;border:1px solid #e6e8f0;">
      <h1 style="font-size:19px;margin:0 0 14px;">${titel}</h1>
      <div style="font-size:14.5px;line-height:1.7;">${inhaltHtml}</div>
    </div>
    <div style="font-size:11px;color:#8a8fa8;margin-top:14px;line-height:1.5;">
      websitegenerator24.de · Diese Nachricht wurde automatisch versendet.
    </div>
  </div>
</body></html>`
}
