'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { aktuellerNutzer } from '@/lib/projekte'
import { supabase } from '@/lib/supabaseClient'

export const D = {
  dunkel: '#0A1824', dunkel2: '#122539', paper: '#F6F8FC', weiss: '#FFFFFF',
  blau: '#1D4ED8', blauHell: '#3B6BF5', blauZart: '#EAF0FF',
  grau: '#57657E', grauHell: '#8493AC', linie: '#E2E8F3',
  gruen: '#15803D', gruenZart: '#EBF8F0',
}

export const TELEFON = '+49 (0)30 57 70 23 66'
export const TELEFON_LINK = 'tel:+493057702366'
export const EMAIL = 'info@websitegenerator24.de'

export const BASIS_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:${D.paper}}
.display{font-family:'Inter Tight',system-ui,sans-serif;font-weight:800;letter-spacing:-0.035em;line-height:1.06}
.leicht{font-weight:300;color:${D.grau}}
.eyebrow{font-family:'Inter Tight',sans-serif;font-size:10.5px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase}
.wrap{max-width:1160px;margin:0 auto;padding:0 22px}
.karte{background:${D.weiss};border:1px solid ${D.linie};border-radius:16px}
.karte-hover{transition:transform .2s cubic-bezier(.2,.7,.3,1),box-shadow .2s,border-color .2s}
.karte-hover:hover{transform:translateY(-4px);box-shadow:0 16px 42px rgba(10,24,36,.11);border-color:${D.blau}}
button{font-family:inherit}
input,select,textarea{font-family:inherit}
a{color:inherit;text-decoration:none}
.link-u{transition:color .15s}
.link-u:hover{text-decoration:underline;color:${D.blau}}
:focus-visible{outline:2px solid ${D.blau};outline-offset:2px}

