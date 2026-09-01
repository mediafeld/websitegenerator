'use client'
// ── Kunden-Vorschau in eigenem Tab ─────────────────────────────────────────
// Zeigt die Website so, wie sie später live aussieht — mit allen Unterseiten
// (auch Impressum/Datenschutz). Interne Links im Entwurf zeigen auf Dateien
// wie „impressum.html"; die gibt es hier noch nicht, deshalb fängt ein kleines
// Skript im Rahmen jeden Klick ab und schaltet stattdessen die Seite um.
import { useState, useEffect, useMemo, Suspense } from 'react'
import { renderPage } from '@/lib/blockRenderer'
import { projektLaden } from '@/lib/projekte'
import { produktStand } from '@/lib/produkt'
import { supabaseBereit } from '@/lib/supabaseClient'

const GERAETE = [['desktop', 'Desktop', 0], ['tablet-screen-button', 'Tablet', 820], ['mobile-screen', 'Handy', 400]]

// Seitenname → Dateiname (identisch zu ZIP-Export und Generierung)
export const dateiVon = (s) => (s === 'Startseite' || s === 'Start' || s === 'index')
  ? 'index.html'
  : String(s).toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '.html'

const KLICK_JS = `
<script>
(function () {
  function schalte(e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null
    if (!a) return
    var h = a.getAttribute('href') || ''
    if (!h || h.charAt(0) === '#') return
    if (/^(https?:|mailto:|tel:)/i.test(h)) { a.setAttribute('target', '_blank'); return }
    e.preventDefault()
    parent.postMessage({ wgVorschauZiel: h.split('#')[0] }, '*')
  }
  document.addEventListener('click', schalte, true)
})()
</script>`

export default function VorschauSeite() {
  return <Suspense fallback={null}><Vorschau /></Suspense>
}

