'use client'
import { Seite, Abschluss } from '@/components/Seite'
import { D, TELEFON, TELEFON_LINK, EMAIL } from '@/components/Kopf'

export default function UeberUns() {
  return (
    <Seite
      eyebrow="Über uns"
      titel="Ein Werkzeug,"
      titelLeicht="kein Selbstbedienungsladen."
      einleitung="websitegenerator24.de ist ein Baukasten für kleine Betriebe, die eine ordentliche Website brauchen — ohne Agenturbudget und ohne monatliche Gebühren für jede Textänderung."
    >
      <section style={{ padding: '52px 0 20px' }}>
        <div className="wrap" style={{ maxWidth: 1040 }}>
          <div className="karte" style={{ padding: '30px 30px', marginBottom: 22 }}>
            <h2 className="display" style={{ fontSize: 23, marginBottom: 14 }}>Warum es das gibt</h2>
            <p style={{ fontSize: 15, color: D.textMatt, lineHeight: 1.78, marginBottom: 14 }}>
              Viele kleine Betriebe stehen vor derselben Wahl: einen Baukasten selbst zusammenklicken,
              der am Ende aussieht wie tausend andere — oder eine Agentur beauftragen, was
              schnell vierstellig wird und Wochen dauert.
            </p>
            <p style={{ fontSize: 15, color: D.textMatt, lineHeight: 1.78 }}>
              Wir haben den Weg dazwischen gebaut: Du beantwortest Fragen zu deinem Betrieb, und
              daraus entsteht eine Website mit passenden Texten und Bildern. Danach kannst du alles
              selbst ändern. Kein Abo für Kleinigkeiten, keine Wartezeit, kein Anruf nötig.
            </p>
          </div>

          <div className="spalten3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 22 }}>
            {[
              ['Erreichbar', 'Es gibt eine Telefonnummer, an der jemand abnimmt — kein Ticketsystem.'],
              ['Ehrlich', 'Wir sagen dir, wenn der Generator für dein Vorhaben nicht reicht.'],
              ['Ohne Bindung', 'Du bekommst alle Dateien und kannst jederzeit woanders hingehen.'],
            ].map(([t, u]) => (
              <div key={t} className="karte karte-hover" style={{ padding: '20px 20px' }}>
                <h3 className="display" style={{ fontSize: 16.5, marginBottom: 7 }}>{t}</h3>
                <p style={{ fontSize: 13.8, color: D.textMatt, lineHeight: 1.65 }}>{u}</p>
              </div>
            ))}
          </div>

          <div className="karte" style={{ padding: '30px 30px', marginBottom: 22 }}>
            <h2 className="display" style={{ fontSize: 23, marginBottom: 14 }}>Wie die Website entsteht</h2>
            <p style={{ fontSize: 15, color: D.textMatt, lineHeight: 1.78, marginBottom: 14 }}>
              Wir setzen künstliche Intelligenz für Texte und Bilder ein — das sagen wir offen,
              statt es zu verschweigen. Der Aufbau, die Blöcke und die Gestaltung sind dagegen von
              Hand entworfen: Deshalb sieht das Ergebnis nicht aus wie ein zufällig
              zusammengewürfelter Entwurf.
            </p>
            <p style={{ fontSize: 15, color: D.textMatt, lineHeight: 1.78 }}>
              Was die KI nicht kann, sagen wir auch: Sie kennt deinen Betrieb nicht persönlich.
              Deshalb solltest du die Texte durchlesen und dort nachschärfen, wo es auf Details
              ankommt — bei Preisen, Leistungen und rechtlichen Angaben besonders.
            </p>
          </div>

          <div className="karte" style={{ padding: '30px 30px' }}>
            <h2 className="display" style={{ fontSize: 23, marginBottom: 14 }}>Kontakt</h2>
            <p style={{ fontSize: 15, color: D.textMatt, lineHeight: 1.75, marginBottom: 16 }}>
              Fragen vor dem Start? Ruf an oder schreib — Mo. bis Fr. von 9 bis 18 Uhr.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href={TELEFON_LINK} className="btnfest">{TELEFON}</a>
              <a href={`mailto:${EMAIL}`} className="btnleer">{EMAIL}</a>
              <a href="/kontakt" className="btnleer">Zum Kontaktformular</a>
            </div>
          </div>
        </div>
      </section>
      <Abschluss />
    </Seite>
  )
}
