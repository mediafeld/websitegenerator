import { NextResponse } from 'next/server'
import { stripeClient } from '@/lib/stripe'
import { nutzerAusToken, supabaseAdmin } from '@/lib/supabaseServer'
import { MIETE, KAUF } from '@/lib/preise'
// WICHTIG: direkt aus lib/profil (kein 'use client'), sonst bekommt der Server
// nur einen Platzhalter → "m is not a function".
import { profilLuecken } from '@/lib/profil'

// Erstellt eine Stripe-Checkout-Session. Preise werden NIE vom Client übernommen —
// wir schlagen sie serverseitig in lib/preise.js nach, damit niemand den Preis
// manipulieren kann.
export async function POST(req) {
  try {
    const { paketId, modus, projektId, accessToken, domain } = await req.json()

    if (!['mieten', 'kaufen'].includes(modus)) {
      return NextResponse.json({ error: 'Ungültiger Modus.' }, { status: 400 })
    }
    const liste = modus === 'mieten' ? MIETE : KAUF
    const paket = liste.find(p => p.id === paketId)
    if (!paket) return NextResponse.json({ error: 'Unbekanntes Paket.' }, { status: 400 })

    const nutzer = await nutzerAusToken(accessToken)
    if (!nutzer) return NextResponse.json({ error: 'Bitte zuerst einloggen.' }, { status: 401 })

    // Ohne vollständige Firmen-/Rechnungsdaten kein Kauf — die brauchen wir
    // zwingend für Impressum und Rechnung. Serverseitig geprüft, damit das
    // nicht über die Oberfläche hinweg umgangen werden kann.
    const db = supabaseAdmin()
    const { data: profil } = await db.from('profile').select('*').eq('id', nutzer.id).maybeSingle()
    const luecken = profilLuecken(profil)
    if (luecken.length > 0) {
      return NextResponse.json({
        error: `Bitte zuerst deine Daten vervollständigen: ${luecken.join(', ')}.`,
        fehlendeDaten: luecken,
      }, { status: 422 })
    }

    const stripe = stripeClient()
    const basis = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('origin') || 'https://websitegenerator24.de'
    const cent = Math.round(paket.preis * 100)

    const session = await stripe.checkout.sessions.create({
      mode: modus === 'mieten' ? 'subscription' : 'payment',
      customer_email: nutzer.email,
      client_reference_id: projektId || undefined,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: cent,
          product_data: {
            name: `Website ${modus === 'mieten' ? 'mieten' : 'kaufen'} — ${paket.name}`,
            description: paket.kurz,
          },
          ...(modus === 'mieten' ? { recurring: { interval: 'month' } } : {}),
        },
      }],
      metadata: {
        user_id: nutzer.id,
        projekt_id: projektId || '',
        paket_id: paket.id,
        modus,
        domain: domain || '',
      },
      subscription_data: modus === 'mieten' ? { metadata: { user_id: nutzer.id, projekt_id: projektId || '', paket_id: paket.id } } : undefined,
      allow_promotion_codes: true,
      success_url: `${basis}/dashboard?bezahlt=1`,
      cancel_url: `${basis}/editor${projektId ? `?projekt=${projektId}` : ''}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('Checkout-Fehler:', e)
    // Echte Ursache mit ausgeben (z. B. fehlender STRIPE_SECRET_KEY oder
    // SUPABASE_SERVICE_ROLE_KEY) – sonst tappt man im Dunkeln.
    const detail = e?.message ? ` (${e.message})` : ''
    return NextResponse.json({ error: `Checkout konnte nicht gestartet werden${detail}.` }, { status: 500 })
  }
}
