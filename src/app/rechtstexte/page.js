'use client'
import { KontoLayout } from '@/components/KontoLayout'
import { D } from '@/components/Kopf'

export default function Rechtstexte() {
  return (
    <KontoLayout aktiv="rechtstexte" titel="Impressum & Datenschutz"
      unter="Für die Rechtstexte deiner eigenen Website. Aus deinen Angaben erzeugen wir Vorlagen, die du übernehmen kannst."
      kinder={
        <>
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, padding: '20px 22px', marginBottom: 18 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, color: '#92400E' }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: 9 }} aria-hidden="true" />Bitte lesen
            </h2>
            <p style={{ fontSize: 14, color: '#92400E', lineHeight: 1.75 }}>
              Wir erzeugen Textvorlagen aus deinen Angaben — das ist <strong>keine Rechtsberatung</strong> und
              wir übernehmen keine Haftung für die Richtigkeit oder Vollständigkeit. Für die Inhalte deiner
              Website bist du verantwortlich. Bei besonderen Anforderungen — Praxen, Kanzleien, Onlineverkauf,
              Newsletter, Elektrogeräte, Lebensmittel — lass die Texte anwaltlich prüfen oder nutze einen
              Rechtstexte-Dienst mit Aktualisierungsservice.
            </p>
          </div>

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2>Was für dein Impressum gebraucht wird</h2>
            <p className="unter">Diese Angaben ziehen wir aus „Meine Daten" und deinem Wizard. Fehlt etwas, wird es im Text markiert.</p>
            <div className="zeile" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {[
                ['Pflicht für alle', ['Vor- und Nachname', 'Vollständige Anschrift (kein Postfach)', 'Telefon oder Kontaktformular', 'E-Mail-Adresse', 'Rechtsform']],
                ['Je nach Fall', ['Geschäftsbezeichnung', 'USt-IdNr. bei Umsatzsteuerpflicht', 'Registergericht und -nummer', 'Kammer und Berufsbezeichnung bei reglementierten Berufen', 'Aufsichtsbehörde bei Erlaubnispflicht', 'Verantwortlicher nach § 18 MStV bei redaktionellen Inhalten']],
              ].map(([t, liste]) => (
                <div key={t} style={{ background: D.paper, borderRadius: 12, padding: 20 }}>
                  <h3 style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 12 }}>{t}</h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {liste.map(p => (
                      <li key={p} style={{ display: 'flex', gap: 9, fontSize: 13.8, color: D.grau, lineHeight: 1.55 }}>
                        <i className="fa-solid fa-check" style={{ color: D.blau, fontSize: 11, marginTop: 4 }} aria-hidden="true" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2>Fragen, die dein Impressum beeinflussen</h2>
            <p className="unter">Diese Punkte fragen wir vor dem Erzeugen ab — sie ändern den Text.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                'Richtest du dein Angebot an Verbraucher in der EU?',
                'Übst du eine reglementierte Tätigkeit aus (z. B. Arzt, Anwalt, Steuerberater, Handwerk mit Meisterpflicht)?',
                'Bietest du selbst Hosting oder Plattformdienste an?',
                'Hältst du journalistisch-redaktionelle Inhalte bereit (Blog, Magazin)?',
                'Bist du Hersteller oder Importeur von Elektrogeräten oder Verpackungen?',
                'Nimmst du an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teil?',
                'Verkaufst du online (dann braucht es zusätzlich AGB und Widerrufsbelehrung)?',
              ].map(q => (
                <li key={q} style={{ display: 'flex', gap: 11, fontSize: 14.2, color: '#41506B', lineHeight: 1.65 }}>
                  <i className="fa-solid fa-circle-question" style={{ color: D.blau, fontSize: 14, marginTop: 3, flexShrink: 0 }} aria-hidden="true" />{q}
                </li>
              ))}
            </ul>
          </div>

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2>Datenschutzerklärung</h2>
            <p className="unter">Der Text richtet sich danach, was deine Website tatsächlich tut.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['envelope', 'Kontaktformular', 'Welche Felder, wohin gehen die Daten, wie lange gespeichert.'],
                ['map-location-dot', 'Karte eingebunden', 'Karten laden Daten von Dritten — braucht eine Einwilligung.'],
                ['font', 'Schriften', 'Bei uns lokal ausgeliefert — dadurch keine Übertragung an Google.'],
                ['chart-simple', 'Statistik oder Werbung', 'Nur mit Cookie-Banner und Einwilligung. Standardmäßig nicht eingebaut.'],
                ['share-nodes', 'Social-Media-Verweise', 'Einfache Links sind unkritisch, eingebettete Inhalte nicht.'],
              ].map(([ic, t, u]) => (
                <li key={t} style={{ display: 'flex', gap: 12 }}>
                  <i className={`fa-solid fa-${ic}`} style={{ color: D.blau, fontSize: 14, marginTop: 4, width: 18, textAlign: 'center' }} aria-hidden="true" />
                  <span><strong style={{ fontSize: 14.5 }}>{t}</strong>
                    <span style={{ fontSize: 14, color: D.grau, lineHeight: 1.65, display: 'block' }}>{u}</span></span>
                </li>
              ))}
            </ul>
          </div>

          <div className="kkarte">
            <h2>Noch nicht verfügbar</h2>
            <p style={{ fontSize: 14.5, color: D.grau, lineHeight: 1.75, marginBottom: 16 }}>
              Das Erzeugen der Rechtstexte bauen wir gerade. Sobald es fertig ist, findest du hier
              Impressum, Datenschutzerklärung und Cookie-Hinweis zum Übernehmen — mit Hinweis auf
              fehlende Angaben.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="/konto" className="btnfest"><i className="fa-solid fa-address-card" style={{ marginRight: 7 }} aria-hidden="true" />Meine Daten vervollständigen</a>
              <a href="/kontakt" className="btnleer">Frage dazu stellen</a>
            </div>
          </div>
        </>
      } />
  )
}
