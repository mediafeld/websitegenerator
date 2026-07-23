'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Kopf, D, BASIS_CSS } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'
import { KAUF, MIETE, MIETE_BEDINGUNGEN } from '@/lib/preise'

const BILD = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`

const BRANCHEN = [
  { id: 'handwerk', label: 'Handwerk & Bau', bild: 'photo-1504307651254-35680f356dfd', text: 'Leistungen, Referenzen, Notdienst-Hinweis und Anfahrt.' },
  { id: 'restaurant', label: 'Restaurant & Café', bild: 'photo-1517248135467-4c7edcad34c4', text: 'Speisekarte mit Kategorien, Öffnungszeiten, Reservierung.' },
  { id: 'praxis', label: 'Arzt & Praxis', bild: 'photo-1576091160550-2173dba999ef', text: 'Behandlungen, Sprechzeiten, Team und Terminhinweis.' },
  { id: 'anwalt', label: 'Anwalt & Kanzlei', bild: 'photo-1589829545856-d10d557cf95f', text: 'Rechtsgebiete, Werdegang, seriöser Ton, Erstberatung.' },
  { id: 'salon', label: 'Friseur & Beauty', bild: 'photo-1560066984-138dadb4c035', text: 'Leistungen mit Preisen, Galerie, Termin und Team.' },
  { id: 'fitness', label: 'Fitness & Sport', bild: 'photo-1534438327276-14e5300c3a48', text: 'Kursplan, Mitgliedschaften, Trainer und Probetraining.' },
  { id: 'immobilien', label: 'Immobilien', bild: 'photo-1560518883-ce09059eeffa', text: 'Objekte, Leistungen für Verkäufer, Bewertung anfragen.' },
  { id: 'agentur', label: 'Agentur & Beratung', bild: 'photo-1497366754035-f200968a6e72', text: 'Leistungen, Arbeitsweise, Referenzen, Erstgespräch.' },
  { id: 'fahrschule', label: 'Fahrschule & Bildung', bild: 'photo-1449965408869-eaa3f722e40d', text: 'Klassen, Preise, Unterrichtszeiten, Anmeldung.' },
  { id: 'andere', label: 'Andere Branche', bild: 'photo-1497366216548-37526070297c', text: 'Auch alles andere: Inhalte passen sich deinen Angaben an.' },
]

const EDITOR_FUNKTIONEN = [
  ['Text anklicken, tippen, fertig', 'Kein Menü, kein Umweg: Doppelklick auf den Text in der Vorschau und schreiben.'],
  ['Bilder tauschen oder erzeugen', 'Eigene Bilder hochladen oder ein neues per KI erzeugen lassen – direkt im Element.'],
  ['Blöcke hineinziehen', 'Über 15 Blocktypen: Hero, Leistungen, Preise, Galerie, FAQ, Trennlinien und mehr.'],
  ['Farben und Schriften', 'CI-Farbe wählen, alles zieht mit. Neun Schrift-Paare, aufeinander abgestimmt.'],
  ['Hintergründe pro Bereich', 'Bild, Farbverlauf mit Winkel, Muster, Parallax mit Geschwindigkeitsregler.'],
  ['Rückgängig & Vorschau', 'Jeder Schritt zurücknehmbar. Ansicht für Desktop, Tablet und Handy.'],
]

const FRAGEN = [
  { f: 'Was kostet eine Website hier genau?', a: 'Kaufen: einmalig 89 € (Onepager), 149 € (Multipage) oder 199 € (Business) – inklusive Mehrwertsteuer, kein Abo. Mieten: monatlich ab 19,90 € inklusive Domain, Hosting und SSL, bei 12 Monaten Mindestlaufzeit und einmalig 49 € Einrichtung. Zahlst du die Miete für zwölf Monate im Voraus, entfällt die Einrichtungsgebühr und du zahlst zehn statt zwölf Monate.' },
  { f: 'Was ist der Unterschied zwischen kaufen und mieten?', a: 'Beim Kauf bekommst du alle Dateien als ZIP und kannst sie bei jedem Anbieter betreiben – die Website gehört dir, Hosting und Domain besorgst du selbst. Bei der Miete läuft alles bei uns: Domain, Server, SSL, Sicherungen. Du kümmerst dich um nichts und kannst jederzeit im Editor Änderungen machen.' },
  { f: 'Wie lange läuft der Mietvertrag?', a: 'Zwölf Monate Mindestlaufzeit, danach monatlich kündbar. Der Grund für die zwölf Monate: Die Domain wird jahresweise bezahlt. Kündigen kannst du über deinen Kontobereich oder den Kündigungsknopf im Fuß der Seite – ohne Anruf, ohne Begründung.' },
  { f: 'Wie lange dauert es wirklich?', a: 'Die Angaben im Wizard brauchen etwa zehn Minuten, die Erstellung danach ein bis zwei Minuten. Für die Feinarbeit im Editor solltest du eine halbe Stunde einplanen – Texte prüfen, eigene Bilder einsetzen, Farben anpassen.' },
  { f: 'Brauche ich Vorkenntnisse?', a: 'Nein. Du beantwortest Fragen zu deinem Betrieb – Branche, Leistungen, Öffnungszeiten, Kontakt. Alles Weitere passiert automatisch. Im Editor änderst du Texte durch Anklicken, so wie in einem Textprogramm.' },
  { f: 'Kann ich eigene Bilder verwenden?', a: 'Ja, bis zu 20 Stück im Format WebP, JPG oder PNG. Du kannst jedes Bild beschreiben, damit es an der passenden Stelle landet. Wichtig: Du brauchst die Nutzungsrechte an den Bildern – das bestätigst du beim Hochladen. Zusätzlich werden je nach Paket 6 bis 12 Bilder für dich erzeugt.' },
  { f: 'Wem gehört die Website?', a: 'Dir. Beim Kauf bekommst du den kompletten Quellcode als ZIP – HTML und CSS, ohne Bindung an uns. Auch bei der Miete kannst du die Dateien jederzeit herunterladen und mitnehmen.' },
  { f: 'Bekomme ich eine E-Mail-Adresse dazu?', a: 'Bei der Miete ja. Im Paket Start ist eine Weiterleitung auf deine bestehende Adresse enthalten, ab Plus ein echtes Postfach mit Webmail und Spam-Filter. Weitere Postfächer kosten 3 € im Monat.' },
  { f: 'Wird die Website bei Google gefunden?', a: 'Die technischen Grundlagen sind vorhanden: saubere Überschriften, schnelle Ladezeit, für Handy optimiert, Titel und Beschreibung aus deinen SEO-Angaben. Eine Garantie für Platzierungen gibt es nicht – die hängt von Wettbewerb, Ort und Inhalten ab.' },
  { f: 'Was ist mit Impressum und Datenschutz?', a: 'Für die Inhalte deiner Website bist du verantwortlich, auch für Impressum und Datenschutzerklärung. Wir erzeugen dir aus deinen Angaben Vorlagen dafür. Das ist keine Rechtsberatung – lass die Texte bei besonderen Anforderungen prüfen, etwa bei Praxen, Kanzleien oder Onlineverkauf.' },
  { f: 'Kann ich später umsteigen?', a: 'Ja, in beide Richtungen. Vom Kauf in die Miete: Wir übernehmen deine Website auf unseren Server. Von der Miete zum Kauf: Du zahlst den Kaufpreis und nimmst die Dateien mit.' },
  { f: 'Und wenn mir das Ergebnis nicht gefällt?', a: 'Du siehst die fertige Website vor dem Bezahlen. Erst wenn sie dir gefällt, kaufst du. Du kannst den Wizard beliebig oft neu durchlaufen und Layouts, Farben und Texte ändern.' },
]

export default function Startseite() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [daten, setDaten] = useState(null)
  const [fehler, setFehler] = useState('')
  const [modus, setModus] = useState('kaufen')
  const [branche, setBranche] = useState(BRANCHEN[0])
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

  return (
    <div style={{ background: D.paper, color: D.dunkel, fontFamily: '"Inter Tight",system-ui,sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=Inter+Tight:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + SEITEN_CSS }} />

      <Kopf />

      {/* ══ HERO ══ */}
      <section id="domain" style={{ background: D.dunkel, color: '#fff', padding: '84px 0 76px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: `radial-gradient(900px 420px at 50% -8%, ${D.blau}44, transparent 70%)` }} />
        <div className="wrap" style={{ position: 'relative', maxWidth: 880, textAlign: 'center' }}>
          <p className="eyebrow" style={{ color: D.blauHell, marginBottom: 18 }}>Website-Baukasten mit KI · von mediafeld, Berlin</p>
          <h1 className="display" style={{ fontSize: 'clamp(38px,6.6vw,72px)', marginBottom: 20 }}>
            In 10 Minuten zur<br /><span style={{ color: D.blauHell }}>eigenen Website.</span>
          </h1>
          <p style={{ fontSize: 18, color: '#B7C4D9', lineHeight: 1.65, maxWidth: 580, margin: '0 auto 40px' }}>
            Für Handwerk, Gastronomie, Praxen und Dienstleister. Du machst die Angaben –
            Texte, Bilder und Aufbau entstehen automatisch. Kaufen ab 89 € oder mieten ab 19,90 €.
          </p>

          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div className="adresszeile" style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 14, padding: '9px 10px 9px 17px', boxShadow: '0 20px 50px rgba(0,0,0,.28)' }}>
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
            <p style={{ fontSize: 12.5, color: '#8496AE', marginTop: 12 }}>Firmenname eingeben – wir prüfen live, welche Adresse noch frei ist.</p>
          </div>

          {fehler && (
            <div style={{ maxWidth: 640, margin: '20px auto 0', padding: '14px 16px', textAlign: 'left', fontSize: 13.5, color: '#FDE68A', background: '#1C2E44', border: '1px solid #33465F', borderRadius: 12, lineHeight: 1.55 }}>{fehler}</div>
          )}

          {daten && (
            <div style={{ maxWidth: 640, margin: '22px auto 0', textAlign: 'left' }}>
              {freie.map((e, i) => (
                <div key={e.domain} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', marginBottom: 8, borderRadius: 12, background: i === 0 ? '#123726' : '#132234', border: `1px solid ${i === 0 ? '#1F6B44' : '#2A3C53'}` }}>
                  <span aria-hidden="true" style={{ color: '#4ADE80', fontWeight: 800 }}>✓</span>
                  <span style={{ flex: 1, fontSize: 15.5, fontWeight: 700, color: '#fff' }}>{e.domain}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#4ADE80', whiteSpace: 'nowrap' }}>{e.preis ? `${e.preis.toFixed(2).replace('.', ',')} € / Jahr` : 'frei'}</span>
                  <button className="btnfest" onClick={() => starten(e.domain)} style={{ padding: '9px 15px', fontSize: 12.5, whiteSpace: 'nowrap' }}>Diese nehmen</button>
                </div>
              ))}
              {belegte.length > 0 && <p style={{ fontSize: 12.5, color: '#8496AE', marginTop: 10 }}>Schon vergeben: {belegte.map(e => e.domain).join(' · ')}</p>}
              {freie.length === 0 && (
                <div style={{ padding: 16, borderRadius: 12, background: '#132234', border: '1px solid #2A3C53', fontSize: 13.5, color: '#B7C4D9', lineHeight: 1.6 }}>
                  Alle geprüften Adressen sind belegt. Probier einen Zusatz – den Ort oder die Leistung, etwa „mueller-sanitaer-berlin".
                  <div style={{ marginTop: 12 }}><button className="btnfest" onClick={() => starten(null)}>Ohne Domain starten</button></div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginTop: 42, fontSize: 13, color: '#8496AE' }}>
            {['Kein Abo beim Kauf', 'Alle Dateien zum Mitnehmen', 'Erst sehen, dann zahlen'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span aria-hidden="true" style={{ color: D.blauHell, fontWeight: 800 }}>✓</span>{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABLAUF ══ */}
      <section id="ablauf" style={{ background: D.weiss, borderBottom: `1px solid ${D.linie}`, padding: '72px 0' }}>
        <div className="wrap">
          <p className="eyebrow" style={{ color: D.blau, marginBottom: 12 }}>Bereich 01 — Ablauf</p>
          <h2 className="display" style={{ fontSize: 'clamp(27px,3.8vw,40px)', marginBottom: 12 }}>
            Drei Schritte. <span className="leicht" style={{ color: D.grau }}>Eine Sitzung.</span>
          </h2>
          <p style={{ fontSize: 15.5, color: D.grau, maxWidth: 560, marginBottom: 42, lineHeight: 1.65 }}>
            Vom leeren Blatt zur fertigen Website, ohne Termin und ohne Warteschleife.
          </p>
          <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {[
              ['Angaben machen', 'Branche wählen, Firmendaten eintragen, Stil und Schrift festlegen. Acht kurze Schritte, keine Technik.', '~10 Minuten'],
              ['Website entsteht', 'Texte, Bilder und Aufbau werden für deine Branche erzeugt – aus deinen Angaben, nicht aus einer Vorlage.', '~2 Minuten'],
              ['Anpassen & übernehmen', 'Im Editor Texte, Farben und Bilder ändern. Dann kaufen und herunterladen oder online stellen lassen.', 'so lange du magst'],
            ].map(([t, u, z], i) => (
              <div key={t} className="karte karte-hover" style={{ padding: '24px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span className="display" style={{ fontSize: 12.5, color: '#fff', background: D.blau, borderRadius: 8, padding: '5px 10px', letterSpacing: 0 }}>Schritt {i + 1}</span>
                  <span style={{ flex: 1, height: 1, background: D.linie }} />
                  <span style={{ fontSize: 11.5, color: D.grauHell, fontWeight: 600 }}>{z}</span>
                </div>
                <h3 className="display" style={{ fontSize: 18.5, marginBottom: 9, letterSpacing: '-0.02em' }}>{t}</h3>
                <p style={{ fontSize: 14.5, color: D.grau, lineHeight: 1.66 }}>{u}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BRANCHEN ══ */}
      <section id="branchen" style={{ padding: '72px 0' }}>
        <div className="wrap">
          <p className="eyebrow" style={{ color: D.blau, marginBottom: 12 }}>Bereich 02 — Branchen</p>
          <h2 className="display" style={{ fontSize: 'clamp(27px,3.8vw,40px)', marginBottom: 12 }}>
            Inhalte, die zur <span className="leicht" style={{ color: D.grau }}>Branche passen.</span>
          </h2>
          <p style={{ fontSize: 15.5, color: D.grau, maxWidth: 620, marginBottom: 32, lineHeight: 1.65 }}>
            Ein Restaurant braucht eine Speisekarte, eine Kanzlei Rechtsgebiete, ein Handwerksbetrieb
            den Notdienst. Wähle deine Branche und sieh, was du bekommst.
          </p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 26 }}>
            {BRANCHEN.map(b => (
              <button key={b.id} onClick={() => setBranche(b)} className="chip" style={branche.id === b.id ? { background: D.blau, color: '#fff', borderColor: D.blau } : undefined}>
                {b.label}
              </button>
            ))}
          </div>

          <div className="karte" style={{ overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.15fr 1fr' }}>
            <div style={{ padding: '32px 30px' }}>
              <h3 className="display" style={{ fontSize: 23, marginBottom: 12 }}>{branche.label}</h3>
              <p style={{ fontSize: 15, color: D.grau, lineHeight: 1.7, marginBottom: 22 }}>{branche.text}</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 26 }}>
                {['Passende Texte und Wortwahl', 'Branchentypische Bereiche', 'Bilder zur Branche', 'Schrift- und Farbempfehlung'].map(t => (
                  <li key={t} style={{ display: 'flex', gap: 10, fontSize: 14.5, color: '#41506B' }}>
                    <span aria-hidden="true" style={{ color: D.blau, fontWeight: 800 }}>✓</span>{t}
                  </li>
                ))}
              </ul>
              <button className="btnfest" onClick={() => starten(null)}>Für {branche.label} starten</button>
            </div>
            <div style={{ minHeight: 320, background: `#E6EBF4 center/cover url(${BILD(branche.bild)})` }} role="img" aria-label={`Beispielbild ${branche.label}`} />
          </div>
        </div>
      </section>

      {/* ══ EDITOR ══ */}
      <section id="editor" style={{ background: D.weiss, borderTop: `1px solid ${D.linie}`, borderBottom: `1px solid ${D.linie}`, padding: '72px 0' }}>
        <div className="wrap">
          <p className="eyebrow" style={{ color: D.blau, marginBottom: 12 }}>Bereich 03 — Editor</p>
          <h2 className="display" style={{ fontSize: 'clamp(27px,3.8vw,40px)', marginBottom: 12 }}>
            Alles änderbar. <span className="leicht" style={{ color: D.grau }}>Ohne Technik.</span>
          </h2>
          <p style={{ fontSize: 15.5, color: D.grau, maxWidth: 580, marginBottom: 40, lineHeight: 1.65 }}>
            Du siehst deine Website und klickst hinein. Was du anklickst, kannst du ändern.
          </p>
          <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {EDITOR_FUNKTIONEN.map(([t, u]) => (
              <div key={t} className="karte karte-hover" style={{ padding: '22px 20px' }}>
                <h3 className="display" style={{ fontSize: 16.5, marginBottom: 8, letterSpacing: '-0.02em' }}>{t}</h3>
                <p style={{ fontSize: 14, color: D.grau, lineHeight: 1.65 }}>{u}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PREISE ══ */}
      <section id="preise" style={{ padding: '72px 0' }}>
        <div className="wrap">
          <p className="eyebrow" style={{ color: D.blau, marginBottom: 12 }}>Bereich 04 — Preise</p>
          <h2 className="display" style={{ fontSize: 'clamp(27px,3.8vw,40px)', marginBottom: 12 }}>
            Kaufen oder <span className="leicht" style={{ color: D.grau }}>mieten.</span>
          </h2>
          <p style={{ fontSize: 15.5, color: D.grau, maxWidth: 620, marginBottom: 28, lineHeight: 1.65 }}>
            Kaufen heißt: einmal zahlen, alle Dateien gehören dir. Mieten heißt: monatlich zahlen,
            Domain und Server laufen bei uns und du kümmerst dich um nichts.
          </p>

          <div id="kaufen" style={{ display: 'inline-flex', background: D.weiss, border: `1px solid ${D.linie}`, borderRadius: 11, padding: 4, marginBottom: 30 }}>
            {[['kaufen', 'Kaufen · einmalig'], ['mieten', 'Mieten · monatlich']].map(([id, t]) => (
              <button key={id} onClick={() => setModus(id)} style={{
                border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                background: modus === id ? D.blau : 'transparent', color: modus === id ? '#fff' : D.grau, transition: 'all .15s',
              }}>{t}</button>
            ))}
          </div>

          <div id="mieten" className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, alignItems: 'stretch' }}>
            {(modus === 'kaufen' ? KAUF : MIETE).map(p => (
              <div key={p.id} className="karte karte-hover" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', position: 'relative', borderColor: p.beliebt ? D.blau : D.linie, borderWidth: p.beliebt ? 2 : 1 }}>
                {p.beliebt && (
                  <span className="display" style={{ position: 'absolute', top: -11, left: 22, background: D.blau, color: '#fff', fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 11px', borderRadius: 99 }}>Meist gewählt</span>
                )}
                <h3 className="display" style={{ fontSize: 20, marginBottom: 4 }}>{p.name}</h3>
                <p style={{ fontSize: 13, color: D.grau, marginBottom: 18 }}>{p.kurz}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 6 }}>
                  <span className="display" style={{ fontSize: 42 }}>{String(p.preis).replace('.', ',')}</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: D.grau }}>€</span>
                  <span style={{ fontSize: 12.5, color: D.grauHell, marginLeft: 4 }}>{modus === 'kaufen' ? 'einmalig' : '/ Monat'}</span>
                </div>
                <p style={{ fontSize: 11.5, color: D.grauHell, marginBottom: 20 }}>
                  {modus === 'kaufen' ? 'inkl. MwSt. · kein Abo' : `inkl. MwSt. · oder ${p.jahr} € im Jahr`}
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24, flex: 1 }}>
                  {p.punkte.map(t => (
                    <li key={t} style={{ display: 'flex', gap: 9, fontSize: 14, color: '#41506B', lineHeight: 1.5 }}>
                      <span aria-hidden="true" style={{ color: D.blau, fontWeight: 800 }}>✓</span>{t}
                    </li>
                  ))}
                </ul>
                <button className={p.beliebt ? 'btnfest' : 'btnleer'} onClick={() => starten(null)} style={{ width: '100%', padding: 12 }}>
                  Mit {p.name} starten
                </button>
              </div>
            ))}
          </div>

          <div className="karte" style={{ marginTop: 20, padding: '18px 20px', display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
            <p style={{ fontSize: 13.5, color: D.grau, flex: 1, minWidth: 260, lineHeight: 1.6 }}>
              {modus === 'mieten'
                ? `${MIETE_BEDINGUNGEN.laufzeit}, ${MIETE_BEDINGUNGEN.danach}. Einrichtung ${MIETE_BEDINGUNGEN.einrichtung}. ${MIETE_BEDINGUNGEN.jahresvorteil}`
                : 'Einmalzahlung, kein Abo. Domain und Hosting kannst du separat dazubuchen oder selbst mitbringen.'}
            </p>
            <a href="/preise" className="btnleer" style={{ display: 'inline-block' }}>Alle Preise im Detail →</a>
          </div>
        </div>
      </section>

      {/* ══ VERTRAUEN ══ */}
      <section style={{ background: D.dunkel, color: '#fff', padding: '58px 0' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 30 }}>
          {[
            ['Von einer echten Agentur', 'Hinter dem Generator steht mediafeld in Berlin – seit 2014 im Geschäft, telefonisch erreichbar.'],
            ['Deine Dateien, dein Eigentum', 'Kompletter Quellcode als ZIP. Kein Anbieterzwang, kein Umzugsproblem später.'],
            ['Kein Abo im Kaufpreis', 'Beim Kauf zahlst du einmal. Monatliche Kosten nur, wenn du Domain und Hosting mietest.'],
            ['Erst sehen, dann zahlen', 'Du gehst durch den Wizard und siehst die fertige Website, bevor Geld fließt.'],
          ].map(([t, u]) => (
            <div key={t}>
              <h3 className="display" style={{ fontSize: 16.5, marginBottom: 8 }}>{t}</h3>
              <p style={{ fontSize: 13.5, color: '#98A8C0', lineHeight: 1.66 }}>{u}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FRAGEN ══ */}
      <section id="fragen" style={{ padding: '72px 0' }}>
        <div className="wrap" style={{ maxWidth: 780 }}>
          <p className="eyebrow" style={{ color: D.blau, marginBottom: 12 }}>Bereich 05 — Fragen</p>
          <h2 className="display" style={{ fontSize: 'clamp(27px,3.8vw,40px)', marginBottom: 12 }}>
            Häufige <span className="leicht" style={{ color: D.grau }}>Fragen.</span>
          </h2>
          <p style={{ fontSize: 15.5, color: D.grau, marginBottom: 30, lineHeight: 1.65 }}>
            Kurz und sachlich. Ist deine Frage nicht dabei, ruf an: <a className="link-u" href="tel:+493057702366" style={{ color: D.blau, fontWeight: 600 }}>030 57 70 23 66</a>
          </p>
          {FRAGEN.map(q => (
            <details key={q.f} className="karte frage" style={{ padding: '15px 18px', marginBottom: 9 }}>
              <summary style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15.5, fontWeight: 700 }}>
                <span style={{ flex: 1 }}>{q.f}</span>
                <span className="plus" aria-hidden="true" style={{ color: D.blau, fontSize: 19, fontWeight: 700, lineHeight: 1 }}>+</span>
              </summary>
              <p style={{ fontSize: 14.5, color: D.grau, lineHeight: 1.75, marginTop: 12 }}>{q.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ══ ABSCHLUSS ══ */}
      <section style={{ padding: '4px 0 76px' }}>
        <div className="wrap">
          <div style={{ background: `linear-gradient(140deg,${D.dunkel},${D.blau})`, borderRadius: 18, padding: '52px 34px', textAlign: 'center' }}>
            <h2 className="display" style={{ fontSize: 'clamp(25px,3.6vw,36px)', color: '#fff', marginBottom: 12 }}>Schauen kostet nichts.</h2>
            <p style={{ fontSize: 15.5, color: '#D3DEF8', maxWidth: 470, margin: '0 auto 28px', lineHeight: 1.65 }}>
              Geh die Fragen durch und sieh dir das Ergebnis an. Bezahlt wird erst, wenn dir die Website gefällt.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btnhell" onClick={() => starten(null)}>Website erstellen</button>
              <a href="/preise" style={{ border: '1px solid rgba(255,255,255,.35)', color: '#fff', borderRadius: 10, padding: '13px 24px', fontSize: 14.5, fontWeight: 700, display: 'inline-block' }}>Preise ansehen</a>
            </div>
          </div>
        </div>
      </section>

      <Fuss />
    </div>
  )
}

const SEITEN_CSS = `
.caret{display:inline-block;width:2px;height:1.05em;background:${D.blau};vertical-align:-.16em;animation:blink 1.1s step-end infinite}
@keyframes blink{50%{opacity:0}}
.chip{background:#fff;border:1px solid ${D.linie};border-radius:99px;padding:9px 15px;font-size:13px;font-weight:600;color:${D.grau};cursor:pointer;transition:all .15s}
.chip:hover{border-color:${D.blau};color:${D.blau};transform:translateY(-1px)}
.frage summary{cursor:pointer;list-style:none}
.frage summary::-webkit-details-marker{display:none}
.frage[open] .plus{transform:rotate(45deg)}
.plus{transition:transform .18s ease;display:inline-block}
.frage:hover{border-color:${D.blau}}
@media (max-width:860px){
  .karte[style*="1.15fr"]{grid-template-columns:1fr !important}
}
@media (max-width:760px){.adresszeile{flex-wrap:wrap}}
`
