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
    // KAUF = fertige Website als ZIP-Download. Eine Domain gibt es NUR bei
    // Miete (gehostet). Beim Kauf wird eine mitgeschickte Domain serverseitig
    // verworfen – egal, was die Oberfläche behauptet.
    const domainSauber = modus === 'kaufen' ? '' : (domain || '')
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

    // Rechnungsdaten: je Website (re_*) falls gepflegt, sonst Konto-Profil.
    let reDaten = null
    if (projektId) {
      const { data: pj } = await db.from('projekte').select('re_firma,re_vorname,re_nachname,re_strasse,re_plz,re_ort,re_ust_id').eq('id', projektId).maybeSingle()
      if (pj && (pj.re_strasse || pj.re_firma)) reDaten = pj
    }
    const rechName = reDaten
      ? (reDaten.re_firma || `${reDaten.re_vorname || ''} ${reDaten.re_nachname || ''}`.trim())
      : (profil?.firma || `${profil?.vorname || ''} ${profil?.nachname || ''}`.trim())
    const rechAdresse = reDaten
      ? { line1: reDaten.re_strasse || undefined, postal_code: reDaten.re_plz || undefined, city: reDaten.re_ort || undefined, country: 'DE' }
      : { line1: profil?.strasse || undefined, postal_code: profil?.plz || undefined, city: profil?.ort || undefined, country: 'DE' }

    // FESTER Stripe-Kunde je Nutzer: so landet die Kundennummer (ab 1000)
    // als eigenes Feld auf JEDER Stripe-Rechnung, und alle Zahlungen/
    // Zahlungsmittel hängen an einem Kunden statt an Streu-Sessions.
    let stripeKundeId = profil?.stripe_customer_id || null
    const kundennummer = profil?.kundennummer != null ? String(profil.kundennummer) : null
    const kundenFelder = {
      name: rechName || undefined,
      address: rechAdresse,
      metadata: { user_id: nutzer.id, ...(kundennummer ? { kundennummer } : {}) },
      ...(kundennummer ? { invoice_settings: { custom_fields: [{ name: 'Kundennummer', value: kundennummer }] } } : {}),
    }
    try {
      if (stripeKundeId) {
        await stripe.customers.update(stripeKundeId, kundenFelder)
      } else {
        const kunde = await stripe.customers.create({ email: nutzer.email, ...kundenFelder })
        stripeKundeId = kunde.id
        await db.from('profile').update({ stripe_customer_id: stripeKundeId }).eq('id', nutzer.id)
      }
    } catch (e) {
      console.warn('[checkout] Stripe-Kunde konnte nicht angelegt/aktualisiert werden:', e?.message)
      stripeKundeId = null
    }

    const session = await stripe.checkout.sessions.create({
      mode: modus === 'mieten' ? 'subscription' : 'payment',
      ...(stripeKundeId ? { customer: stripeKundeId } : { customer_email: nutzer.email }),
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
        domain: domainSauber,
      },
      subscription_data: modus === 'mieten' ? { metadata: { user_id: nutzer.id, projekt_id: projektId || '', paket_id: paket.id } } : undefined,
      allow_promotion_codes: true,
      ...(modus === 'kaufen' ? { invoice_creation: { enabled: true } } : {}),
      success_url: `${basis}/danke?projekt=${projektId || ''}&modus=${modus}`,
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
