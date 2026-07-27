// ═══════════════════════════════════════════════════════════════════════════
// FELD-SYSTEM
//
// Jeder Baustein beschreibt hier, WELCHE Inhalte er braucht. Daraus entsteht
// automatisch:
//   1) die Eingabemaske im Editor (Felder werden generiert, nicht handgebaut)
//   2) die Vorbefüllung aus den Wizard-Angaben des Kunden
//   3) branchenpassende Standardtexte
//
// Ein neuer Baustein muss dadurch nur EINMAL beschrieben werden und ist
// überall verdrahtet.
// ═══════════════════════════════════════════════════════════════════════════

// Feldtypen: text | flaeche (mehrzeilig) | bild | liste | zahlen | schalter | auswahl | farbe | code

export const FELD_SCHEMA = {
  'hero-full': [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text', quelle: 'branchePlusStadt' },
    { key: 'headline', label: 'Hauptüberschrift', typ: 'text', quelle: 'slogan' },
    { key: 'subline', label: 'Beschreibungstext', typ: 'flaeche', quelle: 'kurzbeschreibung' },
    { key: 'cta1', label: 'Knopf 1', typ: 'text', standard: 'Jetzt anfragen' },
    { key: 'cta2', label: 'Knopf 2', typ: 'text', standard: 'Leistungen ansehen' },
    { key: 'badge', label: 'Hinweis-Plakette', typ: 'text', standard: 'In 24 Stunden Rückmeldung' },
    { key: 'heroImg', label: 'Hauptbild', typ: 'bild' },
    { key: 'bgImg', label: 'Hintergrundbild', typ: 'bild' },
    { key: 'stats', label: 'Kennzahlen', typ: 'zahlen', quelle: 'kennzahlen' },
    { key: 'hell', label: 'Helle Darstellung', typ: 'schalter' },
    { key: 'muster', label: 'Muster im Hintergrund', typ: 'auswahl', optionen: ['keins', 'punkte', 'raster', 'linien'] },
  ],
  media: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text', standard: 'Über uns' },
    { key: 'title', label: 'Überschrift', typ: 'text', quelle: 'ueberschriftUeberUns' },
    { key: 'text', label: 'Fließtext', typ: 'flaeche', quelle: 'beschreibung' },
    { key: 'punkte', label: 'Stichpunkte', typ: 'liste', quelle: 'usps' },
    { key: 'cta', label: 'Knopf', typ: 'text', standard: 'Mehr erfahren' },
    { key: 'image', label: 'Bild', typ: 'bild' },
  ],
  text: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text' },
    { key: 'title', label: 'Überschrift', typ: 'text' },
    { key: 'text', label: 'Fließtext', typ: 'flaeche', quelle: 'beschreibung' },
    { key: 'zitat', label: 'Zitat', typ: 'flaeche' },
    { key: 'autor', label: 'Zitat von', typ: 'text', quelle: 'firmenname' },
    { key: 'highlights', label: 'Kennzahlen', typ: 'zahlen', quelle: 'kennzahlen' },
  ],
  features: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text', standard: 'Leistungen' },
    { key: 'title', label: 'Überschrift', typ: 'text', standard: 'Das können wir für Sie tun' },
    { key: 'items', label: 'Leistungen', typ: 'liste', felder: ['icon', 'title', 'text'], quelle: 'leistungen' },
    { key: 'image', label: 'Bild', typ: 'bild' },
  ],
  galerie: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text', standard: 'Galerie' },
    { key: 'title', label: 'Überschrift', typ: 'text', standard: 'Einblicke in unsere Arbeit' },
    { key: 'images', label: 'Bilder', typ: 'bildliste' },
  ],
  stimmen: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text', standard: 'Kundenstimmen' },
    { key: 'title', label: 'Überschrift', typ: 'text', standard: 'Das sagen unsere Kunden' },
    { key: 'items', label: 'Stimmen', typ: 'liste', felder: ['text', 'name', 'rolle'] },
  ],
  'cta-plus': [
    { key: 'title', label: 'Überschrift', typ: 'text', quelle: 'ctaUeberschrift' },
    { key: 'text', label: 'Text', typ: 'flaeche' },
    { key: 'cta1', label: 'Knopf 1', typ: 'text', standard: 'Jetzt anfragen' },
    { key: 'cta2', label: 'Knopf 2', typ: 'text', standard: 'Anrufen' },
  ],
  'kontakt-plus': [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text', standard: 'Kontakt' },
    { key: 'title', label: 'Überschrift', typ: 'text', standard: 'So erreichen Sie uns' },
    { key: 'text', label: 'Text', typ: 'flaeche' },
    { key: 'adresse', label: 'Adresse', typ: 'text', quelle: 'adresse' },
    { key: 'telefon', label: 'Telefon', typ: 'text', quelle: 'telefon' },
    { key: 'email', label: 'E-Mail', typ: 'text', quelle: 'email' },
    { key: 'oeffnung', label: 'Öffnungszeiten', typ: 'flaeche', quelle: 'oeffnung' },
  ],
  karte: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text', standard: 'Anfahrt' },
    { key: 'title', label: 'Überschrift', typ: 'text', standard: 'So finden Sie uns' },
    { key: 'adresse', label: 'Adresse (für die Karte)', typ: 'text', quelle: 'adresse' },
    { key: 'lat', label: 'Breitengrad (optional)', typ: 'text' },
    { key: 'lon', label: 'Längengrad (optional)', typ: 'text' },
  ],
  textbox: [
    { key: 'html', label: 'HTML-Inhalt', typ: 'code', sprache: 'html' },
    { key: 'css', label: 'Eigenes CSS', typ: 'code', sprache: 'css' },
    { key: 'js', label: 'Eigenes JavaScript', typ: 'code', sprache: 'js' },
    { key: 'breite', label: 'Maximale Breite', typ: 'text', standard: '860px' },
  ],
  oeffnung: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text', standard: 'Öffnungszeiten' },
    { key: 'title', label: 'Überschrift', typ: 'text', standard: 'Wann Sie uns erreichen' },
    { key: 'text', label: 'Text', typ: 'flaeche' },
    { key: 'tage', label: 'Zeiten', typ: 'liste', felder: ['tag', 'zeit'] },
  ],
  pricingtable: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text', standard: 'Pakete' },
    { key: 'title', label: 'Überschrift', typ: 'text', standard: 'Für jeden Bedarf das Richtige' },
    { key: 'pakete', label: 'Pakete', typ: 'liste', felder: ['name', 'preis', 'einheit', 'punkte'] },
  ],
  pricelist: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text', standard: 'Preise' },
    { key: 'title', label: 'Überschrift', typ: 'text', standard: 'Was kostet was?' },
    { key: 'gruppen', label: 'Preisgruppen', typ: 'liste', felder: ['name', 'items'] },
    { key: 'hinweis', label: 'Hinweis unten', typ: 'text' },
  ],
  teamgrid: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text', standard: 'Team' },
    { key: 'title', label: 'Überschrift', typ: 'text', standard: 'Die Menschen dahinter' },
    { key: 'items', label: 'Personen', typ: 'liste', felder: ['name', 'rolle', 'text', 'image'] },
  ],
  'faq-plus': [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text', standard: 'FAQ' },
    { key: 'title', label: 'Überschrift', typ: 'text', standard: 'Häufige Fragen' },
    { key: 'items', label: 'Fragen', typ: 'liste', felder: ['q', 'a'] },
  ],
  slider: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text' },
    { key: 'title', label: 'Überschrift', typ: 'text' },
    { key: 'items', label: 'Einträge', typ: 'liste', felder: ['text', 'name', 'rolle'] },
    { key: 'images', label: 'Bilder', typ: 'bildliste' },
    { key: 'folien', label: 'Hero-Folien', typ: 'liste', felder: ['tag', 'headline', 'text', 'cta', 'image'] },
    { key: 'logos', label: 'Logos', typ: 'bildliste' },
  ],
  counter: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text' },
    { key: 'title', label: 'Überschrift', typ: 'text' },
    { key: 'items', label: 'Zahlen', typ: 'liste', felder: ['num', 'suffix', 'label'], quelle: 'kennzahlen' },
  ],
  liste: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text' },
    { key: 'title', label: 'Überschrift', typ: 'text' },
    { key: 'items', label: 'Einträge', typ: 'liste', quelle: 'leistungenNamen' },
  ],
  iconbox: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text', standard: 'Vorteile' },
    { key: 'title', label: 'Überschrift', typ: 'text' },
    { key: 'items', label: 'Boxen', typ: 'liste', felder: ['icon', 'title', 'text'], quelle: 'leistungen' },
  ],
  imagebox: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text' },
    { key: 'title', label: 'Überschrift', typ: 'text' },
    { key: 'items', label: 'Boxen', typ: 'liste', felder: ['title', 'text', 'image'], quelle: 'leistungen' },
  ],
  stepbox: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text', standard: 'Ablauf' },
    { key: 'title', label: 'Überschrift', typ: 'text' },
    { key: 'items', label: 'Schritte', typ: 'liste', felder: ['icon', 'title', 'text'] },
  ],
  kickstart: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text' },
    { key: 'title', label: 'Überschrift', typ: 'text' },
    { key: 'text', label: 'Text', typ: 'flaeche', quelle: 'beschreibung' },
    { key: 'items', label: 'Punkte', typ: 'liste', felder: ['icon', 'title', 'text'] },
  ],
  heading: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text' },
    { key: 'title', label: 'Überschrift', typ: 'text' },
    { key: 'subtitle', label: 'Unterzeile', typ: 'flaeche' },
  ],
  banner: [
    { key: 'text', label: 'Text', typ: 'text' },
    { key: 'icon', label: 'Icon', typ: 'text', standard: 'circle-info' },
    { key: 'punkte', label: 'Laufband-Punkte', typ: 'liste', quelle: 'uspsNamen' },
  ],
  video: [
    { key: 'tag', label: 'Kleine Zeile oben', typ: 'text', standard: 'Video' },
    { key: 'title', label: 'Überschrift', typ: 'text' },
    { key: 'videoUrl', label: 'Video-Adresse (Einbett-Link)', typ: 'text' },
  ],
  siteparts: [
    { key: 'firmenname', label: 'Firmenname', typ: 'text', quelle: 'firmenname' },
    { key: 'telefon', label: 'Telefon', typ: 'text', quelle: 'telefon' },
    { key: 'email', label: 'E-Mail', typ: 'text', quelle: 'email' },
    { key: 'text', label: 'Kurzbeschreibung', typ: 'flaeche', quelle: 'kurzbeschreibung' },
    { key: 'logo', label: 'Logo', typ: 'bild' },
  ],
}

