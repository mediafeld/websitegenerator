'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Kopf, D, BASIS_CSS } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'
import { Chat } from '@/components/Chat'
import { Reveal, Zaehler, Slider } from '@/components/Effekte'
import { KAUF, MIETE, SORGENFREI, MIETE_BEDINGUNGEN } from '@/lib/preise'
import { BRANCHEN_INFO, BILD } from '@/lib/branchenSeite'
import { FRAGEN } from '@/lib/fragen'

const SCHRITTE = [
  { nr: '01', dauer: '10 Min.', t: 'Angaben machen', u: 'Branche wählen, Firmendaten eintragen, Stil festlegen. Acht kurze Schritte, keine Technik.', ic: 'clipboard-list' },
  { nr: '02', dauer: '2 Min.', t: 'Website entsteht', u: 'Texte, Bilder und Aufbau werden für deine Branche erzeugt — aus deinen Angaben.', ic: 'wand-magic-sparkles' },
  { nr: '03', dauer: 'dauerhaft', t: 'Selbst anpassen', u: 'Im Editor alles ändern, so oft du willst. Ohne Zusatzkosten, ohne Anruf.', ic: 'sliders' },
]

export default function Startseite() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [daten, setDaten] = useState(null)
  const [fehler, setFehler] = useState('')
  const [modus, setModus] = useState('mieten')
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
      setFehler('Die Domainprüfung ist gerade nicht erreichbar. Du kannst trotzdem starten und die Domain später festlegen.')
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

  const folien = [
    <Folie key="a" ober="Websiteerstellung kostenlos" zeile1="Erst sehen." zeile2="Dann zahlen."
      text="Geh die Fragen durch und schau dir das Ergebnis an. Erst wenn dir die Website gefällt, entscheidest du — mieten oder kaufen."
      bild="/platzhalter/laptop.svg" alt="Website auf einem Laptop" starten={starten} />,
    <Folie key="b" ober="Mieten · ab 19,90 € inkl. MwSt." zeile1="Domain drin." zeile2="Sofort online."
      text="Wir übernehmen Domain, Server, SSL und E-Mail. Du kümmerst dich um nichts und änderst trotzdem jederzeit selbst."
      bild="/platzhalter/rakete.svg" alt="Rakete als Symbol für Start" starten={starten} knopf="Mieten ansehen" ziel="/preise#mieten" />,
    <Folie key="c" ober="Kaufen · ab 89 € inkl. MwSt." zeile1="ZIP laden." zeile2="Dir gehört alles."
      text="Kompletter Quellcode als HTML und CSS, sofort zum Herunterladen. Kein Abo, kein Anbieterzwang — betreibe sie, wo du willst."
      bild="/platzhalter/schild.svg" alt="Schild als Symbol für Eigentum" starten={starten} knopf="Kauf ansehen" ziel="/preise#kaufen" />,
  ]

  return (
    <div style={{ background: D.dunkel, color: D.text, fontFamily: '"Inter Tight",system-ui,sans-serif', overflowX: 'hidden' }}>
      <link href="/schrift/schrift.css" rel="stylesheet" />
      <link href="/fa/css/all.min.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + CSS }} />
      <Kopf />

      {/* ══════ HERO ══════ */}
      <section id="domain" style={{ position: 'relative', overflow: 'hidden', paddingTop: 62, paddingBottom: 66 }}>
        <div className="blase" style={{ width: 460, height: 460, background: D.magenta, top: -140, left: -110 }} aria-hidden="true" />
        <div className="blase" style={{ width: 400, height: 400, background: D.lila, top: 40, right: -120, animationDelay: '-5s' }} aria-hidden="true" />
        <div className="blase" style={{ width: 320, height: 320, background: D.tuerkis, bottom: -90, left: '38%', animationDelay: '-9s', opacity: .35 }} aria-hidden="true" />
        <div className="gitter" aria-hidden="true" />

        <div className="wrap" style={{ position: 'relative' }}>
          <Slider folien={folien} />

          {/* Domain-Leiste */}
          <Reveal verzug={120}>
            <div style={{ maxWidth: 700, margin: '48px auto 0' }}>
              <p className="eyebrow" style={{ color: D.tuerkis, textAlign: 'center', marginBottom: 13 }}>
                <i className="fa-solid fa-bolt" style={{ marginRight: 8 }} aria-hidden="true" />Ist dein Wunschname noch frei?
              </p>
              <div className="adresszeile">
                <span style={{ fontSize: 13, color: D.grauHell, whiteSpace: 'nowrap' }}>https://</span>
                <input ref={eingabeRef} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && pruefen()}
                  placeholder="dein-firmenname" aria-label="Wunschname für die Domain"
                  style={{ flex: 1, minWidth: 110, border: 'none', outline: 'none', fontSize: 18, fontWeight: 700, color: D.text, background: 'transparent', padding: '10px 0' }} />
                {!name && <span className="caret" aria-hidden="true" />}
                <span style={{ fontSize: 15, fontWeight: 700, color: D.grauHell }}>.de</span>
                <button className="btnfest" onClick={pruefen} disabled={laedt} style={{ padding: '12px 22px', whiteSpace: 'nowrap', opacity: laedt ? .6 : 1 }}>
                  {laedt ? 'Prüft…' : 'Prüfen'}
                </button>
              </div>
              <p style={{ fontSize: 12.5, color: D.grauHell, marginTop: 12, textAlign: 'center' }}>
                Amtliche Prüfung bei der Registrierungsstelle — kein Zwischenspeicher, keine Schätzung.
              </p>
            </div>
          </Reveal>

          {fehler && <div className="hinweis">{fehler}</div>}

          {daten && (
            <div style={{ maxWidth: 700, margin: '24px auto 0' }}>
              {freie.map((e, i) => (
                <div key={e.domain} className="treffer" style={{ borderColor: i === 0 ? D.tuerkis : D.linie }}>
                  <i className="fa-solid fa-circle-check" style={{ color: D.tuerkis, fontSize: 16 }} aria-hidden="true" />
                  <span style={{ flex: 1, minWidth: 150, fontSize: 17, fontWeight: 800, letterSpacing: '-.02em' }}>{e.domain}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: D.tuerkis, letterSpacing: '.08em', textTransform: 'uppercase' }}>frei</span>
                  <button className="btntuerkis" onClick={() => starten(e.domain)} style={{ padding: '11px 18px', fontSize: 13.5, whiteSpace: 'nowrap' }}>
                    Diese nehmen<i className="fa-solid fa-arrow-right" style={{ marginLeft: 9 }} aria-hidden="true" />
                  </button>
                  <div style={{ flexBasis: '100%', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', paddingTop: 6 }}>
                    <span className="marke-tuerkis"><i className="fa-solid fa-check" style={{ marginRight: 6 }} aria-hidden="true" />Bei Miete inklusive</span>
                    <span style={{ fontSize: 12.5, color: D.grauHell }}>Beim Kauf bringst du Domain und Hosting selbst mit.</span>
                  </div>
                </div>
              ))}
              {belegte.length > 0 && (
                <p style={{ fontSize: 12.5, color: D.grauHell, marginTop: 12 }}>
                  <i className="fa-solid fa-circle-xmark" style={{ marginRight: 8, color: '#FF6B8A' }} aria-hidden="true" />
                  Schon vergeben: {belegte.map(e => e.domain).join(' · ')}
                </p>
              )}
              {freie.length === 0 && (
                <div className="karte" style={{ padding: 20, fontSize: 14, color: D.textMatt, lineHeight: 1.7 }}>
                  Alle geprüften Adressen sind belegt. Probier einen Zusatz — den Ort oder die Leistung, etwa „mueller-sanitaer-berlin".
                  <div style={{ marginTop: 14 }}><button className="btnfest" onClick={() => starten(null)}>Ohne Domain starten</button></div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ══════ LAUFBAND ══════ */}
      <div className="laufband" aria-hidden="true">
        <div className="laufband-inhalt">
          {[0, 1].map(k => (
            <span key={k} style={{ display: 'flex', gap: 44 }}>
              {['Erstellung kostenlos', 'Domain inklusive', 'Kein Abo beim Kauf', 'Änderungen gratis', 'ZIP zum Mitnehmen',
                'Server in Deutschland', 'Ohne Cookie-Banner', 'Telefonisch erreichbar'].map(t => (
                <span key={t} style={{ color: D.textMatt }}>
                  <span className="neon" style={{ marginRight: 12, fontWeight: 900 }}>✦</span>{t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══════ ZAHLEN ══════ */}
      <section style={{ padding: '54px 0' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 26, textAlign: 'center' }}>
          {[[10, 'Minuten bis zur Website', ''], [10, 'Branchen mit eigenen Inhalten', ''], [15, 'Blocktypen im Editor', '+'], [0, 'Euro für Änderungen', '']].map(([z, t, s], i) => (
            <Reveal key={t} verzug={i * 90}>
              <div className="display neon" style={{ fontSize: 'clamp(40px,5.4vw,62px)' }}>
                <Zaehler bis={z} suffix={s} />
              </div>
              <p style={{ fontSize: 13.5, color: D.textMatt, marginTop: 6 }}>{t}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════ ABLAUF ══════ */}
      <section style={{ padding: '58px 0', position: 'relative' }}>
        <div className="wrap">
          <Reveal>
            <p className="eyebrow neon" style={{ marginBottom: 14 }}>01 — Ablauf</p>
            <h2 className="display" style={{ fontSize: 'clamp(32px,5.4vw,58px)', marginBottom: 14 }}>
              Drei Schritte.<br /><span className="leicht">Eine Sitzung.</span>
            </h2>
            <p style={{ fontSize: 16, color: D.textMatt, maxWidth: 560, marginBottom: 40, lineHeight: 1.7 }}>
              Vom leeren Blatt zur fertigen Website — ohne Termin und ohne Warteschleife.
            </p>
          </Reveal>
          <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {SCHRITTE.map((s, i) => (
              <Reveal key={s.nr} verzug={i * 120}>
                <div className="karte karte-hover stufe" style={{ padding: '28px 26px', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span className="stufe-ic"><i className={`fa-solid fa-${s.ic}`} aria-hidden="true" /></span>
                    <span className="display neon" style={{ fontSize: 34, opacity: .85 }}>{s.nr}</span>
                  </div>
                  <span className="marke-tuerkis" style={{ marginBottom: 12, display: 'inline-block' }}>{s.dauer}</span>
                  <h3 className="display" style={{ fontSize: 21, marginBottom: 10 }}>{s.t}</h3>
                  <p style={{ fontSize: 14.5, color: D.textMatt, lineHeight: 1.72 }}>{s.u}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal verzug={200}><div style={{ marginTop: 24 }}><a href="/so-funktioniert-es" className="btnleer">Ablauf im Detail <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }} aria-hidden="true" /></a></div></Reveal>
        </div>
      </section>

      {/* ══════ PREISE ══════ */}
      <section id="preise" style={{ padding: '58px 0 66px', position: 'relative', overflow: 'hidden' }}>
        <div className="blase" style={{ width: 420, height: 420, background: D.lila, top: 120, left: -160, opacity: .3 }} aria-hidden="true" />
        <div className="wrap" style={{ position: 'relative' }}>
          <Reveal>
            <p className="eyebrow neon" style={{ marginBottom: 14 }}>02 — Preise</p>
            <h2 className="display" style={{ fontSize: 'clamp(32px,5.4vw,58px)', marginBottom: 14 }}>
              Mieten oder <span className="leicht">kaufen.</span>
            </h2>
            <p style={{ fontSize: 16, color: D.textMatt, maxWidth: 620, marginBottom: 28, lineHeight: 1.7 }}>
              Die Erstellung ist immer kostenlos. Danach entscheidest du:
              <strong style={{ color: D.text }}> mieten und sofort online</strong> mit Domain, Hosting und E-Mail —
              oder <strong style={{ color: D.text }}>einmalig kaufen</strong> und das ZIP herunterladen.
            </p>

            <div className="umschalter">
              {[['mieten', 'globe', 'Mieten · monatlich'], ['kaufen', 'download', 'Kaufen · einmalig']].map(([id, ic, t]) => (
                <button key={id} onClick={() => setModus(id)} className={modus === id ? 'um-an' : 'um-aus'}>
                  <i className={`fa-solid fa-${ic}`} style={{ marginRight: 9 }} aria-hidden="true" />{t}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22, alignItems: 'stretch' }}>
            {(modus === 'mieten' ? MIETE : KAUF).map((p, i) => (
              <Reveal key={p.id} verzug={i * 110}>
                <div className={`karte karte-hover preis ${p.beliebt ? 'preis-top' : ''}`}>
                  {p.beliebt && <span className="eckband">TOP</span>}
                  <h3 className="display" style={{ fontSize: 22, marginBottom: 5 }}>{p.name}</h3>
                  <p style={{ fontSize: 13, color: D.grauHell, marginBottom: 22 }}>{p.kurz}</p>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: D.textMatt, marginTop: 14 }}>ab</span>
                    <span className="display neon" style={{ fontSize: 'clamp(46px,6vw,64px)' }}>{String(p.preis).replace('.', ',')}</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: D.textMatt, marginTop: 10 }}>€</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: D.grauHell, margin: '2px 0 22px' }}>
                    inkl. 19 % MwSt. · {modus === 'mieten' ? `pro Monat, oder ${p.jahr} € im Jahr` : 'einmalig, kein Abo'}
                  </p>
                  <ul className="pliste">
                    {p.punkte.map(t => (
                      <li key={t}><i className="fa-solid fa-check" aria-hidden="true" />{t}</li>
                    ))}
                  </ul>
                  <button className={p.beliebt ? 'btnfest' : 'btnleer'} onClick={() => starten(null)} style={{ width: '100%', padding: 14, marginTop: 22, fontSize: 14.5 }}>
                    {modus === 'mieten' ? 'Jetzt mieten' : 'Jetzt kaufen'}
                  </button>
                  <p style={{ fontSize: 11.5, color: D.grauHell, textAlign: 'center', marginTop: 10 }}>
                    Erstellung kostenlos — Zahlung erst am Ende
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Keine-Sorgen-Paket */}
          <Reveal verzug={140}>
            <div id="sorgenfrei" className="sorgenfrei">
              <div className="sorgen-glanz" aria-hidden="true" />
              <div className="sorgen-innen">
                <div style={{ flex: '1 1 320px' }}>
                  <span className="marke-gold"><i className="fa-solid fa-crown" style={{ marginRight: 8 }} aria-hidden="true" />Rundum betreut</span>
                  <h3 className="display" style={{ fontSize: 'clamp(28px,4vw,42px)', margin: '16px 0 12px' }}>
                    Keine-Sorgen-<span className="neon">Paket</span>
                  </h3>
                  <p style={{ fontSize: 15.5, color: D.textMatt, lineHeight: 1.72, marginBottom: 22, maxWidth: 460 }}>
                    {SORGENFREI.kurz}. Für alle, die sich um gar nichts kümmern wollen —
                    wir übernehmen auch die Änderungen für dich.
                  </p>
                  <ul className="pliste zweispaltig">
                    {SORGENFREI.punkte.map(t => <li key={t}><i className="fa-solid fa-check" aria-hidden="true" />{t}</li>)}
                  </ul>
                </div>
                <div className="sorgen-preis">
                  <img src="/platzhalter/formen.svg" alt="" aria-hidden="true" style={{ width: 96, opacity: .8, marginBottom: 14 }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, justifyContent: 'center' }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: D.textMatt, marginTop: 14 }}>ab</span>
                    <span className="display neon" style={{ fontSize: 'clamp(48px,7vw,72px)' }}>{String(SORGENFREI.preis).replace('.', ',')}</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: D.textMatt, marginTop: 10 }}>€</span>
                  </div>
                  <p style={{ fontSize: 13, color: D.grauHell, marginBottom: 20 }}>
                    inkl. 19 % MwSt. pro Monat<br />oder {SORGENFREI.jahr} € im Jahr
                  </p>
                  <button className="btnfest" onClick={() => starten(null)} style={{ width: '100%', padding: 15, fontSize: 15 }}>
                    Sorgenfrei starten
                  </button>
                  <a href="/preise#sorgenfrei" className="btnleer" style={{ width: '100%', padding: 12, marginTop: 10, textAlign: 'center' }}>Was ist enthalten?</a>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="karte" style={{ marginTop: 22, padding: '20px 22px', display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
              <p style={{ fontSize: 13.5, color: D.textMatt, flex: 1, minWidth: 260, lineHeight: 1.7 }}>
                {modus === 'mieten'
                  ? `${MIETE_BEDINGUNGEN.laufzeit}, ${MIETE_BEDINGUNGEN.danach}. Einrichtung ${MIETE_BEDINGUNGEN.einrichtung}. ${MIETE_BEDINGUNGEN.jahresvorteil}`
                  : 'Einmalzahlung, kein Abo. Domain und Hosting bringst du selbst mit — oder du mietest stattdessen.'}
              </p>
              <a href="/preise" className="btnleer">Alle Preise im Detail</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════ KONTROLLE ══════ */}
      <section style={{ padding: '58px 0', background: D.dunkel2, borderTop: `1px solid ${D.linie}`, borderBottom: `1px solid ${D.linie}` }}>
        <div className="wrap">
          <Reveal>
            <p className="eyebrow neon" style={{ marginBottom: 14 }}>03 — Kontrolle</p>
            <h2 className="display" style={{ fontSize: 'clamp(32px,5.4vw,58px)', marginBottom: 14 }}>
              Änderungen kosten nichts. <span className="leicht">Nie.</span>
            </h2>
            <p style={{ fontSize: 16, color: D.textMatt, maxWidth: 660, marginBottom: 38, lineHeight: 1.7 }}>
              Bei einer Agentur kostet jede Textänderung Geld und Wartezeit. Hier änderst du selbst:
              neue Öffnungszeiten, neue Preise, neues Teamfoto — einloggen, anklicken, ändern.
            </p>
          </Reveal>
          <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              ['euro-sign', 'Keine Stundensätze', 'Du zahlst nie für Textänderungen, neue Bilder oder zusätzliche Bereiche.'],
              ['bolt', 'Kein Warten', 'Keine E-Mail an die Agentur, keine Rückfrage, kein Termin. Änderung ist sofort live.'],
              ['key', 'Volle Kontrolle', 'Es ist deine Website. Du entscheidest, was drinsteht — und wann.'],
            ].map(([ic, t, u], i) => (
              <Reveal key={t} verzug={i * 110}>
                <div className="karte karte-hover ikarte" style={{ padding: '28px 26px', height: '100%' }}>
                  <i className={`fa-solid fa-${ic}`} aria-hidden="true" />
                  <h3 className="display" style={{ fontSize: 20, marginBottom: 9 }}>{t}</h3>
                  <p style={{ fontSize: 14.3, color: D.textMatt, lineHeight: 1.72 }}>{u}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal verzug={200}><div style={{ marginTop: 24 }}><a href="/editor-funktionen" className="btnleer">Alle Editor-Funktionen <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }} aria-hidden="true" /></a></div></Reveal>
        </div>
      </section>

      {/* ══════ BRANCHEN ══════ */}
      <section style={{ padding: '58px 0' }}>
        <div className="wrap">
          <Reveal>
            <p className="eyebrow neon" style={{ marginBottom: 14 }}>04 — Branchen</p>
            <h2 className="display" style={{ fontSize: 'clamp(32px,5.4vw,58px)', marginBottom: 14 }}>
              Inhalte, die zur <span className="leicht">Branche passen.</span>
            </h2>
            <p style={{ fontSize: 16, color: D.textMatt, maxWidth: 620, marginBottom: 26, lineHeight: 1.7 }}>
              Ein Restaurant braucht eine Speisekarte, eine Kanzlei Rechtsgebiete, ein Handwerksbetrieb den Notdienst.
            </p>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 24 }}>
              {BRANCHEN_INFO.map(b => (
                <button key={b.id} onClick={() => setBranche(b)} className={`chip ${branche.id === b.id ? 'chip-an' : ''}`}>{b.label}</button>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <div className="karte bkarte zweispalt" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', overflow: 'hidden' }}>
              <div style={{ padding: '34px 32px' }}>
                <h3 className="display" style={{ fontSize: 26, marginBottom: 12 }}>{branche.label}</h3>
                <p style={{ fontSize: 15, color: D.textMatt, lineHeight: 1.75, marginBottom: 22 }}>{branche.text}</p>
                <ul className="pliste">
                  {branche.bereiche.map(t => <li key={t}><i className="fa-solid fa-check" aria-hidden="true" />{t}</li>)}
                </ul>
                <div style={{ display: 'flex', gap: 11, flexWrap: 'wrap', marginTop: 24 }}>
                  <button className="btnfest" onClick={() => starten(null)}>Für {branche.label} starten</button>
                  <a href="/branchen" className="btnleer">Alle Branchen</a>
                </div>
              </div>
              <div style={{ minHeight: 340, overflow: 'hidden', position: 'relative' }}>
                <div className="bbild" role="img" aria-label={`Beispielbild ${branche.label}`}
                  style={{ width: '100%', height: '100%', minHeight: 340, background: `#1A0B40 center/cover url(${BILD(branche.bild)})` }} />
                <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg,${D.karte} 0%,transparent 42%), linear-gradient(0deg,rgba(255,47,185,.22),rgba(34,231,208,.14))` }} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════ VERTRAUEN ══════ */}
      <section style={{ padding: '58px 0', background: D.dunkel2, borderTop: `1px solid ${D.linie}`, borderBottom: `1px solid ${D.linie}` }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 28 }}>
          {[
            ['headset', 'Telefonisch erreichbar', 'Kein Ticketsystem. Mo. bis Fr. von 9 bis 18 Uhr geht jemand ans Telefon.'],
            ['file-zipper', 'Deine Dateien, dein Eigentum', 'Kompletter Quellcode als ZIP. Kein Anbieterzwang, kein Umzugsproblem.'],
            ['server', 'Server in Deutschland', 'Datenbank in Frankfurt, Websites und Postfächer bei deutschen Anbietern.'],
            ['cookie-bite', 'Ohne Cookie-Banner', 'Kein Tracking, keine Werbe-Cookies. Schriften und Icons liegen bei uns.'],
          ].map(([ic, t, u], i) => (
            <Reveal key={t} verzug={i * 90}>
              <i className={`fa-solid fa-${ic}`} style={{ fontSize: 20, color: D.tuerkis, marginBottom: 13, display: 'block' }} aria-hidden="true" />
              <h3 className="display" style={{ fontSize: 17.5, marginBottom: 8 }}>{t}</h3>
              <p style={{ fontSize: 13.8, color: D.textMatt, lineHeight: 1.7 }}>{u}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════ FRAGEN ══════ */}
      <section style={{ padding: '58px 0' }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <Reveal>
            <p className="eyebrow neon" style={{ marginBottom: 14 }}>05 — Fragen</p>
            <h2 className="display" style={{ fontSize: 'clamp(32px,5.4vw,58px)', marginBottom: 14 }}>
              Häufige <span className="leicht">Fragen.</span>
            </h2>
            <p style={{ fontSize: 16, color: D.textMatt, marginBottom: 28, lineHeight: 1.7 }}>
              Die wichtigsten hier — alle weiteren in der <a className="link-u" href="/hilfe" style={{ color: D.tuerkis, fontWeight: 600 }}>Hilfe</a>.
            </p>
          </Reveal>
          {topFragen.map((q, i) => (
            <Reveal key={q.f} verzug={i * 60}>
              <details className="karte frage">
                <summary>
                  <span style={{ flex: 1 }}>{q.f}</span>
                  <span className="plus" aria-hidden="true">+</span>
                </summary>
                <p>{q.a}</p>
              </details>
            </Reveal>
          ))}
          <Reveal verzug={120}><div style={{ marginTop: 18 }}><a href="/hilfe" className="btnleer">Alle Fragen &amp; Antworten <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }} aria-hidden="true" /></a></div></Reveal>
        </div>
      </section>

      {/* ══════ ABSCHLUSS ══════ */}
      <section style={{ padding: '10px 0 76px' }}>
        <div className="wrap">
          <Reveal>
            <div className="abschluss">
              <div className="gitter" style={{ height: '70%', opacity: .5 }} aria-hidden="true" />
              <div style={{ position: 'relative' }}>
                <img src="/platzhalter/rakete.svg" alt="" aria-hidden="true" style={{ width: 78, marginBottom: 18 }} />
                <h2 className="display" style={{ fontSize: 'clamp(30px,4.6vw,50px)', marginBottom: 14 }}>
                  Schauen kostet <span className="neon">nichts.</span>
                </h2>
                <p style={{ fontSize: 16, color: '#E4D8FF', maxWidth: 500, margin: '0 auto 30px', lineHeight: 1.7 }}>
                  Geh die Fragen durch und sieh dir das Ergebnis an. Bezahlt wird erst, wenn dir die Website gefällt.
                </p>
                <div style={{ display: 'flex', gap: 13, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btnhell" onClick={() => starten(null)}>Website erstellen</button>
                  <a href="/preise" className="btnleer" style={{ borderColor: 'rgba(255,255,255,.4)' }}>Preise ansehen</a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Fuss />
      <Chat />
    </div>
  )
}

// ── Hero-Folie ──
function Folie({ ober, zeile1, zeile2, text, bild, alt, starten, knopf, ziel }) {
  return (
    <div className="folie">
      <div>
        <span className="marke-neon">{ober}</span>
        <h1 className="display" style={{ fontSize: 'clamp(44px,8vw,96px)', margin: '20px 0 20px' }}>
          {zeile1}<br /><span className="neon">{zeile2}</span>
        </h1>
        <p style={{ fontSize: 17.5, color: D.textMatt, lineHeight: 1.7, maxWidth: 520, marginBottom: 32 }}>{text}</p>
        <div style={{ display: 'flex', gap: 13, flexWrap: 'wrap' }}>
          <button className="btnfest" onClick={() => starten(null)} style={{ padding: '15px 28px', fontSize: 15.5 }}>
            Kostenlos erstellen<i className="fa-solid fa-arrow-right" style={{ marginLeft: 10 }} aria-hidden="true" />
          </button>
          {knopf && <a href={ziel} className="btnleer" style={{ padding: '15px 24px', fontSize: 15 }}>{knopf}</a>}
        </div>
      </div>
      <div className="folie-bild">
        <img src={bild} alt={alt} style={{ width: '100%', maxWidth: 440 }} />
      </div>
    </div>
  )
}

const CSS = `
.folie{display:grid;grid-template-columns:1.05fr .95fr;gap:44px;align-items:center;min-height:430px}
.folie-bild{display:flex;justify-content:center;animation:wippen 7s ease-in-out infinite}
@keyframes wippen{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-16px) rotate(1.5deg)}}
.marke-neon{display:inline-block;font-size:11.5px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;
  color:${D.tuerkis};border:1px solid ${D.tuerkis}55;background:rgba(34,231,208,.09);border-radius:99px;padding:7px 15px}
.marke-tuerkis{display:inline-block;font-size:11.5px;font-weight:800;color:${D.tuerkis};background:rgba(34,231,208,.1);
  border:1px solid rgba(34,231,208,.32);border-radius:99px;padding:4px 12px}
.marke-gold{display:inline-block;font-size:11.5px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;
  color:${D.gold};background:rgba(255,177,61,.12);border:1px solid rgba(255,177,61,.4);border-radius:99px;padding:6px 14px}

.adresszeile{display:flex;align-items:center;gap:11px;background:${D.karte};border:1.5px solid ${D.linie};
  border-radius:16px;padding:10px 11px 10px 19px;box-shadow:0 0 0 1px rgba(255,47,185,.12),0 22px 60px rgba(0,0,0,.5);transition:border-color .2s,box-shadow .2s}
.adresszeile:focus-within{border-color:${D.magenta};box-shadow:0 0 0 4px rgba(255,47,185,.16),0 22px 60px rgba(0,0,0,.5)}
.caret{display:inline-block;width:2px;height:1.05em;background:${D.magenta};vertical-align:-.16em;animation:blink 1.1s step-end infinite}
@keyframes blink{50%{opacity:0}}
.hinweis{max-width:700px;margin:22px auto 0;padding:15px 17px;font-size:13.5px;color:${D.gold};
  background:rgba(255,177,61,.08);border:1px solid rgba(255,177,61,.3);border-radius:13px;line-height:1.6}
.treffer{display:flex;align-items:center;gap:13px;padding:16px 18px;margin-bottom:10px;border-radius:14px;
  background:${D.karte};border:1.5px solid;flex-wrap:wrap;transition:transform .2s,box-shadow .2s}
.treffer:hover{transform:translateX(4px);box-shadow:0 0 30px rgba(34,231,208,.18)}

.stufe-ic{width:52px;height:52px;border-radius:15px;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,${D.magenta},${D.lila});color:#fff;font-size:19px;
  box-shadow:0 8px 26px rgba(255,47,185,.36);transition:transform .24s cubic-bezier(.2,.7,.3,1)}
.stufe:hover .stufe-ic{transform:scale(1.12) rotate(-8deg)}
.ikarte i{font-size:21px;color:${D.tuerkis};background:rgba(34,231,208,.1);border:1px solid rgba(34,231,208,.28);
  width:50px;height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:18px;
  transition:transform .24s cubic-bezier(.2,.7,.3,1),background .2s,color .2s}
.ikarte:hover i{transform:scale(1.12) rotate(-8deg);background:${D.tuerkis};color:#04121A}

.chip{background:${D.karte};border:1px solid ${D.linie};border-radius:99px;padding:10px 17px;font-size:13px;
  font-weight:600;color:${D.textMatt};cursor:pointer;transition:all .18s}
.chip:hover{border-color:${D.tuerkis};color:${D.tuerkis};transform:translateY(-2px)}
.chip-an{background:linear-gradient(96deg,${D.magenta},${D.lila});color:#fff;border-color:transparent;box-shadow:0 8px 24px rgba(255,47,185,.35)}
.bbild{transition:transform .8s cubic-bezier(.2,.7,.3,1)}
.bkarte:hover .bbild{transform:scale(1.07)}

.umschalter{display:inline-flex;background:${D.karte};border:1px solid ${D.linie};border-radius:14px;padding:5px;margin-bottom:32px;flex-wrap:wrap}
.um-an,.um-aus{border:none;border-radius:10px;padding:12px 22px;font-size:14px;font-weight:800;cursor:pointer;transition:all .2s}
.um-an{background:linear-gradient(96deg,${D.magenta},${D.lila});color:#fff;box-shadow:0 8px 24px rgba(255,47,185,.35)}
.um-aus{background:transparent;color:${D.textMatt}}
.um-aus:hover{color:${D.text}}

.preis{padding:32px 28px;display:flex;flex-direction:column;height:100%;position:relative;overflow:hidden}
.preis-top{border-color:${D.magenta};box-shadow:0 0 0 1px ${D.magenta}44,0 18px 46px rgba(255,47,185,.2)}
.eckband{position:absolute;top:16px;right:-38px;width:130px;text-align:center;transform:rotate(45deg);
  background:linear-gradient(96deg,${D.gold},${D.magenta});color:#1A0630;font-size:11px;font-weight:900;
  letter-spacing:.14em;padding:5px 0}
.pliste{list-style:none;display:flex;flex-direction:column;gap:11px;flex:1}
.pliste li{display:flex;gap:11px;font-size:14px;color:${D.text};line-height:1.55;opacity:.92}
.pliste li i{color:${D.tuerkis};font-size:11px;margin-top:5px;flex-shrink:0}
.zweispaltig{display:grid;grid-template-columns:1fr 1fr;gap:10px 22px}

.sorgenfrei{position:relative;margin-top:26px;border-radius:22px;overflow:hidden;
  background:linear-gradient(140deg,#1B0A46,#2A0C55 55%,#0E2A3C);border:1.5px solid rgba(255,177,61,.34)}
.sorgen-glanz{position:absolute;inset:0;background:radial-gradient(700px 300px at 88% 0%,rgba(255,177,61,.2),transparent 65%)}
.sorgen-innen{position:relative;display:flex;gap:34px;padding:38px 34px;flex-wrap:wrap;align-items:center}
.sorgen-preis{flex:0 0 268px;text-align:center;background:rgba(11,4,32,.55);border:1px solid ${D.linie};
  border-radius:18px;padding:26px 24px}

.frage{padding:17px 20px;margin-bottom:10px;transition:border-color .18s,box-shadow .18s}
.frage summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:14px;font-size:16px;font-weight:700}
.frage summary::-webkit-details-marker{display:none}
.frage:hover{border-color:${D.tuerkis}}
.frage[open]{border-color:${D.magenta}}
.frage[open] .plus{transform:rotate(45deg)}
.plus{transition:transform .22s;display:inline-block;color:${D.magenta};font-size:21px;font-weight:700;line-height:1}
.frage p{font-size:14.8px;color:${D.textMatt};line-height:1.82;margin-top:14px}

.abschluss{position:relative;overflow:hidden;border-radius:24px;padding:56px 34px;text-align:center;
  background:linear-gradient(140deg,#2B0B5A,#5B1090 48%,#0B3C4A);border:1px solid rgba(255,255,255,.14)}

@media(max-width:900px){
  .folie{grid-template-columns:1fr;gap:26px;text-align:center;min-height:0}
  .folie-bild img{max-width:280px}
  .folie .marke-neon{margin:0 auto}
  .folie p{margin-left:auto;margin-right:auto}
  .folie>div>div{justify-content:center}
  .zweispalt{grid-template-columns:1fr !important}
  .zweispaltig{grid-template-columns:1fr}
}
@media(max-width:780px){.adresszeile{flex-wrap:wrap}.sorgen-preis{flex:1 1 100%}}
`
