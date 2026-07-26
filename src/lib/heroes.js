// ═══════════════════════════════════════════════════════════════════════════
// HERO-BIBLIOTHEK
//
// Grundmuster mit Schaltern statt hunderter Einzeldateien:
//   c.hell    → helle Darstellung (sonst dunkel)
//   c.muster  → 'punkte' | 'raster' | 'linien' | 'keins'
//   c.bgImg   → Hintergrundbild (überschreibt die Fläche)
// Dadurch ergibt jedes Muster mehrere Erscheinungsbilder.
//
// Bildflächen ohne Bild zeigen IMMER eine anklickbare "Bild einfügen"-Fläche.
// Farben laufen über --p*/--accent, Optik über .wg-* (generatorDesign.js).
// ═══════════════════════════════════════════════════════════════════════════

const esc = (s) => String(s ?? '')
const ed = (key, val, tag = 'span') => `<${tag} data-edit="${key}" style="outline:none;">${esc(val)}</${tag}>`
const txt = (key, val, fb, tag = 'span') => ed(key, (val && String(val).trim()) ? val : fb, tag)

// Bildfläche: mit Bild → Bild. Ohne Bild → deutliche "Bild einfügen"-Fläche.
export function bildFlaeche(key, src, stil = '', label = 'Bild einfügen') {
  if (src) return `<img data-img="${key}" src="${esc(src)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;${stil}">`
  return `<div data-img="${key}" class="wg-bildleer" style="${stil}">
    <span><i class="fa-solid fa-image"></i>${esc(label)}</span>
  </div>`
}

// Wichtig: höhere Gewichtung als die allgemeine .wg-bildbox-Regel, sonst
// überschreibt deren "display:block" die Zentrierung des Platzhalters.
export const BILDLEER_CSS = `
.wg-bildbox>.wg-bildleer,.wg-bildleer{width:100%;height:100%;min-height:150px;
  display:flex !important;align-items:center !important;justify-content:center !important;
  background:repeating-linear-gradient(45deg,rgba(148,163,184,.16) 0 10px,rgba(148,163,184,.06) 10px 20px);
  border:2px dashed rgba(148,163,184,.55);border-radius:inherit;cursor:pointer;transition:all .2s;
  object-fit:unset !important;box-sizing:border-box}
.wg-bildleer:hover{border-color:var(--accent);background:rgba(148,163,184,.24)}
.wg-bildleer>span{display:inline-flex;align-items:center;gap:10px;font-size:13px;font-weight:800;color:#5b6b7c;
  letter-spacing:.08em;text-transform:uppercase;pointer-events:none;text-align:center;padding:10px}
.wg-bildleer>span i{font-size:18px;color:var(--accent)}
.wg-dunkelzone .wg-bildleer{border-color:rgba(255,255,255,.34);
  background:repeating-linear-gradient(45deg,rgba(255,255,255,.09) 0 10px,rgba(255,255,255,.025) 10px 20px)}
.wg-dunkelzone .wg-bildleer>span{color:rgba(255,255,255,.8)}
/* Bildbox darf im Dunkeln nicht hell aufleuchten, wenn nur der Platzhalter drin ist */
.wg-dunkelzone .wg-bildbox:has(.wg-bildleer){background:transparent}
`

// Hintergrund-Muster als CSS-Ebene
function musterCSS(art, hell) {
  const c = hell ? 'rgba(15,23,42,.07)' : 'rgba(255,255,255,.06)'
  if (art === 'punkte') return `background-image:radial-gradient(circle,${c} 1.4px,transparent 1.4px);background-size:20px 20px;`
  if (art === 'raster') return `background-image:linear-gradient(${c} 1px,transparent 1px),linear-gradient(90deg,${c} 1px,transparent 1px);background-size:26px 26px;`
  if (art === 'linien') return `background-image:repeating-linear-gradient(45deg,transparent 0 12px,${c} 12px 13px);`
  return ''
}

// Grundfläche eines Heros (dunkel/hell/Bild) + optionales Muster
function flaeche(c) {
  const hell = !!c.hell
  if (c.bgImg) {
    const ov = c.bgOverlay || (hell ? 'rgba(255,255,255,.72)' : 'rgba(10,20,32,.66)')
    return `background-image:linear-gradient(${ov},${ov}),url('${esc(c.bgImg)}');background-size:cover;background-position:center;`
  }
  return hell
    ? `background:#fff;`
    : `background:linear-gradient(160deg,var(--p900),#0b1622 72%);`
}

const zone = (c) => (c.hell ? '' : 'wg-dunkelzone')
const tf = (c) => (c.hell ? '#0f172a' : '#fff')
const tm = (c) => (c.hell ? '#64748b' : 'rgba(255,255,255,.76)')

// Musterebene als eigenes Element (liegt über der Fläche, unter dem Inhalt)
const musterEbene = (c) => {
  const m = c.muster && c.muster !== 'keins' ? musterCSS(c.muster, c.hell) : ''
  return m ? `<div aria-hidden="true" style="position:absolute;inset:0;${m}pointer-events:none;"></div>` : ''
}

