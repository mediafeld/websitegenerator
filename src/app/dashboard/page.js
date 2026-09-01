'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase, supabaseBereit, fehlerText } from '@/lib/supabaseClient'
import { KontoLayout } from '@/components/KontoLayout'
import { D } from '@/components/Kopf'
import { MIETE, KAUF, eur } from '@/lib/preise'
import { ARTEN, produktStand, UMFANG_NAME, UMFANG_KURZ, GROESSE } from '@/lib/produkt'
import { starteCheckout } from '@/lib/checkout'
import { aktuellerNutzer, profilLuecken, projektLaden, produktSetzen, lokalenStandUebernehmen } from '@/lib/projekte'
import { websiteAlsZip } from '@/lib/exportZip'

// Spalten, die für die Produkt-Anzeige gebraucht werden. bezahlt_am kommt aus
// migration_v39 — ohne die Migration fällt produktStand() automatisch auf den
// Status zurück, die Seite bleibt also funktionsfähig.
const SPALTEN = 'id,name,firma,branche,status,domain,geaendert_am,zahlungsart,paket_id,bezahlt_am'
const SPALTEN_ALT = 'id,name,firma,branche,status,domain,geaendert_am,zahlungsart,paket_id'

const DASH_CSS = `
.wgtabs{display:flex;gap:6px;overflow-x:auto;padding:2px 2px 0}
.wgtab{display:flex;align-items:center;gap:9px;background:${D.hellGrund};border:1px solid ${D.hellLinie};
  border-radius:12px 12px 0 0;padding:11px 16px;cursor:pointer;font-family:inherit;white-space:nowrap;
  color:${D.hellGrau};font-size:13.5px;font-weight:700;transition:background .15s,color .15s}
.wgtab:hover{background:#fff;color:${D.hellText}}
.wgtab-an{color:${D.dunkel};background:#fff;border-bottom-color:#fff;box-shadow:inset 0 3px 0 0 var(--tabfarbe)}
.wgtab-neu{border-style:dashed;color:${D.blau};font-weight:700}
.wgpanel{background:#fff;border:1px solid ${D.hellLinie};border-radius:0 16px 16px 16px;padding:22px 24px;margin-top:-1px}
.wgpunkt{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.wgchip{font-size:11px;font-weight:800;border-radius:99px;padding:3px 9px;letter-spacing:.02em;white-space:nowrap}
.wgakt{display:inline-flex;align-items:center;gap:8px;border-radius:10px;padding:11px 18px;font-size:13.5px;
  font-weight:700;cursor:pointer;font-family:inherit;border:1px solid transparent;text-decoration:none}
.wgpaket{border:1.5px solid ${D.hellLinie};background:#fff;border-radius:12px;padding:13px 16px;cursor:pointer;
  font-family:inherit;text-align:left;min-width:190px;transition:border-color .15s,box-shadow .15s}
.wgpaket:hover{box-shadow:0 6px 18px rgba(15,23,42,.09)}
@media(max-width:640px){.wgpanel{border-radius:14px;padding:18px 16px}.wgtab{padding:10px 12px;font-size:12.5px}}
`

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
  const [paketOffen, setPaketOffen] = useState(null)   // Projekt-ID, für die grade das Paket gewählt wird
  const [bucht, setBucht] = useState(null)             // Projekt-ID, die grade zu Stripe unterwegs ist
  const [laedtZip, setLaedtZip] = useState(null)       // Projekt-ID, deren ZIP gepackt wird
  const [luecken, setLuecken] = useState(null)          // null = noch nicht geladen, [] = vollständig
  const [aktivId, setAktivId] = useState(null)         // welcher Tab ist offen
  const [wechselOffen, setWechselOffen] = useState(null) // Projekt-ID, für die die Produktwahl offen ist
  const [umbenennen, setUmbenennen] = useState(null)   // {id, name} während des Umbenennens
  const [reOffen, setReOffen] = useState(null)         // Projekt-ID, deren Rechnungsdaten offen sind
  const [reWerte, setReWerte] = useState({})           // Formularwerte der re_*-Felder
  const [reStatus, setReStatus] = useState('')         // '', 'laedt', 'speichert', 'ok'
  const [reFehler, setReFehler] = useState('')        // Fehler direkt im Formular anzeigen

  const laden = useCallback(async () => {
    if (!supabaseBereit) return
    // Falls im Browser noch ein nicht zugeordneter Zwischenstand liegt
    // (gebaut vor der Registrierung): jetzt still ans Konto heften.
    await lokalenStandUebernehmen()
    let { data, error } = await supabase.from('projekte').select(SPALTEN).order('geaendert_am', { ascending: false })
    if (error && /bezahlt_am/i.test(error.message || '')) {
      // Datenbank noch ohne migration_v39 → ohne die neue Spalte laden
      ;({ data, error } = await supabase.from('projekte').select(SPALTEN_ALT).order('geaendert_am', { ascending: false }))
    }
    if (error) setFehler(fehlerText(error))
    else {
      setProjekte(data || [])
      setAktivId(v => (v && (data || []).some(p => p.id === v) ? v : (data?.[0]?.id || null)))
    }

    const u = await aktuellerNutzer()
    if (u) {
      const { data: profil } = await supabase.from('profile').select('*').eq('id', u.id).maybeSingle()
      setLuecken(profilLuecken(profil))
    }
  }, [])

  useEffect(() => { laden() }, [laden])

  // Tab aus der Adresse übernehmen (?website=…) — praktisch für Links aus E-Mails
  useEffect(() => {
    const w = params.get('website')
    if (w) setAktivId(w)
  }, [params])

  async function buchen(projekt, paketId, art) {
    setBucht(projekt.id); setFehler('')
    const { error } = await starteCheckout({
      paketId, modus: art, projektId: projekt.id,
      domain: art === 'mieten' ? projekt.domain : '',
    })
    if (error) { setFehler(error); setBucht(null) }
  }

  async function produktWaehlen(projekt, art) {
    setFehler('')
    const r = await produktSetzen(projekt.id, art)
    if (r?.error) { setFehler(r.error); return }
    setProjekte(ps => ps.map(p => p.id === projekt.id ? { ...p, zahlungsart: r.zahlungsart, paket_id: r.paket_id } : p))
    setWechselOffen(null)
    setPaketOffen(projekt.id)
  }

  async function zipLaden(projekt) {
    setLaedtZip(projekt.id); setFehler('')
    const voll = await projektLaden(projekt.id)
    if (!voll) { setFehler('Die Website konnte nicht geladen werden.'); setLaedtZip(null); return }
    const r = await websiteAlsZip(voll)
    if (r?.error) setFehler(r.error)
    setLaedtZip(null)
  }

  async function nameSpeichern(id, name) {
    if (!supabaseBereit || !name?.trim()) { setUmbenennen(null); return }
    const { error } = await supabase.from('projekte').update({ name: name.trim() }).eq('id', id)
    if (error) setFehler(fehlerText(error))
    else setProjekte(ps => ps.map(p => p.id === id ? { ...p, name: name.trim() } : p))
    setUmbenennen(null)
  }

  // Rechnungsdaten je Website: eigene Firmierung/Anschrift, die auf der
  // Rechnung dieser Website steht (statt der Konto-Stammdaten).
  async function reOeffnen(id) {
    if (reOffen === id) { setReOffen(null); return }
    setReOffen(id); setReStatus('laedt'); setReWerte({}); setReFehler('')
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
    if (error) setFehler(fehlerText(error))
    else setProjekte(p => p.filter(x => x.id !== id))
  }

  const aktiv = projekte.find(p => p.id === aktivId) || projekte[0] || null

  return (
    <KontoLayout aktiv="dashboard" titel="Übersicht" css={DASH_CSS}
      unter="Jede Website ist ein eigenes Produkt — oben umschalten, unten alles dazu."
      kinder={
        <>
          {params.get('bezahlt') === '1' && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '15px 18px', marginBottom: 18, fontSize: 14, color: '#15803D', display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: 17 }} aria-hidden="true" />
              Zahlung eingegangen. Die Rechnung findest du unter „Rechnungen &amp; Verträge".
            </div>
          )}
          {fehler && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '15px 18px', marginBottom: 18, fontSize: 14, color: '#B91C1C' }}>{fehler}</div>}

          {projekte.length === 0 ? (
            <div className="kkarte">
              <h2><i className="fa-solid fa-globe" style={{ color: D.magenta, marginRight: 10, fontSize: 17 }} aria-hidden="true" />Meine Websites</h2>
              <p className="unter">Noch keine Website angelegt.</p>
              <div style={{ background: D.hellGrund, border: `2px dashed ${D.linie}`, borderRadius: 14, padding: '42px 24px', textAlign: 'center' }}>
                <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: 28, color: D.magenta, marginBottom: 14, display: 'block' }} aria-hidden="true" />
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 7 }}>Einfach Website — in wenigen Schritten fertig</div>
                <p style={{ fontSize: 14.5, color: D.hellGrau, marginBottom: 20, maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.65 }}>
                  Angaben machen, Ergebnis ansehen, anpassen. Erst am Ende entscheidest du:
                  <b> mieten</b> (wir hosten mit Domain) oder <b>kaufen</b> (ZIP zum Herunterladen).
                </p>
                <button className="btnfest" onClick={() => router.push('/start')} style={{ padding: '13px 24px', fontSize: 14.5 }}>Jetzt starten</button>
              </div>
            </div>
          ) : (
            <>
              {/* ── TABS: eine Website = ein Tab ─────────────────────────── */}
              <div className="wgtabs">
                {projekte.map(p => {
                  const s = produktStand(p)
                  const an = p.id === aktiv?.id
                  return (
                    <button key={p.id} onClick={() => { setAktivId(p.id); setPaketOffen(null); setWechselOffen(null); setReOffen(null) }}
                      className={`wgtab ${an ? 'wgtab-an' : ''}`}
                      style={{ '--tabfarbe': s.info?.farbe || D.hellGrau }}
                      title={`${s.zeile} · ${s.text}`}>
                      <i className={`fa-solid ${s.info?.icon || 'fa-globe'}`}
                        style={{ fontSize: 13, color: an ? (s.info?.farbe || D.hellGrau) : D.hellGrauHell }} aria-hidden="true" />
                      <span style={{ maxWidth: 190, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                      <span className="wgchip" style={{ background: s.info?.bg || D.hellGrund, color: s.info?.farbe || D.hellGrau }}>
                        {s.info?.kurz || 'offen'}
                      </span>
                      <span className="wgpunkt" style={{ background: s.farben.punkt }} aria-hidden="true" />
                    </button>
                  )
                })}
                <button className="wgtab wgtab-neu" onClick={() => router.push('/start')}>
                  <i className="fa-solid fa-plus" aria-hidden="true" />Neue Website
                </button>
              </div>

              {/* ── PANEL zur gewählten Website ──────────────────────────── */}
              {aktiv && (() => {
                const s = produktStand(aktiv)
                const liste = s.art === 'mieten' ? MIETE : KAUF
                const zeigeWechsel = wechselOffen === aktiv.id || !s.art
                return (
                  <div className="wgpanel" style={{ borderTop: `3px solid ${s.info?.farbe || D.hellLinie}` }}>

                    {/* Kopfzeile */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 13, background: s.info?.bg || D.hellGrund, border: `1px solid ${s.info?.rand || D.hellLinie}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className={`fa-solid ${s.info?.icon || 'fa-globe'}`} style={{ color: s.info?.farbe || D.hellGrau, fontSize: 20 }} aria-hidden="true" />
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        {umbenennen?.id === aktiv.id ? (
                          <div style={{ display: 'flex', gap: 7, marginBottom: 5 }}>
                            <input autoFocus value={umbenennen.name} onChange={e => setUmbenennen({ ...umbenennen, name: e.target.value })}
                              onKeyDown={e => { if (e.key === 'Enter') nameSpeichern(aktiv.id, umbenennen.name); if (e.key === 'Escape') setUmbenennen(null) }}
                              style={{ border: `2px solid ${D.blau}`, borderRadius: 9, padding: '7px 11px', fontSize: 16, fontWeight: 700, fontFamily: 'inherit', outline: 'none' }} />
                            <button className="btnfest" style={{ padding: '8px 15px', fontSize: 13 }} onClick={() => nameSpeichern(aktiv.id, umbenennen.name)}>Sichern</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.02em' }}>{aktiv.name}</div>
                            <button onClick={() => setUmbenennen({ id: aktiv.id, name: aktiv.name })} title="Umbenennen"
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: D.hellGrauHell, fontSize: 13, padding: 4 }}>
                              <i className="fa-solid fa-pen" aria-hidden="true" />
                            </button>
                          </div>
                        )}
                        <div style={{ fontSize: 13, color: D.hellGrau, marginTop: 3 }}>
                          {s.art === 'kaufen'
                            ? <><i className="fa-solid fa-server" style={{ marginRight: 6 }} aria-hidden="true" />Hosting bringst du selbst mit</>
                            : <><i className="fa-solid fa-globe" style={{ marginRight: 6 }} aria-hidden="true" />{aktiv.domain || 'noch keine Domain'}</>}
                          {aktiv.geaendert_am && ` · zuletzt geändert ${new Date(aktiv.geaendert_am).toLocaleDateString('de-DE')}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        {s.info && (
                          <span className="wgchip" style={{ background: s.info.bg, color: s.info.farbe, border: `1px solid ${s.info.rand}`, fontSize: 12, padding: '5px 12px' }}>
                            <i className={`fa-solid ${s.info.icon}`} style={{ marginRight: 6 }} aria-hidden="true" />{s.info.name}
                          </span>
                        )}
                        <span className="wgchip" style={{ background: s.farben.bg, color: s.farben.farbe, border: `1px solid ${s.farben.rand}`, fontSize: 12, padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                          <span className="wgpunkt" style={{ background: s.farben.punkt }} aria-hidden="true" />{s.text}
                        </span>
                      </div>
                    </div>

                    {/* Produktzeile — was habe ich hier eigentlich? */}
                    <div style={{ background: s.info?.bg || D.hellGrund, border: `1px solid ${s.info?.rand || D.hellLinie}`, borderRadius: 12, padding: '14px 17px', marginBottom: 16, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 230 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: s.info?.farbe || D.hellGrau, marginBottom: 4 }}>
                          Gewähltes Produkt
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: D.dunkel }}>{s.zeile}</div>
                        <div style={{ fontSize: 12.5, color: D.hellGrau, marginTop: 3, lineHeight: 1.55 }}>{s.erklaerung}</div>
                      </div>
                      {!s.bezahlt && s.art && (
                        <button className="btnleer" style={{ padding: '9px 15px', fontSize: 13 }}
                          onClick={() => setWechselOffen(wechselOffen === aktiv.id ? null : aktiv.id)}>
                          <i className="fa-solid fa-right-left" style={{ marginRight: 7 }} aria-hidden="true" />Produkt wechseln
                        </button>
                      )}
                    </div>

                    {/* Produktwahl: mieten ODER kaufen */}
                    {zeigeWechsel && !s.bezahlt && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 4 }}>Wie möchtest du diese Website nutzen?</div>
                        <p style={{ fontSize: 12.5, color: D.hellGrau, marginBottom: 12, lineHeight: 1.6 }}>
                          Die Entscheidung kannst du bis zur Zahlung jederzeit ändern. Der Baukasten bleibt derselbe.
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
                          {Object.values(ARTEN).map(a => {
                            const an = s.art === a.id
                            return (
                              <button key={a.id} onClick={() => produktWaehlen(aktiv, a.id)}
                                style={{ textAlign: 'left', background: an ? a.bg : '#fff', border: `2px solid ${an ? a.farbe : D.hellLinie}`, borderRadius: 14, padding: '16px 18px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                                  <i className={`fa-solid ${a.icon}`} style={{ color: a.farbe, fontSize: 17 }} aria-hidden="true" />
                                  <span style={{ fontSize: 15.5, fontWeight: 800, color: D.dunkel }}>{a.name}</span>
                                  {an && <i className="fa-solid fa-circle-check" style={{ color: a.farbe, marginLeft: 'auto' }} aria-hidden="true" />}
                                </div>
                                <p style={{ fontSize: 13, color: D.hellGrau, lineHeight: 1.6, marginBottom: 10 }}>{a.satz}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {a.enthalten.map(e => (
                                    <span key={e} style={{ fontSize: 11.5, background: an ? '#fff' : D.hellGrund, color: D.hellText, borderRadius: 99, padding: '4px 10px' }}>
                                      <i className="fa-solid fa-check" style={{ color: a.farbe, marginRight: 5 }} aria-hidden="true" />{e}
                                    </span>
                                  ))}
                                </div>
                                <div style={{ fontSize: 12.5, color: a.farbe, fontWeight: 700, marginTop: 11 }}>
                                  ab {eur((a.id === 'mieten' ? MIETE : KAUF)[0].preis)} € {a.zahlweise}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Aktionen */}
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                      <button className="wgakt" onClick={() => router.push(`/editor?projekt=${aktiv.id}`)}
                        style={{ background: D.dunkel, color: '#fff' }}>
                        <i className="fa-solid fa-pen" aria-hidden="true" />Bearbeiten
                      </button>

                      {s.aktion === 'kaufen' && (
                        <button className="wgakt" onClick={() => setPaketOffen(paketOffen === aktiv.id ? null : aktiv.id)}
                          style={{ background: s.info.farbe, color: '#fff' }}>
                          <i className={`fa-solid ${s.info.hauptIcon}`} aria-hidden="true" />
                          Jetzt kaufen — {s.preis}
                        </button>
                      )}
                      {s.aktion === 'buchen' && (
                        <button className="wgakt" onClick={() => setPaketOffen(paketOffen === aktiv.id ? null : aktiv.id)}
                          style={{ background: s.info.farbe, color: '#fff' }}>
                          <i className={`fa-solid ${s.info.hauptIcon}`} aria-hidden="true" />
                          Online schalten — {s.preis}
                        </button>
                      )}
                      {s.aktion === 'zip' && (
                        <button className="wgakt" disabled={laedtZip === aktiv.id} onClick={() => zipLaden(aktiv)}
                          style={{ background: '#16a34a', color: '#fff', opacity: laedtZip === aktiv.id ? .7 : 1 }}>
                          <i className={`fa-solid ${laedtZip === aktiv.id ? 'fa-spinner fa-spin' : 'fa-file-zipper'}`} aria-hidden="true" />
                          {laedtZip === aktiv.id ? 'Wird gepackt …' : 'Website herunterladen (ZIP)'}
                        </button>
                      )}
                      {s.aktion === 'ansehen' && (
                        aktiv.domain
                          ? <a className="wgakt" href={`https://${String(aktiv.domain).replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" style={{ background: s.info.farbe, color: '#fff' }}>
                              <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />Website ansehen
                            </a>
                          : <span style={{ fontSize: 13, color: D.hellGrau }}>Domain wird eingerichtet — wir melden uns.</span>
                      )}
                      {s.aktion === 'waehlen' && !zeigeWechsel && (
                        <button className="wgakt" onClick={() => setWechselOffen(aktiv.id)} style={{ background: D.blau, color: '#fff' }}>
                          <i className="fa-solid fa-circle-question" aria-hidden="true" />Mieten oder kaufen?
                        </button>
                      )}

                      <div style={{ flex: 1 }} />

                      <button className="wgakt" onClick={() => reOeffnen(aktiv.id)} title="Rechnungsdaten für diese Website"
                        style={{ background: reOffen === aktiv.id ? D.blauZart : D.hellGrund, color: D.hellText, border: `1px solid ${D.hellLinie}` }}>
                        <i className="fa-solid fa-file-invoice" aria-hidden="true" />Rechnungsdaten
                      </button>
                      <button className="wgakt" onClick={() => loeschen(aktiv.id, aktiv.name)} title="Website löschen"
                        style={{ background: '#fff', color: '#DC2626', border: '1px solid #FECACA' }}>
                        <i className="fa-solid fa-trash" aria-hidden="true" />Löschen
                      </button>
                    </div>

                    {paketOffen === aktiv.id && luecken === null && (
                      <div style={{ fontSize: 13, color: D.hellGrau, marginTop: 16 }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 7 }} aria-hidden="true" />Deine Daten werden geprüft …
                      </div>
                    )}

                    {/* Fehlende Stammdaten — gilt für Kauf UND Miete */}
                    {paketOffen === aktiv.id && luecken?.length > 0 && (
                      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 11, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 16 }}>
                        <i className="fa-solid fa-circle-exclamation" style={{ color: '#92400E', fontSize: 16, marginTop: 2 }} aria-hidden="true" />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>
                            Vor der Bestellung brauchen wir noch: {luecken.join(', ')}
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

                    {/* Paketwahl — immer nur die Pakete der gewählten Produktart */}
                    {paketOffen === aktiv.id && luecken?.length === 0 && s.art && (
                      <div style={{ background: D.hellGrund, borderRadius: 12, padding: '17px 18px', marginTop: 16 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 3 }}>
                          <i className={`fa-solid ${s.info.icon}`} style={{ color: s.info.farbe, marginRight: 8 }} aria-hidden="true" />
                          {s.art === 'mieten' ? 'Mietpaket wählen' : 'Kaufpaket wählen'}
                        </div>
                        <p style={{ fontSize: 12.5, color: D.hellGrau, marginBottom: 13, lineHeight: 1.6 }}>{s.info.hauptHinweis}</p>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {liste.map(m => {
                            const gew = aktiv.paket_id === m.id
                            return (
                              <button key={m.id} className="wgpaket" disabled={bucht === aktiv.id}
                                onClick={() => buchen(aktiv, m.id, s.art)}
                                style={{ borderColor: gew ? s.info.farbe : D.hellLinie }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: D.dunkel, marginBottom: 2 }}>
                                  {m.name} <span style={{ fontSize: 11.5, fontWeight: 700, color: D.hellGrau }}>· {UMFANG_NAME[GROESSE[m.id]]}</span>
                                </div>
                                <div style={{ fontSize: 12.5, color: D.hellGrau, marginBottom: 7 }}>{UMFANG_KURZ[GROESSE[m.id]]}</div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: s.info.farbe }}>
                                  {eur(m.preis)} € <span style={{ fontSize: 12, fontWeight: 700, color: D.hellGrau }}>{s.info.zahlweise}</span>
                                </div>
                                {bucht === aktiv.id && <div style={{ fontSize: 12, color: D.hellGrau, marginTop: 6 }}><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} aria-hidden="true" />Kasse wird geöffnet …</div>}
                              </button>
                            )
                          })}
                        </div>
                        <div style={{ fontSize: 12, color: D.hellGrau, marginTop: 11 }}>
                          <i className="fa-solid fa-lock" style={{ marginRight: 6 }} aria-hidden="true" />
                          Weiter zur sicheren Bezahlung bei Stripe. {s.art === 'mieten' ? '12 Monate Mindestlaufzeit, danach monatlich kündbar.' : 'Einmalzahlung — danach gehört dir die Website.'}
                        </div>
                      </div>
                    )}

                    {/* Rechnungsdaten je Website */}
                    {reOffen === aktiv.id && (
                      <div style={{ background: D.hellGrund, borderRadius: 12, padding: '17px 18px', marginTop: 16 }}>
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
                                ['re_firma', 'Firma'], ['re_vorname', 'Vorname'], ['re_nachname', 'Nachname'],
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 13, flexWrap: 'wrap' }}>
                              <button className="btnfest" disabled={reStatus === 'speichert'} onClick={() => reSpeichern(aktiv.id)} style={{ padding: '10px 18px', fontSize: 13 }}>
                                {reStatus === 'speichert' ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 7 }} aria-hidden="true" />Speichert …</> : 'Rechnungsdaten speichern'}
                              </button>
                              {reStatus === 'ok' && <span style={{ fontSize: 13, color: '#15803D', fontWeight: 700 }}><i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} aria-hidden="true" />Gespeichert</span>}
                              {reFehler && (
                                <span style={{ fontSize: 13, color: '#B91C1C', fontWeight: 600, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '9px 14px', lineHeight: 1.5 }}>
                                  <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 7 }} aria-hidden="true" />{reFehler}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })()}
            </>
          )}

          <div className="zeile" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 0, marginTop: 18 }}>
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
