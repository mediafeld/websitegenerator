'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { aktuellerNutzer } from '@/lib/projekte'
import { supabase, supabaseBereit } from '@/lib/supabaseClient'

export const D = {
  // Dunkle Flächen (öffentliche Seiten)
  dunkel: '#0B0420', dunkel2: '#150A33', karte: '#17093C',
  text: '#F4EFFF', textMatt: '#A99BD4',
  // Neon
  magenta: '#FF2FB9', lila: '#8B3DFF', tuerkis: '#22E7D0', gold: '#FFB13D',
  // Kompatible Namen (Hauptakzent = Magenta)
  blau: '#FF2FB9', blauHell: '#FF63CC', blauZart: 'rgba(255,47,185,.15)',
  gruen: '#22E7D0', gruenZart: 'rgba(34,231,208,.12)',
  grau: '#A99BD4', grauHell: '#8577B4',
  weiss: '#17093C', paper: '#0B0420', linie: 'rgba(255,255,255,.11)',
  // Helle Arbeitsflächen (Konto, Rechtstexte)
  hellGrund: '#F5F2FF', hellKarte: '#FFFFFF', hellText: '#190C38',
  hellGrau: '#5C5279', hellLinie: '#E3DCF7',
}

export const TELEFON = '+49 (0)30 57 70 23 66'
export const TELEFON_LINK = 'tel:+493057702366'
export const EMAIL = 'info@websitegenerator24.de'

export const BASIS_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:${D.dunkel};color:${D.text}}
.display{font-family:'Inter Tight',system-ui,sans-serif;font-weight:800;letter-spacing:-0.045em;line-height:1.02}
.leicht{font-weight:300;color:${D.textMatt}}
.eyebrow{font-size:10.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase}
.wrap{max-width:1180px;margin:0 auto;padding:0 22px}
button{font-family:inherit}
input,select,textarea{font-family:inherit}
a{color:inherit;text-decoration:none}
.link-u{transition:color .15s}
.link-u:hover{text-decoration:underline;color:${D.tuerkis}}
:focus-visible{outline:2px solid ${D.tuerkis};outline-offset:3px}
::selection{background:${D.magenta};color:#fff}

/* ── Neon-Bausteine ── */
.neon{background:linear-gradient(96deg,${D.magenta},${D.lila} 46%,${D.tuerkis});-webkit-background-clip:text;background-clip:text;color:transparent}
.karte{background:${D.karte};border:1px solid ${D.linie};border-radius:18px}
.karte-hover{transition:transform .24s cubic-bezier(.2,.7,.3,1),box-shadow .24s,border-color .24s}
.karte-hover:hover{transform:translateY(-6px);border-color:${D.magenta};box-shadow:0 0 0 1px ${D.magenta}55,0 18px 50px rgba(255,47,185,.22)}
.gitter{position:absolute;inset:auto 0 0 0;height:44%;background-image:linear-gradient(${D.lila}22 1px,transparent 1px),linear-gradient(90deg,${D.lila}22 1px,transparent 1px);background-size:60px 40px;transform:perspective(320px) rotateX(62deg);transform-origin:bottom;opacity:.75;pointer-events:none}
.blase{position:absolute;border-radius:50%;filter:blur(70px);opacity:.5;pointer-events:none;animation:schweben 15s ease-in-out infinite}
@keyframes schweben{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(28px,-22px) scale(1.08)}66%{transform:translate(-22px,18px) scale(.95)}}

/* ── Knöpfe ── */
.btnfest{background:linear-gradient(96deg,${D.magenta},${D.lila});color:#fff;border:none;border-radius:12px;padding:12px 20px;font-size:14px;font-weight:800;cursor:pointer;display:inline-block;position:relative;transition:transform .18s,box-shadow .18s,filter .18s}
.btnfest:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(255,47,185,.45);filter:brightness(1.08)}
.btnleer{background:transparent;color:${D.text};border:1.5px solid ${D.linie};border-radius:12px;padding:11px 18px;font-size:14px;font-weight:700;cursor:pointer;display:inline-block;transition:border-color .18s,color .18s,box-shadow .18s,transform .18s}
.btnleer:hover{border-color:${D.tuerkis};color:${D.tuerkis};box-shadow:0 0 22px rgba(34,231,208,.22);transform:translateY(-2px)}
.btnhell{background:#fff;color:${D.dunkel};border:none;border-radius:12px;padding:14px 26px;font-size:15px;font-weight:800;cursor:pointer;display:inline-block;transition:transform .18s,box-shadow .18s}
.btnhell:hover{transform:translateY(-3px);box-shadow:0 16px 38px rgba(255,255,255,.24)}
.btntuerkis{background:linear-gradient(96deg,${D.tuerkis},${D.lila});color:#04121A;border:none;border-radius:12px;padding:12px 20px;font-size:14px;font-weight:800;cursor:pointer;display:inline-block;transition:transform .18s,box-shadow .18s}
.btntuerkis:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(34,231,208,.42)}

/* ── Scroll-Einblendung ── */
.reveal{opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.2,.7,.3,1),transform .7s cubic-bezier(.2,.7,.3,1)}
.reveal.an{opacity:1;transform:none}