const knoepfe = (c, mitte = false) => `
  <div style="display:flex;gap:13px;flex-wrap:wrap;${mitte ? 'justify-content:center;' : ''}">
    <a href="kontakt.html" class="wg-btn">${txt('cta1', c.cta1, 'Jetzt anfragen')}</a>
    ${c.cta2 !== '' ? `<a href="#leistungen" class="wg-btn-leer${c.hell ? '' : ' hell'}">${txt('cta2', c.cta2, 'Leistungen ansehen')}</a>` : ''}
  </div>`

const statReihe = (c, mitte = false) => {
  const st = c.stats && c.stats.length ? c.stats : null
  if (!st) return ''
  return `<div style="display:flex;gap:clamp(26px,4vw,52px);flex-wrap:wrap;margin-top:clamp(30px,4vw,50px);${mitte ? 'justify-content:center;' : ''}">
    ${st.map((s, i) => `<div>
      <div style="font-size:clamp(26px,3.2vw,38px);font-weight:800;letter-spacing:-.02em;color:${tf(c)};line-height:1;">${ed(`stats.${i}.num`, s.num)}${esc(s.suffix || '')}</div>
      <div style="font-size:13px;color:${tm(c)};margin-top:5px;">${ed(`stats.${i}.label`, s.label)}</div>
    </div>`).join('')}
  </div>`
}

const chip = (c) => `<span class="wg-chip${c.hell ? '' : ' glas'}">${txt('tag', c.tag, 'Willkommen')}</span>`

// ═══════════════════════════════════════════════════════════════════════════
// DIE MUSTER
// ═══════════════════════════════════════════════════════════════════════════
const M = []

// 1 — Ein riesiges Wort
M.push({ id: 'h-wort', name: 'Riesiges Wort', render: (c) => `
<section data-block="hero-full" data-variant="h-wort" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:82vh;display:flex;align-items:center;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-reveal">
      ${chip(c)}
      <h1 style="font-size:clamp(52px,13vw,180px);font-weight:800;line-height:.92;letter-spacing:-.045em;color:${tf(c)};margin:22px 0 18px;text-transform:uppercase;">${txt('headline', c.headline, 'Express')}</h1>
      <p class="wg-lead" style="color:${tm(c)};max-width:520px;margin-bottom:30px;">${txt('subline', c.subline, 'Kurz gesagt, worum es geht.', 'span')}</p>
      ${knoepfe(c)}
    </div>
  </div>
</section>` })

// 2 — Wort links, Text rechts
M.push({ id: 'h-wort-split', name: 'Wort + Text daneben', render: (c) => `
<section data-block="hero-full" data-variant="h-wort-split" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:80vh;display:flex;align-items:center;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1.15fr .85fr;gap:clamp(24px,4vw,56px);align-items:end;">
      <h1 class="wg-reveal li" style="font-size:clamp(46px,9vw,124px);font-weight:800;line-height:.94;letter-spacing:-.04em;color:${tf(c)};margin:0;">${txt('headline', c.headline, 'Turn Vision Real')}</h1>
      <div class="wg-reveal re" style="transition-delay:.1s;">
        ${chip(c)}
        <p class="wg-lead" style="color:${tm(c)};margin:18px 0 26px;">${txt('subline', c.subline, 'Eine kurze Erklärung, die neugierig macht.', 'span')}</p>
        ${knoepfe(c)}
      </div>
    </div>
    ${statReihe(c)}
  </div>
</section>` })

// 3 — Split mit Bild
M.push({ id: 'h-bild-rechts', name: 'Text links, Bild rechts', render: (c) => `
<section data-block="hero-full" data-variant="h-bild-rechts" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(60px,8vw,110px) 0;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4vw,60px);align-items:center;">
      <div class="wg-reveal li">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${txt('headline', c.headline, 'Ihre Website, die verkauft')}</h1>
        <span class="wg-strichlinie"></span>
        <p class="wg-lead" style="color:${tm(c)};max-width:480px;margin-bottom:30px;">${txt('subline', c.subline, 'Kurz und klar auf den Punkt gebracht.', 'span')}</p>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re wg-bildbox" style="height:clamp(320px,44vw,520px);transition-delay:.1s;">${bildFlaeche('heroImg', c.heroImg)}</div>
    </div>
    ${statReihe(c)}
  </div>
</section>` })

// 4 — Split mit Bild links
M.push({ id: 'h-bild-links', name: 'Bild links, Text rechts', render: (c) => `
<section data-block="hero-full" data-variant="h-bild-links" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(60px,8vw,110px) 0;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4vw,60px);align-items:center;">
      <div class="wg-reveal li wg-bildbox" style="height:clamp(320px,44vw,520px);">${bildFlaeche('heroImg', c.heroImg)}</div>
      <div class="wg-reveal re" style="transition-delay:.1s;">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${txt('headline', c.headline, 'Handwerk mit Anspruch')}</h1>
        <span class="wg-strichlinie"></span>
        <p class="wg-lead" style="color:${tm(c)};max-width:480px;margin-bottom:30px;">${txt('subline', c.subline, 'Kurz und klar auf den Punkt gebracht.', 'span')}</p>
        ${knoepfe(c)}
      </div>
    </div>
  </div>
</section>` })

