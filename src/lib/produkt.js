// ── Produkt-Logik: „Website mieten" ODER „Website kaufen" ────────────────────
// EINE einzige Stelle, an der steht, wie ein Produkt heißt, welche Farbe und
// welches Symbol es hat, in welchem Zustand es ist und welche Aktion als
// nächstes dran ist. Dashboard, Editor, Rechnungen und Admin lesen alle hier —
// damit nirgends mehr „Online schalten" bei einer gekauften Website auftaucht.
//
// Merksatz für die Oberfläche:
//   FARBE  = Produktart   (Blau = Miete, Violett = Kauf)
//   PUNKT  = Zustand      (Gelb = offen, Grün = aktiv, Rot = Problem, Grau = ruhend)
//
// Bewusst OHNE 'use client', damit auch Server-Routen importieren können.

import { KAUF, MIETE, eur } from './preise'

// Miet-Stufen und Kauf-Stufen haben denselben Umfang, nur andere Namen.
export const GROESSE = {
  start: 'onepager', plus: 'multipage', pro: 'business',
  onepager: 'onepager', multipage: 'multipage', business: 'business',
}
export const MIET_ID = { onepager: 'start', multipage: 'plus', business: 'pro' }
export const UMFANG_NAME = { onepager: 'Onepager', multipage: 'Multipage', business: 'Business' }
export const UMFANG_KURZ = { onepager: '1 Seite', multipage: 'bis 5 Unterseiten', business: 'bis 8 Unterseiten' }

// ── Die zwei Produktarten ───────────────────────────────────────────────────
export const ARTEN = {
  mieten: {
    id: 'mieten',
    name: 'Website mieten',
    kurz: 'Miete',
    icon: 'fa-cloud',
    farbe: '#1D4ED8', bg: '#EFF6FF', rand: '#BFDBFE',
    satz: 'Domain, Hosting, SSL und Sicherungen laufen bei uns. Monatlich zahlbar, wir schalten die Website online.',
    enthalten: ['Domain inklusive', 'Hosting & SSL', 'Wir schalten online', 'Laufende Sicherungen'],
    hauptAktion: 'Online schalten',
    hauptIcon: 'fa-rocket',
    hauptHinweis: 'Mietpaket wählen — danach schalten wir deine Website mit Domain online.',
    fertigAktion: 'Website ansehen',
    fertigIcon: 'fa-arrow-up-right-from-square',
    zahlweise: 'pro Monat',
  },
  kaufen: {
    id: 'kaufen',
    name: 'Website kaufen',
    kurz: 'Kauf',
    icon: 'fa-download',
    farbe: '#7C3AED', bg: '#F5F3FF', rand: '#DDD6FE',
    satz: 'Einmal zahlen, fertige Website als ZIP herunterladen. Domain und Hosting bringst du selbst mit — keine laufenden Kosten.',
    enthalten: ['Kompletter Quellcode', 'ZIP-Download (HTML/CSS)', 'Keine laufenden Kosten', 'Domain & Hosting selbst'],
    hauptAktion: 'Jetzt kaufen',
    hauptIcon: 'fa-cart-shopping',
    hauptHinweis: 'Paket wählen — direkt nach der Zahlung steht der ZIP-Download bereit.',
    fertigAktion: 'Website herunterladen (ZIP)',
    fertigIcon: 'fa-file-zipper',
    zahlweise: 'einmalig',
  },
}

// ── Zustands-Farben (unabhängig von der Produktart) ─────────────────────────
export const ZUSTAND = {
  offen:   { farbe: '#92400E', bg: '#FFFBEB', rand: '#FDE68A', punkt: '#F59E0B' },
  aktiv:   { farbe: '#15803D', bg: '#F0FDF4', rand: '#BBF7D0', punkt: '#16A34A' },
  problem: { farbe: '#B91C1C', bg: '#FEF2F2', rand: '#FECACA', punkt: '#DC2626' },
  ruhend:  { farbe: '#57657E', bg: '#F1F4F6', rand: '#E1E7EB', punkt: '#94A3B8' },
}

// ── Kleine Helfer ───────────────────────────────────────────────────────────

// Welche Art hat dieses Projekt? null = noch nicht entschieden.
export function artVon(p) {
  const a = p?.zahlungsart
  return a === 'mieten' || a === 'kaufen' ? a : null
}

