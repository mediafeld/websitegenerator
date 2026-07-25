'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { aktuellerNutzer } from '@/lib/projekte'
import { supabase, supabaseBereit } from '@/lib/supabaseClient'
import { WarenkorbKnopf } from '@/components/Warenkorb'
import { WARENKORB_CSS } from '@/components/Warenkorb'
import { WYSIWYG_CSS } from '@/components/WysiwygEditor'

// ══ CI websitegenerator24 — angelehnt an mediafeld.de ══
// Farbwelt bewusst schmal gehalten: Blau, Schwarzblau, Weiß, Hellgrau.
// „orange" bleibt als Token für Abwärtskompatibilität bestehen, ist aber
// bewusst auf einen zweiten Blauton gelegt — kein Fremdfarbton in der CI.
export const CI = {
  petrol: '#0A1824',      // mediafeld-Navy, Grundfarbe dunkel
  petrol2: '#0F2436',     // dunkel, eine Stufe heller
  blau: '#1B93D2',        // Signalblau – Haupt-Handlungsfarbe
  blauDunkel: '#157AB0',  // Akzent gedrückt
  stahl: '#2D5A7B',       // Zwischenton
  weiss: '#FFFFFF',
  grau: '#F1F4F6',        // helle Fläche
  linie: '#E1E7EB',
  text: '#0A1824',
  textMatt: '#5A6B7A',
  textZart: '#8A99A6',
  geist: '#EEF2F5',       // Geister-Überschrift
  orange: '#2FA8E8',       // zweiter, hellerer Blauton – Auszeichnungen, Ribbons
  orangeHell: '#54BCEF',
  orangeZart: '#E7F4FC',
  gruen: '#1F9D55',       // Bestätigungen
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
body{background:#fff;color:${CI.text};font-family:'InterTight',system-ui,sans-serif}
.wrap{max-width:1600px;margin:0 auto;padding:0 32px}
button{font-family:inherit}
input,select,textarea{font-family:inherit}
a{color:inherit;text-decoration:none}
.link-u{transition:color .15s}
.link-u:hover{text-decoration:underline;color:${CI.blau}}
:focus-visible{outline:2px solid ${CI.blau};outline-offset:3px}
::selection{background:${CI.blau};color:#fff}

/* ── Typografie: Inter Tight, groß, 100er Feinschnitt gegen 800er Fettung ── */
.t1{font-size:clamp(44px,7.2vw,108px);line-height:1.05;letter-spacing:-.025em;font-weight:100;text-wrap:balance}
.t1 b{font-weight:800}
.t2{font-size:clamp(34px,5vw,58px);line-height:1.12;letter-spacing:-.022em;font-weight:100;text-wrap:balance}
.t2 b{font-weight:800}
.t3{font-size:25px;font-weight:700;letter-spacing:-.012em;line-height:1.3;text-wrap:balance}
.display{font-weight:800;letter-spacing:-.02em;line-height:1.2;color:${CI.text};text-wrap:balance}
.serif{font-weight:100}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:${CI.blau}}
.lauf{font-size:17px;line-height:1.74;color:${CI.textMatt};font-weight:400}
.klein{font-size:14.5px;line-height:1.7;color:${CI.textMatt}}

/* ── Hervorhebung: fett + ein einzelner handgezeichneter Schwung, zieht sich einmal ein ── */
.vschrift{position:relative;display:inline-block;color:${CI.text};font-weight:800;padding-bottom:9px}
.vschrift:after{content:'';position:absolute;left:-2px;right:-2px;bottom:0;height:11px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 20' preserveAspectRatio='none'%3E%3Cpath d='M4,15.5 Q100,2 196,11' stroke='%23FF5722' stroke-width='5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-size:100% 100%;background-repeat:no-repeat;clip-path:inset(0 100% 0 0)}
.reveal.an .vschrift:after{animation:strichzeichnen .95s .35s cubic-bezier(.25,.7,.3,1) forwards}
.vschrift-hell{position:relative;display:inline-block;color:#fff;font-weight:800;padding-bottom:9px}
.vschrift-hell:after{content:'';position:absolute;left:-2px;right:-2px;bottom:0;height:11px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 20' preserveAspectRatio='none'%3E%3Cpath d='M4,15.5 Q100,2 196,11' stroke='%23FF5722' stroke-width='5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-size:100% 100%;background-repeat:no-repeat;clip-path:inset(0 100% 0 0)}
.reveal.an .vschrift-hell:after{animation:strichzeichnen .95s .35s cubic-bezier(.25,.7,.3,1) forwards}
.vschrift-bewegt{position:relative;display:inline-block;color:#fff;font-weight:800;padding-bottom:9px}
.vschrift-bewegt:after{content:'';position:absolute;left:-2px;right:-2px;bottom:0;height:11px;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 20' preserveAspectRatio='none'%3E%3Cpath d='M4,15.5 Q100,2 196,11' stroke='%23FF5722' stroke-width='5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-size:100% 100%;background-repeat:no-repeat;clip-path:inset(0 100% 0 0)}
.reveal.an .vschrift-bewegt:after{animation:strichzeichnen .95s .35s cubic-bezier(.25,.7,.3,1) forwards}
@keyframes strichzeichnen{to{clip-path:inset(0 0 0 0)}}

/* ── Unterstrich beim Hover (z. B. Links) ── */
.strich-hover{position:relative}
.strich-hover:after{content:'';position:absolute;left:0;bottom:-4px;height:2.5px;width:0;border-radius:2px;
  background:${CI.blau};transition:width .35s cubic-bezier(.2,.7,.3,1)}
.strich-hover:hover:after{width:100%}

/* ── Geister-Überschrift ── */
.geistkopf{position:relative;padding-top:30px}
.geist{position:absolute;top:-10px;left:-4px;font-size:clamp(52px,8.6vw,124px);font-weight:800;
  letter-spacing:-.05em;line-height:.8;color:#DCE4E9;white-space:nowrap;pointer-events:none;z-index:0;user-select:none}
.dunkelzone .geist{color:rgba(255,255,255,.055)}
.geistinhalt{position:relative;z-index:1}
.mitte .geist{left:50%;transform:translateX(-50%)}

/* ── Bänder über volle Breite ── */
.band{width:100%}
.band-hell{background:#fff}
.band-grau{background:${CI.grau}}
.band-dunkel{position:relative;color:#fff;overflow:hidden;
  background:linear-gradient(160deg,${CI.petrol} 0%,#0D2231 100%)}
.band-dunkel:before{content:'';position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(760px 380px at 88% 6%,rgba(27,147,210,.15),transparent 66%)}
.band-dunkel>*{position:relative;z-index:1}
.band-foto{position:relative;color:#fff;background-size:cover;background-position:center}
.band-foto:before{content:'';position:absolute;inset:0;
  background:linear-gradient(96deg,rgba(10,24,36,.96) 0%,rgba(10,24,36,.88) 52%,rgba(10,24,36,.68) 100%)}
.band-foto>*{position:relative;z-index:1}
.dunkelzone{background:${CI.petrol};color:#fff}
.dunkelzone .lauf,.dunkelzone .klein{color:#9FB2C0}
.dunkelzone .karte{background:rgba(255,255,255,.055);border-color:rgba(255,255,255,.14)}
.dunkelzone .eyebrow{color:#6FC3EF}
.dunkelzone .btnleer{background:transparent;color:#fff;border-color:rgba(255,255,255,.34)}
.dunkelzone .btnleer:hover{border-color:#fff;background:rgba(255,255,255,.09)}

/* ── Karten ── */
.karte{background:#fff;border:1px solid ${CI.linie};border-radius:14px}
.karte-hover{transition:transform .28s cubic-bezier(.2,.7,.3,1),box-shadow .28s,border-color .28s}
.karte-hover:hover{transform:translateY(-6px);box-shadow:0 22px 48px rgba(10,24,36,.14);border-color:${CI.blau}66}

/* ── Häkchenlisten (auf allen Seiten nutzbar) ── */
.haken{list-style:none;display:flex;flex-direction:column;gap:13px}
.haken li{display:flex;align-items:center;gap:12px;font-size:14.8px;line-height:1.5;color:${CI.text}}
.haken li i{color:${CI.blau};font-size:11px;flex-shrink:0;width:22px;height:22px;border-radius:50%;
  background:#E7EFF3;display:flex;align-items:center;justify-content:center}
.haken.gruen li i{color:${CI.gruen};background:#E7F7EC;font-size:12px}
.dunkelzone .haken li,.sorgen .haken li{color:#DCE6EE}
.haken.zwei{display:grid;grid-template-columns:1fr 1fr;gap:11px 24px}

/* ── Reiter / Tab-Pillen (auf allen Seiten nutzbar) ── */
.reiter{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:26px}
.reiter-an,.reiter-aus{border-radius:99px;padding:11px 20px;font-size:13.5px;font-weight:600;cursor:pointer;transition:all .2s;border:1.5px solid}
.reiter-an{background:${CI.blau};color:#fff;border-color:${CI.blau};box-shadow:0 10px 22px rgba(27,147,210,.28)}
.reiter-aus{background:#fff;color:${CI.textMatt};border-color:${CI.linie}}
.reiter-aus:hover{border-color:${CI.blau};color:${CI.blau};transform:translateY(-2px)}

/* ── Umschalter: echter Schalter statt zwei Kästen (auf allen Seiten nutzbar) ── */
.umschalter{display:flex;align-items:center;gap:16px}
.umschalter button{background:none;border:none;cursor:pointer;font-family:inherit;font-size:16px;font-weight:600;
  color:${CI.textZart};transition:color .18s;padding:4px 0}
.umschalter button.an{color:${CI.text}}
.uschalt{position:relative;width:46px;height:26px;border-radius:99px;background:${CI.blau};cursor:pointer;
  flex-shrink:0;transition:background .2s}
.ukugel{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;
  box-shadow:0 2px 6px rgba(0,0,0,.25);transition:transform .25s cubic-bezier(.2,.7,.3,1)}

/* ── Einleitungs-Textblock: Auftakt auf Unterseiten (auf allen Seiten nutzbar) ── */
.einleitung{position:relative;display:grid;grid-template-columns:1fr 1fr 1fr;gap:40px;padding:64px 0 56px}
.eink-punkt{position:absolute;top:0;left:0;width:13px;height:13px;border:1.5px solid #FF5722;border-radius:50%}
.eink-kopf{padding-top:30px}
.einleitung .lauf{padding-top:30px}
@media(max-width:900px){.einleitung{grid-template-columns:1fr;gap:16px;padding:44px 0 36px}.eink-kopf{padding-top:20px}.einleitung .lauf{padding-top:0}}

/* Bildkacheln: leichter Zoom beim Hover, damit die Seite lebendig wirkt */
.bildzoom{overflow:hidden}
.bildzoom img,.bildzoom .bzimg{transition:transform .6s cubic-bezier(.2,.7,.3,1)}
.bildzoom:hover img,.bildzoom:hover .bzimg{transform:scale(1.06)}

/* ── Knöpfe ── */
.btnfest{background:${CI.blau};color:#fff;border:none;border-radius:99px;padding:15px 28px;font-size:15px;
  font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:11px;
  transition:background .18s,transform .18s,box-shadow .18s;text-decoration:none}
.btnfest:hover{background:${CI.blauDunkel};transform:translateY(-2px);box-shadow:0 14px 30px rgba(27,147,210,.32)}
.btnblau{background:${CI.blau};color:#fff;border:none;border-radius:99px;padding:15px 26px;font-size:15px;
  font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:11px;transition:all .18s}
.btnblau:hover{background:${CI.blauDunkel};transform:translateY(-2px);box-shadow:0 12px 28px rgba(27,147,210,.3)}
.btnleer{background:#fff;color:${CI.text};border:1.5px solid ${CI.linie};border-radius:99px;padding:14px 25px;
  font-size:15px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:10px;transition:all .18s;text-decoration:none}
.btnleer:hover{border-color:${CI.blau};color:${CI.blau};transform:translateY(-2px)}
.btnhell{background:#fff;color:${CI.petrol};border:none;border-radius:99px;padding:15px 28px;font-size:15px;
  font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:10px;transition:all .18s;text-decoration:none}
.btnhell:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(0,0,0,.24)}
.btntuerkis{background:${CI.blau};color:#fff;border:none;border-radius:99px;padding:15px 26px;font-size:15px;
  font-weight:700;cursor:pointer;display:inline-block;transition:background .18s,transform .18s}
.btntuerkis:hover{background:${CI.blauDunkel};transform:translateY(-2px)}

/* ── Bewegung: fliegt beim Scrollen rein, beim Weiterscrollen wieder raus ── */
.reveal{opacity:0;transform:translateY(26px);transition:opacity .7s cubic-bezier(.2,.7,.3,1),transform .7s cubic-bezier(.2,.7,.3,1)}
.reveal.an{opacity:1;transform:none}
.reveal-pop{transform:scale(.9) translateY(16px)}
.reveal-links{transform:translateX(-32px)}
.reveal-rechts{transform:translateX(32px)}

/* ── Lauftext ── */
.laufband{overflow:hidden;padding:15px 0;background:${CI.petrol};color:#9FB2C0}
.laufband-inhalt{display:flex;gap:46px;white-space:nowrap;animation:laufen 44s linear infinite;
  font-size:12.5px;font-weight:600;letter-spacing:.13em;text-transform:uppercase}
@keyframes laufen{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ── Header: Ankündigung, Hauptleiste, Navigation — durchgehend dunkel ── */
.ankuendigung{background:${CI.petrol};color:#DCE6EE;font-size:13.5px}
.neu-marke{background:${CI.blau};color:#fff;font-size:10.5px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;border-radius:5px;padding:4px 9px}
.ank-link{color:#6FC3EF;font-weight:700;font-size:13.5px;display:inline-flex;align-items:center;gap:7px;transition:gap .18s}
.ank-link:hover{gap:11px}
.hauptleiste{background:${CI.petrol2};color:#fff}
.hl-punkt{display:inline-flex;align-items:center;gap:8px;font-size:13.5px;font-weight:500;color:#fff;
  padding:7px 10px;border-radius:99px;transition:background .16s}
.hl-punkt:hover{background:rgba(255,255,255,.14)}
.navleiste{background:${CI.petrol};border-bottom:1px solid rgba(255,255,255,.08);position:sticky;top:0;z-index:80}
.logowort{font-size:20px;font-weight:800;letter-spacing:-.03em;color:#fff;white-space:nowrap}
.navleiste .btnleer{background:transparent;color:#fff;border-color:rgba(255,255,255,.32)}
.navleiste .btnleer:hover{background:rgba(255,255,255,.1);border-color:#fff;color:#fff}
.minileiste{background:${CI.petrol};color:#9FB2C0;font-size:12.5px}
.minileiste a:hover{color:#fff}
.navroot{position:relative}
.navtrigger{display:flex;align-items:center;gap:5px;font-size:14.5px;font-weight:600;color:#fff;
  background:none;border:none;cursor:pointer;padding:9px 2px;transition:color .16s}
.navroot:hover .navtrigger{color:#6FC3EF}
.navroot:hover .pfeil{transform:rotate(180deg)}
.pfeil{transition:transform .22s;font-size:9px;opacity:.6;display:inline-block}
.navdrop{position:absolute;top:100%;left:-14px;min-width:296px;background:#fff;border:1px solid ${CI.linie};
  border-radius:14px;box-shadow:0 22px 50px rgba(10,24,36,.28);padding:9px;opacity:0;visibility:hidden;
  transform:translateY(10px);transition:all .22s cubic-bezier(.2,.7,.3,1);z-index:95}
.navroot:hover .navdrop{opacity:1;visibility:visible;transform:none}
.navdrop.rechts{left:auto;right:-6px}
.navitem{display:block;padding:10px 12px;border-radius:9px;font-size:13.5px;font-weight:600;color:${CI.text};
  transition:background .16s,padding-left .16s,color .16s}
.navitem:hover{background:#E7EFF3;color:${CI.blau};padding-left:18px}
.navitem span{display:block;font-size:11.5px;font-weight:400;color:${CI.textZart};margin-top:2px}
.navgroup{font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${CI.textZart};padding:10px 12px 5px}
.navtrenner{height:1px;background:${CI.linie};margin:6px 9px}
.avatar{width:38px;height:38px;border-radius:50%;border:1.5px solid rgba(255,255,255,.3);background:rgba(255,255,255,.1);
  color:#fff;font-size:14px;font-weight:800;cursor:pointer;transition:all .18s}
.avatar:hover{border-color:#fff;transform:translateY(-2px)}

.arbeit{background:${CI.grau};color:${CI.text}}

@media (max-width:980px){.navmitte{display:none}}
@media (max-width:700px){.minihide{display:none}}
@media (max-width:820px){.spalten3{grid-template-columns:1fr !important}.spalten2{grid-template-columns:1fr !important}.geist{display:none}}
@media (prefers-reduced-motion:reduce){*{animation:none !important}.reveal{opacity:1;transform:none;transition:none}}
${WARENKORB_CSS}
${WYSIWYG_CSS}
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
  const [vorname, setVorname] = useState(null)

  // Anmeldestatus laufend überwachen – sonst zeigt die Kopfzeile nach dem
  // Abmelden weiter den alten Zustand.
  useEffect(() => {
    aktuellerNutzer().then(async (u) => {
      setNutzer(u)
      if (!u) return
      // Vorname zuerst aus dem Profil (Konto-Seite), sonst aus den Signup-Daten
      try {
        const { data: p } = await supabase.from('profile').select('vorname').eq('id', u.id).maybeSingle()
        setVorname(p?.vorname || u.user_metadata?.vorname || null)
      } catch {
        setVorname(u.user_metadata?.vorname || null)
      }
    }).catch(() => {})
    if (!supabaseBereit) return
    const { data } = supabase.auth.onAuthStateChange(async (_ev, sitzung) => {
      const u = sitzung?.user || null
      setNutzer(u)
      if (!u) { setVorname(null); return }
      try {
        const { data: p } = await supabase.from('profile').select('vorname').eq('id', u.id).maybeSingle()
        setVorname(p?.vorname || u.user_metadata?.vorname || null)
      } catch {
        setVorname(u.user_metadata?.vorname || null)
      }
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
      {/* Ankündigungsleiste — bei Login: Begrüßung links statt Promo */}
      <div className="ankuendigung">
        {nutzer ? (
          <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, minHeight: 42, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>👋 Hallo{vorname ? `, ${vorname}` : ''}!</span>
            <a href="/start" className="ank-link">Neue Website erstellen <i className="fa-solid fa-arrow-right" aria-hidden="true" /></a>
          </div>
        ) : (
          <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, minHeight: 42, flexWrap: 'wrap' }}>
            <span className="neu-marke">Neu</span>
            <span style={{ fontSize: 13.5 }}>
              <strong>Websiteerstellung kostenlos</strong> — erst zahlen, wenn dir die Website gefällt
            </span>
            <a href="/start" className="ank-link">Jetzt erstellen <i className="fa-solid fa-arrow-right" aria-hidden="true" /></a>
          </div>
        )}
      </div>

      {/* Hauptleiste */}
      <div className="hauptleiste">
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', gap: 20, minHeight: 56 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span className="logowort">websitegenerator<span style={{ color: '#6FC3EF' }}>24</span></span>
          </a>
          <div style={{ flex: 1 }} />
          <a href={TELEFON_LINK} className="hl-punkt minihide"><i className="fa-solid fa-phone" aria-hidden="true" />{TELEFON}</a>
          <a href="/hilfe" className="hl-punkt"><i className="fa-solid fa-circle-question" aria-hidden="true" /><span className="minihide">Hilfe &amp; Kontakt</span></a>
          <a href={nutzer ? '/dashboard' : '/login'} className="hl-punkt">
            <i className="fa-solid fa-user" aria-hidden="true" /><span className="minihide">{nutzer ? 'Mein Konto' : 'Login'}</span>
          </a>
          <WarenkorbKnopf />
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