// 5 — Zentriert groß
M.push({ id: 'h-mitte', name: 'Zentriert', render: (c) => `
<section data-block="hero-full" data-variant="h-mitte" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:88vh;display:flex;align-items:center;justify-content:center;text-align:center;${flaeche(c)}">
  ${musterEbene(c)}
  ${c.hell ? '' : `<div class="wg-mesh"><span class="wg-blob wg-blob-a"></span><span class="wg-blob wg-blob-b"></span></div>`}
  <div class="wg-wrap" style="position:relative;z-index:1;max-width:900px;">
    <div class="wg-reveal">
      ${chip(c)}
      <h1 class="wg-t1" style="color:${tf(c)};margin:22px auto 0;">${txt('headline', c.headline, 'Wir machen das für Sie')}</h1>
      <span class="wg-strichlinie mitte"></span>
      <p class="wg-lead" style="color:${tm(c)};max-width:560px;margin:0 auto 34px;">${txt('subline', c.subline, 'Ein Satz, der Lust auf mehr macht.', 'span')}</p>
      ${knoepfe(c, true)}
      ${statReihe(c, true)}
    </div>
  </div>
</section>` })

// 6 — Zentriert mit Bild darunter
M.push({ id: 'h-mitte-bild', name: 'Zentriert + Bild darunter', render: (c) => `
<section data-block="hero-full" data-variant="h-mitte-bild" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(66px,9vw,120px) 0 0;text-align:center;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-reveal" style="max-width:820px;margin:0 auto;">
      ${chip(c)}
      <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${txt('headline', c.headline, 'Alles aus einer Hand')}</h1>
      <span class="wg-strichlinie mitte"></span>
      <p class="wg-lead" style="color:${tm(c)};max-width:540px;margin:0 auto 32px;">${txt('subline', c.subline, 'Ein Satz, der neugierig macht.', 'span')}</p>
      ${knoepfe(c, true)}
    </div>
    <div class="wg-reveal wg-bildbox" style="height:clamp(240px,34vw,440px);margin-top:clamp(34px,5vw,60px);box-shadow:0 -20px 60px rgba(15,23,42,.2);transition-delay:.14s;">${bildFlaeche('heroImg', c.heroImg)}</div>
  </div>
</section>` })

// 7 — Bildcollage
M.push({ id: 'h-collage', name: 'Bildcollage', render: (c) => `
<section data-block="hero-full" data-variant="h-collage" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(58px,8vw,100px) 0;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:.95fr 1.05fr;gap:clamp(26px,4vw,54px);align-items:center;">
      <div class="wg-reveal li">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${txt('headline', c.headline, 'Sehen, was möglich ist')}</h1>
        <span class="wg-strichlinie"></span>
        <p class="wg-lead" style="color:${tm(c)};max-width:440px;margin-bottom:28px;">${txt('subline', c.subline, 'Ein kurzer Einstieg in Ihr Angebot.', 'span')}</p>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re" style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:150px 150px;gap:14px;transition-delay:.12s;">
        <div class="wg-bildbox" style="grid-row:span 2;">${bildFlaeche('heroImg', c.heroImg)}</div>
        <div class="wg-bildbox">${bildFlaeche('heroImg2', c.heroImg2)}</div>
        <div class="wg-bildbox">${bildFlaeche('heroImg3', c.heroImg3)}</div>
      </div>
    </div>
  </div>
</section>` })

// 8 — Hero mit Anfrage-Formular
M.push({ id: 'h-formular', name: 'Mit Anfrage-Formular', render: (c) => `
<section data-block="hero-full" data-variant="h-formular" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(58px,8vw,104px) 0;${flaeche(c)}">
  ${musterEbene(c)}
  ${c.hell ? '' : `<div class="wg-mesh"><span class="wg-blob wg-blob-a"></span></div>`}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(26px,4vw,56px);align-items:center;">
      <div class="wg-reveal li">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${txt('headline', c.headline, 'In 24 Stunden zur Antwort')}</h1>
        <span class="wg-strichlinie"></span>
        <p class="wg-lead" style="color:${tm(c)};max-width:460px;">${txt('subline', c.subline, 'Kurz beschreiben, worum es geht – wir melden uns zurück.', 'span')}</p>
        ${statReihe(c)}
      </div>
      <form class="wg-reveal re wg-karte" data-contact-form style="display:grid;gap:12px;padding:clamp(22px,3vw,32px);transition-delay:.12s;">
        <div style="font-size:17px;font-weight:800;color:#0f172a;margin-bottom:2px;">${txt('formTitel', c.formTitel, 'Kostenlos anfragen')}</div>
        <input name="name" required placeholder="Ihr Name *" style="border:2px solid rgba(15,23,42,.1);border-radius:11px;padding:13px 15px;font-size:15px;font-family:inherit;outline:none;">
        <input name="email" type="email" required placeholder="E-Mail *" style="border:2px solid rgba(15,23,42,.1);border-radius:11px;padding:13px 15px;font-size:15px;font-family:inherit;outline:none;">
        <input name="telefon" placeholder="Telefon" style="border:2px solid rgba(15,23,42,.1);border-radius:11px;padding:13px 15px;font-size:15px;font-family:inherit;outline:none;">
        <textarea name="nachricht" rows="3" placeholder="Worum geht es?" style="border:2px solid rgba(15,23,42,.1);border-radius:11px;padding:13px 15px;font-size:15px;font-family:inherit;outline:none;resize:vertical;"></textarea>
        <button type="submit" class="wg-btn" style="justify-content:center;">${txt('cta1', c.cta1, 'Anfrage senden')}</button>
      </form>
    </div>
  </div>
</section>` })

