// Schriftarten mit Vorschau, Kombinationen und Branchen-Empfehlungen

export const FONTS = [
  { id: 'Inter Tight', label: 'Inter Tight', sub: 'Modern & klar', kategorie: 'sans', google: 'Inter+Tight:wght@300;400;500;600;700;800;900' },
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans', sub: 'Freundlich-modern', kategorie: 'sans', google: 'Plus+Jakarta+Sans:wght@300;400;500;600;700;800' },
  { id: 'Manrope', label: 'Manrope', sub: 'Vertrauenswürdig', kategorie: 'sans', google: 'Manrope:wght@300;400;500;600;700;800' },
  { id: 'Space Grotesk', label: 'Space Grotesk', sub: 'Tech & modern', kategorie: 'sans', google: 'Space+Grotesk:wght@300;400;500;600;700' },
  { id: 'DM Sans', label: 'DM Sans', sub: 'Rund & einladend', kategorie: 'sans', google: 'DM+Sans:wght@400;500;600;700;800;900' },
  { id: 'Sora', label: 'Sora', sub: 'Geometrisch', kategorie: 'sans', google: 'Sora:wght@300;400;500;600;700;800' },
  { id: 'Outfit', label: 'Outfit', sub: 'Minimalistisch', kategorie: 'sans', google: 'Outfit:wght@300;400;500;600;700;800' },
  { id: 'Poppins', label: 'Poppins', sub: 'Beliebt & rund', kategorie: 'sans', google: 'Poppins:wght@300;400;500;600;700;800' },
  { id: 'Playfair Display', label: 'Playfair Display', sub: 'Elegant & edel', kategorie: 'serif', google: 'Playfair+Display:wght@400;500;600;700;800;900' },
  { id: 'Lora', label: 'Lora', sub: 'Klassisch-warm', kategorie: 'serif', google: 'Lora:wght@400;500;600;700' },
  { id: 'Cormorant Garamond', label: 'Cormorant', sub: 'Luxuriös', kategorie: 'serif', google: 'Cormorant+Garamond:wght@400;500;600;700' },
  { id: 'Fraunces', label: 'Fraunces', sub: 'Charaktervoll', kategorie: 'serif', google: 'Fraunces:wght@400;500;600;700;800;900' },
]

// Font-Kombinationen (Headline + Body)
export const FONT_PAIRS = [
  { id: 'modern', label: 'Modern', headline: 'Space Grotesk', body: 'Inter Tight', sub: 'Tech, Agentur, Startup' },
  { id: 'elegant', label: 'Elegant', headline: 'Playfair Display', body: 'Lora', sub: 'Beauty, Restaurant, Luxus' },
  { id: 'clean', label: 'Clean', headline: 'Plus Jakarta Sans', body: 'Inter Tight', sub: 'Business, Beratung, Praxis' },
  { id: 'bold', label: 'Bold', headline: 'Sora', body: 'DM Sans', sub: 'Fitness, Handwerk, Event' },
  { id: 'classic', label: 'Klassisch', headline: 'Fraunces', body: 'Manrope', sub: 'Kanzlei, Immobilien, Traditionsbetrieb' },
  { id: 'friendly', label: 'Freundlich', headline: 'Poppins', body: 'DM Sans', sub: 'Café, Salon, lokale Dienste' },
]

// Branchen-Empfehlung
export const BRANCHEN_FONT = {
  restaurant: 'elegant', salon: 'friendly', fitness: 'bold', anwalt: 'classic',
  praxis: 'clean', handwerk: 'bold', immobilien: 'classic', agentur: 'modern',
  fahrschule: 'bold', andere: 'clean',
}

// Alle benötigten Google-Fonts für <link>
export function allGoogleFontsParam() {
  return FONTS.map(f => `family=${f.google}`).join('&')
}
