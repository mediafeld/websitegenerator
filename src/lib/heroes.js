// ═══════════════════════════════════════════════════════════════════════════
// HERO-BIBLIOTHEK — komplett neu gebaut
//
// Grundregeln, die alle bisherigen Probleme ausschließen:
//
//  1. JEDER sichtbare Text trägt seinen EXAKTEN Pfad (data-edit="stats.0.num").
//     Nichts wird geraten, nichts kann sich vertauschen.
//  2. JEDE Variante bringt ihre Standardwerte ÜBER `standard` mit. Der
//     Renderer bekommt immer einen vollständigen Inhalt – dadurch kann das
//     Ändern eines Eintrags nie andere löschen.
//  3. Kein Text ist nur "Dekoration": auch Kennzeichen, Aufzählungen und
//     Laufband-Einträge sind bearbeitbar.
//  4. Block-HTML (h1, p, ul …) wird in einem <div> gerahmt, sonst wirft der
//     Browser die Tags weg.
//
// Schalter pro Variante: c.hell, c.muster, c.bgImg
// ═══════════════════════════════════════════════════════════════════════════

const esc = (s) => String(s ?? '')

// Bearbeitbarer Text. Block-Elemente brauchen einen Block-Rahmen.
const BLOCK_TAGS = /<\s*(h[1-6]|p|div|ul|ol|li|table|blockquote|section|figure|pre|hr)\b/i
export function ed(pfad, wert, tag) {
  const s = String(wert ?? '')
  // Block-HTML (h1, p, ul, table …) muss in ein <div> – in einem <span> oder
  // in einer Überschrift wirft der Browser die Tags beim Einlesen heraus.
  const t = BLOCK_TAGS.test(s) ? 'div' : (tag || 'span')
  return `<${t} data-edit="${pfad}" style="outline:none;${t === 'div' ? 'display:block;' : ''}">${s}</${t}>`
}

