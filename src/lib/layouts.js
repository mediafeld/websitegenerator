// Layout-Vorlagen – Struktur/Anordnung der Startseite.
// 6 bewusst GRUNDVERSCHIEDENE Vorlagen, aufgebaut aus den Premium-Bausteinen
// (lib/blocksPlus.js) in der themebaren wg-Designsprache.
// Im Frontend wird NIE eine Drittquelle genannt.

export const LAYOUTS = [
  {
    id: 'editorial',
    name: 'Editorial',
    sub: 'Redaktionell & ruhig',
    desc: 'Heller Auftakt, großes Bild neben starker Typografie. Wirkt hochwertig und aufgeräumt – wie ein gut gemachtes Magazin.',
    wire: ['hero', 'split', 'cards3', 'quotes', 'cta', 'contact'],
    blocks: [
      { type: 'hero-full', variant: 'hero-editorial' },
      { type: 'media', variant: 'media-links' },
      { type: 'features', variant: 'feat-karten' },
      { type: 'text', variant: 'text-zitat' },
      { type: 'stimmen', variant: 'stimmen-gross' },
      { type: 'cta-plus', variant: 'ctap-karte' },
      { type: 'kontakt-plus', variant: 'kontaktp-split' },
    ],
  },
  {
    id: 'bewegt',
    name: 'Modern & bewegt',
    sub: 'Großer Auftritt',
    desc: 'Dunkler Hero mit bewegten Farbflächen, kräftige Kontraste, viel Wirkung. Für alle, die auffallen wollen.',
    wire: ['hero', 'stats', 'cards3', 'split', 'quotes', 'cta', 'contact'],
    blocks: [
      { type: 'hero-full', variant: 'hero-duo' },
      { type: 'banner', variant: 'banner-laufband' },
      { type: 'features', variant: 'feat-dunkel' },
      { type: 'media', variant: 'media-rechts' },
      { type: 'stimmen', variant: 'stimmen-einzeln' },
      { type: 'cta-plus', variant: 'ctap-mesh' },
      { type: 'kontakt-plus', variant: 'kontaktp-split' },
    ],
  },
  {
    id: 'bildstark',
    name: 'Bildstark',
    sub: 'Fotos im Mittelpunkt',
    desc: 'Vollflächiges Foto im Hero, große Galerie, wenig Text. Perfekt für Gastronomie, Beauty, Immobilien und Handwerk mit schönen Referenzen.',
    wire: ['hero', 'split', 'gallery', 'cards3', 'cta', 'contact'],
    blocks: [
      { type: 'hero-full', variant: 'hero-foto' },
      { type: 'media', variant: 'media-gross' },
      { type: 'galerie', variant: 'gal-masonry' },
      { type: 'features', variant: 'feat-split-bild' },
      { type: 'cta-plus', variant: 'ctap-band' },
      { type: 'kontakt-plus', variant: 'kontaktp-split' },
    ],
  },
  {
    id: 'ablauf',
    name: 'Schritt für Schritt',
    sub: 'Erklärt den Weg',
    desc: 'Zeigt in klaren Schritten, wie die Zusammenarbeit abläuft. Nimmt Unsicherheit und führt zur Anfrage – ideal für erklärungsbedürftige Leistungen.',
    wire: ['hero', 'cards3', 'split', 'stats', 'faq', 'cta', 'contact'],
    blocks: [
      { type: 'hero-full', variant: 'hero-akzent' },
      { type: 'features', variant: 'feat-liste-gross' },
      { type: 'media', variant: 'media-zickzack' },
      { type: 'text', variant: 'text-highlights' },
      { type: 'faq', variant: 'faq-accordion' },
      { type: 'cta-plus', variant: 'ctap-mesh' },
      { type: 'kontakt-plus', variant: 'kontaktp-split' },
    ],
  },
  {
    id: 'kompakt',
    name: 'Kompakt',
    sub: 'Kurz & klar',
    desc: 'Wenige, große Abschnitte ohne Ablenkung. Schnell erfasst, schnell zur Anfrage – gut für Onepager.',
    wire: ['hero', 'cards3', 'cta', 'contact'],
    blocks: [
      { type: 'hero-full', variant: 'hero-minimal' },
      { type: 'text', variant: 'text-zentriert' },
      { type: 'features', variant: 'feat-karten' },
      { type: 'cta-plus', variant: 'ctap-band' },
      { type: 'kontakt-plus', variant: 'kontaktp-split' },
    ],
  },
  {
    id: 'vertrauen',
    name: 'Vertrauensvoll',
    sub: 'Seriös & belegt',
    desc: 'Team, Zahlen und Kundenstimmen stehen im Vordergrund. Für Kanzlei, Praxis, Beratung und alle, bei denen Vertrauen entscheidet.',
    wire: ['hero', 'split', 'team', 'stats', 'quotes', 'contact'],
    blocks: [
      { type: 'hero-full', variant: 'hero-magazin' },
      { type: 'media', variant: 'media-overlap' },
      { type: 'team', variant: 'team-cards' },
      { type: 'text', variant: 'text-highlights' },
      { type: 'stimmen', variant: 'stimmen-gross' },
      { type: 'cta-plus', variant: 'ctap-karte' },
      { type: 'kontakt-plus', variant: 'kontaktp-split' },
    ],
  },
]

// Branchen-Empfehlung fürs Layout
export const BRANCHEN_LAYOUT = {
  restaurant: 'bildstark', salon: 'bildstark', fitness: 'bewegt', anwalt: 'vertrauen',
  praxis: 'vertrauen', handwerk: 'ablauf', immobilien: 'bildstark', agentur: 'bewegt',
  fahrschule: 'ablauf', andere: 'editorial',
}

export function getLayout(id) {
  return LAYOUTS.find(l => l.id === id) || LAYOUTS[0]
}