// Allgemeine Gestaltungsfelder – gelten für JEDEN Baustein
export const GESTALTUNG_FELDER = [
  { key: 'bgColor', label: 'Hintergrundfarbe', typ: 'farbe' },
  { key: 'bgImg', label: 'Hintergrundbild', typ: 'bild' },
  { key: 'bgOverlay', label: 'Abdunkelung', typ: 'text' },
  { key: 'bgPattern', label: 'Muster', typ: 'auswahl', optionen: ['none', 'dots', 'grid', 'lines'] },
]

export function felderFuer(type) {
  return FELD_SCHEMA[type] || []
}

// ───────────────────────────────────────────────────────────────────────────
// VORBEFÜLLUNG aus den Wizard-Angaben
// ───────────────────────────────────────────────────────────────────────────

const BRANCHE_TEXT = {
  restaurant: { slogan: 'Gutes Essen, ehrlich gemacht', ueber: 'Küche mit Handschrift', cta: 'Tisch reservieren' },
  salon: { slogan: 'Ihr Typ. Nur besser.', ueber: 'Handwerk am Haar', cta: 'Termin sichern' },
  fitness: { slogan: 'Stärker als gestern', ueber: 'Training, das wirkt', cta: 'Probetraining' },
  anwalt: { slogan: 'Klarheit in schwierigen Lagen', ueber: 'Rechtsberatung mit Weitblick', cta: 'Beratung anfragen' },
  praxis: { slogan: 'Gesundheit beginnt mit Zuhören', ueber: 'Medizin mit Zeit', cta: 'Termin vereinbaren' },
  handwerk: { slogan: 'Handwerk, das man sieht', ueber: 'Saubere Arbeit seit Jahren', cta: 'Angebot anfordern' },
  immobilien: { slogan: 'Zuhause beginnt hier', ueber: 'Immobilien mit Verstand', cta: 'Objekt anfragen' },
  agentur: { slogan: 'Ideen, die ankommen', ueber: 'Kreativ und messbar', cta: 'Projekt besprechen' },
  fahrschule: { slogan: 'Sicher ans Ziel', ueber: 'Fahren lernen ohne Druck', cta: 'Jetzt anmelden' },
  andere: { slogan: 'Qualität, auf die Sie zählen können', ueber: 'Über unseren Betrieb', cta: 'Kontakt aufnehmen' },
}

