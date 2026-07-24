'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Kopf, D, BASIS_CSS, EMAIL } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'
import { FONT_LINK } from '@/components/Seite'
import { KontoNav } from '@/components/KontoNav'
import { supabase, supabaseBereit } from '@/lib/supabaseClient'

export default function Abrechnungen() {
  const router = useRouter()
  const [nutzer, setNutzer] = useState(null)
  const [laedt, setLaedt] = useState(true)

  useEffect(() => {
    if (!supabaseBereit) { setLaedt(false); return }
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) { router.replace('/login?next=/abrechnungen'); return }
      setNutzer(data.session.user); setLaedt(false)
    })
  }, [router])

  if (laedt) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter Tight",sans-serif', color: D.grau }}>Lade…</div>

  if (!nutzer) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter Tight",system-ui,sans-serif', padding: 24, textAlign: 'center' }}>
      <div>
        <p style={{ fontSize: 15, color: '#57657E', marginBottom: 16 }}>Bitte melde dich an, um diesen Bereich zu sehen.</p>
        <a href="/login" style={{ background: '#1D4ED8', color: '#fff', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 700 }}>Zur Anmeldung</a>
      </div>
    </div>
  )

  return (
    <div style={{ background: D.paper, color: D.dunkel, fontFamily: '"Inter Tight",system-ui,sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + `
        .tab{width:100%;border-collapse:collapse;font-size:14px}
        .tab th{text-align:left;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:${D.grauHell};padding:12px 14px;border-bottom:1px solid ${D.linie};font-weight:700}
        .tab td{padding:14px;border-bottom:1px solid ${D.linie};color:#41506B}
        .tab tr:last-child td{border-bottom:none}
      ` }} />
      <Kopf />

      <section style={{ flex: 1, padding: '34px 0 70px' }}>
        <div className="wrap" style={{ maxWidth: 1000 }}>
          <h1 className="display" style={{ fontSize: 28, marginBottom: 6 }}>Abrechnungen</h1>
          <p style={{ fontSize: 14, color: D.grau, marginBottom: 22 }}>Verträge, Rechnungen und Zahlungsmittel.</p>

          <KontoNav aktiv="abrechnungen" />

          {/* Verträge */}
          <div className="karte" style={{ padding: 26, marginBottom: 16 }}>
            <h2 className="display" style={{ fontSize: 18, marginBottom: 14 }}>Laufende Verträge</h2>
            <div style={{ padding: '26px 20px', textAlign: 'center', background: D.paper, borderRadius: 12 }}>
              <p style={{ fontSize: 14.5, color: D.grau, marginBottom: 14, lineHeight: 1.65 }}>
                Du hast noch keinen laufenden Vertrag. Solange du nichts kaufst oder mietest,
                entstehen keine Kosten.
              </p>
              <a href="/preise" className="btnfest">Pakete ansehen</a>
            </div>
          </div>

          {/* Rechnungen */}
          <div className="karte" style={{ padding: 26, marginBottom: 16 }}>
            <h2 className="display" style={{ fontSize: 18, marginBottom: 6 }}>Rechnungen</h2>
            <p style={{ fontSize: 13, color: D.grau, marginBottom: 16, lineHeight: 1.65 }}>
              Jede Rechnung bekommst du automatisch per E-Mail als PDF und findest sie hier zum Herunterladen.
            </p>
            <div className="karte" style={{ overflow: 'hidden' }}>
              <table className="tab">
                <thead><tr><th>Datum</th><th>Nummer</th><th>Leistung</th><th>Betrag</th><th></th></tr></thead>
                <tbody>
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: D.grauHell, padding: '28px 14px' }}>Noch keine Rechnungen vorhanden.</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Zahlungsmittel */}
          <div className="karte" style={{ padding: 26, marginBottom: 16 }}>
            <h2 className="display" style={{ fontSize: 18, marginBottom: 6 }}>Zahlungsmittel</h2>
            <p style={{ fontSize: 13, color: D.grau, marginBottom: 16, lineHeight: 1.65 }}>
              Zahlung per Kreditkarte, SEPA-Lastschrift, PayPal oder Rechnung. Die Zahlungsdaten
              werden bei unserem Zahlungsdienstleister verarbeitet, nicht bei uns gespeichert.
            </p>
            <div style={{ padding: '22px 20px', background: D.paper, borderRadius: 12, fontSize: 14, color: D.grau, lineHeight: 1.65 }}>
              Noch kein Zahlungsmittel hinterlegt. Du legst es beim ersten Kauf fest.
            </div>
          </div>

          {/* Wie abgerechnet wird */}
          <div className="karte" style={{ padding: 26 }}>
            <h2 className="display" style={{ fontSize: 18, marginBottom: 14 }}>So wird abgerechnet</h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Kauf', 'Einmalzahlung sofort bei Bestellung. Rechnung kommt direkt per E-Mail.'],
                ['Miete monatlich', 'Dein Abrechnungszeitraum beginnt am Tag der Bestellung — startest du am 25., läuft dein Monat vom 25. bis 24. Keine Teilmonate, keine anteilige Berechnung.'],
                ['Miete jährlich', 'Zahlung für zwölf Monate im Voraus. Du zahlst zehn statt zwölf Monate, die Einrichtungsgebühr entfällt.'],
                ['Domain', 'Wird jahresweise abgerechnet und ist im Mietpreis enthalten. Bei zusätzlichen Domains erscheint der Betrag separat.'],
                ['Zahlungsverzug', 'Bleibt eine Zahlung aus, erinnern wir zweimal. Erst danach wird die Website vorübergehend offline genommen.'],
              ].map(([t, u]) => (
                <li key={t} style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: D.blau, background: D.blauZart, borderRadius: 7, padding: '3px 9px', whiteSpace: 'nowrap', height: 'fit-content' }}>{t}</span>
                  <span style={{ fontSize: 14, color: D.grau, lineHeight: 1.7 }}>{u}</span>
                </li>
              ))}
            </ul>
            <p style={{ fontSize: 13, color: D.grauHell, marginTop: 18, lineHeight: 1.65 }}>
              Fragen zur Rechnung? Schreib an <a className="link-u" href={`mailto:${EMAIL}`} style={{ color: D.blau }}>{EMAIL}</a> —
              bitte mit Rechnungsnummer.
            </p>
          </div>
        </div>
      </section>
      <Fuss />
    </div>
  )
}
