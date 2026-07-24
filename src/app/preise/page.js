'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Kopf, D, BASIS_CSS, CI } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'
import { Chat } from '@/components/Chat'
import { KAUF, MIETE, ZUSATZ, MIETE_BEDINGUNGEN, eur } from '@/lib/preise'

export default function PreiseSeite() {
  const router = useRouter()
  const [modus, setModus] = useState('kaufen')
  const liste = modus === 'kaufen' ? KAUF : MIETE

  return (
    <div style={{ background: '#fff', color: D.text, fontFamily: '"InterTight",system-ui,sans-serif', minHeight: '100vh' }}>
      <link href="/schrift/schrift.css" rel="stylesheet" />
      <link href="/fa/css/all.min.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + `
        .tabelle{width:100%;border-collapse:collapse;font-size:14px}
        .tabelle th{text-align:left;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${D.grauHell};padding:12px 14px;border-bottom:1px solid ${D.linie};font-weight:700}
        .tabelle td{padding:14px;border-bottom:1px solid ${D.linie};color:#41506B;vertical-align:top}
        .tabelle tr:last-child td{border-bottom:none}
        .tabelle tr:hover td{background:${D.blauZart}}
      ` }} />
      <Kopf aktiv="Preise" />

      <section className="band band-foto dunkelzone" style={{ padding: '62px 0 66px', backgroundImage: "url(/bilder/hero-buero.webp)" }}>
        <div className="wrap" style={{ position: 'relative' }}>
          <a href="/" style={{ fontSize: 13, color: '#9FB2C0', display: 'inline-block', marginBottom: 18 }} className="link-u">← Zurück zur Startseite</a>
          <p className="eyebrow" style={{ color: '#6FC3EF', marginBottom: 14 }}>Preise</p>
          <h1 className="t1" style={{ color: '#fff', marginBottom: 18 }}>Alles, was es<br /><b>kostet.</b></h1>
          <p style={{ fontSize: 16.5, color: '#C7D6E0', maxWidth: 660, lineHeight: 1.75 }}>
            <strong style={{ color: '#fff' }}>Die Erstellung ist immer kostenlos</strong> — du siehst deine Website,
            bevor du zahlst. Danach entscheidest du: mieten und online gehen (Domain, Hosting und E-Mail inklusive)
            oder einmalig kaufen und alle Dateien mitnehmen. Alle Beträge inklusive 19 % Mehrwertsteuer.
          </p>
        </div>
      </section>

      <section style={{ padding: '48px 0 24px' }}>
        <div className="wrap">
          <div style={{ display: 'inline-flex', background: '#fff', border: `1px solid ${D.linie}`, borderRadius: 11, padding: 4, marginBottom: 28 }}>
            {[['kaufen', 'Kaufen · einmalig'], ['mieten', 'Mieten · monatlich']].map(([id, t]) => (
              <button key={id} onClick={() => setModus(id)} style={{
                border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                background: modus === id ? D.blau : 'transparent', color: modus === id ? '#fff' : D.textMatt, transition: 'all .15s',
              }}>{t}</button>
            ))}
          </div>

          <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, alignItems: 'stretch' }}>
            {liste.map(p => (
              <div key={p.id} className="karte karte-hover" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', position: 'relative', borderColor: p.beliebt ? D.blau : D.linie, borderWidth: p.beliebt ? 2 : 1 }}>
                {p.beliebt && <span className="display" style={{ position: 'absolute', top: -11, left: 22, background: D.blau, color: '#fff', fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 11px', borderRadius: 99 }}>Meist gewählt</span>}
                <h2 className="display" style={{ fontSize: 21, marginBottom: 4 }}>{p.name}</h2>
                <p style={{ fontSize: 13, color: D.textMatt, marginBottom: 18 }}>{p.kurz}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span className="display" style={{ fontSize: 44 }}>{eur(p.preis)}</span>
                  <span style={{ fontSize: 17, fontWeight: 700, color: D.textMatt }}>€</span>
                  <span style={{ fontSize: 12.5, color: D.grauHell, marginLeft: 4 }}>{modus === 'kaufen' ? 'einmalig' : '/ Monat'}</span>
                </div>
                <p style={{ fontSize: 11.5, color: D.textMatt, margin: '6px 0 18px' }}>
                  {modus === 'kaufen' ? 'inkl. MwSt. · Einmalzahlung' : `inkl. MwSt. · oder ${eur(p.jahr)} € im Jahr (10 statt 12 Monate)`}
                </p>
                {p.fuer && <p style={{ fontSize: 13, color: D.textMatt, fontStyle: 'italic', marginBottom: 16, lineHeight: 1.55 }}>Für: {p.fuer}</p>}
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24, flex: 1 }}>
                  {p.punkte.map(t => (
                    <li key={t} style={{ display: 'flex', gap: 9, fontSize: 14, color: D.text, lineHeight: 1.5 }}>
                      <span aria-hidden="true" style={{ color: D.blau, fontWeight: 800 }}>✓</span>{t}
                    </li>
                  ))}
                </ul>
                <button className={p.beliebt ? 'btnfest' : 'btnleer'} onClick={() => router.push('/start')} style={{ width: '100%', padding: 12 }}>Mit {p.name} starten</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vergleich */}
      <section style={{ padding: '32px 0' }}>
        <div className="wrap" style={{ maxWidth: 900 }}>
          <h2 className="display" style={{ fontSize: 26, marginBottom: 18 }}>Kaufen oder mieten?</h2>
          <div className="karte" style={{ overflow: 'hidden' }}>
            <table className="tabelle">
              <thead><tr><th>Was</th><th>Kaufen</th><th>Mieten</th></tr></thead>
              <tbody>
                {[
                  ['Zahlung', 'einmalig 89,00 – 199,00 € inkl. MwSt.', 'monatlich 19,90 – 39,90 € inkl. MwSt.'],
                  ['Laufzeit', 'keine', '12 Monate, danach monatlich kündbar'],
                  ['Dateien (ZIP)', 'ja, gehören dir', 'ja, jederzeit herunterladbar'],
                  ['Domain', 'bringst du selbst mit', 'inklusive (.de), läuft auf deinen Namen'],
                  ['Hosting & SSL', 'bringst du selbst mit', 'inklusive'],
                  ['E-Mail', 'selbst besorgen', 'Weiterleitung, ab Plus Postfach'],
                  ['Sicherungen', 'selbst', 'inklusive'],
                  ['Änderungen im Editor', 'ja', 'ja, dauerhaft'],
                  ['Einrichtung', 'entfällt', '49 € – entfällt bei Jahreszahlung'],
                ].map(r => <tr key={r[0]}><td style={{ fontWeight: 600, color: D.text }}>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Einzelposten */}
      <section id="zusatz" style={{ padding: '32px 0' }}>
        <div className="wrap" style={{ maxWidth: 900 }}>
          <h2 className="display" style={{ fontSize: 26, marginBottom: 8 }}>Domain, Hosting & Einzelposten</h2>
          <p style={{ fontSize: 14.5, color: D.textMatt, marginBottom: 18, lineHeight: 1.65 }}>
            Diese Posten kannst du einzeln dazubuchen. Bei den Mietpaketen sind Domain, Hosting und SSL schon enthalten.
          </p>
          <div className="karte" style={{ overflow: 'hidden' }}>
            <table className="tabelle">
              <thead><tr><th>Leistung</th><th>Preis</th><th>Hinweis</th></tr></thead>
              <tbody>
                {ZUSATZ.map(z => (
                  <tr key={z.name}><td style={{ fontWeight: 600, color: D.text }}>{z.name}</td><td style={{ whiteSpace: 'nowrap', fontWeight: 700 }}>{z.preis}</td><td style={{ color: D.textMatt }}>{z.hinweis}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Kündigung */}
      <section id="kuendigung" style={{ padding: '32px 0 70px' }}>
        <div className="wrap" style={{ maxWidth: 900 }}>
          <div className="karte" style={{ padding: '26px 24px' }}>
            <h2 className="display" style={{ fontSize: 22, marginBottom: 10 }}>Vertrag kündigen</h2>
            <p style={{ fontSize: 14.5, color: D.textMatt, lineHeight: 1.7, marginBottom: 16 }}>
              Mietverträge laufen zwölf Monate und sind danach monatlich kündbar. Du kündigst
              in deinem Kontobereich oder per E-Mail – ohne Begründung, ohne Anruf.
              Nach der Kündigung kannst du deine Website als ZIP herunterladen und die Domain
              zu einem anderen Anbieter mitnehmen. Der Kauf einer Website ist eine Einmalzahlung
              und muss nicht gekündigt werden.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="/dashboard" className="btnfest" style={{ display: 'inline-block' }}>Im Konto kündigen</a>
              <a href="mailto:info@websitegenerator24.de?subject=Kündigung%20websitegenerator24" className="btnleer" style={{ display: 'inline-block' }}>Per E-Mail kündigen</a>
            </div>
          </div>
        </div>
      </section>

      <Fuss />
      <Chat />
    </div>
  )
}
