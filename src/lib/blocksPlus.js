import { sektionBg } from './sektionBg'
// ═══════════════════════════════════════════════════════════════════════════
// BAUSTEIN-BIBLIOTHEK (Erweiterung)
//
// Alles reines HTML + CSS (+ etwas JS für Effekte) — kein Framework, damit die
// generierte Website als ZIP eigenständig läuft und hochgeladen werden kann.
//
// Alle Farben laufen über die CSS-Variablen der Kundenpalette:
//   --p50 … --p900  (Hauptfarbe)   --accent  (Akzent)
// Die Optik-Klassen (.wg-*) kommen aus lib/generatorDesign.js.
//
// Editierbar im Editor:  data-edit="key"   Bilder: data-img="key"
// Scroll-Effekt:         class="wg-reveal"  (bidirektional)
// ═══════════════════════════════════════════════════════════════════════════

const esc = (s) => String(s ?? '')

// Bearbeitbarer Text.
// WICHTIG: Enthält der Wert Block-Elemente (h1, p, ul, table …), muss der
// Rahmen ein <div> sein. In einem <span> wirft der Browser solche Tags
// beim Einlesen heraus – dadurch verschwand eingegebenes HTML.
const BLOCK_TAGS = /<\s*(h[1-6]|p|div|ul|ol|li|table|blockquote|section|figure|pre|hr)\b/i
const ed = (key, val, tag) => {
  const s = String(val ?? '')
  // Block-Elemente (h1, p, ul, table …) dürfen NIE in einem <span> oder in
  // einer Überschrift stecken – der Browser wirft sie beim Einlesen heraus.
  // Deshalb entscheidet der Inhalt, nicht der Aufrufer.
  const t = BLOCK_TAGS.test(s) ? 'div' : (tag || 'span')
  return `<${t} data-edit="${key}" style="outline:none;${t === 'div' ? 'display:block;' : ''}">${s}</${t}>`
}

// ── Standardwerte elementweise mischen ─────────────────────────────────────
// Ohne das hier verschwinden beim Bearbeiten eines Eintrags alle anderen:
// der Editor schickt nur den geänderten Pfad zurück, die restlichen Einträge
// wären dann leer. misch() legt den echten Inhalt über die Standardliste.
const mischObj = (standard, ist) => {
  const out = { ...standard }
  for (const k of Object.keys(ist || {})) {
    const s = standard[k], v = ist[k]
    if (Array.isArray(s) && Array.isArray(v)) out[k] = misch(v, s)
    else if (v === undefined || v === null || v === '') out[k] = s
    else if (s && typeof s === 'object' && !Array.isArray(s) && v && typeof v === 'object') out[k] = mischObj(s, v)
    else out[k] = v
  }
  return out
}
const misch = (ist, standard) => {
  const a = Array.isArray(ist) ? ist : []
  const out = standard.map((s, i) => {
    const v = a[i]
    if (v === undefined || v === null || v === '') return s
    if (s && typeof s === 'object' && !Array.isArray(s) && v && typeof v === 'object') return mischObj(s, v)
    return v
  })
  if (a.length > standard.length) out.push(...a.slice(standard.length))
  return out
}


// Font-Awesome-Icon (editierbar)
const fa = (v) => {
  if (!v) return 'star'
  v = String(v).trim()
  if (v.indexOf('fa-') === 0) v = v.slice(3)
  return v.replace(/[^a-z0-9-]/gi, '') || 'star'
}
const icon = (key, name) => `<i data-icon="${key}" class="fa-solid fa-${fa(name)}" style="line-height:1;cursor:pointer;"></i>`

// ── Platzhalter ────────────────────────────────────────────────────────────
// Leere Felder sollen NIE eine kaputte Seite ergeben: es kommt immer ein
// sinnvoller Blindtext bzw. ein ruhiges Platzhalterbild.
export const LOREM = {
  kurz: 'Kurz gesagt: Qualität, auf die Sie sich verlassen können.',
  satz: 'Wir begleiten Sie von der ersten Idee bis zum fertigen Ergebnis – persönlich, verlässlich und mit einem Blick fürs Detail.',
  absatz: 'Seit vielen Jahren stehen wir für saubere Arbeit und ehrliche Beratung. Unser Team nimmt sich Zeit für Ihr Anliegen, erklärt jeden Schritt verständlich und liefert Ergebnisse, die lange halten. Was wir versprechen, halten wir auch – darauf können Sie sich verlassen.',
  lang: 'Was uns ausmacht, ist die Verbindung aus Erfahrung und Sorgfalt. Jedes Projekt beginnt mit einem Gespräch: Wir hören zu, verstehen Ihre Situation und entwickeln daraus eine Lösung, die wirklich zu Ihnen passt. Dabei arbeiten wir transparent, halten Termine ein und bleiben auch nach Abschluss ansprechbar. So entsteht Zusammenarbeit, die Bestand hat.',
}

// Ruhiges SVG-Platzhalterbild in der Kundenfarbe (kein externes Bild nötig)
export function platzhalterBild(n = 1) {
  const sv = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' preserveAspectRatio='xMidYMid slice'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='%23dbe3ea'/><stop offset='1' stop-color='%238c9bab'/></linearGradient></defs>` +
    `<rect width='800' height='600' fill='url(%23g)'/>` +
    `<circle cx='${180 + n * 40}' cy='210' r='120' fill='%23ffffff' opacity='0.18'/>` +
    `<circle cx='${620 - n * 30}' cy='430' r='170' fill='%230f172a' opacity='0.10'/>` +
    `</svg>`
  ).replace(/#/g, '%23')
  return `data:image/svg+xml,${sv}`
}

