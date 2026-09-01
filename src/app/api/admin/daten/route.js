import { NextResponse } from 'next/server'
import { istAdmin } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { stripeClient } from '@/lib/stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Liefert ALLES für den Admin-Bereich in einem Rutsch:
// Kunden (mit Kundennummer, Adresse, Stripe, Notizen), Projekte, Rechnungen,
// Kennzahlen. Zugriff nur mit gültigem Admin-Cookie; Datenbankzugriff über
// den Service-Role-Schlüssel (umgeht den Zeilenschutz bewusst NUR hier).
export async function GET(req) {
  if (!istAdmin(req)) return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 401 })
  try {
    const db = supabaseAdmin()

    // Nutzerkonten (Supabase Auth) – bis 1000 Konten in einem Zug
    const { data: nutzerListe, error: nutzerFehler } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 })
    if (nutzerFehler) throw nutzerFehler

    const [{ data: profile }, { data: projekte }, { data: rechnungen }, notizenErg, { data: nutzung }, { data: protokoll }] = await Promise.all([
      db.from('profile').select('*'),
      // bezahlt_am kommt aus migration_v39 — fehlt sie noch, wird ohne sie geladen
      db.from('projekte').select('id,user_id,name,firma,branche,status,zahlungsart,paket_id,bezahlt_am,domain,geaendert_am,stripe_customer_id,stripe_subscription_id,pages')
        .then(r => r.error
          ? db.from('projekte').select('id,user_id,name,firma,branche,status,zahlungsart,paket_id,domain,geaendert_am,stripe_customer_id,stripe_subscription_id,pages')
          : r),
      db.from('rechnungen').select('*').order('erstellt_am', { ascending: false }).limit(500).then(r => r, () => ({ data: [] })),
      db.from('admin_notizen').select('*').order('erstellt_am', { ascending: false }).then(r => r, () => ({ data: null, error: { message: 'admin_notizen fehlt' } })),
      db.from('nutzung').select('user_id,art,menge,erstellt_am').order('erstellt_am', { ascending: false }).limit(5000).then(r => r, () => ({ data: [] })),
      db.from('admin_protokoll').select('*').order('erstellt_am', { ascending: false }).limit(100).then(r => r, () => ({ data: [] })),
    ])
    const notizen = notizenErg?.data || []
    const notizenFehlen = !notizenErg?.data && !!notizenErg?.error

    const profilVon = Object.fromEntries((profile || []).map(p => [p.id, p]))
    const projekteVon = {}
    ;(projekte || []).forEach(p => { (projekteVon[p.user_id] = projekteVon[p.user_id] || []).push(p) })
    const notizenVon = {}
    ;(notizen || []).forEach(n => { (notizenVon[n.user_id] = notizenVon[n.user_id] || []).push(n) })
    const rechnungenVon = {}
    ;(rechnungen || []).forEach(r => { if (r.user_id) (rechnungenVon[r.user_id] = rechnungenVon[r.user_id] || []).push(r) })
    // Echte KI-Nutzung je Kunde (Tabelle nutzung, seit v26)
    const nutzungVon = {}
    ;(nutzung || []).forEach(n => {
      const k = n.user_id || 'anonym'
      const e = (nutzungVon[k] = nutzungVon[k] || { bilder: 0, texte: 0 })
      if (n.art === 'ki-bild') e.bilder += (n.menge || 1)
      if (n.art === 'ki-text') e.texte += (n.menge || 1)
    })

    // Bilder je Projekt zählen (grober KI-/Upload-Indikator) und pages nicht mitschicken
    const projekteLeicht = (projekte || []).map(p => {
      let bilder = 0
      try { bilder = (JSON.stringify(p.pages || {}).match(/data:image/g) || []).length } catch {}
      const { pages, ...rest } = p
      return { ...rest, bilder, hatInhalt: !!p.pages }
    })

    const kunden = (nutzerListe?.users || []).map(u => {
      const pr = profilVon[u.id] || {}
      return {
        id: u.id,
        email: u.email,
        registriert_am: u.created_at,
        letzter_login: u.last_sign_in_at,
        bestaetigt: !!u.email_confirmed_at,
        kundennummer: pr.kundennummer ?? null,
        vorname: pr.vorname || '', nachname: pr.nachname || '',
        firma: pr.firma || '', strasse: pr.strasse || '', plz: pr.plz || '', ort: pr.ort || '',
        telefon: pr.telefon || '', ust_id: pr.ust_id || '', handelsregister: pr.handelsregister || '',
        stripe_customer_id: (projekteVon[u.id] || []).find(p => p.stripe_customer_id)?.stripe_customer_id || null,
        projekte: (projekteVon[u.id] || []).length,
        notizen: notizenVon[u.id] || [],
        rechnungen: rechnungenVon[u.id] || [],
        nutzung: nutzungVon[u.id] || { bilder: 0, texte: 0 },
        gesperrt: !!u.banned_until && new Date(u.banned_until) > new Date(),
      }
    }).sort((a, b) => (a.kundennummer ?? 999999) - (b.kundennummer ?? 999999))

    const umsatz = (rechnungen || []).filter(r => r.status === 'bezahlt').reduce((s, r) => s + (parseFloat(r.betrag) || 0), 0)
    const zahlen = {
      kunden: kunden.length,
      projekte: projekteLeicht.length,
      bezahlt: projekteLeicht.filter(p => !!p.bezahlt_am || ['online', 'gekauft'].includes(p.status)).length,
      entwuerfe: projekteLeicht.filter(p => p.status === 'entwurf').length,
      abos: projekteLeicht.filter(p => p.stripe_subscription_id).length,
      umsatz,
      rechnungen: (rechnungen || []).length,
      bilderGesamt: projekteLeicht.reduce((s, p) => s + p.bilder, 0),
    }

    // Gutscheine aus Stripe (fehlertolerant – ohne Schlüssel einfach leer)
    let gutscheine = []
    try {
      const stripe = stripeClient()
      const promo = await stripe.promotionCodes.list({ limit: 50 })
      gutscheine = (promo?.data || []).map(g => ({
        code: g.code, aktiv: g.active,
        rabatt: g.coupon?.percent_off ? `${g.coupon.percent_off} %` : g.coupon?.amount_off ? `${(g.coupon.amount_off / 100).toFixed(2)} €` : '–',
        eingeloest: g.times_redeemed || 0, maximal: g.max_redemptions || null,
      }))
    } catch (e) { console.log('[admin] Gutscheine übersprungen:', e?.message) }

    const nutzungGesamt = Object.values(nutzungVon).reduce((a, n) => ({ bilder: a.bilder + n.bilder, texte: a.texte + n.texte }), { bilder: 0, texte: 0 })
    zahlen.kiBilder = nutzungGesamt.bilder
    zahlen.kiTexte = nutzungGesamt.texte

    return NextResponse.json({ kunden, projekte: projekteLeicht, rechnungen: rechnungen || [], zahlen, notizenFehlen, gutscheine, protokoll: protokoll || [] })
  } catch (e) {
    return NextResponse.json({ error: `Daten konnten nicht geladen werden (${e?.message || e}).` }, { status: 500 })
  }
}
