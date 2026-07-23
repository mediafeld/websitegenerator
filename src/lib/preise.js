// ── Zentrale Preisliste ──────────────────────────────────────
// Hier änderst du alle Preise an EINER Stelle. Startseite und Preisseite
// lesen daraus. Alle Beträge inkl. 19 % MwSt.

export const KAUF = [
  {
    id: 'onepager', name: 'Onepager', preis: 89,
    kurz: '1 Seite · 6 KI-Bilder',
    fuer: 'Handwerk, Dienstleister, alles was auf eine Seite passt',
    punkte: ['Alle Inhalte auf einer Seite', '6 KI-Bilder inklusive', 'Kontaktformular', 'Für Handy optimiert', 'Alle Editor-Funktionen', 'ZIP-Download (HTML/CSS)'],
  },
  {
    id: 'multipage', name: 'Multipage', preis: 149, beliebt: true,
    kurz: 'bis 5 Unterseiten · 8 KI-Bilder',
    fuer: 'Betriebe mit mehreren Leistungen, die gefunden werden wollen',
    punkte: ['Bis 5 Unterseiten', '8 KI-Bilder inklusive', 'Eigene Seiten je Leistung', 'Menüführung', 'Galerie & Kundenstimmen', 'Alle Editor-Funktionen', 'ZIP-Download (HTML/CSS)'],
  },
  {
    id: 'business', name: 'Business', preis: 199,
    kurz: 'bis 8 Unterseiten · 12 KI-Bilder',
    fuer: 'Größere Betriebe mit Team, Preisen und mehreren Standorten',
    punkte: ['Bis 8 Unterseiten', '12 KI-Bilder inklusive', 'Team- & Preisbereiche', 'Ablauf- & Zahlenblöcke', 'FAQ-Bereich', 'Alle Editor-Funktionen', 'ZIP-Download (HTML/CSS)'],
  },
]

export const MIETE = [
  {
    id: 'start', name: 'Start', preis: 19.90, jahr: 199,
    kurz: 'Onepager · online mit Domain',
    punkte: ['Website online unter deiner Domain', 'Domain inklusive (.de)', 'Hosting & SSL', 'E-Mail-Weiterleitung', 'Änderungen selbst im Editor', 'Sicherungen'],
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
  { name: 'Weitere .de-Domain', preis: '14,90 € / Jahr', hinweis: 'läuft auf deinen Namen, jederzeit mitnehmbar' },
  { name: '.com / .eu / .net', preis: 'ab 19,90 € / Jahr', hinweis: 'Preis wird vor der Buchung angezeigt' },
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