// 9 — Hero mit Karten-Panel
M.push({ id: 'h-panel', name: 'Mit Werte-Karten', render: (c) => {
  const st = c.stats && c.stats.length ? c.stats : [{ num: '100%', label: 'Zuverlässig' }, { num: '24/7', label: 'Erreichbar' }, { num: '15+', label: 'Jahre' }]
  return `
<section data-block="hero-full" data-variant="h-panel" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:84vh;display:flex;align-items:center;${flaeche(c)}">
  ${musterEbene(c)}
  ${c.hell ? '' : `<div class="wg-mesh"><span class="wg-blob wg-blob-a"></span><span class="wg-blob wg-blob-b"></span></div>`}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(26px,4vw,54px);align-items:center;">
      <div class="wg-reveal li">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${txt('headline', c.headline, 'Verlässlich. Sauber. Fair.')}</h1>
        <span class="wg-strichlinie"></span>
        <p class="wg-lead" style="color:${tm(c)};max-width:470px;margin-bottom:30px;">${txt('subline', c.subline, 'Kurz erklärt, warum Kunden bleiben.', 'span')}</p>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re" style="display:grid;gap:14px;transition-delay:.12s;">
        ${st.slice(0, 3).map((s, i) => `<div class="wg-karte" style="display:flex;align-items:center;gap:17px;padding:20px 22px;">
          <div class="wg-iconchip" style="width:46px;height:46px;font-size:17px;flex-shrink:0;"><i class="fa-solid fa-check"></i></div>
          <div><div style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-.02em;">${ed(`stats.${i}.num`, s.num)}${esc(s.suffix || '')}</div>
          <div style="font-size:13.5px;color:#64748b;">${ed(`stats.${i}.label`, s.label)}</div></div>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>` } })

// 10 — Vollbild-Foto, Text unten
M.push({ id: 'h-foto-unten', name: 'Vollbild-Foto, Text unten', render: (c) => `
<section data-block="hero-full" data-variant="h-foto-unten" class="wg-dunkelzone" style="position:relative;overflow:hidden;min-height:94vh;display:flex;align-items:flex-end;background:linear-gradient(160deg,var(--p900),#0b1622);">
  ${c.bgImg ? `<img src="${esc(c.bgImg)}" data-img="bgImg" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">`
    : `<div data-img="bgImg" class="wg-bildleer" style="position:absolute;inset:0;border-radius:0;">
         <span><i class="fa-solid fa-image"></i>Hintergrundbild einfügen</span></div>`}
  <div aria-hidden="true" style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,20,32,.2),rgba(10,20,32,.88));"></div>
  <div class="wg-wrap" style="position:relative;z-index:1;padding-bottom:clamp(44px,6vw,80px);padding-top:120px;">
    <div class="wg-reveal" style="max-width:900px;">
      <span class="wg-chip glas">${txt('tag', c.tag, 'Willkommen')}</span>
      <h1 class="wg-t1" style="color:#fff;margin:22px 0 0;">${txt('headline', c.headline, 'Große Bilder, klare Worte')}</h1>
      <span class="wg-strichlinie"></span>
      <p class="wg-lead" style="color:rgba(255,255,255,.8);max-width:560px;margin-bottom:30px;">${txt('subline', c.subline, 'Ein Satz, der wirkt.', 'span')}</p>
      ${knoepfe({ ...c, hell: false })}
      ${statReihe({ ...c, hell: false })}
    </div>
  </div>
</section>` })

// 11 — Magazin: Text über Bildkante
M.push({ id: 'h-magazin', name: 'Magazin (Bild bündig)', render: (c) => `
<section data-block="hero-full" data-variant="h-magazin" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(56px,8vw,100px) 0;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1.05fr .95fr;gap:0;align-items:center;">
      <div class="wg-reveal" style="position:relative;z-index:2;">
        ${chip(c)}
        <h1 style="font-size:clamp(44px,7.6vw,96px);font-weight:300;line-height:1.02;letter-spacing:-.035em;color:${tf(c)};margin:20px 0 18px;">${txt('headline', c.headline, 'Design, das bleibt')}</h1>
        <p class="wg-lead" style="color:${tm(c)};max-width:430px;margin-bottom:28px;">${txt('subline', c.subline, 'Kurz gesagt, worum es geht.', 'span')}</p>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re wg-bildbox wg-hide-mob" style="height:clamp(340px,44vw,540px);margin-left:-46px;transition-delay:.12s;">${bildFlaeche('heroImg', c.heroImg)}</div>
    </div>
  </div>
</section>` })

// 12 — Mit Bewertungs-Plakette
M.push({ id: 'h-bewertung', name: 'Mit Bewertung', render: (c) => `
<section data-block="hero-full" data-variant="h-bewertung" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(60px,8vw,110px) 0;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4vw,58px);align-items:center;">
      <div class="wg-reveal li">
        <div style="display:inline-flex;align-items:center;gap:11px;background:${c.hell ? 'var(--p50)' : 'rgba(255,255,255,.1)'};border:1px solid ${c.hell ? 'rgba(15,23,42,.08)' : 'rgba(255,255,255,.2)'};border-radius:99px;padding:8px 16px;margin-bottom:20px;">
          <span style="color:var(--accent);font-size:13px;">${'<i class="fa-solid fa-star"></i>'.repeat(5)}</span>
          <span style="font-size:13px;font-weight:700;color:${tf(c)};">${txt('badge', c.badge, '4,9 von 5 · über 200 Bewertungen')}</span>
        </div>
        <h1 class="wg-t1" style="color:${tf(c)};margin:0;">${txt('headline', c.headline, 'Kunden empfehlen uns weiter')}</h1>
        <span class="wg-strichlinie"></span>
        <p class="wg-lead" style="color:${tm(c)};max-width:460px;margin-bottom:30px;">${txt('subline', c.subline, 'Weil Qualität und Termintreue stimmen.', 'span')}</p>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re wg-bildbox" style="height:clamp(320px,42vw,500px);transition-delay:.12s;">${bildFlaeche('heroImg', c.heroImg)}</div>
    </div>
  </div>