/* ── Lauftext ── */
.laufband{overflow:hidden;border-top:1px solid ${D.linie};border-bottom:1px solid ${D.linie};background:${D.dunkel2};padding:13px 0}
.laufband-inhalt{display:flex;gap:44px;white-space:nowrap;animation:laufen 34s linear infinite;font-size:13.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}
@keyframes laufen{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ── Navigation ── */
.minileiste{background:#07021A;color:${D.textMatt};font-size:12.5px;border-bottom:1px solid ${D.linie}}
.minileiste a:hover{color:${D.tuerkis}}
.navroot{position:relative}
.navtrigger{display:flex;align-items:center;gap:5px;font-size:14px;font-weight:600;color:${D.textMatt};background:none;border:none;cursor:pointer;padding:9px 2px;transition:color .16s}
.navroot:hover .navtrigger{color:${D.text}}
.navroot:hover .pfeil{transform:rotate(180deg)}
.pfeil{transition:transform .2s;font-size:9px;opacity:.6;display:inline-block}
.navdrop{position:absolute;top:100%;left:-14px;min-width:290px;background:${D.dunkel2};border:1px solid ${D.linie};border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.6);padding:9px;opacity:0;visibility:hidden;transform:translateY(10px);transition:all .2s cubic-bezier(.2,.7,.3,1);z-index:95}
.navroot:hover .navdrop{opacity:1;visibility:visible;transform:translateY(0)}
.navdrop.rechts{left:auto;right:-6px}
.navitem{display:block;padding:10px 12px;border-radius:10px;font-size:13.5px;font-weight:600;color:${D.text};transition:background .15s,padding-left .15s,color .15s}
.navitem:hover{background:${D.blauZart};color:${D.magenta};padding-left:17px}
.navitem span{display:block;font-size:11.5px;font-weight:400;color:${D.grauHell};margin-top:2px}
.navitem:hover span{color:${D.textMatt}}
.navgroup{font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${D.grauHell};padding:10px 12px 5px}
.navtrenner{height:1px;background:${D.linie};margin:6px 9px}
.avatar{width:36px;height:36px;border-radius:50%;border:1.5px solid ${D.linie};background:${D.blauZart};color:${D.magenta};font-size:14px;font-weight:800;cursor:pointer;transition:border-color .16s,transform .16s,box-shadow .16s}
.avatar:hover{border-color:${D.magenta};transform:translateY(-1px);box-shadow:0 0 18px rgba(255,47,185,.4)}

/* ── Helle Arbeitsfläche (Konto, Rechtstexte) ── */
.arbeit{background:${D.hellGrund};color:${D.hellText}}
.arbeit .karte,.arbeit .kkarte{background:${D.hellKarte};border-color:${D.hellLinie};color:${D.hellText}}
.arbeit .btnleer{color:${D.hellText};border-color:${D.hellLinie}}
.arbeit .btnleer:hover{border-color:${D.magenta};color:${D.magenta}}
.arbeit .link-u:hover{color:${D.magenta}}

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
          <a href={TELEFON_LINK} style={{ fontWeight: 700, color: D.tuerkis }}>
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

      <header style={{ background: 'rgba(11,4,32,.9)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${D.linie}`, position: 'sticky', top: 0, zIndex: 80 }}>
        <div className="wrap" style={{ height: 70, display: 'flex', alignItems: 'center', gap: 22 }}>
          <a href="/" className="display" style={{ fontSize: 18.5, whiteSpace: 'nowrap' }}>
            websitegenerator<span className="neon">24</span>
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
                  <button type="button" className="navitem" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: '#FF6B8A' }}
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