/* Mini-Leiste */
.minileiste{background:${D.dunkel};color:#9FB0C8;font-size:12.5px}
.minileiste a{transition:color .15s}
.minileiste a:hover{color:#fff}

/* Navigation */
.navroot{position:relative}
.navtrigger{display:flex;align-items:center;gap:5px;font-size:14px;font-weight:600;color:${D.grau};background:none;border:none;cursor:pointer;padding:9px 2px;transition:color .15s}
.navroot:hover .navtrigger{color:${D.dunkel}}
.navroot:hover .pfeil{transform:rotate(180deg)}
.pfeil{transition:transform .2s;font-size:9px;opacity:.55;display:inline-block}
.navdrop{position:absolute;top:100%;left:-14px;min-width:280px;background:${D.weiss};border:1px solid ${D.linie};border-radius:14px;box-shadow:0 20px 50px rgba(10,24,36,.15);padding:9px;opacity:0;visibility:hidden;transform:translateY(8px);transition:all .18s cubic-bezier(.2,.7,.3,1);z-index:90}
.navroot:hover .navdrop{opacity:1;visibility:visible;transform:translateY(0)}
.navdrop.rechts{left:auto;right:-6px}
.navitem{display:block;padding:9px 11px;border-radius:9px;font-size:13.5px;font-weight:600;color:${D.dunkel};transition:background .14s,padding-left .14s}
.navitem:hover{background:${D.blauZart};color:${D.blau};padding-left:15px}
.navitem span{display:block;font-size:11.5px;font-weight:400;color:${D.grauHell};margin-top:2px}
.navitem:hover span{color:${D.blau}}
.navgroup{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${D.grauHell};padding:9px 11px 5px}
.navtrenner{height:1px;background:${D.linie};margin:6px 9px}

.btnfest{background:${D.blau};color:#fff;border:none;border-radius:10px;padding:10px 17px;font-size:13.5px;font-weight:700;cursor:pointer;transition:background .16s,transform .16s,box-shadow .16s;display:inline-block}
.btnfest:hover{background:${D.blauHell};transform:translateY(-1px);box-shadow:0 8px 20px rgba(29,78,216,.28)}
.btnleer{background:transparent;color:${D.dunkel};border:1px solid ${D.linie};border-radius:10px;padding:10px 15px;font-size:13.5px;font-weight:700;cursor:pointer;transition:border-color .16s,color .16s,background .16s;display:inline-block}
.btnleer:hover{border-color:${D.blau};color:${D.blau};background:${D.blauZart}}
.btnhell{background:#fff;color:${D.dunkel};border:none;border-radius:10px;padding:13px 24px;font-size:14.5px;font-weight:800;cursor:pointer;transition:transform .16s,box-shadow .16s;display:inline-block}
.btnhell:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,.22)}
.avatar{width:34px;height:34px;border-radius:50%;border:1px solid ${D.linie};background:${D.blauZart};color:${D.blau};font-size:13.5px;font-weight:800;cursor:pointer;transition:border-color .15s,transform .15s}
.avatar:hover{border-color:${D.blau};transform:translateY(-1px)}

@media (max-width:980px){.navmitte{display:none}}
@media (max-width:700px){.minihide{display:none}}
@media (max-width:760px){.spalten3{grid-template-columns:1fr !important}.spalten2{grid-template-columns:1fr !important}}
@media (prefers-reduced-motion:reduce){*{transition:none !important;animation:none !important}}
`

const MENUE = [
  {
    titel: 'Produkt',
    gruppen: [
      { name: 'Wie es funktioniert', punkte: [
        ['/so-funktioniert-es', 'So funktioniert es', 'Von den Angaben zur fertigen Seite'],
        ['/editor-funktionen', 'Der Editor', 'Texte, Bilder und Farben selbst ändern'],
        ['/branchen', 'Branchen', 'Zehn Branchen mit passenden Inhalten'],
      ] },
      { name: 'Ausprobieren', punkte: [
        ['/#domain', 'Domain prüfen', 'Sofort sehen, was frei ist'],
        ['/start', 'Website erstellen', 'Kostenlos ansehen, später zahlen'],
      ] },
    ],
  },
  {
    titel: 'Preise',
    gruppen: [
      { name: 'Kaufen oder mieten', punkte: [
        ['/preise', 'Alle Preise', 'Kauf, Miete und Einzelposten'],
        ['/preise#kaufen', 'Website kaufen', 'Ab 89 € inkl. MwSt., einmalig'],
        ['/preise#mieten', 'Website mieten', 'Ab 19,90 € inkl. MwSt. monatlich'],
        ['/preise#zusatz', 'Domain & Hosting', 'Was einzeln dazukommt'],
      ] },
    ],
  },
  {
    titel: 'Über uns',
    gruppen: [
      { name: 'Wer dahintersteht', punkte: [
        ['/ueber-uns', 'Über uns', 'Wer wir sind und wie wir arbeiten'],
        ['/kontakt', 'Kontakt', 'Telefon, E-Mail und Formular'],
      ] },
    ],
  },
  {
    titel: 'Hilfe',
    gruppen: [
      { name: 'Fragen & Rechtliches', punkte: [
        ['/hilfe', 'Hilfe & FAQ', 'Antworten zu Kosten, Ablauf, Technik'],
        ['/agb', 'AGB', 'Vertragsbedingungen'],
        ['/datenschutz', 'Datenschutz', 'Welche Daten wir verarbeiten'],
        ['/impressum', 'Impressum', 'Anbieterkennzeichnung'],
      ] },
    ],
  },
]

export function Kopf() {
  const router = useRouter()
  const [nutzer, setNutzer] = useState(null)
  useEffect(() => { aktuellerNutzer().then(setNutzer).catch(() => {}) }, [])

  return (
    <>
      {/* Mini-Leiste */}
      <div className="minileiste">
        <div className="wrap" style={{ height: 36, display: 'flex', alignItems: 'center', gap: 18 }}>
          <a href={TELEFON_LINK} style={{ fontWeight: 600 }}>{TELEFON}</a>
          <span className="minihide" style={{ opacity: .3 }}>·</span>
          <a className="minihide" href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <div style={{ flex: 1 }} />
          <span className="minihide" style={{ opacity: .75 }}>Mo. – Fr. 9 – 18 Uhr</span>
          <span className="minihide" style={{ opacity: .3 }}>·</span>
          <a href="/hilfe">Hilfe &amp; Support</a>
        </div>
      </div>

      {/* Hauptnavigation */}
      <header style={{ background: D.weiss, borderBottom: `1px solid ${D.linie}`, position: 'sticky', top: 0, zIndex: 70 }}>
        <div className="wrap" style={{ height: 68, display: 'flex', alignItems: 'center', gap: 22 }}>
          <a href="/" className="display" style={{ fontSize: 17.5, letterSpacing: '-0.045em', whiteSpace: 'nowrap' }}>
            websitegenerator<span style={{ color: D.blau }}>24</span>
          </a>

          <nav className="navmitte" style={{ display: 'flex', gap: 16, marginLeft: 6 }}>
            {MENUE.map(m => (
              <div key={m.titel} className="navroot">
                <button className="navtrigger">{m.titel}<span className="pfeil" aria-hidden="true">▾</span></button>
                <div className="navdrop">
                  {m.gruppen.map((g, gi) => (
                    <div key={g.name}>
                      {gi > 0 && <div className="navtrenner" />}
                      <div className="navgroup">{g.name}</div>
                      {g.punkte.map(([href, t, u]) => (
                        <a key={href + t} className="navitem" href={href}>{t}<span>{u}</span></a>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div style={{ flex: 1 }} />

          {nutzer ? (
            <>
              <a href="/start" className="btnfest">Neue Website</a>
              <div className="navroot">
                <button className="avatar" title={nutzer.email}>{(nutzer.email || '?')[0].toUpperCase()}</button>
                <div className="navdrop rechts" style={{ minWidth: 240 }}>
                  <div style={{ padding: '9px 11px', fontSize: 11.5, color: D.grauHell, wordBreak: 'break-all' }}>{nutzer.email}</div>
                  <div className="navtrenner" />
                  <a className="navitem" href="/dashboard">Meine Websites<span>Entwürfe und Verträge</span></a>
                  <a className="navitem" href="/konto">Meine Daten<span>Firma, Anschrift, USt-IdNr.</span></a>
                  <a className="navitem" href="/abrechnungen">Abrechnungen<span>Rechnungen und Zahlungen</span></a>
                  <div className="navtrenner" />
                  <a className="navitem" href="/hilfe">Hilfe &amp; Support</a>
                  <button className="navitem" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626' }}
                    onClick={async () => { await supabase.auth.signOut(); router.push('/') }}>Abmelden</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <a href="/login" className="btnleer">Anmelden</a>
              <a href="/start" className="btnfest">Website erstellen</a>
            </>
          )}
        </div>
      </header>
    </>
  )
}