// Liefert für einen Feld-Schlüssel den Wert aus den Wizard-Daten
export function vorbefuellung(quelle, fd = {}) {
  const b = BRANCHE_TEXT[fd.branche] || BRANCHE_TEXT.andere
  const stadt = fd.stadt || ''
  const leist = String(fd.leistungen || '').split(/[\n,;]+/).map(s => s.trim()).filter(Boolean)
  const usps = String(fd.usps || '').split(/[\n,;]+/).map(s => s.trim()).filter(Boolean)

  switch (quelle) {
    case 'firmenname': return fd.firmenname || ''
    case 'telefon': return fd.telefon || ''
    case 'email': return fd.email || ''
    case 'oeffnung': return fd.oeffnung || ''
    case 'adresse': return fd.adresse || [fd.strasse, `${fd.plz || ''} ${stadt}`.trim()].filter(Boolean).join(', ')
    case 'branchePlusStadt': return [fd.brancheCustom || labelBranche(fd.branche), stadt].filter(Boolean).join(' · ')
    case 'slogan': return fd.seoPrimaer ? `${fd.seoPrimaer}${stadt ? ' in ' + stadt : ''}` : b.slogan
    case 'ueberschriftUeberUns': return b.ueber
    case 'ctaUeberschrift': return `Reden wir über Ihr Vorhaben`
    case 'kurzbeschreibung': return kurz(fd.beschreibung) || `${fd.firmenname || 'Wir'} steht für verlässliche Arbeit${stadt ? ' in ' + stadt : ''}.`
    case 'beschreibung': return fd.beschreibung || ''
    case 'usps': return usps.length ? usps : null
    case 'uspsNamen': return usps.length ? usps : null
    case 'leistungenNamen': return leist.length ? leist : null
    case 'leistungen': return leist.length ? leist.map((l, i) => ({ icon: ICON_REIHE[i % ICON_REIHE.length], title: l, text: '' })) : null
    case 'kennzahlen': return kennzahlen(fd)
    default: return null
  }
}

