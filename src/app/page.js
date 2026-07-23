'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { aktuellerNutzer } from '@/lib/projekte'

// ── Design-Token ──────────────────────────────────────────────
const T = {
  ink: '#0B1220',
  paper: '#F7F8FC',
  weiss: '#FFFFFF',
  blau: '#1D4ED8',
  blauTief: '#152C7A',
  blauZart: '#E8EEFF',
  grau: '#5B6880',
  linie: '#E3E8F2',
  gruen: '#15803D',
  gruenZart: '#EAF7EF',
}

const PAKETE = [
  { id: 'onepager', name: 'Onepager', preis: 89, seiten: '1 Seite', bilder: '6 KI-Bilder', punkte: ['Alle Inhalte auf einer Seite', 'Kontaktformular', 'Für Handwerk & Dienstleister'] },
  { id: 'multipage', name: 'Multipage', preis: 149, seiten: 'bis 5 Unterseiten', bilder: '8 KI-Bilder', punkte: ['Eigene Seiten für Leistungen', 'Menüführung', 'Galerie & Kundenstimmen'], beliebt: true },
  { id: 'business', name: 'Business', preis: 199, seiten: 'bis 8 Unterseiten', bilder: '12 KI-Bilder', punkte: ['Alles aus Multipage', 'Team- & Preisbereiche', 'Für größere Betriebe'] },
]

const SCHRITTE = [
  { titel: 'Angaben machen', text: 'Branche wählen, Firmendaten eintragen, Stil festlegen. Acht kurze Schritte, keine Technik.' },
  { titel: 'Website entsteht', text: 'Texte, Bilder und Aufbau werden für deine Branche erstellt – passend zu deinen Angaben.' },
  { titel: 'Anpassen & übernehmen', text: 'Im Editor Texte, Farben und Bilder ändern. Fertige Website herunterladen oder online stellen.' },
]

const FRAGEN = [
  { f: 'Brauche ich Vorkenntnisse?', a: 'Nein. Du beantwortest Fragen zu deinem Betrieb, alles andere passiert automatisch. Im Editor änderst du Texte durch Anklicken.' },
  { f: 'Was kostet die Domain?', a: 'Eine .de-Domain liegt bei 14,90 € pro Jahr. Du siehst den Preis vor der Buchung, und die Domain läuft auf deinen Namen.' },
  { f: 'Ist das ein Abo?', a: 'Der Website-Kauf ist eine Einmalzahlung – kein Abo, keine Kündigungsfrist. Monatliche Kosten entstehen nur, wenn du Hosting und Domain dazubuchst.' },
  { f: 'Kann ich eigene Bilder verwenden?', a: 'Ja, bis zu 20 Stück. Du kannst sie beschreiben, damit sie an der passenden Stelle landen. Zusätzlich werden Bilder für dich erzeugt.' },
  { f: 'Wem gehört die Website?', a: 'Dir. Du bekommst alle Dateien zum Herunterladen und kannst sie bei jedem Anbieter betreiben.' },
]

const CSS = `
        *{box-sizing:border-box;margin:0;padding:0}
        .display{font-family:'Archivo',system-ui,sans-serif;font-weight:800;letter-spacing:-0.03em;line-height:1.03}
        .eyebrow{font-family:'Archivo',sans-serif;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:${T.blau}}
        .wrap{max-width:1080px;margin:0 auto;padding:0 22px}
        .caret{display:inline-block;width:2px;height:1.05em;background:${T.blau};vertical-align:-0.16em;animation:blink 1.1s step-end infinite}
        @keyframes blink{50%{opacity:0}}
        .karte{background:${T.weiss};border:1px solid ${T.linie};border-radius:16px}
        button{font-family:inherit}
        input{font-family:inherit}
        .navlink{font-size:13.5px;font-weight:600;color:${T.grau};text-decoration:none}
        .navlink:hover{color:${T.ink}}
        details summary{cursor:pointer;list-style:none}
        details summary::-webkit-details-marker{display:none}
        :focus-visible{outline:2px solid ${T.blau};outline-offset:2px}
        @media (max-width:760px){
          .adresszeile{flex-wrap:wrap}
          .navmitte{display:none}
          .drei{grid-template-columns:1fr !important}
        }
        @media (prefers-reduced-motion:reduce){.caret{animation:none}}
      `

