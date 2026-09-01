'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Kopf, D, BASIS_CSS, TELEFON, TELEFON_LINK, EMAIL } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'
import { Chat } from '@/components/Chat'
import { Brotkrumen } from '@/components/Brotkrumen'
import { supabase, supabaseBereit } from '@/lib/supabaseClient'
import { produktStand } from '@/lib/produkt'

const BEREICHE = [
  { gruppe: 'Ihr Benutzerkonto', punkte: [
    ['dashboard', '/dashboard', 'house', 'Übersicht'],
    ['websites', '/dashboard', 'globe', 'Meine Websites'],
    ['konto', '/konto', 'address-card', 'Meine Daten'],
    ['abrechnungen', '/abrechnungen', 'file-invoice', 'Rechnungen & Verträge'],
  ] },
  { gruppe: 'Domains & E-Mail', punkte: [
    ['domains', '/domains', 'globe', 'Registrierte Domains'],
    ['email', '/email', 'envelope', 'E-Mail-Postfächer'],
  ] },
  { gruppe: 'Rechtstexte', punkte: [
    ['rechtstexte', '/rechtstexte', 'scale-balanced', 'Impressum & Datenschutz'],
  ] },
  { gruppe: 'Hilfe', punkte: [
    ['hilfe', '/hilfe', 'circle-question', 'Hilfe & FAQ'],
    ['kontakt', '/kontakt', 'headset', 'Support kontaktieren'],
  ] },
]

export const KONTO_CSS = `
.kgrid{display:grid;grid-template-columns:264px 1fr;gap:26px;align-items:start}
.sidebar{position:sticky;top:88px}
.sblock{background:${D.hellKarte};border:1px solid ${D.hellLinie};border-radius:14px;overflow:hidden;margin-bottom:14px}
.skopf{font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${D.hellGrau};padding:14px 16px 9px}
.spunkt{display:flex;align-items:center;gap:11px;padding:11px 16px;font-size:13.8px;font-weight:600;color:${D.hellText};border-left:3px solid transparent;transition:all .16s}
.spunkt:hover{background:${D.blauZart};color:${D.blau};border-left-color:${D.blau};padding-left:20px}
.spunkt i{width:16px;text-align:center;font-size:13px;color:${D.hellGrau};transition:color .16s,transform .16s}
.spunkt:hover i{color:${D.blau};transform:scale(1.15)}
.spunkt-an{background:${D.blauZart};color:${D.blau};border-left-color:${D.blau}}
.spunkt-an i{color:${D.blau}}
.kkarte{background:${D.hellKarte};border:1px solid ${D.hellLinie};border-radius:16px;padding:30px 30px}
.kkarte h2{font-size:21px;font-weight:800;letter-spacing:-.025em;margin-bottom:6px}
.kkarte .unter{font-size:14px;color:${D.hellGrau};margin-bottom:22px;line-height:1.6}
.feld{width:100%;padding:13px 15px;font-size:15px;border:2px solid ${D.hellLinie};border-radius:10px;outline:none;transition:border-color .16s,box-shadow .16s;background:#fff}
.feld:focus{border-color:${D.blau};box-shadow:0 0 0 4px ${D.blau}18}
.beschr{display:block;font-size:12.5px;font-weight:700;color:${D.hellText};margin-bottom:7px}
.zeile{display:grid;gap:16px;margin-bottom:16px}
@media(max-width:900px){.kgrid{grid-template-columns:1fr}.sidebar{position:static}}
`

