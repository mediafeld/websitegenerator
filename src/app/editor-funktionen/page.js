'use client'
import { Seite, Abschluss } from '@/components/Seite'
import { D } from '@/components/Kopf'

const GRUPPEN = [
  { titel: 'Texte & Inhalte', punkte: [
    ['Text direkt bearbeiten', 'Doppelklick auf einen Text in der Vorschau, tippen, fertig. Kein Formular, kein Umweg.'],
    ['Überschriften und Absätze', 'Schriftgröße stufenlos, fett, kursiv, unterstrichen, Ausrichtung.'],
    ['Textfarbe', 'Farbwähler plus Schnellzugriff auf deine CI-Farben.'],
  ] },
  { titel: 'Bilder', punkte: [
    ['Eigene Bilder hochladen', 'Bild anklicken, hochladen, fertig. Wird automatisch verkleinert und als WebP gespeichert.'],
    ['Bilder per KI erzeugen', 'Beschreiben statt suchen. Je Paket 6 bis 12 Bilder inklusive, Restanzeige immer sichtbar.'],
    ['Galerien', 'Mehrere Bilder in einem Raster, einzeln austauschbar.'],
  ] },
  { titel: 'Bereiche & Blöcke', punkte: [
    ['Blöcke hineinziehen', 'Über 15 Typen: Hero, Leistungen, Preise, Team, Galerie, FAQ, Ablauf, Zahlen, Bild, Trennlinie.'],
    ['Mehrere Vorlagen je Block', 'Jeder Block hat verschiedene Designs — mit Live-Vorschau vor dem Einsetzen.'],
    ['Verschieben und duplizieren', 'Bereiche nach oben oder unten, kopieren, löschen.'],
  ] },
  { titel: 'Gestaltung', punkte: [
    ['CI-Farbe', 'Eine Farbe wählen — die ganze Website zieht mit, inklusive Abstufungen.'],
    ['Schrift-Paare', 'Neun aufeinander abgestimmte Kombinationen, alle als freie Google Fonts.'],
    ['Hintergründe pro Bereich', 'Bild, Farbe, Farbverlauf mit Winkelregler oder Muster — frei kombinierbar.'],
    ['Parallax', 'Bild bewegt sich beim Scrollen, Geschwindigkeit von −1,0 bis +1,0 einstellbar.'],
  ] },
  { titel: 'Sicherheit beim Arbeiten', punkte: [
    ['Rückgängig und Wiederholen', 'Bis zu 50 Schritte zurück.'],
    ['Automatisch gespeichert', 'Jede Änderung wird in deinem Konto gesichert.'],
    ['Ansicht prüfen', 'Desktop, Tablet und Handy in der Vorschau umschalten.'],
  ] },
]

export default function EditorFunktionen() {
  return (
    <Seite
      eyebrow="Editor"
      titel="Alles änderbar."
      titelLeicht="Ohne Technik."
      einleitung="Du siehst deine Website und klickst hinein. Was du anklickst, kannst du ändern — dauerhaft und ohne Zusatzkosten."
      css={`
        .fkarte{transition:transform .2s,border-color .2s,box-shadow .2s}
        .fkarte:hover{transform:translateY(-3px);border-color:${D.blau};box-shadow:0 12px 30px rgba(10,24,36,.09)}
        .punkt{border-left:2px solid ${D.linie};padding-left:16px;transition:border-color .18s,padding-left .18s}
        .punkt:hover{border-color:${D.blau};padding-left:20px}
      `}
    >
      <section style={{ padding: '50px 0 16px' }}>
        <div className="wrap">
          <div className="karte" style={{ padding: '26px 26px', marginBottom: 34, borderColor: D.blau, borderWidth: 2 }}>
            <h2 className="display" style={{ fontSize: 22, marginBottom: 10 }}>Keine Kosten für Änderungen. Nie.</h2>
            <p style={{ fontSize: 15, color: D.grau, lineHeight: 1.75 }}>
              Bei einer Agentur kostet jede Textänderung Geld und Zeit. Hier änderst du selbst,
              so oft du willst — neue Öffnungszeiten, neue Preise, neues Teamfoto. Einloggen,
              anklicken, ändern. Das gilt beim Kauf genauso wie bei der Miete.
            </p>
          </div>

          {GRUPPEN.map(g => (
            <div key={g.titel} style={{ marginBottom: 34 }}>
              <p className="eyebrow" style={{ color: D.blau, marginBottom: 14 }}>{g.titel}</p>
              <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {g.punkte.map(([t, u]) => (
                  <div key={t} className="karte fkarte" style={{ padding: '20px 20px' }}>
                    <h3 className="display" style={{ fontSize: 16, marginBottom: 7, letterSpacing: '-.02em' }}>{t}</h3>
                    <p style={{ fontSize: 13.8, color: D.grau, lineHeight: 1.65 }}>{u}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Abschluss titel="Probier den Editor aus." text="Du kannst den ganzen Ablauf durchgehen und den Editor benutzen, bevor du etwas bezahlst." />
    </Seite>
  )
}
