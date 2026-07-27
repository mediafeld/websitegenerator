// ── Anpassbare E-Mail-Vorlagen ──────────────────────────────────────────────
// Die Standardtexte stehen hier; im Admin-Bereich (Reiter „E-Mails") können
// Betreff und Inhalt überschrieben werden (Tabelle mail_vorlagen,
// migration_v27.sql). Platzhalter wie {{betrag}} werden beim Versand ersetzt.
// Nur serverseitig verwenden (Webhook, Cron).
import { supabaseAdmin } from './supabaseServer'

export const MAIL_STANDARD = {
  kauf: {
    name: 'Kauf-Bestätigung',
    hinweis: 'Nach erfolgreichem Website-KAUF. Platzhalter: {{betrag}}, {{link}}',
    betreff: 'Dein Website-Kauf – Download bereit',
    titel: 'Danke für deine Bestellung!',
    inhalt: `<p>Hallo,</p><p>vielen Dank für deinen Kauf (<b>{{betrag}}</b>).</p>
<p>Deine fertige Website liegt als ZIP-Download bereit:</p>
<p><a href="{{link}}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 22px;border-radius:9px;text-decoration:none;font-weight:bold;">Zum Download im Kundenkonto</a></p>
<p>In der ZIP findest du eine kurze Anleitung – hochladen, fertig.</p>
<p>Viele Grüße<br>dein websitegenerator24-Team</p>`,
  },
  miete: {
    name: 'Miet-Bestätigung',
    hinweis: 'Nach Abschluss eines MIET-Abos. Platzhalter: {{betrag}}, {{domain}}, {{link}}',
    betreff: 'Deine Website-Buchung ist eingegangen',
    titel: 'Danke für deine Bestellung!',
    inhalt: `<p>Hallo,</p><p>vielen Dank für deine Buchung (<b>{{betrag}}/Monat</b>).</p>
<p>Wir kümmern uns jetzt um Domain, Hosting und SSL{{domain}} und melden uns, sobald alles online ist. Deine Website kannst du jederzeit weiter bearbeiten:</p>
<p><a href="{{link}}" style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 22px;border-radius:9px;text-decoration:none;font-weight:bold;">Zum Kundenkonto</a></p>
<p>Viele Grüße<br>dein websitegenerator24-Team</p>`,
  },
  fehlzahlung: {
    name: 'Zahlung fehlgeschlagen',
    hinweis: 'Wenn eine Monatszahlung nicht eingezogen werden konnte. Platzhalter: {{zahlung_knopf}}',
    betreff: 'Zahlung fehlgeschlagen – bitte Zahlungsmittel prüfen',
    titel: 'Deine Zahlung hat nicht geklappt',
    inhalt: `<p>Hallo,</p><p>die monatliche Zahlung für deine Website konnte nicht eingezogen werden. Bitte prüfe dein Zahlungsmittel – es wird automatisch erneut versucht.</p>
{{zahlung_knopf}}
<p>Viele Grüße<br>dein websitegenerator24-Team</p>`,
  },
  erinnerung: {
    name: 'Entwurfs-Erinnerung',
    hinweis: 'Einmalig, wenn ein Entwurf 24 Stunden liegen bleibt. Platzhalter: {{name}}, {{link}}',
    betreff: 'Deine Website wartet auf dich',
    titel: 'Deine Website ist fast fertig!',
    inhalt: `<p>Hallo,</p>
<p>dein Entwurf „<b>{{name}}</b>“ liegt bereit – bearbeite ihn weiter oder schalte ihn mit wenigen Klicks online.</p>
<p><a href="{{link}}" style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 22px;border-radius:9px;text-decoration:none;font-weight:bold;">Weiter an meiner Website arbeiten</a></p>
<p>Viele Grüße<br>dein websitegenerator24-Team</p>`,
  },
}

// Vorlage laden (Datenbank-Überschreibung vor Standard) und Platzhalter füllen
export async function holeMailVorlage(schluessel, werte = {}) {
  const std = MAIL_STANDARD[schluessel] || { betreff: '', titel: '', inhalt: '' }
  let betreff = std.betreff, inhalt = std.inhalt
  try {
    const db = supabaseAdmin()
    const { data } = await db.from('mail_vorlagen').select('betreff,inhalt').eq('schluessel', schluessel).maybeSingle()
    if (data?.betreff) betreff = data.betreff
    if (data?.inhalt) inhalt = data.inhalt
  } catch (e) { /* Tabelle fehlt noch → Standard */ }
  const ersetze = (s) => String(s || '').replace(/\{\{(\w+)\}\}/g, (_, k) => (werte[k] ?? ''))
  return { betreff: ersetze(betreff), titel: std.titel || '', inhalt: ersetze(inhalt) }
}
