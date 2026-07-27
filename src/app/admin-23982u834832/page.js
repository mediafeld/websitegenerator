'use client'
// ═══════════════════════════════════════════════════════════════════════════
// ADMIN-BEREICH (versteckter Pfad) — Übersicht, Kunden, Buchungen, Projekte
// Zugang: Passwort aus der Vercel-Umgebungsvariable ADMIN_PASSWORT.
// Alle Daten kommen über /api/admin/* (httpOnly-Cookie, Service-Role).
// ═══════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo } from 'react'

const F = { dunkel: '#1a1a2e', seite: '#f4f5fa', karte: '#fff', rand: '#e6e8f0', text: '#25253d', grau: '#8a8fa8', blau: '#3b5bdb', gruen: '#12b886', rot: '#e03131', gelb: '#f59f00' }
const eur = (n) => (parseFloat(n) || 0).toFixed(2).replace('.', ',')
const datum = (d) => d ? new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '–'
const zeit = (d) => d ? new Date(d).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '–'
const STATUS_BADGE = {
  online: ['Bezahlt / Online', F.gruen], entwurf: ['Entwurf', F.grau],
  zahlung_fehlgeschlagen: ['Zahlung offen!', F.rot], gekuendigt: ['Gekündigt', F.gelb],
}

export default function AdminSeite() {
  const [eingeloggt, setEingeloggt] = useState(false)
  const [passwort, setPasswort] = useState('')
  const [fehler, setFehler] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [daten, setDaten] = useState(null)
  const [tab, setTab] = useState('uebersicht')
  const [suche, setSuche] = useState('')
  const [offenKunde, setOffenKunde] = useState(null)
  const [notizText, setNotizText] = useState('')

  async function laden() {
    setLaedt(true); setFehler('')
    try {
      const r = await fetch('/api/admin/daten')
      const j = await r.json()
      if (j.error) { if (r.status === 401) setEingeloggt(false); setFehler(j.error) }
      else { setDaten(j); setEingeloggt(true) }
    } catch { setFehler('Verbindung fehlgeschlagen.') }
    setLaedt(false)
  }
  useEffect(() => { laden() }, []) // eslint-disable-line

  async function anmelden() {
    setLaedt(true); setFehler('')
    try {
      const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passwort }) })
      const j = await r.json()
      if (j.error) setFehler(j.error)
      else { setPasswort(''); await laden() }
    } catch { setFehler('Verbindung fehlgeschlagen.') }
    setLaedt(false)
  }
  async function abmelden() { await fetch('/api/admin/login', { method: 'DELETE' }); setEingeloggt(false); setDaten(null) }

  async function notizSpeichern(userId) {
    if (!notizText.trim()) return
    const r = await fetch('/api/admin/notiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, text: notizText }) })
    const j = await r.json()
    if (j.error) { alert(j.error); return }
    setNotizText(''); laden()
  }
  async function notizLoeschen(id) { await fetch(`/api/admin/notiz?id=${id}`, { method: 'DELETE' }); laden() }

  // Umsatz je Monat (letzte 12) für das Diagramm
  const monatsUmsatz = useMemo(() => {
    const jetzt = new Date()
    const monate = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(jetzt.getFullYear(), jetzt.getMonth() - i, 1)
      monate.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('de-DE', { month: 'short' }), summe: 0 })
    }
    ;(daten?.rechnungen || []).forEach(r => {
      if (r.status !== 'bezahlt' || !r.erstellt_am) return
      const d = new Date(r.erstellt_am)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const m = monate.find(x => x.key === key)
      if (m) m.summe += parseFloat(r.betrag) || 0
    })
    return monate
  }, [daten])

  function csvExport() {
    const zeilen = [['Datum', 'Betrag', 'Waehrung', 'Status', 'Zeitraum von', 'Zeitraum bis', 'Rechnung', 'Kunde (user_id)'].join(';')]
    ;(daten?.rechnungen || []).forEach(r => {
      zeilen.push([zeit(r.erstellt_am), String(r.betrag).replace('.', ','), r.waehrung || 'eur', r.status, datum(r.zeitraum_von), datum(r.zeitraum_bis), r.rechnung_url || r.pdf_url || '', r.user_id || ''].join(';'))
    })
    const blob = new Blob(['\uFEFF' + zeilen.join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'buchungen-websitegenerator24.csv'
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 500)
  }

  async function kundenAktion(aktion, k, extra = {}) {
    const r = await fetch('/api/admin/kunde', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ aktion, user_id: k.id, email: k.email, ...extra }) })
    const j = await r.json()
    if (j.error) { alert(j.error); return }
    if (aktion === 'passwort-reset' && j.link) {
      try { await navigator.clipboard.writeText(j.link) } catch {}
      alert('Wiederherstellungs-Link erzeugt und in die Zwischenablage kopiert:\n\n' + j.link)
    }
    laden()
  }

  const kundenGefiltert = useMemo(() => {
    if (!daten?.kunden) return []
    const q = suche.trim().toLowerCase()
    if (!q) return daten.kunden
    return daten.kunden.filter(k => [k.email, k.firma, k.vorname, k.nachname, k.ort, String(k.kundennummer)].join(' ').toLowerCase().includes(q))
  }, [daten, suche])

  const ereignisse = useMemo(() => {
    if (!daten) return []
    const e = []
    ;(daten.rechnungen || []).forEach(r => e.push({ t: r.erstellt_am, text: `Zahlung ${eur(r.betrag)} € (${r.status})`, art: 'geld' }))
    ;(daten.kunden || []).forEach(k => e.push({ t: k.registriert_am, text: `Registrierung: ${k.email}`, art: 'nutzer' }))
    ;(daten.projekte || []).forEach(p => e.push({ t: p.geaendert_am, text: `Projekt „${p.name || p.firma || p.id.slice(0, 6)}“ geändert (${p.status})`, art: 'projekt' }))
    return e.filter(x => x.t).sort((a, b) => new Date(b.t) - new Date(a.t)).slice(0, 25)
  }, [daten])

  // ── Login-Ansicht ──
  if (!eingeloggt) return (
    <div style={{ minHeight: '100vh', background: F.dunkel, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter Tight",sans-serif' }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
      <div style={{ width: 360, background: F.karte, borderRadius: 16, padding: 30, boxShadow: '0 24px 80px rgba(0,0,0,.4)' }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: F.text, marginBottom: 4 }}><i className="fa-solid fa-shield-halved" style={{ color: F.blau, marginRight: 9 }} />Verwaltung</div>
        <div style={{ fontSize: 12, color: F.grau, marginBottom: 18 }}>websitegenerator24.de – interner Bereich</div>
        <input type="password" value={passwort} onChange={e => setPasswort(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') anmelden() }} placeholder="Admin-Passwort"
          style={{ width: '100%', border: `1.5px solid ${F.rand}`, borderRadius: 9, padding: '11px 13px', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
        <button onClick={anmelden} disabled={laedt} style={{ width: '100%', background: F.blau, color: '#fff', border: 'none', borderRadius: 9, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: laedt ? .7 : 1 }}>{laedt ? 'Prüfe…' : 'Anmelden'}</button>
        {fehler && <div style={{ marginTop: 10, fontSize: 12.5, color: F.rot }}>{fehler}</div>}
      </div>
    </div>
  )

  const z = daten?.zahlen || {}
  const NAV = [['uebersicht', 'gauge-high', 'Übersicht'], ['kunden', 'users', 'Kunden'], ['buchungen', 'file-invoice-dollar', 'Buchungen'], ['projekte', 'globe', 'Websites'], ['emails', 'envelope', 'E-Mails']]

  return (
    <div style={{ minHeight: '100vh', background: F.seite, fontFamily: '"Inter Tight",sans-serif', color: F.text, display: 'flex' }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
      {/* Seitenleiste (PrestaShop-artig dunkel) */}
      <div style={{ width: 210, background: F.dunkel, color: '#fff', flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '18px 16px', fontSize: 14, fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,.08)' }}><i className="fa-solid fa-shield-halved" style={{ color: '#7c93f5', marginRight: 8 }} />Verwaltung</div>
        {NAV.map(([id, ic, l]) => (
          <button key={id} onClick={() => setTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: tab === id ? 'rgba(124,147,245,.16)' : 'none', border: 'none', borderLeft: `3px solid ${tab === id ? '#7c93f5' : 'transparent'}`, color: tab === id ? '#fff' : 'rgba(255,255,255,.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
            <i className={`fa-solid fa-${ic}`} style={{ width: 16 }} />{l}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={laden} style={{ margin: '0 12px 8px', padding: '9px 0', background: 'rgba(255,255,255,.08)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}><i className="fa-solid fa-rotate" style={{ marginRight: 6 }} />Aktualisieren</button>
        <button onClick={abmelden} style={{ margin: '0 12px 14px', padding: '9px 0', background: 'none', color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Abmelden</button>
      </div>

      {/* Inhalt */}
      <div style={{ flex: 1, padding: 22, minWidth: 0 }}>
        {fehler && <div style={{ background: '#fff5f5', border: '1px solid #ffc9c9', color: F.rot, borderRadius: 10, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>{fehler}</div>}
        {daten?.notizenFehlen && <div style={{ background: '#fff9db', border: '1px solid #ffe066', color: '#8a6d00', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, marginBottom: 14 }}><b>Hinweis:</b> Kundennummern & Notizen brauchen die Datenbank-Erweiterung — bitte einmal <code>migration_admin.sql</code> im Supabase-SQL-Editor ausführen.</div>}

        {tab === 'uebersicht' && (
          <>
            <h1 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 16px' }}>Übersicht</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12, marginBottom: 20 }}>
              {[['Kunden', z.kunden, 'users', F.blau], ['Websites', z.projekte, 'globe', F.blau], ['Bezahlt / online', z.bezahlt, 'circle-check', F.gruen], ['Entwürfe', z.entwuerfe, 'pen-ruler', F.grau], ['Laufende Abos', z.abos, 'rotate', F.gruen], ['Umsatz gesamt', `${eur(z.umsatz)} €`, 'sack-dollar', F.gruen], ['Zahlungen', z.rechnungen, 'file-invoice', F.blau], ['KI-Bilder (echt)', z.kiBilder, 'wand-magic-sparkles', F.blau], ['KI-Texte (echt)', z.kiTexte, 'robot', F.blau], ['Bilder in Projekten', z.bilderGesamt, 'image', F.grau]].map(([l, w, ic, farbe]) => (
                <div key={l} style={{ background: F.karte, border: `1px solid ${F.rand}`, borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, color: F.grau, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}><i className={`fa-solid fa-${ic}`} style={{ marginRight: 6, color: farbe }} />{l}</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{w ?? '–'}</div>
                </div>
              ))}
            </div>
            <div style={{ background: F.karte, border: `1px solid ${F.rand}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 800, flex: 1 }}><i className="fa-solid fa-chart-column" style={{ marginRight: 7, color: F.gruen }} />Umsatz – letzte 12 Monate</div>
                <button onClick={csvExport} style={{ background: F.seite, border: `1px solid ${F.rand}`, borderRadius: 7, padding: '6px 12px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', color: F.text }}><i className="fa-solid fa-file-csv" style={{ marginRight: 5 }} />CSV-Export</button>
              </div>
              {(() => {
                const max = Math.max(1, ...monatsUmsatz.map(m => m.summe))
                return (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, padding: '0 4px' }}>
                    {monatsUmsatz.map(m => (
                      <div key={m.key} title={`${m.label}: ${eur(m.summe)} €`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: m.summe ? F.gruen : F.grau }}>{m.summe ? eur(m.summe) : ''}</span>
                        <div style={{ width: '100%', maxWidth: 34, height: Math.max(3, Math.round((m.summe / max) * 92)), background: m.summe ? F.gruen : F.rand, borderRadius: '5px 5px 0 0' }} />
                        <span style={{ fontSize: 9.5, color: F.grau }}>{m.label}</span>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
            <div style={{ background: F.karte, border: `1px solid ${F.rand}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}><i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 7, color: F.blau }} />Letzte Ereignisse</div>
              {ereignisse.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: i < ereignisse.length - 1 ? `1px solid ${F.seite}` : 'none', fontSize: 12.5 }}>
                  <span style={{ color: F.grau, width: 108, flexShrink: 0 }}>{zeit(e.t)}</span>
                  <i className={`fa-solid fa-${e.art === 'geld' ? 'euro-sign' : e.art === 'nutzer' ? 'user-plus' : 'pen'}`} style={{ color: e.art === 'geld' ? F.gruen : F.blau, width: 14, marginTop: 2 }} />
                  <span>{e.text}</span>
                </div>
              ))}
              {!ereignisse.length && <div style={{ fontSize: 12.5, color: F.grau }}>Noch keine Ereignisse.</div>}
            </div>
            {!!(daten?.protokoll || []).length && (
              <div style={{ background: F.karte, border: `1px solid ${F.rand}`, borderRadius: 12, padding: 16, marginTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}><i className="fa-solid fa-list-check" style={{ marginRight: 7, color: F.gelb }} />Admin-Protokoll (deine Aktionen)</div>
                {(daten.protokoll || []).slice(0, 20).map(p => (
                  <div key={p.id} style={{ display: 'flex', gap: 10, padding: '5px 0', borderBottom: `1px solid ${F.seite}`, fontSize: 12 }}>
                    <span style={{ color: F.grau, width: 108, flexShrink: 0 }}>{zeit(p.erstellt_am)}</span>
                    <b style={{ width: 120, flexShrink: 0 }}>{p.aktion}</b>
                    <span style={{ color: F.grau, overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.detail}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontSize: 11.5, color: F.grau, marginTop: 12, lineHeight: 1.5 }}>Zahlungsmittel & Rechnungs-PDFs: je Kunde über den Stripe-Link. Echtes Token-Tracking der KI-Nutzung folgt (Server-Zähler) – aktuell zählt „Bilder in Projekten“ alle eingebetteten Bilder.</div>
          </>
        )}

        {tab === 'kunden' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <h1 style={{ fontSize: 19, fontWeight: 800, margin: 0, flex: 1 }}>Kunden ({kundenGefiltert.length})</h1>
              <input value={suche} onChange={e => setSuche(e.target.value)} placeholder="Suchen: E-Mail, Firma, Ort, Kundennr. …" style={{ width: 300, border: `1.5px solid ${F.rand}`, borderRadius: 9, padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <div style={{ background: F.karte, border: `1px solid ${F.rand}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1.4fr 1fr 1fr 90px 90px 110px', gap: 0, padding: '10px 14px', background: F.seite, fontSize: 11, fontWeight: 800, color: F.grau, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                <span>Kd-Nr.</span><span>E-Mail</span><span>Firma</span><span>Ort</span><span>Websites</span><span>Registriert</span><span></span>
              </div>
              {kundenGefiltert.map(k => (
                <div key={k.id} style={{ borderTop: `1px solid ${F.seite}` }}>
                  <div onClick={() => setOffenKunde(offenKunde === k.id ? null : k.id)} style={{ display: 'grid', gridTemplateColumns: '80px 1.4fr 1fr 1fr 90px 90px 110px', padding: '11px 14px', fontSize: 12.5, cursor: 'pointer', alignItems: 'center', background: offenKunde === k.id ? '#f0f4ff' : '#fff' }}>
                    <span style={{ fontWeight: 800, color: F.blau }}>{k.kundennummer ?? '–'}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.email}{!k.bestaetigt && <i title="E-Mail nicht bestätigt" className="fa-solid fa-triangle-exclamation" style={{ color: F.gelb, marginLeft: 6 }} />}{k.gesperrt && <i title="Konto gesperrt" className="fa-solid fa-ban" style={{ color: F.rot, marginLeft: 6 }} />}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{k.firma || `${k.vorname} ${k.nachname}`.trim() || '–'}</span>
                    <span>{k.ort || '–'}</span>
                    <span>{k.projekte}</span>
                    <span>{datum(k.registriert_am)}</span>
                    <span style={{ textAlign: 'right' }}>{k.notizen.length > 0 && <span title="Notizen vorhanden" style={{ background: F.gelb, color: '#fff', borderRadius: 99, fontSize: 10, fontWeight: 800, padding: '2px 8px', marginRight: 6 }}>{k.notizen.length} <i className="fa-solid fa-note-sticky" /></span>}<i className={`fa-solid fa-chevron-${offenKunde === k.id ? 'up' : 'down'}`} style={{ color: F.grau }} /></span>
                  </div>
                  {offenKunde === k.id && (
                    <div style={{ padding: '14px 18px', background: '#fafbff', borderTop: `1px solid ${F.rand}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: F.grau, textTransform: 'uppercase', marginBottom: 8 }}>Stammdaten</div>
                        <div style={{ fontSize: 12.5, lineHeight: 1.8 }}>
                          <b>{k.vorname} {k.nachname}</b>{k.firma ? ` · ${k.firma}` : ''}<br />
                          {k.strasse || '–'}, {k.plz} {k.ort}<br />
                          Tel: {k.telefon || '–'} · USt-ID: {k.ust_id || '–'}<br />
                          Handelsregister: {k.handelsregister || '–'}<br />
                          Letzter Login: {zeit(k.letzter_login)}<br />
                          KI-Nutzung: <b>{k.nutzung?.bilder || 0}</b> Bilder · <b>{k.nutzung?.texte || 0}</b> Generierungen<br />
                          {k.stripe_customer_id
                            ? <a href={`https://dashboard.stripe.com/customers/${k.stripe_customer_id}`} target="_blank" rel="noreferrer" style={{ color: F.blau, fontWeight: 700 }}><i className="fa-brands fa-stripe" style={{ marginRight: 5 }} />Stripe-Kunde öffnen (Zahlungsmittel, Rechnungen)</a>
                            : <span style={{ color: F.grau }}>Noch kein Stripe-Kunde (nichts gekauft).</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                          <button onClick={() => kundenAktion('passwort-reset', k)} style={{ background: F.seite, border: `1px solid ${F.rand}`, borderRadius: 7, padding: '7px 11px', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: F.text }}><i className="fa-solid fa-key" style={{ marginRight: 5 }} />Passwort-Reset-Link</button>
                          {k.gesperrt
                            ? <button onClick={() => kundenAktion('entsperren', k)} style={{ background: '#e6fcf5', border: '1px solid #96f2d7', borderRadius: 7, padding: '7px 11px', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: F.gruen }}><i className="fa-solid fa-lock-open" style={{ marginRight: 5 }} />Entsperren</button>
                            : <button onClick={() => { if (confirm(`Konto ${k.email} wirklich sperren?`)) kundenAktion('sperren', k) }} style={{ background: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: 7, padding: '7px 11px', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: F.rot }}><i className="fa-solid fa-ban" style={{ marginRight: 5 }} />Sperren</button>}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: F.grau, textTransform: 'uppercase', margin: '12px 0 6px' }}>Zahlungs-Historie</div>
                        {k.rechnungen.length ? k.rechnungen.map(r => (
                          <div key={r.id} style={{ fontSize: 12, padding: '4px 0', borderBottom: `1px solid ${F.seite}` }}>
                            {datum(r.erstellt_am)} · <b>{eur(r.betrag)} €</b> · {r.status} {r.rechnung_url && <a href={r.rechnung_url} target="_blank" rel="noreferrer" style={{ color: F.blau, marginLeft: 6 }}>Rechnung</a>}
                          </div>
                        )) : <div style={{ fontSize: 12, color: F.grau }}>Noch keine Zahlungen.</div>}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: F.grau, textTransform: 'uppercase', marginBottom: 8 }}>Interne Notizen</div>
                        {k.notizen.map(n => (
                          <div key={n.id} style={{ background: '#fff9db', border: '1px solid #ffe066', borderRadius: 8, padding: '7px 10px', fontSize: 12, marginBottom: 6, display: 'flex', gap: 8 }}>
                            <span style={{ flex: 1 }}>{n.text}<span style={{ color: F.grau, marginLeft: 8, fontSize: 10.5 }}>{zeit(n.erstellt_am)}</span></span>
                            <button onClick={() => notizLoeschen(n.id)} style={{ border: 'none', background: 'none', color: F.rot, cursor: 'pointer', fontSize: 11 }}><i className="fa-solid fa-xmark" /></button>
                          </div>
                        ))}
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input value={notizText} onChange={e => setNotizText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') notizSpeichern(k.id) }} placeholder="Notiz zu diesem Kunden …" style={{ flex: 1, border: `1.5px solid ${F.rand}`, borderRadius: 8, padding: '8px 10px', fontSize: 12.5, fontFamily: 'inherit', outline: 'none' }} />
                          <button onClick={() => notizSpeichern(k.id)} style={{ background: F.blau, color: '#fff', border: 'none', borderRadius: 8, padding: '0 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Speichern</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'buchungen' && (
          <>
            <h1 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 14px' }}>Buchungen & Zahlungen <span style={{ color: F.gruen, fontSize: 15 }}>· Umsatz {eur(z.umsatz)} €</span></h1>
            <div style={{ background: F.karte, border: `1px solid ${F.rand}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 110px 90px 1fr 130px', padding: '10px 14px', background: F.seite, fontSize: 11, fontWeight: 800, color: F.grau, textTransform: 'uppercase' }}>
                <span>Datum</span><span>Betrag</span><span>Status</span><span>Zeitraum / Art</span><span>Rechnung</span>
              </div>
              {(daten?.rechnungen || []).map(r => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '130px 110px 90px 1fr 130px', padding: '10px 14px', fontSize: 12.5, borderTop: `1px solid ${F.seite}`, alignItems: 'center' }}>
                  <span>{zeit(r.erstellt_am)}</span>
                  <span style={{ fontWeight: 800 }}>{eur(r.betrag)} €</span>
                  <span style={{ color: r.status === 'bezahlt' ? F.gruen : F.rot, fontWeight: 700 }}>{r.status}</span>
                  <span style={{ color: F.grau }}>{r.zeitraum_von ? `${datum(r.zeitraum_von)} – ${datum(r.zeitraum_bis)} (Miete)` : 'Einmalkauf'}</span>
                  <span>{r.rechnung_url ? <a href={r.rechnung_url} target="_blank" rel="noreferrer" style={{ color: F.blau, fontWeight: 700 }}>Ansehen</a> : (r.pdf_url ? <a href={r.pdf_url} target="_blank" rel="noreferrer" style={{ color: F.blau, fontWeight: 700 }}>PDF</a> : '–')}</span>
                </div>
              ))}
              {!(daten?.rechnungen || []).length && <div style={{ padding: 16, fontSize: 12.5, color: F.grau }}>Noch keine Zahlungen. (Miet-Zahlungen erscheinen automatisch; Einmalkäufe ab dieser Version ebenfalls.)</div>}
            </div>
            <div style={{ fontSize: 11.5, color: F.grau, marginTop: 10 }}>Die offizielle Rechnung erstellt Stripe – die Kundennummer (ab 1000) steht seit v26 automatisch als Feld auf jeder Rechnung.</div>
            <h2 style={{ fontSize: 15, fontWeight: 800, margin: '22px 0 10px' }}><i className="fa-solid fa-ticket" style={{ marginRight: 7, color: F.gelb }} />Gutschein-Codes (aus Stripe)</h2>
            <div style={{ background: F.karte, border: `1px solid ${F.rand}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 120px', padding: '10px 14px', background: F.seite, fontSize: 11, fontWeight: 800, color: F.grau, textTransform: 'uppercase' }}>
                <span>Code</span><span>Rabatt</span><span>Status</span><span>Eingelöst</span>
              </div>
              {(daten?.gutscheine || []).map(g => (
                <div key={g.code} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 120px', padding: '9px 14px', fontSize: 12.5, borderTop: `1px solid ${F.seite}`, alignItems: 'center' }}>
                  <b>{g.code}</b><span>{g.rabatt}</span>
                  <span style={{ color: g.aktiv ? F.gruen : F.grau, fontWeight: 700 }}>{g.aktiv ? 'aktiv' : 'aus'}</span>
                  <span>{g.eingeloest}{g.maximal ? ` / ${g.maximal}` : ''}</span>
                </div>
              ))}
              {!(daten?.gutscheine || []).length && <div style={{ padding: 14, fontSize: 12.5, color: F.grau }}>Keine Gutschein-Codes. Anlegen im Stripe-Dashboard → Produkte → Gutscheine; sie gelten an der Kasse automatisch.</div>}
            </div>
          </>
        )}

        {tab === 'projekte' && (
          <>
            <h1 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 14px' }}>Websites ({(daten?.projekte || []).length})</h1>
            <div style={{ background: F.karte, border: `1px solid ${F.rand}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 110px 90px 90px 70px 230px', padding: '10px 14px', background: F.seite, fontSize: 11, fontWeight: 800, color: F.grau, textTransform: 'uppercase' }}>
                <span>Name / Firma</span><span>Domain</span><span>Status</span><span>Art</span><span>Geändert</span><span>Bilder</span><span>Aktionen</span>
              </div>
              {(daten?.projekte || []).map(p => {
                const [stText, stFarbe] = STATUS_BADGE[p.status] || [p.status || '–', F.grau]
                return (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 110px 90px 90px 70px 230px', padding: '10px 14px', fontSize: 12.5, borderTop: `1px solid ${F.seite}`, alignItems: 'center' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}><b>{p.name || '–'}</b>{p.firma ? ` · ${p.firma}` : ''}<br /><span style={{ color: F.grau, fontSize: 11 }}>{p.branche || ''}</span></span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.domain || '–'}</span>
                    <span><span style={{ background: stFarbe + '22', color: stFarbe, fontWeight: 800, fontSize: 10.5, borderRadius: 99, padding: '3px 9px' }}>{stText}</span></span>
                    <span>{p.zahlungsart === 'mieten' ? 'Miete' : p.zahlungsart === 'kaufen' ? 'Kauf' : '–'}</span>
                    <span>{datum(p.geaendert_am)}</span>
                    <span>{p.bilder}</span>
                    <span style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <a href={`/api/admin/vorschau?id=${p.id}`} target="_blank" rel="noreferrer" style={{ background: F.seite, color: F.text, borderRadius: 7, padding: '6px 10px', fontSize: 11.5, fontWeight: 700, textDecoration: 'none' }}><i className="fa-solid fa-eye" style={{ marginRight: 5 }} />Vorschau</a>
                      {p.hatInhalt && <a href={`/editor?projekt=${p.id}&adminmodus=1`} target="_blank" rel="noreferrer" style={{ background: F.blau, color: '#fff', borderRadius: 7, padding: '6px 10px', fontSize: 11.5, fontWeight: 700, textDecoration: 'none' }}><i className="fa-solid fa-screwdriver-wrench" style={{ marginRight: 5 }} />Im Editor fixen</a>}
                    </span>
                  </div>
                )
              })}
            </div>
            <div style={{ fontSize: 11.5, color: F.grau, marginTop: 10 }}>„Im Editor fixen“ öffnet die Kunden-Website in deinem Editor – Änderungen werden direkt beim Kunden gespeichert. Bitte mit Bedacht.</div>
          </>
        )}

        {tab === 'emails' && <MailVorlagenTab />}
      </div>
    </div>
  )
}

// ── Reiter „E-Mails": Texte der automatischen Kundenmails anpassen ─────────
function MailVorlagenTab() {
  const [vorlagen, setVorlagen] = useState(null)
  const [fehler, setFehler] = useState('')
  const [status, setStatus] = useState({}) // je schluessel: 'speichert' | 'ok'

  async function laden() {
    setFehler('')
    try {
      const res = await fetch('/api/admin/mailvorlagen')
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      setVorlagen(d.vorlagen || [])
    } catch (e) { setFehler(e.message) }
  }
  useEffect(() => { laden() }, [])

  function feld(schluessel, k, wert) {
    setVorlagen(vs => vs.map(v => v.schluessel === schluessel ? { ...v, [k]: wert } : v))
  }
  async function speichern(v) {
    setStatus(st => ({ ...st, [v.schluessel]: 'speichert' }))
    try {
      const res = await fetch('/api/admin/mailvorlagen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ schluessel: v.schluessel, betreff: v.betreff, inhalt: v.inhalt }) })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      setStatus(st => ({ ...st, [v.schluessel]: 'ok' }))
      setTimeout(() => setStatus(st => ({ ...st, [v.schluessel]: '' })), 2200)
      laden()
    } catch (e) { setFehler(e.message); setStatus(st => ({ ...st, [v.schluessel]: '' })) }
  }
  async function zuruecksetzen(v) {
    if (!confirm(`„${v.name}" auf den Standardtext zurücksetzen?`)) return
    await fetch(`/api/admin/mailvorlagen?schluessel=${v.schluessel}`, { method: 'DELETE' })
    laden()
  }

  return (
    <>
      <h1 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 6px' }}>E-Mail-Vorlagen</h1>
      <p style={{ fontSize: 12.5, color: F.grau, margin: '0 0 14px', maxWidth: 720, lineHeight: 1.6 }}>
        Diese Texte bekommen deine Kunden automatisch. Platzhalter in doppelten geschweiften Klammern
        (z. B. <code style={{ background: F.seite, padding: '1px 5px', borderRadius: 4 }}>{'{{betrag}}'}</code>) werden beim Versand
        automatisch ersetzt – einfach stehen lassen. HTML ist erlaubt.
      </p>
      {fehler && <div style={{ background: '#fdecec', border: '1px solid #f5c2c2', color: F.rot, borderRadius: 10, padding: '11px 14px', fontSize: 12.5, marginBottom: 14 }}>{fehler}</div>}
      {vorlagen === null ? (
        <div style={{ color: F.grau, fontSize: 13 }}><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Lade Vorlagen …</div>
      ) : vorlagen.map(v => (
        <div key={v.schluessel} style={{ background: F.karte, border: `1px solid ${F.rand}`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <b style={{ fontSize: 14 }}>{v.name}</b>
            {v.angepasst && <span style={{ background: F.gelb + '22', color: F.gelb, fontSize: 10, fontWeight: 800, borderRadius: 99, padding: '2px 8px' }}>ANGEPASST</span>}
          </div>
          <div style={{ fontSize: 11.5, color: F.grau, marginBottom: 10 }}>{v.hinweis}</div>
          <input value={v.betreff} onChange={e => feld(v.schluessel, 'betreff', e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', border: `1.5px solid ${F.rand}`, borderRadius: 8, padding: '9px 11px', fontSize: 13, fontFamily: 'inherit', outline: 'none', marginBottom: 8 }} />
          <textarea value={v.inhalt} onChange={e => feld(v.schluessel, 'inhalt', e.target.value)} rows={7} spellCheck={false}
            style={{ width: '100%', boxSizing: 'border-box', border: `1.5px solid ${F.rand}`, borderRadius: 8, padding: '10px 12px', fontSize: 12, fontFamily: 'monospace', outline: 'none', resize: 'vertical', lineHeight: 1.5 }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
            <button onClick={() => speichern(v)} disabled={status[v.schluessel] === 'speichert'}
              style={{ background: F.blau, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
              {status[v.schluessel] === 'speichert' ? 'Speichert …' : 'Speichern'}
            </button>
            {v.angepasst && <button onClick={() => zuruecksetzen(v)} style={{ background: F.seite, color: F.text, border: `1px solid ${F.rand}`, borderRadius: 8, padding: '9px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Auf Standard zurücksetzen</button>}
            {status[v.schluessel] === 'ok' && <span style={{ color: F.gruen, fontSize: 12.5, fontWeight: 700 }}><i className="fa-solid fa-circle-check" style={{ marginRight: 5 }} />Gespeichert</span>}
          </div>
        </div>
      ))}
    </>
  )
}
