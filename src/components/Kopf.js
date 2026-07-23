'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { aktuellerNutzer } from '@/lib/projekte'

export const D = {
  dunkel: '#0A1824',
  dunkel2: '#122539',
  paper: '#F6F8FC',
  weiss: '#FFFFFF',
  blau: '#1D4ED8',
  blauHell: '#3B6BF5',
  blauZart: '#EAF0FF',
  grau: '#57657E',
  grauHell: '#8493AC',
  linie: '#E2E8F3',
  gruen: '#15803D',
  gruenZart: '#EBF8F0',
}

export const BASIS_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:${D.paper}}
.display{font-family:'Archivo',system-ui,sans-serif;font-weight:800;letter-spacing:-0.035em;line-height:1.05}
.leicht{font-weight:500}
.eyebrow{font-family:'Archivo',sans-serif;font-size:10.5px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase}
.wrap{max-width:1140px;margin:0 auto;padding:0 22px}
.karte{background:${D.weiss};border:1px solid ${D.linie};border-radius:16px}
.karte-hover{transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}
.karte-hover:hover{transform:translateY(-3px);box-shadow:0 14px 38px rgba(10,24,36,.10);border-color:${D.blau}}
button{font-family:inherit}
input,select,textarea{font-family:inherit}
a{color:inherit;text-decoration:none}
.link-u:hover{text-decoration:underline}
:focus-visible{outline:2px solid ${D.blau};outline-offset:2px}

/* Navigation */
.navroot{position:relative}
.navtrigger{display:flex;align-items:center;gap:5px;font-size:14px;font-weight:600;color:${D.grau};background:none;border:none;cursor:pointer;padding:8px 2px;transition:color .15s}
.navroot:hover .navtrigger{color:${D.dunkel}}
.navdrop{position:absolute;top:100%;left:-14px;min-width:264px;background:${D.weiss};border:1px solid ${D.linie};border-radius:14px;box-shadow:0 18px 46px rgba(10,24,36,.14);padding:9px;opacity:0;visibility:hidden;transform:translateY(6px);transition:all .16s ease;z-index:80}
.navroot:hover .navdrop{opacity:1;visibility:visible;transform:translateY(0)}
.navitem{display:block;padding:9px 11px;border-radius:9px;font-size:13.5px;font-weight:600;color:${D.dunkel};transition:background .13s}
.navitem:hover{background:${D.blauZart};color:${D.blau}}
.navitem span{display:block;font-size:11.5px;font-weight:500;color:${D.grauHell};margin-top:2px}
.navitem:hover span{color:${D.blau}}
.navgroup{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${D.grauHell};padding:9px 11px 5px}

.btnfest{background:${D.blau};color:#fff;border:none;border-radius:10px;padding:10px 17px;font-size:13.5px;font-weight:700;cursor:pointer;transition:background .15s,transform .15s}
.btnfest:hover{background:${D.blauHell};transform:translateY(-1px)}
.btnleer{background:transparent;color:${D.dunkel};border:1px solid ${D.linie};border-radius:10px;padding:10px 15px;font-size:13.5px;font-weight:700;cursor:pointer;transition:border-color .15s,color .15s}
.btnleer:hover{border-color:${D.blau};color:${D.blau}}
.btnhell{background:#fff;color:${D.dunkel};border:none;border-radius:10px;padding:13px 24px;font-size:14.5px;font-weight:800;cursor:pointer;transition:transform .15s}
.btnhell:hover{transform:translateY(-2px)}

@media (max-width:900px){.navmitte{display:none}}
@media (max-width:760px){.spalten3{grid-template-columns:1fr !important}.spalten2{grid-template-columns:1fr !important}}
@media (prefers-reduced-motion:reduce){*{transition:none !important;animation:none !important}}
`

const MENUE = [
  {
    titel: 'Produkt',
    gruppen: [{
      name: 'Überblick',
      punkte: [
        ['/#ablauf', 'So funktioniert es', 'Von den Angaben bis zur fertigen Seite'],
        ['/#branchen', 'Branchen', 'Zehn Branchen mit passenden Inhalten'],
        ['/#editor', 'Editor', 'Texte, Farben und Bilder selbst ändern'],
        ['/#domain', 'Domain prüfen', 'Sofort sehen, was frei ist'],
      ],
    }],
  },
  {
    titel: 'Preise',
    gruppen: [{
      name: 'Kaufen oder mieten',
      punkte: [
        ['/preise', 'Alle Preise', 'Kauf, Miete und Einzelposten'],
        ['/#kaufen', 'Website kaufen', 'Ab 89 € einmalig, gehört dir'],
        ['/#mieten', 'Website mieten', 'Ab 19,90 € im Monat, alles inklusive'],
      ],
    }],
  },
  {
    titel: 'Hilfe',
    gruppen: [{
      name: 'Fragen & Rechtliches',
      punkte: [
        ['/#fragen', 'Häufige Fragen', 'Kosten, Ablauf, Eigentum'],
        ['/agb', 'AGB', 'Vertragsbedingungen'],
        ['/datenschutz', 'Datenschutz', 'Welche Daten wir verarbeiten'],
        ['/impressum', 'Impressum', 'Anbieterkennzeichnung'],
      ],
    }],
  },
]

export function Kopf({ aktiv = '' }) {
  const router = useRouter()
  const [nutzer, setNutzer] = useState(null)
  useEffect(() => { aktuellerNutzer().then(setNutzer).catch(() => {}) }, [])

  return (
    <header style={{ background: D.weiss, borderBottom: `1px solid ${D.linie}`, position: 'sticky', top: 0, zIndex: 70 }}>
      <div className="wrap" style={{ height: 66, display: 'flex', alignItems: 'center', gap: 24 }}>
        <a href="/" className="display" style={{ fontSize: 17.5, letterSpacing: '-0.045em', whiteSpace: 'nowrap' }}>
          websitegenerator<span style={{ color: D.blau }}>24</span>
        </a>

        <nav className="navmitte" style={{ display: 'flex', gap: 18, marginLeft: 6 }}>
          {MENUE.map(m => (
            <div key={m.titel} className="navroot">
              <button className="navtrigger" style={aktiv === m.titel ? { color: D.dunkel } : undefined}>
                {m.titel}
                <span aria-hidden="true" style={{ fontSize: 9, opacity: .6 }}>▾</span>
              </button>
              <div className="navdrop">
                {m.gruppen.map(g => (
                  <div key={g.name}>
                    <div className="navgroup">{g.name}</div>
                    {g.punkte.map(([href, t, u]) => (
                      <a key={href} className="navitem" href={href}>{t}<span>{u}</span></a>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {nutzer ? (
          <>
            <button className="btnleer" onClick={() => router.push('/dashboard')}>Meine Websites</button>
            <button className="btnfest" onClick={() => router.push('/start')}>Neue Website</button>
          </>
        ) : (
          <>
            <button className="btnleer" onClick={() => router.push('/login')}>Anmelden</button>
            <button className="btnfest" onClick={() => router.push('/start')}>Website erstellen</button>
          </>
        )}
      </div>
    </header>
  )
}
