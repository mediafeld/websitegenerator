'use client'
import { useState } from 'react'
import { Seite, Abschluss } from '@/components/Seite'
import { D } from '@/components/Kopf'
import { Reveal, Zaehler } from '@/components/Effekte'

const TABS = [
  {
    id: 'texte', icon: 'font', titel: 'Texte & Inhalte',
    intro: 'Jeder Text auf deiner Website ist anklickbar. Kein Formular, kein Umweg über ein Adminmenü — du tippst direkt in der Vorschau, genau da, wo der Text am Ende auch steht.',
    punkte: [
      ['Text direkt bearbeiten', 'Doppelklick auf einen Text in der Vorschau, tippen, fertig.'],
      ['Überschriften und Absätze', 'Schriftgröße stufenlos, fett, kursiv, unterstrichen, Ausrichtung.'],
      ['Textfarbe', 'Farbwähler plus Schnellzugriff auf deine CI-Farben.'],
      ['SEO-Titel & Beschreibung', 'Für jede Seite einzeln einstellbar, direkt im Editor.'],
    ],
  },
  {
    id: 'bilder', icon: 'image', titel: 'Bilder',
    intro: 'Bilder tauschst du genauso einfach wie Text — anklicken, ersetzen. Für den Anfang brauchst du nicht einmal eigene Fotos.',
    punkte: [
      ['Eigene Bilder hochladen', 'Anklicken, hochladen, fertig. Wird automatisch verkleinert und als WebP gespeichert.'],
      ['Bilder per KI erzeugen', 'Beschreiben statt suchen. Bilder-Kontingent nach Paket, Restanzeige immer sichtbar.'],
      ['Galerien', 'Mehrere Bilder in einem Raster, einzeln austauschbar.'],
      ['Zuschnitt & Fokuspunkt', 'Bestimmst du, welcher Bildausschnitt auf Handy und Desktop zu sehen ist.'],
    ],
  },
  {
    id: 'bloecke', icon: 'layer-group', titel: 'Bereiche & Blöcke',
    intro: 'Deine Website besteht aus Bausteinen. Du ziehst neue hinein, ordnest sie um oder entfernst sie — ohne dass etwas anderes auf der Seite kaputtgeht.',
    punkte: [
      ['Über 15 Blocktypen', 'Hero, Leistungen, Preise, Team, Galerie, FAQ, Ablauf, Zahlen, Bild, Trennlinie und mehr.'],
      ['Mehrere Vorlagen je Block', 'Jeder Block hat verschiedene Designs — mit Live-Vorschau vor dem Einsetzen.'],
      ['Verschieben und duplizieren', 'Bereiche nach oben oder unten, kopieren, löschen.'],
      ['Per Drag-and-drop einfügen', 'Aus der Blockbibliothek direkt an die gewünschte Stelle ziehen.'],
    ],
  },
  {
    id: 'gestaltung', icon: 'palette', titel: 'Gestaltung',
    intro: 'Eine Website soll wie ein Guss aussehen. Deshalb hängt bei uns alles an wenigen zentralen Reglern statt an hundert Einzeleinstellungen.',
    punkte: [
      ['CI-Farbe', 'Eine Farbe wählen — die ganze Website zieht mit, inklusive Abstufungen.'],
      ['Schrift-Paare', 'Neun aufeinander abgestimmte Kombinationen, alle als freie Google Fonts.'],
      ['Hintergründe pro Bereich', 'Bild, Farbe, Farbverlauf mit Winkelregler oder Muster — frei kombinierbar.'],
      ['Parallax', 'Bild bewegt sich beim Scrollen, Geschwindigkeit von −1,0 bis +1,0 einstellbar.'],
    ],
  },
  {
    id: 'sicherheit', icon: 'shield-halved', titel: 'Sicherheit beim Arbeiten',
    intro: 'Damit du beim Ausprobieren nichts kaputt machen kannst, sichert der Editor jeden Schritt automatisch mit.',
    punkte: [
      ['Rückgängig und Wiederholen', 'Bis zu 50 Schritte zurück, jederzeit.'],
      ['Automatisch gespeichert', 'Jede Änderung wird sofort in deinem Konto gesichert.'],
      ['Ansicht prüfen', 'Desktop, Tablet und Handy in der Vorschau umschalten.'],
      ['Frühere Stände', 'Bei größeren Umbauten kannst du auf ältere Versionen zurück.'],
    ],
  },
]

const BLOCKTYPEN = [
  'Hero', 'Leistungen', 'Preise', 'Team', 'Galerie', 'FAQ', 'Ablauf', 'Zahlen & Statistik',
  'Testimonials', 'Logos', 'Bild-Text', 'Kontaktformular', 'Karte', 'Öffnungszeiten', 'Trennlinie', 'CTA-Banner',
]