export function KontoLayout({ aktiv, titel, unter, kinder, css = '' }) {
  const router = useRouter()
  const [nutzer, setNutzer] = useState(null)
  const [laedt, setLaedt] = useState(true)
  const [meineWebsites, setMeineWebsites] = useState([])

  useEffect(() => {
    if (!supabaseBereit) { setLaedt(false); return }
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) { router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`); return }
      setNutzer(data.session.user); setLaedt(false)
    })
  }, [router])

  // Produktliste für die Seitenleiste — in JEDEM Konto-Bereich sichtbar,
  // damit immer klar ist, welche Websites es gibt und was sie sind.
  useEffect(() => {
    if (!nutzer) return
    let abgebrochen = false
    const laden = async () => {
      let { data, error } = await supabase.from('projekte')
        .select('id,name,status,zahlungsart,paket_id,bezahlt_am').order('geaendert_am', { ascending: false })
      if (error && /bezahlt_am/i.test(error.message || '')) {
        ;({ data } = await supabase.from('projekte')
          .select('id,name,status,zahlungsart,paket_id').order('geaendert_am', { ascending: false }))
      }
      if (!abgebrochen) setMeineWebsites(data || [])
    }
    laden().catch(() => {})
    return () => { abgebrochen = true }
  }, [nutzer])

  const rahmen = (inhalt) => (
    <div className="arbeit" style={{ background: D.hellGrund, color: D.hellText, fontFamily: '"InterTight",system-ui,sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <link href="/schrift/schrift.css" rel="stylesheet" />
      <link href="/fa/css/all.min.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + KONTO_CSS + css }} />
      <Kopf />
      <div style={{ flex: 1 }}>{inhalt}</div>
      <Fuss />
      <Chat />
    </div>
  )

  if (laedt) return rahmen(<Mitte>Lade…</Mitte>)
  if (!nutzer) return rahmen(
    <Mitte>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 15, color: D.hellGrau, marginBottom: 16 }}>Bitte melde dich an, um diesen Bereich zu sehen.</p>
        <a href="/login" className="btnfest">Zur Anmeldung</a>
      </div>
    </Mitte>
  )

  // Wo bin ich? – Brotkrumen aus dem aktiven Bereich ableiten
  const BEZEICHNUNG = {}
  BEREICHE.forEach(b => b.punkte.forEach(([id, , , t]) => { BEZEICHNUNG[id] = t }))
  const krumen = [['Start', '/'], ['Mein Konto', '/dashboard']]
  krumen.push([(aktiv && aktiv !== 'dashboard') ? (BEZEICHNUNG[aktiv] || titel || 'Bereich') : 'Übersicht'])

  return rahmen(
    <section style={{ padding: '14px 0 66px' }}>
      <div className="wrap" style={{ maxWidth: 1600 }}>
        <Brotkrumen pfad={krumen} />
      </div>
      <div className="wrap kgrid" style={{ maxWidth: 1600 }}>
        {/* Seitenleiste */}
        <aside className="sidebar">
          <div className="sblock">
            <div style={{ padding: '16px 16px 14px', borderBottom: `1px solid ${D.linie}`, display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: D.blauZart, color: D.blau, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, flexShrink: 0 }}>
                {(nutzer.email || '?')[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: D.dunkel }}>Ihr Benutzerkonto</div>
                <div style={{ fontSize: 11.5, color: D.hellGrauHell, overflow: 'hidden', textOverflow: 'ellipsis' }}>{nutzer.email}</div>
              </div>
            </div>
            {/* „Domains & E-Mail" gehören zum Mietpaket. Wer nur kauft, hostet
                selbst — dann hat dieser Bereich im Konto nichts zu suchen. */}
            {BEREICHE.filter(b => b.gruppe !== 'Domains & E-Mail' || meineWebsites.some(w => w.zahlungsart === 'mieten')).map(b => (
              <div key={b.gruppe}>
                <div className="skopf">{b.gruppe}</div>
                {b.punkte.filter(p => p[0] !== 'websites').map(([id, href, icon, t]) => (
                  <a key={id} href={href} className={`spunkt ${aktiv === id ? 'spunkt-an' : ''}`}>
                    <i className={`fa-solid fa-${icon}`} aria-hidden="true" />{t}
                  </a>
                ))}
              </div>
            ))}
            <div style={{ padding: 14, borderTop: `1px solid ${D.linie}` }}>
              <button className="btnleer" style={{ width: '100%' }} onClick={async () => { await supabase.auth.signOut(); router.push('/') }}>
                <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: 7 }} aria-hidden="true" />Abmelden
              </button>
            </div>
          </div>

          {meineWebsites.length > 0 && (
            <div className="sblock">
              <div className="skopf">Meine Websites</div>
              {meineWebsites.map(w => {
                const s = produktStand(w)
                return (
                  <a key={w.id} href={`/dashboard?website=${w.id}`} className="spunkt" style={{ alignItems: 'flex-start', gap: 10 }}>
                    <i className={`fa-solid ${s.info?.icon || 'fa-globe'}`} style={{ marginTop: 3, color: s.info?.farbe || undefined }} aria-hidden="true" />
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: D.hellGrauHell, marginTop: 2 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.farben.punkt, display: 'inline-block' }} />
                        {s.info?.kurz || 'Produkt offen'} · {s.text.replace('Entwurf · ', '')}
                      </span>
                    </span>
                  </a>
                )
              })}
              <a href="/start" className="spunkt" style={{ color: D.blau }}>
                <i className="fa-solid fa-plus" aria-hidden="true" />Neue Website
              </a>
            </div>
          )}

          <div className="sblock" style={{ padding: 16 }}>
            <div className="skopf" style={{ padding: '0 0 8px' }}>Direkter Kontakt</div>
            <a className="link-u" href={TELEFON_LINK} style={{ fontSize: 13.5, fontWeight: 700, color: D.hellText, display: 'block', marginBottom: 4 }}>
              <i className="fa-solid fa-phone" style={{ marginRight: 8, color: D.blau }} aria-hidden="true" />{TELEFON}
            </a>
            <a className="link-u" href={`mailto:${EMAIL}`} style={{ fontSize: 13, color: D.hellGrau, display: 'block' }}>
              <i className="fa-solid fa-envelope" style={{ marginRight: 8, color: D.blau }} aria-hidden="true" />{EMAIL}
            </a>
            <p style={{ fontSize: 12, color: D.hellGrauHell, marginTop: 10 }}>Mo. – Fr., 9 – 18 Uhr</p>
          </div>
        </aside>

        {/* Inhalt */}
        <main>
          <h1 className="display" style={{ fontSize: 'clamp(26px,3.4vw,34px)', marginBottom: 8 }}>{titel}</h1>
          {unter && <p style={{ fontSize: 15, color: D.hellGrau, marginBottom: 24, lineHeight: 1.6, maxWidth: 640 }}>{unter}</p>}
          {typeof kinder === 'function' ? kinder(nutzer) : kinder}
        </main>
      </div>
    </section>
  )
}

function Mitte({ children }) {
  return <div style={{ minHeight: '52vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#57657E', fontSize: 14, padding: 24 }}>{children}</div>
}