// Bildfläche: mit Bild → Bild, ohne → anklickbare "Bild einfügen"-Fläche
export function bildFlaeche(pfad, src, stil = '', label = 'Bild einfügen') {
  if (src) return `<img data-img="${pfad}" src="${esc(src)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;${stil}">`
  return `<div data-img="${pfad}" class="wg-bildleer" style="${stil}"><span><i class="fa-solid fa-image"></i>${esc(label)}</span></div>`
}

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
.wg-dunkelzone .wg-bildbox:has(.wg-bildleer){background:transparent}
`

// ── Bausteine der Heros ────────────────────────────────────────────────────
function musterCSS(art, hell) {
  const c = hell ? 'rgba(15,23,42,.07)' : 'rgba(255,255,255,.06)'
  if (art === 'punkte') return `background-image:radial-gradient(circle,${c} 1.4px,transparent 1.4px);background-size:20px 20px;`
  if (art === 'raster') return `background-image:linear-gradient(${c} 1px,transparent 1px),linear-gradient(90deg,${c} 1px,transparent 1px);background-size:26px 26px;`
  if (art === 'linien') return `background-image:repeating-linear-gradient(45deg,transparent 0 12px,${c} 12px 13px);`
  return ''
}
function flaeche(c) {
  if (c.bgImg) {
    const ov = c.bgOverlay || (c.hell ? 'rgba(255,255,255,.72)' : 'rgba(10,20,32,.66)')
    return `background-image:linear-gradient(${ov},${ov}),url('${esc(c.bgImg)}');background-size:cover;background-position:center;`
  }
  return c.hell ? 'background:#fff;' : 'background:linear-gradient(160deg,var(--p900),#0b1622 72%);'
}
const zone = (c) => (c.hell ? '' : 'wg-dunkelzone')
const tf = (c) => (c.hell ? '#0f172a' : '#fff')
const tm = (c) => (c.hell ? '#64748b' : 'rgba(255,255,255,.76)')
const musterEbene = (c) => {
  const m = c.muster && c.muster !== 'keins' ? musterCSS(c.muster, c.hell) : ''
  return m ? `<div aria-hidden="true" style="position:absolute;inset:0;${m}pointer-events:none;"></div>` : ''
}
const chip = (c) => `<span class="wg-chip${c.hell ? '' : ' glas'}">${ed('tag', c.tag)}</span>`
const knoepfe = (c, mitte = false) => `
  <div style="display:flex;gap:13px;flex-wrap:wrap;${mitte ? 'justify-content:center;' : ''}">
    <a href="kontakt.html" class="wg-btn">${ed('cta1', c.cta1)}</a>
    ${c.cta2 ? `<a href="#leistungen" class="wg-btn-leer${c.hell ? '' : ' hell'}">${ed('cta2', c.cta2)}</a>` : ''}
  </div>`
const statReihe = (c, mitte = false) => {
  const st = Array.isArray(c.stats) ? c.stats.filter(Boolean) : []
  if (!st.length) return ''
  return `<div style="display:flex;gap:clamp(26px,4vw,52px);flex-wrap:wrap;margin-top:clamp(30px,4vw,50px);${mitte ? 'justify-content:center;' : ''}">
    ${st.map((s, i) => `<div>
      <div style="font-size:clamp(26px,3.2vw,38px);font-weight:800;letter-spacing:-.02em;color:${tf(c)};line-height:1;">${ed(`stats.${i}.num`, s.num)}</div>
      <div style="font-size:13px;color:${tm(c)};margin-top:5px;">${ed(`stats.${i}.label`, s.label)}</div>
    </div>`).join('')}
  </div>`
}

// Standardwerte – werden IMMER mitgerendert, damit nichts fehlt
const BASIS = {
  tag: 'Willkommen',
  headline: 'Ihre Überschrift',
  subline: 'Beschreiben Sie hier in einem Satz, worum es geht.',
  cta1: 'Jetzt anfragen',
  cta2: 'Leistungen ansehen',
}
const MIT_STATS = {
  ...BASIS,
  stats: [
    { num: '15+', label: 'Jahre Erfahrung' },
    { num: '500+', label: 'Zufriedene Kunden' },
    { num: '100%', label: 'Termintreue' },
  ],
}

// Führt Standardwerte und tatsächlichen Inhalt zusammen.
// Listen werden aufgefüllt, nie gekürzt – so kann eine Änderung
// an einem Eintrag niemals andere entfernen.
function voll(standard, c = {}) {
  const out = { ...standard, ...c }
  Object.entries(standard).forEach(([k, v]) => {
    if (!Array.isArray(v)) { if (out[k] === undefined || out[k] === null) out[k] = v; return }
    const ist = Array.isArray(c[k]) ? c[k] : []
    out[k] = v.map((standardEintrag, i) => {
      const vorhanden = ist[i]
      if (vorhanden === undefined || vorhanden === null || vorhanden === '') return standardEintrag
      if (typeof standardEintrag === 'object' && typeof vorhanden === 'object') return { ...standardEintrag, ...vorhanden }
      return vorhanden
    })
    // vom Nutzer ergänzte Einträge behalten
    if (ist.length > v.length) out[k] = [...out[k], ...ist.slice(v.length)]
  })
  return out
}

// ═══════════════════════════════════════════════════════════════════════════
// DIE VARIANTEN
// ═══════════════════════════════════════════════════════════════════════════
const V = []
const neu = (id, name, standard, bau) => V.push({ id, name, standard, render: (roh) => bau(voll(standard, roh || {})) })

neu('h-mitte', 'Zentriert', MIT_STATS, (c) => `
<section data-block="hero-full" data-variant="h-mitte" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:86vh;display:flex;align-items:center;justify-content:center;text-align:center;${flaeche(c)}">
  ${musterEbene(c)}${c.hell ? '' : '<div class="wg-mesh"><span class="wg-blob wg-blob-a"></span><span class="wg-blob wg-blob-b"></span></div>'}
  <div class="wg-wrap" style="position:relative;z-index:1;max-width:900px;">
    <div class="wg-reveal">
      ${chip(c)}
      <h1 class="wg-t1" style="color:${tf(c)};margin:22px auto 0;">${ed('headline', c.headline)}</h1>
      <span class="wg-strichlinie mitte"></span>
      <div class="wg-lead" style="color:${tm(c)};max-width:560px;margin:0 auto 34px;">${ed('subline', c.subline)}</div>
      ${knoepfe(c, true)}${statReihe(c, true)}
    </div>
  </div>
</section>`)

neu('h-bild-rechts', 'Text links, Bild rechts', MIT_STATS, (c) => `
<section data-block="hero-full" data-variant="h-bild-rechts" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(60px,8vw,110px) 0;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4vw,60px);align-items:center;">
      <div class="wg-reveal li">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${ed('headline', c.headline)}</h1>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead" style="color:${tm(c)};max-width:480px;margin-bottom:30px;">${ed('subline', c.subline)}</div>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re wg-bildbox" style="height:clamp(320px,44vw,520px);transition-delay:.1s;">${bildFlaeche('heroImg', c.heroImg)}</div>
    </div>
    ${statReihe(c)}
  </div>
