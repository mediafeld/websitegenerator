import { NextResponse } from 'next/server'
import { stripeClient } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabaseServer'

// Stripe braucht den rohen, unveränderten Request-Body zur Signaturprüfung —
// deshalb hier kein automatisches JSON-Parsing.
export const runtime = 'nodejs'

export async function POST(req) {
  const stripe = stripeClient()
  const signatur = req.headers.get('stripe-signature')
  const geheim = process.env.STRIPE_WEBHOOK_SECRET
  const roh = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(roh, signatur, geheim)
  } catch (err) {
    console.error('Webhook-Signatur ungültig:', err.message)
    return NextResponse.json({ error: 'Ungültige Signatur' }, { status: 400 })
  }

  const db = supabaseAdmin()

  try {
    switch (event.type) {
      // Zahlung/Abo erfolgreich abgeschlossen → Projekt als bezahlt markieren
      case 'checkout.session.completed': {
        const s = event.data.object
        const { user_id, projekt_id, paket_id, modus, domain } = s.metadata || {}
        if (projekt_id) {
          await db.from('projekte').update({
            status: 'online',
            zahlungsart: modus,
            paket_id,
            domain: domain || null,
            stripe_customer_id: s.customer || null,
            stripe_subscription_id: s.subscription || null,
          }).eq('id', projekt_id)
        }
        break
      }

      // Jede bezahlte Rechnung (auch monatliche Folgezahlungen) landet hier —
      // das ist die automatische Rechnungs-Historie fürs Konto.
      case 'invoice.paid': {
        const inv = event.data.object
        const sub = inv.subscription ? await stripe.subscriptions.retrieve(inv.subscription) : null
        const meta = sub?.metadata || {}
        await db.from('rechnungen').insert({
          stripe_invoice_id: inv.id,
          user_id: meta.user_id || null,
          projekt_id: meta.projekt_id || null,
          betrag: (inv.amount_paid || 0) / 100,
          waehrung: inv.currency,
          status: 'bezahlt',
          rechnung_url: inv.hosted_invoice_url || null,
          pdf_url: inv.invoice_pdf || null,
          zeitraum_von: inv.period_start ? new Date(inv.period_start * 1000).toISOString() : null,
          zeitraum_bis: inv.period_end ? new Date(inv.period_end * 1000).toISOString() : null,
        })
        break
      }

      case 'invoice.payment_failed': {
        const inv = event.data.object
        const sub = inv.subscription ? await stripe.subscriptions.retrieve(inv.subscription) : null
        const meta = sub?.metadata || {}
        if (meta.projekt_id) {
          await db.from('projekte').update({ status: 'zahlung_fehlgeschlagen' }).eq('id', meta.projekt_id)
        }
        break
      }

      // Kündigung — Mietpaket läuft aus
      case 'customer.subscription.deleted': {
        const sub = event.data.object
        const meta = sub.metadata || {}
        if (meta.projekt_id) {
          await db.from('projekte').update({ status: 'gekuendigt' }).eq('id', meta.projekt_id)
        }
        break
      }

      default:
        break
    }
  } catch (e) {
    console.error('Webhook-Verarbeitung fehlgeschlagen:', e)
    // Trotzdem 200 zurückgeben, sonst versucht Stripe endlos erneut zuzustellen,
    // während der Fehler serverseitig geloggt bleibt und geprüft werden kann.
  }

  return NextResponse.json({ received: true })
}