const ICON_REIHE = ['bolt', 'shield-halved', 'handshake', 'medal', 'clock', 'heart', 'wrench', 'star']

function labelBranche(id) {
  const m = { restaurant: 'Restaurant', salon: 'Salon', fitness: 'Fitness', anwalt: 'Kanzlei', praxis: 'Praxis', handwerk: 'Handwerk', immobilien: 'Immobilien', agentur: 'Agentur', fahrschule: 'Fahrschule' }
  return m[id] || ''
}

function kurz(t) {
  if (!t) return ''
  const s = String(t).trim().split(/(?<=\.)\s/)[0]
  return s.length > 180 ? s.slice(0, 177) + '…' : s
}

function kennzahlen(fd) {
  const out = []
  if (fd.gegruendet) {
    const jahre = new Date().getFullYear() - parseInt(fd.gegruendet)
    if (jahre > 0 && jahre < 200) out.push({ num: String(jahre), suffix: '', label: 'Jahre Erfahrung' })
  }
  if (fd.mitarbeiter) out.push({ num: String(parseInt(fd.mitarbeiter) || fd.mitarbeiter), suffix: '', label: 'Mitarbeiter' })
  if (out.length < 3) out.push({ num: '100', suffix: '%', label: 'Weiterempfehlung' })
  return out.length ? out : null
}

// Befüllt ein Baustein-Inhaltsobjekt aus den Wizard-Daten.
// Vorhandene Werte werden NICHT überschrieben.
export function befuelleBlock(type, content = {}, fd = {}) {
  const felder = felderFuer(type)
  const out = { ...content }
  for (const f of felder) {
    if (out[f.key] !== undefined && out[f.key] !== '' && out[f.key] !== null) continue
    let wert = null
    if (f.quelle) wert = vorbefuellung(f.quelle, fd)
    if ((wert === null || wert === '') && f.standard !== undefined) wert = f.standard
    if (wert !== null && wert !== '') out[f.key] = wert
  }
  return out
}

