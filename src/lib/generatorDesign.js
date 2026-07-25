// ─────────────────────────────────────────────────────────────
// GENERATOR-DESIGN-SPRACHE  ("Fundament")
// Die edle Optik der Hauptseite (websitegenerator24.de) – aber THEMEBAR:
// alle Farben laufen über --p50..--p900 / --accent (aus colorSystem.js),
// die Schrift über die Kundenwahl. So bekommt jede generierte Seite
// dieselbe Wertigkeit, sieht aber pro Kunde anders aus.
//
// Alle Klassen sind mit  wg-  präfixiert, damit nichts mit den
// bestehenden Inline-Blöcken oder AOS kollidiert. Rein additiv.
// ─────────────────────────────────────────────────────────────

// Handgezeichneter Schwung als SVG-Maske → wird in --accent eingefärbt
const SQUIGGLE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 22' preserveAspectRatio='none'%3E%3Cpath d='M5 15 Q 60 3 120 11 T 235 10 T 296 8' fill='none' stroke='%23000' stroke-width='7' stroke-linecap='round'/%3E%3C/svg%3E\")"

export function generatorDesignCSS({ fontHeadline } = {}) {
  const headlineFam = fontHeadline ? `font-family:'${fontHeadline}',inherit;` : ''
  return `
/* ── Fundament: Typo-Skala ── */
.wg-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--p600);}
.wg-eyebrow.hell{color:var(--accent);}
.wg-chip{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:8px 16px;border-radius:99px;background:var(--p50);color:var(--p700);}
.wg-chip.glas{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);color:#fff;}
.wg-t1{${headlineFam}font-size:clamp(40px,7vw,86px);font-weight:300;line-height:1.05;letter-spacing:-.03em;text-wrap:balance;color:#0f172a;margin:0;}
.wg-t1 b,.wg-t1 strong{font-weight:800;}
.wg-t2{${headlineFam}font-size:clamp(30px,5vw,54px);font-weight:300;line-height:1.1;letter-spacing:-.025em;text-wrap:balance;color:#0f172a;margin:0;}
.wg-t2 b,.wg-t2 strong{font-weight:800;}
.wg-t3{${headlineFam}font-size:clamp(22px,3vw,30px);font-weight:700;line-height:1.2;letter-spacing:-.02em;color:#0f172a;margin:0;}
.wg-lead{font-size:clamp(17px,1.5vw,20px);line-height:1.72;color:#64748b;font-weight:400;}
.wg-dunkelzone .wg-t1,.wg-dunkelzone .wg-t2,.wg-dunkelzone .wg-t3{color:#fff;}
.wg-dunkelzone .wg-lead{color:rgba(255,255,255,.76);}

/* ── Handgezeichneter Akzent-Unterstrich (in Kundenfarbe) ── */
.wg-vstrich{position:relative;display:inline-block;white-space:nowrap;}
.wg-vstrich::after{content:"";position:absolute;left:-2%;right:-2%;bottom:-.16em;height:.34em;background:var(--accent);-webkit-mask:${SQUIGGLE} no-repeat center/100% 100%;mask:${SQUIGGLE} no-repeat center/100% 100%;clip-path:inset(0 100% 0 0);}
.wg-strichlinie{display:block;width:190px;max-width:62%;height:15px;margin:16px 0 24px;background:var(--accent);-webkit-mask:${SQUIGGLE} no-repeat left center/100% 100%;mask:${SQUIGGLE} no-repeat left center/100% 100%;clip-path:inset(0 100% 0 0);}
.wg-strichlinie.mitte{margin-left:auto;margin-right:auto;}
.wg-reveal.an .wg-vstrich::after,.wg-vstrich.an::after,.wg-reveal.an .wg-strichlinie,.wg-strichlinie.an{animation:wgStrich 1s .35s cubic-bezier(.25,.7,.3,1) forwards;}
@keyframes wgStrich{to{clip-path:inset(0 0 0 0)}}

/* ── Geister-Überschrift (großes verblasstes Wort im Hintergrund) ── */
.wg-geistwrap{position:relative;}
.wg-geist{position:absolute;top:-.55em;left:50%;transform:translateX(-50%);${headlineFam}font-size:clamp(56px,9vw,128px);font-weight:800;letter-spacing:-.03em;line-height:1;color:rgba(15,23,42,.045);white-space:nowrap;pointer-events:none;z-index:0;}
.wg-geist.links{left:0;transform:none;}
.wg-dunkelzone .wg-geist{color:rgba(255,255,255,.06);}

/* ── Bänder / Sektionen ── */
.wg-wrap{max-width:1200px;margin:0 auto;padding:0 24px;}
.wg-sekt{padding:clamp(60px,9vw,108px) 0;position:relative;}
.wg-band-hell{background:#fff;}
.wg-band-grau{background:var(--p50);}
.wg-band-dunkel{background:linear-gradient(160deg,var(--p900),#0d1b2a 70%);}
.wg-dunkelzone{color:#fff;}

/* ── Karten ── */
.wg-karte{background:#fff;border:1px solid rgba(15,23,42,.08);border-radius:18px;padding:26px;transition:transform .35s cubic-bezier(.2,.7,.3,1),box-shadow .35s,border-color .35s;}
.wg-karte-hover:hover{transform:translateY(-6px);box-shadow:0 24px 50px rgba(15,23,42,.12);border-color:var(--accent);}
.wg-iconchip{width:52px;height:52px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:21px;background:linear-gradient(135deg,var(--p500),var(--p700));color:#fff;box-shadow:0 10px 22px rgba(15,23,42,.14);}

/* ── Buttons (Pillen wie auf der Hauptseite) ── */
.wg-btn{display:inline-flex;align-items:center;gap:10px;text-decoration:none;font-weight:700;font-size:16px;padding:16px 30px;border-radius:99px;background:var(--accent);color:#fff;box-shadow:0 14px 30px rgba(15,23,42,.18);transition:transform .2s,box-shadow .2s,filter .2s;cursor:pointer;border:none;}
.wg-btn:hover{transform:translateY(-2px);filter:brightness(1.05);box-shadow:0 18px 38px rgba(15,23,42,.24);}
.wg-btn-voll{background:var(--p600);}
.wg-btn-leer{display:inline-flex;align-items:center;gap:10px;text-decoration:none;font-weight:600;font-size:16px;padding:16px 30px;border-radius:99px;background:transparent;color:var(--p700);border:1.6px solid rgba(15,23,42,.16);transition:all .2s;}
.wg-btn-leer:hover{border-color:var(--accent);color:var(--accent);}
.wg-dunkelzone .wg-btn-leer,.wg-btn-leer.hell{color:#fff;border-color:rgba(255,255,255,.4);}
.wg-dunkelzone .wg-btn-leer:hover{border-color:#fff;color:#fff;background:rgba(255,255,255,.08);}

/* ── Kennzahlen-Reihe ── */
.wg-stat-num{font-size:clamp(30px,4vw,40px);font-weight:800;letter-spacing:-.02em;color:var(--p600);line-height:1;}
.wg-dunkelzone .wg-stat-num{color:#fff;}
.wg-stat-lab{font-size:13px;color:#94a3b8;margin-top:4px;}
.wg-dunkelzone .wg-stat-lab{color:rgba(255,255,255,.6);}

/* ── Bild-Box (füllt ihre Höhe, egal ob Bild oder Platzhalter) ── */
.wg-bildbox{overflow:hidden;border-radius:22px;position:relative;background:var(--p100);}
.wg-bildbox>img,.wg-bildbox>[data-img]{width:100%;height:100%;object-fit:cover;display:block;min-height:0;}
.wg-bildbox img{transition:transform .6s cubic-bezier(.2,.7,.3,1);}
.wg-bildbox:hover img{transform:scale(1.05);}

/* ── Bewegter Mesh-Hintergrund (Farbflecken) ── */
.wg-mesh{position:absolute;inset:0;overflow:hidden;pointer-events:none;}
.wg-blob{position:absolute;border-radius:50%;filter:blur(64px);}
.wg-blob-a{top:-160px;left:-100px;width:560px;height:560px;background:radial-gradient(circle,var(--accent),transparent 70%);opacity:.5;animation:wgDriftA 24s ease-in-out infinite;}
.wg-blob-b{bottom:-180px;right:-90px;width:520px;height:520px;background:radial-gradient(circle,var(--p500),transparent 70%);opacity:.45;animation:wgDriftB 29s ease-in-out infinite;}
.wg-blob-c{top:30%;right:20%;width:340px;height:340px;background:radial-gradient(circle,var(--p400),transparent 70%);opacity:.35;animation:wgDriftA 34s ease-in-out infinite reverse;}
@keyframes wgDriftA{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(70px,50px) scale(1.18)}}
@keyframes wgDriftB{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-60px,-40px) scale(1.14)}}

/* ── Reveal beim Scrollen (bidirektional, wie auf der Hauptseite) ── */
.wg-reveal{opacity:0;transform:translateY(28px);transition:opacity .7s cubic-bezier(.2,.7,.3,1),transform .7s cubic-bezier(.2,.7,.3,1);}
.wg-reveal.an{opacity:1;transform:none;}
.wg-reveal.li{transform:translateX(-34px);}
.wg-reveal.re{transform:translateX(34px);}
.wg-reveal.pop{transform:scale(.94);}

/* ── mobil ── */
@media(max-width:860px){
  .wg-split{grid-template-columns:1fr !important;}
  .wg-geist{font-size:clamp(44px,15vw,80px);}
  .wg-hide-mob{display:none !important;}
}

/* ── Barrierefreiheit: Bewegung reduzieren ── */
@media(prefers-reduced-motion:reduce){
  .wg-reveal{opacity:1 !important;transform:none !important;}
  .wg-vstrich::after,.wg-strichlinie{clip-path:inset(0 0 0 0) !important;animation:none !important;}
  .wg-blob{animation:none !important;}
}
`
}

// Reveal-Mechanik für die fertige Seite (nicht im Editor)
export const GENERATOR_REVEAL_JS = `<script>
(function(){
  var els=[].slice.call(document.querySelectorAll('.wg-reveal'));
  if(!els.length)return;
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('an')});return;}
  var io=new IntersectionObserver(function(ents){
    ents.forEach(function(en){
      if(en.isIntersecting){en.target.classList.add('an');}
      else{en.target.classList.remove('an');}
    });
  },{threshold:0.12,rootMargin:'0px 0px -60px 0px'});
  els.forEach(function(e){io.observe(e);});
})();
</script>`

// Im Editor alles sofort sichtbar zeigen (keine Scroll-Animation)
export const GENERATOR_EDITOR_CSS = `
.wg-reveal{opacity:1 !important;transform:none !important;}
.wg-vstrich::after,.wg-strichlinie{clip-path:inset(0 0 0 0) !important;}
`
