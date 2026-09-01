// ── Vorlagen für Impressum und Datenschutzerklärung ────────────────────────
// EINE Quelle für Baukasten (Erstkonfiguration) und Kundenkonto → beide
// erzeugen denselben Text. Fehlende Angaben werden als [ Platzhalter ]
// markiert — es wird nie etwas erfunden.
//
// Bewusst OHNE 'use client': wird auch serverseitig gebraucht.

const z = (v) => String(v ?? '').trim()

// Angaben aus dem Konto-Profil („Meine Daten")
export function ausProfil(p) {
  return {
    firma: z(p?.firma),
    vorname: z(p?.vorname),
    nachname: z(p?.nachname),
    zusatz: z(p?.zusatz),
    strasse: z(p?.strasse),
    plz: z(p?.plz),
    ort: z(p?.ort),
    land: z(p?.land),
    telefon: z(p?.telefon),
    email: z(p?.rechnung_mail),
    ustId: z(p?.ust_id),
    steuernummer: z(p?.steuernummer),
    handelsregister: z(p?.handelsregister),
  }
}

// Angaben aus dem Baukasten — ergänzt um das Konto-Profil, falls vorhanden.
// Das Profil gewinnt bei Name und Steuerdaten (danach wird im Baukasten
// nicht gefragt), das Formular bei Anschrift und Kontakt.
export function ausFormular(fd, profil) {
  const p = profil ? ausProfil(profil) : {}
  return {
    firma: z(fd?.firmenname) || p.firma || '',
    vorname: p.vorname || '',
    nachname: p.nachname || '',
    zusatz: p.zusatz || '',
    strasse: z(fd?.strasse) || p.strasse || '',
    plz: z(fd?.plz) || p.plz || '',
    ort: z(fd?.stadt) || p.ort || '',
    land: z(fd?.land) || p.land || '',
    telefon: z(fd?.telefon) || p.telefon || '',
    email: z(fd?.email) || p.email || '',
    ustId: p.ustId || '',
    steuernummer: p.steuernummer || '',
    handelsregister: p.handelsregister || '',
  }
}

const P = (was) => `[ ${was} ergänzen ]`

export function impressumText(d = {}) {
  const name = [d.vorname, d.nachname].filter(Boolean).join(' ')
  const verantwortlich = name || P('Vor- und Nachname')
  const zeilen = [
    d.firma || verantwortlich,
    d.firma && name ? `Inhaber: ${name}` : (d.firma && !name ? `Inhaber: ${P('Vor- und Nachname')}` : null),
    d.zusatz || null,
    d.strasse || P('Straße und Hausnummer'),
    `${d.plz || P('PLZ')} ${d.ort || P('Ort')}${d.land && d.land !== 'Deutschland' ? ', ' + d.land : ''}`,
    '',
    'Kontakt:',
    d.telefon ? `Telefon: ${d.telefon}` : `Telefon: ${P('Telefonnummer')}`,
    `E-Mail: ${d.email || P('E-Mail-Adresse')}`,
    '',
    d.handelsregister ? `Registereintrag: ${d.handelsregister}` : null,
    d.ustId ? `Umsatzsteuer-ID gemäß § 27 a Umsatzsteuergesetz: ${d.ustId}` : null,
    d.steuernummer && !d.ustId ? `Steuernummer: ${d.steuernummer}` : null,
    (d.ustId || d.steuernummer || d.handelsregister) ? '' : null,
    'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:',
    verantwortlich,
    '(Anschrift wie oben)',
    '',
    'Streitschlichtung:',
    'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:',
    'https://ec.europa.eu/consumers/odr/',
    'Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle',
    'sind wir nicht verpflichtet und nicht bereit.',
  ]
  return zeilen.filter(l => l !== null).join('\n')
}

export function datenschutzText(d = {}) {
  const verantwortlich = d.firma || [d.vorname, d.nachname].filter(Boolean).join(' ') || P('Name oder Firma')
  const anschrift = `${d.strasse || P('Straße')}, ${d.plz || P('PLZ')} ${d.ort || P('Ort')}`
  return [
    '1. Verantwortlicher',
    `${verantwortlich}, ${anschrift}`,
    `E-Mail: ${d.email || P('E-Mail-Adresse')}`,
    '',
    '2. Hosting',
    'Diese Website wird bei einem Hosting-Anbieter in Deutschland bzw. der EU betrieben. Beim Aufruf',
    'werden automatisch Server-Logdaten (u. a. IP-Adresse, Datum, Uhrzeit, aufgerufene Seite)',
    'verarbeitet, um den Betrieb sicherzustellen (Art. 6 Abs. 1 lit. f DSGVO).',
    '',
    '3. Kontaktformular',
    'Wenn Sie uns über das Kontaktformular schreiben, verarbeiten wir Ihre Angaben zur Bearbeitung der',
    'Anfrage (Art. 6 Abs. 1 lit. b DSGVO). Die Daten werden gelöscht, sobald die Anfrage abschließend',
    'bearbeitet ist und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.',
    '',
    '4. Schriftarten',
    'Schriftarten werden lokal von diesem Server ausgeliefert. Es findet keine Verbindung zu Google',
    'Fonts oder anderen externen Anbietern statt.',
    '',
    '5. Cookies',
    'Diese Website verwendet nur technisch notwendige Cookies. Cookies für Statistik oder Werbung',
    'werden nicht ohne vorherige Einwilligung gesetzt.',
    '',
    '6. Kartendienst (OpenStreetMap)',
    'Sofern auf dieser Website eine Anfahrtskarte eingebunden ist, wird sie erst nach Ihrem',
    'ausdrücklichen Klick geladen (Zwei-Klick-Lösung). Erst dann werden Daten (u. a. Ihre IP-Adresse)',
    'an die OpenStreetMap Foundation übertragen (Art. 6 Abs. 1 lit. a DSGVO).',
    '',
    '7. Ihre Rechte',
    'Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,',
    'Datenübertragbarkeit und Widerspruch. Wenden Sie sich dazu an die oben genannte E-Mail-Adresse.',
    'Außerdem besteht ein Beschwerderecht bei der zuständigen Datenschutz-Aufsichtsbehörde.',
  ].join('\n')
}
