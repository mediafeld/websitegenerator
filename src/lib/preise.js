// ── Zentrale Preisliste ──────────────────────────────────────
// Hier änderst du alle Preise an EINER Stelle. Startseite und Preisseite
// lesen daraus. Alle Beträge inkl. 19 % MwSt.

export const KAUF = [
  {
    id: 'onepager', name: 'Onepager', preis: 89,
    kurz: '1 Seite · 6 KI-Bilder',
    fuer: 'Handwerk, Dienstleister, alles was auf eine Seite passt',
    punkte: ['Alle Inhalte auf einer Seite', '6 KI-Bilder inklusive', 'Kontaktformular', 'Für Handy optimiert', 'Alle Editor-Funktionen', 'ZIP-Download (HTML/CSS)', 'Domain & Hosting bringst du mit'],
  },
  {
    id: 'multipage', name: 'Multipage', preis: 149, beliebt: true,
    kurz: 'bis 5 Unterseiten · 8 KI-Bilder',
    fuer: 'Betriebe mit mehreren Leistungen, die gefunden werden wollen',
    punkte: ['Bis 5 Unterseiten', '8 KI-Bilder inklusive', 'Eigene Seiten je Leistung', 'Menüführung', 'Galerie & Kundenstimmen', 'Alle Editor-Funktionen', 'ZIP-Download (HTML/CSS)', 'Domain & Hosting bringst du mit'],
  },
  {
    id: 'business', name: 'Business', preis: 199,
    kurz: 'bis 8 Unterseiten · 12 KI-Bilder',
    fuer: 'Größere Betriebe mit Team, Preisen und mehreren Standorten',
    punkte: ['Bis 8 Unterseiten', '12 KI-Bilder inklusive', 'Team- & Preisbereiche', 'Ablauf- & Zahlenblöcke', 'FAQ-Bereich', 'Alle Editor-Funktionen', 'ZIP-Download (HTML/CSS)', 'Domain & Hosting bringst du mit'],
  },
]

// Das Rundum-Paket – als Blickfang im Shop
export const SORGENFREI = {
  id: 'sorgenfrei', name: 'Keine-Sorgen-Paket', preis: 49.90, jahr: 499,
  kurz: 'Alles inklusive · wir kümmern uns um jeden Schritt',
  punkte: [
    'Website nach deinen Angaben — Erstellung kostenlos',
    'Domain inklusive, läuft auf deinen Namen',
    'Hosting, SSL und Sicherungen inklusive',
    'Bis zu 8 Unterseiten, 12 KI-Bilder',
    '3 E-Mail-Postfächer mit Spam-Filter',
    'Änderungen jederzeit selbst — oder wir machen sie',
    '5 Änderungswünsche pro Monat durch uns',
    'Support mit Vorrang, telefonisch erreichbar',
    'Rechtstexte-Vorlagen für Impressum und Datenschutz',
  ],
}

export const MIETE = [
  {
    id: 'start', name: 'Start', preis: 19.90, jahr: 199,
    kurz: 'Onepager · online mit Domain',
    punkte: ['Websiteerstellung inklusive – kein Kaufpreis', 'Domain inklusive (.de)', 'Hosting & SSL inklusive', 'E-Mail-Weiterleitung', 'Änderungen jederzeit selbst', 'Sicherungen'],
  },
  {
    id: 'plus', name: 'Plus', preis: 29.90, jahr: 299, beliebt: true,
    kurz: 'Multipage · bis 5 Unterseiten',
    punkte: ['Alles aus Start', 'Bis 5 Unterseiten', 'Echtes E-Mail-Postfach', '1 Änderungswunsch pro Monat', 'Support per E-Mail', 'Monatliche Sicherungen'],
  },
  {
    id: 'pro', name: 'Pro', preis: 39.90, jahr: 399,
    kurz: 'Business · bis 8 Unterseiten',
    punkte: ['Alles aus Plus', 'Bis 8 Unterseiten', '3 Postfächer', '3 Änderungswünsche pro Monat', 'Support mit Vorrang', 'Wöchentliche Sicherungen'],
  },
]

// Einzelposten
export const ZUSATZ = [
  { name: 'Zusätzliche .de-Domain', preis: '14,90 € / Jahr', hinweis: 'nur zu einem Mietpaket – die erste Domain ist inklusive' },
  { name: 'Zusätzliche .com / .eu / .net', preis: 'ab 19,90 € / Jahr', hinweis: 'nur zu einem Mietpaket, läuft auf deinen Namen' },
  { name: 'Zusätzliches E-Mail-Postfach', preis: '3,00 € / Monat', hinweis: 'inkl. Webmail, Spam-Filter' },
  { name: 'Weitere KI-Bilder', preis: '1,50 € / Bild', hinweis: 'wenn das Kontingent aufgebraucht ist' },
  { name: 'Einrichtung bei Miete', preis: '49 € einmalig', hinweis: 'entfällt bei Zahlung für 12 Monate im Voraus' },
]

export const MIETE_BEDINGUNGEN = {
  laufzeit: '12 Monate Mindestlaufzeit',
  danach: 'danach monatlich kündbar',
  einrichtung: '49 € einmalig – entfällt bei Jahreszahlung',
  jahresvorteil: 'Bei Zahlung für 12 Monate im Voraus zahlst du 10 statt 12 Monate.',
}

// ── Domain-Preise (nur bei Miete relevant; Zusatzdomains für Mietkunden) ──
export const TLD_PREISE = {
  de: 14.90, com: 24.90, eu: 19.90, net: 24.90,
  org: 24.90, info: 24.90, shop: 29.90, online: 29.90,
}

// Endungen, die im Domainchecker geprüft werden
// Nur Endungen mit amtlicher Registry-Auskunft (RDAP) – damit "frei" verlässlich ist
export const STANDARD_TLDS = ['de', 'com', 'net', 'org']
