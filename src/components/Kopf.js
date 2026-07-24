'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { aktuellerNutzer } from '@/lib/projekte'
import { supabase, supabaseBereit } from '@/lib/supabaseClient'

// ══ CI websitegenerator24 ══
// Verlauf: Blau → Violett → Türkis. Anker: Indigo-Schwarz. Dazu Weiß und Grau.
// Es werden AUSSCHLIESSLICH diese Farben verwendet.
export const CI = {
  blau: '#2B62F0',
  violett: '#7B3FE4',
  tuerkis: '#12C8C8',
  anker: '#0D0A2B',
  ankerHell: '#191446',
  weiss: '#FFFFFF',
  grau: '#F5F5FC',
  grauLinie: '#E6E5F4',
  textStark: '#14113A',
  textMatt: '#67658C',
  textZart: '#9694B4',
}
export const VERLAUF = `linear-gradient(100deg, ${CI.blau}, ${CI.violett} 52%, ${CI.tuerkis})`
export const VERLAUF_WEICH = `linear-gradient(100deg, ${CI.blau}22, ${CI.violett}1C 52%, ${CI.tuerkis}20)`

export const D = {
  // CI
  blau: CI.blau, violett: CI.violett, tuerkis: CI.tuerkis,
  anker: CI.anker, ankerHell: CI.ankerHell,
  verlauf: VERLAUF,
  // Flächen
  weiss: CI.weiss, grau: CI.grau, hellgrau: CI.grau, paper: CI.weiss, karte: CI.weiss,
  dunkel: CI.anker, dunkel2: CI.ankerHell,
  // Text
  text: CI.textStark, textHell: '#FFFFFF', textMatt: CI.textMatt, textZart: CI.textZart,
  textMattDunkel: '#A9A6D0', grauHell: CI.textZart,
  // Linien
  linie: CI.grauLinie, linieDunkel: 'rgba(255,255,255,.13)',
  // Kompatible Namen
  akzent: CI.violett, akzentHell: CI.blau, akzentZart: '#F0EDFE',
  tuerkisZart: '#E4F8F8', magenta: CI.violett, gold: CI.tuerkis, lila: CI.violett,
  gruen: CI.tuerkis, gruenZart: '#E4F8F8',
  blauHell: CI.blau, blauZart: '#F0EDFE',
  hellGrund: CI.grau, hellKarte: CI.weiss, hellText: CI.textStark,
  hellGrau: CI.textMatt, hellLinie: CI.grauLinie,
}

export const TELEFON = '+49 (0)30 57 70 23 66'
export const TELEFON_LINK = 'tel:+493057702366'
export const EMAIL = 'info@websitegenerator24.de'