// Das passende Paket-Objekt aus der Preisliste — egal ob eine Miet-ID
// ('plus'), eine Kauf-ID ('multipage') oder eine Größe übergeben wird.
export function paketFuer(art, idOderGroesse) {
  const size = GROESSE[idOderGroesse] || 'multipage'
  const liste = art === 'mieten' ? MIETE : KAUF
  const zielId = art === 'mieten' ? MIET_ID[size] : size
  return liste.find(x => x.id === zielId) || liste.find(x => GROESSE[x.id] === size) || liste[1]
}

// Die Paket-ID, die in die Datenbank/den Checkout gehört.
export function paketIdFuer(art, idOderGroesse) {
  return paketFuer(art, idOderGroesse)?.id || (art === 'mieten' ? 'plus' : 'multipage')
}

export function preisText(art, paket) {
  if (!paket) return ''
  return art === 'mieten' ? `${eur(paket.preis)} € / Monat` : `${eur(paket.preis)} € einmalig`
}

// Ist bezahlt? bezahlt_am ist die verlässliche Marke (setzt der Stripe-Webhook).
// Die Status-Liste fängt Altbestände ab, die noch kein bezahlt_am haben.
export function istBezahlt(p) {
  if (!p) return false
  if (p.bezahlt_am) return true
  return ['online', 'gekauft', 'gekuendigt', 'zahlung_fehlgeschlagen'].includes(p.status)
}

// ── Der komplette Zustand eines Projekts in EINEM Objekt ────────────────────
// Damit jede Oberfläche dieselbe Wahrheit anzeigt.
export function produktStand(p) {
  const art = artVon(p)
  const info = art ? ARTEN[art] : null
  const bezahlt = istBezahlt(p)
  const paket = art ? paketFuer(art, p?.paket_id) : null
  const groesse = paket ? GROESSE[paket.id] : null

  let stufe = 'offen'
  let text = 'Entwurf'
  let erklaerung = ''

  if (p?.status === 'zahlung_fehlgeschlagen') {
    stufe = 'problem'; text = 'Zahlung offen'
    erklaerung = 'Die letzte Zahlung ist nicht durchgegangen. Bitte Zahlungsmittel prüfen.'
  } else if (p?.status === 'gekuendigt') {
    stufe = 'ruhend'; text = 'Gekündigt'
    erklaerung = 'Der Vertrag läuft aus. Die Website ist bis zum Ende des Zeitraums erreichbar.'
  } else if (bezahlt && art === 'kaufen') {
    stufe = 'aktiv'; text = 'Gekauft'
    erklaerung = 'Die Website gehört dir. Du kannst sie jederzeit als ZIP herunterladen.'
  } else if (bezahlt && art === 'mieten') {
    stufe = 'aktiv'; text = 'Online'
    erklaerung = 'Die Website ist gemietet und läuft bei uns.'
  } else if (!art) {
    stufe = 'offen'; text = 'Entwurf'
    erklaerung = 'Noch nicht festgelegt, ob diese Website gemietet oder gekauft werden soll.'
  } else if (art === 'kaufen') {
    stufe = 'offen'; text = 'Entwurf · noch nicht gekauft'
    erklaerung = 'Du kannst weiter bearbeiten. Der ZIP-Download kommt nach dem Kauf.'
  } else {
    stufe = 'offen'; text = 'Entwurf · noch nicht gebucht'
    erklaerung = 'Du kannst weiter bearbeiten. Online geht sie, sobald das Mietpaket gebucht ist.'
  }

  const farben = ZUSTAND[stufe]
  const paketName = paket
    ? `${paket.name}${UMFANG_NAME[groesse] && paket.name !== UMFANG_NAME[groesse] ? ` (${UMFANG_NAME[groesse]})` : ''}`
    : ''
  const preis = preisText(art, paket)

  return {
    art, info, bezahlt, paket, groesse, paketName, preis,
    stufe, farben, text, erklaerung,
    // Fertige Zeile für Kopfzeilen: „Website kaufen — Multipage · 149,00 € einmalig"
    zeile: art ? `${info.name} — ${paketName} · ${preis}` : 'Noch kein Produkt gewählt',
    // Welche Hauptaktion gehört auf den großen Knopf?
    aktion: !art ? 'waehlen'
      : bezahlt && art === 'kaufen' ? 'zip'
      : bezahlt && art === 'mieten' ? 'ansehen'
      : art === 'kaufen' ? 'kaufen' : 'buchen',
  }
}

// Kurzform für Listen/Tabellen (Admin, Rechnungen)
export function produktKurz(p) {
  const s = produktStand(p)
  if (!s.art) return 'offen'
  return `${s.info.kurz}${s.bezahlt ? '' : ' (Entwurf)'}`
}
