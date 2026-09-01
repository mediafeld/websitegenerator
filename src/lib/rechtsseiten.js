// ── Impressum & Datenschutz als echte Unterseiten der Website ───────────────
// Der Footer verlinkt seit jeher auf impressum.html und datenschutz.html —
// die Seiten gab es aber nie. Hier werden sie aus den im Kundenkonto
// gespeicherten Rechtstexten erzeugt und in das `pages`-Objekt eingehängt.
//
// Bewusst OHNE 'use client': wird sowohl im Browser (Kundenkonto) als auch
// serverseitig (/api/generate) benutzt.

export const RECHTS_SEITEN = [
  {
    seite: 'Impressum',
    feld: 'text_impressum',
    titel: 'Impressum',
    untertitel: 'Angaben gemäß den gesetzlichen Vorgaben.',
  },
  {
    seite: 'Datenschutz',
    feld: 'text_datenschutz',
    titel: 'Datenschutzerklärung',
    untertitel: 'Wie mit personenbezogenen Daten auf dieser Website umgegangen wird.',
  },
]

const kopie = (b) => (b ? JSON.parse(JSON.stringify(b)) : null)

// Hängt die Rechtsseiten in `pages` ein bzw. aktualisiert nur den Text, wenn
// die Seite schon existiert — gestalterische Änderungen bleiben so erhalten.
// texte = { text_impressum, text_datenschutz }
// Platzhalter: besser ein klar erkennbarer Hinweis als ein toter Link im
// Fußbereich (dort steht seit jeher „Impressum" und „Datenschutz").
const PLATZHALTER = {
  text_impressum: [
    '[ Dieser Text ist noch nicht ausgefüllt. ]',
    '',
    'Im Kundenkonto unter „Rechtstexte" lässt sich das Impressum aus den',
    'hinterlegten Angaben erzeugen — danach steht es automatisch hier.',
    '',
    'Ein Impressum ist für geschäftsmäßige Websites in Deutschland Pflicht.',
  ].join('\n'),
  text_datenschutz: [
    '[ Dieser Text ist noch nicht ausgefüllt. ]',
    '',
    'Im Kundenkonto unter „Rechtstexte" lässt sich die Datenschutzerklärung aus',
    'den hinterlegten Angaben erzeugen — danach steht sie automatisch hier.',
    '',
    'Eine Datenschutzerklärung ist nach DSGVO Pflicht.',
  ].join('\n'),
}

export function rechtsSeitenEinbauen(pages, texte, { platzhalter = false } = {}) {
  if (!pages || typeof pages !== 'object') return pages
  const namen = Object.keys(pages)
  if (!namen.length) return pages

  // Kopf und Fuß von der ersten Seite übernehmen → gleiches Design
  const quelle = Array.isArray(pages[namen[0]]) ? pages[namen[0]] : []
  const nav = quelle.find(b => b?.type === 'nav')
  const footer = quelle.find(b => b?.type === 'footer')

  const neu = { ...pages }
  let geaendert = false

  for (const def of RECHTS_SEITEN) {
    const text = String(texte?.[def.feld] || '').trim() || (platzhalter ? PLATZHALTER[def.feld] : '')
    if (!text) continue

    const istPlatzhalter = text === PLATZHALTER[def.feld]
    const vorhanden = neu[def.seite]
    if (Array.isArray(vorhanden) && vorhanden.some(b => b?.type === 'rechtstext')) {
      // Seite existiert → nur den Text auffrischen. Ein Platzhalter überschreibt
      // dabei NIEMALS einen bereits vorhandenen echten Text.
      if (istPlatzhalter) continue
      neu[def.seite] = vorhanden.map(b =>
        b?.type === 'rechtstext' ? { ...b, content: { ...(b.content || {}), text } } : b)
    } else {
      neu[def.seite] = [
        ...(nav ? [kopie(nav)] : []),
        {
          type: 'rechtstext', variant: 'rt-schlicht',
          content: { tag: 'Rechtliches', title: def.titel, untertitel: def.untertitel, text },
        },
        ...(footer ? [kopie(footer)] : []),
      ]
    }
    geaendert = true
  }

  return geaendert ? neu : pages
}

// Sind beide Rechtsseiten vorhanden und gefüllt?
export function rechtsSeitenStand(pages) {
  const da = (name) => Array.isArray(pages?.[name])
    && pages[name].some(b => b?.type === 'rechtstext' && String(b?.content?.text || '').trim().length > 30)
  return { impressum: da('Impressum'), datenschutz: da('Datenschutz') }
}