</section>` })

// 13 — Mit Häkchenliste
M.push({ id: 'h-liste', name: 'Mit Häkchenliste', render: (c) => {
  const pk = c.punkte && c.punkte.length ? c.punkte : ['Festpreis ohne Überraschungen', 'Termine, die gehalten werden', 'Saubere Übergabe zum Schluss']
  return `
<section data-block="hero-full" data-variant="h-liste" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(60px,8vw,110px) 0;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4vw,58px);align-items:center;">
      <div class="wg-reveal li">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${txt('headline', c.headline, 'Damit Sie sich zurücklehnen können')}</h1>
        <span class="wg-strichlinie"></span>
        <ul style="list-style:none;padding:0;margin:0 0 30px;display:grid;gap:12px;">
          ${pk.map((p, i) => `<li style="display:flex;align-items:flex-start;gap:12px;font-size:16px;color:${c.hell ? '#334155' : 'rgba(255,255,255,.84)'};">
            <span style="width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;margin-top:2px;"><i class="fa-solid fa-check"></i></span>${ed(`punkte.${i}`, p)}</li>`).join('')}
        </ul>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re wg-bildbox" style="height:clamp(320px,42vw,500px);transition-delay:.12s;">${bildFlaeche('heroImg', c.heroImg)}</div>
    </div>
  </div>
</section>` } })

// 14 — Hero mit Laufband
M.push({ id: 'h-laufband', name: 'Mit Laufband unten', render: (c) => {
  // Leere/lückenhafte Einträge herausfiltern, damit nie ein Punkt ohne Text bleibt
  const roh = (c.punkte || []).filter(x => x !== undefined && String(x).trim() !== '')
  const pk = roh.length ? roh : ['Meisterbetrieb', 'Festpreis-Garantie', 'Termintreue', 'Über 500 Kunden']
  // Erste Reihe ist bearbeitbar, die zweite ist nur die nahtlose Wiederholung.
  const zeile = (p, i, bearbeitbar) => `<span style="display:inline-flex;align-items:center;gap:11px;padding:0 26px;font-size:13.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${tf(c)};white-space:nowrap;"><span style="width:6px;height:6px;border-radius:50%;background:var(--accent);"></span>${bearbeitbar ? ed(`punkte.${i}`, p) : esc(p)}</span>`
  const reihe = pk.map((p, i) => zeile(p, i, true)).join('')
  const reiheKopie = pk.map((p, i) => zeile(p, i, false)).join('')
  return `
