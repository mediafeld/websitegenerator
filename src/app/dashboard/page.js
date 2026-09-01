'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, supabaseBereit, fehlerText } from '@/lib/supabaseClient'
import { KontoLayout } from '@/components/KontoLayout'
import { D } from '@/components/Kopf'
import { MIETE } from '@/lib/preise'
import { starteCheckout } from '@/lib/checkout'
import { aktuellerNutzer, profilLuecken, projektLaden, lokalenStandUebernehmen } from '@/lib/projekte'
import { websiteAlsZip } from '@/lib/exportZip'

const STATUS = {
  entwurf: { text: 'Entwurf', farbe: '#92400E', bg: '#FFFBEB', rand: '#FDE68A' },
  fertig:  { text: 'Fertig',  farbe: '#1E40AF', bg: '#EFF6FF', rand: '#BFDBFE' },
  online:  { text: 'Online',  farbe: '#15803D', bg: '#F0FDF4', rand: '#BBF7D0' },
  zahlung_fehlgeschlagen: { text: 'Zahlung fehlgeschlagen', farbe: '#B91C1C', bg: '#FEF2F2', rand: '#FECACA' },
  gekuendigt: { text: 'Gekündigt', farbe: '#57657E', bg: '#F1F4F6', rand: '#E1E7EB' },
}

export default function Dashboard() {
  return (
    <Suspense fallback={null}>
      <DashboardInnen />
    </Suspense>
  )
}

