'use client'
import { useState, useEffect } from 'react'
import { KontoLayout } from '@/components/KontoLayout'
import { D, EMAIL } from '@/components/Kopf'
import { supabase, supabaseBereit } from '@/lib/supabaseClient'
import { aktuellerNutzer } from '@/lib/projekte'

const eur = (n) => Number(n).toFixed(2).replace('.', ',')

export default function Abrechnungen() {
  const [vertraege, setVertraege] = useState([])
  const [rechnungen, setRechnungen] = useState([])
  const [laedt, setLaedt] = useState(true)
  const [portalLaedt, setPortalLaedt] = useState(false)
  const [fehler, setFehler] = useState('')

  useEffect(() => {
    if (!supabaseBereit) { setLaedt(false); return }
    aktuellerNutzer().then(async (u) => {
      if (!u) { setLaedt(false); return }
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from('projekte').select('id,name,domain,status,zahlungsart,paket_id,geaendert_am').eq('user_id', u.id),
        supabase.from('rechnungen').select('*').eq('user_id', u.id).order('erstellt_am', { ascending: false }),
      ])
      setVertraege((p || []).filter(x => x.zahlungsart))
      setRechnungen(r || [])
      setLaedt(false)
    })
  }, [])

  async function kundenportalOeffnen() {
    setPortalLaedt(true); setFehler('')
    const { data } = await supabase.auth.getSession()
    const accessToken = data?.session?.access_token
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessToken }) })
      const j = await res.json()
      if (j.error) setFehler(j.error); else window.location.href = j.url
    } catch { setFehler('Kundenportal konnte nicht geöffnet werden.') }
    setPortalLaedt(false)
  }

  return (
    <KontoLayout aktiv="abrechnungen" titel="Rechnungen & Verträge"
      unter="Laufende Verträge, alle Rechnungen als PDF und dein Zahlungsmittel."
      kinder={
        <>
          {fehler && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '14px 18px', marginBottom: 18, fontSize: 14, color: '#B91C1C' }}>{fehler}</div>}

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2><i className="fa-solid fa-file-contract" style={{ color: D.magenta, marginRight: 10, fontSize: 17 }} aria-hidden="true" />Laufende Verträge</h2>
            <p className="unter">Noch kein Vertrag aktiv. Solange du nichts kaufst oder mietest, entstehen keine Kosten.</p>
            {laedt ? (
              <p style={{ fontSize: 14, color: D.hellGrau }}>Lädt …</p>
            ) : vertraege.length === 0 ? (
              <div style={{ background: D.hellGrund, borderRadius: 12, padding: '26px 22px', textAlign: 'center' }}>
                <a href="/preise" className="btnfest">Pakete ansehen</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {vertraege.map(v => (
                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', background: D.hellGrund, borderRadius: 11, padding: '14px 16px' }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700 }}>{v.name}</div>
                      <div style={{ fontSize: 12.5, color: D.hellGrau }}>{v.domain || 'noch keine Domain'} · {v.zahlungsart === 'mieten' ? 'Mietpaket' : 'Kauf'} {v.paket_id && `· ${v.paket_id}`}</div>
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: v.status === 'online' ? '#15803D' : '#92400E', background: v.status === 'online' ? '#F0FDF4' : '#FFFBEB', borderRadius: 99, padding: '4px 12px' }}>
                      {v.status === 'online' ? 'Aktiv' : v.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {vertraege.some(v => v.zahlungsart === 'mieten') && (
              <button className="btnleer" onClick={kundenportalOeffnen} disabled={portalLaedt} style={{ marginTop: 14 }}>
                <i className={`fa-solid ${portalLaedt ? 'fa-spinner fa-spin' : 'fa-arrow-up-right-from-square'}`} style={{ marginRight: 8 }} aria-hidden="true" />
                Mietpaket verwalten oder kündigen
              </button>
            )}
          </div>

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2><i className="fa-solid fa-file-invoice" style={{ color: D.magenta, marginRight: 10, fontSize: 17 }} aria-hidden="true" />Rechnungen</h2>
            <p className="unter">Jede Rechnung kommt automatisch per E-Mail und liegt hier zum Herunterladen.</p>
            <div style={{ border: `1px solid ${D.hellLinie}`, borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead><tr>{['Datum', 'Zeitraum', 'Betrag', 'Status', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 10.5, letterSpacing: '.12em', textTransform: 'uppercase', color: D.hellGrau, padding: '13px 15px', borderBottom: `1px solid ${D.hellLinie}`, fontWeight: 700 }}>{h}</th>
                ))}</tr></thead>
                <tbody>
                  {laedt ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: D.hellGrau, padding: '30px 15px', fontSize: 14 }}>Lädt …</td></tr>
                  ) : rechnungen.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: D.hellGrau, padding: '30px 15px', fontSize: 14 }}>Noch keine Rechnungen vorhanden.</td></tr>
                  ) : rechnungen.map(r => (
                    <tr key={r.id}>
                      <td style={{ padding: '13px 15px', borderBottom: `1px solid ${D.hellLinie}` }}>{new Date(r.erstellt_am).toLocaleDateString('de-DE')}</td>
                      <td style={{ padding: '13px 15px', borderBottom: `1px solid ${D.hellLinie}`, color: D.hellGrau }}>
                        {r.zeitraum_von ? `${new Date(r.zeitraum_von).toLocaleDateString('de-DE')} – ${new Date(r.zeitraum_bis).toLocaleDateString('de-DE')}` : '—'}
                      </td>
                      <td style={{ padding: '13px 15px', borderBottom: `1px solid ${D.hellLinie}`, fontWeight: 700 }}>{eur(r.betrag)} €</td>
                      <td style={{ padding: '13px 15px', borderBottom: `1px solid ${D.hellLinie}` }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#15803D', background: '#F0FDF4', borderRadius: 99, padding: '3px 10px' }}>{r.status}</span>
                      </td>
                      <td style={{ padding: '13px 15px', borderBottom: `1px solid ${D.hellLinie}` }}>
                        {r.pdf_url && <a href={r.pdf_url} target="_blank" rel="noreferrer" className="link-u" style={{ color: D.blau, fontWeight: 700 }}><i className="fa-solid fa-download" style={{ marginRight: 5 }} aria-hidden="true" />PDF</a>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2><i className="fa-solid fa-credit-card" style={{ color: D.magenta, marginRight: 10, fontSize: 17 }} aria-hidden="true" />Zahlungsmittel</h2>
            <p className="unter">Kreditkarte oder SEPA-Lastschrift. Die Zahlungsdaten liegen bei Stripe, nicht bei uns.</p>
            <div style={{ background: D.hellGrund, borderRadius: 12, padding: '22px', fontSize: 14.5, color: D.hellGrau, lineHeight: 1.65 }}>
              {vertraege.some(v => v.zahlungsart === 'mieten')
                ? <>Änderst du im Kundenportal — Knopf oben bei "Laufende Verträge".</>
                : <>Noch kein Zahlungsmittel hinterlegt. Du legst es beim ersten Kauf fest.</>}
            </div>
          </div>

          <div className="kkarte">
            <h2><i className="fa-solid fa-circle-info" style={{ color: D.magenta, marginRight: 10, fontSize: 17 }} aria-hidden="true" />So wird abgerechnet</h2>
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
                  <span style={{ fontSize: 12, fontWeight: 700, color: D.magenta, background: D.blauZart, borderRadius: 8, padding: '4px 11px', whiteSpace: 'nowrap', height: 'fit-content', minWidth: 118, textAlign: 'center' }}>{t}</span>
                  <span style={{ fontSize: 14.5, color: D.hellGrau, lineHeight: 1.72 }}>{u}</span>
                </li>
              ))}
            </ul>
            <p style={{ fontSize: 13.5, color: D.hellGrau, marginTop: 20, lineHeight: 1.65 }}>
              Fragen zur Rechnung? Schreib an <a className="link-u" href={`mailto:${EMAIL}`} style={{ color: D.magenta }}>{EMAIL}</a> — bitte mit Rechnungsnummer.
            </p>
          </div>
        </>
      } />
  )
}