// ───────────────────────────────────────────────────────────────────────────
// LISTEN-ZUORDNUNG
//
// Bausteine mit Listen benutzen Schlüssel wie "featTitle2" oder "faqQ0".
// Hier steht, in welches Feld so ein Schlüssel gehört:
//   Präfix → [Feldname, Unterfeld]   (Unterfeld null = einfache Textliste)
// Dadurch landet jede Änderung im Editor an der richtigen Stelle, ohne dass
// für jeden Baustein eine Sonderregel geschrieben werden muss.
// ───────────────────────────────────────────────────────────────────────────
export const LISTEN_ZUORDNUNG = {
  punkt: ['punkte', null],
  listItem: ['items', null],
  logo: ['logos', null],
  logoText: ['logos', null],

  featTitle: ['items', 'title'], featText: ['items', 'text'], featIcon: ['items', 'icon'],
  icTitle: ['items', 'title'], icText: ['items', 'text'], icIcon: ['items', 'icon'],
  ibTitle: ['items', 'title'], ibText: ['items', 'text'],
  stepTitle: ['items', 'title'], stepText: ['items', 'text'], stepIcon: ['items', 'icon'],
  kickTitle: ['items', 'title'], kickText: ['items', 'text'], kickIcon: ['items', 'icon'],
  tmName: ['items', 'name'], tmRolle: ['items', 'rolle'], tmText: ['items', 'text'],
  faqQ: ['items', 'q'], faqA: ['items', 'a'],
  stText: ['items', 'text'], stName: ['items', 'name'], stRolle: ['items', 'rolle'],
  slText: ['items', 'text'], slName: ['items', 'name'], slRolle: ['items', 'rolle'],
  cLabel: ['items', 'label'], cNum: ['items', 'num'],

  zzTitle: ['eintraege', 'title'], zzText: ['eintraege', 'text'],
  kTitle: ['karten', 'title'], kText: ['karten', 'text'],
  stat: ['stats', 'num'], statLabel: ['stats', 'label'],
  oTag: ['tage', 'tag'], oZeit: ['tage', 'zeit'],
  ptName: ['pakete', 'name'], ptPreis: ['pakete', 'preis'], ptEinheit: ['pakete', 'einheit'], ptCta: ['pakete', 'cta'],
  folieTag: ['folien', 'tag'], folieHead: ['folien', 'headline'], folieText: ['folien', 'text'], folieCta: ['folien', 'cta'],
  fTitel: ['spalten', 'titel'],
}

// Zerlegt einen Schlüssel wie "featTitle2" → { feld:'items', unterfeld:'title', index:2 }
// oder "ptPunkt1_3" → verschachtelte Liste.
export function schluesselZerlegen(key) {
  if (!key) return null
  // Verschachtelt: name<i>_<j>
  const m2 = String(key).match(/^([a-zA-Z]+)(\d+)_(\d+)$/)
  if (m2) {
    const [, name, i, j] = m2
    if (name === 'ptPunkt') return { feld: 'pakete', index: +i, unterliste: 'punkte', unterindex: +j }
    if (name === 'fPunkt') return { feld: 'spalten', index: +i, unterliste: 'punkte', unterindex: +j }
    if (name === 'plName') return { feld: 'gruppen', index: +i, unterliste: 'items', unterindex: +j, unterfeld: 'name' }
    if (name === 'plDesc') return { feld: 'gruppen', index: +i, unterliste: 'items', unterindex: +j, unterfeld: 'desc' }
    if (name === 'plPreis') return { feld: 'gruppen', index: +i, unterliste: 'items', unterindex: +j, unterfeld: 'preis' }
    return null
  }
  const m = String(key).match(/^([a-zA-Z]+)(\d+)$/)
  if (!m) return null
  const [, name, i] = m
  const z = LISTEN_ZUORDNUNG[name]
  if (!z) return null
  return { feld: z[0], unterfeld: z[1], index: +i }
}

// Schreibt einen Wert anhand des Schlüssels an die richtige Stelle im Inhalt.
// Gibt das neue Inhaltsobjekt zurück – oder null, wenn der Schlüssel nicht passt.
export function wertSetzen(content, key, wert) {
  const z = schluesselZerlegen(key)
  if (!z) return null
  const out = { ...content }

  if (z.unterliste) {
    const liste = [...(out[z.feld] || [])]
    const eintrag = { ...(liste[z.index] || {}) }
    const unter = [...(eintrag[z.unterliste] || [])]
    unter[z.unterindex] = z.unterfeld
      ? { ...(unter[z.unterindex] || {}), [z.unterfeld]: wert }
      : wert
    eintrag[z.unterliste] = unter
    liste[z.index] = eintrag
    out[z.feld] = liste
    return out
  }

  const liste = [...(out[z.feld] || [])]
  liste[z.index] = z.unterfeld
    ? { ...(liste[z.index] || {}), [z.unterfeld]: wert }
    : wert
  // Lücken schließen: eine Liste mit Löchern würde beim Rendern übersprungen
  // werden – übrig blieben leere Einträge (nur Aufzählungspunkte ohne Text).
  for (let i = 0; i < liste.length; i++) {
    if (liste[i] === undefined) liste[i] = z.unterfeld ? {} : ''
  }
  out[z.feld] = liste
  return out
}


