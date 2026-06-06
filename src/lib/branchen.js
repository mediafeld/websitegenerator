// 10 Branchen + branchenspezifische Detail-Felder

export const BRANCHEN = [
  { id: 'restaurant', label: 'Restaurant / Café', emoji: '🍽️', beschreibung: 'Gastronomie' },
  { id: 'salon', label: 'Friseur / Beauty', emoji: '✂️', beschreibung: 'Salon & Kosmetik' },
  { id: 'fitness', label: 'Fitness / Sport', emoji: '💪', beschreibung: 'Studio & Training' },
  { id: 'anwalt', label: 'Anwalt / Kanzlei', emoji: '⚖️', beschreibung: 'Recht & Beratung' },
  { id: 'praxis', label: 'Arzt / Praxis', emoji: '🩺', beschreibung: 'Gesundheit' },
  { id: 'handwerk', label: 'Handwerk', emoji: '🔨', beschreibung: 'Bau & Service' },
  { id: 'immobilien', label: 'Immobilien', emoji: '🏠', beschreibung: 'Makler' },
  { id: 'agentur', label: 'Agentur / Beratung', emoji: '💼', beschreibung: 'Business' },
  { id: 'fahrschule', label: 'Fahrschule / Bildung', emoji: '🚗', beschreibung: 'Schulung & Kurse' },
  { id: 'andere', label: 'Andere Branche', emoji: '🏢', beschreibung: 'Allgemein' },
]

export function getBranche(id) {
  return BRANCHEN.find(b => b.id === id) || BRANCHEN[BRANCHEN.length - 1]
}