</section>`)

neu('h-bild-links', 'Bild links, Text rechts', BASIS, (c) => `
<section data-block="hero-full" data-variant="h-bild-links" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(60px,8vw,110px) 0;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4vw,60px);align-items:center;">
      <div class="wg-reveal li wg-bildbox" style="height:clamp(320px,44vw,520px);">${bildFlaeche('heroImg', c.heroImg)}</div>
      <div class="wg-reveal re" style="transition-delay:.1s;">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${ed('headline', c.headline)}</h1>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead" style="color:${tm(c)};max-width:480px;margin-bottom:30px;">${ed('subline', c.subline)}</div>
        ${knoepfe(c)}
      </div>
    </div>
  </div>
</section>`)

neu('h-wort', 'Riesiges Wort', { ...BASIS, headline: 'EXPRESS' }, (c) => `
<section data-block="hero-full" data-variant="h-wort" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:82vh;display:flex;align-items:center;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-reveal">
      ${chip(c)}
      <h1 style="font-size:clamp(52px,13vw,180px);font-weight:800;line-height:.92;letter-spacing:-.045em;color:${tf(c)};margin:22px 0 18px;text-transform:uppercase;">${ed('headline', c.headline)}</h1>
      <div class="wg-lead" style="color:${tm(c)};max-width:520px;margin-bottom:30px;">${ed('subline', c.subline)}</div>
      ${knoepfe(c)}
    </div>
  </div>
</section>`)

neu('h-wort-split', 'Wort + Text daneben', MIT_STATS, (c) => `
<section data-block="hero-full" data-variant="h-wort-split" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:80vh;display:flex;align-items:center;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1.15fr .85fr;gap:clamp(24px,4vw,56px);align-items:end;">
      <h1 class="wg-reveal li" style="font-size:clamp(46px,9vw,124px);font-weight:800;line-height:.94;letter-spacing:-.04em;color:${tf(c)};margin:0;">${ed('headline', c.headline)}</h1>
      <div class="wg-reveal re" style="transition-delay:.1s;">
        ${chip(c)}
        <div class="wg-lead" style="color:${tm(c)};margin:18px 0 26px;">${ed('subline', c.subline)}</div>
        ${knoepfe(c)}
      </div>
    </div>
    ${statReihe(c)}
  </div>
</section>`)

neu('h-foto-unten', 'Vollbild-Foto, Text unten', MIT_STATS, (c) => `
<section data-block="hero-full" data-variant="h-foto-unten" class="wg-dunkelzone" style="position:relative;overflow:hidden;min-height:94vh;display:flex;align-items:flex-end;background:linear-gradient(160deg,var(--p900),#0b1622);">
  ${c.bgImg ? `<img src="${esc(c.bgImg)}" data-img="bgImg" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">`
    : `<div data-img="bgImg" class="wg-bildleer" style="position:absolute;inset:0;border-radius:0;"><span><i class="fa-solid fa-image"></i>Hintergrundbild einfügen</span></div>`}
  <div aria-hidden="true" style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,20,32,.2),rgba(10,20,32,.88));"></div>
  <div class="wg-wrap" style="position:relative;z-index:1;padding:120px 24px clamp(44px,6vw,80px);">
    <div class="wg-reveal" style="max-width:900px;">
      <span class="wg-chip glas">${ed('tag', c.tag)}</span>
      <h1 class="wg-t1" style="color:#fff;margin:22px 0 0;">${ed('headline', c.headline)}</h1>
      <span class="wg-strichlinie"></span>
      <div class="wg-lead" style="color:rgba(255,255,255,.8);max-width:560px;margin-bottom:30px;">${ed('subline', c.subline)}</div>
      ${knoepfe({ ...c, hell: false })}${statReihe({ ...c, hell: false })}
    </div>
  </div>
