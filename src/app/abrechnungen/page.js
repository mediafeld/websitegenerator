'use client'
import { KontoLayout } from '@/components/KontoLayout'
import { D, EMAIL } from '@/components/Kopf'

export default function Abrechnungen() {
  return (
    <KontoLayout aktiv="abrechnungen" titel="Rechnungen & Verträge"
      unter="Laufende Verträge, alle Rechnungen als PDF und dein Zahlungsmittel."
      kinder={
        <>
          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2><i className="fa-solid fa-file-contract" style={{ color: D.blau, marginRight: 10, fontSize: 17 }} aria-hidden="true" />Laufende Verträge</h2>
            <p className="unter">Noch kein Vertrag aktiv. Solange du nichts kaufst oder mietest, entstehen keine Kosten.</p>
            <div style={{ background: D.paper, borderRadius: 12, padding: '26px 22px', textAlign: 'center' }}>
              <a href="/preise" className="btnfest">Pakete ansehen</a>
            </div>
          </div>

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2><i className="fa-solid fa-file-invoice" style={{ color: D.blau, marginRight: 10, fontSize: 17 }} aria-hidden="true" />Rechnungen</h2>
            <p className="unter">Jede Rechnung kommt automatisch per E-Mail und liegt hier zum Herunterladen.</p>
            <div style={{ border: `1px solid ${D.linie}`, borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead><tr>{['Datum', 'Nummer', 'Leistung', 'Betrag', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: D.grauHell, padding: '13px 15px', borderBottom: `1px solid ${D.linie}`, fontWeight: 700 }}>{h}</th>
                ))}</tr></thead>
                <tbody><tr><td colSpan={5} style={{ textAlign: 'center', color: D.grauHell, padding: '30px 15px', fontSize: 14 }}>Noch keine Rechnungen vorhanden.</td></tr></tbody>
              </table>
            </div>
          </div>

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2><i className="fa-solid fa-credit-card" style={{ color: D.blau, marginRight: 10, fontSize: 17 }} aria-hidden="true" />Zahlungsmittel</h2>
            <p className="unter">Kreditkarte, SEPA-Lastschrift, PayPal oder Rechnung. Die Zahlungsdaten liegen beim Zahlungsdienstleister, nicht bei uns.</p>
            <div style={{ background: D.paper, borderRadius: 12, padding: '22px', fontSize: 14.5, color: D.grau, lineHeight: 1.65 }}>
              Noch kein Zahlungsmittel hinterlegt. Du legst es beim ersten Kauf fest.
            </div>
          </div>

          <div className="kkarte">
            <h2><i className="fa-solid fa-circle-info" style={{ color: D.blau, marginRight: 10, fontSize: 17 }} aria-hidden="true" />So wird abgerechnet</h2>
            <p className="unter">Damit es keine Überraschungen gibt.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                ['Kauf', 'Einmalzahlung sofort bei Bestellung. Die Rechnung kommt direkt per E-Mail.'],
                ['Miete monatlich', 'Der Abrechnungszeitraum beginnt am Tag der Bestellung. Startest du am 25., läuft dein Monat vom 25. bis zum 24. Keine Teilmonate, keine anteilige Berechnung.'],
                ['Miete jährlich', 'Zahlung für zwölf Monate im Voraus: Du zahlst zehn statt zwölf Monate, die Einrichtungsgebühr von 49 € inkl. MwSt. entfällt.'],
                ['Domain', 'Wird jahresweise abgerechnet und ist im Mietpreis enthalten. Zusätzliche Domains erscheinen separat auf der Rechnung.'],
                ['Zahlungsverzug', 'Bleibt eine Zahlung aus, erinnern wir zweimal. Erst danach wird die Website vorübergehend offline genommen.'],
              ].map(([t, u]) => (
                <li key={t} style={{ display: 'flex', gap: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: D.blau, background: D.blauZart, borderRadius: 8, padding: '4px 11px', whiteSpace: 'nowrap', height: 'fit-content', minWidth: 118, textAlign: 'center' }}>{t}</span>
                  <span style={{ fontSize: 14.5, color: D.grau, lineHeight: 1.72 }}>{u}</span>
                </li>
              ))}
            </ul>
            <p style={{ fontSize: 13.5, color: D.grauHell, marginTop: 20, lineHeight: 1.65 }}>
              Fragen zur Rechnung? Schreib an <a className="link-u" href={`mailto:${EMAIL}`} style={{ color: D.blau }}>{EMAIL}</a> — bitte mit Rechnungsnummer.
            </p>
          </div>
        </>
      } />
  )
}