// Branchenspezifische Detail-Felder (Schritt: Branchen-Details)
// type: text | textarea | check | tags
export const BRANCHEN_FELDER = {
  restaurant: {
    titel: 'Restaurant-Details',
    sub: 'Damit Speisekarte & Texte perfekt passen',
    felder: [
      { key: 'kueche', label: 'Küchenstil', type: 'text', placeholder: 'z.B. Italienisch, Modern Deutsch, Vegan' },
      { key: 'preisklasse', label: 'Preisklasse', type: 'select', options: ['€ Günstig', '€€ Mittel', '€€€ Gehoben', '€€€€ Fine Dining'] },
      { key: 'gerichte', label: 'Top-Gerichte (für Speisekarte)', type: 'textarea', placeholder: 'z.B.\nPizza Margherita – 9,90€\nPasta Carbonara – 12,50€\nTiramisu – 6,50€' },
      { key: 'reservierung', label: 'Reservierung möglich?', type: 'check' },
      { key: 'lieferung', label: 'Lieferung / Abholung?', type: 'check' },
      { key: 'besonderes', label: 'Besonderheiten', type: 'textarea', placeholder: 'z.B. Terrasse, Eventlocation, Catering...' },
    ]
  },
  salon: {
    titel: 'Salon-Details',
    sub: 'Für Preisliste & Buchung',
    felder: [
      { key: 'services', label: 'Services & Preise', type: 'textarea', placeholder: 'z.B.\nHaarschnitt Damen – ab 45€\nHaarschnitt Herren – ab 28€\nColoration – ab 70€' },
      { key: 'marken', label: 'Verwendete Marken/Produkte', type: 'text', placeholder: 'z.B. Wella, Olaplex, L\'Oréal' },
      { key: 'onlinebuchung', label: 'Online-Terminbuchung?', type: 'check' },
      { key: 'spezial', label: 'Spezialisierung', type: 'text', placeholder: 'z.B. Balayage, Hochzeitsfrisuren' },
    ]
  },
  fitness: {
    titel: 'Studio-Details',
    sub: 'Für Kursplan & Mitgliedschaften',
    felder: [
      { key: 'kurse', label: 'Kurse / Angebote', type: 'textarea', placeholder: 'z.B.\nYoga – Mo/Mi 18 Uhr\nHIIT – Di/Do 19 Uhr\nKraftraum – täglich' },
      { key: 'mitgliedschaften', label: 'Mitgliedschaften & Preise', type: 'textarea', placeholder: 'z.B.\nBasic – 29€/Monat\nPremium – 49€/Monat' },
      { key: 'trainer', label: 'Anzahl Trainer', type: 'text', placeholder: 'z.B. 5 zertifizierte Trainer' },
      { key: 'probetraining', label: 'Kostenloses Probetraining?', type: 'check' },
    ]
  },
  anwalt: {
    titel: 'Kanzlei-Details',
    sub: 'Für Rechtsgebiete & Beratung',
    felder: [
      { key: 'rechtsgebiete', label: 'Rechtsgebiete', type: 'textarea', placeholder: 'z.B.\nArbeitsrecht\nFamilienrecht\nVerkehrsrecht\nMietrecht' },
      { key: 'erstberatung', label: 'Kostenlose Erstberatung?', type: 'check' },
      { key: 'sprachen', label: 'Beratungssprachen', type: 'text', placeholder: 'z.B. Deutsch, Englisch, Türkisch' },
      { key: 'zulassung', label: 'Zulassung seit', type: 'text', placeholder: 'z.B. 2008' },
    ]
  },
  praxis: {
    titel: 'Praxis-Details',
    sub: 'Für Sprechzeiten & Leistungen',
    felder: [
      { key: 'fachrichtung', label: 'Fachrichtung', type: 'text', placeholder: 'z.B. Allgemeinmedizin, Zahnmedizin' },
      { key: 'sprechzeiten', label: 'Sprechzeiten', type: 'textarea', placeholder: 'Mo-Fr: 8:00-12:00, 14:00-18:00\nSa: nach Vereinbarung' },
      { key: 'leistungen', label: 'Behandlungen / Leistungen', type: 'textarea', placeholder: 'z.B.\nVorsorgeuntersuchungen\nImpfungen\nUltraschall' },
      { key: 'kasse', label: 'Kassenärztlich zugelassen?', type: 'check' },
      { key: 'privat', label: 'Privatpatienten?', type: 'check' },
      { key: 'onlinetermin', label: 'Online-Terminbuchung?', type: 'check' },
    ]
  },
  handwerk: {
    titel: 'Handwerks-Details',
    sub: 'Für Leistungen & Einzugsgebiet',
    felder: [
      { key: 'gewerke', label: 'Gewerke / Leistungen', type: 'textarea', placeholder: 'z.B.\nBadsanierung\nFliesenarbeiten\nHeizungsinstallation' },
      { key: 'gebiet', label: 'Einzugsgebiet', type: 'text', placeholder: 'z.B. Berlin und Umland (50km)' },
      { key: 'notdienst', label: '24h-Notdienst?', type: 'check' },
      { key: 'meister', label: 'Meisterbetrieb?', type: 'check' },
    ]
  },
  immobilien: {
    titel: 'Immobilien-Details',
    sub: 'Für Objekte & Services',
    felder: [
      { key: 'objektarten', label: 'Objektarten', type: 'text', placeholder: 'z.B. Wohnungen, Häuser, Gewerbe' },
      { key: 'region', label: 'Tätigkeitsregion', type: 'text', placeholder: 'z.B. München & Umgebung' },
      { key: 'services', label: 'Services', type: 'textarea', placeholder: 'z.B.\nVerkauf\nVermietung\nBewertung\nHome Staging' },
      { key: 'bewertung', label: 'Kostenlose Immobilienbewertung?', type: 'check' },
    ]
  },
  agentur: {
    titel: 'Agentur-Details',
    sub: 'Für Leistungen & Portfolio',
    felder: [
      { key: 'leistungen', label: 'Leistungen', type: 'textarea', placeholder: 'z.B.\nWebdesign\nSEO\nSocial Media\nBranding' },
      { key: 'branchen', label: 'Kundenbranchen', type: 'text', placeholder: 'z.B. KMU, Startups, E-Commerce' },
      { key: 'referenzen', label: 'Referenzkunden', type: 'text', placeholder: 'z.B. Siemens, lokale Unternehmen' },
      { key: 'erstgespraech', label: 'Kostenloses Erstgespräch?', type: 'check' },
    ]
  },
  fahrschule: {
    titel: 'Fahrschul-Details',
    sub: 'Für Führerscheinklassen & Preise',
    felder: [
      { key: 'klassen', label: 'Führerscheinklassen', type: 'textarea', placeholder: 'z.B.\nKlasse B (PKW)\nKlasse A (Motorrad)\nKlasse A1, A2\nB196' },
      { key: 'preise', label: 'Preise / Pakete', type: 'textarea', placeholder: 'z.B.\nGrundgebühr – 350€\nFahrstunde – 60€\nIntensivkurs – auf Anfrage' },
      { key: 'fahrzeuge', label: 'Fahrzeuge', type: 'text', placeholder: 'z.B. moderne PKW, Motorräder' },
      { key: 'intensiv', label: 'Intensivkurse?', type: 'check' },
      { key: 'sprachen', label: 'Unterrichtssprachen', type: 'text', placeholder: 'z.B. Deutsch, Englisch' },
    ]
  },
  andere: {
    titel: 'Branchen-Details',
    sub: 'Erzähl uns mehr über dein Angebot',
    felder: [
      { key: 'angebot', label: 'Hauptangebot / Leistungen', type: 'textarea', placeholder: 'Beschreibe deine wichtigsten Leistungen...' },
      { key: 'preise', label: 'Preise / Pakete (optional)', type: 'textarea', placeholder: 'z.B. Paket A – 99€...' },
      { key: 'besonderes', label: 'Was macht euch besonders?', type: 'text', placeholder: 'Euer Alleinstellungsmerkmal' },
    ]
  },
}

export function getBranchenFelder(id) {
  return BRANCHEN_FELDER[id] || BRANCHEN_FELDER.andere
}
