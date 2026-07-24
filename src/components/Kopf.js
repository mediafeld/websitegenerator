'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { aktuellerNutzer } from '@/lib/projekte'
import { supabase, supabaseBereit } from '@/lib/supabaseClient'

export const D = {
  // Dunkle Anker-Bereiche (Hero, Vertrauensband, Abschluss, Footer)
  dunkel: '#0E1B3A', dunkel2: '#16264F',
  // Helle Flächen
  weiss: '#FFFFFF', hellgrau: '#F6F8FC', paper: '#FFFFFF', karte: '#FFFFFF',
  // Text
  text: '#101A33', textHell: '#FFFFFF', textMatt: '#5B6880', textMattDunkel: '#A9B6CE',
  grau: '#5B6880', grauHell: '#8494AE',
  // Linien
  linie: '#E5EAF3', linieDunkel: 'rgba(255,255,255,.13)',
  // Akzente: Pink-Rot als Hauptfarbe, Türkis für Bestätigungen
  akzent: '#E8365D', akzentHell: '#FF4A70', akzentZart: '#FDECF1',
  tuerkis: '#12B3A0', tuerkisZart: '#E6F7F4',
  gold: '#E08A1E', lila: '#6D3BD4',
  // Kompatible Namen
  blau: '#E8365D', blauHell: '#FF4A70', blauZart: '#FDECF1',
  gruen: '#12B3A0', gruenZart: '#E6F7F4', magenta: '#E8365D',
  hellGrund: '#F6F8FC', hellKarte: '#FFFFFF', hellText: '#101A33',
  hellGrau: '#5B6880', hellLinie: '#E5EAF3',
}

export const TELEFON = '+49 (0)30 57 70 23 66'
export const TELEFON_LINK = 'tel:+493057702366'
export const EMAIL = 'info@websitegenerator24.de'

export const BASIS_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#FFFFFF;color:${D.text}}
.display{font-family:'Inter Tight',system-ui,sans-serif;font-weight:800;letter-spacing:-0.035em;line-height:1.08}
.leicht{font-weight:300;color:${D.textMatt}}
.eyebrow{font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${D.akzent}}
.wrap{max-width:1180px;margin:0 auto;padding:0 22px}
button{font-family:inherit}
input,select,textarea{font-family:inherit}
a{color:inherit;text-decoration:none}
.link-u{transition:color .15s}
.link-u:hover{text-decoration:underline;color:${D.akzent}}
:focus-visible{outline:2px solid ${D.akzent};outline-offset:3px}
::selection{background:${D.akzentZart};color:${D.text}}