// ───────────────────────────────────────────────────────────────────────────
// PFAD-SCHREIBER  (neu, eindeutig)
//
// Bearbeitbare Elemente tragen ihren EXAKTEN Pfad, z. B.
//   data-edit="headline"          → content.headline
//   data-edit="punkte.2"          → content.punkte[2]
//   data-edit="items.0.title"     → content.items[0].title
//   data-edit="gruppen.1.items.3.preis"
// Damit muss nichts mehr geraten werden – jeder Schlüssel sagt selbst,
// wohin er gehört. Das war die Ursache für vertauschte/verschwundene Texte.
// ───────────────────────────────────────────────────────────────────────────
export function istPfad(key) {
  return typeof key === 'string' && key.includes('.')
}

export function pfadSetzen(content, pfad, wert) {
  const teile = String(pfad).split('.')
  const wurzel = Array.isArray(content) ? [...content] : { ...content }
  let ziel = wurzel
  for (let i = 0; i < teile.length - 1; i++) {
    const t = teile[i]
    const naechstIstZahl = /^\d+$/.test(teile[i + 1])
    let vorhanden = ziel[t]
    if (Array.isArray(vorhanden)) vorhanden = [...vorhanden]
    else if (vorhanden && typeof vorhanden === 'object') vorhanden = { ...vorhanden }
    else vorhanden = naechstIstZahl ? [] : {}
    ziel[t] = vorhanden
    ziel = vorhanden
  }
  ziel[teile[teile.length - 1]] = wert
  // Lücken in Listen schließen, damit nie halbe Einträge gerendert werden
  const aufraeumen = (o) => {
    if (Array.isArray(o)) {
      for (let i = 0; i < o.length; i++) {
        if (o[i] === undefined) o[i] = ''
        else aufraeumen(o[i])
      }
    } else if (o && typeof o === 'object') {
      Object.values(o).forEach(aufraeumen)
    }
  }
  aufraeumen(wurzel)
  return wurzel
}

// ── Listen-Einträge klonen / löschen (Elementor-artig) ─────────────────────
// Der Editor erkennt, dass eine Karte im Baustein zu content[feld][index]
// gehört (weil alle Pfade darin mit z. B. "items.2." beginnen). Klonen und
// Löschen ändern dann DIE LISTE – nie das HTML. So bleibt alles konsistent.
export function listeAendern(content, feld, index, op) {
  const alt = Array.isArray(content?.[feld]) ? content[feld] : null
  if (!alt) return null
  const neu = alt.map((e) => (e && typeof e === 'object' ? JSON.parse(JSON.stringify(e)) : e))
  const i = Math.max(0, Math.min(index, neu.length - 1))
  if (op === 'dup') {
    neu.splice(i + 1, 0, neu[i] && typeof neu[i] === 'object' ? JSON.parse(JSON.stringify(neu[i])) : neu[i])
  } else if (op === 'del') {
    if (neu.length <= 1) return null // die letzte Karte bleibt – sonst kippt das Layout
    neu.splice(i, 1)
  } else if (op === 'hoch' || op === 'runter') {
    const j = op === 'hoch' ? i - 1 : i + 1
    if (j < 0 || j >= neu.length) return null
    ;[neu[i], neu[j]] = [neu[j], neu[i]]
  } else return null
  return { ...content, [feld]: neu }
}

// Wenn sich die Struktur einer Sektion ändert (Karte geklont/gelöscht,
// Variante gewechselt), stimmen tiefe Kindpfade der Layout-Overrides nicht
// mehr. Sektion ("") und erste Ebene bleiben, tiefere werden verworfen.
export function layoutNachStruktur(content) {
  if (!content?._layout) return content
  const flach = {}
  for (const [pfad, stile] of Object.entries(content._layout)) {
    if (pfad === '' || !String(pfad).includes('.')) flach[pfad] = stile
  }
  return { ...content, _layout: flach }
}