<section data-block="hero-full" data-variant="h-laufband" class="${zone(c)}" style="position:relative;overflow:hidden;${flaeche(c)}">
  ${musterEbene(c)}
  ${c.hell ? '' : `<div class="wg-mesh"><span class="wg-blob wg-blob-a"></span><span class="wg-blob wg-blob-b"></span></div>`}
  <div class="wg-wrap" style="position:relative;z-index:1;padding:clamp(60px,9vw,120px) 0 clamp(40px,5vw,64px);text-align:center;">
    <div class="wg-reveal" style="max-width:880px;margin:0 auto;">
      ${chip(c)}
      <h1 class="wg-t1" style="color:${tf(c)};margin:22px auto 0;">${txt('headline', c.headline, 'Ihr Partner in der Region')}</h1>
      <span class="wg-strichlinie mitte"></span>
      <p class="wg-lead" style="color:${tm(c)};max-width:540px;margin:0 auto 32px;">${txt('subline', c.subline, 'Ein Satz, der Vertrauen schafft.', 'span')}</p>
      ${knoepfe(c, true)}
    </div>
  </div>
  <div style="position:relative;z-index:1;border-top:1px solid ${c.hell ? 'rgba(15,23,42,.09)' : 'rgba(255,255,255,.14)'};padding:16px 0;overflow:hidden;">
    <div class="wg-laufband" style="display:flex;width:max-content;animation:wgLaufH 28s linear infinite;"><div style="display:flex;">${reihe}</div><div style="display:flex;" aria-hidden="true">${reiheKopie}</div></div>
  </div>
  <style>@keyframes wgLaufH{from{transform:translateX(0)}to{transform:translateX(-50%)}}</style>
</section>` } })

// 15 — Schräg geteilt
M.push({ id: 'h-schraeg', name: 'Schräg geteilt', render: (c) => `
<section data-block="hero-full" data-variant="h-schraeg" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:84vh;display:flex;align-items:center;${flaeche(c)}">
  ${musterEbene(c)}
  <div aria-hidden="true" class="wg-hide-mob" style="position:absolute;top:0;right:0;bottom:0;width:52%;clip-path:polygon(18% 0,100% 0,100% 100%,0 100%);overflow:hidden;">
    ${bildFlaeche('heroImg', c.heroImg, 'border-radius:0;')}
  </div>
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-reveal" style="max-width:560px;">
      ${chip(c)}
      <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${txt('headline', c.headline, 'Klar im Auftritt')}</h1>
      <span class="wg-strichlinie"></span>
      <p class="wg-lead" style="color:${tm(c)};margin-bottom:30px;">${txt('subline', c.subline, 'Kurz gesagt, worum es geht.', 'span')}</p>
      ${knoepfe(c)}
    </div>
  </div>
</section>` })

// 16 — Rahmen / Passepartout
M.push({ id: 'h-rahmen', name: 'Rahmen', render: (c) => `
<section data-block="hero-full" data-variant="h-rahmen" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(20px,3vw,34px);${flaeche(c)}">
  <div style="position:relative;border:1px solid ${c.hell ? 'rgba(15,23,42,.14)' : 'rgba(255,255,255,.2)'};border-radius:26px;min-height:78vh;display:flex;align-items:center;overflow:hidden;">
    ${musterEbene(c)}
    <div style="width:100%;padding:clamp(30px,5vw,64px);position:relative;z-index:1;">
      <div class="wg-reveal" style="max-width:760px;">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:22px 0 0;">${txt('headline', c.headline, 'Sorgfalt im Detail')}</h1>
        <span class="wg-strichlinie"></span>
        <p class="wg-lead" style="color:${tm(c)};max-width:520px;margin-bottom:30px;">${txt('subline', c.subline, 'Kurz gesagt, worum es geht.', 'span')}</p>
        ${knoepfe(c)}
        ${statReihe(c)}
      </div>
    </div>
  </div>
</section>` })

// 17 — Drei Karten unter dem Hero
M.push({ id: 'h-karten-drei', name: 'Mit drei Karten', render: (c) => {
  const items = c.karten && c.karten.length ? c.karten : [
    { icon: 'phone', title: 'Anrufen', text: 'Kurz schildern, worum es geht.' },
    { icon: 'calendar-check', title: 'Termin', text: 'Wir schauen es uns an.' },
    { icon: 'thumbs-up', title: 'Erledigt', text: 'Sauber und zum Festpreis.' },
  ]
  return `
<section data-block="hero-full" data-variant="h-karten-drei" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(58px,8vw,104px) 0 0;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-reveal" style="max-width:760px;">
      ${chip(c)}
      <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${txt('headline', c.headline, 'So einfach geht es')}</h1>
      <span class="wg-strichlinie"></span>
      <p class="wg-lead" style="color:${tm(c)};max-width:520px;margin-bottom:30px;">${txt('subline', c.subline, 'In drei Schritten zum Ergebnis.', 'span')}</p>
      ${knoepfe(c)}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;margin-top:clamp(34px,5vw,58px);transform:translateY(clamp(20px,3vw,34px));">
      ${items.map((it, i) => `<div class="wg-reveal wg-karte" style="transition-delay:${i * 80}ms;">
        <div class="wg-iconchip" style="width:44px;height:44px;font-size:16px;margin-bottom:14px;"><i class="fa-solid fa-${esc(it.icon || 'check')}"></i></div>
        <h3 style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:6px;">${ed(`karten.${i}.title`, it.title)}</h3>
        <p style="font-size:14px;color:#64748b;line-height:1.6;">${ed(`karten.${i}.text`, it.text)}</p>
      </div>`).join('')}
    </div>
  </div>
  <div style="height:clamp(30px,4vw,48px);"></div>
