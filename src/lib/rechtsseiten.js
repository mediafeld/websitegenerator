// ── Impressum & Datenschutz als echte Unterseiten der Website ───────────────
// Vollständig dynamisch:
//   Text vorhanden  → Unterseite existiert  UND  Link im Fußbereich
//   Text leer/weg   → Unterseite verschwindet UND Link im Fußbereich auch
//
// `texte` ist dabei IMMER die vollständige Wahrheit: was dort fehlt oder leer
// ist, wird entfernt. Aufrufer müssen also beide Felder mitgeben.
//
// Bewusst OHNE 'use client': wird im Browser (Kundenkonto) und serverseitig
// (/api/generate) benutzt.

export const RECHTS_SEITEN = [
  {
    seite: 'Impressum',
    feld: 'text_impressum',
    titel: 'Impressum',
    linkLabel: 'Impressum',
    datei: 'impressum.html',
    untertitel: 'Angaben gemäß den gesetzlichen Vorgaben.',
  },
  {
    seite: 'Datenschutz',
    feld: 'text_datenschutz',
    titel: 'Datenschutzerklärung',
    linkLabel: 'Datenschutz',
    datei: 'datenschutz.html',
    untertitel: 'Wie mit personenbezogenen Daten auf dieser Website umgegangen wird.',
  },
]

const kopie = (b) => (b ? JSON.parse(JSON.stringify(b)) : null)
const gleich = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)

// Hängt die Rechtsseiten ein, frischt sie auf ODER entfernt sie wieder —
// und hält die Links im Fußbereich aller Seiten passend dazu.
export function rechtsSeitenSync(pages, texte = {}) {
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
    const text = String(texte?.[def.feld] || '').trim()
    const alt = neu[def.seite]
    const vonUns = Array.isArray(alt) && alt.some(b => b?.type === 'rechtstext')

    // KEIN Text → Seite wieder entfernen (nur die, die wir angelegt haben)
    if (!text) {
      if (vonUns) { delete neu[def.seite]; geaendert = true }
      continue
    }

    if (vonUns) {
      // Seite existiert → nur den Text auffrischen, Gestaltung bleibt
      const schonDa = alt.some(b => b?.type === 'rechtstext' && String(b?.content?.text || '') === text)
      if (schonDa) continue
      neu[def.seite] = alt.map(b =>
        b?.type === 'rechtstext' ? { ...b, content: { ...(b.content || {}), text } } : b)
      geaendert = true
    } else if (Array.isArray(alt)) {
      // Gleichnamige Seite, die der Kunde selbst gebaut hat → nicht anfassen
      continue
    } else {
      neu[def.seite] = [
        ...(nav ? [kopie(nav)] : []),
        {
          type: 'rechtstext', variant: 'rt-schlicht',
          content: { tag: 'Rechtliches', title: def.titel, untertitel: def.untertitel, text },
        },
        ...(footer ? [kopie(footer)] : []),
      ]
      geaendert = true
    }
  }

  // ── Fußbereich: nur auf Seiten verlinken, die es wirklich gibt ───────────
  const links = RECHTS_SEITEN
    .filter(def => Array.isArray(neu[def.seite]))
    .map(def => ({ label: def.linkLabel, href: def.datei }))

  for (const name of Object.keys(neu)) {
    const bloecke = neu[name]
    if (!Array.isArray(bloecke)) continue
    if (!bloecke.some(b => b?.type === 'footer' && !gleich(b?.content?.rechtsLinks, links))) continue
    neu[name] = bloecke.map(b =>
      b?.type === 'footer' ? { ...b, content: { ...(b.content || {}), rechtsLinks: links } } : b)
    geaendert = true
  }

  return geaendert ? neu : pages
}

// Alter Name — bleibt als Weiterleitung bestehen, damit nichts bricht.
export const rechtsSeitenEinbauen = rechtsSeitenSync

// Welche Rechtsseiten hat diese Website gerade?
export function rechtsSeitenStand(pages) {
  const da = (name) => Array.isArray(pages?.[name])
    && pages[name].some(b => b?.type === 'rechtstext' && String(b?.content?.text || '').trim().length > 30)
  return { impressum: da('Impressum'), datenschutz: da('Datenschutz') }
}