// Bild mit Platzhalter-Fallback
const bild = (key, src, stil = '', n = 1) =>
  `<img data-img="${key}" src="${esc(src || platzhalterBild(n))}" alt="" style="${stil}">`

// Text mit Blindtext-Fallback
const txt = (key, val, fallback, tag) => ed(key, (val && String(val).trim()) ? val : fallback, tag)

// Section-Hintergrund (Bild/Verlauf/Farbe/Muster) – gleiche Logik wie blocks.js
function bg(c = {}, fallback = '') { return sektionBg(c, fallback) }

// ═══════════════════════════════════════════════════════════════════════════
// 1) MEDIA-SPLIT — "Bild groß links, Überschrift + Text rechts" (animiert)
// ═══════════════════════════════════════════════════════════════════════════
export const MEDIA = {
  type: 'media',
  label: 'Bild & Text',
  variants: [
    {
      id: 'media-links', name: 'Bild links, Text rechts',
      render: (c) => `
<section data-block="media" data-variant="media-links" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    <div class="wg-split" style="display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(28px,5vw,64px);align-items:center;">
      <div class="wg-reveal li wg-bildbox" style="height:clamp(300px,44vw,520px);">${bild('mediaImg', c.image, '', 1)}</div>
      <div class="wg-reveal re" style="transition-delay:.1s;">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Über uns')}</span>
        <h2 class="wg-t2" style="margin-top:14px;">${txt('title', c.title, 'Worauf Sie sich verlassen können')}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead" style="margin-bottom:26px;">${txt('text', c.text, LOREM.absatz, 'span')}</div>
        ${(c.punkte || []).length ? `<ul style="list-style:none;padding:0;margin:0 0 28px;display:grid;gap:11px;">
          ${(c.punkte || []).map((p, i) => `<li style="display:flex;align-items:flex-start;gap:11px;font-size:15px;color:#334155;">
            <span style="width:22px;height:22px;border-radius:50%;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;margin-top:2px;"><i class="fa-solid fa-check"></i></span>
            ${ed(`punkte.${i}`, p)}</li>`).join('')}
        </ul>` : ''}
        <a href="kontakt.html" class="wg-btn">${txt('cta', c.cta, 'Mehr erfahren')}</a>
      </div>
    </div>
  </div>
</section>`
    },
    {
      id: 'media-rechts', name: 'Text links, Bild rechts',
      render: (c) => `
<section data-block="media" data-variant="media-rechts" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap">
    <div class="wg-split" style="display:grid;grid-template-columns:.95fr 1.05fr;gap:clamp(28px,5vw,64px);align-items:center;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Unser Versprechen')}</span>
        <h2 class="wg-t2" style="margin-top:14px;">${txt('title', c.title, 'Persönlich statt anonym')}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead" style="margin-bottom:26px;">${txt('text', c.text, LOREM.absatz, 'span')}</div>
        <a href="kontakt.html" class="wg-btn">${txt('cta', c.cta, 'Jetzt anfragen')}</a>
      </div>
      <div class="wg-reveal re wg-bildbox" style="height:clamp(300px,44vw,520px);transition-delay:.1s;">${bild('mediaImg', c.image, '', 2)}</div>
    </div>
  </div>
</section>`
    },
    {
      id: 'media-zickzack', name: 'Zickzack (mehrere)',
      render: (c) => {
        const eintraege = misch(c.eintraege, [
          { title: 'Beratung, die weiterhilft', text: LOREM.satz },
          { title: 'Umsetzung ohne Überraschungen', text: LOREM.satz },
          { title: 'Betreuung auch danach', text: LOREM.satz },
        ])
        return `
<section data-block="media" data-variant="media-zickzack" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    <div class="wg-reveal" style="text-align:center;margin-bottom:clamp(34px,5vw,60px);">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'So arbeiten wir')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Von der Idee bis zum Ergebnis')}</h2>
      <span class="wg-strichlinie mitte"></span>
    </div>
    ${eintraege.map((e, i) => `
      <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,56px);align-items:center;margin-bottom:${i === eintraege.length - 1 ? 0 : 'clamp(34px,5vw,64px)'};">
        <div class="wg-reveal ${i % 2 ? 're' : 'li'} wg-bildbox" style="height:clamp(230px,32vw,380px);order:${i % 2 ? 2 : 1};">${bild(`eintraege.${i}.image`, e.image, '', i + 1)}</div>
        <div class="wg-reveal ${i % 2 ? 'li' : 're'}" style="order:${i % 2 ? 1 : 2};transition-delay:.1s;">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:var(--accent);color:#fff;font-weight:800;font-size:15px;margin-bottom:14px;">${i + 1}</div>
          <h3 class="wg-t3" style="margin-bottom:10px;">${ed(`eintraege.${i}.title`, e.title)}</h3>
          <div class="wg-lead" style="font-size:16px;">${ed(`eintraege.${i}.text`, e.text)}</div>
        </div>
      </div>`).join('')}
  </div>
</section>`
      }
    },
    {
      id: 'media-gross', name: 'Großes Bild, Text darunter',
      render: (c) => `
<section data-block="media" data-variant="media-gross" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    <div class="wg-reveal wg-bildbox" style="height:clamp(280px,46vw,560px);margin-bottom:clamp(26px,4vw,44px);">${bild('mediaImg', c.image, '', 3)}</div>
    <div class="wg-split" style="display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(22px,4vw,54px);align-items:start;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Einblick')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Ein Blick hinter die Kulissen')}</h2>
        <span class="wg-strichlinie"></span>
      </div>
      <div class="wg-reveal re wg-lead" style="transition-delay:.1s;">${txt('text', c.text, LOREM.lang, 'span')}</div>
    </div>
  </div>
</section>`
    },
    {
      id: 'media-overlap', name: 'Bild mit Textkarte',
      render: (c) => `
<section data-block="media" data-variant="media-overlap" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap">
    <div style="position:relative;">
      <div class="wg-reveal wg-bildbox" style="height:clamp(300px,42vw,500px);">${bild('mediaImg', c.image, '', 4)}</div>
      <div class="wg-reveal pop wg-karte" style="max-width:520px;margin:-90px 0 0 auto;position:relative;z-index:2;box-shadow:0 30px 70px rgba(15,23,42,.16);transition-delay:.15s;">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Qualität')}</span>
        <h2 class="wg-t3" style="margin:12px 0 10px;">${txt('title', c.title, 'Sorgfalt in jedem Detail')}</h2>
        <div class="wg-lead" style="font-size:15.5px;margin-bottom:20px;">${txt('text', c.text, LOREM.absatz, 'span')}</div>
        <a href="kontakt.html" class="wg-btn">${txt('cta', c.cta, 'Kontakt aufnehmen')}</a>
      </div>
    </div>
  </div>
</section>`
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// 2) TEXT / INHALT — hat bisher komplett gefehlt
// ═══════════════════════════════════════════════════════════════════════════
export const TEXT = {
  type: 'text',
  label: 'Textbereich',
  variants: [
    {
      id: 'text-zentriert', name: 'Große Aussage (zentriert)',
      render: (c) => `
<section data-block="text" data-variant="text-zentriert" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap" style="max-width:860px;text-align:center;">
    <div class="wg-reveal">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Was uns antreibt')}</span>
      <h2 class="wg-t2" style="margin-top:14px;">${txt('title', c.title, 'Gute Arbeit spricht für sich')}</h2>
      <span class="wg-strichlinie mitte"></span>
      <div class="wg-lead">${txt('text', c.text, LOREM.lang, 'span')}</div>
    </div>
  </div>
</section>`
    },
    {
      id: 'text-zwei', name: 'Zwei Spalten',
      render: (c) => `
<section data-block="text" data-variant="text-zwei" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    <div class="wg-split" style="display:grid;grid-template-columns:.85fr 1.15fr;gap:clamp(24px,4vw,58px);align-items:start;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Über den Betrieb')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Seit Jahren für Sie da')}</h2>
        <span class="wg-strichlinie"></span>
      </div>
      <div class="wg-reveal re" style="transition-delay:.1s;columns:2;column-gap:34px;">
        <div class="wg-lead" style="font-size:16px;margin:0;">${txt('text', c.text, LOREM.lang + ' ' + LOREM.absatz, 'span')}</div>
      </div>
    </div>
  </div>
</section>`
    },
    {
      id: 'text-zitat', name: 'Zitat / Aussage',
      render: (c) => `
<section data-block="text" data-variant="text-zitat" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:linear-gradient(160deg,var(--p900),#0d1b2a 70%);')}position:relative;overflow:hidden;">
  <div class="wg-mesh"><span class="wg-blob wg-blob-a"></span></div>
  <div class="wg-wrap" style="max-width:900px;text-align:center;position:relative;z-index:1;">
    <div class="wg-reveal">
      <i class="fa-solid fa-quote-left" style="font-size:34px;color:var(--accent);margin-bottom:22px;display:block;"></i>
      <div class="wg-t2" style="color:#fff;font-weight:300;line-height:1.3;margin-bottom:22px;">${txt('zitat', c.zitat, 'Wir behandeln jedes Projekt so, als wäre es unser eigenes.')}</div>
      <div style="font-size:14px;font-weight:700;color:var(--accent);letter-spacing:.06em;text-transform:uppercase;">${txt('autor', c.autor, 'Die Geschäftsführung')}</div>
    </div>
  </div>
</section>`
    },
    {
      id: 'text-akzent', name: 'Text mit Akzentbalken',
      render: (c) => `
<section data-block="text" data-variant="text-akzent" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap" style="max-width:920px;">
    <div class="wg-reveal" style="border-left:4px solid var(--accent);padding-left:clamp(20px,3vw,34px);">
      <h2 class="wg-t2" style="margin-bottom:16px;">${txt('title', c.title, 'Worauf Sie sich verlassen können')}</h2>
      <div class="wg-lead">${txt('text', c.text, LOREM.lang, 'span')}</div>
    </div>
  </div>
</section>`
    },
    {
      id: 'text-highlights', name: 'Text + Highlights',
      render: (c) => {
        const hl = misch(c.highlights, [
          { num: '0', label: 'Ihre Kennzahl' },
          { num: '0', label: 'Ihre Kennzahl' },
          { num: '0', label: 'Ihre Kennzahl' },
        ])
        return `
<section data-block="text" data-variant="text-highlights" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    <div class="wg-split" style="display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(26px,4vw,58px);align-items:center;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'In Zahlen')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Erfahrung, die sich zeigt')}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead">${txt('text', c.text, LOREM.absatz, 'span')}</div>
      </div>
      <div class="wg-reveal re" style="display:grid;gap:14px;transition-delay:.1s;">
        ${hl.map((h, i) => `<div class="wg-karte wg-karte-hover" style="display:flex;align-items:center;gap:18px;padding:20px 22px;">
          <div class="wg-stat-num" style="min-width:96px;">${ed(`highlights.${i}.num`, h.num)}</div>
          <div style="font-size:14.5px;color:#64748b;">${ed(`highlights.${i}.label`, h.label)}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>`
      }
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// 3) FEATURES / LEISTUNGEN — zusätzliche, hochwertigere Varianten
// ═══════════════════════════════════════════════════════════════════════════
export const FEATURES = {
  type: 'features',
  label: 'Leistungen (Premium)',
  variants: [
    {
      id: 'feat-karten', name: 'Karten mit Icon',
      render: (c) => {
        const items = misch(c.items, [
          { icon: 'bolt', title: 'Schnell vor Ort', text: LOREM.kurz },
          { icon: 'shield-halved', title: 'Sauber gearbeitet', text: LOREM.kurz },
          { icon: 'handshake', title: 'Fair beraten', text: LOREM.kurz },
        ])
        return `
<section data-block="features" data-variant="feat-karten" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap">
    <div class="wg-reveal" style="text-align:center;margin-bottom:clamp(30px,4vw,52px);">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Leistungen')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Das können wir für Sie tun')}</h2>
      <span class="wg-strichlinie mitte"></span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;">
      ${items.map((it, i) => `<div class="wg-reveal wg-karte wg-karte-hover" style="transition-delay:${i * 80}ms;">
        <div class="wg-iconchip" style="margin-bottom:16px;">${icon(`items.${i}.icon`, it.icon)}</div>
        <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:9px;">${ed(`items.${i}.title`, it.title)}</h3>
        <div style="font-size:14.5px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
    {
      id: 'feat-liste-gross', name: 'Große nummerierte Liste',
      render: (c) => {
        const items = misch(c.items, [
          { title: 'Beratung', text: LOREM.satz },
          { title: 'Planung', text: LOREM.satz },
          { title: 'Umsetzung', text: LOREM.satz },
          { title: 'Abnahme', text: LOREM.satz },
        ])
        return `
<section data-block="features" data-variant="feat-liste-gross" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    <div class="wg-reveal" style="margin-bottom:clamp(28px,4vw,48px);max-width:660px;">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Ablauf')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'In vier Schritten zum Ziel')}</h2>
      <span class="wg-strichlinie"></span>
    </div>
    <div style="display:grid;gap:0;">
      ${items.map((it, i) => `<div class="wg-reveal" style="display:grid;grid-template-columns:88px 1fr;gap:clamp(14px,3vw,32px);align-items:start;padding:clamp(20px,3vw,30px) 0;border-top:1px solid rgba(15,23,42,.09);transition-delay:${i * 70}ms;">
        <div style="font-size:clamp(34px,4vw,52px);font-weight:200;color:var(--accent);line-height:1;">${String(i + 1).padStart(2, '0')}</div>
        <div>
          <h3 class="wg-t3" style="margin-bottom:8px;">${ed(`items.${i}.title`, it.title)}</h3>
          <div class="wg-lead" style="font-size:15.5px;max-width:680px;">${ed(`items.${i}.text`, it.text)}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
    {
      id: 'feat-dunkel', name: 'Dunkles Raster',
      render: (c) => {
        const items = misch(c.items, [
          { icon: 'clock', title: 'Rund um die Uhr', text: LOREM.kurz },
          { icon: 'medal', title: 'Geprüfte Qualität', text: LOREM.kurz },
          { icon: 'euro-sign', title: 'Faire Preise', text: LOREM.kurz },
          { icon: 'headset', title: 'Persönlicher Kontakt', text: LOREM.kurz },
        ])
        return `
<section data-block="features" data-variant="feat-dunkel" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:linear-gradient(160deg,var(--p900),#0d1b2a 70%);')}position:relative;overflow:hidden;">
  <div class="wg-mesh"><span class="wg-blob wg-blob-b"></span></div>
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-reveal" style="text-align:center;margin-bottom:clamp(30px,4vw,52px);">
      <span class="wg-eyebrow hell">${txt('tag', c.tag, 'Ihre Vorteile')}</span>
      <h2 class="wg-t2" style="color:#fff;margin-top:12px;">${txt('title', c.title, 'Warum Kunden bleiben')}</h2>
      <span class="wg-strichlinie mitte"></span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;">
      ${items.map((it, i) => `<div class="wg-reveal" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:26px;transition-delay:${i * 70}ms;">
        <div style="width:46px;height:46px;border-radius:12px;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:15px;">${icon(`items.${i}.icon`, it.icon)}</div>
        <h3 style="font-size:17px;font-weight:700;color:#fff;margin-bottom:8px;">${ed(`items.${i}.title`, it.title)}</h3>
        <div style="font-size:14px;color:rgba(255,255,255,.7);line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
    {
      id: 'feat-split-bild', name: 'Liste neben Bild',
      render: (c) => {
        const items = misch(c.items, [
          { icon: 'check', title: 'Ihr Vorteil', text: LOREM.kurz },
          { icon: 'check', title: 'Termine, die halten', text: LOREM.kurz },
          { icon: 'check', title: 'Saubere Übergabe', text: LOREM.kurz },
        ])
        return `
<section data-block="features" data-variant="feat-split-bild" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4vw,60px);align-items:center;">
      <div class="wg-reveal li wg-bildbox" style="height:clamp(300px,42vw,500px);">${bild('featImg', c.image, '', 5)}</div>
      <div class="wg-reveal re" style="transition-delay:.1s;">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Unser Anspruch')}</span>
        <h2 class="wg-t2" style="margin:12px 0 8px;">${txt('title', c.title, 'Dafür stehen wir')}</h2>
        <span class="wg-strichlinie"></span>
        <div style="display:grid;gap:18px;">
          ${items.map((it, i) => `<div style="display:flex;gap:15px;align-items:flex-start;">
            <div style="width:40px;height:40px;border-radius:11px;background:var(--p100);color:var(--p700);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;">${icon(`items.${i}.icon`, it.icon)}</div>
            <div>
              <h3 style="font-size:16.5px;font-weight:700;color:#0f172a;margin-bottom:4px;">${ed(`items.${i}.title`, it.title)}</h3>
              <div style="font-size:14.5px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>`
      }
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// 4) GALERIE — mehrere Darstellungen
// ═══════════════════════════════════════════════════════════════════════════
export const GALERIE = {
  type: 'galerie',
  label: 'Galerie (Premium)',
  variants: [
    {
      id: 'gal-masonry', name: 'Versetztes Raster',
      render: (c) => {
        const imgs = misch(c.images, [0, 1, 2, 3, 4, 5]).map(() => '')
        return `
<section data-block="galerie" data-variant="gal-masonry" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    <div class="wg-reveal" style="text-align:center;margin-bottom:clamp(26px,4vw,44px);">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Galerie')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Einblicke in unsere Arbeit')}</h2>
      <span class="wg-strichlinie mitte"></span>
    </div>
    <div style="columns:3;column-gap:16px;" class="wg-gal-cols">
      ${imgs.map((s, i) => `<div class="wg-reveal wg-bildbox" style="break-inside:avoid;margin-bottom:16px;height:${[300, 220, 260, 240, 320, 200][i % 6]}px;transition-delay:${i * 60}ms;">${bild(`images.${i}`, s, '', i + 1)}</div>`).join('')}
    </div>
  </div>
  <style>@media(max-width:900px){.wg-gal-cols{columns:2 !important}}@media(max-width:560px){.wg-gal-cols{columns:1 !important}}</style>
</section>`
      }
    },
    {
      id: 'gal-raster', name: 'Gleichmäßiges Raster',
      render: (c) => {
        const imgs = misch(c.images, [0, 1, 2, 3, 4, 5]).map(() => '')
        return `
<section data-block="galerie" data-variant="gal-raster" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap">
    <div class="wg-reveal" style="margin-bottom:clamp(24px,4vw,42px);max-width:620px;">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Referenzen')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Ausgewählte Projekte')}</h2>
      <span class="wg-strichlinie"></span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;">
      ${imgs.map((s, i) => `<div class="wg-reveal wg-bildbox" style="height:250px;transition-delay:${i * 60}ms;">${bild(`images.${i}`, s, '', i + 1)}</div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
    {
      id: 'gal-breit', name: 'Breite Streifen',
      render: (c) => {
        const imgs = misch(c.images, ['', '', '']).slice(0, 3)
        return `
<section data-block="galerie" data-variant="gal-breit" class="wg-sekt" style="${bg(c, 'background:#fff;')}padding-left:0;padding-right:0;">
  <div class="wg-wrap" style="margin-bottom:clamp(24px,4vw,40px);text-align:center;">
    <div class="wg-reveal">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Impressionen')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Bilder sagen mehr')}</h2>
      <span class="wg-strichlinie mitte"></span>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">
    ${imgs.map((s, i) => `<div class="wg-reveal wg-bildbox" style="border-radius:0;height:clamp(220px,26vw,400px);transition-delay:${i * 80}ms;">${bild(`images.${i}`, s, '', i + 1)}</div>`).join('')}
  </div>
</section>`
      }
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// 5) KUNDENSTIMMEN — hochwertigere Varianten
// ═══════════════════════════════════════════════════════════════════════════
export const STIMMEN = {
  type: 'stimmen',
  label: 'Kundenstimmen (Premium)',
  variants: [
    {
      id: 'stimmen-gross', name: 'Große Zitatkarten',
      render: (c) => {
        const items = misch(c.items, [
          { text: 'Hier steht später eine echte Kundenstimme – im Editor anklicken und ersetzen.', name: 'Kundenname', rolle: 'Kunde' },
          { text: 'Hier steht später eine echte Kundenstimme – im Editor anklicken und ersetzen.', name: 'Kundenname', rolle: 'Kunde' },
        ])
        return `
<section data-block="stimmen" data-variant="stimmen-gross" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap">
    <div class="wg-reveal" style="text-align:center;margin-bottom:clamp(28px,4vw,48px);">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Kundenstimmen')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Das sagen unsere Kunden')}</h2>
      <span class="wg-strichlinie mitte"></span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px;">
      ${items.map((it, i) => `<div class="wg-reveal wg-karte wg-karte-hover" style="padding:30px;transition-delay:${i * 90}ms;">
        <div style="color:var(--accent);font-size:15px;margin-bottom:14px;">${'<i class="fa-solid fa-star"></i>'.repeat(5)}</div>
        <p style="font-size:17.5px;line-height:1.65;color:#0f172a;font-weight:300;margin-bottom:22px;">„${ed(`items.${i}.text`, it.text)}"</p>
        <div style="display:flex;align-items:center;gap:13px;border-top:1px solid rgba(15,23,42,.08);padding-top:18px;">
          <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--p500),var(--p700));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;">${esc((it.name || 'K')[0])}</div>
          <div>
            <div style="font-size:14.5px;font-weight:700;color:#0f172a;">${ed(`items.${i}.name`, it.name)}</div>
            <div style="font-size:12.5px;color:#94a3b8;">${ed(`items.${i}.rolle`, it.rolle)}</div>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
    {
      id: 'stimmen-einzeln', name: 'Eine große Stimme',
      render: (c) => `
<section data-block="stimmen" data-variant="stimmen-einzeln" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:linear-gradient(160deg,var(--p900),#0d1b2a 70%);')}position:relative;overflow:hidden;">
  <div class="wg-mesh"><span class="wg-blob wg-blob-a"></span><span class="wg-blob wg-blob-b"></span></div>
  <div class="wg-wrap" style="max-width:880px;text-align:center;position:relative;z-index:1;">
    <div class="wg-reveal">
      <div style="color:var(--accent);font-size:17px;margin-bottom:20px;">${'<i class="fa-solid fa-star"></i>'.repeat(5)}</div>
      <p class="wg-t2" style="color:#fff;font-weight:300;line-height:1.35;margin-bottom:26px;">„${txt('zitat', c.zitat, 'Die beste Entscheidung, die wir treffen konnten. Alles lief reibungslos.')}"</p>
      <div style="font-size:14.5px;font-weight:700;color:#fff;">${txt('name', c.name, 'A. Wagner')}</div>
      <div style="font-size:13px;color:rgba(255,255,255,.6);">${txt('rolle', c.rolle, 'Langjähriger Kunde')}</div>
    </div>
  </div>
</section>`
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// 6) CTA — mehrere kräftige Abschlüsse
// ═══════════════════════════════════════════════════════════════════════════
export const CTA_PLUS = {
  type: 'cta-plus',
  label: 'Call-to-Action (Premium)',
  variants: [
    {
      id: 'ctap-mesh', name: 'Dunkel & bewegt',
      render: (c) => `
<section data-block="cta-plus" data-variant="ctap-mesh" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:linear-gradient(160deg,var(--p900),#0d1b2a 70%);')}position:relative;overflow:hidden;text-align:center;">
  <div class="wg-mesh"><span class="wg-blob wg-blob-a"></span><span class="wg-blob wg-blob-b"></span><span class="wg-blob wg-blob-c"></span></div>
  <div class="wg-wrap" style="max-width:760px;position:relative;z-index:1;">
    <div class="wg-reveal">
      <h2 class="wg-t2" style="color:#fff;">${txt('title', c.title, 'Reden wir über Ihr Vorhaben')}</h2>
      <span class="wg-strichlinie mitte"></span>
      <div class="wg-lead" style="color:rgba(255,255,255,.78);margin-bottom:32px;">${txt('text', c.text, 'Ein kurzes Gespräch genügt – wir melden uns innerhalb von 24 Stunden bei Ihnen zurück.', 'span')}</div>
      <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">
        <a href="kontakt.html" class="wg-btn">${txt('cta1', c.cta1, 'Jetzt anfragen')}</a>
        <a href="tel:" class="wg-btn-leer hell">${txt('cta2', c.cta2, 'Anrufen')}</a>
      </div>
    </div>
  </div>
</section>`
    },
    {
      id: 'ctap-band', name: 'Schmales Band',
      render: (c) => `
<section data-block="cta-plus" data-variant="ctap-band" style="${bg(c, 'background:var(--accent);')}padding:clamp(30px,4vw,46px) 0;">
  <div class="wg-wrap">
    <div class="wg-reveal" style="display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;">
      <div>
        <div style="font-size:clamp(20px,2.4vw,28px);font-weight:800;color:#fff;letter-spacing:-.02em;">${txt('title', c.title, 'Noch Fragen? Wir sind für Sie da.')}</div>
        <div style="font-size:15px;color:rgba(255,255,255,.8);margin-top:4px;">${txt('text', c.text, 'Kostenlos und unverbindlich beraten lassen.', 'span')}</div>
      </div>
      <a href="kontakt.html" style="background:#fff;color:#0f172a;text-decoration:none;padding:15px 30px;border-radius:99px;font-weight:800;font-size:15px;white-space:nowrap;">${txt('cta1', c.cta1, 'Kontakt aufnehmen')}</a>
    </div>
  </div>
</section>`
    },
    {
      id: 'ctap-karte', name: 'Karte auf hellem Grund',
      render: (c) => `
<section data-block="cta-plus" data-variant="ctap-karte" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap">
    <div class="wg-reveal wg-karte" style="text-align:center;padding:clamp(34px,5vw,58px);box-shadow:0 26px 60px rgba(15,23,42,.1);">
      <div class="wg-iconchip" style="margin:0 auto 20px;"><i class="fa-solid fa-comments"></i></div>
      <h2 class="wg-t2" style="margin-bottom:12px;">${txt('title', c.title, 'Lassen Sie uns starten')}</h2>
      <div class="wg-lead" style="max-width:520px;margin:0 auto 28px;">${txt('text', c.text, 'Schildern Sie uns kurz Ihr Anliegen – den Rest übernehmen wir.', 'span')}</div>
      <a href="kontakt.html" class="wg-btn">${txt('cta1', c.cta1, 'Unverbindlich anfragen')}</a>
    </div>
  </div>
</section>`
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// 7) WEITERE BAUSTEINE
// ═══════════════════════════════════════════════════════════════════════════
export const TRENNER = {
  type: 'trenner',
  label: 'Trenner / Abstand',
  variants: [
    { id: 'trenner-linie', name: 'Feine Linie', render: (c) => `
<section data-block="trenner" data-variant="trenner-linie" style="padding:clamp(24px,4vw,52px) 0;background:${esc(c.bgColor || '#fff')};">
  <div class="wg-wrap"><div style="height:1px;background:rgba(15,23,42,.1);"></div></div>
</section>` },
    { id: 'trenner-akzent', name: 'Akzent-Strich', render: (c) => `
<section data-block="trenner" data-variant="trenner-akzent" style="padding:clamp(26px,4vw,54px) 0;background:${esc(c.bgColor || '#fff')};text-align:center;">
  <div class="wg-wrap"><span class="wg-reveal wg-strichlinie mitte" style="margin:0 auto;"></span></div>
</section>` },
    { id: 'trenner-luft', name: 'Nur Abstand', render: (c) => `
<section data-block="trenner" data-variant="trenner-luft" style="padding:clamp(30px,6vw,80px) 0;background:${esc(c.bgColor || '#fff')};"></section>` },
  ],
}

export const VIDEO = {
  type: 'video',
  label: 'Video',
  variants: [
    {
      id: 'video-breit', name: 'Großes Video',
      render: (c) => `
<section data-block="video" data-variant="video-breit" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    <div class="wg-reveal" style="text-align:center;margin-bottom:clamp(22px,3vw,38px);">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Video')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Sehen Sie selbst')}</h2>
      <span class="wg-strichlinie mitte"></span>
    </div>
    <div class="wg-reveal" style="border-radius:22px;overflow:hidden;box-shadow:0 26px 60px rgba(15,23,42,.16);aspect-ratio:16/9;background:#0f172a;">
      ${c.videoUrl
        ? `<iframe src="${esc(c.videoUrl)}" style="width:100%;height:100%;border:0;" allowfullscreen loading="lazy"></iframe>`
        : `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,.7);gap:12px;">
             <i class="fa-solid fa-play" style="font-size:40px;color:var(--accent);"></i>
             <span style="font-size:14px;" data-hinweis>Video-Link im Editor einfügen</span>
           </div>`}
    </div>
  </div>
</section>`
    },
  ],
}

export const BANNER = {
  type: 'banner',
  label: 'Hinweis-Banner',
  variants: [
    {
      id: 'banner-info', name: 'Hinweis mit Icon',
      render: (c) => `
<section data-block="banner" data-variant="banner-info" style="padding:clamp(18px,2.5vw,28px) 0;${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap">
    <div class="wg-reveal" style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;justify-content:center;text-align:center;">
      <div style="width:40px;height:40px;border-radius:11px;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${icon('bannerIcon', c.icon || 'circle-info')}</div>
      <span style="font-size:16px;font-weight:600;color:#0f172a;">${txt('text', c.text, 'Hier steht Ihre aktuelle Mitteilung – einfach anklicken und Text ersetzen.', 'span')}</span>
    </div>
  </div>
</section>`
    },
    {
      id: 'banner-laufband', name: 'Laufband',
      render: (c) => {
        const punkte = misch(c.punkte, ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4', 'Stichwort 5'])
        const zeile = (p, i, bearbeitbar) => `<span style="display:inline-flex;align-items:center;gap:10px;padding:0 26px;font-size:14px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#fff;white-space:nowrap;"><span style="width:6px;height:6px;border-radius:50%;background:var(--accent);"></span>${bearbeitbar ? ed(`punkte.${i}`, p) : `<span data-kopie="punkte.${i}">${esc(p)}</span>`}</span>`
        const reihe = punkte.map((p, i) => zeile(p, i, true)).join('')
        const reiheKopie = punkte.map((p, i) => zeile(p, i, false)).join('')
        return `
<section data-block="banner" data-variant="banner-laufband" style="${bg(c, 'background:var(--p900);')}padding:16px 0;overflow:hidden;">
  <div class="wg-laufband" style="display:flex;width:max-content;animation:wgLauf 26s linear infinite;">
    <div style="display:flex;">${reihe}</div><div style="display:flex;" aria-hidden="true">${reiheKopie}</div>
  </div>
  <style>@keyframes wgLauf{from{transform:translateX(0)}to{transform:translateX(-50%)}}</style>
</section>`
      }
    },
  ],
}

export const KONTAKT_PLUS = {
  type: 'kontakt-plus',
  label: 'Kontakt (Premium)',
  variants: [
    {
      id: 'kontaktp-split', name: 'Formular & Infokarten',
      render: (c) => `
<section data-block="kontakt-plus" data-variant="kontaktp-split" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    <div class="wg-reveal" style="margin-bottom:clamp(26px,4vw,44px);max-width:620px;">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Kontakt')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'So erreichen Sie uns')}</h2>
      <span class="wg-strichlinie"></span>
      <div class="wg-lead">${txt('text', c.text, 'Rufen Sie an oder schreiben Sie uns – wir melden uns zeitnah zurück.', 'span')}</div>
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(22px,4vw,44px);align-items:start;">
      <form class="wg-reveal li" data-contact-form style="display:grid;gap:14px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
          <input name="name" required placeholder="Ihr Name *" style="border:2px solid rgba(15,23,42,.1);border-radius:12px;padding:14px 16px;font-size:15px;font-family:inherit;outline:none;">
          <input name="email" type="email" required placeholder="E-Mail *" style="border:2px solid rgba(15,23,42,.1);border-radius:12px;padding:14px 16px;font-size:15px;font-family:inherit;outline:none;">
        </div>
        <input name="telefon" placeholder="Telefon" style="border:2px solid rgba(15,23,42,.1);border-radius:12px;padding:14px 16px;font-size:15px;font-family:inherit;outline:none;">
        <textarea name="nachricht" required rows="5" placeholder="Ihre Nachricht *" style="border:2px solid rgba(15,23,42,.1);border-radius:12px;padding:14px 16px;font-size:15px;font-family:inherit;outline:none;resize:vertical;"></textarea>
        <button type="submit" class="wg-btn" style="justify-content:center;">${txt('cta', c.cta, 'Nachricht senden')}</button>
      </form>
      <div class="wg-reveal re" style="display:grid;gap:12px;transition-delay:.1s;">
        ${[['location-dot', 'Adresse', 'adresse', c.adresse || 'Musterstraße 1, 10115 Berlin'],
           ['phone', 'Telefon', 'telefon', c.telefon || '+49 30 1234567'],
           ['envelope', 'E-Mail', 'email', c.email || 'info@beispiel.de'],
           ['clock', 'Öffnungszeiten', 'oeffnung', c.oeffnung || 'Mo–Fr 9–18 Uhr']]
          .map(([ic, label, feld, wert], i) => `<div class="wg-karte" style="display:flex;align-items:center;gap:15px;padding:18px 20px;">
            <div style="width:42px;height:42px;border-radius:11px;background:var(--p100);color:var(--p700);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;"><i class="fa-solid fa-${ic}"></i></div>
            <div style="min-width:0;">
              <div style="font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;">${ed('lbl_' + feld, c['lbl_' + feld] || label)}</div>
              <div style="font-size:15px;font-weight:600;color:#0f172a;">${ed(feld, wert)}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  </div>
</section>`
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRIERUNG
// ═══════════════════════════════════════════════════════════════════════════
export const ZUSATZ_BLOECKE = {
  media: MEDIA,
  text: TEXT,
  features: FEATURES,
  galerie: GALERIE,
  stimmen: STIMMEN,
  'cta-plus': CTA_PLUS,
  'kontakt-plus': KONTAKT_PLUS,
  trenner: TRENNER,
  video: VIDEO,
  banner: BANNER,
}

// Für die Editor-Bibliothek (linke Spalte)
export const ZUSATZ_ADDABLE = [
  { type: 'media', label: 'Bild & Text', fa: 'image', cat: 'Inhalt' },
  { type: 'text', label: 'Textbereich', fa: 'align-left', cat: 'Inhalt' },
  { type: 'features', label: 'Leistungen Premium', fa: 'grip', cat: 'Inhalt' },
  { type: 'galerie', label: 'Galerie Premium', fa: 'images', cat: 'Inhalt' },
  { type: 'video', label: 'Video', fa: 'play', cat: 'Inhalt' },
  { type: 'trenner', label: 'Trenner / Abstand', fa: 'minus', cat: 'Inhalt' },
  { type: 'stimmen', label: 'Kundenstimmen Premium', fa: 'quote-left', cat: 'Vertrauen' },
  { type: 'banner', label: 'Hinweis-Banner', fa: 'bullhorn', cat: 'Vertrauen' },
  { type: 'cta-plus', label: 'Call-to-Action Premium', fa: 'bullseye', cat: 'Konversion' },
  { type: 'kontakt-plus', label: 'Kontakt Premium', fa: 'envelope-open-text', cat: 'Konversion' },
]

// Standard-Inhalte für neu eingefügte Blöcke (Editor)
export const ZUSATZ_DEFAULTS = {
  media: { tag: 'Über uns', title: 'Worauf Sie sich verlassen können', text: LOREM.absatz, cta: 'Mehr erfahren', punkte: ['Punkt 1 eintragen', 'Punkt 2 eintragen', 'Punkt 3 eintragen'] },
  text: { tag: 'Was uns antreibt', title: 'Gute Arbeit spricht für sich', text: LOREM.lang, zitat: 'Wir behandeln jedes Projekt so, als wäre es unser eigenes.', autor: 'Die Geschäftsführung' },
  features: { tag: 'Leistungen', title: 'Das können wir für Sie tun', items: [
    { icon: 'bolt', title: 'Schnell vor Ort', text: LOREM.kurz },
    { icon: 'shield-halved', title: 'Sauber gearbeitet', text: LOREM.kurz },
    { icon: 'handshake', title: 'Fair beraten', text: LOREM.kurz },
  ] },
  galerie: { tag: 'Galerie', title: 'Einblicke in unsere Arbeit', images: ['', '', '', '', '', ''] },
  stimmen: { tag: 'Kundenstimmen', title: 'Das sagen unsere Kunden', items: [
    { text: 'Hier steht später eine echte Kundenstimme.', name: 'Kundenname', rolle: 'Kunde' },
    { text: 'Hier steht später eine echte Kundenstimme.', name: 'Kundenname', rolle: 'Kunde' },
  ] },
  'cta-plus': { title: 'Reden wir über Ihr Vorhaben', text: 'Ein kurzes Gespräch genügt.', cta1: 'Jetzt anfragen', cta2: 'Anrufen' },
  'kontakt-plus': { tag: 'Kontakt', title: 'So erreichen Sie uns', cta: 'Nachricht senden' },
  trenner: {},
  video: { tag: 'Video', title: 'Sehen Sie selbst' },
  banner: { text: 'Hier steht Ihre aktuelle Mitteilung.', icon: 'circle-info', punkte: ['Stichwort 1', 'Stichwort 2', 'Stichwort 3'] },
}
