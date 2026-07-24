'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Kopf, D, BASIS_CSS, CI, VERLAUF } from '@/components/Kopf'
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
    <div style={{ background: '#fff', color: D.text, fontFamily: '"Inter Tight",system-ui,sans-serif', overflowX: 'hidden' }}>
      <link href="/schrift/schrift.css" rel="stylesheet" />
      <link href="/fa/css/all.min.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + CSS }} />
      <Kopf />

      {/* ══════ HERO ══════ */}
      <section id="domain" className="weich-unten" style={{ position: 'relative', overflow: 'hidden', paddingTop: 56, paddingBottom: 104 }}>
        <div className="mesh" aria-hidden="true" />
        <div className="punkte" aria-hidden="true" />
        <div className="wolke" style={{ width: 520, height: 520, background: CI.blau, opacity: .17, top: -170, left: -140 }} aria-hidden="true" />
        <div className="wolke" style={{ width: 460, height: 460, background: CI.violett, opacity: .15, top: 30, right: -150, animationDelay: '-7s' }} aria-hidden="true" />
        <div className="wolke" style={{ width: 380, height: 380, background: CI.tuerkis, opacity: .13, bottom: -120, left: '42%', animationDelay: '-13s' }} aria-hidden="true" />

        <div className="wrap" style={{ position: 'relative' }}>
          <Slider folien={folien} />

          <Reveal verzug={120}>
            <div style={{ maxWidth: 720, margin: '52px auto 0' }}>
              <p className="eyebrow verlauf" style={{ textAlign: 'center', marginBottom: 14 }}>
                Ist dein Wunschname noch frei?
              </p>
              <div className="adresszeile">
                <span style={{ fontSize: 13, color: CI.textZart, whiteSpace: 'nowrap' }}>https://</span>
                <input ref={eingabeRef} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && pruefen()}
                  placeholder="dein-firmenname" aria-label="Wunschname für die Domain"
                  style={{ flex: 1, minWidth: 110, border: 'none', outline: 'none', fontSize: 19, fontWeight: 600, color: CI.textStark, background: 'transparent', padding: '11px 0' }} />
                {!name && <span className="caret" aria-hidden="true" />}
                <span style={{ fontSize: 15.5, fontWeight: 600, color: CI.textZart }}>.de</span>
                <button className="btnfest" onClick={pruefen} disabled={laedt} style={{ padding: '13px 24px', whiteSpace: 'nowrap', opacity: laedt ? .6 : 1 }}>
                  {laedt ? 'Prüft…' : 'Prüfen'}
                </button>
              </div>
              <p style={{ fontSize: 12.5, color: CI.textZart, marginTop: 13, textAlign: 'center' }}>
                Amtliche Prüfung bei der Registrierungsstelle — keine Schätzung, kein Zwischenspeicher.
              </p>
            </div>
          </Reveal>

          {fehler && <div className="hinweis">{fehler}</div>}

          {daten && (
            <div style={{ maxWidth: 720, margin: '24px auto 0' }}>
              {freie.map((e, i) => (
                <div key={e.domain} className={`treffer ${i === 0 ? 'treffer-erst' : ''}`}>
                  <i className="fa-solid fa-circle-check" style={{ color: CI.tuerkis, fontSize: 17 }} aria-hidden="true" />
                  <span style={{ flex: 1, minWidth: 150, fontSize: 18, fontWeight: 700, letterSpacing: '-.025em' }}>{e.domain}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: CI.tuerkis, letterSpacing: '.1em', textTransform: 'uppercase' }}>frei</span>
                  <button className="btntuerkis" onClick={() => starten(e.domain)} style={{ padding: '11px 19px', fontSize: 13.5, whiteSpace: 'nowrap' }}>
                    Diese nehmen<i className="fa-solid fa-arrow-right" style={{ marginLeft: 9 }} aria-hidden="true" />
                  </button>
                  <div style={{ flexBasis: '100%', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', paddingTop: 7 }}>
                    <span className="marke-tuerkis"><i className="fa-solid fa-check" style={{ marginRight: 6 }} aria-hidden="true" />Bei Miete inklusive</span>
                    <span style={{ fontSize: 12.5, color: CI.textMatt }}>Beim Kauf bringst du Domain und Hosting selbst mit.</span>
                  </div>
                </div>
              ))}
              {belegte.length > 0 && (
                <p style={{ fontSize: 12.5, color: CI.textMatt, marginTop: 12 }}>
                  <i className="fa-solid fa-circle-xmark" style={{ marginRight: 8, color: CI.violett }} aria-hidden="true" />
                  Schon vergeben: {belegte.map(e => e.domain).join(' · ')}
                </p>
              )}
              {freie.length === 0 && (
                <div className="karte" style={{ padding: 22, fontSize: 14.5, color: CI.textMatt, lineHeight: 1.75 }}>
                  Alle geprüften Adressen sind belegt. Probier einen Zusatz — den Ort oder die Leistung, etwa „mueller-sanitaer-berlin".
                  <div style={{ marginTop: 15 }}><button className="btnfest" onClick={() => starten(null)}>Ohne Domain starten</button></div>
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
                <span key={t} style={{ color: D.grau }}>
                  <span className="verlauf" style={{ marginRight: 12, fontWeight: 900 }}>✦</span>{t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══════ ZAHLEN ══════ */}
      <section style={{ padding: '58px 0' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 26, textAlign: 'center' }}>
          {[[10, 'Minuten bis zur Website', ''], [10, 'Branchen mit eigenen Inhalten', ''], [15, 'Blocktypen im Editor', '+'], [0, 'Euro für Änderungen', '']].map(([z, t, s], i) => (
            <Reveal key={t} verzug={i * 90}>
              <div className="display verlauf" style={{ fontSize: 'clamp(44px,5.8vw,72px)' }}>
                <Zaehler bis={z} suffix={s} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: CI.textMatt, marginTop: 8 }}>{t}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════ ABLAUF ══════ */}
      <section className="grauflaeche weich-oben weich-unten" style={{ padding: '96px 0 100px', position: 'relative' }}>
        <div className="wrap" style={{ position: 'relative' }}>
          <Reveal>
            <p className="eyebrow verlauf" style={{ marginBottom: 14 }}>01 — Ablauf</p>
            <h2 className="display" style={{ fontSize: 'clamp(36px,6vw,72px)', marginBottom: 16 }}>
              <span className="haar">Drei Schritte.</span><br /><span className="verlauf">Eine Sitzung.</span>
            </h2>
            <p style={{ fontSize: 17.5, fontWeight: 200, color: CI.textMatt, maxWidth: 580, marginBottom: 44, lineHeight: 1.72 }}>
              Vom leeren Blatt zur fertigen Website — ohne Termin und ohne Warteschleife.
            </p>
          </Reveal>
          <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {SCHRITTE.map((s, i) => (
              <Reveal key={s.nr} verzug={i * 120}>
                <div className="karte karte-hover stufe" style={{ padding: '28px 26px', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span className="stufe-ic"><i className={`fa-solid fa-${s.ic}`} aria-hidden="true" /></span>
                    <span className="display" style={{ fontSize: 30, color: D.linie }}>{s.nr}</span>
                  </div>
                  <span className="marke-tuerkis" style={{ marginBottom: 12, display: 'inline-block' }}>{s.dauer}</span>
                  <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.03em', marginBottom: 11 }}>{s.t}</h3>
                  <p style={{ fontSize: 14.5, fontWeight: 300, color: CI.textMatt, lineHeight: 1.75 }}>{s.u}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal verzug={200}><div style={{ marginTop: 24 }}><a href="/so-funktioniert-es" className="btnleer">Ablauf im Detail <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }} aria-hidden="true" /></a></div></Reveal>
        </div>
      </section>

      {/* ══════ PREISE ══════ */}
      <section id="preise" style={{ padding: '74px 0 78px' }}>
        <div className="wrap" style={{ position: 'relative' }}>
          <Reveal>
            <p className="eyebrow verlauf" style={{ marginBottom: 14 }}>02 — Preise</p>
            <h2 className="display" style={{ fontSize: 'clamp(36px,6vw,72px)', marginBottom: 16 }}>
              <span className="haar">Mieten oder </span><span className="verlauf">kaufen.</span>
            </h2>
            <p style={{ fontSize: 17.5, fontWeight: 200, color: CI.textMatt, maxWidth: 640, marginBottom: 30, lineHeight: 1.72 }}>
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
                  <h3 style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-.03em', marginBottom: 6 }}>{p.name}</h3>
                  <p style={{ fontSize: 13.5, color: D.grau, marginBottom: 22 }}>{p.kurz}</p>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: D.textMatt, marginTop: 14 }}>ab</span>
                    <span className="display verlauf" style={{ fontSize: 'clamp(48px,6vw,68px)' }}>{String(p.preis).replace('.', ',')}</span>
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
                    <span className="haar">Keine-Sorgen-</span><span className="verlauf">Paket</span>
                  </h3>
                  <p style={{ fontSize: 16, fontWeight: 300, color: '#CFC9F2', lineHeight: 1.75, marginBottom: 24, maxWidth: 470 }}>
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
                    <span className="display" style={{ fontSize: 'clamp(46px,6.4vw,66px)', color: '#fff' }}>{String(SORGENFREI.preis).replace('.', ',')}</span>
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
      <section className="grauflaeche weich-oben weich-unten" style={{ padding: '96px 0 100px', position: 'relative' }}>
        <div className="wrap" style={{ position: 'relative' }}>
          <Reveal>
            <p className="eyebrow verlauf" style={{ marginBottom: 14 }}>03 — Kontrolle</p>
            <h2 className="display" style={{ fontSize: 'clamp(36px,6vw,72px)', marginBottom: 16 }}>
              <span className="haar">Änderungen kosten nichts.</span> <span className="verlauf">Nie.</span>
            </h2>
            <p style={{ fontSize: 17.5, fontWeight: 200, color: CI.textMatt, maxWidth: 680, marginBottom: 42, lineHeight: 1.72 }}>
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
                  <h3 style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.03em', marginBottom: 10 }}>{t}</h3>
                  <p style={{ fontSize: 14.8, fontWeight: 300, color: CI.textMatt, lineHeight: 1.75 }}>{u}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal verzug={200}><div style={{ marginTop: 24 }}><a href="/editor-funktionen" className="btnleer">Alle Editor-Funktionen <i className="fa-solid fa-arrow-right" style={{ marginLeft: 8 }} aria-hidden="true" /></a></div></Reveal>
        </div>
      </section>

      {/* ══════ BRANCHEN ══════ */}
      <section style={{ padding: '70px 0' }}>
        <div className="wrap">
          <Reveal>
            <p className="eyebrow verlauf" style={{ marginBottom: 14 }}>04 — Branchen</p>
            <h2 className="display" style={{ fontSize: 'clamp(36px,6vw,72px)', marginBottom: 16 }}>
              <span className="haar">Inhalte, die zur</span><br /><span className="verlauf">Branche passen.</span>
            </h2>
            <p style={{ fontSize: 17.5, fontWeight: 200, color: CI.textMatt, maxWidth: 640, marginBottom: 28, lineHeight: 1.72 }}>
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
                <h3 style={{ fontSize: 27, fontWeight: 700, letterSpacing: '-.035em', marginBottom: 13 }}>{branche.label}</h3>
                <p style={{ fontSize: 15.5, fontWeight: 300, color: CI.textMatt, lineHeight: 1.78, marginBottom: 24 }}>{branche.text}</p>
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
      <section className="dunkelzone" style={{ padding: '66px 0' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 28 }}>
          {[
            ['headset', 'Telefonisch erreichbar', 'Kein Ticketsystem. Mo. bis Fr. von 9 bis 18 Uhr geht jemand ans Telefon.'],
            ['file-zipper', 'Deine Dateien, dein Eigentum', 'Kompletter Quellcode als ZIP. Kein Anbieterzwang, kein Umzugsproblem.'],
            ['server', 'Server in Deutschland', 'Datenbank in Frankfurt, Websites und Postfächer bei deutschen Anbietern.'],
            ['cookie-bite', 'Ohne Cookie-Banner', 'Kein Tracking, keine Werbe-Cookies. Schriften und Icons liegen bei uns.'],
          ].map(([ic, t, u], i) => (
            <Reveal key={t} verzug={i * 90}>
              <i className={`fa-solid fa-${ic}`} style={{ fontSize: 20, color: '#7EE8DA', marginBottom: 13, display: 'block' }} aria-hidden="true" />
              <h3 style={{ fontSize: 18.5, fontWeight: 600, letterSpacing: '-.025em', marginBottom: 9 }}>{t}</h3>
              <p style={{ fontSize: 14.2, fontWeight: 300, color: '#B4B0DC', lineHeight: 1.75 }}>{u}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════ FRAGEN ══════ */}
      <section className="grauflaeche weich-oben" style={{ padding: '96px 0 100px', position: 'relative' }}>
        <div className="wrap" style={{ maxWidth: 840, position: 'relative' }}>
          <Reveal>
            <p className="eyebrow verlauf" style={{ marginBottom: 14 }}>05 — Fragen</p>
            <h2 className="display" style={{ fontSize: 'clamp(36px,6vw,72px)', marginBottom: 16 }}>
              <span className="haar">Häufige</span> <span className="verlauf">Fragen.</span>
            </h2>
            <p style={{ fontSize: 17.5, fontWeight: 200, color: CI.textMatt, marginBottom: 30, lineHeight: 1.72 }}>
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
              <div style={{ position: 'relative' }}>
                <img src="/platzhalter/rakete.svg" alt="" aria-hidden="true" style={{ width: 78, marginBottom: 18 }} />
                <h2 className="display" style={{ fontSize: 'clamp(30px,4.6vw,50px)', marginBottom: 14 }}>
                  <span className="haar">Schauen kostet</span> <span className="verlauf-bewegt">nichts.</span>
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
        <h1 className="display" style={{ fontSize: 'clamp(46px,8.4vw,110px)', margin: '22px 0 22px' }}>
          <span className="haar" style={{ display: 'block', letterSpacing: '-.03em' }}>{zeile1}</span>
          <span className="verlauf-bewegt">{zeile2}</span>
        </h1>
        <p style={{ fontSize: 18, fontWeight: 300, color: CI.textMatt, lineHeight: 1.72, maxWidth: 520, marginBottom: 34 }}>{text}</p>
        <div style={{ display: 'flex', gap: 13, flexWrap: 'wrap' }}>
          <button className="btnfest" onClick={() => starten(null)} style={{ padding: '15px 28px', fontSize: 15.5 }}>
            Kostenlos erstellen<i className="fa-solid fa-arrow-right" style={{ marginLeft: 10 }} aria-hidden="true" />
          </button>
          {knopf && <a href={ziel} className="btnleer" style={{ padding: '15px 24px', fontSize: 15 }}>{knopf}</a>}
        </div>
      </div>
      <div className="folie-bild">
        <img src={bild} alt={alt} className="schwebe" style={{ width: '100%', maxWidth: 460 }} />
      </div>
    </div>
  )
}

const CSS = `
.folie{display:grid;grid-template-columns:1.06fr .94fr;gap:48px;align-items:center;min-height:440px}
.folie-bild{display:flex;justify-content:center}
.marke-neon{display:inline-block;font-size:11.5px;font-weight:700;letter-spacing:.17em;text-transform:uppercase;
  color:${CI.violett};border:1px solid ${CI.violett}38;background:#F5F1FE;border-radius:99px;padding:8px 16px}
.marke-tuerkis{display:inline-block;font-size:11.5px;font-weight:700;color:${CI.tuerkis};background:#E4F8F8;
  border:1px solid ${CI.tuerkis}40;border-radius:99px;padding:5px 13px}
.marke-gold{display:inline-block;font-size:11.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
  color:#8FF0F0;background:rgba(18,200,200,.14);border:1px solid rgba(18,200,200,.4);border-radius:99px;padding:7px 15px}

.adresszeile{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid ${CI.grauLinie};
  border-radius:16px;padding:10px 11px 10px 20px;box-shadow:0 22px 54px rgba(43,98,240,.16);transition:box-shadow .25s,transform .25s}
.adresszeile:focus-within{box-shadow:0 0 0 4px ${CI.violett}22,0 22px 54px rgba(43,98,240,.2);transform:translateY(-2px)}
.caret{display:inline-block;width:2px;height:1.05em;background:${CI.violett};vertical-align:-.16em;animation:blink 1.1s step-end infinite}
@keyframes blink{50%{opacity:0}}
.hinweis{max-width:720px;margin:22px auto 0;padding:16px 18px;font-size:13.5px;color:#6B4B00;
  background:#FFF8E6;border:1px solid #FBE3A2;border-radius:14px;line-height:1.65}
.treffer{display:flex;align-items:center;gap:14px;padding:17px 19px;margin-bottom:11px;border-radius:16px;
  background:#fff;border:1px solid ${CI.grauLinie};flex-wrap:wrap;transition:transform .25s,box-shadow .25s,border-color .25s}
.treffer:hover{transform:translateX(5px) translateY(-2px);box-shadow:0 18px 42px rgba(43,98,240,.14);border-color:${CI.tuerkis}66}
.treffer-erst{border-color:${CI.tuerkis};box-shadow:0 14px 36px rgba(18,200,200,.16)}

.stufe-ic{width:56px;height:56px;border-radius:17px;display:flex;align-items:center;justify-content:center;
  background:${VERLAUF};background-size:200% 100%;color:#fff;font-size:21px;
  box-shadow:0 12px 28px rgba(123,63,228,.28);transition:transform .35s cubic-bezier(.2,.7,.3,1),background-position .5s}
.stufe:hover .stufe-ic{transform:rotate(-10deg) scale(1.12);background-position:100% 50%}
.ikarte i{font-size:22px;color:#fff;background:${VERLAUF};background-size:200% 100%;
  width:54px;height:54px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;
  box-shadow:0 12px 26px rgba(43,98,240,.26);transition:transform .35s cubic-bezier(.2,.7,.3,1),background-position .5s}
.ikarte:hover i{transform:rotate(10deg) scale(1.12);background-position:100% 50%}

.chip{background:#fff;border:1px solid ${CI.grauLinie};border-radius:99px;padding:11px 18px;font-size:13px;
  font-weight:600;color:${CI.textMatt};cursor:pointer;transition:all .22s}
.chip:hover{border-color:${CI.violett};color:${CI.violett};transform:translateY(-3px)}
.chip-an{background:${VERLAUF};color:#fff;border-color:transparent;box-shadow:0 10px 24px rgba(123,63,228,.3)}
.bbild{transition:transform 1s cubic-bezier(.2,.7,.3,1)}
.bkarte:hover .bbild{transform:scale(1.08) rotate(1deg)}

.umschalter{display:inline-flex;background:#fff;border:1px solid ${CI.grauLinie};border-radius:14px;padding:5px;
  margin-bottom:36px;flex-wrap:wrap;box-shadow:0 8px 22px rgba(20,17,58,.06)}
.um-an,.um-aus{border:none;border-radius:11px;padding:13px 24px;font-size:14.5px;font-weight:700;cursor:pointer;transition:all .25s}
.um-an{background:${VERLAUF};color:#fff;box-shadow:0 10px 24px rgba(123,63,228,.3)}
.um-aus{background:transparent;color:${CI.textMatt}}
.um-aus:hover{color:${CI.textStark}}

.preis{padding:36px 30px;display:flex;flex-direction:column;height:100%;position:relative;overflow:hidden;background:#fff}
.preis-top{border-color:${CI.violett}66;box-shadow:0 22px 54px rgba(123,63,228,.16)}
.eckband{position:absolute;top:16px;right:-40px;width:134px;text-align:center;transform:rotate(45deg);
  background:${VERLAUF};color:#fff;font-size:10.5px;font-weight:800;letter-spacing:.14em;padding:6px 0}
.pliste{list-style:none;display:flex;flex-direction:column;gap:12px;flex:1}
.pliste li{display:flex;gap:12px;font-size:14.5px;color:${CI.textStark};line-height:1.55;font-weight:400}
.pliste li i{color:${CI.tuerkis};font-size:11px;margin-top:5px;flex-shrink:0}
.sorgenfrei .pliste li{color:#E9E7FA}
.sorgenfrei .pliste li i{color:#8FF0F0}
.zweispaltig{display:grid;grid-template-columns:1fr 1fr;gap:11px 24px}

.sorgenfrei{position:relative;margin-top:28px;border-radius:24px;overflow:hidden;color:#fff;
  background:linear-gradient(120deg,${CI.anker},#1B1150 46%,#0E2E4E)}
.sorgen-glanz{position:absolute;inset:0;background:radial-gradient(700px 320px at 86% 0%,${CI.violett}55,transparent 62%),
  radial-gradient(520px 260px at 12% 100%,${CI.tuerkis}3D,transparent 62%)}
.sorgen-innen{position:relative;display:flex;gap:36px;padding:42px 36px;flex-wrap:wrap;align-items:center}
.sorgen-preis{flex:0 0 276px;text-align:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);
  border-radius:18px;padding:28px 26px;backdrop-filter:blur(6px)}

.frage{padding:19px 22px;margin-bottom:11px;background:#fff;transition:border-color .22s,box-shadow .22s,transform .22s}
.frage summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:15px;font-size:16.5px;font-weight:600}
.frage summary::-webkit-details-marker{display:none}
.frage:hover{border-color:${CI.violett}55;box-shadow:0 12px 30px rgba(20,17,58,.08);transform:translateY(-2px)}
.frage[open]{border-color:${CI.violett}}
.frage[open] .plus{transform:rotate(135deg)}
.plus{transition:transform .32s cubic-bezier(.2,.7,.3,1);display:inline-block;font-size:22px;font-weight:300;line-height:1;color:${CI.violett}}
.frage p{font-size:15px;color:${CI.textMatt};line-height:1.85;margin-top:15px;font-weight:300}

.abschluss{position:relative;overflow:hidden;border-radius:26px;padding:64px 34px;text-align:center;color:#fff;
  background:linear-gradient(120deg,${CI.anker},#1B1150 44%,#0E2E4E)}
.abschluss:before{content:'';position:absolute;inset:0;
  background:radial-gradient(620px 300px at 20% 0%,${CI.blau}4D,transparent 62%),
             radial-gradient(560px 280px at 84% 100%,${CI.tuerkis}40,transparent 62%)}

@media(max-width:900px){
  .folie{grid-template-columns:1fr;gap:28px;text-align:center;min-height:0}
  .folie-bild img{max-width:280px}
  .folie .marke-neon{margin:0 auto}
  .folie p{margin-left:auto;margin-right:auto}
  .folie>div>div{justify-content:center}
  .zweispalt{grid-template-columns:1fr !important}
  .zweispaltig{grid-template-columns:1fr}
}
@media(max-width:780px){.adresszeile{flex-wrap:wrap}.sorgen-preis{flex:1 1 100%}}
`
