import { NextResponse } from 'next/server'
import { stripeClient } from '@/lib/stripe'
import { nutzerAusToken, supabaseAdmin } from '@/lib/supabaseServer'

// Öffnet das Stripe-Kundenportal — dort sieht der Kunde alle Rechnungen,
// kann die Zahlungsmethode ändern und ein Mietpaket selbst kündigen.
export async function POST(req) {
  try {
    const { accessToken } = await req.json()
    const nutzer = await nutzerAusToken(accessToken)
    if (!nutzer) return NextResponse.json({ error: 'Bitte zuerst einloggen.' }, { status: 401 })

    const db = supabaseAdmin()
    const { data: projekt } = await db.from('projekte')
      .select('stripe_customer_id')
      .eq('user_id', nutzer.id)
      .not('stripe_customer_id', 'is', null)
      .order('geaendert_am', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!projekt?.stripe_customer_id) {
      return NextResponse.json({ error: 'Noch kein aktives Zahlungskonto vorhanden.' }, { status: 404 })
    }

    const stripe = stripeClient()
    const basis = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('origin') || 'https://websitegenerator24.de'
    const portal = await stripe.billingPortal.sessions.create({
      customer: projekt.stripe_customer_id,
      return_url: `${basis}/abrechnungen`,
    })

    return NextResponse.json({ url: portal.url })
  } catch (e) {
    console.error('Kundenportal-Fehler:', e)
    return NextResponse.json({ error: 'Kundenportal konnte nicht geöffnet werden.' }, { status: 500 })
  }
}