</section>` } })

// 18 — Zwei Bilder versetzt
M.push({ id: 'h-zwei-bilder', name: 'Zwei Bilder versetzt', render: (c) => `
<section data-block="hero-full" data-variant="h-zwei-bilder" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(58px,8vw,104px) 0;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4vw,56px);align-items:center;">
      <div class="wg-reveal li">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${txt('headline', c.headline, 'Zwei Blickwinkel, ein Ergebnis')}</h1>
        <span class="wg-strichlinie"></span>
        <p class="wg-lead" style="color:${tm(c)};max-width:440px;margin-bottom:30px;">${txt('subline', c.subline, 'Kurz gesagt, worum es geht.', 'span')}</p>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re" style="position:relative;height:clamp(340px,44vw,520px);transition-delay:.12s;">
        <div class="wg-bildbox" style="position:absolute;top:0;left:0;width:66%;height:72%;">${bildFlaeche('heroImg', c.heroImg)}</div>
        <div class="wg-bildbox" style="position:absolute;bottom:0;right:0;width:58%;height:60%;border:6px solid ${c.hell ? '#fff' : 'var(--p900)'};box-shadow:0 20px 44px rgba(15,23,42,.24);">${bildFlaeche('heroImg2', c.heroImg2)}</div>
      </div>
    </div>
  </div>
</section>` })

// 19 — Minimal, nur Typo mittig
M.push({ id: 'h-minimal', name: 'Minimal', render: (c) => `
<section data-block="hero-full" data-variant="h-minimal" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;max-width:760px;">
    <div class="wg-reveal">
      <h1 style="font-size:clamp(38px,6.4vw,84px);font-weight:200;line-height:1.06;letter-spacing:-.035em;color:${tf(c)};margin-bottom:24px;">${txt('headline', c.headline, 'Weniger ist mehr.')}</h1>
      <span class="wg-strichlinie mitte"></span>
      <p class="wg-lead" style="color:${tm(c)};max-width:460px;margin:0 auto 32px;">${txt('subline', c.subline, 'Ein Gedanke, klar formuliert.', 'span')}</p>
      <a href="kontakt.html" class="wg-btn">${txt('cta1', c.cta1, 'Kontakt aufnehmen')}</a>
    </div>
  </div>
</section>` })

// 20 — Hero mit Logo-Leiste
M.push({ id: 'h-logos', name: 'Mit Partner-Leiste', render: (c) => {
  const logos = c.logos && c.logos.length ? c.logos : ['Partner', 'Innung', 'Zertifikat', 'Verband', 'Mitglied']
  return `
<section data-block="hero-full" data-variant="h-logos" class="${zone(c)}" style="position:relative;overflow:hidden;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;padding:clamp(58px,8vw,104px) 0 clamp(30px,4vw,48px);">
    <div class="wg-split" style="display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(26px,4vw,54px);align-items:center;">
      <div class="wg-reveal li">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${txt('headline', c.headline, 'Vertrauen, das gewachsen ist')}</h1>
        <span class="wg-strichlinie"></span>
        <p class="wg-lead" style="color:${tm(c)};max-width:450px;margin-bottom:28px;">${txt('subline', c.subline, 'Kurz gesagt, worum es geht.', 'span')}</p>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re wg-bildbox" style="height:clamp(280px,36vw,420px);transition-delay:.12s;">${bildFlaeche('heroImg', c.heroImg)}</div>
    </div>
  </div>
  <div style="position:relative;z-index:1;border-top:1px solid ${c.hell ? 'rgba(15,23,42,.09)' : 'rgba(255,255,255,.13)'};">
    <div class="wg-wrap" style="display:flex;flex-wrap:wrap;gap:clamp(20px,4vw,54px);align-items:center;justify-content:space-between;padding:22px 24px;">
      ${logos.map((l, i) => `<span style="font-size:14px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:${c.hell ? '#94a3b8' : 'rgba(255,255,255,.5)'};">${ed(`logos.${i}`, l)}</span>`).join('')}
    </div>
  </div>
</section>` } })

// 21 — Geisterwort im Hintergrund
M.push({ id: 'h-geist', name: 'Mit Geisterwort', render: (c) => `
<section data-block="hero-full" data-variant="h-geist" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:84vh;display:flex;align-items:center;${flaeche(c)}">
  ${musterEbene(c)}
  <div aria-hidden="true" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:clamp(120px,26vw,420px);font-weight:800;letter-spacing:-.05em;color:${c.hell ? 'rgba(15,23,42,.045)' : 'rgba(255,255,255,.05)'};white-space:nowrap;pointer-events:none;">${esc(c.geistwort || c.tag || 'QUALITÄT')}</div>
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-reveal" style="max-width:720px;">
      ${chip(c)}
      <h1 class="wg-t1" style="color:${tf(c)};margin:22px 0 0;">${txt('headline', c.headline, 'Der Anspruch steht im Hintergrund')}</h1>
      <span class="wg-strichlinie"></span>
      <p class="wg-lead" style="color:${tm(c)};max-width:500px;margin-bottom:30px;">${txt('subline', c.subline, 'Kurz gesagt, worum es geht.', 'span')}</p>
      ${knoepfe(c)}
    </div>
  </div>
