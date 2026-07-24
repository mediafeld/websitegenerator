'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { aktuellerNutzer } from '@/lib/projekte'
import { supabase, supabaseBereit } from '@/lib/supabaseClient'

// ══ CI websitegenerator24 — „Bauplan“ ══
// Gestaltungsidee: technische Zeichnung / Bauplan. Websites werden hier nicht
// dekoriert, sie werden entworfen — wie eine Werkzeichnung, bevor gebaut wird.
// Nur diese Farben werden verwendet.
export const CI = {
  petrol: '#111C27',      // Bauplan-Tinte, dunkler Grund
  petrol2: '#17293A',     // dunkel, eine Stufe heller (Panels)
  blau: '#2E7EB3',        // Bauplanblau – Primärfarbe
  blauDunkel: '#23648F',  // Akzent gedrückt
  stahl: '#4C7593',       // Zwischenton
  cyan: '#8AD8DE',        // Rasterlinie / Leuchtakzent auf Dunkel
  weiss: '#FFFFFF',
  grau: '#F2F4F3',        // helle Fläche
  linie: '#DEE3E1',
  text: '#111C27',
  textMatt: '#57646C',
  textZart: '#8996A0',
  geist: '#EEF1F0',       // Geister-Überschrift
  orange: '#E1591F',      // Werkzeug-Orange – Handlungsaufrufe, Hervorhebungen
  orangeHell: '#EE7449',
  orangeZart: '#FCE7DD',
  gruen: '#2E9D63',       // Bestätigungen
}

export const D = {
  petrol: CI.petrol, blau: CI.blau, stahl: CI.stahl,
  weiss: CI.weiss, grau: CI.grau, hellgrau: CI.grau, paper: CI.weiss, karte: CI.weiss,
  dunkel: CI.petrol, dunkel2: CI.petrol2, anker: CI.petrol, ankerHell: CI.petrol2,
  text: CI.text, textHell: '#FFFFFF', textMatt: CI.textMatt, textZart: CI.textZart,
  textMattDunkel: '#9FB2C0', grauHell: CI.textZart,
  linie: CI.linie, linieDunkel: 'rgba(255,255,255,.14)',
  akzent: CI.blau, akzentHell: CI.blauDunkel, akzentZart: '#E7EFF3',
  tuerkis: CI.blau, tuerkisZart: '#E7EFF3', violett: CI.stahl, magenta: CI.blau,
  gruen: CI.blau, gruenZart: '#E7EFF3', gold: CI.blau, lila: CI.stahl,
  blauHell: CI.blauDunkel, blauZart: '#E7EFF3',
  hellGrund: CI.grau, hellKarte: CI.weiss, hellText: CI.text,
  hellGrau: CI.textMatt, hellLinie: CI.linie,
  verlauf: `linear-gradient(100deg, ${CI.blau}, ${CI.stahl})`,
}
export const VERLAUF = `linear-gradient(100deg, ${CI.blau}, ${CI.stahl})`

export const TELEFON = '+49 (0)30 57 70 23 66'
export const TELEFON_LINK = 'tel:+493057702366'
export const EMAIL = 'info@websitegenerator24.de'

