import { NextResponse } from 'next/server'
import { stripeClient } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { sendeMail, sendeAdminMail, mailRahmen } from '@/lib/mail'
import { holeMailVorlage } from '@/lib/mailVorlagen'

// Stripe braucht den rohen, unveränderten Request-Body zur Signaturprüfung —
// deshalb hier kein automatisches JSON-Parsing.
export const runtime = 'nodejs'

// Findet das zugehörige Projekt über die Abo-ID in UNSERER eigenen Datenbank,
// statt sich auf Metadaten in der Stripe-Subscription zu verlassen — die
// haben sich in der Praxis als nicht zuverlässig genug erwiesen.
async function projektZuAbo(db, subscriptionId) {
  if (!subscriptionId) return null
  const { data } = await db.from('projekte').select('id,user_id').eq('stripe_subscription_id', subscriptionId).maybeSingle()
  return data || null
}

export async function POST(req) {
  const stripe = stripeClient()
  const signatur = req.headers.get('stripe-signature')
  const geheim = process.env.STRIPE_WEBHOOK_SECRET
  const roh = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(roh, signatur, geheim)
  } catch (err) {
    console.error('[webhook] Signatur ungültig:', err.message)
    return NextResponse.json({ error: 'Ungültige Signatur' }, { status: 400 })
  }

  console.log(`[webhook] Event empfangen: ${event.type} (${event.id})`)

  const db = supabaseAdmin()

  try {
    switch (event.type) {
      // Zahlung/Abo erfolgreich abgeschlossen → Projekt als bezahlt markieren
      case 'checkout.session.completed': {
        const s = event.data.object
        const { user_id, projekt_id, paket_id, modus, domain } = s.metadata || {}
        console.log('[webhook] checkout.session.completed – metadata:', JSON.stringify(s.metadata))

        if (!projekt_id) {
          console.error('[webhook] KEIN projekt_id in session.metadata gefunden — Abbruch.')
          break
        }

        const { data, error } = await db.from('projekte').update({
          status: 'online',
          zahlungsart: modus,
          paket_id,
          domain: domain || null,
          stripe_customer_id: s.customer || null,
          stripe_subscription_id: s.subscription || null,
        }).eq('id', projekt_id).select()

        if (error) console.error('[webhook] FEHLER beim Update von projekte:', JSON.stringify(error))
        else console.log('[webhook] projekte erfolgreich aktualisiert:', JSON.stringify(data))

        // Einmalkäufe erzeugen KEIN invoice.paid — hier direkt als Zahlung
        // erfassen, damit Admin-Buchungen und Kundenhistorie vollständig sind.
        // Benachrichtigungen: an dich (Admin) und an den Kunden
        const kundeEmail = s.customer_details?.email || null
        const betragText = ((s.amount_total || 0) / 100).toFixed(2).replace('.', ',') + ' €'
        sendeAdminMail(
          modus === 'kaufen' ? `KAUF eingegangen: ${betragText}` : `Neues MIET-Abo: ${betragText}/Monat`,
          `<p>Paket: <b>${paket_id || '–'}</b><br>Kunde: ${kundeEmail || user_id || '–'}<br>Projekt: ${projekt_id}<br>Domain: ${domain || '–'}</p>`
        ).catch(() => {})
        if (kundeEmail) {
          // Texte kommen aus den anpassbaren Vorlagen (Admin → E-Mails)
          holeMailVorlage(modus === 'kaufen' ? 'kauf' : 'miete', {
            betrag: betragText,
            domain: domain ? ` für <b>${domain}</b>` : '',
            link: 'https://websitegenerator24.de/dashboard',
          }).then(v => sendeMail({ an: kundeEmail, betreff: v.betreff, html: mailRahmen(v.titel || 'Danke für deine Bestellung!', v.inhalt) })).catch(() => {})
        }

        if (modus === 'kaufen') {
          const { error: kErr } = await db.from('rechnungen').insert({
            stripe_invoice_id: s.id,
            user_id: user_id || null,
            projekt_id,
            betrag: (s.amount_total || 0) / 100,
            waehrung: s.currency || 'eur',
            status: 'bezahlt',
            rechnung_url: null,
            pdf_url: null,
          })
          if (kErr) console.error('[webhook] FEHLER beim Erfassen des Einmalkaufs:', JSON.stringify(kErr))
        }
        break
      }

      // Jede bezahlte Rechnung (auch monatliche Folgezahlungen) landet hier —
      // das ist die automatische Rechnungs-Historie fürs Konto.
      case 'invoice.paid': {
        const inv = event.data.object
        const projekt = await projektZuAbo(db, inv.subscription)
        console.log('[webhook] invoice.paid – zugehöriges Projekt:', JSON.stringify(projekt))

        const { data, error } = await db.from('rechnungen').insert({
          stripe_invoice_id: inv.id,
          user_id: projekt?.user_id || null,
          projekt_id: projekt?.id || null,
          betrag: (inv.amount_paid || 0) / 100,
          waehrung: inv.currency,
          status: 'bezahlt',
          rechnung_url: inv.hosted_invoice_url || null,
          pdf_url: inv.invoice_pdf || null,
          zeitraum_von: inv.period_start ? new Date(inv.period_start * 1000).toISOString() : null,
          zeitraum_bis: inv.period_end ? new Date(inv.period_end * 1000).toISOString() : null,
        }).select()

        if (error) console.error('[webhook] FEHLER beim Insert in rechnungen:', JSON.stringify(error))
        else console.log('[webhook] Rechnung erfolgreich angelegt:', JSON.stringify(data))
        break
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object
        const projekt = await projektZuAbo(db, inv.subscription)
        if (projekt?.id) {
          const { error } = await db.from('projekte').update({ status: 'zahlung_fehlgeschlagen' }).eq('id', projekt.id)
          if (error) console.error('[webhook] FEHLER bei invoice.payment_failed Update:', JSON.stringify(error))
        }
        sendeAdminMail('ZAHLUNG FEHLGESCHLAGEN', `<p>Rechnung ${inv.id}<br>Kunde: ${inv.customer_email || inv.customer || '–'}<br>Betrag: ${((inv.amount_due || 0) / 100).toFixed(2)} €</p>`).catch(() => {})
        if (inv.customer_email) {
          holeMailVorlage('fehlzahlung', {
            zahlung_knopf: inv.hosted_invoice_url ? `<p><a href="${inv.hosted_invoice_url}" style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 22px;border-radius:9px;text-decoration:none;font-weight:bold;">Zahlung jetzt abschließen</a></p>` : '',
          }).then(v => sendeMail({ an: inv.customer_email, betreff: v.betreff, html: mailRahmen(v.titel || 'Deine Zahlung hat nicht geklappt', v.inhalt) })).catch(() => {})
        }
        break
      }

      // Kündigung — Mietpaket läuft aus
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        const projekt = await projektZuAbo(db, sub.id)
        if (projekt?.id) {
          const { error } = await db.from('projekte').update({ status: 'gekuendigt' }).eq('id', projekt.id)
          if (error) console.error('[webhook] FEHLER bei subscription.deleted Update:', JSON.stringify(error))
        }
        sendeAdminMail('ABO GEKÜNDIGT', `<p>Abo ${sub.id}<br>Projekt: ${projekt?.id || '–'}</p>`).catch(() => {})
        break
      }

      default:
        console.log('[webhook] Event-Typ nicht behandelt:', event.type)
        break
    }
  } catch (e) {
    console.error('[webhook] Unerwarteter Fehler bei der Verarbeitung:', e?.message, e?.stack)
    // Trotzdem 200 zurückgeben, sonst versucht Stripe endlos erneut zuzustellen,
    // während der Fehler serverseitig geloggt bleibt und geprüft werden kann.
  }

  return NextResponse.json({ received: true })
}