// ── Mockups: zeigen, wie sich die jeweilige Funktion anfühlt — ohne Fake-Screenshots ──
function MockRahmen({ children }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${D.linie}`, borderRadius: 16, padding: 22, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
      {children}
    </div>
  )
}

function TexteMock() {
  return (
    <MockRahmen>
      <div style={{ height: 10, width: '55%', background: D.linie, borderRadius: 4 }} />
      <div style={{ position: 'relative', border: `1.5px dashed ${D.blau}`, borderRadius: 8, padding: '10px 12px', background: '#E7EFF3' }}>
        <div style={{ height: 12, width: '80%', background: D.blau, opacity: 0.28, borderRadius: 3, marginBottom: 7 }} />
        <div style={{ height: 12, width: '46%', background: D.blau, opacity: 0.28, borderRadius: 3 }} />
        <span style={{ position: 'absolute', top: -13, left: 10, background: D.blau, color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 99 }}>
          <i className="fa-solid fa-pen" style={{ marginRight: 5 }} aria-hidden="true" />bearbeitbar
        </span>
      </div>
      <div style={{ height: 9, width: '70%', background: D.linie, borderRadius: 4 }} />
      <div style={{ height: 9, width: '38%', background: D.linie, borderRadius: 4 }} />
      <div style={{ display: 'flex', gap: 7, marginTop: 4 }}>
        {['bold', 'italic', 'underline', 'align-left'].map(ic => (
          <span key={ic} style={{ width: 28, height: 28, borderRadius: 8, background: D.hellGrund, display: 'flex', alignItems: 'center', justifyContent: 'center', color: D.blau, fontSize: 12 }}>
            <i className={`fa-solid fa-${ic}`} aria-hidden="true" />
          </span>
        ))}
      </div>
    </MockRahmen>
  )
}

function BilderMock() {
  return (
    <MockRahmen>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            aspectRatio: '4/3', borderRadius: 10, background: i === 0 ? '#E7EFF3' : D.hellGrund,
            border: i === 0 ? `1.5px dashed ${D.blau}` : `1px solid ${D.linie}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: i === 0 ? D.blau : D.grauHell, fontSize: 18,
          }}>
            <i className={`fa-solid ${i === 0 ? 'fa-cloud-arrow-up' : 'fa-image'}`} aria-hidden="true" />
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: D.textMatt, textAlign: 'center' }}>Anklicken zum Ersetzen — oder mit KI erzeugen</div>
    </MockRahmen>
  )
}

function BloeckeMock() {
  const bloecke = [['Hero', true], ['Leistungen', false], ['Preise', false]]
  return (
    <MockRahmen>
      {bloecke.map(([n, aktiv]) => (
        <div key={n} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 9,
          background: aktiv ? '#E7EFF3' : D.hellGrund, border: aktiv ? `1.5px solid ${D.blau}` : `1px solid ${D.linie}`,
        }}>
          <i className="fa-solid fa-grip-vertical" style={{ color: D.grauHell, fontSize: 12 }} aria-hidden="true" />
          <span style={{ fontSize: 13, fontWeight: 700, color: aktiv ? D.blau : D.text }}>{n}</span>
          {aktiv && <span style={{ marginLeft: 'auto', fontSize: 10.5, color: D.blau, fontWeight: 700 }}>wird verschoben …</span>}
        </div>
      ))}
      <div style={{ border: `1.5px dashed ${D.linie}`, borderRadius: 9, padding: '9px 12px', fontSize: 12, color: D.grauHell, textAlign: 'center' }}>
        + Block hierher ziehen
      </div>
    </MockRahmen>
  )
}

function GestaltungMock() {
  return (
    <MockRahmen>
      <div>
        <div style={{ fontSize: 11, color: D.grauHell, marginBottom: 8 }}>CI-Farbe</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[D.blau, '#0A1824', '#1F9D55', '#8A99A6', '#FF5722'].map((c, i) => (
            <span key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: i === 0 ? `2px solid ${D.blau}` : '2px solid transparent', outline: i === 0 ? `2px solid ${D.blau}` : 'none', outlineOffset: 2 }} />
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, color: D.grauHell, marginBottom: 8 }}>Schrift-Paar</div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: D.text }}>Aa</span>
          <span style={{ fontSize: 15, fontWeight: 400, color: D.textMatt }}>Aa Fließtext</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, color: D.grauHell, marginBottom: 8 }}>Hintergrund-Verlauf</div>
        <div style={{ height: 18, borderRadius: 99, background: `linear-gradient(90deg, ${D.blau}, #0A1824)` }} />
      </div>
    </MockRahmen>
  )
}

function SicherheitMock() {
  return (
    <MockRahmen>
      <div style={{ display: 'flex', gap: 10 }}>
        <span style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 0', borderRadius: 9, background: D.hellGrund, fontSize: 12.5, fontWeight: 700, color: D.text }}>
          <i className="fa-solid fa-rotate-left" aria-hidden="true" />Rückgängig
        </span>
        <span style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 0', borderRadius: 9, background: D.hellGrund, fontSize: 12.5, fontWeight: 700, color: D.text }}>
          <i className="fa-solid fa-rotate-right" aria-hidden="true" />Wiederholen
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 9, background: '#F0FAF4', border: '1px solid rgba(31,157,85,.3)' }}>
        <i className="fa-solid fa-circle-check" style={{ color: D.gruen }} aria-hidden="true" />
        <span style={{ fontSize: 12.5, color: D.gruen, fontWeight: 700 }}>Automatisch gespeichert</span>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {['desktop', 'tablet-screen-button', 'mobile-screen-button'].map(ic => (
          <span key={ic} style={{ width: 32, height: 32, borderRadius: 8, background: D.hellGrund, display: 'flex', alignItems: 'center', justifyContent: 'center', color: D.blau, fontSize: 13 }}>
            <i className={`fa-solid fa-${ic}`} aria-hidden="true" />
          </span>
        ))}
      </div>
    </MockRahmen>
  )
}