export default function Startseite() {
  const router = useRouter()
  const [nutzer, setNutzer] = useState(null)
  const [name, setName] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [daten, setDaten] = useState(null)
  const [fehler, setFehler] = useState('')
  const [offen, setOffen] = useState(null)
  const eingabeRef = useRef(null)

  useEffect(() => { aktuellerNutzer().then(setNutzer).catch(() => {}) }, [])

  async function pruefen() {
    if (!name.trim()) { eingabeRef.current?.focus(); return }
    setLaedt(true); setFehler(''); setDaten(null)
    try {
      const res = await fetch('/api/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const json = await res.json()
      if (json.error) setFehler(json.error)
      else setDaten(json)
    } catch {
      setFehler('Die Prüfung ist gerade nicht erreichbar. Du kannst trotzdem starten und die Domain später wählen.')
    }
    setLaedt(false)
  }

  function starten(domain) {
    try { if (domain) sessionStorage.setItem('wg24_domain', domain) } catch {}
    router.push('/start')
  }

  const freie = daten?.ergebnisse?.filter(e => e.frei) || []
  const belegte = daten?.ergebnisse?.filter(e => !e.frei) || []

  return (
    <div style={{ background: T.paper, minHeight: '100vh', color: T.ink, fontFamily: '"Inter Tight",system-ui,sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=Inter+Tight:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ── Navigation ── */}
      <header style={{ background: T.weiss, borderBottom: `1px solid ${T.linie}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="wrap" style={{ height: 64, display: 'flex', alignItems: 'center', gap: 26 }}>
          <span className="display" style={{ fontSize: 17, letterSpacing: '-0.04em' }}>
            websitegenerator<span style={{ color: T.blau }}>24</span>
          </span>
          <nav className="navmitte" style={{ display: 'flex', gap: 22, marginLeft: 8 }}>
            <a className="navlink" href="#ablauf">So funktioniert&apos;s</a>
            <a className="navlink" href="#preise">Preise</a>
            <a className="navlink" href="#fragen">Fragen</a>
          </nav>
          <div style={{ flex: 1 }} />
          {nutzer ? (
            <button onClick={() => router.push('/dashboard')} style={btnFest}>Meine Websites</button>
          ) : (
            <>
              <button onClick={() => router.push('/login')} style={btnLeer}>Anmelden</button>
              <button onClick={() => starten(null)} style={btnFest}>Website erstellen</button>
            </>
          )}
        </div>
      </header>

      {/* ── Hero mit Adressleiste ── */}
      <section style={{ padding: '76px 0 64px' }}>
        <div className="wrap" style={{ maxWidth: 820, textAlign: 'center' }}>
          <p className="eyebrow" style={{ marginBottom: 18 }}>Website-Baukasten · Betrieb in Berlin</p>
          <h1 className="display" style={{ fontSize: 'clamp(38px,6.4vw,68px)', marginBottom: 20 }}>
            In 10 Minuten zur<br />eigenen Website.
          </h1>
          <p style={{ fontSize: 17.5, color: T.grau, lineHeight: 1.65, maxWidth: 560, margin: '0 auto 38px' }}>
            Für Handwerk, Gastronomie, Praxen und Dienstleister. Du machst die Angaben,
            den Rest übernehmen wir – Texte, Bilder, Aufbau.
          </p>

          {/* Adressleiste = das Werkzeug selbst */}
          <div style={{ maxWidth: 620, margin: '0 auto' }}>
            <div className="karte adresszeile" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px 9px 16px', borderRadius: 14, boxShadow: '0 10px 34px rgba(11,18,32,0.07)' }}>
              <span style={{ fontSize: 13, color: '#9AA6BC', whiteSpace: 'nowrap' }}>https://</span>
              <input
                ref={eingabeRef}
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && pruefen()}
                placeholder="dein-firmenname"
                aria-label="Wunschname für die Domain"
                style={{ flex: 1, minWidth: 120, border: 'none', outline: 'none', fontSize: 17, fontWeight: 600, color: T.ink, background: 'transparent', padding: '8px 0' }}
              />
              {!name && <span className="caret" aria-hidden="true" />}
              <span style={{ fontSize: 15, fontWeight: 700, color: '#9AA6BC' }}>.de</span>
              <button onClick={pruefen} disabled={laedt} style={{ ...btnFest, padding: '11px 20px', opacity: laedt ? 0.6 : 1, whiteSpace: 'nowrap' }}>
                {laedt ? 'Prüft…' : 'Frei?'}
              </button>
            </div>
            <p style={{ fontSize: 12.5, color: '#8B97AE', marginTop: 12 }}>
              Firmenname eingeben – wir prüfen sofort, welche Adresse noch frei ist.
            </p>
          </div>

          {/* Ergebnis */}
          {fehler && (
            <div className="karte" style={{ maxWidth: 620, margin: '20px auto 0', padding: '14px 16px', textAlign: 'left', fontSize: 13.5, color: '#92400E', background: '#FFFBEB', borderColor: '#FDE68A', lineHeight: 1.55 }}>
              {fehler}
            </div>
          )}

          {daten && (
            <div style={{ maxWidth: 620, margin: '22px auto 0', textAlign: 'left' }}>
              {freie.map((e, i) => (
                <div key={e.domain} className="karte" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', marginBottom: 8, borderColor: i === 0 ? '#A7E3BC' : T.linie, background: i === 0 ? T.gruenZart : T.weiss }}>
                  <span aria-hidden="true" style={{ color: T.gruen, fontSize: 15, fontWeight: 800 }}>✓</span>
                  <span style={{ flex: 1, fontSize: 15.5, fontWeight: 700 }}>{e.domain}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.gruen, whiteSpace: 'nowrap' }}>
                    {e.preis ? `${e.preis.toFixed(2).replace('.', ',')} € / Jahr` : 'frei'}
                  </span>
                  <button onClick={() => starten(e.domain)} style={{ ...btnFest, padding: '9px 15px', fontSize: 12.5, whiteSpace: 'nowrap' }}>Diese nehmen</button>
                </div>
              ))}

              {belegte.length > 0 && (
                <p style={{ fontSize: 12.5, color: '#8B97AE', marginTop: 10, lineHeight: 1.6 }}>
                  Schon vergeben: {belegte.map(e => e.domain).join(' · ')}
                </p>
              )}

              {freie.length === 0 && (
                <div className="karte" style={{ padding: 16, fontSize: 13.5, color: T.grau, lineHeight: 1.6 }}>
                  Diese Adressen sind belegt. Probier einen Zusatz wie den Ort oder die Leistung –
                  zum Beispiel „müller-sanitär-berlin". Du kannst die Domain auch später wählen.
                  <div style={{ marginTop: 12 }}>
                    <button onClick={() => starten(null)} style={btnFest}>Ohne Domain starten</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Ablauf ── */}
      <section id="ablauf" style={{ background: T.weiss, borderTop: `1px solid ${T.linie}`, borderBottom: `1px solid ${T.linie}`, padding: '68px 0' }}>
        <div className="wrap">
          <p className="eyebrow" style={{ marginBottom: 12 }}>Ablauf</p>
          <h2 className="display" style={{ fontSize: 'clamp(26px,3.6vw,38px)', marginBottom: 40 }}>Drei Schritte, eine Sitzung.</h2>
          <div className="drei" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 26 }}>
            {SCHRITTE.map((s, i) => (
              <div key={s.titel}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span className="display" style={{ fontSize: 13, color: T.blau, background: T.blauZart, borderRadius: 8, padding: '4px 9px', letterSpacing: 0 }}>
                    Schritt {i + 1}
                  </span>
                  <span style={{ flex: 1, height: 1, background: T.linie }} />
                </div>
                <h3 className="display" style={{ fontSize: 18.5, marginBottom: 8, letterSpacing: '-0.02em' }}>{s.titel}</h3>
                <p style={{ fontSize: 14.5, color: T.grau, lineHeight: 1.65 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preise ── */}
      <section id="preise" style={{ padding: '68px 0' }}>
        <div className="wrap">
          <p className="eyebrow" style={{ marginBottom: 12 }}>Preise</p>
          <h2 className="display" style={{ fontSize: 'clamp(26px,3.6vw,38px)', marginBottom: 10 }}>Einmal zahlen, dauerhaft nutzen.</h2>
          <p style={{ fontSize: 15, color: T.grau, marginBottom: 34, maxWidth: 520, lineHeight: 1.6 }}>
            Alle Preise inklusive Mehrwertsteuer. Kein Abo. Domain und Hosting kannst du dazubuchen.
          </p>

          <div className="drei" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, alignItems: 'stretch' }}>
            {PAKETE.map(p => (
              <div key={p.id} className="karte" style={{ padding: '26px 24px', display: 'flex', flexDirection: 'column', position: 'relative', borderColor: p.beliebt ? T.blau : T.linie, borderWidth: p.beliebt ? 2 : 1 }}>
                {p.beliebt && (
                  <span className="display" style={{ position: 'absolute', top: -11, left: 22, background: T.blau, color: '#fff', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 99 }}>
                    Meist gewählt
                  </span>
                )}
                <h3 className="display" style={{ fontSize: 19, marginBottom: 4 }}>{p.name}</h3>
                <p style={{ fontSize: 13, color: T.grau, marginBottom: 16 }}>{p.seiten} · {p.bilder}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 20 }}>
                  <span className="display" style={{ fontSize: 40 }}>{p.preis}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.grau }}>€</span>
                  <span style={{ fontSize: 12.5, color: '#8B97AE', marginLeft: 4 }}>einmalig</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24, flex: 1 }}>
                  {p.punkte.map(t => (
                    <li key={t} style={{ display: 'flex', gap: 9, fontSize: 14, color: '#41506B', lineHeight: 1.5 }}>
                      <span aria-hidden="true" style={{ color: T.blau, fontWeight: 800 }}>✓</span>{t}
                    </li>
                  ))}
                </ul>
                <button onClick={() => starten(null)} style={p.beliebt ? { ...btnFest, width: '100%', padding: 12 } : btnLeerBreit}>Mit {p.name} starten</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vertrauen ── */}
      <section style={{ background: T.ink, color: '#fff', padding: '54px 0' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 30 }}>
          {[
            ['Server in Deutschland', 'Deine Daten und die fertige Website liegen bei deutschen Anbietern.'],
            ['Alle Dateien für dich', 'Du bekommst die komplette Website zum Herunterladen – kein Anbieterzwang.'],
            ['Kein Abo im Kaufpreis', 'Einmalzahlung. Monatliche Kosten nur, wenn du Hosting dazu nimmst.'],
          ].map(([t, u]) => (
            <div key={t}>
              <h3 className="display" style={{ fontSize: 16, marginBottom: 7 }}>{t}</h3>
              <p style={{ fontSize: 13.5, color: '#9FAAC2', lineHeight: 1.6 }}>{u}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Fragen ── */}
      <section id="fragen" style={{ padding: '68px 0' }}>
        <div className="wrap" style={{ maxWidth: 720 }}>
          <p className="eyebrow" style={{ marginBottom: 12 }}>Fragen</p>
          <h2 className="display" style={{ fontSize: 'clamp(26px,3.6vw,38px)', marginBottom: 30 }}>Häufig gefragt.</h2>
          {FRAGEN.map((q, i) => (
            <details key={q.f} className="karte" onToggle={e => setOffen(e.target.open ? i : null)} style={{ padding: '16px 18px', marginBottom: 9 }}>
              <summary style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15.5, fontWeight: 700 }}>
                <span style={{ flex: 1 }}>{q.f}</span>
                <span aria-hidden="true" style={{ color: T.blau, fontSize: 18, fontWeight: 700 }}>{offen === i ? '−' : '+'}</span>
              </summary>
              <p style={{ fontSize: 14.5, color: T.grau, lineHeight: 1.7, marginTop: 11 }}>{q.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Abschluss ── */}
      <section style={{ padding: '10px 0 74px' }}>
        <div className="wrap">
          <div className="karte" style={{ background: `linear-gradient(140deg,${T.blauTief},${T.blau})`, borderColor: 'transparent', padding: '46px 34px', textAlign: 'center' }}>
            <h2 className="display" style={{ fontSize: 'clamp(24px,3.4vw,34px)', color: '#fff', marginBottom: 12 }}>
              Schauen kostet nichts.
            </h2>
            <p style={{ fontSize: 15.5, color: '#D7E1FF', maxWidth: 440, margin: '0 auto 26px', lineHeight: 1.6 }}>
              Geh die Fragen durch und sieh dir das Ergebnis an. Bezahlt wird erst, wenn dir die Website gefällt.
            </p>
            <button onClick={() => starten(null)} style={{ background: '#fff', color: T.blauTief, border: 'none', borderRadius: 11, padding: '14px 28px', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
              Website erstellen
            </button>
          </div>
        </div>
      </section>

      {/* ── Fuß ── */}
      <footer style={{ borderTop: `1px solid ${T.linie}`, background: T.weiss, padding: '30px 0 40px' }}>
        <div className="wrap" style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="display" style={{ fontSize: 14 }}>websitegenerator<span style={{ color: T.blau }}>24</span></span>
          <span style={{ fontSize: 12.5, color: '#8B97AE' }}>mediafeld · Berlin</span>
          <div style={{ flex: 1 }} />
          <a className="navlink" href="/impressum">Impressum</a>
          <a className="navlink" href="/datenschutz">Datenschutz</a>
          <a className="navlink" href="/agb">AGB</a>
        </div>
      </footer>
    </div>
  )
}

const btnFest = { background: T.blau, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 17px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }
const btnLeer = { background: 'transparent', color: T.ink, border: `1px solid ${T.linie}`, borderRadius: 10, padding: '10px 15px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }
const btnLeerBreit = { ...btnLeer, width: '100%', padding: 12 }
