// Layout-Vorlagen (Wireframes) – nur Struktur/Anordnung, keine Inhalte
// Jede Vorlage = Reihenfolge der Blöcke + bevorzugte Varianten
// Im Frontend wird NIE eine Drittquelle genannt

export const LAYOUTS = [
  {
    id: 'classic',
    name: 'Klassisch',
    sub: 'Bewährt & übersichtlich',
    desc: 'Hero, Leistungen, Über uns, Stimmen, Kontakt. Der sichere Allrounder.',
    // wireframe: Liste der "Zonen" für die Mini-Vorschau
    wire: ['hero', 'cards3', 'split', 'quotes', 'cta', 'contact'],
    blocks: [
      { type: 'hero-full', variant: 'hero-gradient' },
      { type: 'services', variant: 'services-cards' },
      { type: 'about', variant: 'about-split' },
      { type: 'testimonials', variant: 'testi-cards' },
      { type: 'cta', variant: 'cta-gradient' },
      { type: 'contact', variant: 'contact-split' },
    ],
  },
  {
    id: 'conversion',
    name: 'Verkaufsstark',
    sub: 'Auf Anfragen optimiert',
    desc: 'Viele Vertrauenselemente und Handlungsaufrufe. Ideal für Dienstleister.',
    wire: ['hero', 'stats', 'cards3', 'quotes', 'cta', 'faq', 'contact'],
    blocks: [
      { type: 'hero-full', variant: 'hero-split' },
      { type: 'stats', variant: 'stats-bar' },
      { type: 'services', variant: 'services-icons' },
      { type: 'testimonials', variant: 'testi-cards' },
      { type: 'cta', variant: 'cta-gradient' },
      { type: 'faq', variant: 'faq-accordion' },
      { type: 'contact', variant: 'contact-split' },
    ],
  },
  {
    id: 'visual',
    name: 'Bildstark',
    sub: 'Viel Raum für Fotos',
    desc: 'Große Bildflächen und Galerie. Perfekt für Restaurant, Beauty, Immobilien.',
    wire: ['hero', 'split', 'gallery', 'cards3', 'cta', 'contact'],
    blocks: [
      { type: 'hero-full', variant: 'hero-center' },
      { type: 'about', variant: 'about-split' },
      { type: 'gallery', variant: 'gallery-grid' },
      { type: 'services', variant: 'services-cards' },
      { type: 'cta', variant: 'cta-gradient' },
      { type: 'contact', variant: 'contact-split' },
    ],
  },
  {
    id: 'authority',
    name: 'Kompetent',
    sub: 'Seriös & vertrauensvoll',
    desc: 'Team, Zahlen, Über uns im Fokus. Für Kanzlei, Praxis, Beratung.',
    wire: ['hero', 'split', 'team', 'stats', 'quotes', 'contact'],
    blocks: [
      { type: 'hero-full', variant: 'hero-gradient' },
      { type: 'about', variant: 'about-stats' },
      { type: 'team', variant: 'team-cards' },
      { type: 'stats', variant: 'stats-bar' },
      { type: 'testimonials', variant: 'testi-cards' },
      { type: 'contact', variant: 'contact-split' },
    ],
  },
  {
    id: 'minimal',
    name: 'Minimalistisch',
    sub: 'Klar & reduziert',
    desc: 'Wenige, große Sektionen. Modern und aufgeräumt wie ein Startup.',
    wire: ['hero', 'cards3', 'cta', 'contact'],
    blocks: [
      { type: 'hero-full', variant: 'hero-center' },
      { type: 'services', variant: 'services-list' },
      { type: 'cta', variant: 'cta-gradient' },
      { type: 'contact', variant: 'contact-split' },
    ],
  },
  {
    id: 'gastro',
    name: 'Gastronomie',
    sub: 'Mit Speisekarte',
    desc: 'Hero, Speisekarte, Galerie, Kontakt. Speziell für Restaurant & Café.',
    wire: ['hero', 'menu', 'gallery', 'quotes', 'contact'],
    blocks: [
      { type: 'hero-full', variant: 'hero-center' },
      { type: 'menu', variant: 'menu-cards' },
      { type: 'gallery', variant: 'gallery-grid' },
      { type: 'testimonials', variant: 'testi-cards' },
      { type: 'contact', variant: 'contact-split' },
    ],
  },
]

// Branchen-Empfehlung fürs Layout
export const BRANCHEN_LAYOUT = {
  restaurant: 'gastro', salon: 'visual', fitness: 'conversion', anwalt: 'authority',
  praxis: 'authority', handwerk: 'conversion', immobilien: 'visual', agentur: 'minimal',
  fahrschule: 'conversion', andere: 'classic',
}

export function getLayout(id) {
  return LAYOUTS.find(l => l.id === id) || LAYOUTS[0]
}