const MOCKS = { texte: TexteMock, bilder: BilderMock, bloecke: BloeckeMock, gestaltung: GestaltungMock, sicherheit: SicherheitMock }

export default function EditorFunktionen() {
  const [tab, setTab] = useState('texte')
  const aktiv = TABS.find(t => t.id === tab)
  const Mock = MOCKS[tab]

  return (
    <Seite
      eyebrow="Editor"
      titel="Alles änderbar."
      titelLeicht="Ohne Technik."
      einleitung="Du siehst deine Website und klickst hinein. Was du anklickst, kannst du ändern — dauerhaft und ohne Zusatzkosten, egal ob du gekauft oder gemietet hast."
      css={`
        @media(max-width:820px){.efgrid{grid-template-columns:1fr !important}}
        .efchip{transition:all .18s}
        .efchip:hover{border-color:${D.blau};color:${D.blau};transform:translateY(-2px)}
      `}
    >
      {/* Intro-Highlight */}
      <section style={{ padding: '50px 0 10px' }}>
        <div className="wrap">
          <Reveal>
            <div className="karte" style={{ padding: '28px 30px', borderColor: D.blau, borderWidth: 2, display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: '#E7EFF3', color: D.blau, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0 }}>
                <i className="fa-solid fa-infinity" aria-hidden="true" />
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h2 className="display" style={{ fontSize: 22, marginBottom: 10 }}>Keine Kosten für Änderungen. Nie.</h2>
                <p style={{ fontSize: 15, color: D.textMatt, lineHeight: 1.75 }}>
                  Bei einer Agentur kostet jede Textänderung Geld und Zeit. Hier änderst du selbst,
                  so oft du willst — neue Öffnungszeiten, neue Preise, neues Teamfoto. Einloggen,
                  anklicken, ändern. Das gilt beim Kauf genauso wie bei der Miete.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Zahlen */}
      <section style={{ padding: '34px 0' }}>
        <div className="wrap">
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, textAlign: 'center' }}>
              {[[15, '+', 'Blocktypen'], [9, '', 'Schrift-Paare'], [50, '', 'Schritte rückgängig'], [0, '€', 'pro Änderung']].map(([n, suf, label]) => (
                <div key={label}>
                  <div className="t2" style={{ fontWeight: 800, color: D.blau }}><Zaehler bis={n} suffix={suf} /></div>
                  <div style={{ fontSize: 13.5, color: D.textMatt, marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Tabs */}
      <section style={{ padding: '20px 0 70px' }}>
        <div className="wrap">
          <Reveal>
            <div className="reiter" style={{ marginBottom: 28 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} className={tab === t.id ? 'reiter-an' : 'reiter-aus'}>
                  <i className={`fa-solid fa-${t.icon}`} style={{ marginRight: 8 }} aria-hidden="true" />{t.titel}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal key={tab}>
            <div className="karte efgrid" style={{ padding: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.2fr 1fr' }}>
              <div style={{ padding: '34px 36px' }}>
                <h2 className="display" style={{ fontSize: 24, marginBottom: 10 }}>{aktiv.titel}</h2>
                <p style={{ fontSize: 14.5, color: D.textMatt, lineHeight: 1.7, marginBottom: 22 }}>{aktiv.intro}</p>
                <ul className="haken gruen">
                  {aktiv.punkte.map(([t, u]) => (
                    <li key={t} style={{ alignItems: 'flex-start' }}>
                      <i className="fa-solid fa-circle-check" style={{ marginTop: 2 }} aria-hidden="true" />
                      <span><b>{t}</b> — {u}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ background: D.hellGrund, padding: 28, display: 'flex', alignItems: 'center' }}>
                <Mock />
              </div>
            </div>
          </Reveal>

          {/* Blocktypen-Übersicht */}
          <Reveal verzug={80}>
            <div style={{ marginTop: 40 }}>
              <p className="eyebrow" style={{ marginBottom: 14 }}>Blockbibliothek</p>
              <h3 className="display" style={{ fontSize: 20, marginBottom: 16 }}>Alle Blocktypen im Überblick</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                {BLOCKTYPEN.map(b => (
                  <span key={b} className="efchip" style={{
                    fontSize: 13, fontWeight: 600, color: D.text, background: '#fff', border: `1px solid ${D.linie}`,
                    borderRadius: 99, padding: '9px 16px',
                  }}>{b}</span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Abschluss titel="Probier den Editor aus." text="Du kannst den ganzen Ablauf durchgehen und den Editor benutzen, bevor du etwas bezahlst." />
    </Seite>
  )
}
