'use client'
import { D } from '@/components/Kopf'

const SPALTEN = [
  {
    titel: 'Produkt',
    links: [
      ['/#ablauf', 'So funktioniert es'],
      ['/#branchen', 'Branchen'],
      ['/#editor', 'Editor'],
      ['/#domain', 'Domain prüfen'],
      ['/start', 'Website erstellen'],
    ],
  },
  {
    titel: 'Preise',
    links: [
      ['/preise', 'Alle Preise'],
      ['/#kaufen', 'Website kaufen'],
      ['/#mieten', 'Website mieten'],
      ['/preise#zusatz', 'Domain & Hosting'],
      ['/#fragen', 'Häufige Fragen'],
    ],
  },
  {
    titel: 'Konto',
    links: [
      ['/login', 'Anmelden'],
      ['/login', 'Konto erstellen'],
      ['/dashboard', 'Meine Websites'],
      ['/preise#kuendigung', 'Vertrag kündigen'],
    ],
  },
  {
    titel: 'Rechtliches',
    links: [
      ['/impressum', 'Impressum'],
      ['/datenschutz', 'Datenschutz'],
      ['/agb', 'AGB'],
      ['/agb#widerruf', 'Widerruf'],
    ],
  },
]

export function Fuss() {
  return (
    <footer style={{ background: D.dunkel, color: '#fff', paddingTop: 54 }}>
      <div className="wrap">
        <div className="spalten2" style={{ display: 'grid', gridTemplateColumns: '1.3fr 2.6fr', gap: 40, paddingBottom: 42 }}>
          <div>
            <div className="display" style={{ fontSize: 18, marginBottom: 12 }}>
              websitegenerator<span style={{ color: D.blauHell }}>24</span>
            </div>
            <p style={{ fontSize: 13.5, color: '#93A3BC', lineHeight: 1.7, maxWidth: 280, marginBottom: 18 }}>
              Website-Baukasten mit KI für kleine Betriebe. Ein Angebot von mediafeld,
              Agentur für Kommunikation und Design aus Berlin.
            </p>
            <div style={{ fontSize: 13, color: '#93A3BC', lineHeight: 2 }}>
              <a className="link-u" href="tel:+493057702366">030 57 70 23 66</a><br />
              <a className="link-u" href="mailto:info@mediafeld.de">info@mediafeld.de</a><br />
              Mo. – Fr., 9 – 18 Uhr<br />
              <a className="link-u" href="https://www.mediafeld.de" target="_blank" rel="noopener noreferrer">mediafeld.de →</a>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 26 }}>
            {SPALTEN.map(s => (
              <div key={s.titel}>
                <h3 className="eyebrow" style={{ color: '#6E809C', marginBottom: 13 }}>{s.titel}</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {s.links.map(([href, t]) => (
                    <li key={href + t}>
                      <a href={href} style={{ fontSize: 13.5, color: '#C4CFE0' }} className="link-u">{t}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #1E3349', paddingTop: 20, paddingBottom: 30, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', fontSize: 12.5, color: '#75869F' }}>
          <span>© {new Date().getFullYear()} mediafeld · Berlin</span>
          <span style={{ color: '#3A4C66' }}>·</span>
          <span>Alle Preise inkl. 19 % MwSt.</span>
          <div style={{ flex: 1 }} />
          <a className="link-u" href="/impressum">Impressum</a>
          <a className="link-u" href="/datenschutz">Datenschutz</a>
          <a className="link-u" href="/agb">AGB</a>
        </div>
      </div>
    </footer>
  )
}