export const BASIS_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#fff;color:${CI.text};font-family:'Plex',system-ui,sans-serif}
.wrap{max-width:1200px;margin:0 auto;padding:0 24px}
button{font-family:inherit}
input,select,textarea{font-family:inherit}
a{color:inherit;text-decoration:none}
.link-u{transition:color .15s}
.link-u:hover{text-decoration:underline;color:${CI.blau}}
:focus-visible{outline:2px solid ${CI.orange};outline-offset:3px}
::selection{background:${CI.orange};color:#fff}

/* ── Typografie: Grotesk für Überschriften, Plex für Fließtext ── */
.t1{font-family:'Grotesk',sans-serif;font-size:clamp(34px,5vw,62px);line-height:1.06;letter-spacing:-.015em;font-weight:500}
.t1 b{font-weight:700}
.t2{font-family:'Grotesk',sans-serif;font-size:clamp(27px,3.8vw,44px);line-height:1.1;letter-spacing:-.012em;font-weight:500}
.t2 b{font-weight:700}
.t3{font-family:'Grotesk',sans-serif;font-size:21px;font-weight:600;letter-spacing:-.008em;line-height:1.3}
.serif{font-weight:400}
.mono{font-family:'Plexmono',ui-monospace,monospace}
.eyebrow{font-family:'Plexmono',ui-monospace,monospace;font-size:11px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:${CI.orange}}
.eyebrow:before{content:'// ';color:${CI.textZart}}
.lauf{font-size:16.5px;line-height:1.72;color:${CI.textMatt};font-weight:400}
.klein{font-size:14.5px;line-height:1.7;color:${CI.textMatt}}

/* ── Verlaufsschrift: Bauplanblau ins Dunkle ── */
.vschrift{color:${CI.blau}}
.vschrift-hell{color:${CI.cyan}}
.vschrift-bewegt{color:${CI.cyan}}

/* ── Animierter Unterstrich ── */
.strich{position:relative;display:inline-block;padding-bottom:10px}
.strich:after{content:'';position:absolute;left:0;bottom:0;height:4px;width:0;border-radius:3px;
  background:${CI.orange};animation:strichauf 1.1s .25s cubic-bezier(.2,.7,.3,1) forwards}
.reveal.an .strich:after{animation:strichauf 1.1s .3s cubic-bezier(.2,.7,.3,1) forwards}
@keyframes strichauf{from{width:0}to{width:100%}}
.strich-hover{position:relative}
.strich-hover:after{content:'';position:absolute;left:0;bottom:-4px;height:2.5px;width:0;border-radius:2px;
  background:${CI.orange};transition:width .35s cubic-bezier(.2,.7,.3,1)}
.strich-hover:hover:after{width:100%}

/* ── Geister-Überschrift ── */
.geistkopf{position:relative;padding-top:34px}
.geist{position:absolute;top:-14px;left:-4px;font-size:clamp(56px,9.4vw,136px);font-weight:800;
  letter-spacing:-.055em;line-height:.8;color:${CI.geist};white-space:nowrap;pointer-events:none;z-index:0;user-select:none;opacity:.6}
.dunkelzone .geist{color:rgba(255,255,255,.055)}
.geistinhalt{position:relative;z-index:1}
.mitte .geist{left:50%;transform:translateX(-50%)}

/* ── Bänder über volle Breite ── */
.band{width:100%}
.band-hell{background:#fff}
.band-grau{background:${CI.grau}}
.band-dunkel{position:relative;color:#fff;overflow:hidden;
  background:linear-gradient(160deg,${CI.petrol} 0%,#0D2231 100%)}
@keyframes grundlauf{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
.band-dunkel:before{content:'';position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(760px 380px at 88% 6%,rgba(27,147,210,.13),transparent 66%)}
.band-dunkel>*{position:relative;z-index:1}
.band-foto{position:relative;color:#fff;background-size:cover;background-position:center}
.band-foto:before{content:'';position:absolute;inset:0;
  background:linear-gradient(96deg,rgba(10,24,35,.97) 0%,rgba(10,24,35,.9) 52%,rgba(10,24,35,.72) 100%)}
.band-foto>*{position:relative;z-index:1}
.dunkelzone{background:${CI.petrol};color:#fff}
.dunkelzone .lauf,.dunkelzone .klein{color:#9FB2C0}
.dunkelzone .karte{background:rgba(255,255,255,.055);border-color:rgba(255,255,255,.14)}
.dunkelzone .eyebrow{color:#6FC3EF}
.dunkelzone .btnleer{background:transparent;color:#fff;border-color:rgba(255,255,255,.34)}
.dunkelzone .btnleer:hover{border-color:#fff;background:rgba(255,255,255,.09)}

/* ── Karten ── */
.karte{background:#fff;border:1px solid ${CI.linie};border-radius:5px}
.karte-hover{transition:transform .22s cubic-bezier(.2,.7,.3,1),box-shadow .22s,border-color .22s}
.karte-hover:hover{transform:translateY(-4px);box-shadow:0 18px 40px rgba(17,28,39,.12);border-color:${CI.blau}77}

/* ── Eckmarken: wiederkehrendes Bauplan-Motiv ── */
.ecken{position:relative}
.ecken:before,.ecken:after{content:'';position:absolute;width:13px;height:13px;pointer-events:none;opacity:.55}
.ecken:before{top:-1px;left:-1px;border-top:2px solid ${CI.orange};border-left:2px solid ${CI.orange}}
.ecken:after{bottom:-1px;right:-1px;border-bottom:2px solid ${CI.orange};border-right:2px solid ${CI.orange}}

/* ── Knöpfe: gerade Kanten, technische Anmutung ── */
.btnfest{background:${CI.orange};color:#fff;border:none;border-radius:3px;padding:15px 26px;font-size:14.5px;
  font-weight:600;letter-spacing:.005em;cursor:pointer;display:inline-flex;align-items:center;gap:11px;
  transition:background .18s,transform .18s,box-shadow .18s;text-decoration:none}
.btnfest:hover{background:${CI.orangeHell};transform:translateY(-2px);box-shadow:0 12px 26px rgba(225,89,31,.32)}
.btnblau{background:${CI.blau};color:#fff;border:none;border-radius:3px;padding:15px 26px;font-size:14.5px;
  font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:11px;transition:all .18s}
.btnblau:hover{background:${CI.blauDunkel};transform:translateY(-2px);box-shadow:0 12px 26px rgba(46,126,179,.28)}
.btnleer{background:#fff;color:${CI.text};border:1.5px solid ${CI.linie};border-radius:3px;padding:14px 24px;
  font-size:14.5px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:10px;transition:all .18s;text-decoration:none}
.btnleer:hover{border-color:${CI.blau};color:${CI.blau};transform:translateY(-2px)}
.btnhell{background:#fff;color:${CI.petrol};border:none;border-radius:3px;padding:15px 28px;font-size:14.5px;
  font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:10px;transition:all .18s;text-decoration:none}
.btnhell:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(0,0,0,.22)}
.btntuerkis{background:${CI.blau};color:#fff;border:none;border-radius:3px;padding:15px 26px;font-size:14.5px;
  font-weight:600;cursor:pointer;display:inline-block;transition:background .18s,transform .18s}
.btntuerkis:hover{background:${CI.blauDunkel};transform:translateY(-2px)}

/* ── Bewegung ── */
.reveal{opacity:0;transform:translateY(24px);transition:opacity .7s cubic-bezier(.2,.7,.3,1),transform .7s cubic-bezier(.2,.7,.3,1)}
.reveal.an{opacity:1;transform:none}

/* ── Lauftext ── */
.laufband{overflow:hidden;padding:15px 0;background:${CI.petrol};color:#9FB2C0}
.laufband-inhalt{display:flex;gap:46px;white-space:nowrap;animation:laufen 44s linear infinite;
  font-size:12.5px;font-weight:600;letter-spacing:.13em;text-transform:uppercase}
@keyframes laufen{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ── Header: Ankündigung, Hauptleiste, Navigation ── */
.ankuendigung{background:${CI.petrol};color:#DCE6EE;font-size:13.5px}
.neu-marke{background:${CI.orange};color:#fff;font-size:10.5px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;border-radius:5px;padding:4px 9px}
.ank-link{color:${CI.orange};font-weight:700;font-size:13.5px;display:inline-flex;align-items:center;gap:7px;transition:gap .18s}
.ank-link:hover{gap:11px}
.hauptleiste{background:${CI.petrol2};color:#fff;border-bottom:1px solid rgba(138,216,222,.18)}
.hl-punkt{display:inline-flex;align-items:center;gap:8px;font-size:13.5px;font-weight:500;color:#fff;
  padding:7px 10px;border-radius:4px;transition:background .16s}
.hl-punkt:hover{background:rgba(255,255,255,.12)}
.navleiste{background:#fff;border-bottom:1px solid ${CI.linie};position:sticky;top:0;z-index:80}
.logomarke{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;flex-shrink:0;
  border:1.5px solid ${CI.orange};border-radius:3px;position:relative}
.logomarke:after{content:'';position:absolute;width:6px;height:6px;background:${CI.orange};border-radius:1px}
.logowort{font-family:'Grotesk',sans-serif;font-size:19px;font-weight:600;letter-spacing:-.01em;color:#fff;white-space:nowrap}
.minileiste{background:${CI.petrol};color:#9FB2C0;font-size:12.5px}
.minileiste a:hover{color:#fff}
.navroot{position:relative}
.navtrigger{display:flex;align-items:center;gap:5px;font-size:14.5px;font-weight:600;color:${CI.text};
  background:none;border:none;cursor:pointer;padding:9px 2px;transition:color .16s}
.navroot:hover .navtrigger{color:${CI.blau}}
.navroot:hover .pfeil{transform:rotate(180deg)}
.pfeil{transition:transform .22s;font-size:9px;opacity:.5;display:inline-block}
.navdrop{position:absolute;top:100%;left:-14px;min-width:296px;background:#fff;border:1px solid ${CI.linie};
  border-radius:12px;box-shadow:0 22px 50px rgba(10,24,35,.16);padding:9px;opacity:0;visibility:hidden;
  transform:translateY(10px);transition:all .22s cubic-bezier(.2,.7,.3,1);z-index:95}
.navroot:hover .navdrop{opacity:1;visibility:visible;transform:none}
.navdrop.rechts{left:auto;right:-6px}
.navitem{display:block;padding:10px 12px;border-radius:8px;font-size:13.5px;font-weight:600;color:${CI.text};
  transition:background .16s,padding-left .16s,color .16s}
.navitem:hover{background:#E7EFF3;color:${CI.blau};padding-left:18px}
.navitem span{display:block;font-size:11.5px;font-weight:400;color:${CI.textZart};margin-top:2px}
.navgroup{font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${CI.textZart};padding:10px 12px 5px}
.navtrenner{height:1px;background:${CI.linie};margin:6px 9px}
.avatar{width:38px;height:38px;border-radius:50%;border:1.5px solid ${CI.linie};background:#E7EFF3;
  color:${CI.blau};font-size:14px;font-weight:800;cursor:pointer;transition:all .18s}
.avatar:hover{border-color:${CI.blau};transform:translateY(-2px)}

.arbeit{background:${CI.grau};color:${CI.text}}

@media (max-width:980px){.navmitte{display:none}}
@media (max-width:700px){.minihide{display:none}}
@media (max-width:820px){.spalten3{grid-template-columns:1fr !important}.spalten2{grid-template-columns:1fr !important}.geist{display:none}}
@media (prefers-reduced-motion:reduce){*{animation:none !important}.reveal{opacity:1;transform:none;transition:none}}
`

const MENUE = [
  { titel: 'Website mieten', gruppen: [
    { name: 'Online bei uns — Domain inklusive', punkte: [
      ['/preise#mieten', 'Mietpakete & Preise', 'Ab 19,90 € im Monat inkl. MwSt.'],
      ['/preise#sorgenfrei', 'Keine-Sorgen-Paket', 'Alles inklusive, wir übernehmen die Änderungen'],
      ['/domains', 'Domain & E-Mail', 'Was bei der Miete enthalten ist'],
      ['/hilfe#mieten', 'Fragen zur Miete', 'Laufzeit, Kündigung, Umzug'],
    ] },
  ] },
  { titel: 'Website kaufen', gruppen: [
    { name: 'Einmalzahlung — ZIP gehört dir', punkte: [
      ['/preise#kaufen', 'Kaufpakete & Preise', 'Ab 89,00 € einmalig inkl. MwSt.'],
      ['/editor-funktionen', 'Was du bearbeiten kannst', 'Texte, Bilder, Farben, Blöcke'],
      ['/hilfe#kaufen', 'Fragen zum Kauf', 'Eigentum, Hosting, Umzug'],
    ] },
  ] },
  { titel: 'Produkt', gruppen: [
    { name: 'Wie es funktioniert', punkte: [
      ['/so-funktioniert-es', 'So funktioniert es', 'Von den Angaben zur fertigen Seite'],
      ['/branchen', 'Branchen', 'Zehn Branchen mit passenden Inhalten'],
      ['/editor-funktionen', 'Der Editor', 'Alles selbst änderbar, dauerhaft gratis'],
      ['/#domain', 'Domain prüfen', 'Sofort sehen, was frei ist'],
    ] },
  ] },
  { titel: 'Hilfe', gruppen: [
    { name: 'Fragen & Rechtliches', punkte: [
      ['/hilfe', 'Hilfe & FAQ', 'Kosten, Ablauf, Technik'],
      ['/ueber-uns', 'Über uns', 'Wer dahintersteht'],
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
      {/* Ankündigungsleiste */}
      <div className="ankuendigung">
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, minHeight: 42, flexWrap: 'wrap' }}>
          <span className="neu-marke">Neu</span>
          <span style={{ fontSize: 13.5 }}>
            <strong>Websiteerstellung kostenlos</strong> — erst zahlen, wenn dir die Website gefällt
          </span>
          <a href="/start" className="ank-link">Jetzt erstellen <i className="fa-solid fa-arrow-right" aria-hidden="true" /></a>
        </div>
      </div>

      {/* Hauptleiste */}
      <div className="hauptleiste">
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', gap: 20, minHeight: 56 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span className="logomarke" aria-hidden="true" />
            <span className="logowort">websitegenerator<span style={{ color: CI.orangeHell }}>24</span></span>
          </a>
          <div style={{ flex: 1 }} />
          <a href={TELEFON_LINK} className="hl-punkt minihide"><i className="fa-solid fa-phone" aria-hidden="true" />{TELEFON}</a>
          <a href="/hilfe" className="hl-punkt"><i className="fa-solid fa-circle-question" aria-hidden="true" /><span className="minihide">Hilfe &amp; Kontakt</span></a>
          <a href={nutzer ? '/dashboard' : '/login'} className="hl-punkt">
            <i className="fa-solid fa-user" aria-hidden="true" /><span className="minihide">{nutzer ? 'Mein Konto' : 'Login'}</span>
          </a>
        </div>
      </div>

      {/* Navigation */}
      <header className="navleiste">
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', gap: 26, minHeight: 58 }}>
          <nav className="navmitte" style={{ display: 'flex', gap: 26 }}>
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
            <a href="/kontakt" className="navtrigger strich-hover" style={{ textDecoration: 'none' }}>Kontakt</a>
          </nav>
          <div style={{ flex: 1 }} />
          {nutzer ? (
            <>
              <a href="/dashboard" className="btnleer" style={{ padding: '10px 17px', fontSize: 14 }}>
                <i className="fa-solid fa-folder-open" aria-hidden="true" />Meine Websites
              </a>
              <a href="/start" className="btnfest" style={{ padding: '11px 20px', fontSize: 14.5 }}>
                <i className="fa-solid fa-plus" aria-hidden="true" />Neue Website
              </a>
              <div className="navroot">
                <button className="avatar" title={nutzer.email}>{(nutzer.email || '?')[0].toUpperCase()}</button>
                <div className="navdrop rechts" style={{ minWidth: 240 }}>
                  <div style={{ padding: '10px 12px', fontSize: 11.5, color: CI.textZart, wordBreak: 'break-all' }}>{nutzer.email}</div>
                  <div className="navtrenner" />
                  <a className="navitem" href="/dashboard">Meine Websites</a>
                  <a className="navitem" href="/konto">Meine Daten</a>
                  <a className="navitem" href="/abrechnungen">Rechnungen</a>
                  <a className="navitem" href="/domains">Domains</a>
                  <div className="navtrenner" />
                  <button type="button" className="navitem" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: '#DC2626' }} onClick={abmelden}>
                    <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: 9 }} aria-hidden="true" />Abmelden
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <a href="/login" className="btnleer" style={{ padding: '10px 17px', fontSize: 14 }}>
                <i className="fa-solid fa-right-to-bracket" aria-hidden="true" />Anmelden
              </a>
              <a href="/start" className="btnfest" style={{ padding: '11px 20px', fontSize: 14.5 }}>
                <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />Website erstellen
              </a>
            </>
          )}
        </div>
      </header>
    </>
  )
}
