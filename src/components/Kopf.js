'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { aktuellerNutzer } from '@/lib/projekte'
import { supabase, supabaseBereit } from '@/lib/supabaseClient'

// ══ CI websitegenerator24 ══
// Nur diese Farben werden verwendet.
export const CI = {
  petrol: '#0A1823',      // Grundfarbe dunkel
  petrol2: '#0F2233',     // dunkel, eine Stufe heller
  blau: '#1B93D2',        // Signalblau – Akzent
  blauDunkel: '#157AB0',  // Akzent gedrückt
  stahl: '#2D5A7B',       // Zwischenton
  weiss: '#FFFFFF',
  grau: '#F2F5F8',        // helle Fläche
  linie: '#DFE6ED',
  text: '#0A1823',
  textMatt: '#5A6B7A',
  textZart: '#8A99A6',
  geist: '#EDF1F5',       // Geister-Überschrift
}

export const D = {
  petrol: CI.petrol, blau: CI.blau, stahl: CI.stahl,
  weiss: CI.weiss, grau: CI.grau, hellgrau: CI.grau, paper: CI.weiss, karte: CI.weiss,
  dunkel: CI.petrol, dunkel2: CI.petrol2, anker: CI.petrol, ankerHell: CI.petrol2,
  text: CI.text, textHell: '#FFFFFF', textMatt: CI.textMatt, textZart: CI.textZart,
  textMattDunkel: '#9FB2C0', grauHell: CI.textZart,
  linie: CI.linie, linieDunkel: 'rgba(255,255,255,.14)',
  akzent: CI.blau, akzentHell: CI.blauDunkel, akzentZart: '#E8F4FB',
  tuerkis: CI.blau, tuerkisZart: '#E8F4FB', violett: CI.stahl, magenta: CI.blau,
  gruen: CI.blau, gruenZart: '#E8F4FB', gold: CI.blau, lila: CI.stahl,
  blauHell: CI.blauDunkel, blauZart: '#E8F4FB',
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
body{background:#fff;color:${CI.text}}
.wrap{max-width:1200px;margin:0 auto;padding:0 24px}
button{font-family:inherit}
input,select,textarea{font-family:inherit}
a{color:inherit;text-decoration:none}
.link-u{transition:color .15s}
.link-u:hover{text-decoration:underline;color:${CI.blau}}
:focus-visible{outline:2px solid ${CI.blau};outline-offset:3px}
::selection{background:${CI.blau};color:#fff}

/* ── Typografie: Kontrast über Gewicht 400 gegen 800 ── */
.t1{font-size:clamp(34px,5vw,62px);line-height:1.06;letter-spacing:-.035em;font-weight:400}
.t1 b{font-weight:800}
.t2{font-size:clamp(28px,4vw,46px);line-height:1.1;letter-spacing:-.032em;font-weight:400}
.t2 b{font-weight:800}
.t3{font-size:21px;font-weight:700;letter-spacing:-.022em;line-height:1.25}
.eyebrow{font-size:11px;font-weight:700;letter-spacing:.19em;text-transform:uppercase;color:${CI.blau}}
.lauf{font-size:16.5px;line-height:1.75;color:${CI.textMatt};font-weight:400}
.klein{font-size:14.5px;line-height:1.7;color:${CI.textMatt}}

/* ── Geister-Überschrift ── */
.geistkopf{position:relative;padding-top:34px}
.geist{position:absolute;top:-8px;left:-4px;font-size:clamp(52px,9vw,124px);font-weight:800;
  letter-spacing:-.055em;line-height:.82;color:${CI.geist};white-space:nowrap;pointer-events:none;z-index:0;user-select:none}
.dunkelzone .geist{color:rgba(255,255,255,.055)}
.geistinhalt{position:relative;z-index:1}
.mitte .geist{left:50%;transform:translateX(-50%)}

/* ── Bänder über volle Breite ── */
.band{width:100%}
.band-hell{background:#fff}
.band-grau{background:${CI.grau}}
.band-dunkel{background:${CI.petrol};color:#fff}
.band-foto{position:relative;color:#fff;background-size:cover;background-position:center}
.band-foto:before{content:'';position:absolute;inset:0;background:linear-gradient(100deg,rgba(10,24,35,.95) 0%,rgba(10,24,35,.78) 52%,rgba(10,24,35,.5) 100%)}
.band-foto>*{position:relative;z-index:1}
.dunkelzone{background:${CI.petrol};color:#fff}
.dunkelzone .lauf,.dunkelzone .klein{color:#9FB2C0}
.dunkelzone .karte{background:rgba(255,255,255,.055);border-color:rgba(255,255,255,.14)}
.dunkelzone .eyebrow{color:#6FC3EF}
.dunkelzone .btnleer{background:transparent;color:#fff;border-color:rgba(255,255,255,.34)}
.dunkelzone .btnleer:hover{border-color:#fff;background:rgba(255,255,255,.09)}

/* ── Karten ── */
.karte{background:#fff;border:1px solid ${CI.linie};border-radius:14px}
.karte-hover{transition:transform .26s cubic-bezier(.2,.7,.3,1),box-shadow .26s,border-color .26s}
.karte-hover:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(10,24,35,.13);border-color:${CI.blau}66}

/* ── Knöpfe ── */
.btnfest{background:${CI.blau};color:#fff;border:none;border-radius:8px;padding:15px 26px;font-size:15px;
  font-weight:700;cursor:pointer;display:inline-block;transition:background .18s,transform .18s,box-shadow .18s}
.btnfest:hover{background:${CI.blauDunkel};transform:translateY(-2px);box-shadow:0 12px 28px rgba(27,147,210,.34)}
.btnleer{background:#fff;color:${CI.text};border:1.5px solid ${CI.linie};border-radius:8px;padding:14px 24px;
  font-size:15px;font-weight:700;cursor:pointer;display:inline-block;transition:all .18s}
.btnleer:hover{border-color:${CI.blau};color:${CI.blau};transform:translateY(-2px)}
.btnhell{background:#fff;color:${CI.petrol};border:none;border-radius:8px;padding:15px 28px;font-size:15px;
  font-weight:800;cursor:pointer;display:inline-block;transition:transform .18s,box-shadow .18s}
.btnhell:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(0,0,0,.24)}
.btntuerkis{background:${CI.blau};color:#fff;border:none;border-radius:8px;padding:15px 26px;font-size:15px;
  font-weight:700;cursor:pointer;display:inline-block;transition:background .18s,transform .18s}
.btntuerkis:hover{background:${CI.blauDunkel};transform:translateY(-2px)}

/* ── Bewegung ── */
.reveal{opacity:0;transform:translateY(24px);transition:opacity .7s cubic-bezier(.2,.7,.3,1),transform .7s cubic-bezier(.2,.7,.3,1)}
.reveal.an{opacity:1;transform:none}

/* ── Lauftext ── */
.laufband{overflow:hidden;padding:15px 0;background:${CI.petrol};color:#9FB2C0}
.laufband-inhalt{display:flex;gap:46px;white-space:nowrap;animation:laufen 44s linear infinite;
  font-size:12.5px;font-weight:600;letter-spacing:.13em;text-transform:uppercase}
@keyframes laufen{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ── Navigation ── */
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
.navitem:hover{background:#EAF4FB;color:${CI.blau};padding-left:18px}
.navitem span{display:block;font-size:11.5px;font-weight:400;color:${CI.textZart};margin-top:2px}
.navgroup{font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${CI.textZart};padding:10px 12px 5px}
.navtrenner{height:1px;background:${CI.linie};margin:6px 9px}
.avatar{width:38px;height:38px;border-radius:50%;border:1.5px solid ${CI.linie};background:#EAF4FB;
  color:${CI.blau};font-size:14px;font-weight:800;cursor:pointer;transition:all .18s}
.avatar:hover{border-color:${CI.blau};transform:translateY(-2px)}

.arbeit{background:${CI.grau};color:${CI.text}}

@media (max-width:980px){.navmitte{display:none}}
@media (max-width:700px){.minihide{display:none}}
@media (max-width:820px){.spalten3{grid-template-columns:1fr !important}.spalten2{grid-template-columns:1fr !important}.geist{display:none}}
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
          <a href="/" style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-.04em', whiteSpace: 'nowrap' }}>
            websitegenerator<span style={{ color: CI.blau }}>24</span>
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