</section>`)

neu('h-formular', 'Mit Anfrage-Formular', { ...MIT_STATS, formTitel: 'Kostenlos anfragen' }, (c) => `
<section data-block="hero-full" data-variant="h-formular" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(58px,8vw,104px) 0;${flaeche(c)}">
  ${musterEbene(c)}${c.hell ? '' : '<div class="wg-mesh"><span class="wg-blob wg-blob-a"></span></div>'}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(26px,4vw,56px);align-items:center;">
      <div class="wg-reveal li">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${ed('headline', c.headline)}</h1>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead" style="color:${tm(c)};max-width:460px;">${ed('subline', c.subline)}</div>
        ${statReihe(c)}
      </div>
      <form class="wg-reveal re wg-karte" data-contact-form style="display:grid;gap:12px;padding:clamp(22px,3vw,32px);transition-delay:.12s;">
        <div style="font-size:17px;font-weight:800;color:#0f172a;">${ed('formTitel', c.formTitel)}</div>
        <input name="name" required placeholder="Ihr Name *" style="border:2px solid rgba(15,23,42,.1);border-radius:11px;padding:13px 15px;font-size:15px;font-family:inherit;outline:none;">
        <input name="email" type="email" required placeholder="E-Mail *" style="border:2px solid rgba(15,23,42,.1);border-radius:11px;padding:13px 15px;font-size:15px;font-family:inherit;outline:none;">
        <textarea name="nachricht" rows="3" placeholder="Worum geht es?" style="border:2px solid rgba(15,23,42,.1);border-radius:11px;padding:13px 15px;font-size:15px;font-family:inherit;outline:none;resize:vertical;"></textarea>
        <button type="submit" class="wg-btn" style="justify-content:center;">${ed('cta1', c.cta1)}</button>
      </form>
    </div>
  </div>
