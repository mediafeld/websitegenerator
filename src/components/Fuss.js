'use client'
import { D, CI, TELEFON, TELEFON_LINK, EMAIL } from '@/components/Kopf'

const SPALTEN = [
  { titel: 'Produkt', links: [
    ['/so-funktioniert-es', 'So funktioniert es'],
    ['/editor-funktionen', 'Der Editor'],
    ['/branchen', 'Branchen'],
    ['/#domain', 'Domain prüfen'],
    ['/start', 'Website erstellen'],
  ] },
  { titel: 'Preise', links: [
    ['/preise', 'Alle Preise'],
    ['/preise#kaufen', 'Website kaufen'],
    ['/preise#mieten', 'Website mieten'],
    ['/preise#zusatz', 'Domain & Hosting'],
    ['/preise#kuendigung', 'Kündigen'],
  ] },
  { titel: 'Konto', links: [
    ['/login', 'Anmelden'],
    ['/login', 'Konto erstellen'],
    ['/dashboard', 'Meine Websites'],
    ['/konto', 'Meine Daten'],
    ['/abrechnungen', 'Abrechnungen'],
  ] },
  { titel: 'Unternehmen', links: [
    ['/ueber-uns', 'Über uns'],
    ['/kontakt', 'Kontakt'],
    ['/hilfe', 'Hilfe & FAQ'],
  ] },
  { titel: 'Rechtliches', links: [
    ['/impressum', 'Impressum'],
    ['/datenschutz', 'Datenschutz'],
    ['/agb', 'AGB'],
    ['/agb#widerruf', 'Widerruf'],
  ] },
]

export function Fuss() {
  return (
    <footer className="dunkelzone" style={{ paddingTop: 54 }}>
      <div className="wrap">
        <div className="spalten2" style={{ display: 'grid', gridTemplateColumns: '1fr 2.7fr', gap: 40, paddingBottom: 42 }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.04em', marginBottom: 12 }}>
              websitegenerator<span style={{ color: CI.blau }}>24</span>
            </div>
            <p style={{ fontSize: 13.5, color: '#9FB2C0', lineHeight: 1.7, maxWidth: 290, marginBottom: 18 }}>
              Website-Baukasten mit KI für kleine Betriebe. Angaben machen, Website erhalten,
              selbst weiterpflegen — ohne laufende Kosten für Änderungen.
            </p>
            <div style={{ fontSize: 13, color: '#9FB2C0', lineHeight: 2 }}>
              <a className="link-u" href={TELEFON_LINK} style={{ fontWeight: 600, color: '#fff' }}>{TELEFON}</a><br />
              <a className="link-u" href={`mailto:${EMAIL}`}>{EMAIL}</a><br />
              Mo. – Fr., 9 – 18 Uhr<br />
              Berlin
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(128px,1fr))', gap: 22 }}>
            {SPALTEN.map(s => (
              <div key={s.titel}>
                <h3 className="eyebrow" style={{ color: '#7E93A3', marginBottom: 13 }}>{s.titel}</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {s.links.map(([href, t]) => (
                    <li key={href + t}><a href={href} style={{ fontSize: 13.5, color: '#C7D6E0' }} className="link-u">{t}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,.13)', paddingTop: 20, paddingBottom: 30, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', fontSize: 12.5, color: '#7E93A3' }}>
          <span>© {new Date().getFullYear()} websitegenerator24.de</span>
          <span style={{ color: 'rgba(255,255,255,.28)' }}>·</span>
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