</section>` })

// 22 — Split mit farbiger Hälfte
M.push({ id: 'h-farbhaelfte', name: 'Farbige Hälfte', render: (c) => `
<section data-block="hero-full" data-variant="h-farbhaelfte" style="position:relative;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;min-height:84vh;" class="wg-split">
  <div class="wg-dunkelzone" style="display:flex;align-items:center;padding:clamp(34px,5vw,72px);background:linear-gradient(160deg,var(--p900),#0b1622 75%);position:relative;overflow:hidden;">
    <div class="wg-mesh"><span class="wg-blob wg-blob-a"></span></div>
    <div class="wg-reveal" style="position:relative;z-index:1;">
      <span class="wg-chip glas">${txt('tag', c.tag, 'Willkommen')}</span>
      <h1 style="font-size:clamp(38px,4.6vw,68px);font-weight:300;line-height:1.05;letter-spacing:-.03em;color:#fff;margin:22px 0 0;">${txt('headline', c.headline, 'Zwei Seiten, eine Haltung')}</h1>
      <span class="wg-strichlinie"></span>
      <p class="wg-lead" style="color:rgba(255,255,255,.78);margin-bottom:30px;">${txt('subline', c.subline, 'Kurz gesagt, worum es geht.', 'span')}</p>
      ${knoepfe({ ...c, hell: false })}
    </div>
  </div>
  <div class="wg-bildbox" style="border-radius:0;min-height:300px;">${bildFlaeche('heroImg', c.heroImg, 'border-radius:0;')}</div>
</section>` })

// 23 — Bild oben, Text unten (umgekehrt)
M.push({ id: 'h-bild-oben', name: 'Bild oben, Text unten', render: (c) => `
<section data-block="hero-full" data-variant="h-bild-oben" class="${zone(c)}" style="position:relative;overflow:hidden;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-bildbox" style="border-radius:0;height:clamp(240px,32vw,420px);">${bildFlaeche('heroImg', c.heroImg, 'border-radius:0;')}</div>
  <div class="wg-wrap" style="position:relative;z-index:1;padding:clamp(40px,6vw,74px) 24px;">
    <div class="wg-split" style="display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(22px,4vw,50px);align-items:end;">
      <div class="wg-reveal">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:18px 0 0;">${txt('headline', c.headline, 'Bilder zuerst')}</h1>
        <span class="wg-strichlinie"></span>
      </div>
      <div class="wg-reveal re" style="transition-delay:.1s;">
        <p class="wg-lead" style="color:${tm(c)};margin-bottom:24px;">${txt('subline', c.subline, 'Kurz gesagt, worum es geht.', 'span')}</p>
        ${knoepfe(c)}
      </div>
    </div>
  </div>
</section>` })

// 24 — Suchfeld/Eingabe im Hero
M.push({ id: 'h-eingabe', name: 'Mit Eingabefeld', render: (c) => `
<section data-block="hero-full" data-variant="h-eingabe" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;${flaeche(c)}">
  ${musterEbene(c)}
  ${c.hell ? '' : `<div class="wg-mesh"><span class="wg-blob wg-blob-a"></span><span class="wg-blob wg-blob-c"></span></div>`}
  <div class="wg-wrap" style="position:relative;z-index:1;max-width:820px;">
    <div class="wg-reveal">
      ${chip(c)}
      <h1 class="wg-t1" style="color:${tf(c)};margin:22px auto 0;">${txt('headline', c.headline, 'Wobei können wir helfen?')}</h1>
      <span class="wg-strichlinie mitte"></span>
      <p class="wg-lead" style="color:${tm(c)};max-width:500px;margin:0 auto 30px;">${txt('subline', c.subline, 'Kurz beschreiben – wir melden uns.', 'span')}</p>
      <form data-contact-form style="display:flex;gap:10px;max-width:560px;margin:0 auto;flex-wrap:wrap;">
        <input name="nachricht" placeholder="${esc(c.platzhalter || 'Ihr Anliegen in einem Satz')}" style="flex:1;min-width:220px;border:2px solid ${c.hell ? 'rgba(15,23,42,.12)' : 'rgba(255,255,255,.24)'};background:${c.hell ? '#fff' : 'rgba(255,255,255,.08)'};color:${tf(c)};border-radius:99px;padding:16px 22px;font-size:15px;font-family:inherit;outline:none;">
        <button type="submit" class="wg-btn">${txt('cta1', c.cta1, 'Absenden')}</button>
      </form>
    </div>
  </div>
</section>` })

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════
export const HERO_MUSTER = M

// Als Block-Definition (ergänzt die bestehenden hero-full-Varianten)
export const HERO_VARIANTEN = M.map(m => ({ id: m.id, name: m.name, render: m.render }))
