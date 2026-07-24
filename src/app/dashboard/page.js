'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, supabaseBereit, fehlerText } from '@/lib/supabaseClient'
import { KontoLayout } from '@/components/KontoLayout'
import { D } from '@/components/Kopf'

const STATUS = {
  entwurf: { text: 'Entwurf', farbe: '#92400E', bg: '#FFFBEB', rand: '#FDE68A' },
  fertig:  { text: 'Fertig',  farbe: '#1E40AF', bg: '#EFF6FF', rand: '#BFDBFE' },
  online:  { text: 'Online',  farbe: '#15803D', bg: '#F0FDF4', rand: '#BBF7D0' },
}

export default function Dashboard() {
  const router = useRouter()
  const [projekte, setProjekte] = useState([])
  const [fehler, setFehler] = useState('')

  const laden = useCallback(async () => {
    if (!supabaseBereit) return
    const { data, error } = await supabase.from('projekte')
      .select('id,name,firma,branche,status,domain,geaendert_am')
      .order('geaendert_am', { ascending: false })
    if (error) setFehler(fehlerText(error)); else setProjekte(data || [])
  }, [])

  useEffect(() => { laden() }, [laden])

  async function loeschen(id, name) {
    if (!supabaseBereit) return
    if (!confirm(`„${name}" wirklich löschen? Das kann nicht rückgängig gemacht werden.`)) return
    const { error } = await supabase.from('projekte').delete().eq('id', id)
    if (error) setFehler(fehlerText(error)); else setProjekte(p => p.filter(x => x.id !== id))
  }

  return (
    <KontoLayout aktiv="dashboard" titel="Übersicht"
      unter="Deine Websites, Entwürfe und der jeweilige Stand."
      kinder={
        <>
          {fehler && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '15px 18px', marginBottom: 18, fontSize: 14, color: '#B91C1C' }}>{fehler}</div>}

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: projekte.length ? 20 : 6 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h2><i className="fa-solid fa-globe" style={{ color: D.blau, marginRight: 10, fontSize: 17 }} aria-hidden="true" />Meine Websites</h2>
                <p className="unter" style={{ marginBottom: 0 }}>
                  {projekte.length === 0 ? 'Noch keine Website angelegt.' : `${projekte.length} ${projekte.length === 1 ? 'Website' : 'Websites'}`}
                </p>
              </div>
              <button className="btnfest" onClick={() => router.push('/start')} style={{ padding: '12px 20px' }}>
                <i className="fa-solid fa-plus" style={{ marginRight: 8 }} aria-hidden="true" />Neue Website
              </button>
            </div>

            {projekte.length === 0 ? (
              <div style={{ background: D.paper, border: `2px dashed ${D.linie}`, borderRadius: 14, padding: '42px 24px', textAlign: 'center' }}>
                <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 28, color: D.blau, marginBottom: 14, display: 'block' }} aria-hidden="true" />
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 7 }}>Einfach Website — in wenigen Schritten online</div>
                <p style={{ fontSize: 14.5, color: D.grau, marginBottom: 20, maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.65 }}>
                  Angaben machen, Ergebnis ansehen, anpassen. Bezahlt wird erst, wenn dir die Website gefällt.
                </p>
                <button className="btnfest" onClick={() => router.push('/start')} style={{ padding: '13px 24px', fontSize: 14.5 }}>Jetzt starten</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projekte.map(p => {
                  const st = STATUS[p.status] || STATUS.entwurf
                  return (
                    <div key={p.id} className="karte-hover" style={{ background: '#fff', border: `1px solid ${D.linie}`, borderRadius: 13, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 15, flexWrap: 'wrap' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 11, background: D.blauZart, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="fa-solid fa-globe" style={{ color: D.blau, fontSize: 17 }} aria-hidden="true" />
                      </div>
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ fontSize: 15.5, fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: 12.5, color: D.grauHell }}>
                          {p.domain || 'noch keine Domain'}
                          {p.geaendert_am && ` · geändert ${new Date(p.geaendert_am).toLocaleDateString('de-DE')}`}
                        </div>
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: st.farbe, background: st.bg, border: `1px solid ${st.rand}`, borderRadius: 99, padding: '4px 12px' }}>{st.text}</span>
                      <button className="btnfest" onClick={() => router.push(`/editor?projekt=${p.id}`)} style={{ padding: '10px 17px', fontSize: 13 }}>
                        <i className="fa-solid fa-pen" style={{ marginRight: 7 }} aria-hidden="true" />Bearbeiten
                      </button>
                      <button onClick={() => loeschen(p.id, p.name)} title="Löschen" style={{ background: '#fff', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 13px', cursor: 'pointer' }}>
                        <i className="fa-solid fa-trash" aria-hidden="true" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="zeile" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 0 }}>
            {[
              ['globe', 'Domains', 'Registrierte Domains verwalten und Verfügbarkeit prüfen.', '/domains'],
              ['envelope', 'E-Mail-Postfächer', 'Adressen unter deiner Domain anlegen.', '/email'],
              ['scale-balanced', 'Rechtstexte', 'Impressum und Datenschutz für deine Website.', '/rechtstexte'],
              ['file-invoice', 'Rechnungen', 'Verträge, Rechnungen und Zahlungsmittel.', '/abrechnungen'],
            ].map(([ic, t, u, href]) => (
              <a key={href} href={href} className="kkarte karte-hover" style={{ padding: '22px 22px', display: 'block' }}>
                <i className={`fa-solid fa-${ic}`} style={{ color: D.blau, fontSize: 19, marginBottom: 11, display: 'block' }} aria-hidden="true" />
                <strong style={{ fontSize: 16, display: 'block', marginBottom: 5 }}>{t}</strong>
                <span style={{ fontSize: 13.8, color: D.grau, lineHeight: 1.6 }}>{u}</span>
              </a>
            ))}
          </div>
        </>
      } />
  )
}
