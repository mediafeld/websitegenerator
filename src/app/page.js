'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Kopf, D, BASIS_CSS, CI, TELEFON, TELEFON_LINK } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'
import { Chat } from '@/components/Chat'
import { Reveal, Zaehler, Slider } from '@/components/Effekte'
import { KAUF, MIETE, SORGENFREI, MIETE_BEDINGUNGEN, eur } from '@/lib/preise'
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
  const [faqWeg, setFaqWeg] = useState('mieten')
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
    <div style={{ background: '#fff', color: CI.text, fontFamily: '"InterTight",system-ui,sans-serif', overflowX: 'hidden' }}>
      <link href="/schrift/schrift.css" rel="stylesheet" />
      <link href="/fa/css/all.min.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + CSS }} />
      <Kopf />

      {/* ═══ HERO — Foto + Domain-Check als zentriertes Herzstück ═══ */}
      <section className="band band-foto hero" style={{ backgroundImage: `url(${F('hero-buero')})` }}>
        <div className="wrap" style={{ paddingTop: 60, paddingBottom: 60 }}>
          <div className="hmitte">
            <Slider dauer={9500} folien={[
              <HeroFolie key="m" art="mieten" starten={starten} />,
              <HeroFolie key="k" art="kaufen" starten={starten} />,
            ]} />

            {/* Domain-Check — bewusst das größte, zentrierte Element im Hero */}
            <div className="dcheck">
              <span className="dcheck-label"><i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />Ist dein Wunschname noch frei?</span>
              <div className="dcheck-feld">
                <span className="dcheck-www">www.</span>
                <input ref={eingabeRef} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && pruefen()}
                  placeholder="deinefirma" aria-label="Wunschname für die Domain" />
                <button onClick={pruefen} disabled={laedt}>
                  {laedt ? <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> : <>Prüfen<i className="fa-solid fa-magnifying-glass" aria-hidden="true" /></>}
                </button>
              </div>

              {!fehler && !daten && (
                <div className="dcheck-tlds">
                  {[['.de', 14.90], ['.com', 24.90], ['.net', 24.90], ['.org', 24.90]].map(([t, p]) => (
                    <span key={t}><b>{t}</b><em>{eur(p)} €/Jahr</em></span>
                  ))}
                </div>
              )}

              {(fehler || daten) && (
                <div className="dcheck-ergebnis">
                  {fehler && <p className="db-fehler">{fehler}</p>}
                  {daten && freie.slice(0, 3).map((e, i) => (
                    <div key={e.domain} className={`treffer ${i === 0 ? 'treffer-erst' : ''}`}>
                      <i className="fa-solid fa-circle-check" aria-hidden="true" />
                      <span style={{ flex: 1, fontWeight: 700, fontSize: 14.5, textAlign: 'left' }}>{e.domain}</span>
                      <span className="tr-frei">frei</span>
                      <button className="btnfest" onClick={() => starten(e.domain)} style={{ padding: '9px 15px', fontSize: 13 }}>
                        Nehmen<i className="fa-solid fa-arrow-right" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  {daten && belegte.length > 0 && <p className="db-belegt">Schon vergeben: {belegte.map(e => e.domain).join(' · ')}</p>}
                  {daten && freie.length === 0 && <p className="db-belegt">Alle geprüften Adressen sind belegt — probier eine Alternative.</p>}
                </div>
              )}

              <p className="dcheck-hinweis"><i className="fa-solid fa-lock" aria-hidden="true" />SSL-verschlüsselt &amp; DSGVO-konform geprüft. Bei Miete ist die Domain inklusive, beim Kauf bringst du sie selbst mit.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Lauftext ═══ */}
      <div className="laufband" aria-hidden="true">
        <div className="laufband-inhalt">
          {[0, 1].map(k => (
            <span key={k} style={{ display: 'flex', gap: 46 }}>
              {['Erstellung kostenlos', 'Domain inklusive bei Miete', 'Erstellung immer kostenlos', 'Änderungen gratis',
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
                <h2 className="t2 strich" style={{ marginBottom: 20 }}>Deine Website.<br /><b className="vschrift">Gebaut zum Verkaufen.</b></h2>
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
                <span>Erstellen kostenlos.</span><br /><b className="vschrift-hell">Zahlen erst am Ende.</b>
              </h2>
              <p className="lauf" style={{ color: '#C7D6E0', maxWidth: 470 }}>
                Du gehst durch die Fragen, siehst deine fertige Website und entscheidest dann.
                Kein Vorabvertrag, keine Einrichtungsgebühr beim Kauf.
              </p>
            </div>
            <div className="preisband-karten">
              <div className="pband">
                <span className="pband-label">Mieten</span>
                <div className="pband-preis">ab <b>{eur(19.90)}</b> €</div>
                <span className="pband-unter">pro Monat inkl. MwSt.<br />Domain, Hosting und E-Mail inklusive</span>
                <a href="#preise" className="btnfest" style={{ width: '100%', textAlign: 'center', marginTop: 16 }}><i className="fa-solid fa-rotate" aria-hidden="true" />Miete ansehen</a>
              </div>
              <div className="pband">
                <span className="pband-label">Kaufen</span>
                <div className="pband-preis">ab <b>{eur(89)}</b> €</div>
                <span className="pband-unter">einmalig inkl. MwSt.<br />ZIP sofort herunterladen, kein Abo</span>
                <a href="#preise" className="btnleer" style={{ width: '100%', textAlign: 'center', marginTop: 16 }}><i className="fa-solid fa-download" aria-hidden="true" />Kauf ansehen</a>
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
                <h2 className="t2" style={{ marginBottom: 20 }}><span>Website mieten</span><br /><b className="vschrift">oder kaufen?</b></h2>
                <p className="lauf" style={{ maxWidth: 560, margin: '0 auto' }}>
                  Der Unterschied in einem Satz: Beim Mieten läuft alles bei uns, beim Kaufen gehört dir alles.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="wahlleiste">
              {[['mieten', 'globe', 'Website mieten', 'ab 19,90 € im Monat · Domain inklusive'],
                ['kaufen', 'download', 'Website kaufen', 'ab 89,00 € einmalig · ZIP sofort']].map(([id, ic, t, u]) => (
                <button key={id} onClick={() => setWeg(id)} className={`grosswahl ${weg === id ? 'gw-an' : 'gw-aus'}`}>
                  <i className={`fa-solid fa-${ic}`} aria-hidden="true" />
                  <span><b>{t}</b><em>{u}</em></span>
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
                <ul className="haken gruen">
                  {(weg === 'mieten'
                    ? ['Domain inklusive, läuft auf deinen Namen', 'Hosting, SSL und Sicherungen', 'E-Mail-Weiterleitung, ab Plus echtes Postfach', '12 Monate Laufzeit, danach monatlich kündbar', 'Änderungen jederzeit selbst']
                    : ['Kompletter Quellcode (HTML/CSS)', 'Einmalzahlung, kein Abo', 'Bei jedem Anbieter betreibbar', 'Domain und Hosting bringst du mit', 'Änderungen jederzeit selbst']
                  ).map(t => <li key={t}><i className="fa-solid fa-check" aria-hidden="true" />{t}</li>)}
                </ul>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 26 }}>
                  <button className="btnfest" onClick={() => starten(null)}><i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />Kostenlos erstellen</button>
                  <a href="/preise" className="btnleer"><i className="fa-solid fa-tags" aria-hidden="true" />Alle Preise</a>
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
                <h2 className="t2" style={{ color: '#fff', marginBottom: 20 }}><span>Drei Schritte.</span><br /><b className="vschrift-hell">Eine Sitzung.</b></h2>
              </div>
            </div>
          </Reveal>
          <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              ['01', '10 Minuten', 'Angaben machen', 'Branche wählen, Firmendaten eintragen, Stil festlegen. Acht kurze Schritte, keine Technik.'],
              ['02', '2 Minuten', 'Website entsteht', 'Texte, Bilder und Aufbau werden erzeugt — aus deinen Angaben, nicht aus einer Vorlage.'],
              ['03', 'dauerhaft', 'Anpassen & online', 'Im Editor alles ändern. Dann herunterladen oder von uns online stellen lassen.'],
            ].map(([nr, dauer, t, u], i) => (
              <Reveal key={nr} verzug={i * 110}>
                <div className="schrittkarte">
                  <div className="schrittbild">
                    <img src={`/bilder/schritt-${i + 1}.svg`} alt={`Schritt ${i + 1}: ${t}`} />
                    <span className="schrittbild-nr">{nr}</span>
                  </div>
                  <span className="schritt-dauer">{dauer}</span>
                  <h3 className="t3" style={{ color: '#fff', margin: '10px 0 9px' }}>{t}</h3>
                  <p className="klein" style={{ color: '#9FB2C0' }}>{u}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal verzug={180}>
            <div style={{ marginTop: 34 }}>
              <button className="btnfest" onClick={() => starten(null)}><i className="fa-solid fa-rocket" aria-hidden="true" />Jetzt starten — kostenlos</button>
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
                <h2 className="t2 strich" style={{ marginBottom: 20 }}>Eine Website<br /><b className="vschrift">für deine Branche.</b></h2>
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
                  {branche.bereiche.map(t => <li key={t}><i className="fa-solid fa-circle-check" aria-hidden="true" />{t}</li>)}
                </ul>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
                  <button className="btnfest" onClick={() => starten(null)}><i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />Für {branche.label} starten</button>
                  <a href="/branchen" className="btnleer"><i className="fa-solid fa-layer-group" aria-hidden="true" />Alle Branchen</a>
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
                <h2 className="t2" style={{ marginBottom: 20 }}><span>Klare Preise.</span><br /><b className="vschrift">Keine Überraschungen.</b></h2>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="wahlleiste" style={{ justifyContent: 'center' }}>
              {[['mieten', 'globe', 'Website mieten', 'monatlich · Domain, Hosting und E-Mail inklusive'],
                ['kaufen', 'download', 'Website kaufen', 'einmalig · Quellcode als ZIP, kein Abo']].map(([id, ic, t, u]) => (
                <button key={id} onClick={() => setModus(id)} className={`grosswahl ${modus === id ? 'gw-an' : 'gw-aus'}`}>
                  <i className={`fa-solid fa-${ic}`} aria-hidden="true" />
                  <span><b>{t}</b><em>{u}</em></span>
                </button>
              ))}
            </div>
          </Reveal>

          <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28, alignItems: 'stretch', paddingTop: 14 }}>
            {(modus === 'mieten' ? MIETE : KAUF).map((p, i) => (
              <Reveal key={p.id} verzug={i * 90}>
                <div className={`karte karte-hover preis ${p.beliebt ? 'preis-top' : ''}`}>
                  {p.beliebt && <span className="eckband">Meist gewählt</span>}
                  <span className={`zahlweise ${modus === 'mieten' ? 'zw-mieten' : 'zw-kaufen'}`}>
                    <i className={`fa-solid fa-${modus === 'mieten' ? 'rotate' : 'download'}`} aria-hidden="true" />
                    {modus === 'mieten' ? 'Monatlich' : 'Einmalig'}
                  </span>
                  <h3 className="t3" style={{ fontSize: 25, margin: '14px 0 5px' }}>{p.name}</h3>
                  <p className="klein" style={{ marginBottom: 18 }}>{p.kurz}</p>

                  <div className="preisblock">
                    <div className={`preiszeile ${p.beliebt ? 'hell' : ''}`}><span>ab</span><b>{eur(p.preis)}</b><span>€ *</span></div>
                    <div className="preis-unter">
                      <strong>{modus === 'mieten' ? 'pro Monat' : 'einmalig'}</strong>
                      <span>* inkl. 19 % MwSt.</span>
                    </div>
                    <div className="preis-fakten">
                      {modus === 'mieten' ? (
                        <>
                          <span><i className="fa-solid fa-calendar-days" aria-hidden="true" /><em><b>12 Monate</b> Laufzeit, danach monatlich kündbar</em></span>
                          <span><i className="fa-solid fa-piggy-bank" aria-hidden="true" /><em>Jahreszahlung: <b>{eur(p.jahr)} €</b> — 2 Monate gratis</em></span>
                        </>
                      ) : (
                        <>
                          <span><i className="fa-solid fa-ban" aria-hidden="true" /><em><b>Keine Laufzeit</b>, kein Abo, keine Kündigung</em></span>
                          <span><i className="fa-solid fa-file-zipper" aria-hidden="true" /><em>ZIP <b>sofort</b> nach Zahlung</em></span>
                        </>
                      )}
                    </div>
                  </div>

                  <ul className="haken gruen" style={{ flex: 1 }}>
                    {p.punkte.map(t => <li key={t}><i className="fa-solid fa-circle-check" aria-hidden="true" />{t}</li>)}
                  </ul>
                  <button className={p.beliebt ? 'btnfest' : 'btnleer'} onClick={() => starten(null)} style={{ width: '100%', marginTop: 22, fontSize: 15.5, padding: '16px' }}>
                    <><i className={`fa-solid fa-${modus === 'mieten' ? 'rotate' : 'download'}`} aria-hidden="true" />{modus === 'mieten' ? `Mieten für ${eur(p.preis)} €/Monat` : `Kaufen für ${eur(p.preis)} €`}</>
                  </button>
                  <p className="klein" style={{ fontSize: 12, textAlign: 'center', marginTop: 10 }}>
                    <i className="fa-solid fa-lock" style={{ marginRight: 6 }} aria-hidden="true" />Erstellung kostenlos — Zahlung erst am Ende
                  </p>
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
                <div className="preiszeile hell"><span>ab</span><b>{eur(SORGENFREI.preis)}</b><span>€ *</span></div>
                <p className="klein" style={{ color: '#9FB2C0', marginBottom: 18 }}>
                  <strong style={{ color: '#fff', fontSize: 15 }}>pro Monat</strong> * inkl. 19 % MwSt.<br />oder {eur(SORGENFREI.jahr)} € im Jahr · 12 Monate Laufzeit
                </p>
                <button className="btnfest" onClick={() => starten(null)} style={{ width: '100%' }}><i className="fa-solid fa-shield-halved" aria-hidden="true" />Sorgenfrei starten</button>
                <a href="/preise#sorgenfrei" className="btnleer" style={{ width: '100%', textAlign: 'center', marginTop: 10, background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.34)' }}><i className="fa-solid fa-list-check" aria-hidden="true" />Was ist enthalten?</a>
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
        <div className="wrap" style={{ maxWidth: 1040 }}>
          <Reveal>
            <div className="geistkopf" style={{ marginBottom: 34 }}>
              <span className="geist" aria-hidden="true">Häufige Fragen</span>
              <div className="geistinhalt">
                <p className="eyebrow" style={{ marginBottom: 14 }}>Fragen &amp; Antworten</p>
                <h2 className="t2 strich" style={{ marginBottom: 20 }}>Häufige Fragen zu<br /><b className="vschrift">Website, Preis und KI.</b></h2>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="faqwahl">
              {[['mieten', 'globe', 'Zur Miete'], ['kaufen', 'download', 'Zum Kauf'], ['beide', 'circle-question', 'Allgemein']].map(([id, ic, t]) => (
                <button key={id} onClick={() => setFaqWeg(id)} className={faqWeg === id ? 'fw-an' : 'fw-aus'}>
                  <i className={`fa-solid fa-${ic}`} style={{ marginRight: 8 }} aria-hidden="true" />{t}
                </button>
              ))}
            </div>
          </Reveal>
          {FRAGEN.filter(q => q.weg === faqWeg || (faqWeg !== 'beide' && q.weg === 'beide' && q.top)).slice(0, 7).map((q, i) => (
            <Reveal key={q.f} verzug={i * 50}>
              <details className="karte frage">
                <summary><span style={{ flex: 1 }}>{q.f}</span><span className="plus" aria-hidden="true">+</span></summary>
                <p>{q.a}</p>
              </details>
            </Reveal>
          ))}
          <Reveal verzug={100}>
            <div style={{ marginTop: 20 }}><a href="/hilfe" className="btnleer"><i className="fa-solid fa-circle-question" aria-hidden="true" />Alle Fragen &amp; Antworten</a></div>
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
                <h2 className="t2 strich" style={{ marginBottom: 20 }}>In 10 Minuten<br /><b className="vschrift">zur eigenen Website.</b></h2>
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
                  <button className="btnfest" onClick={() => starten(null)}><i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />Kostenlos erstellen</button>
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
                <div className="trichter-kopf" style={{ borderColor: CI.blau, background: '#E7EFF3' }}>
                  <span className="trichter-nr" style={{ background: CI.blau }}>4</span>
                  <strong style={{ fontSize: 15.5 }}>Mieten oder kaufen — erst hier zahlen</strong>
                </div>
                <button className="btnfest" onClick={() => starten(null)} style={{ width: '100%', marginTop: 18, justifyContent: 'center' }}>
                  <i className="fa-solid fa-play" aria-hidden="true" />Bei Schritt 1 anfangen
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
              Ruf einfach <b className="vschrift-hell">an.</b>
            </h2>
            <p className="lauf" style={{ color: '#9FB2C0', maxWidth: 440 }}>
              Sag uns, was du vorhast. Meist wissen wir schon am Telefon, ob und wie wir es machen können.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href={TELEFON_LINK} className="btnhell"><i className="fa-solid fa-phone" style={{ marginRight: 10 }} aria-hidden="true" />{TELEFON}</a>
            <a href="/kontakt" className="btnleer" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.34)' }}><i className="fa-solid fa-envelope" aria-hidden="true" />Kontaktformular</a>
          </div>
        </div>
      </section>

      <Fuss />
      <Chat />
    </div>
  )
}

// ── Hero-Folie: Mieten oder Kaufen ──
function HeroFolie({ art, starten }) {
  const mieten = art === 'mieten'
  const fakten = mieten
    ? [['globe', 'Domain inklusive'], ['server', 'Hosting & SSL'], ['calendar-days', '12 Monate Laufzeit'], ['pen-to-square', 'Änderungen gratis']]
    : [['file-zipper', 'Quellcode als ZIP'], ['bolt', 'Sofort verfügbar'], ['ban', 'Keine Laufzeit'], ['pen-to-square', 'Änderungen gratis']]

  return (
    <div style={{ textAlign: 'center' }}>
      <span className="hmarke">
        <i className={`fa-solid fa-${mieten ? 'globe' : 'download'}`} aria-hidden="true" />
        {mieten ? `Website mieten — ab ${eur(19.90)} €/Monat` : `Website kaufen — ab ${eur(89)} € einmalig`}
      </span>

      <h1 className="t1" style={{ color: '#fff', margin: '20px auto 16px', maxWidth: 1000 }}>
        {mieten ? <>Sofort online.<br /><b>Wir kümmern uns.</b></> : <>Einmal zahlen.<br /><b>Dir gehört alles.</b></>}
      </h1>

      <p className="lauf" style={{ color: '#C7D6E0', maxWidth: 680, margin: '0 auto 28px', fontSize: 18.5 }}>
        {mieten
          ? 'Domain, Hosting, SSL und E-Mail laufen bei uns — du änderst deine Inhalte trotzdem jederzeit selbst.'
          : 'Du bekommst den kompletten Quellcode und betreibst die Website, wo du willst. Domain und Hosting bringst du selbst mit.'}
      </p>

      <div className="hknoepfe" style={{ justifyContent: 'center' }}>
        <button className="btnfest" onClick={() => starten(null)} style={{ fontSize: 16, padding: '17px 30px' }}>
          <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
          Kostenlos erstellen
        </button>
        <a href={mieten ? '/preise#mieten' : '/preise#kaufen'} className="btnleer hell">
          <i className="fa-solid fa-tags" aria-hidden="true" />
          {mieten ? 'Mietpakete ansehen' : 'Kaufpakete ansehen'}
        </a>
      </div>

      <ul className="hfakten" style={{ margin: '0 auto', justifyContent: 'center' }}>
        {fakten.map(([ic, t]) => (
          <li key={t}><i className={`fa-solid fa-${ic}`} aria-hidden="true" />{t}</li>
        ))}
      </ul>
    </div>
  )
}

const CSS = `
/* ══ HERO — Foto, alles zentriert, Domain-Check als Kernstück ══ */
.hero{position:relative}
.hmitte{display:flex;flex-direction:column;align-items:center;position:relative;max-width:1160px;margin:0 auto}
.hmarke{display:inline-flex;align-items:center;gap:10px;font-size:12.5px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:#fff;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.28);
  border-radius:99px;padding:9px 18px}
.hknoepfe{display:flex;gap:13px;flex-wrap:wrap;margin-bottom:28px}
.btnleer.hell{background:transparent;color:#fff;border-color:rgba(255,255,255,.4);padding:16px 25px;font-size:15.5px}
.btnleer.hell:hover{background:rgba(255,255,255,.1);border-color:#fff;color:#fff}
.hfakten{list-style:none;display:flex;flex-wrap:wrap;justify-content:center;gap:10px 30px;max-width:640px;margin-bottom:40px}
.hfakten li{display:flex;align-items:center;gap:9px;font-size:14px;font-weight:500;color:#DCE6EE}
.hfakten li i{color:#6FC3EF;font-size:13px;width:16px;text-align:center}

/* Domain-Check — minimalistische dunkle Suchleiste direkt im Hero, kein Kartenrahmen */
.dcheck{width:100%;max-width:700px;margin:52px auto 0;text-align:center}
.dcheck-label{display:flex;align-items:center;justify-content:center;gap:10px;font-size:19px;font-weight:700;color:#fff;margin-bottom:20px}
.dcheck-label i{color:#6FC3EF}
.dcheck-feld{display:flex;align-items:center;gap:0;background:rgba(255,255,255,.09);backdrop-filter:blur(6px);
  border:1.5px solid rgba(255,255,255,.22);border-radius:99px;padding:6px 6px 6px 26px;transition:all .18s}
.dcheck-feld:focus-within{border-color:${CI.blau};background:rgba(255,255,255,.13)}
.dcheck-www{color:rgba(255,255,255,.55);font-size:16px;font-weight:600;margin-right:2px;user-select:none}
.dcheck-feld input{flex:1;min-width:0;border:none;outline:none;font-size:16px;font-weight:500;color:#fff;
  padding:15px 0;background:transparent}
.dcheck-feld input::placeholder{color:rgba(255,255,255,.4)}
.dcheck-feld button{background:${CI.blau};color:#fff;border:none;border-radius:99px;padding:14px 26px;font-size:14.5px;
  font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:9px;white-space:nowrap;transition:all .18s}
.dcheck-feld button:hover{background:${CI.blauDunkel};transform:translateY(-1px)}
.dcheck-tlds{display:flex;justify-content:center;gap:8px;margin-top:16px;flex-wrap:wrap}
.dcheck-tlds span{display:flex;align-items:baseline;gap:6px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);
  border-radius:99px;padding:8px 16px;transition:all .18s}
.dcheck-tlds span:hover{background:rgba(255,255,255,.14)}
.dcheck-tlds b{font-size:13.5px;font-weight:700;color:#fff}
.dcheck-tlds em{font-style:normal;font-size:11px;color:rgba(255,255,255,.55)}
.dcheck-ergebnis{margin-top:16px;display:flex;flex-direction:column;gap:8px;text-align:left;
  background:#fff;border-radius:18px;padding:16px;box-shadow:0 24px 50px rgba(0,0,0,.35)}
.dcheck-hinweis{display:flex;gap:8px;justify-content:center;text-align:left;font-size:12.5px;color:rgba(255,255,255,.6);margin-top:18px}
.dcheck-hinweis i{color:#6FC3EF;margin-top:2px;flex-shrink:0}
.db-fehler{font-size:13.5px;color:#8A5A00;background:#FFF7E6;border:1px solid #F3DDA8;border-radius:10px;padding:11px 13px}
.db-belegt{font-size:12.5px;color:${CI.textMatt}}
.treffer{display:flex;align-items:center;gap:11px;padding:12px 14px;border-radius:12px;
  background:${CI.grau};border:1px solid ${CI.linie};flex-wrap:wrap;transition:all .2s}
.treffer:hover{border-color:${CI.gruen};transform:translateX(3px)}
.treffer>i{color:${CI.gruen};font-size:15px}
.treffer-erst{border-color:${CI.gruen};background:#F0FAF4}
.tr-frei{font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${CI.gruen}}
@media(max-width:640px){.dcheck-feld{flex-wrap:wrap;border-radius:22px;padding:14px}.dcheck-feld input{width:100%;padding:6px 4px}.dcheck-feld button{width:100%;justify-content:center;margin-top:8px}}

/* ══ Leistungskarten ══ */
.lkarte{padding:28px 26px;height:100%}
.lkarte i{font-size:19px;color:${CI.blau};background:#E7EFF3;width:48px;height:48px;border-radius:13px;
  display:flex;align-items:center;justify-content:center;margin-bottom:18px;transition:all .3s cubic-bezier(.2,.7,.3,1)}
.lkarte:hover i{background:${CI.blau};color:#fff;transform:translateY(-4px) scale(1.06)}

/* ══ Preisband dunkel ══ */
.preisband{display:grid;grid-template-columns:1fr 440px;gap:44px;align-items:center}
.preisband-karten{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pband{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:22px 20px;
  display:flex;flex-direction:column;transition:all .22s}
.pband:hover{background:rgba(255,255,255,.12);transform:translateY(-4px);border-color:${CI.orange}}
.pband-label{font-size:11.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${CI.orange}}
.pband-preis{font-size:15px;color:#A9C2D2;margin:9px 0 4px}
.pband-preis b{font-size:38px;font-weight:700;letter-spacing:-.035em;color:#fff;margin:0 3px}
.pband-unter{font-size:12.5px;color:#9FB2C0;line-height:1.6;flex:1}

/* ══ Große Auswahlknöpfe ══ */
.wahlleiste{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px}
.grosswahl{display:flex;align-items:center;gap:16px;text-align:left;border-radius:12px;padding:20px 22px;width:100%;
  cursor:pointer;transition:all .24s;border:2px solid}
.grosswahl i{font-size:21px;width:46px;height:46px;border-radius:11px;display:flex;align-items:center;
  justify-content:center;flex-shrink:0;transition:all .24s}
.grosswahl span{display:flex;flex-direction:column;gap:3px}
.grosswahl b{font-size:18px;font-weight:700;letter-spacing:-.02em}
.grosswahl em{font-style:normal;font-size:13px;font-weight:400}
.gw-an{background:${CI.petrol};color:#fff;border-color:${CI.petrol};box-shadow:0 14px 32px rgba(10,24,35,.22)}
.gw-an i{background:${CI.orange};color:#fff}
.gw-an em{color:#A9C2D2}
.gw-aus{background:#fff;color:${CI.text};border-color:${CI.linie}}
.gw-aus i{background:#E7EFF3;color:${CI.blau}}
.gw-aus em{color:${CI.textMatt}}
.gw-aus:hover{border-color:${CI.orange};transform:translateY(-3px)}

/* ══ Vergleich / Branche ══ */
.vergleich,.branche{display:grid;grid-template-columns:1.05fr .95fr;background:#fff;border:1px solid ${CI.linie};
  border-radius:16px;overflow:hidden}
.vergleich-text,.branche-text{padding:38px 36px}
.vergleich-bild,.branche-bild{min-height:390px;background-size:cover;background-position:center;transition:transform .7s cubic-bezier(.2,.7,.3,1)}
.vergleich:hover .vergleich-bild,.branche:hover .branche-bild{transform:scale(1.05)}

/* ══ Haken ══ */
.haken{list-style:none;display:flex;flex-direction:column;gap:13px}
.haken li{display:flex;align-items:center;gap:12px;font-size:14.8px;line-height:1.5;color:${CI.text}}
.haken li i{color:${CI.blau};font-size:11px;flex-shrink:0;width:22px;height:22px;border-radius:50%;
  background:#E7EFF3;display:flex;align-items:center;justify-content:center}
.haken.gruen li i{color:${CI.gruen};background:#E7F7EC;font-size:12px}
.dunkelzone .haken li,.sorgen .haken li{color:#DCE6EE}
.preis-top .haken li{color:#fff}
.preis-top .haken.gruen li i{background:rgba(255,255,255,.14);color:#8FE6B4}
.haken.zwei{display:grid;grid-template-columns:1fr 1fr;gap:11px 24px}

/* ══ Schritt-Karten ══ */
.schrittkarte{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:14px;
  padding:0 0 24px;overflow:hidden;height:100%;transition:all .26s}
.schrittkarte:hover{transform:translateY(-6px);border-color:${CI.orange};box-shadow:0 22px 46px rgba(0,0,0,.3)}
.schrittbild{position:relative;background:#fff}
.schrittbild img{width:100%;display:block}
.schrittbild-nr{position:absolute;top:14px;left:14px;background:${CI.orange};color:#fff;font-size:14px;font-weight:700;
  width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center}
.schrittkarte .schritt-dauer{display:inline-block;margin:20px 24px 0;font-size:11.5px;font-weight:700;
  letter-spacing:.12em;text-transform:uppercase;color:${CI.orange};background:rgba(245,146,0,.14);
  border:1px solid rgba(245,146,0,.32);border-radius:99px;padding:5px 12px}
.schrittkarte h3,.schrittkarte p{padding:0 24px}

/* ══ Reiter ══ */
.reiter{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:26px}
.reiter-an,.reiter-aus{border-radius:99px;padding:11px 20px;font-size:13.5px;font-weight:600;cursor:pointer;transition:all .2s;border:1.5px solid}
.reiter-an{background:${CI.blau};color:#fff;border-color:${CI.blau};box-shadow:0 10px 22px rgba(27,147,210,.28)}
.reiter-aus{background:#fff;color:${CI.textMatt};border-color:${CI.linie}}
.reiter-aus:hover{border-color:${CI.blau};color:${CI.blau};transform:translateY(-2px)}

/* ══ Preiskarten ══ */
.preis{padding:34px 30px;display:flex;flex-direction:column;height:100%;position:relative;overflow:visible;transition:transform .3s cubic-bezier(.2,.7,.3,1)}
.preis-top{background:linear-gradient(165deg,${CI.petrol},#0D2231);border-color:${CI.petrol};color:#fff;
  transform:scale(1.045);box-shadow:0 26px 60px rgba(10,24,36,.35);z-index:2}
.preis-top.karte-hover:hover{transform:scale(1.045) translateY(-6px);box-shadow:0 30px 66px rgba(10,24,36,.4)}
.preis-top .t3{color:#fff}
.preis-top .klein{color:#A9C2D2}
.eckband{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:${CI.blau};color:#fff;
  font-size:11px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;padding:8px 18px;border-radius:99px;
  box-shadow:0 8px 18px rgba(27,147,210,.4);white-space:nowrap}
.zahlweise{display:inline-flex;align-items:center;gap:8px;font-size:11.5px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;border-radius:99px;padding:7px 14px}
.zw-mieten{color:${CI.blau};background:#E7EFF3;border:1px solid rgba(27,147,210,.3)}
.zw-kaufen{color:${CI.gruen};background:#F1FAF4;border:1px solid rgba(31,157,85,.3)}
.preis-top .zw-mieten,.preis-top .zw-kaufen{background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.24)}
.preisblock{background:${CI.grau};border:1px solid ${CI.linie};border-radius:14px;padding:22px;margin-bottom:22px}
.preis-top .preisblock{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.16)}
.preiszeile{display:flex;align-items:baseline;gap:7px;font-size:15px;color:${CI.textMatt}}
.preiszeile b{font-size:clamp(44px,5vw,54px);font-weight:800;letter-spacing:-.035em;color:${CI.text};line-height:1}
.preiszeile.hell b{color:#fff}
.preiszeile.hell{color:#A9C2D2;justify-content:center}
.preis-unter{display:flex;flex-direction:column;gap:1px;margin-top:8px}
.preis-unter strong{font-size:16px;font-weight:700;color:${CI.text}}
.preis-unter span{font-size:13px;color:${CI.textMatt}}
.preis-top .preis-unter strong{color:#fff}
.preis-top .preis-unter span{color:#A9C2D2}
.preis-fakten{display:flex;flex-direction:column;gap:12px;margin-top:16px;padding-top:15px;border-top:1px solid ${CI.linie}}
.preis-top .preis-fakten{border-top-color:rgba(255,255,255,.16)}
.preis-fakten span{display:flex;gap:11px;align-items:flex-start;font-size:13.5px;color:${CI.textMatt};line-height:1.45}
.preis-fakten i{color:${CI.blau};font-size:12px;margin-top:3px;flex-shrink:0;width:14px;text-align:center}
.preis-fakten em{font-style:normal;display:block}
.preis-fakten b{font-weight:700;color:${CI.text}}
.preis-top .preis-fakten span{color:#C7D6E0}
.preis-top .preis-fakten b{color:#fff}
.preis-top .preis-fakten i{color:#6FC3EF}
.preis-top .btnleer{background:#fff;color:${CI.petrol};border-color:#fff}
.preis-top .btnleer:hover{background:${CI.grau}}

/* ══ Keine-Sorgen ══ */
.sorgen{margin-top:28px;display:grid;grid-template-columns:1fr 310px;gap:36px;align-items:center;position:relative;
  border-radius:16px;padding:38px 36px;color:#fff;overflow:hidden;background:linear-gradient(160deg,${CI.petrol},#0D2231)}
.sorgen-marke{display:inline-flex;align-items:center;font-size:11.5px;font-weight:700;letter-spacing:.13em;
  text-transform:uppercase;color:${CI.orange};border:1px solid rgba(245,146,0,.42);background:rgba(245,146,0,.12);
  border-radius:99px;padding:7px 15px}
.sorgen-preis{position:relative;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);
  border-radius:13px;padding:26px 24px;text-align:center}

/* ══ FAQ ══ */
.faqwahl{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:24px}
.fw-an,.fw-aus{border-radius:8px;padding:12px 20px;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;border:1.5px solid}
.fw-an{background:${CI.petrol};color:#fff;border-color:${CI.petrol}}
.fw-aus{background:#fff;color:${CI.textMatt};border-color:${CI.linie}}
.fw-aus:hover{border-color:${CI.orange};color:${CI.orange}}
.frage{padding:19px 23px;margin-bottom:10px;background:#fff;transition:all .22s}
.frage summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:15px;font-size:16.5px;font-weight:500}
.frage summary::-webkit-details-marker{display:none}
.frage:hover{border-color:${CI.orange}}
.frage[open]{border-color:${CI.orange}}
.frage[open] .plus{transform:rotate(45deg)}
.plus{transition:transform .26s;display:inline-block;font-size:22px;font-weight:300;color:${CI.orange};line-height:1}
.frage p{font-size:15px;color:${CI.textMatt};line-height:1.8;margin-top:14px}

/* ══ Anfrage-Trichter ══ */
.anfrage{display:grid;grid-template-columns:1fr 430px;gap:52px;align-items:center}
.trichter-gross{background:${CI.grau};border:1px solid ${CI.linie};border-radius:16px;padding:28px 26px}
.trichter-kopf{display:flex;align-items:center;gap:13px}
.trichter-nr{width:32px;height:32px;flex-shrink:0;border-radius:50%;background:${CI.petrol};color:#fff;
  display:flex;align-items:center;justify-content:center;font-size:14.5px;font-weight:700}
.trichter-gross .trichter-kopf{background:#fff;border:1.5px solid ${CI.linie};border-radius:10px;padding:15px 17px;transition:all .22s}
.trichter-gross .trichter-kopf:hover{border-color:${CI.orange};transform:translateX(5px)}
.trichter-pfeil{text-align:center;color:${CI.textZart};font-size:12px;padding:8px 0}

/* ══ MOBIL ══ */
@media(max-width:1060px){
  .preisband,.anfrage{grid-template-columns:1fr;gap:32px}
  .sorgen{grid-template-columns:1fr;gap:26px}
}
@media(max-width:860px){
  .vergleich,.branche{grid-template-columns:1fr}
  .vergleich-bild,.branche-bild{min-height:210px;order:-1}
  .haken.zwei{grid-template-columns:1fr}
  .preisband-karten{grid-template-columns:1fr}
  .wahlleiste{grid-template-columns:1fr}
  .dcheck-tlds{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:640px){
  .wrap{padding:0 18px}
  .hknoepfe{flex-direction:column;align-items:stretch}
  .hknoepfe .btnfest,.hknoepfe .btnleer{width:100%;justify-content:center}
  .hfakten{grid-template-columns:1fr}
  .dcheck{padding:24px 20px}
  .dcheck-feld{flex-wrap:wrap;border-radius:18px;padding:12px}
  .dcheck-feld input{width:100%;padding:8px 4px}
  .dcheck-feld button{width:100%;justify-content:center;margin-top:6px}
  .trichter-gross{padding:22px 20px}
  .vergleich-text,.branche-text{padding:26px 22px}
  .preis{padding:26px 22px}
  .sorgen{padding:28px 22px}
  .frage{padding:16px 18px}
  .frage summary{font-size:15.5px;gap:11px}
  .grosswahl{padding:16px 17px;gap:13px}
  .grosswahl b{font-size:16.5px}
  .schrittkarte h3,.schrittkarte p{padding:0 20px}
  .schrittkarte .schritt-dauer{margin-left:20px;margin-right:20px}
}
`