function Vorschau() {
  const [projekt, setProjekt] = useState(null)
  const [seite, setSeite] = useState('')
  const [breite, setBreite] = useState(0)
  const [fehler, setFehler] = useState('')

  useEffect(() => {
    if (!supabaseBereit) { setFehler('Vorschau ist gerade nicht verfügbar.'); return }
    const p = new URLSearchParams(window.location.search)
    const id = p.get('projekt')
    if (!id) { setFehler('Es wurde keine Website angegeben.'); return }
    projektLaden(id).then(pr => {
      if (!pr) { setFehler('Diese Website konnte nicht geladen werden. Bist du im richtigen Konto angemeldet?'); return }
      setProjekt(pr)
      const seiten = Object.keys(pr.pages || {})
      const wunsch = p.get('seite')
      setSeite(seiten.includes(wunsch) ? wunsch : (seiten[0] || ''))
    }).catch(() => setFehler('Diese Website konnte nicht geladen werden.'))
  }, [])

  const seiten = useMemo(() => Object.keys(projekt?.pages || {}), [projekt])

  // Klicks aus dem Rahmen: Dateiname → passende Seite umschalten
  useEffect(() => {
    function empfangen(e) {
      const ziel = e?.data?.wgVorschauZiel
      if (!ziel) return
      const treffer = seiten.find(s => dateiVon(s) === String(ziel).toLowerCase())
      if (treffer) setSeite(treffer)
      else setFehler(`„${ziel}" gibt es in diesem Entwurf noch nicht.`)
    }
    window.addEventListener('message', empfangen)
    return () => window.removeEventListener('message', empfangen)
  }, [seiten])

  const html = useMemo(() => {
    if (!projekt || !seite) return ''
    const seo = projekt.form_data?.seo || {}
    return renderPage({
      blocks: projekt.pages[seite],
      seiten,
      palette: projekt.palette,
      font: projekt.font || 'Inter Tight',
      fontHeadline: projekt.form_data?.fontHeadline || projekt.font || 'Inter Tight',
      title: seite,
      seite,
      forEditor: false,
      // Vorschau: Formular zeigt nur, was passieren würde — es wird nichts
      // verschickt und läuft auch nicht ins Leere.
      formular: { art: 'demo', email: projekt.form_data?.email || '', telefon: projekt.form_data?.telefon || '' },
      seo: {
        titel: seo.seiten?.[seite]?.titel || '',
        beschreibung: seo.seiten?.[seite]?.beschreibung || '',
        favicon: seo.global?.favicon || '',
      },
    }) + KLICK_JS
  }, [projekt, seite])

  const stand = projekt ? produktStand(projekt) : null

  if (fehler && !projekt) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"InterTight",system-ui,sans-serif', background: '#F1F4F6', padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid #E1E7EB', borderRadius: 16, padding: '32px 34px', maxWidth: 460, textAlign: 'center' }}>
        <i className="fa-solid fa-eye-slash" style={{ fontSize: 26, color: '#8A99A6', marginBottom: 14, display: 'block' }} aria-hidden="true" />
        <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, color: '#0A1824' }}>Vorschau nicht möglich</div>
        <p style={{ fontSize: 14, color: '#5A6B7A', lineHeight: 1.65, marginBottom: 18 }}>{fehler}</p>
        <a href="/dashboard" style={{ background: '#1B93D2', color: '#fff', textDecoration: 'none', borderRadius: 10, padding: '11px 20px', fontWeight: 700, fontSize: 14, display: 'inline-block' }}>Zum Kundenkonto</a>
      </div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0A1824', display: 'flex', flexDirection: 'column', fontFamily: '"InterTight",system-ui,sans-serif' }}>
      <link href="/schrift/schrift.css" rel="stylesheet" />
      <link href="/fa/css/all.min.css" rel="stylesheet" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', flexWrap: 'wrap', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <i className="fa-solid fa-eye" style={{ color: '#1F9D55' }} aria-hidden="true" />Vorschau
        </span>
        <span style={{ color: 'rgba(255,255,255,.75)', fontSize: 13, fontWeight: 700, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {projekt?.name || '…'}
        </span>
        {stand?.info && (
          <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 99, padding: '3px 10px', background: 'rgba(255,255,255,.12)', color: '#fff' }}>
            <i className={`fa-solid ${stand.info.icon}`} style={{ marginRight: 6 }} aria-hidden="true" />{stand.info.kurz}
          </span>
        )}

        {/* Unterseiten — hier klickt man sich durch */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginLeft: 6 }}>
          {seiten.map(s => (
            <button key={s} onClick={() => { setSeite(s); setFehler('') }}
              style={{ border: `1px solid ${s === seite ? '#1B93D2' : 'rgba(255,255,255,.18)'}`, background: s === seite ? 'rgba(27,147,210,.22)' : 'transparent', color: s === seite ? '#fff' : 'rgba(255,255,255,.72)', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {GERAETE.map(([ic, l, w]) => (
          <button key={l} onClick={() => setBreite(w)} title={l}
            style={{ height: 32, padding: '0 11px', border: `1px solid ${breite === w ? '#1B93D2' : 'rgba(255,255,255,.18)'}`, borderRadius: 7, background: breite === w ? 'rgba(27,147,210,.22)' : 'transparent', color: breite === w ? '#fff' : 'rgba(255,255,255,.7)', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
            <i className={`fa-solid fa-${ic}`} aria-hidden="true" />{l}
          </button>
        ))}
        <a href={`/editor?projekt=${projekt?.id || ''}`}
          style={{ height: 32, padding: '0 14px', borderRadius: 7, background: '#1B93D2', color: '#fff', textDecoration: 'none', fontSize: 12.5, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <i className="fa-solid fa-pen" aria-hidden="true" />Bearbeiten
        </a>
        <a href="/dashboard" style={{ height: 32, padding: '0 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,.18)', color: 'rgba(255,255,255,.8)', textDecoration: 'none', fontSize: 12.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <i className="fa-solid fa-house" aria-hidden="true" />Konto
        </a>
      </div>

      {fehler && projekt && (
        <div style={{ background: 'rgba(220,38,38,.16)', color: '#fecaca', fontSize: 12.5, padding: '8px 16px', flexShrink: 0 }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: 8 }} aria-hidden="true" />{fehler}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 12px 12px', overflow: 'hidden' }}>
        <div style={{ width: breite === 0 ? '100%' : breite, maxWidth: '100%', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 10px 60px rgba(0,0,0,.5)' }}>
          {html
            ? <iframe title="Vorschau" srcDoc={html} style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} />
            : <div style={{ padding: 40, color: '#5A6B7A', fontSize: 14 }}>Lade …</div>}
        </div>
      </div>
    </div>
  )
}
