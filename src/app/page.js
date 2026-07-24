'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Kopf, D, BASIS_CSS } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'
import { FONT_LINK } from '@/components/Seite'
import { KAUF, MIETE, MIETE_BEDINGUNGEN } from '@/lib/preise'
import { BRANCHEN_INFO, BILD } from '@/lib/branchenSeite'
import { FRAGEN } from '@/lib/fragen'
import { Chat } from '@/components/Chat'

const SCHRITTE = [
  { nr: '01', dauer: 'ca. 10 Min.', t: 'Angaben machen', u: 'Branche wählen, Firmendaten eintragen, Stil festlegen. Acht kurze Schritte, keine Technik.' },
  { nr: '02', dauer: 'ca. 2 Min.', t: 'Website entsteht', u: 'Texte, Bilder und Aufbau werden für deine Branche erzeugt — aus deinen Angaben.' },
  { nr: '03', dauer: 'dauerhaft', t: 'Selbst anpassen', u: 'Im Editor alles ändern, so oft du willst. Ohne Zusatzkosten, ohne Anruf.' },
]

export default function Startseite() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [daten, setDaten] = useState(null)
  const [fehler, setFehler] = useState('')
  const [modus, setModus] = useState('kaufen')
  const [branche, setBranche] = useState(BRANCHEN_INFO[0])
  const eingabeRef = useRef(null)

  async function pruefen() {
    if (!name.trim()) { eingabeRef.current?.focus(); return }
    setLaedt(true); setFehler(''); setDaten(null)
    try {
      const res = await fetch('/api/domain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
      const json = await res.json()
      if (json.error) setFehler(json.error); else setDaten(json)
    } catch {
      setFehler('Die Domainprüfung ist gerade nicht erreichbar. Du kannst trotzdem starten und die Domain später wählen.')
    }
    setLaedt(false)
  }

  function starten(domain) {
    try { if (domain) sessionStorage.setItem('wg24_domain', domain) } catch {}
    router.push('/start')
  }

  const freie = daten?.ergebnisse?.filter(e => e.frei) || []
  const belegte = daten?.ergebnisse?.filter(e => !e.frei) || []
  const topFragen = FRAGEN.filter(q => q.top).slice(0, 6)

  return (
    <div style={{ background: D.paper, color: D.dunkel, fontFamily: '"Inter Tight",system-ui,sans-serif' }}>
      <link href="/schrift/schrift.css" rel="stylesheet" />
      <link href="/fa/css/all.min.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + CSS }} />
      <Kopf />

      {/* ══ HERO ══ */}
      <section id="domain" style={{ background: D.dunkel, color: '#fff', padding: '80px 0 72px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" className="glanz" />
        <div className="wrap" style={{ position: 'relative', maxWidth: 900, textAlign: 'center' }}>
          <p className="eyebrow" style={{ color: D.blauHell, marginBottom: 18 }}>Website-Baukasten mit KI · Berlin</p>
          <h1 className="display" style={{ fontSize: 'clamp(40px,7vw,82px)', marginBottom: 20 }}>
            Websiteerstellung<br /><span style={{ color: D.blauHell }}>kostenlos.</span>
          </h1>
          <p style={{ fontSize: 18, color: '#B7C4D9', lineHeight: 1.65, maxWidth: 600, margin: '0 auto 40px' }}>
            Erstellen kostet nichts — bezahlt wird erst, wenn deine Website online geht.
            Für Handwerk, Gastronomie, Praxen und Dienstleister: Angaben machen, Ergebnis ansehen,
            entscheiden. Miete ab 19,90 € im Monat inkl. MwSt., <strong style={{ color: '#fff' }}>Domain inklusive</strong> —
            oder einmalig kaufen ab 89 € inkl. MwSt.
          </p>

          <div style={{ maxWidth: 650, margin: '0 auto' }}>
            <div className="adresszeile" style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 14, padding: '9px 10px 9px 17px', boxShadow: '0 22px 54px rgba(0,0,0,.3)' }}>
              <span style={{ fontSize: 13, color: '#9AA6BC', whiteSpace: 'nowrap' }}>https://</span>
              <input ref={eingabeRef} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && pruefen()}
                placeholder="dein-firmenname" aria-label="Wunschname für die Domain"
                style={{ flex: 1, minWidth: 110, border: 'none', outline: 'none', fontSize: 17, fontWeight: 600, color: D.dunkel, background: 'transparent', padding: '8px 0' }} />
              {!name && <span className="caret" aria-hidden="true" />}
              <span style={{ fontSize: 15, fontWeight: 700, color: '#9AA6BC' }}>.de</span>
              <button className="btnfest" onClick={pruefen} disabled={laedt} style={{ padding: '11px 20px', whiteSpace: 'nowrap', opacity: laedt ? .6 : 1 }}>
                {laedt ? 'Prüft…' : 'Frei?'}
              </button>
            </div>
            <p style={{ fontSize: 12.5, color: '#8496AE', marginTop: 12 }}>Firmenname eingeben — wir prüfen live, welche Adresse noch frei ist.</p>
          </div>

          {fehler && <div className="hinweis-dunkel">{fehler}</div>}

          {daten && (
            <div style={{ maxWidth: 650, margin: '22px auto 0', textAlign: 'left' }}>
              {freie.map((e, i) => (
                <div key={e.domain} className="treffer" style={{ background: i === 0 ? '#123726' : '#132234', borderColor: i === 0 ? '#1F6B44' : '#2A3C53', flexWrap: 'wrap' }}>
                  <i className="fa-solid fa-circle-check" style={{ color: '#4ADE80', fontSize: 15 }} aria-hidden="true" />
                  <span style={{ flex: 1, minWidth: 150, fontSize: 16, fontWeight: 700, color: '#fff' }}>{e.domain}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#4ADE80', whiteSpace: 'nowrap' }}>
                    {e.sicher ? 'frei' : 'wahrscheinlich frei'}
                  </span>
                  <button className="btnfest" onClick={() => starten(e.domain)} style={{ padding: '10px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>
                    Diese nehmen<i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }} aria-hidden="true" />
                  </button>
                  <div style={{ flexBasis: '100%', display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>
                    <span style={{ fontSize: 12, color: '#4ADE80', background: 'rgba(74,222,128,.12)', border: '1px solid rgba(74,222,128,.3)', borderRadius: 99, padding: '3px 11px', fontWeight: 600 }}>
                      <i className="fa-solid fa-check" style={{ marginRight: 6 }} aria-hidden="true" />Bei Miete ab 19,90 €/Monat inklusive
                    </span>
                    <span style={{ fontSize: 12, color: '#8496AE' }}>
                      Beim Kauf bringst du Domain und Hosting selbst mit.
                      {!e.sicher && ' Diese Endung konnten wir nicht amtlich prüfen – wir bestätigen sie vor der Buchung.'}
                    </span>
                  </div>
                </div>
              ))}
              {belegte.length > 0 && <p style={{ fontSize: 12.5, color: '#8496AE', marginTop: 10 }}>Schon vergeben: {belegte.map(e => e.domain).join(' · ')}</p>}
              {freie.length === 0 && (
                <div style={{ padding: 16, borderRadius: 12, background: '#132234', border: '1px solid #2A3C53', fontSize: 13.5, color: '#B7C4D9', lineHeight: 1.6 }}>
                  Alle geprüften Adressen sind belegt. Probier einen Zusatz — den Ort oder die Leistung, etwa „mueller-sanitaer-berlin".
                  <div style={{ marginTop: 12 }}><button className="btnfest" onClick={() => starten(null)}>Ohne Domain starten</button></div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 22, justifyContent: 'center', flexWrap: 'wrap', marginTop: 42, fontSize: 13, color: '#8496AE' }}>
            {[['eye', 'Erstellen und ansehen kostet nichts'], ['globe', 'Domain bei Miete inklusive'], ['pen-to-square', 'Änderungen immer kostenlos']].map(([ic, t]) => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className={`fa-solid fa-${ic}`} style={{ color: D.blauHell }} aria-hidden="true" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABLAUF ══ */}
      <section style={{ background: D.weiss, borderBottom: `1px solid ${D.linie}`, padding: '72px 0' }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginBottom: 42 }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <p className="eyebrow" style={{ color: D.blau, marginBottom: 12 }}>Bereich 01 — Ablauf</p>
              <h2 className="display" style={{ fontSize: 'clamp(27px,3.8vw,40px)', marginBottom: 12 }}>
                Drei Schritte. <span className="leicht">Eine Sitzung.</span>
              </h2>
              <p style={{ fontSize: 15.5, color: D.grau, maxWidth: 520, lineHeight: 1.65 }}>
                Vom leeren Blatt zur fertigen Website — ohne Termin und ohne Warteschleife.
              </p>
            </div>
            <a href="/so-funktioniert-es" className="btnleer">Ablauf im Detail →</a>
          </div>

          <div className="ablauf">
            {SCHRITTE.map((s, i) => (
              <div key={s.nr} className="stufe">
                <div className="stufe-kopf">
                  <span className="stufe-nr">{s.nr}</span>
                  {i < SCHRITTE.length - 1 && <span className="stufe-linie" aria-hidden="true" />}
                </div>
                <span className="stufe-dauer">{s.dauer}</span>
                <h3 className="display" style={{ fontSize: 19, margin: '14px 0 8px', letterSpacing: '-.025em' }}>{s.t}</h3>
                <p style={{ fontSize: 14.5, color: D.grau, lineHeight: 1.68 }}>{s.u}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BILDSTREIFEN ══ */}
      <section style={{ padding: '0 0 8px', background: D.weiss }}>
        <div className="wrap" style={{ paddingTop: 0, paddingBottom: 60 }}>
          <div className="bildstreifen">
            {[
              ['photo-1573497019940-1c28c88b4f3e', 'Beratung am Telefon'],
              ['photo-1521737711867-e3b97375f902', 'Team im Gespräch'],
              ['photo-1600880292089-90a7e086ee0c', 'Zusammenarbeit im Büro'],
              ['photo-1556761175-b413da4baf72', 'Arbeit am Laptop'],
            ].map(([id, alt], i) => (
              <div key={id} className="bstreif" style={{ gridArea: `b${i + 1}` }}>
                <div className="bstreif-bild" role="img" aria-label={alt}
                  style={{ background: `#E6EBF4 center/cover url(${BILD(id, 800)})` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ VOLLE KONTROLLE ══ */}
      <section style={{ padding: '72px 0' }}>
        <div className="wrap">
          <p className="eyebrow" style={{ color: D.blau, marginBottom: 12 }}>Bereich 02 — Kontrolle</p>
          <h2 className="display" style={{ fontSize: 'clamp(27px,3.8vw,40px)', marginBottom: 12 }}>
            Änderungen kosten nichts. <span className="leicht">Nie.</span>
          </h2>
          <p style={{ fontSize: 15.5, color: D.grau, maxWidth: 660, marginBottom: 34, lineHeight: 1.68 }}>
            Bei einer Agentur kostet jede Textänderung Geld und Wartezeit. Hier änderst du selbst:
            neue Öffnungszeiten, neue Preise, neues Teamfoto — einloggen, anklicken, ändern.
            Das gilt beim Kauf genauso wie bei der Miete.
          </p>
          <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              ['euro-sign', 'Keine Stundensätze', 'Du zahlst nie für Textänderungen, neue Bilder oder zusätzliche Bereiche.'],
              ['bolt', 'Kein Warten', 'Keine E-Mail an die Agentur, keine Rückfrage, kein Termin. Änderung ist sofort live.'],
              ['key', 'Volle Kontrolle', 'Es ist deine Website. Du entscheidest, was drinsteht — und wann.'],
            ].map(([ic, t, u]) => (
              <div key={t} className="karte karte-hover ikarte" style={{ padding: '26px 24px' }}>
                <i className={`fa-solid fa-${ic}`} aria-hidden="true" />
                <h3 className="display" style={{ fontSize: 18.5, marginBottom: 8 }}>{t}</h3>
                <p style={{ fontSize: 14.2, color: D.grau, lineHeight: 1.68 }}>{u}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20 }}><a href="/editor-funktionen" className="btnleer">Alle Editor-Funktionen →</a></div>
        </div>
      </section>

      {/* ══ BRANCHEN ══ */}
      <section style={{ background: D.weiss, borderTop: `1px solid ${D.linie}`, borderBottom: `1px solid ${D.linie}`, padding: '72px 0' }}>
        <div className="wrap">
          <p className="eyebrow" style={{ color: D.blau, marginBottom: 12 }}>Bereich 03 — Branchen</p>
          <h2 className="display" style={{ fontSize: 'clamp(27px,3.8vw,40px)', marginBottom: 12 }}>
            Inhalte, die zur <span className="leicht">Branche passen.</span>
          </h2>
          <p style={{ fontSize: 15.5, color: D.grau, maxWidth: 640, marginBottom: 28, lineHeight: 1.68 }}>
            Ein Restaurant braucht eine Speisekarte, eine Kanzlei Rechtsgebiete, ein Handwerksbetrieb
            den Notdienst.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {BRANCHEN_INFO.map(b => (
              <button key={b.id} onClick={() => setBranche(b)} className="chip"
                style={branche.id === b.id ? { background: D.blau, color: '#fff', borderColor: D.blau } : undefined}>{b.label}</button>
            ))}
          </div>
          <div className="karte bkarte zweispalt" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', overflow: 'hidden' }}>
            <div style={{ padding: '30px 28px' }}>
              <h3 className="display" style={{ fontSize: 22, marginBottom: 12 }}>{branche.label}</h3>
              <p style={{ fontSize: 15, color: D.grau, lineHeight: 1.7, marginBottom: 20 }}>{branche.text}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                {branche.bereiche.map(t => (
                  <li key={t} style={{ display: 'flex', gap: 10, fontSize: 14.5, color: '#41506B' }}>
                    <span aria-hidden="true" style={{ color: D.blau, fontWeight: 800 }}>✓</span>{t}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btnfest" onClick={() => starten(null)}>Für {branche.label} starten</button>
                <a href="/branchen" className="btnleer">Alle Branchen</a>
              </div>
            </div>
            <div style={{ minHeight: 330, overflow: 'hidden' }}>
              <div className="bbild" role="img" aria-label={`Beispielbild ${branche.label}`}
                style={{ width: '100%', height: '100%', minHeight: 330, background: `#E6EBF4 center/cover url(${BILD(branche.bild)})` }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══ PREISE ══ */}
      <section style={{ padding: '72px 0' }}>
        <div className="wrap">
          <p className="eyebrow" style={{ color: D.blau, marginBottom: 12 }}>Bereich 04 — Preise</p>
          <h2 className="display" style={{ fontSize: 'clamp(27px,3.8vw,40px)', marginBottom: 12 }}>
            Kaufen oder <span className="leicht">mieten.</span>
          </h2>
          <p style={{ fontSize: 15.5, color: D.grau, maxWidth: 640, marginBottom: 26, lineHeight: 1.68 }}>
            Kaufen heißt: einmal zahlen, alle Dateien gehören dir. Mieten heißt: monatlich zahlen,
            Domain und Server laufen bei uns. Alle Preise inklusive 19 % Mehrwertsteuer.
          </p>

          <div className="umschalter">
            {[['kaufen', 'Kaufen · einmalig'], ['mieten', 'Mieten · monatlich']].map(([id, t]) => (
              <button key={id} onClick={() => setModus(id)} className={modus === id ? 'um-an' : 'um-aus'}>{t}</button>
            ))}
          </div>

          <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, alignItems: 'stretch' }}>
            {(modus === 'kaufen' ? KAUF : MIETE).map(p => (
              <div key={p.id} className="karte karte-hover" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', position: 'relative', borderColor: p.beliebt ? D.blau : D.linie, borderWidth: p.beliebt ? 2 : 1 }}>
                {p.beliebt && <span className="badge">Meist gewählt</span>}
                <h3 className="display" style={{ fontSize: 20, marginBottom: 4 }}>{p.name}</h3>
                <p style={{ fontSize: 13, color: D.grau, marginBottom: 18 }}>{p.kurz}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                  <span className="display" style={{ fontSize: 42 }}>{String(p.preis).replace('.', ',')}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: D.grau }}>€</span>
                  <span style={{ fontSize: 12.5, color: D.grauHell, marginLeft: 4 }}>{modus === 'kaufen' ? 'einmalig' : '/ Monat'}</span>
                </div>
                <p style={{ fontSize: 11.5, color: D.grauHell, margin: '6px 0 20px' }}>
                  inkl. 19 % MwSt.{modus === 'kaufen' ? ' · kein Abo' : ` · oder ${p.jahr} € im Jahr`}
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24, flex: 1 }}>
                  {p.punkte.map(t => (
                    <li key={t} style={{ display: 'flex', gap: 9, fontSize: 14, color: '#41506B', lineHeight: 1.5 }}>
                      <span aria-hidden="true" style={{ color: D.blau, fontWeight: 800 }}>✓</span>{t}
                    </li>
                  ))}
                </ul>
                <button className={p.beliebt ? 'btnfest' : 'btnleer'} onClick={() => starten(null)} style={{ width: '100%', padding: 12 }}>Mit {p.name} starten</button>
              </div>
            ))}
          </div>

          <div className="karte" style={{ marginTop: 20, padding: '18px 20px', display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
            <p style={{ fontSize: 13.5, color: D.grau, flex: 1, minWidth: 260, lineHeight: 1.65 }}>
              {modus === 'mieten'
                ? `${MIETE_BEDINGUNGEN.laufzeit}, ${MIETE_BEDINGUNGEN.danach}. Einrichtung ${MIETE_BEDINGUNGEN.einrichtung}. ${MIETE_BEDINGUNGEN.jahresvorteil}`
                : 'Einmalzahlung, kein Abo. Domain und Hosting kannst du dazubuchen oder selbst mitbringen.'}
            </p>
            <a href="/preise" className="btnleer">Alle Preise im Detail →</a>
          </div>
        </div>
      </section>

      {/* ══ VERTRAUEN ══ */}
      <section style={{ background: D.dunkel, color: '#fff', padding: '58px 0' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 30 }}>
          {[
            ['Telefonisch erreichbar', 'Kein Ticketsystem. Mo. bis Fr. von 9 bis 18 Uhr geht jemand ans Telefon.'],
            ['Deine Dateien, dein Eigentum', 'Kompletter Quellcode als ZIP. Kein Anbieterzwang, kein Umzugsproblem.'],
            ['Kein Abo im Kaufpreis', 'Beim Kauf zahlst du einmal. Monatliche Kosten nur bei Domain und Hosting.'],
            ['Ohne Cookie-Banner', 'Wir setzen kein Tracking ein — nur technisch notwendige Speicherung.'],
          ].map(([t, u]) => (
            <div key={t}>
              <h3 className="display" style={{ fontSize: 16.5, marginBottom: 8 }}>{t}</h3>
              <p style={{ fontSize: 13.5, color: '#98A8C0', lineHeight: 1.66 }}>{u}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FRAGEN ══ */}
      <section style={{ padding: '72px 0' }}>
        <div className="wrap" style={{ maxWidth: 800 }}>
          <p className="eyebrow" style={{ color: D.blau, marginBottom: 12 }}>Bereich 05 — Fragen</p>
          <h2 className="display" style={{ fontSize: 'clamp(27px,3.8vw,40px)', marginBottom: 12 }}>
            Häufige <span className="leicht">Fragen.</span>
          </h2>
          <p style={{ fontSize: 15.5, color: D.grau, marginBottom: 28, lineHeight: 1.65 }}>
            Die wichtigsten hier — alle weiteren in der <a className="link-u" href="/hilfe" style={{ color: D.blau, fontWeight: 600 }}>Hilfe</a>.
          </p>
          {topFragen.map(q => (
            <details key={q.f} className="karte frage" style={{ padding: '15px 18px', marginBottom: 9 }}>
              <summary style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15.5, fontWeight: 700 }}>
                <span style={{ flex: 1 }}>{q.f}</span>
                <span className="plus" aria-hidden="true" style={{ color: D.blau, fontSize: 19, fontWeight: 700, lineHeight: 1 }}>+</span>
              </summary>
              <p style={{ fontSize: 14.5, color: D.grau, lineHeight: 1.78, marginTop: 12 }}>{q.a}</p>
            </details>
          ))}
          <div style={{ marginTop: 16 }}><a href="/hilfe" className="btnleer">Alle Fragen &amp; Antworten →</a></div>
        </div>
      </section>

      {/* ══ ABSCHLUSS ══ */}
      <section style={{ padding: '4px 0 76px' }}>
        <div className="wrap">
          <div style={{ background: `linear-gradient(140deg,${D.dunkel},${D.blau})`, borderRadius: 18, padding: '52px 34px', textAlign: 'center' }}>
            <h2 className="display" style={{ fontSize: 'clamp(25px,3.6vw,36px)', color: '#fff', marginBottom: 12 }}>Schauen kostet nichts.</h2>
            <p style={{ fontSize: 15.5, color: '#D3DEF8', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.65 }}>
              Geh die Fragen durch und sieh dir das Ergebnis an. Bezahlt wird erst, wenn dir die Website gefällt.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btnhell" onClick={() => starten(null)}>Website erstellen</button>
              <a href="/preise" style={{ border: '1px solid rgba(255,255,255,.35)', color: '#fff', borderRadius: 10, padding: '13px 24px', fontSize: 14.5, fontWeight: 700 }}>Preise ansehen</a>
            </div>
          </div>
        </div>
      </section>

      <Fuss />
      <Chat />
    </div>
  )
}

const CSS = `
.glanz{position:absolute;inset:0;background:radial-gradient(900px 430px at 50% -8%, ${D.blau}44, transparent 70%)}
.caret{display:inline-block;width:2px;height:1.05em;background:${D.blau};vertical-align:-.16em;animation:blink 1.1s step-end infinite}
@keyframes blink{50%{opacity:0}}
.hinweis-dunkel{max-width:650px;margin:20px auto 0;padding:14px 16px;text-align:left;font-size:13.5px;color:#FDE68A;background:#1C2E44;border:1px solid #33465F;border-radius:12px;line-height:1.55}
.treffer{display:flex;align-items:center;gap:12px;padding:14px 16px;margin-bottom:8px;border-radius:12px;border:1px solid;transition:transform .16s}
.treffer:hover{transform:translateX(3px)}
.chip{background:#fff;border:1px solid ${D.linie};border-radius:99px;padding:9px 15px;font-size:13px;font-weight:600;color:${D.grau};cursor:pointer;transition:all .16s}
.chip:hover{border-color:${D.blau};color:${D.blau};transform:translateY(-1px)}
.bkarte{transition:box-shadow .2s}
.bbild{transition:transform .6s cubic-bezier(.2,.7,.3,1)}
.bkarte:hover .bbild{transform:scale(1.05)}
.frage summary{cursor:pointer;list-style:none}
.frage summary::-webkit-details-marker{display:none}
.frage{transition:border-color .16s,box-shadow .16s}
.frage:hover{border-color:${D.blau};box-shadow:0 6px 20px rgba(10,24,36,.07)}
.frage[open]{border-color:${D.blau}}
.frage[open] .plus{transform:rotate(45deg)}
.plus{transition:transform .2s;display:inline-block}
.ikarte i{font-size:20px;color:${D.blau};background:${D.blauZart};width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;transition:transform .22s cubic-bezier(.2,.7,.3,1),background .18s}
.ikarte:hover i{transform:scale(1.1) rotate(-6deg);background:${D.blau};color:#fff}
.badge{position:absolute;top:-11px;left:22px;background:${D.blau};color:#fff;font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:4px 11px;border-radius:99px}
.umschalter{display:inline-flex;background:${D.weiss};border:1px solid ${D.linie};border-radius:11px;padding:4px;margin-bottom:30px}
.um-an,.um-aus{border:none;border-radius:8px;padding:10px 19px;font-size:13.5px;font-weight:700;cursor:pointer;transition:all .16s}
.um-an{background:${D.blau};color:#fff}
.um-aus{background:transparent;color:${D.grau}}
.um-aus:hover{color:${D.dunkel}}

/* Ablauf-Stufen */
.ablauf{display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
.stufe{position:relative}
.stufe-kopf{display:flex;align-items:center;gap:12px;margin-bottom:4px}
.stufe-nr{width:48px;height:48px;flex-shrink:0;border-radius:14px;background:${D.blau};color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;letter-spacing:-.02em;box-shadow:0 8px 22px rgba(29,78,216,.28);transition:transform .22s cubic-bezier(.2,.7,.3,1)}
.stufe:hover .stufe-nr{transform:scale(1.08) rotate(-4deg)}
.stufe-linie{flex:1;height:2px;background:linear-gradient(90deg,${D.blau}55,${D.linie})}
.stufe-dauer{font-size:11.5px;font-weight:700;color:${D.blau};background:${D.blauZart};border-radius:99px;padding:3px 10px}
@media(max-width:860px){
  .ablauf{grid-template-columns:1fr}
  .stufe-linie{display:none}
  .zweispalt{grid-template-columns:1fr !important}
}
@media(max-width:760px){.adresszeile{flex-wrap:wrap}}
.bildstreifen{display:grid;grid-template-columns:1.4fr 1fr 1fr;grid-template-rows:150px 150px;gap:14px;grid-template-areas:'b1 b2 b3' 'b1 b4 b4'}
.bstreif{border-radius:16px;overflow:hidden}
.bstreif-bild{width:100%;height:100%;transition:transform .6s cubic-bezier(.2,.7,.3,1);filter:saturate(.95)}
.bstreif:hover .bstreif-bild{transform:scale(1.06);filter:saturate(1.05)}
@media(max-width:760px){.bildstreifen{grid-template-columns:1fr 1fr;grid-template-rows:130px 130px;grid-template-areas:'b1 b2' 'b3 b4'}}
`