</section>`)

neu('h-panel', 'Mit Werte-Karten', MIT_STATS, (c) => `
<section data-block="hero-full" data-variant="h-panel" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:84vh;display:flex;align-items:center;${flaeche(c)}">
  ${musterEbene(c)}${c.hell ? '' : '<div class="wg-mesh"><span class="wg-blob wg-blob-a"></span><span class="wg-blob wg-blob-b"></span></div>'}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(26px,4vw,54px);align-items:center;">
      <div class="wg-reveal li">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${ed('headline', c.headline)}</h1>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead" style="color:${tm(c)};max-width:470px;margin-bottom:30px;">${ed('subline', c.subline)}</div>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re" style="display:grid;gap:14px;transition-delay:.12s;">
        ${c.stats.map((s, i) => `<div class="wg-karte" style="display:flex;align-items:center;gap:17px;padding:20px 22px;">
          <div class="wg-iconchip" style="width:46px;height:46px;font-size:17px;flex-shrink:0;"><i class="fa-solid fa-check"></i></div>
          <div><div style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-.02em;">${ed(`stats.${i}.num`, s.num)}</div>
          <div style="font-size:13.5px;color:#64748b;">${ed(`stats.${i}.label`, s.label)}</div></div>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>`)

neu('h-liste', 'Mit Häkchenliste', {
  ...BASIS,
  punkte: ['Festpreis ohne Überraschungen', 'Termine, die gehalten werden', 'Saubere Übergabe zum Schluss'],
}, (c) => `
<section data-block="hero-full" data-variant="h-liste" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(60px,8vw,110px) 0;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4vw,58px);align-items:center;">
      <div class="wg-reveal li">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${ed('headline', c.headline)}</h1>
        <span class="wg-strichlinie"></span>
        <ul style="list-style:none;padding:0;margin:0 0 30px;display:grid;gap:12px;">
          ${c.punkte.map((p, i) => `<li style="display:flex;align-items:flex-start;gap:12px;font-size:16px;color:${c.hell ? '#334155' : 'rgba(255,255,255,.84)'};">
            <span style="width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;margin-top:2px;"><i class="fa-solid fa-check"></i></span>${ed(`punkte.${i}`, p)}</li>`).join('')}
        </ul>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re wg-bildbox" style="height:clamp(320px,42vw,500px);transition-delay:.12s;">${bildFlaeche('heroImg', c.heroImg)}</div>
    </div>
  </div>
</section>`)

neu('h-bewertung', 'Mit Bewertung', { ...BASIS, badge: '4,9 von 5 · über 200 Bewertungen' }, (c) => `
<section data-block="hero-full" data-variant="h-bewertung" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(60px,8vw,110px) 0;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4vw,58px);align-items:center;">
      <div class="wg-reveal li">
        <div style="display:inline-flex;align-items:center;gap:11px;background:${c.hell ? 'var(--p50)' : 'rgba(255,255,255,.1)'};border:1px solid ${c.hell ? 'rgba(15,23,42,.08)' : 'rgba(255,255,255,.2)'};border-radius:99px;padding:8px 16px;margin-bottom:20px;">
          <span style="color:var(--accent);font-size:13px;">${'<i class="fa-solid fa-star"></i>'.repeat(5)}</span>
          <span style="font-size:13px;font-weight:700;color:${tf(c)};">${ed('badge', c.badge)}</span>
        </div>
        <h1 class="wg-t1" style="color:${tf(c)};margin:0;">${ed('headline', c.headline)}</h1>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead" style="color:${tm(c)};max-width:460px;margin-bottom:30px;">${ed('subline', c.subline)}</div>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re wg-bildbox" style="height:clamp(320px,42vw,500px);transition-delay:.12s;">${bildFlaeche('heroImg', c.heroImg)}</div>
    </div>
  </div>
</section>`)

neu('h-laufband', 'Mit Laufband', {
  ...BASIS,
  punkte: ['Meisterbetrieb', 'Festpreis-Garantie', 'Termintreue', 'Über 500 Kunden'],
}, (c) => {
  const zeile = (bearbeitbar) => c.punkte.map((p, i) =>
    `<span style="display:inline-flex;align-items:center;gap:11px;padding:0 26px;font-size:13.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${tf(c)};white-space:nowrap;"><span style="width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0;"></span>${bearbeitbar ? ed(`punkte.${i}`, p) : `<span data-kopie="punkte.${i}">${esc(p)}</span>`}</span>`
  ).join('')
  return `
<section data-block="hero-full" data-variant="h-laufband" class="${zone(c)}" style="position:relative;overflow:hidden;${flaeche(c)}">
  ${musterEbene(c)}${c.hell ? '' : '<div class="wg-mesh"><span class="wg-blob wg-blob-a"></span><span class="wg-blob wg-blob-b"></span></div>'}
  <div class="wg-wrap" style="position:relative;z-index:1;padding:clamp(60px,9vw,120px) 0 clamp(40px,5vw,64px);text-align:center;">
    <div class="wg-reveal" style="max-width:880px;margin:0 auto;">
      ${chip(c)}
      <h1 class="wg-t1" style="color:${tf(c)};margin:22px auto 0;">${ed('headline', c.headline)}</h1>
      <span class="wg-strichlinie mitte"></span>
      <div class="wg-lead" style="color:${tm(c)};max-width:540px;margin:0 auto 32px;">${ed('subline', c.subline)}</div>
      ${knoepfe(c, true)}
    </div>
  </div>
  <div style="position:relative;z-index:1;border-top:1px solid ${c.hell ? 'rgba(15,23,42,.09)' : 'rgba(255,255,255,.14)'};padding:16px 0;overflow:hidden;">
    <div class="wg-laufband" style="display:flex;width:max-content;animation:wgLaufH 28s linear infinite;">
      <div style="display:flex;">${zeile(true)}</div><div style="display:flex;" aria-hidden="true">${zeile(false)}</div>
    </div>
  </div>
  <style>@keyframes wgLaufH{from{transform:translateX(0)}to{transform:translateX(-50%)}}</style>
</section>`
})

neu('h-magazin', 'Magazin', BASIS, (c) => `
<section data-block="hero-full" data-variant="h-magazin" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(56px,8vw,100px) 0;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1.05fr .95fr;gap:0;align-items:center;">
      <div class="wg-reveal" style="position:relative;z-index:2;">
        ${chip(c)}
        <h1 style="font-size:clamp(44px,7.6vw,96px);font-weight:300;line-height:1.02;letter-spacing:-.035em;color:${tf(c)};margin:20px 0 18px;">${ed('headline', c.headline)}</h1>
        <div class="wg-lead" style="color:${tm(c)};max-width:430px;margin-bottom:28px;">${ed('subline', c.subline)}</div>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re wg-bildbox wg-hide-mob" style="height:clamp(340px,44vw,540px);margin-left:-46px;transition-delay:.12s;">${bildFlaeche('heroImg', c.heroImg)}</div>
    </div>
  </div>
</section>`)

neu('h-collage', 'Bildcollage', BASIS, (c) => `
<section data-block="hero-full" data-variant="h-collage" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(58px,8vw,100px) 0;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:.95fr 1.05fr;gap:clamp(26px,4vw,54px);align-items:center;">
      <div class="wg-reveal li">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${ed('headline', c.headline)}</h1>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead" style="color:${tm(c)};max-width:440px;margin-bottom:28px;">${ed('subline', c.subline)}</div>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re" style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:150px 150px;gap:14px;transition-delay:.12s;">
        <div class="wg-bildbox" style="grid-row:span 2;">${bildFlaeche('heroImg', c.heroImg)}</div>
        <div class="wg-bildbox">${bildFlaeche('heroImg2', c.heroImg2)}</div>
        <div class="wg-bildbox">${bildFlaeche('heroImg3', c.heroImg3)}</div>
      </div>
    </div>
  </div>
</section>`)

neu('h-schraeg', 'Schräg geteilt', BASIS, (c) => `
<section data-block="hero-full" data-variant="h-schraeg" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:84vh;display:flex;align-items:center;${flaeche(c)}">
  ${musterEbene(c)}
  <div aria-hidden="true" class="wg-hide-mob" style="position:absolute;top:0;right:0;bottom:0;width:52%;clip-path:polygon(18% 0,100% 0,100% 100%,0 100%);overflow:hidden;">
    ${bildFlaeche('heroImg', c.heroImg, 'border-radius:0;')}
  </div>
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-reveal" style="max-width:560px;">
      ${chip(c)}
      <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${ed('headline', c.headline)}</h1>
      <span class="wg-strichlinie"></span>
      <div class="wg-lead" style="color:${tm(c)};margin-bottom:30px;">${ed('subline', c.subline)}</div>
      ${knoepfe(c)}
    </div>
  </div>
</section>`)

neu('h-rahmen', 'Rahmen', MIT_STATS, (c) => `
<section data-block="hero-full" data-variant="h-rahmen" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(20px,3vw,34px);${flaeche(c)}">
  <div style="position:relative;border:1px solid ${c.hell ? 'rgba(15,23,42,.14)' : 'rgba(255,255,255,.2)'};border-radius:26px;min-height:78vh;display:flex;align-items:center;overflow:hidden;">
    ${musterEbene(c)}
    <div style="width:100%;padding:clamp(30px,5vw,64px);position:relative;z-index:1;">
      <div class="wg-reveal" style="max-width:760px;">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:22px 0 0;">${ed('headline', c.headline)}</h1>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead" style="color:${tm(c)};max-width:520px;margin-bottom:30px;">${ed('subline', c.subline)}</div>
        ${knoepfe(c)}${statReihe(c)}
      </div>
    </div>
  </div>
</section>`)

neu('h-karten-drei', 'Mit drei Karten', {
  ...BASIS,
  karten: [
    { icon: 'phone', title: 'Anrufen', text: 'Kurz schildern, worum es geht.' },
    { icon: 'calendar-check', title: 'Termin', text: 'Wir schauen es uns an.' },
    { icon: 'thumbs-up', title: 'Erledigt', text: 'Sauber und zum Festpreis.' },
  ],
}, (c) => `
<section data-block="hero-full" data-variant="h-karten-drei" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(58px,8vw,104px) 0 clamp(30px,4vw,48px);${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-reveal" style="max-width:760px;">
      ${chip(c)}
      <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${ed('headline', c.headline)}</h1>
      <span class="wg-strichlinie"></span>
      <div class="wg-lead" style="color:${tm(c)};max-width:520px;margin-bottom:30px;">${ed('subline', c.subline)}</div>
      ${knoepfe(c)}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;margin-top:clamp(34px,5vw,58px);">
      ${c.karten.map((k, i) => `<div class="wg-reveal wg-karte" style="transition-delay:${i * 80}ms;">
        <div class="wg-iconchip" style="width:44px;height:44px;font-size:16px;margin-bottom:14px;"><i data-icon="karten.${i}.icon" class="fa-solid fa-${esc(k.icon || 'check')}" style="cursor:pointer;"></i></div>
        <h3 style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:6px;">${ed(`karten.${i}.title`, k.title)}</h3>
        <div style="font-size:14px;color:#64748b;line-height:1.6;">${ed(`karten.${i}.text`, k.text)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`)

neu('h-zwei-bilder', 'Zwei Bilder versetzt', BASIS, (c) => `
<section data-block="hero-full" data-variant="h-zwei-bilder" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(58px,8vw,104px) 0;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4vw,56px);align-items:center;">
      <div class="wg-reveal li">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${ed('headline', c.headline)}</h1>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead" style="color:${tm(c)};max-width:440px;margin-bottom:30px;">${ed('subline', c.subline)}</div>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re" style="position:relative;height:clamp(340px,44vw,520px);transition-delay:.12s;">
        <div class="wg-bildbox" style="position:absolute;top:0;left:0;width:66%;height:72%;">${bildFlaeche('heroImg', c.heroImg)}</div>
        <div class="wg-bildbox" style="position:absolute;bottom:0;right:0;width:58%;height:60%;border:6px solid ${c.hell ? '#fff' : 'var(--p900)'};box-shadow:0 20px 44px rgba(15,23,42,.24);">${bildFlaeche('heroImg2', c.heroImg2)}</div>
      </div>
    </div>
  </div>
</section>`)

neu('h-minimal', 'Minimal', { ...BASIS, headline: 'Weniger ist mehr.', cta2: '' }, (c) => `
<section data-block="hero-full" data-variant="h-minimal" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;max-width:760px;">
    <div class="wg-reveal">
      <h1 style="font-size:clamp(38px,6.4vw,84px);font-weight:200;line-height:1.06;letter-spacing:-.035em;color:${tf(c)};margin-bottom:24px;">${ed('headline', c.headline)}</h1>
      <span class="wg-strichlinie mitte"></span>
      <div class="wg-lead" style="color:${tm(c)};max-width:460px;margin:0 auto 32px;">${ed('subline', c.subline)}</div>
      <a href="kontakt.html" class="wg-btn">${ed('cta1', c.cta1)}</a>
    </div>
  </div>
</section>`)

neu('h-logos', 'Mit Partner-Leiste', {
  ...BASIS,
  logos: ['Partner', 'Innung', 'Zertifikat', 'Verband', 'Mitglied'],
}, (c) => `
<section data-block="hero-full" data-variant="h-logos" class="${zone(c)}" style="position:relative;overflow:hidden;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;padding:clamp(58px,8vw,104px) 24px clamp(30px,4vw,48px);">
    <div class="wg-split" style="display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(26px,4vw,54px);align-items:center;">
      <div class="wg-reveal li">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${ed('headline', c.headline)}</h1>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead" style="color:${tm(c)};max-width:450px;margin-bottom:28px;">${ed('subline', c.subline)}</div>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re wg-bildbox" style="height:clamp(280px,36vw,420px);transition-delay:.12s;">${bildFlaeche('heroImg', c.heroImg)}</div>
    </div>
  </div>
  <div style="position:relative;z-index:1;border-top:1px solid ${c.hell ? 'rgba(15,23,42,.09)' : 'rgba(255,255,255,.13)'};">
    <div class="wg-wrap" style="display:flex;flex-wrap:wrap;gap:clamp(20px,4vw,54px);align-items:center;justify-content:space-between;padding:22px 24px;">
      ${c.logos.map((l, i) => `<span style="font-size:14px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:${c.hell ? '#94a3b8' : 'rgba(255,255,255,.5)'};">${ed(`logos.${i}`, l)}</span>`).join('')}
    </div>
  </div>
</section>`)

neu('h-geist', 'Mit Geisterwort', { ...BASIS, geistwort: 'QUALITÄT' }, (c) => `
<section data-block="hero-full" data-variant="h-geist" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:84vh;display:flex;align-items:center;${flaeche(c)}">
  ${musterEbene(c)}
  <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:clamp(120px,26vw,420px);font-weight:800;letter-spacing:-.05em;color:${c.hell ? 'rgba(15,23,42,.045)' : 'rgba(255,255,255,.05)'};white-space:nowrap;">${ed('geistwort', c.geistwort)}</div>
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-reveal" style="max-width:720px;">
      ${chip(c)}
      <h1 class="wg-t1" style="color:${tf(c)};margin:22px 0 0;">${ed('headline', c.headline)}</h1>
      <span class="wg-strichlinie"></span>
      <div class="wg-lead" style="color:${tm(c)};max-width:500px;margin-bottom:30px;">${ed('subline', c.subline)}</div>
      ${knoepfe(c)}
    </div>
  </div>
</section>`)

neu('h-farbhaelfte', 'Farbige Hälfte', BASIS, (c) => `
<section data-block="hero-full" data-variant="h-farbhaelfte" class="wg-split" style="position:relative;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;min-height:84vh;">
  <div class="wg-dunkelzone" style="display:flex;align-items:center;padding:clamp(34px,5vw,72px);background:linear-gradient(160deg,var(--p900),#0b1622 75%);position:relative;overflow:hidden;">
    <div class="wg-mesh"><span class="wg-blob wg-blob-a"></span></div>
    <div class="wg-reveal" style="position:relative;z-index:1;">
      <span class="wg-chip glas">${ed('tag', c.tag)}</span>
      <h1 style="font-size:clamp(38px,4.6vw,68px);font-weight:300;line-height:1.05;letter-spacing:-.03em;color:#fff;margin:22px 0 0;">${ed('headline', c.headline)}</h1>
      <span class="wg-strichlinie"></span>
      <div class="wg-lead" style="color:rgba(255,255,255,.78);margin-bottom:30px;">${ed('subline', c.subline)}</div>
      ${knoepfe({ ...c, hell: false })}
    </div>
  </div>
  <div class="wg-bildbox" style="border-radius:0;min-height:300px;">${bildFlaeche('heroImg', c.heroImg, 'border-radius:0;')}</div>
</section>`)

neu('h-bild-oben', 'Bild oben, Text unten', BASIS, (c) => `
<section data-block="hero-full" data-variant="h-bild-oben" class="${zone(c)}" style="position:relative;overflow:hidden;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-bildbox" style="border-radius:0;height:clamp(240px,32vw,420px);">${bildFlaeche('heroImg', c.heroImg, 'border-radius:0;')}</div>
  <div class="wg-wrap" style="position:relative;z-index:1;padding:clamp(40px,6vw,74px) 24px;">
    <div class="wg-split" style="display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(22px,4vw,50px);align-items:end;">
      <div class="wg-reveal">
        ${chip(c)}
        <h1 class="wg-t1" style="color:${tf(c)};margin:18px 0 0;">${ed('headline', c.headline)}</h1>
        <span class="wg-strichlinie"></span>
      </div>
      <div class="wg-reveal re" style="transition-delay:.1s;">
        <div class="wg-lead" style="color:${tm(c)};margin-bottom:24px;">${ed('subline', c.subline)}</div>
        ${knoepfe(c)}
      </div>
    </div>
  </div>
</section>`)

neu('h-eingabe', 'Mit Eingabefeld', { ...BASIS, headline: 'Wobei können wir helfen?', platzhalter: 'Ihr Anliegen in einem Satz' }, (c) => `
<section data-block="hero-full" data-variant="h-eingabe" class="${zone(c)}" style="position:relative;overflow:hidden;min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;${flaeche(c)}">
  ${musterEbene(c)}${c.hell ? '' : '<div class="wg-mesh"><span class="wg-blob wg-blob-a"></span><span class="wg-blob wg-blob-c"></span></div>'}
  <div class="wg-wrap" style="position:relative;z-index:1;max-width:820px;">
    <div class="wg-reveal">
      ${chip(c)}
      <h1 class="wg-t1" style="color:${tf(c)};margin:22px auto 0;">${ed('headline', c.headline)}</h1>
      <span class="wg-strichlinie mitte"></span>
      <div class="wg-lead" style="color:${tm(c)};max-width:500px;margin:0 auto 30px;">${ed('subline', c.subline)}</div>
      <form data-contact-form style="display:flex;gap:10px;max-width:560px;margin:0 auto;flex-wrap:wrap;">
        <input name="nachricht" placeholder="${esc(c.platzhalter)}" style="flex:1;min-width:220px;border:2px solid ${c.hell ? 'rgba(15,23,42,.12)' : 'rgba(255,255,255,.24)'};background:${c.hell ? '#fff' : 'rgba(255,255,255,.08)'};color:${tf(c)};border-radius:99px;padding:16px 22px;font-size:15px;font-family:inherit;outline:none;">
        <button type="submit" class="wg-btn">${ed('cta1', c.cta1)}</button>
      </form>
    </div>
  </div>
</section>`)

neu('h-mitte-bild', 'Zentriert + Bild darunter', BASIS, (c) => `
<section data-block="hero-full" data-variant="h-mitte-bild" class="${zone(c)}" style="position:relative;overflow:hidden;padding:clamp(66px,9vw,120px) 0 0;text-align:center;${flaeche(c)}">
  ${musterEbene(c)}
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-reveal" style="max-width:820px;margin:0 auto;">
      ${chip(c)}
      <h1 class="wg-t1" style="color:${tf(c)};margin:20px 0 0;">${ed('headline', c.headline)}</h1>
      <span class="wg-strichlinie mitte"></span>
      <div class="wg-lead" style="color:${tm(c)};max-width:540px;margin:0 auto 32px;">${ed('subline', c.subline)}</div>
      ${knoepfe(c, true)}
    </div>
    <div class="wg-reveal wg-bildbox" style="height:clamp(240px,34vw,440px);margin-top:clamp(34px,5vw,60px);transition-delay:.14s;">${bildFlaeche('heroImg', c.heroImg)}</div>
  </div>
</section>`)

// ═══════════════════════════════════════════════════════════════════════════
export const HERO_FULL = {
  type: 'hero-full',
  label: 'Hero (Startseite)',
  variants: V,
}

// Standardinhalt einer Variante – der Editor füllt damit neue Blöcke
export function heroStandard(variantId) {
  const v = V.find(x => x.id === variantId) || V[0]
  return JSON.parse(JSON.stringify(v.standard || {}))
}

export const HERO_VARIANTEN = V
