'use client'
import { Seite, Abschluss } from '@/components/Seite'
import { D } from '@/components/Kopf'

const SCHRITTE = [
  { nr: '01', dauer: 'ca. 10 Minuten', t: 'Angaben machen', u: 'Du gehst acht kurze Schritte durch: Paket, Branche, Firmendaten, Details zu deinem Betrieb, Stil und Zielgruppe, Farbe und Schrift, SEO-Begriffe und die Seitenstruktur.', punkte: ['Keine Technik, nur Fragen zu deinem Betrieb', 'Eigene Bilder und Logo hochladen (bis 20 Stück)', 'Jederzeit zurückspringen und ändern'] },
  { nr: '02', dauer: 'ca. 2 Minuten', t: 'Website entsteht', u: 'Aus deinen Angaben entstehen Texte, Bilder und der Aufbau der Seite — passend zu deiner Branche, nicht aus einer Vorlage abgetippt.', punkte: ['Texte in deiner Ansprache (Du oder Sie)', 'Bilder passend zur Branche', 'Deine eigenen Bilder werden eingesetzt'] },
  { nr: '03', dauer: 'so lange du magst', t: 'Anpassen', u: 'Im Editor klickst du in die Seite und änderst, was du willst: Texte, Farben, Bilder, Reihenfolge der Bereiche.', punkte: ['Doppelklick auf Text und tippen', 'Blöcke hineinziehen und verschieben', 'Jeder Schritt rückgängig machbar'] },
  { nr: '04', dauer: 'sofort', t: 'Übernehmen', u: 'Kaufen und als ZIP herunterladen — oder mieten, dann stellen wir sie unter deiner Domain online.', punkte: ['Kompletter Quellcode (HTML/CSS)', 'Oder online inkl. Domain, SSL und E-Mail', 'Später jederzeit selbst weiter ändern'] },
]

export default function SoFunktioniertEs() {
  return (
    <Seite
      eyebrow="Ablauf"
      titel="So funktioniert es."
      titelLeicht="Vier Schritte, eine Sitzung."
      einleitung="Vom leeren Blatt zur fertigen Website — ohne Termin, ohne Warteschleife und ohne dass du etwas installieren musst."
      css={`
        .stufe{position:relative;padding-left:78px}
        .stufe:not(:last-child){padding-bottom:34px}
        .stufe:not(:last-child):before{content:'';position:absolute;left:26px;top:56px;bottom:0;width:2px;background:linear-gradient(${D.blau},${D.linie})}
        .nr{position:absolute;left:0;top:0;width:54px;height:54px;border-radius:15px;background:${D.blau};color:#fff;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;letter-spacing:-.02em;box-shadow:0 8px 22px rgba(29,78,216,.3);transition:transform .2s}
        .stufe:hover .nr{transform:scale(1.06) rotate(-3deg)}
      `}
    >
      <section style={{ padding: '54px 0 20px' }}>
        <div className="wrap" style={{ maxWidth: 1040 }}>
          {SCHRITTE.map(s => (
            <div key={s.nr} className="stufe">
              <div className="nr">{s.nr}</div>
              <div className="karte karte-hover" style={{ padding: '24px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                  <h2 className="display" style={{ fontSize: 21, letterSpacing: '-.025em' }}>{s.t}</h2>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: D.blau, background: D.blauZart, borderRadius: 99, padding: '3px 10px' }}>{s.dauer}</span>
                </div>
                <p style={{ fontSize: 15, color: D.textMatt, lineHeight: 1.7, marginBottom: 16 }}>{s.u}</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {s.punkte.map(p => (
                    <li key={p} style={{ display: 'flex', gap: 9, fontSize: 14, color: '#41506B' }}>
                      <span aria-hidden="true" style={{ color: D.blau, fontWeight: 800 }}>✓</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Volle Kontrolle */}
      <section style={{ padding: '30px 0 10px' }}>
        <div className="wrap" style={{ maxWidth: 1040 }}>
          <div className="karte" style={{ padding: '30px 28px', borderColor: D.blau, borderWidth: 2 }}>
            <h2 className="display" style={{ fontSize: 23, marginBottom: 12 }}>Du bleibst selbst am Steuer.</h2>
            <p style={{ fontSize: 15, color: D.textMatt, lineHeight: 1.75, marginBottom: 18 }}>
              Das ist der wichtigste Unterschied zur Agentur: Änderungen an deiner Website machst du
              selbst — jederzeit, so oft du willst, ohne Zusatzkosten. Neue Öffnungszeiten,
              neuer Preis, neues Foto vom Team? Einloggen, anklicken, ändern, fertig.
            </p>
            <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[
                ['Keine Stundensätze', 'Du zahlst nichts für Textänderungen oder neue Bilder.'],
                ['Kein Warten', 'Keine E-Mail an die Agentur, keine Rückfrage, kein Termin.'],
                ['Volle Kontrolle', 'Es ist deine Website — du entscheidest, was drinsteht.'],
              ].map(([t, u]) => (
                <div key={t} style={{ background: D.paper, borderRadius: 12, padding: '16px 16px' }}>
                  <strong style={{ fontSize: 14.5, display: 'block', marginBottom: 5 }}>{t}</strong>
                  <span style={{ fontSize: 13.5, color: D.textMatt, lineHeight: 1.6 }}>{u}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Abschluss />
    </Seite>
  )
}