function DashboardInnen() {
  const router = useRouter()
  const params = useSearchParams()
  const [projekte, setProjekte] = useState([])
  const [fehler, setFehler] = useState('')
  const [paketWahl, setPaketWahl] = useState(null)   // Projekt-ID, für die grade das Paket gewählt wird
  const [bucht, setBucht] = useState(null)            // Projekt-ID, die grade zu Stripe unterwegs ist
  const [luecken, setLuecken] = useState(null)         // null = noch nicht geladen, [] = vollständig
  const [aktivId, setAktivId] = useState(null)        // gewähltes Produkt (Website)
  const [switcherOffen, setSwitcherOffen] = useState(false)
  const [umbenennen, setUmbenennen] = useState(null)  // {id, name} während des Umbenennens
  const [reOffen, setReOffen] = useState(null)        // Projekt-ID, deren Rechnungsdaten offen sind
  const [reWerte, setReWerte] = useState({})          // Formularwerte der re_*-Felder
  const [reStatus, setReStatus] = useState('')        // '', 'laedt', 'speichert', 'ok'
  const [reFehler, setReFehler] = useState('')       // Fehler direkt im Formular anzeigen

  const laden = useCallback(async () => {
    if (!supabaseBereit) return
    // Falls im Browser noch ein nicht zugeordneter Zwischenstand liegt
    // (gebaut vor der Registrierung): jetzt still ans Konto heften.
    await lokalenStandUebernehmen()
    const { data, error } = await supabase.from('projekte')
      .select('id,name,firma,branche,status,domain,geaendert_am,zahlungsart,paket_id')
      .order('geaendert_am', { ascending: false })
    if (error) setFehler(fehlerText(error))
    else {
      setProjekte(data || [])
      setAktivId(v => v && (data || []).some(p => p.id === v) ? v : (data?.[0]?.id || null))
    }

    const u = await aktuellerNutzer()
    if (u) {
      const { data: profil } = await supabase.from('profile').select('*').eq('id', u.id).maybeSingle()
      setLuecken(profilLuecken(profil))
    }
  }, [])

  useEffect(() => { laden() }, [laden])

  function onlineSchalten(projektId) {
    setPaketWahl(paketWahl === projektId ? null : projektId)
  }

  async function buchen(projekt, paketId) {
    setBucht(projekt.id)
    const { error } = await starteCheckout({ paketId, modus: 'mieten', projektId: projekt.id, domain: projekt.domain })
    if (error) { setFehler(error); setBucht(null) }
  }

  async function nameSpeichern(id, name) {
    if (!supabaseBereit || !name?.trim()) { setUmbenennen(null); return }
    const { error } = await supabase.from('projekte').update({ name: name.trim() }).eq('id', id)
    if (error) setFehler(fehlerText(error))
    else setProjekte(ps => ps.map(p => p.id === id ? { ...p, name: name.trim() } : p))
    setUmbenennen(null)
  }

  // Rechnungsdaten je Website: eigene Firmierung/Anschrift, die auf der
  // Stripe-Rechnung dieser Website steht (statt der Konto-Stammdaten).
  async function reOeffnen(id) {
    if (reOffen === id) { setReOffen(null); return }
    setReOffen(id); setReStatus('laedt'); setReWerte({})
    const { data } = await supabase.from('projekte')
      .select('re_firma,re_vorname,re_nachname,re_strasse,re_plz,re_ort,re_ust_id,re_handelsregister')
      .eq('id', id).maybeSingle()
    setReWerte(data || {})
    setReStatus('')
  }

  async function reSpeichern(id) {
    setReStatus('speichert')
    const sauber = {}
    for (const k of ['re_firma', 're_vorname', 're_nachname', 're_strasse', 're_plz', 're_ort', 're_ust_id', 're_handelsregister']) {
      sauber[k] = (reWerte[k] || '').trim() || null
    }
    const { data, error } = await supabase.from('projekte').update(sauber).eq('id', id).select()
    if (error) { setFehler(fehlerText(error)); setReFehler(fehlerText(error)); setReStatus(''); return }
    // Gegenprobe: kam wirklich etwas an? (0 Zeilen = still nicht gespeichert)
    if (!data || !data.length) {
      const hinweis = 'Die Rechnungsdaten konnten nicht gespeichert werden. Bitte beim Support melden.'
      setFehler(hinweis); setReFehler(hinweis); setReStatus(''); return
    }
    setReFehler(''); setReStatus('ok'); setTimeout(() => setReStatus(''), 2200)
  }

  async function loeschen(id, name) {
    if (!supabaseBereit) return
    if (!confirm(`„${name}" wirklich löschen? Das kann nicht rückgängig gemacht werden.`)) return
    const { error } = await supabase.from('projekte').delete().eq('id', id)
    if (error) setFehler(fehlerText(error)); else setProjekte(p => p.filter(x => x.id !== id))
  }

  const aktivProjekt = projekte.find(p => p.id === aktivId) || projekte[0] || null

  return (
    <KontoLayout aktiv="dashboard" titel="Übersicht"
      unter="Deine Websites, Entwürfe und der jeweilige Stand."
      kinder={
        <>
          {params.get('bezahlt') === '1' && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '15px 18px', marginBottom: 18, fontSize: 14, color: '#15803D', display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: 17 }} aria-hidden="true" />
              Zahlung eingegangen — deine Website wird jetzt online geschaltet. Die Rechnung findest du unter „Rechnungen & Verträge".
            </div>
          )}
          {fehler && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '15px 18px', marginBottom: 18, fontSize: 14, color: '#B91C1C' }}>{fehler}</div>}

          {/* PRODUKT-UMSCHALTER: jede gebuchte Website ist ein eigenes Produkt */}
          {projekte.length > 0 && (
            <div className="kkarte" style={{ marginBottom: 16, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: D.hellGrau }}>Gewähltes Produkt</div>
                <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                  <button onClick={() => setSwitcherOffen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: `2px solid ${D.linie}`, borderRadius: 12, padding: '10px 14px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 9, background: D.blauZart, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                      <i className="fa-solid fa-globe" style={{ color: D.blau, fontSize: 16 }} aria-hidden="true" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 700, color: D.dunkel, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aktivProjekt?.name || 'Website wählen'}</div>
                      <div style={{ fontSize: 12, color: D.hellGrau }}>{aktivProjekt?.domain || 'noch keine Domain'} · {(STATUS[aktivProjekt?.status] || STATUS.entwurf).text}</div>
                    </div>
                    <i className={`fa-solid fa-chevron-${switcherOffen ? 'up' : 'down'}`} style={{ fontSize: 11, color: D.hellGrau }} aria-hidden="true" />
                  </button>
                  {switcherOffen && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff', border: `1px solid ${D.linie}`, borderRadius: 12, boxShadow: '0 18px 44px rgba(15,23,42,.16)', zIndex: 40, overflow: 'hidden', maxHeight: 340, overflowY: 'auto' }}>
                      {projekte.map(p => (
                        <div key={p.id} onClick={() => { setAktivId(p.id); setSwitcherOffen(false) }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer', borderBottom: `1px solid ${D.hellGrund}`, background: p.id === aktivId ? D.blauZart : '#fff' }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: D.blauZart, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i className="fa-solid fa-globe" style={{ color: D.blau, fontSize: 13 }} aria-hidden="true" />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                            <div style={{ fontSize: 11.5, color: D.hellGrau }}>{p.domain || 'noch keine Domain'}</div>
                          </div>
                          {p.id === aktivId && <i className="fa-solid fa-check" style={{ color: D.blau, fontSize: 12 }} aria-hidden="true" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {aktivProjekt && (
                  umbenennen?.id === aktivProjekt.id ? (
                    <div style={{ display: 'flex', gap: 7 }}>
                      <input autoFocus value={umbenennen.name} onChange={e => setUmbenennen({ ...umbenennen, name: e.target.value })}
                        onKeyDown={e => { if (e.key === 'Enter') nameSpeichern(aktivProjekt.id, umbenennen.name); if (e.key === 'Escape') setUmbenennen(null) }}
                        style={{ border: `2px solid ${D.blau}`, borderRadius: 9, padding: '8px 11px', fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }} />
                      <button className="btnfest" style={{ padding: '9px 15px', fontSize: 13 }} onClick={() => nameSpeichern(aktivProjekt.id, umbenennen.name)}>Sichern</button>
                    </div>
                  ) : (
                    <button className="btnleer" style={{ padding: '9px 15px', fontSize: 13 }} onClick={() => setUmbenennen({ id: aktivProjekt.id, name: aktivProjekt.name })}>
                      <i className="fa-solid fa-pen" style={{ marginRight: 7 }} aria-hidden="true" />Umbenennen
                    </button>
                  )
                )}
              </div>
              <p style={{ fontSize: 11.5, color: D.hellGrau, marginTop: 11, lineHeight: 1.55 }}>
                Jede gebuchte Website ist ein eigenes Produkt mit eigener Domain und eigenem Vertrag. Hier wechselst du zwischen ihnen.
              </p>
            </div>
          )}

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: projekte.length ? 20 : 6 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h2><i className="fa-solid fa-globe" style={{ color: D.magenta, marginRight: 10, fontSize: 17 }} aria-hidden="true" />Meine Websites</h2>
                <p className="unter" style={{ marginBottom: 0 }}>
                  {projekte.length === 0 ? 'Noch keine Website angelegt.' : `${projekte.length} ${projekte.length === 1 ? 'Website' : 'Websites'}`}
                </p>
              </div>
              <button className="btnfest" onClick={() => router.push('/start')} style={{ padding: '12px 20px' }}>
                <i className="fa-solid fa-plus" style={{ marginRight: 8 }} aria-hidden="true" />Neue Website
              </button>
            </div>

            {projekte.length === 0 ? (
              <div style={{ background: D.hellGrund, border: `2px dashed ${D.linie}`, borderRadius: 14, padding: '42px 24px', textAlign: 'center' }}>
                <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 28, color: D.magenta, marginBottom: 14, display: 'block' }} aria-hidden="true" />
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 7 }}>Einfach Website — in wenigen Schritten online</div>
                <p style={{ fontSize: 14.5, color: D.hellGrau, marginBottom: 20, maxWidth: 420, margin: '0 auto 20px', lineHeight: 1.65 }}>
                  Angaben machen, Ergebnis ansehen, anpassen. Bezahlt wird erst, wenn dir die Website gefällt.
                </p>
                <button className="btnfest" onClick={() => router.push('/start')} style={{ padding: '13px 24px', fontSize: 14.5 }}>Jetzt starten</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {projekte.map(p => {
                  const st = STATUS[p.status] || STATUS.entwurf
                  const online = p.status === 'online'
                  return (
                    <div key={p.id} className="karte-hover" style={{ background: D.hellKarte, border: `1px solid ${D.hellLinie}`, borderRadius: 13, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 15, flexWrap: 'wrap' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 11, background: D.blauZart, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <i className="fa-solid fa-globe" style={{ color: D.magenta, fontSize: 17 }} aria-hidden="true" />
                        </div>
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ fontSize: 15.5, fontWeight: 700 }}>{p.name}</div>
                          <div style={{ fontSize: 12.5, color: D.hellGrau }}>
                            {p.domain || 'noch keine Domain'}
                            {p.geaendert_am && ` · geändert ${new Date(p.geaendert_am).toLocaleDateString('de-DE')}`}
                          </div>
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: st.farbe, background: st.bg, border: `1px solid ${st.rand}`, borderRadius: 99, padding: '4px 12px' }}>{st.text}</span>
                        {!online && (
                          <button className="btnblau" onClick={() => onlineSchalten(p.id)} style={{ padding: '10px 17px', fontSize: 13 }}>
                            <i className="fa-solid fa-rocket" style={{ marginRight: 7 }} aria-hidden="true" />Online schalten
                          </button>
                        )}
                        <button className="btnfest" onClick={() => router.push(`/editor?projekt=${p.id}`)} style={{ padding: '10px 17px', fontSize: 13 }}>
                          <i className="fa-solid fa-pen" style={{ marginRight: 7 }} aria-hidden="true" />Bearbeiten
                        </button>
                        {p.zahlungsart === 'kaufen' && p.status === 'online' && (
                          <button className="btnblau" onClick={async () => {
                            const voll = await projektLaden(p.id)
                            if (!voll) { alert('Projekt konnte nicht geladen werden.'); return }
                            const r = await websiteAlsZip(voll)
                            if (r?.error) alert(r.error)
                          }} style={{ padding: '10px 17px', fontSize: 13, background: '#16a34a' }}>
                            <i className="fa-solid fa-file-zipper" style={{ marginRight: 7 }} aria-hidden="true" />ZIP herunterladen
                          </button>
                        )}
                        <button onClick={() => reOeffnen(p.id)} title="Rechnungsdaten für diese Website"
                          style={{ background: reOffen === p.id ? D.blauZart : D.hellKarte, color: D.hellText, border: `1px solid ${D.hellLinie}`, borderRadius: 9, padding: '10px 13px', cursor: 'pointer', fontSize: 13 }}>
                          <i className="fa-solid fa-file-invoice" aria-hidden="true" />
                        </button>
                        <button onClick={() => loeschen(p.id, p.name)} title="Löschen" style={{ background: D.hellKarte, color: '#DC2626', border: '1px solid #FECACA', borderRadius: 9, padding: '10px 13px', cursor: 'pointer' }}>
                          <i className="fa-solid fa-trash" aria-hidden="true" />
                        </button>
                      </div>

                      {reOffen === p.id && (
                        <div style={{ background: D.hellGrund, borderRadius: 11, padding: '16px 18px' }}>
                          <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 3 }}>
                            <i className="fa-solid fa-file-invoice" style={{ color: D.magenta, marginRight: 8 }} aria-hidden="true" />
                            Rechnungsdaten für diese Website
                          </div>
                          <p style={{ fontSize: 12, color: D.hellGrau, marginBottom: 13, lineHeight: 1.6 }}>
                            Optional: eigene Firmierung und Anschrift, die auf der Rechnung <strong>dieser</strong> Website
                            steht — praktisch, wenn du mehrere Firmen oder Kunden über ein Konto abwickelst.
                            Leer gelassen gelten deine Konto-Stammdaten.
                          </p>
                          {reStatus === 'laedt' ? (
                            <div style={{ fontSize: 13, color: D.hellGrau }}><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 7 }} aria-hidden="true" />Lade …</div>
                          ) : (
                            <>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                                {[
                                  ['re_firma', 'Firma', '2fr'], ['re_vorname', 'Vorname'], ['re_nachname', 'Nachname'],
                                  ['re_strasse', 'Straße & Hausnummer'], ['re_plz', 'PLZ'], ['re_ort', 'Ort'],
                                  ['re_ust_id', 'USt-IdNr. (optional)'], ['re_handelsregister', 'Handelsregister (optional)'],
                                ].map(([k, label]) => (
                                  <label key={k} style={{ display: 'block' }}>
                                    <span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: D.hellGrau, marginBottom: 4 }}>{label}</span>
                                    <input value={reWerte[k] || ''} onChange={e => setReWerte(w => ({ ...w, [k]: e.target.value }))}
                                      style={{ width: '100%', boxSizing: 'border-box', border: `1.5px solid ${D.hellLinie}`, borderRadius: 9, padding: '9px 11px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff' }} />
                                  </label>
                                ))}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 13 }}>
                                <button className="btnfest" disabled={reStatus === 'speichert'} onClick={() => reSpeichern(p.id)} style={{ padding: '10px 18px', fontSize: 13 }}>
                                  {reStatus === 'speichert' ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 7 }} aria-hidden="true" />Speichert …</> : 'Rechnungsdaten speichern'}
                                </button>
                                {reStatus === 'ok' && <span style={{ fontSize: 13, color: '#15803D', fontWeight: 700 }}><i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} aria-hidden="true" />Gespeichert</span>}
                              </div>
                              {reFehler && (
                                <div style={{ marginTop: 10, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#B91C1C', lineHeight: 1.55 }}>
                                  <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 7 }} aria-hidden="true" />{reFehler}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {paketWahl === p.id && luecken?.length > 0 && (
                        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 11, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <i className="fa-solid fa-circle-exclamation" style={{ color: '#92400E', fontSize: 16, marginTop: 2 }} aria-hidden="true" />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>
                              Bevor du online gehen kannst, brauchen wir noch: {luecken.join(', ')}
                            </div>
                            <p style={{ fontSize: 13, color: '#92400E', marginBottom: 10, lineHeight: 1.6 }}>
                              Diese Angaben stehen später auf deinem Impressum und deiner Rechnung — Pflicht, keine Kür.
                            </p>
                            <a href="/konto" className="btnfest" style={{ padding: '9px 16px', fontSize: 13 }}>
                              <i className="fa-solid fa-address-card" style={{ marginRight: 7 }} aria-hidden="true" />Jetzt vervollständigen
                            </a>
                          </div>
                        </div>
                      )}

                      {paketWahl === p.id && luecken?.length === 0 && (
                        <div style={{ background: D.hellGrund, borderRadius: 11, padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: D.hellText, marginRight: 4 }}>Mietpaket wählen:</span>
                          {MIETE.map(m => (
                            <button key={m.id} disabled={bucht === p.id} onClick={() => buchen(p, m.id)}
                              style={{
                                border: `1.5px solid ${p.paket_id === m.id ? D.blau : D.hellLinie}`, background: '#fff', borderRadius: 10,
                                padding: '9px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                              }}>
                              {m.name} · {m.preis.toFixed(2).replace('.', ',')} €/Monat
                              {bucht === p.id && <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />}
                            </button>
                          ))}
                          <span style={{ fontSize: 12, color: D.hellGrau }}>Weiter zur sicheren Bezahlung bei Stripe.</span>
                        </div>
                      )}
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
                <i className={`fa-solid fa-${ic}`} style={{ color: D.magenta, fontSize: 19, marginBottom: 11, display: 'block' }} aria-hidden="true" />
                <strong style={{ fontSize: 16, display: 'block', marginBottom: 5 }}>{t}</strong>
                <span style={{ fontSize: 13.8, color: D.hellGrau, lineHeight: 1.6 }}>{u}</span>
              </a>
            ))}
          </div>
        </>
      } />
  )
}