export const BASIS_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:${CI.weiss};color:${CI.textStark}}
.display{font-family:'Inter Tight',system-ui,sans-serif;font-weight:800;letter-spacing:-0.05em;line-height:1.0}
.haar{font-weight:100}
.duenn{font-weight:200}
.leicht{font-weight:300;color:${CI.textMatt}}
.eyebrow{font-size:11px;font-weight:700;letter-spacing:.2em;text-transform:uppercase}
.wrap{max-width:1200px;margin:0 auto;padding:0 22px}
button{font-family:inherit}
input,select,textarea{font-family:inherit}
a{color:inherit;text-decoration:none}
.link-u{transition:color .15s}
.link-u:hover{text-decoration:underline;color:${CI.violett}}
:focus-visible{outline:2px solid ${CI.violett};outline-offset:3px}
::selection{background:${CI.violett};color:#fff}

/* ── Verlaufsschrift ── */
.verlauf{background:${VERLAUF};-webkit-background-clip:text;background-clip:text;color:transparent}
.verlauf-bewegt{background:linear-gradient(100deg,${CI.blau},${CI.violett},${CI.tuerkis},${CI.violett},${CI.blau});
  background-size:260% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:wandern 11s ease-in-out infinite}
@keyframes wandern{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}

/* ── Flächen & weiche Übergänge ── */
.grauflaeche{background:${CI.grau}}
.weich-oben{position:relative}
.weich-oben:before{content:'';position:absolute;left:0;right:0;top:0;height:90px;
  background:linear-gradient(180deg,${CI.weiss},transparent);pointer-events:none}
.weich-unten:after{content:'';position:absolute;left:0;right:0;bottom:0;height:90px;
  background:linear-gradient(0deg,${CI.weiss},transparent);pointer-events:none}
.mesh{position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(680px 420px at 12% 8%, ${CI.blau}26, transparent 62%),
             radial-gradient(720px 460px at 88% 18%, ${CI.violett}24, transparent 64%),
             radial-gradient(600px 380px at 62% 92%, ${CI.tuerkis}22, transparent 62%)}
.punkte{position:absolute;inset:0;pointer-events:none;
  background-image:radial-gradient(${CI.violett}2E 1px, transparent 1px);background-size:24px 24px;
  mask-image:linear-gradient(180deg,#000 10%,transparent 78%);-webkit-mask-image:linear-gradient(180deg,#000 10%,transparent 78%)}
.wolke{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;animation:treiben 20s ease-in-out infinite}
@keyframes treiben{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(34px,-26px) scale(1.1)}66%{transform:translate(-26px,22px) scale(.94)}}

/* ── Karten ── */
.karte{background:#fff;border:1px solid ${CI.grauLinie};border-radius:20px}
.karte-hover{transition:transform .3s cubic-bezier(.2,.7,.3,1),box-shadow .3s,border-color .3s}
.karte-hover:hover{transform:translateY(-7px) rotate(-.5deg);box-shadow:0 26px 60px rgba(43,98,240,.16);border-color:${CI.violett}55}
.rahmen-verlauf{position:relative;background:#fff;border-radius:20px}
.rahmen-verlauf:before{content:'';position:absolute;inset:-1.5px;border-radius:21px;background:${VERLAUF};z-index:-1}

/* ── Knöpfe ── */
.btnfest{background:${VERLAUF};background-size:200% 100%;color:#fff;border:none;border-radius:12px;padding:14px 24px;
  font-size:15px;font-weight:700;cursor:pointer;display:inline-block;transition:background-position .5s,transform .2s,box-shadow .2s}
.btnfest:hover{background-position:100% 50%;transform:translateY(-3px);box-shadow:0 16px 34px rgba(123,63,228,.34)}
.btnleer{background:#fff;color:${CI.textStark};border:1.5px solid ${CI.grauLinie};border-radius:12px;padding:13px 22px;
  font-size:15px;font-weight:700;cursor:pointer;display:inline-block;transition:border-color .2s,color .2s,transform .2s,box-shadow .2s}
.btnleer:hover{border-color:${CI.violett};color:${CI.violett};transform:translateY(-3px);box-shadow:0 12px 28px rgba(123,63,228,.14)}
.btnhell{background:#fff;color:${CI.anker};border:none;border-radius:12px;padding:15px 28px;font-size:15.5px;font-weight:800;
  cursor:pointer;display:inline-block;transition:transform .2s,box-shadow .2s}
.btnhell:hover{transform:translateY(-3px);box-shadow:0 18px 40px rgba(0,0,0,.22)}
.btntuerkis{background:linear-gradient(100deg,${CI.tuerkis},${CI.blau});color:#fff;border:none;border-radius:12px;
  padding:14px 24px;font-size:15px;font-weight:700;cursor:pointer;display:inline-block;transition:transform .2s,box-shadow .2s}
.btntuerkis:hover{transform:translateY(-3px);box-shadow:0 16px 34px rgba(18,200,200,.34)}

/* ── Dunkle Anker-Bereiche ── */
.dunkelzone{background:${CI.anker};color:#fff}
.dunkelzone .karte{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.14)}
.dunkelzone .leicht{color:#A9A6D0}
.dunkelzone .btnleer{background:transparent;color:#fff;border-color:rgba(255,255,255,.32)}
.dunkelzone .btnleer:hover{border-color:#fff;background:rgba(255,255,255,.09);color:#fff}

/* ── Bewegung ── */
.reveal{opacity:0;transform:translateY(30px) scale(.985);transition:opacity .8s cubic-bezier(.2,.7,.3,1),transform .8s cubic-bezier(.2,.7,.3,1)}
.reveal.an{opacity:1;transform:none}
.dreh:hover{transform:rotate(6deg) scale(1.1)}
.schwebe{animation:schweben 8s ease-in-out infinite}
@keyframes schweben{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-18px) rotate(1.5deg)}}
.puls{animation:pulsen 3.4s ease-in-out infinite}
@keyframes pulsen{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}

/* ── Lauftext ── */
.laufband{overflow:hidden;padding:16px 0;background:${CI.grau}}
.laufband-inhalt{display:flex;gap:46px;white-space:nowrap;animation:laufen 40s linear infinite;
  font-size:12.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase}
@keyframes laufen{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ── Navigation ── */
.minileiste{background:${CI.anker};color:#A9A6D0;font-size:12.5px}
.minileiste a:hover{color:#fff}
.navroot{position:relative}
.navtrigger{display:flex;align-items:center;gap:5px;font-size:14.5px;font-weight:600;color:${CI.textStark};
  background:none;border:none;cursor:pointer;padding:9px 2px;transition:color .16s}
.navroot:hover .navtrigger{color:${CI.violett}}
.navroot:hover .pfeil{transform:rotate(180deg)}
.pfeil{transition:transform .25s;font-size:9px;opacity:.5;display:inline-block}
.navdrop{position:absolute;top:100%;left:-14px;min-width:296px;background:#fff;border:1px solid ${CI.grauLinie};
  border-radius:16px;box-shadow:0 24px 56px rgba(20,17,58,.16);padding:9px;opacity:0;visibility:hidden;
  transform:translateY(12px) scale(.98);transition:all .24s cubic-bezier(.2,.7,.3,1);z-index:95}
.navroot:hover .navdrop{opacity:1;visibility:visible;transform:none}
.navdrop.rechts{left:auto;right:-6px}
.navitem{display:block;padding:10px 12px;border-radius:10px;font-size:13.5px;font-weight:600;color:${CI.textStark};
  transition:background .16s,padding-left .16s,color .16s}
.navitem:hover{background:#F3F0FE;color:${CI.violett};padding-left:18px}
.navitem span{display:block;font-size:11.5px;font-weight:400;color:${CI.textZart};margin-top:2px}
.navgroup{font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${CI.textZart};padding:10px 12px 5px}
.navtrenner{height:1px;background:${CI.grauLinie};margin:6px 9px}
.avatar{width:38px;height:38px;border-radius:50%;border:1.5px solid ${CI.grauLinie};background:#F3F0FE;
  color:${CI.violett};font-size:14px;font-weight:800;cursor:pointer;transition:all .2s}
.avatar:hover{border-color:${CI.violett};transform:translateY(-2px) rotate(-6deg)}

.arbeit{background:${CI.grau};color:${CI.textStark}}

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
            websitegenerator<span className="verlauf">24</span>
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