/* ── Flächen ── */
.hellgrau{background:${D.hellgrau}}
.karte{background:#fff;border:1px solid ${D.linie};border-radius:16px}
.karte-hover{transition:transform .22s cubic-bezier(.2,.7,.3,1),box-shadow .22s,border-color .22s}
.karte-hover:hover{transform:translateY(-4px);box-shadow:0 18px 44px rgba(16,26,51,.11);border-color:#D6DEEC}

/* ── Dunkle Anker-Bereiche ── */
.dunkelzone{background:${D.dunkel};color:${D.textHell}}
.dunkelzone .karte{background:rgba(255,255,255,.05);border-color:${D.linieDunkel}}
.dunkelzone .leicht{color:${D.textMattDunkel}}
.dunkelzone .eyebrow{color:#FF7C97}
.dunkelzone .btnleer{color:#fff;border-color:rgba(255,255,255,.32)}
.dunkelzone .btnleer:hover{border-color:#fff;background:rgba(255,255,255,.08);color:#fff}
.dunkelzone .link-u:hover{color:#fff}

/* ── Knöpfe ── */
.btnfest{background:${D.akzent};color:#fff;border:none;border-radius:10px;padding:13px 22px;font-size:14.5px;font-weight:700;cursor:pointer;display:inline-block;transition:background .18s,transform .18s,box-shadow .18s}
.btnfest:hover{background:${D.akzentHell};transform:translateY(-2px);box-shadow:0 12px 26px rgba(232,54,93,.3)}
.btnleer{background:transparent;color:${D.text};border:1.5px solid ${D.linie};border-radius:10px;padding:12px 20px;font-size:14.5px;font-weight:700;cursor:pointer;display:inline-block;transition:border-color .18s,color .18s,transform .18s}
.btnleer:hover{border-color:${D.akzent};color:${D.akzent};transform:translateY(-2px)}
.btnhell{background:#fff;color:${D.dunkel};border:none;border-radius:10px;padding:14px 26px;font-size:15px;font-weight:800;cursor:pointer;display:inline-block;transition:transform .18s,box-shadow .18s}
.btnhell:hover{transform:translateY(-3px);box-shadow:0 14px 32px rgba(0,0,0,.2)}
.btntuerkis{background:${D.tuerkis};color:#fff;border:none;border-radius:10px;padding:13px 22px;font-size:14.5px;font-weight:700;cursor:pointer;display:inline-block;transition:background .18s,transform .18s,box-shadow .18s}
.btntuerkis:hover{background:#15C7B2;transform:translateY(-2px);box-shadow:0 12px 26px rgba(18,179,160,.3)}

/* ── Scroll-Einblendung (dezent) ── */
.reveal{opacity:0;transform:translateY(18px);transition:opacity .6s ease,transform .6s cubic-bezier(.2,.7,.3,1)}
.reveal.an{opacity:1;transform:none}

/* ── Lauftext (ruhig) ── */
.laufband{overflow:hidden;border-top:1px solid ${D.linie};border-bottom:1px solid ${D.linie};background:#fff;padding:14px 0}
.laufband-inhalt{display:flex;gap:44px;white-space:nowrap;animation:laufen 42s linear infinite;font-size:12.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
@keyframes laufen{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ── Navigation ── */
.minileiste{background:${D.dunkel};color:${D.textMattDunkel};font-size:12.5px}
.minileiste a:hover{color:#fff}
.navroot{position:relative}
.navtrigger{display:flex;align-items:center;gap:5px;font-size:14.5px;font-weight:600;color:${D.text};background:none;border:none;cursor:pointer;padding:9px 2px;transition:color .16s}
.navroot:hover .navtrigger{color:${D.akzent}}
.navroot:hover .pfeil{transform:rotate(180deg)}
.pfeil{transition:transform .2s;font-size:9px;opacity:.5;display:inline-block}
.navdrop{position:absolute;top:100%;left:-14px;min-width:290px;background:#fff;border:1px solid ${D.linie};border-radius:14px;box-shadow:0 20px 48px rgba(16,26,51,.14);padding:9px;opacity:0;visibility:hidden;transform:translateY(9px);transition:all .2s cubic-bezier(.2,.7,.3,1);z-index:95}
.navroot:hover .navdrop{opacity:1;visibility:visible;transform:translateY(0)}
.navdrop.rechts{left:auto;right:-6px}
.navitem{display:block;padding:10px 12px;border-radius:9px;font-size:13.5px;font-weight:600;color:${D.text};transition:background .15s,padding-left .15s,color .15s}
.navitem:hover{background:${D.akzentZart};color:${D.akzent};padding-left:17px}
.navitem span{display:block;font-size:11.5px;font-weight:400;color:${D.grauHell};margin-top:2px}
.navgroup{font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${D.grauHell};padding:10px 12px 5px}
.navtrenner{height:1px;background:${D.linie};margin:6px 9px}
.avatar{width:36px;height:36px;border-radius:50%;border:1.5px solid ${D.linie};background:${D.akzentZart};color:${D.akzent};font-size:14px;font-weight:800;cursor:pointer;transition:border-color .16s,transform .16s}
.avatar:hover{border-color:${D.akzent};transform:translateY(-1px)}

/* ── Arbeitsfläche (Konto, Rechtstexte) ── */
.arbeit{background:${D.hellgrau};color:${D.text}}

@media (max-width:980px){.navmitte{display:none}}
@media (max-width:700px){.minihide{display:none}}
@media (max-width:780px){.spalten3{grid-template-columns:1fr !important}.spalten2{grid-template-columns:1fr !important}}
@media (prefers-reduced-motion:reduce){*{animation:none !important}.reveal{opacity:1;transform:none;transition:none}}
`

const MENUE = [
  { titel: 'Produkt', gruppen: [
    { name: 'Wie es funktioniert', punkte: [
      ['/so-funktioniert-es', 'So funktioniert es', 'Von den Angaben zur fertigen Seite'],
      ['/editor-funktionen', 'Der Editor', 'Texte, Bilder und Farben selbst ändern'],
      ['/branchen', 'Branchen', 'Zehn Branchen mit passenden Inhalten'],
    ] },
    { name: 'Ausprobieren', punkte: [
      ['/#domain', 'Domain prüfen', 'Sofort sehen, was frei ist'],
      ['/start', 'Website erstellen', 'Erstellen kostet nichts'],
    ] },
  ] },
  { titel: 'Preise', gruppen: [
    { name: 'Mieten oder kaufen', punkte: [
      ['/preise', 'Alle Preise', 'Miete, Kauf und Einzelposten'],
      ['/preise#mieten', 'Website mieten', 'Ab 19,90 € inkl. MwSt. — Domain inklusive'],
      ['/preise#kaufen', 'Website kaufen', 'Ab 89 € inkl. MwSt. — ZIP sofort'],
      ['/preise#sorgenfrei', 'Keine-Sorgen-Paket', 'Alles inklusive, ein Preis'],
    ] },
  ] },
  { titel: 'Über uns', gruppen: [
    { name: 'Wer dahintersteht', punkte: [
      ['/ueber-uns', 'Über uns', 'Wer wir sind und wie wir arbeiten'],
      ['/kontakt', 'Kontakt', 'Telefon, E-Mail und Formular'],
    ] },
  ] },
  { titel: 'Hilfe', gruppen: [
    { name: 'Fragen & Rechtliches', punkte: [
      ['/hilfe', 'Hilfe & FAQ', 'Kosten, Ablauf, Technik'],
      ['/agb', 'AGB', 'Vertragsbedingungen'],
      ['/datenschutz', 'Datenschutz', 'Welche Daten wir verarbeiten'],
      ['/impressum', 'Impressum', 'Anbieterkennzeichnung'],
    ] },
  ] },
]

export function Kopf() {
  const router = useRouter()
  const [nutzer, setNutzer] = useState(null)

  // Anmeldestatus laufend überwachen – sonst zeigt die Kopfzeile nach dem
  // Abmelden weiter den alten Zustand.
  useEffect(() => {
    aktuellerNutzer().then(setNutzer).catch(() => {})
    if (!supabaseBereit) return
    const { data } = supabase.auth.onAuthStateChange((_ev, sitzung) => {
      setNutzer(sitzung?.user || null)
    })
    return () => data?.subscription?.unsubscribe?.()
  }, [])

  async function abmelden() {
    try { if (supabaseBereit) await supabase.auth.signOut() } catch {}
    setNutzer(null)
    // Harte Weiterleitung, damit kein alter Zustand im Speicher bleibt
    if (typeof window !== 'undefined') window.location.assign('/')
    else router.push('/')
  }

  return (
    <>
      <div className="minileiste">
        <div className="wrap" style={{ height: 36, display: 'flex', alignItems: 'center', gap: 18 }}>
          <a href={TELEFON_LINK} style={{ fontWeight: 700, color: '#fff' }}>
            <i className="fa-solid fa-phone" style={{ marginRight: 8, fontSize: 11 }} aria-hidden="true" />{TELEFON}
          </a>
          <span className="minihide" style={{ opacity: .3 }}>·</span>
          <a className="minihide" href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <div style={{ flex: 1 }} />
          <span className="minihide" style={{ opacity: .8 }}>Mo. – Fr. 9 – 18 Uhr</span>
          <span className="minihide" style={{ opacity: .3 }}>·</span>
          <a href="/hilfe"><i className="fa-solid fa-headset" style={{ marginRight: 7, fontSize: 11 }} aria-hidden="true" />Hilfe &amp; Support</a>
        </div>
      </div>

      <header style={{ background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${D.linie}`, position: 'sticky', top: 0, zIndex: 80 }}>
        <div className="wrap" style={{ height: 70, display: 'flex', alignItems: 'center', gap: 22 }}>
          <a href="/" className="display" style={{ fontSize: 18.5, whiteSpace: 'nowrap' }}>
            websitegenerator<span style={{ color: D.akzent }}>24</span>
          </a>

          <nav className="navmitte" style={{ display: 'flex', gap: 16, marginLeft: 8 }}>
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
                <div className="navdrop rechts" style={{ minWidth: 250 }}>
                  <div style={{ padding: '10px 12px', fontSize: 11.5, color: D.grauHell, wordBreak: 'break-all' }}>{nutzer.email}</div>
                  <div className="navtrenner" />
                  <a className="navitem" href="/dashboard">Meine Websites<span>Entwürfe und Verträge</span></a>
                  <a className="navitem" href="/konto">Meine Daten<span>Firma, Anschrift, USt-IdNr.</span></a>
                  <a className="navitem" href="/abrechnungen">Rechnungen<span>Verträge und Zahlungen</span></a>
                  <a className="navitem" href="/domains">Domains<span>Registrierte Adressen</span></a>
                  <div className="navtrenner" />
                  <button type="button" className="navitem" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626' }}
                    onClick={abmelden}>
                    <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: 9 }} aria-hidden="true" />Abmelden
                  </button>
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
