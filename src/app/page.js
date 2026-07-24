'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Kopf, D, BASIS_CSS, CI, TELEFON, TELEFON_LINK } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'
import { Chat } from '@/components/Chat'
import { Reveal, Zaehler, Slider } from '@/components/Effekte'
import { KAUF, MIETE, SORGENFREI, MIETE_BEDINGUNGEN } from '@/lib/preise'
import { BRANCHEN_INFO, BILD } from '@/lib/branchenSeite'
import { FRAGEN } from '@/lib/fragen'

const F = (n) => `/bilder/${n}.webp`

export default function Startseite() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [daten, setDaten] = useState(null)
  const [fehler, setFehler] = useState('')
  const [modus, setModus] = useState('mieten')
  const [branche, setBranche] = useState(BRANCHEN_INFO[0])
  const [weg, setWeg] = useState('mieten')
  const eingabeRef = useRef(null)

  async function pruefen() {
    if (!name.trim()) { eingabeRef.current?.focus(); return }
    setLaedt(true); setFehler(''); setDaten(null)
    try {
      const res = await fetch('/api/domain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
      const j = await res.json()
      if (j.error) setFehler(j.error); else setDaten(j)
    } catch { setFehler('Die Domainprüfung ist gerade nicht erreichbar. Du kannst trotzdem starten.') }
    setLaedt(false)
  }
  function starten(domain) {
    try { if (domain) sessionStorage.setItem('wg24_domain', domain) } catch {}
    router.push('/start')
  }
  const freie = daten?.ergebnisse?.filter(e => e.frei) || []
  const belegte = daten?.ergebnisse?.filter(e => !e.frei) || []

  return (
    <div style={{ background: '#fff', color: CI.text, fontFamily: '"Inter Tight",system-ui,sans-serif', overflowX: 'hidden' }}>
      <link href="/schrift/schrift.css" rel="stylesheet" />
      <link href="/fa/css/all.min.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + CSS }} />
      <Kopf />

      {/* ═══ 1 · HERO mit Foto ═══ */}
      <section className="band band-foto hero" style={{ backgroundImage: `url(${F('hero-buero')})` }}>
        <div className="wrap" style={{ paddingTop: 78, paddingBottom: 66 }}>
          <div className="hero-grid">
            <div>
              <p className="eyebrow" style={{ color: '#6FC3EF', marginBottom: 16 }}>Websiteerstellung kostenlos</p>
              <h1 className="t1" style={{ color: '#fff', marginBottom: 20 }}>
                Firmenwebsites,<br /><b>die verkaufen.</b>
              </h1>
              <p className="lauf" style={{ color: '#C7D6E0', maxWidth: 480, marginBottom: 30 }}>
                Du machst die Angaben, wir erstellen die Website — Texte, Bilder und Aufbau.
                Erst wenn sie dir gefällt, entscheidest du: mieten ab 19,90 € im Monat mit Domain,
                oder einmalig kaufen ab 89 €. Alle Preise inkl. MwSt.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 30 }}>
                <button className="btnfest" onClick={() => starten(null)}>
                  Kostenlos erstellen<i className="fa-solid fa-arrow-right" style={{ marginLeft: 10 }} aria-hidden="true" />
                </button>
                <a href="#preise" className="btnleer" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.34)' }}>Preise ansehen</a>
              </div>
              <div className="hero-merkmale">
                {[['circle-check', 'Erstellen kostet nichts'], ['globe', 'Domain bei Miete inklusive'], ['pen-to-square', 'Änderungen immer gratis']].map(([ic, t]) => (
                  <span key={t}><i className={`fa-solid fa-${ic}`} aria-hidden="true" />{t}</span>
                ))}
              </div>
            </div>

            {/* Trichter Schritt 1: Domain */}
            <div className="trichter">
              <div className="trichter-kopf">
                <span className="trichter-nr">1</span>
                <div>
                  <strong style={{ fontSize: 16 }}>Ist dein Wunschname frei?</strong>
                  <span style={{ display: 'block', fontSize: 12.5, color: CI.textZart }}>Amtliche Prüfung bei der Registrierungsstelle</span>
                </div>
              </div>
              <div className="adresszeile">
                <span style={{ fontSize: 13, color: CI.textZart }}>https://</span>
                <input ref={eingabeRef} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && pruefen()}
                  placeholder="dein-firmenname" aria-label="Wunschname für die Domain"
                  style={{ flex: 1, minWidth: 90, border: 'none', outline: 'none', fontSize: 16.5, fontWeight: 600, color: CI.text, background: 'transparent', padding: '10px 0' }} />
                <span style={{ fontSize: 14.5, fontWeight: 600, color: CI.textZart }}>.de</span>
              </div>
              <button className="btnfest" onClick={pruefen} disabled={laedt} style={{ width: '100%', marginTop: 12, opacity: laedt ? .6 : 1 }}>
                {laedt ? 'Prüft…' : 'Jetzt prüfen'}
              </button>

              {fehler && <p className="klein" style={{ marginTop: 12, color: '#8A5A00', background: '#FFF7E6', border: '1px solid #F3DDA8', borderRadius: 8, padding: '10px 12px' }}>{fehler}</p>}

              {daten && (
                <div style={{ marginTop: 14 }}>
                  {freie.map((e, i) => (
                    <div key={e.domain} className={`treffer ${i === 0 ? 'treffer-erst' : ''}`}>
                      <i className="fa-solid fa-circle-check" aria-hidden="true" />
                      <span style={{ flex: 1, fontWeight: 700, fontSize: 14.5 }}>{e.domain}</span>
                      <button className="btnfest" onClick={() => starten(e.domain)} style={{ padding: '8px 14px', fontSize: 12.5 }}>Nehmen</button>
                    </div>
                  ))}
                  {belegte.length > 0 && <p className="klein" style={{ marginTop: 8, fontSize: 12.5 }}>Vergeben: {belegte.map(e => e.domain).join(' · ')}</p>}
                  {freie.length === 0 && <p className="klein" style={{ marginTop: 8 }}>Alle belegt — probier einen Zusatz wie den Ort.</p>}
                </div>
              )}
              <p className="klein" style={{ fontSize: 12, marginTop: 12, textAlign: 'center' }}>
                Kein Konto nötig zum Prüfen · Domain bei Miete inklusive
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Lauftext ═══ */}
      <div className="laufband" aria-hidden="true">
        <div className="laufband-inhalt">
          {[0, 1].map(k => (
            <span key={k} style={{ display: 'flex', gap: 46 }}>
              {['Erstellung kostenlos', 'Domain inklusive bei Miete', 'Kein Abo beim Kauf', 'Änderungen gratis',
                'Quellcode als ZIP', 'Server in Deutschland', 'Ohne Cookie-Banner', 'Telefonisch erreichbar'].map(t => (
                <span key={t}><i className="fa-solid fa-circle" style={{ fontSize: 4, color: CI.blau, marginRight: 12, verticalAlign: 'middle' }} aria-hidden="true" />{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ 2 · LEISTUNGEN ═══ */}
      <section className="band band-hell" style={{ padding: '84px 0 88px' }}>
        <div className="wrap">
          <Reveal>
            <div className="geistkopf" style={{ marginBottom: 44 }}>
              <span className="geist" aria-hidden="true">Deine Website</span>
              <div className="geistinhalt">
                <p className="eyebrow" style={{ marginBottom: 14 }}>Was du bekommst</p>
                <h2 className="t2" style={{ marginBottom: 16 }}>Deine Website.<br /><b>Gebaut zum Verkaufen.</b></h2>
                <p className="lauf" style={{ maxWidth: 560 }}>
                  Kein leeres Gerüst, das du selbst füllen musst. Texte, Bilder und Aufbau
                  entstehen aus deinen Angaben — passend zu deiner Branche.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              ['file-lines', 'Texte, die zu dir passen', 'Startseite, Leistungen, Über uns, Kontakt — in deiner Ansprache, mit deinen Angaben.'],
              ['image', 'Bilder inklusive', '6 bis 12 Bilder je Paket. Eigene Fotos kannst du hochladen und beschreiben.'],
              ['mobile-screen', 'Für Handy gebaut', 'Über die Hälfte deiner Besucher kommt vom Handy. Die Seite sitzt auf jedem Gerät.'],
              ['magnifying-glass', 'Bei Google auffindbar', 'Saubere Überschriften, schnelle Ladezeit, Titel und Beschreibung aus deinen SEO-Angaben.'],
              ['sliders', 'Alles selbst änderbar', 'Anklicken, tippen, fertig. Dauerhaft und ohne Zusatzkosten.'],
              ['file-zipper', 'Quellcode gehört dir', 'HTML und CSS als ZIP zum Herunterladen — kein Anbieterzwang.'],
            ].map(([ic, t, u], i) => (
              <Reveal key={t} verzug={i * 70}>
                <div className="karte karte-hover lkarte">
                  <i className={`fa-solid fa-${ic}`} aria-hidden="true" />
                  <h3 className="t3" style={{ marginBottom: 9 }}>{t}</h3>
                  <p className="klein">{u}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 3 · DUNKELBAND Preis-Einstieg ═══ */}
      <section className="band band-foto dunkelzone" style={{ backgroundImage: `url(${F('team-laptops')})`, padding: '74px 0 78px' }}>
        <div className="wrap">
          <div className="preisband">
            <div>
              <p className="eyebrow" style={{ marginBottom: 14 }}>Was kostet deine Website?</p>
              <h2 className="t2" style={{ color: '#fff', marginBottom: 16 }}>
                Erstellen kostenlos.<br /><b>Zahlen erst am Ende.</b>
              </h2>
              <p className="lauf" style={{ color: '#C7D6E0', maxWidth: 470 }}>
                Du gehst durch die Fragen, siehst deine fertige Website und entscheidest dann.
                Kein Vorabvertrag, keine Einrichtungsgebühr beim Kauf.
              </p>
            </div>
            <div className="preisband-karten">
              <div className="pband">
                <span className="pband-label">Mieten</span>
                <div className="pband-preis">ab <b>19,90</b> €</div>
                <span className="pband-unter">pro Monat inkl. MwSt.<br />Domain, Hosting und E-Mail inklusive</span>
                <a href="#preise" className="btnfest" style={{ width: '100%', textAlign: 'center', marginTop: 16 }}>Miete ansehen</a>
              </div>
              <div className="pband">
                <span className="pband-label">Kaufen</span>
                <div className="pband-preis">ab <b>89</b> €</div>
                <span className="pband-unter">einmalig inkl. MwSt.<br />ZIP sofort herunterladen, kein Abo</span>
                <a href="#preise" className="btnleer" style={{ width: '100%', textAlign: 'center', marginTop: 16 }}>Kauf ansehen</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 4 · MIETEN ODER KAUFEN — Gegenüberstellung ═══ */}
      <section className="band band-grau" style={{ padding: '84px 0 88px' }}>
        <div className="wrap">
          <Reveal>
            <div className="geistkopf mitte" style={{ textAlign: 'center', marginBottom: 38 }}>
              <span className="geist" aria-hidden="true">Mieten oder kaufen</span>
              <div className="geistinhalt">
                <p className="eyebrow" style={{ marginBottom: 14 }}>Zwei Wege</p>
                <h2 className="t2" style={{ marginBottom: 16 }}>Website mieten<br /><b>oder kaufen?</b></h2>
                <p className="lauf" style={{ maxWidth: 560, margin: '0 auto' }}>
                  Der Unterschied in einem Satz: Beim Mieten läuft alles bei uns, beim Kaufen gehört dir alles.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="wahlleiste">
              {[['mieten', 'globe', 'Mieten — online bei uns'], ['kaufen', 'download', 'Kaufen — ZIP für dich']].map(([id, ic, t]) => (
                <button key={id} onClick={() => setWeg(id)} className={weg === id ? 'wahl-an' : 'wahl-aus'}>
                  <i className={`fa-solid fa-${ic}`} style={{ marginRight: 10 }} aria-hidden="true" />{t}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <div className="vergleich">
              <div className="vergleich-text">
                <h3 className="t3" style={{ fontSize: 24, marginBottom: 14 }}>
                  {weg === 'mieten' ? 'Wir kümmern uns um alles' : 'Du bekommst alle Dateien'}
                </h3>
                <p className="lauf" style={{ marginBottom: 22 }}>
                  {weg === 'mieten'
                    ? 'Domain, Server, SSL-Verschlüsselung, Sicherungen und E-Mail laufen bei uns. Du änderst deine Inhalte trotzdem jederzeit selbst im Editor — ohne Zusatzkosten.'
                    : 'Du erhältst den kompletten Quellcode als ZIP: HTML und CSS, ohne Bindung an uns. Domain und Hosting bringst du selbst mit oder besorgst sie bei deinem Anbieter.'}
                </p>
                <ul className="haken">
                  {(weg === 'mieten'
                    ? ['Domain inklusive, läuft auf deinen Namen', 'Hosting, SSL und Sicherungen', 'E-Mail-Weiterleitung, ab Plus echtes Postfach', '12 Monate Laufzeit, danach monatlich kündbar', 'Änderungen jederzeit selbst']
                    : ['Kompletter Quellcode (HTML/CSS)', 'Einmalzahlung, kein Abo', 'Bei jedem Anbieter betreibbar', 'Domain und Hosting bringst du mit', 'Änderungen jederzeit selbst']
                  ).map(t => <li key={t}><i className="fa-solid fa-check" aria-hidden="true" />{t}</li>)}
                </ul>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 26 }}>
                  <button className="btnfest" onClick={() => starten(null)}>Kostenlos erstellen</button>
                  <a href="/preise" className="btnleer">Alle Preise</a>
                </div>
              </div>
              <div className="vergleich-bild" role="img" aria-label="Zusammenarbeit im Büro"
                style={{ backgroundImage: `url(${F(weg === 'mieten' ? 'werkstatt-laptop' : 'beratung-telefon')})` }} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 5 · ABLAUF auf Foto ═══ */}
      <section className="band band-foto dunkelzone" style={{ backgroundImage: `url(${F('ablauf-besprech')})`, padding: '80px 0 84px' }}>
        <div className="wrap">
          <Reveal>
            <div className="geistkopf" style={{ marginBottom: 40 }}>
              <span className="geist" aria-hidden="true">Ablauf</span>
              <div className="geistinhalt">
                <p className="eyebrow" style={{ marginBottom: 14 }}>Von der Idee zur Website</p>
                <h2 className="t2" style={{ color: '#fff', marginBottom: 16 }}>Drei Schritte.<br /><b>Eine Sitzung.</b></h2>
              </div>
            </div>
          </Reveal>
          <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {[
              ['01', '10 Minuten', 'Angaben machen', 'Branche wählen, Firmendaten eintragen, Stil festlegen. Acht kurze Schritte, keine Technik.'],
              ['02', '2 Minuten', 'Website entsteht', 'Texte, Bilder und Aufbau werden erzeugt — aus deinen Angaben, nicht aus einer Vorlage.'],
              ['03', 'dauerhaft', 'Anpassen & online', 'Im Editor alles ändern. Dann herunterladen oder von uns online stellen lassen.'],
            ].map(([nr, dauer, t, u], i) => (
              <Reveal key={nr} verzug={i * 100}>
                <div className="schritt">
                  <span className="schritt-nr">{nr}</span>
                  <span className="schritt-dauer">{dauer}</span>
                  <h3 className="t3" style={{ color: '#fff', margin: '12px 0 9px' }}>{t}</h3>
                  <p className="klein" style={{ color: '#9FB2C0' }}>{u}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal verzug={180}>
            <div style={{ marginTop: 34 }}>
              <button className="btnfest" onClick={() => starten(null)}>Jetzt starten — kostenlos</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 6 · ZAHLEN ═══ */}
      <section className="band band-hell" style={{ padding: '68px 0' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 26, textAlign: 'center' }}>
          {[[10, 'Minuten bis zur Website', ''], [10, 'Branchen mit eigenen Inhalten', ''], [15, 'Blocktypen im Editor', '+'], [0, 'Euro für Änderungen', '']].map(([z, t, s], i) => (
            <Reveal key={t} verzug={i * 80}>
              <div style={{ fontSize: 'clamp(40px,5vw,58px)', fontWeight: 800, letterSpacing: '-.04em', color: CI.blau }}>
                <Zaehler bis={z} suffix={s} />
              </div>
              <p className="klein" style={{ fontWeight: 500, marginTop: 6 }}>{t}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ 7 · BRANCHEN ═══ */}
      <section className="band band-grau" style={{ padding: '84px 0 88px' }}>
        <div className="wrap">
          <Reveal>
            <div className="geistkopf" style={{ marginBottom: 34 }}>
              <span className="geist" aria-hidden="true">Branchen</span>
              <div className="geistinhalt">
                <p className="eyebrow" style={{ marginBottom: 14 }}>Zehn Branchen</p>
                <h2 className="t2" style={{ marginBottom: 16 }}>Eine Website<br /><b>für deine Branche.</b></h2>
                <p className="lauf" style={{ maxWidth: 560 }}>
                  Ein Restaurant braucht eine Speisekarte, eine Kanzlei Rechtsgebiete, ein Handwerksbetrieb den Notdienst.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="reiter">
              {BRANCHEN_INFO.map(b => (
                <button key={b.id} onClick={() => setBranche(b)} className={branche.id === b.id ? 'reiter-an' : 'reiter-aus'}>{b.label}</button>
              ))}
            </div>
          </Reveal>
          <Reveal>
            <div className="branche">
              <div className="branche-text">
                <h3 className="t3" style={{ fontSize: 25, marginBottom: 12 }}>{branche.label}</h3>
                <p className="lauf" style={{ marginBottom: 20 }}>{branche.text}</p>
                <ul className="haken">
                  {branche.bereiche.map(t => <li key={t}><i className="fa-solid fa-check" aria-hidden="true" />{t}</li>)}
                </ul>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
                  <button className="btnfest" onClick={() => starten(null)}>Für {branche.label} starten</button>
                  <a href="/branchen" className="btnleer">Alle Branchen</a>
                </div>
              </div>
              <div className="branche-bild" role="img" aria-label={`Beispiel ${branche.label}`}
                style={{ backgroundImage: `url(${BILD(branche.bild)})` }} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 8 · PREISE ═══ */}
      <section id="preise" className="band band-hell" style={{ padding: '84px 0 90px' }}>
        <div className="wrap">
          <Reveal>
            <div className="geistkopf mitte" style={{ textAlign: 'center', marginBottom: 34 }}>
              <span className="geist" aria-hidden="true">Preise</span>
              <div className="geistinhalt">
                <p className="eyebrow" style={{ marginBottom: 14 }}>Alle Preise inkl. 19 % MwSt.</p>
                <h2 className="t2" style={{ marginBottom: 16 }}>Klare Preise.<br /><b>Keine Überraschungen.</b></h2>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="wahlleiste" style={{ justifyContent: 'center' }}>
              {[['mieten', 'globe', 'Mieten · monatlich'], ['kaufen', 'download', 'Kaufen · einmalig']].map(([id, ic, t]) => (
                <button key={id} onClick={() => setModus(id)} className={modus === id ? 'wahl-an' : 'wahl-aus'}>
                  <i className={`fa-solid fa-${ic}`} style={{ marginRight: 9 }} aria-hidden="true" />{t}
                </button>
              ))}
            </div>
          </Reveal>

          <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, alignItems: 'stretch' }}>
            {(modus === 'mieten' ? MIETE : KAUF).map((p, i) => (
              <Reveal key={p.id} verzug={i * 90}>
                <div className={`karte karte-hover preis ${p.beliebt ? 'preis-top' : ''}`}>
                  {p.beliebt && <span className="eckband">Meist gewählt</span>}
                  <h3 className="t3" style={{ marginBottom: 5 }}>{p.name}</h3>
                  <p className="klein" style={{ marginBottom: 20 }}>{p.kurz}</p>
                  <div className="preiszeile">
                    <span>ab</span><b>{String(p.preis).replace('.', ',')}</b><span>€</span>
                  </div>
                  <p className="klein" style={{ fontSize: 12.5, margin: '2px 0 20px' }}>
                    inkl. 19 % MwSt. · {modus === 'mieten' ? `monatlich, oder ${p.jahr} € im Jahr` : 'einmalig, kein Abo'}
                  </p>
                  <ul className="haken" style={{ flex: 1 }}>
                    {p.punkte.map(t => <li key={t}><i className="fa-solid fa-check" aria-hidden="true" />{t}</li>)}
                  </ul>
                  <button className={p.beliebt ? 'btnfest' : 'btnleer'} onClick={() => starten(null)} style={{ width: '100%', marginTop: 22 }}>
                    {modus === 'mieten' ? 'Jetzt mieten' : 'Jetzt kaufen'}
                  </button>
                  <p className="klein" style={{ fontSize: 11.5, textAlign: 'center', marginTop: 10 }}>Erstellung kostenlos</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Keine-Sorgen-Paket */}
          <Reveal verzug={120}>
            <div className="sorgen">
              <div className="sorgen-text">
                <span className="sorgen-marke"><i className="fa-solid fa-shield-halved" style={{ marginRight: 8 }} aria-hidden="true" />Rundum betreut</span>
                <h3 className="t2" style={{ color: '#fff', fontSize: 'clamp(24px,3vw,34px)', margin: '14px 0 12px' }}>
                  Keine-Sorgen-<b>Paket</b>
                </h3>
                <p className="lauf" style={{ color: '#C7D6E0', maxWidth: 480, marginBottom: 20 }}>
                  Für alle, die sich um gar nichts kümmern wollen — wir übernehmen auch die Änderungen für dich.
                </p>
                <ul className="haken zwei">
                  {SORGENFREI.punkte.map(t => <li key={t}><i className="fa-solid fa-check" aria-hidden="true" />{t}</li>)}
                </ul>
              </div>
              <div className="sorgen-preis">
                <div className="preiszeile hell"><span>ab</span><b>{String(SORGENFREI.preis).replace('.', ',')}</b><span>€</span></div>
                <p className="klein" style={{ color: '#9FB2C0', marginBottom: 18 }}>
                  monatlich inkl. MwSt.<br />oder {SORGENFREI.jahr} € im Jahr
                </p>
                <button className="btnfest" onClick={() => starten(null)} style={{ width: '100%' }}>Sorgenfrei starten</button>
                <a href="/preise#sorgenfrei" className="btnleer" style={{ width: '100%', textAlign: 'center', marginTop: 10, background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.34)' }}>Was ist enthalten?</a>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <p className="klein" style={{ textAlign: 'center', marginTop: 22, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto' }}>
              {modus === 'mieten'
                ? `${MIETE_BEDINGUNGEN.laufzeit}, ${MIETE_BEDINGUNGEN.danach}. Einrichtung ${MIETE_BEDINGUNGEN.einrichtung}. ${MIETE_BEDINGUNGEN.jahresvorteil}`
                : 'Einmalzahlung, kein Abo. Domain und Hosting bringst du selbst mit — oder du mietest stattdessen.'}
              {' '}<a className="link-u" href="/preise" style={{ color: CI.blau, fontWeight: 600 }}>Alle Preise im Detail</a>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══ 9 · FRAGEN ═══ */}
      <section className="band band-grau" style={{ padding: '84px 0 88px' }}>
        <div className="wrap" style={{ maxWidth: 900 }}>
          <Reveal>
            <div className="geistkopf" style={{ marginBottom: 34 }}>
              <span className="geist" aria-hidden="true">Häufige Fragen</span>
              <div className="geistinhalt">
                <p className="eyebrow" style={{ marginBottom: 14 }}>Fragen &amp; Antworten</p>
                <h2 className="t2" style={{ marginBottom: 16 }}>Häufige Fragen zu<br /><b>Website, Preis und KI.</b></h2>
              </div>
            </div>
          </Reveal>
          {FRAGEN.filter(q => q.top).slice(0, 7).map((q, i) => (
            <Reveal key={q.f} verzug={i * 50}>
              <details className="karte frage">
                <summary><span style={{ flex: 1 }}>{q.f}</span><span className="plus" aria-hidden="true">+</span></summary>
                <p>{q.a}</p>
              </details>
            </Reveal>
          ))}
          <Reveal verzug={100}>
            <div style={{ marginTop: 20 }}><a href="/hilfe" className="btnleer">Alle Fragen &amp; Antworten</a></div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 10 · TRICHTER Anfrage ═══ */}
      <section className="band band-hell" style={{ padding: '84px 0 88px' }}>
        <div className="wrap">
          <div className="anfrage">
            <Reveal>
              <div>
                <p className="eyebrow" style={{ marginBottom: 14 }}>Loslegen</p>
                <h2 className="t2" style={{ marginBottom: 16 }}>In 10 Minuten<br /><b>zur eigenen Website.</b></h2>
                <p className="lauf" style={{ marginBottom: 24, maxWidth: 460 }}>
                  Du brauchst kein Konto, um anzufangen und dir das Ergebnis anzusehen.
                  Angemeldet sein musst du erst, wenn die Website erzeugt wird.
                </p>
                <ul className="haken" style={{ marginBottom: 26 }}>
                  {['Erstellen und ansehen kostet nichts', 'Kein Vertrag, keine Vorauszahlung', 'Ergebnis sofort im Editor änderbar', 'Telefonisch erreichbar bei Fragen'].map(t => (
                    <li key={t}><i className="fa-solid fa-check" aria-hidden="true" />{t}</li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button className="btnfest" onClick={() => starten(null)}>Kostenlos erstellen</button>
                  <a href={TELEFON_LINK} className="btnleer"><i className="fa-solid fa-phone" style={{ marginRight: 9 }} aria-hidden="true" />{TELEFON}</a>
                </div>
              </div>
            </Reveal>
            <Reveal verzug={100}>
              <div className="trichter-gross">
                <div className="trichter-kopf">
                  <span className="trichter-nr">1</span>
                  <strong style={{ fontSize: 15.5 }}>Domain prüfen</strong>
                </div>
                <div className="trichter-pfeil" aria-hidden="true"><i className="fa-solid fa-arrow-down" /></div>
                <div className="trichter-kopf">
                  <span className="trichter-nr">2</span>
                  <strong style={{ fontSize: 15.5 }}>Angaben machen — 8 Schritte</strong>
                </div>
                <div className="trichter-pfeil" aria-hidden="true"><i className="fa-solid fa-arrow-down" /></div>
                <div className="trichter-kopf">
                  <span className="trichter-nr">3</span>
                  <strong style={{ fontSize: 15.5 }}>Website ansehen &amp; anpassen</strong>
                </div>
                <div className="trichter-pfeil" aria-hidden="true"><i className="fa-solid fa-arrow-down" /></div>
                <div className="trichter-kopf" style={{ borderColor: CI.blau, background: '#EAF4FB' }}>
                  <span className="trichter-nr" style={{ background: CI.blau }}>4</span>
                  <strong style={{ fontSize: 15.5 }}>Mieten oder kaufen — erst hier zahlen</strong>
                </div>
                <button className="btnfest" onClick={() => starten(null)} style={{ width: '100%', marginTop: 18 }}>
                  Bei Schritt 1 anfangen
                </button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ 11 · DUNKELBAND Anruf ═══ */}
      <section className="band band-dunkel" style={{ padding: '58px 0' }}>
        <div className="wrap" style={{ display: 'flex', gap: 30, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 380px' }}>
            <p className="eyebrow" style={{ color: '#6FC3EF', marginBottom: 12 }}>Kostenlos und unverbindlich</p>
            <h2 className="t2" style={{ color: '#fff', fontSize: 'clamp(24px,3.2vw,38px)', marginBottom: 10 }}>
              Ruf einfach <b>an.</b>
            </h2>
            <p className="lauf" style={{ color: '#9FB2C0', maxWidth: 440 }}>
              Sag uns, was du vorhast. Meist wissen wir schon am Telefon, ob und wie wir es machen können.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href={TELEFON_LINK} className="btnhell"><i className="fa-solid fa-phone" style={{ marginRight: 10 }} aria-hidden="true" />{TELEFON}</a>
            <a href="/kontakt" className="btnleer" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.34)' }}>Kontaktformular</a>
          </div>
        </div>
      </section>

      <Fuss />
      <Chat />
    </div>
  )
}

const CSS = `
/* Hero */
.hero-grid{display:grid;grid-template-columns:1.15fr 400px;gap:52px;align-items:center}
.hero-merkmale{display:flex;gap:24px;flex-wrap:wrap;font-size:13.5px;color:#C7D6E0}
.hero-merkmale i{color:${CI.blau};margin-right:8px}

/* Trichter-Karte im Hero */
.trichter{background:#fff;border-radius:14px;padding:24px 22px;box-shadow:0 26px 60px rgba(0,0,0,.34);color:${CI.text}}
.trichter-kopf{display:flex;align-items:center;gap:13px;margin-bottom:16px}
.trichter-nr{width:30px;height:30px;flex-shrink:0;border-radius:50%;background:${CI.petrol};color:#fff;
  display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800}
.adresszeile{display:flex;align-items:center;gap:9px;border:1.5px solid ${CI.linie};border-radius:8px;padding:2px 13px;transition:border-color .18s}
.adresszeile:focus-within{border-color:${CI.blau}}
.treffer{display:flex;align-items:center;gap:11px;padding:11px 13px;margin-bottom:7px;border-radius:8px;
  background:${CI.grau};border:1px solid ${CI.linie};transition:border-color .18s}
.treffer i{color:${CI.blau}}
.treffer-erst{border-color:${CI.blau};background:#EAF4FB}

/* Leistungskarten */
.lkarte{padding:26px 24px;height:100%}
.lkarte i{font-size:19px;color:${CI.blau};background:#EAF4FB;width:46px;height:46px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;margin-bottom:18px;transition:all .24s}
.lkarte:hover i{background:${CI.blau};color:#fff;transform:translateY(-3px)}

/* Preisband dunkel */
.preisband{display:grid;grid-template-columns:1fr 420px;gap:44px;align-items:center}
.preisband-karten{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pband{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:20px 18px;
  display:flex;flex-direction:column;transition:background .2s,transform .2s}
.pband:hover{background:rgba(255,255,255,.12);transform:translateY(-4px)}
.pband-label{font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#6FC3EF}
.pband-preis{font-size:15px;font-weight:400;color:#C7D6E0;margin:8px 0 4px}
.pband-preis b{font-size:38px;font-weight:800;letter-spacing:-.04em;color:#fff;margin:0 3px}
.pband-unter{font-size:12.5px;color:#9FB2C0;line-height:1.6;flex:1}

/* Wahlleiste */
.wahlleiste{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:30px}
.wahl-an,.wahl-aus{border-radius:8px;padding:14px 24px;font-size:14.5px;font-weight:700;cursor:pointer;transition:all .2s;border:1.5px solid}
.wahl-an{background:${CI.petrol};color:#fff;border-color:${CI.petrol}}
.wahl-aus{background:#fff;color:${CI.textMatt};border-color:${CI.linie}}
.wahl-aus:hover{border-color:${CI.blau};color:${CI.blau}}

/* Vergleich / Branche */
.vergleich,.branche{display:grid;grid-template-columns:1.05fr .95fr;gap:0;background:#fff;border:1px solid ${CI.linie};
  border-radius:16px;overflow:hidden}
.vergleich-text,.branche-text{padding:36px 34px}
.vergleich-bild,.branche-bild{min-height:360px;background-size:cover;background-position:center}

/* Haken-Listen */
.haken{list-style:none;display:flex;flex-direction:column;gap:11px}
.haken li{display:flex;gap:11px;font-size:14.5px;line-height:1.55;color:${CI.text}}
.haken li i{color:${CI.blau};font-size:11px;margin-top:5px;flex-shrink:0}
.dunkelzone .haken li,.sorgen .haken li{color:#DCE6EE}
.haken.zwei{display:grid;grid-template-columns:1fr 1fr;gap:10px 22px}

/* Ablauf-Schritte */
.schritt{border-top:2px solid rgba(255,255,255,.2);padding-top:18px;transition:border-color .24s}
.schritt:hover{border-color:${CI.blau}}
.schritt-nr{font-size:34px;font-weight:800;letterSpacing:-.04em;color:${CI.blau};display:block;line-height:1}
.schritt-dauer{font-size:11.5px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;color:#8FB8CE}

/* Reiter */
.reiter{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px}
.reiter-an,.reiter-aus{border-radius:7px;padding:10px 16px;font-size:13px;font-weight:600;cursor:pointer;transition:all .18s;border:1px solid}
.reiter-an{background:${CI.petrol};color:#fff;border-color:${CI.petrol}}
.reiter-aus{background:#fff;color:${CI.textMatt};border-color:${CI.linie}}
.reiter-aus:hover{border-color:${CI.blau};color:${CI.blau}}

/* Preiskarten */
.preis{padding:32px 28px;display:flex;flex-direction:column;height:100%;position:relative;overflow:hidden}
.preis-top{border-color:${CI.blau};box-shadow:0 16px 40px rgba(27,147,210,.16)}
.eckband{position:absolute;top:0;right:0;background:${CI.blau};color:#fff;font-size:10.5px;font-weight:700;
  letter-spacing:.1em;text-transform:uppercase;padding:6px 14px;border-radius:0 0 0 10px}
.preiszeile{display:flex;align-items:baseline;gap:6px;font-size:15px;color:${CI.textMatt};font-weight:400}
.preiszeile b{font-size:clamp(42px,5vw,54px);font-weight:800;letter-spacing:-.045em;color:${CI.text}}
.preiszeile.hell b{color:#fff}
.preiszeile.hell{color:#9FB2C0;justify-content:center}

/* Keine-Sorgen */
.sorgen{margin-top:26px;display:grid;grid-template-columns:1fr 300px;gap:34px;align-items:center;
  background:${CI.petrol};border-radius:16px;padding:36px 34px;color:#fff}
.sorgen-marke{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;
  color:#6FC3EF;border:1px solid rgba(111,195,239,.4);background:rgba(111,195,239,.1);border-radius:99px;padding:6px 14px}
.sorgen-preis{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:24px 22px;text-align:center}

/* FAQ */
.frage{padding:18px 22px;margin-bottom:9px;background:#fff;transition:border-color .2s,box-shadow .2s}
.frage summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:14px;font-size:16px;font-weight:600}
.frage summary::-webkit-details-marker{display:none}
.frage:hover{border-color:${CI.blau}66}
.frage[open]{border-color:${CI.blau}}
.frage[open] .plus{transform:rotate(45deg)}
.plus{transition:transform .26s;display:inline-block;font-size:20px;font-weight:400;color:${CI.blau};line-height:1}
.frage p{font-size:14.8px;color:${CI.textMatt};line-height:1.8;margin-top:13px}

/* Anfrage-Trichter */
.anfrage{display:grid;grid-template-columns:1fr 420px;gap:52px;align-items:center}
.trichter-gross{background:${CI.grau};border:1px solid ${CI.linie};border-radius:16px;padding:26px 24px}
.trichter-gross .trichter-kopf{background:#fff;border:1px solid ${CI.linie};border-radius:10px;padding:14px 16px;margin-bottom:0;transition:all .2s}
.trichter-gross .trichter-kopf:hover{border-color:${CI.blau};transform:translateX(4px)}
.trichter-pfeil{text-align:center;color:${CI.textZart};font-size:12px;padding:7px 0}

@media(max-width:1000px){
  .hero-grid,.preisband,.anfrage{grid-template-columns:1fr;gap:32px}
  .sorgen{grid-template-columns:1fr}
}
@media(max-width:820px){
  .vergleich,.branche{grid-template-columns:1fr}
  .vergleich-bild,.branche-bild{min-height:220px;order:-1}
  .haken.zwei{grid-template-columns:1fr}
  .preisband-karten{grid-template-columns:1fr}
}
`
