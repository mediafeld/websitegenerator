import { sektionBg } from './sektionBg'
// ═══════════════════════════════════════════════════════════════════════════
// BAUSTEIN-BIBLIOTHEK — TEIL 2
// Kickstart · Step Box · Image Box · Icon Box · Heading · Counter · List
// Price List · Pricing Table · Team Grid · Text Box (frei) · Working Hours
// FAQ · Karte (OpenStreetMap) · Slider/Karussells · Site Parts
//
// Reines HTML/CSS/JS. Farben über --p50…--p900 / --accent. Optik: .wg-* aus
// lib/generatorDesign.js. Editor: data-edit / data-img / data-icon.
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

const fa = (v) => { if (!v) return 'star'; v = String(v).trim(); if (v.indexOf('fa-') === 0) v = v.slice(3); return v.replace(/[^a-z0-9-]/gi, '') || 'star' }
const icon = (key, name) => `<i data-icon="${key}" class="fa-solid fa-${fa(name)}" style="line-height:1;cursor:pointer;"></i>`

import { LOREM, platzhalterBild } from './blocksPlus'

const bild = (key, src, stil = '', n = 1) => `<img data-img="${key}" src="${esc(src || platzhalterBild(n))}" alt="" style="${stil}">`
const txt = (key, val, fallback, tag) => ed(key, (val && String(val).trim()) ? val : fallback, tag)

function bg(c = {}, fallback = '') { return sektionBg(c, fallback) }

// Kopfbereich einer Sektion (Eyebrow + Titel + Strich) – überall gleich aufgebaut
const kopf = (c, dTag, dTitle, mitte = true) => `
  <div class="wg-reveal" style="${mitte ? 'text-align:center;' : ''}margin-bottom:clamp(28px,4vw,50px);${mitte ? 'max-width:720px;margin-left:auto;margin-right:auto;' : 'max-width:660px;'}">
    <span class="wg-eyebrow">${txt('tag', c.tag, dTag)}</span>
    <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, dTitle)}</h2>
    <span class="wg-strichlinie${mitte ? ' mitte' : ''}"></span>
    ${c.subtitle ? `<div class="wg-lead">${ed('subtitle', c.subtitle)}</div>` : ''}
  </div>`

// ═══════════════════════════════════════════════════════════════════════════
// KICKSTART — der Einstieg direkt unter dem Hero
// ═══════════════════════════════════════════════════════════════════════════
export const KICKSTART = {
  type: 'kickstart', label: 'Kickstart / Einstieg',
  variants: [
    {
      id: 'kick-drei', name: 'Dreispaltiger Einstieg',
      render: (c) => {
        const items = misch(c.items, [
          { icon: 'phone', title: 'Anrufen', text: 'Kurz schildern, worum es geht.' },
          { icon: 'calendar-check', title: 'Termin', text: 'Wir kommen vorbei und schauen es uns an.' },
          { icon: 'thumbs-up', title: 'Erledigt', text: 'Saubere Arbeit, fairer Festpreis.' },
        ])
        return `
<section data-block="kickstart" data-variant="kick-drei" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    <div class="wg-split" style="display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(26px,4vw,60px);align-items:center;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'So einfach geht es')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'In drei Schritten zum Ergebnis')}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead">${txt('text', c.text, LOREM.absatz, 'span')}</div>
      </div>
      <div class="wg-reveal re" style="display:grid;gap:14px;transition-delay:.1s;">
        ${items.map((it, i) => `<div class="wg-karte wg-karte-hover" style="display:flex;align-items:flex-start;gap:16px;padding:20px 22px;">
          <div class="wg-iconchip" style="width:44px;height:44px;font-size:17px;flex-shrink:0;">${icon(`items.${i}.icon`, it.icon)}</div>
          <div><h3 style="font-size:16.5px;font-weight:700;color:#0f172a;margin-bottom:4px;">${ed(`items.${i}.title`, it.title)}</h3>
          <div style="font-size:14px;color:#64748b;line-height:1.6;">${ed(`items.${i}.text`, it.text)}</div></div>
        </div>`).join('')}
      </div>
    </div>
  </div>
</section>`
      }
    },
    {
      id: 'kick-band', name: 'Vorteilsband',
      render: (c) => {
        const items = misch(c.items, [
          { icon: 'clock', title: 'Schnell erreichbar' }, { icon: 'shield-halved', title: 'Versichert & geprüft' },
          { icon: 'euro-sign', title: 'Festpreis-Garantie' }, { icon: 'star', title: 'Top bewertet' },
        ])
        return `
<section data-block="kickstart" data-variant="kick-band" style="${bg(c, 'background:var(--p50);')}padding:clamp(24px,3.5vw,40px) 0;">
  <div class="wg-wrap">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;">
      ${items.map((it, i) => `<div class="wg-reveal" style="display:flex;align-items:center;gap:13px;transition-delay:${i * 70}ms;">
        <div style="width:42px;height:42px;border-radius:11px;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${icon(`items.${i}.icon`, it.icon)}</div>
        <span style="font-size:15px;font-weight:700;color:#0f172a;">${ed(`items.${i}.title`, it.title)}</span>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP BOX — Ablauf/Schritte
// ═══════════════════════════════════════════════════════════════════════════
export const STEPBOX = {
  type: 'stepbox', label: 'Schritte / Ablauf',
  variants: [
    {
      id: 'step-waagerecht', name: 'Waagerecht mit Linie',
      render: (c) => {
        const items = misch(c.items, [
          { icon: 'comments', title: 'Beratung', text: LOREM.kurz },
          { icon: 'pen-ruler', title: 'Planung', text: LOREM.kurz },
          { icon: 'screwdriver-wrench', title: 'Umsetzung', text: LOREM.kurz },
          { icon: 'circle-check', title: 'Abnahme', text: LOREM.kurz },
        ])
        return `
<section data-block="stepbox" data-variant="step-waagerecht" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    ${kopf(c, 'Ablauf', 'So läuft die Zusammenarbeit')}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:22px;position:relative;">
      ${items.map((it, i) => `<div class="wg-reveal" style="text-align:center;position:relative;transition-delay:${i * 90}ms;">
        ${i < items.length - 1 ? `<div class="wg-hide-mob" style="position:absolute;top:32px;left:calc(50% + 42px);right:calc(-50% + 42px);height:2px;background:repeating-linear-gradient(90deg,var(--p200) 0 7px,transparent 7px 14px);"></div>` : ''}
        <div style="width:64px;height:64px;border-radius:50%;background:var(--p50);border:2px solid var(--p200);color:var(--p700);display:flex;align-items:center;justify-content:center;font-size:22px;margin:0 auto 16px;position:relative;z-index:1;">${icon(`items.${i}.icon`, it.icon)}</div>
        <div style="display:inline-block;font-size:11px;font-weight:800;letter-spacing:.12em;color:var(--accent);margin-bottom:7px;">${ed(`items.${i}.schritt`, it.schritt || ('Schritt ' + (i + 1)))}</div>
        <h3 style="font-size:17.5px;font-weight:700;color:#0f172a;margin-bottom:7px;">${ed(`items.${i}.title`, it.title)}</h3>
        <div style="font-size:14px;color:#64748b;line-height:1.65;max-width:250px;margin:0 auto;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
    {
      id: 'step-zeitstrahl', name: 'Zeitstrahl senkrecht',
      render: (c) => {
        const items = misch(c.items, [
          { title: 'Erstkontakt', text: LOREM.satz }, { title: 'Vor-Ort-Termin', text: LOREM.satz },
          { title: 'Angebot', text: LOREM.satz }, { title: 'Ausführung', text: LOREM.satz },
        ])
        return `
<section data-block="stepbox" data-variant="step-zeitstrahl" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap" style="max-width:820px;">
    ${kopf(c, 'Ablauf', 'Von der Anfrage bis zur Übergabe')}
    <div style="position:relative;padding-left:52px;">
      <div style="position:absolute;left:19px;top:8px;bottom:8px;width:2px;background:var(--p200);"></div>
      ${items.map((it, i) => `<div class="wg-reveal" style="position:relative;padding-bottom:${i === items.length - 1 ? 0 : '32px'};transition-delay:${i * 80}ms;">
        <div style="position:absolute;left:-52px;top:0;width:40px;height:40px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;">${i + 1}</div>
        <h3 class="wg-t3" style="font-size:20px;margin-bottom:6px;">${ed(`items.${i}.title`, it.title)}</h3>
        <div class="wg-lead" style="font-size:15px;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// IMAGE BOX / ICON BOX
// ═══════════════════════════════════════════════════════════════════════════
export const IMAGEBOX = {
  type: 'imagebox', label: 'Bild-Boxen',
  variants: [
    {
      id: 'imgbox-karten', name: 'Bildkarten',
      render: (c) => {
        const items = misch(c.items, [
          { title: 'Innenreinigung', text: LOREM.kurz }, { title: 'Außenanlagen', text: LOREM.kurz }, { title: 'Sonderreinigung', text: LOREM.kurz },
        ])
        return `
<section data-block="imagebox" data-variant="imgbox-karten" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    ${kopf(c, 'Bereiche', 'Was wir übernehmen')}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px;">
      ${items.map((it, i) => `<div class="wg-reveal wg-karte wg-karte-hover" style="padding:0;overflow:hidden;transition-delay:${i * 80}ms;">
        <div class="wg-bildbox" style="border-radius:0;height:210px;">${bild(`items.${i}.image`, it.image, '', i + 1)}</div>
        <div style="padding:22px 24px;">
          <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:8px;">${ed(`items.${i}.title`, it.title)}</h3>
          <div style="font-size:14.5px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
    {
      id: 'imgbox-overlay', name: 'Bild mit Text darüber',
      render: (c) => {
        const items = misch(c.items, [
          { title: 'Büroreinigung', text: 'Täglich oder wöchentlich' }, { title: 'Treppenhaus', text: 'Zuverlässig nach Plan' }, { title: 'Glasflächen', text: 'Streifenfrei sauber' },
        ])
        return `
<section data-block="imagebox" data-variant="imgbox-overlay" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap">
    ${kopf(c, 'Leistungen', 'Unsere Schwerpunkte')}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;">
      ${items.map((it, i) => `<div class="wg-reveal wg-bildbox" style="height:330px;position:relative;transition-delay:${i * 80}ms;">
        ${bild(`items.${i}.image`, it.image, '', i + 2)}
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,20,32,.05),rgba(10,20,32,.82));"></div>
        <div style="position:absolute;left:0;right:0;bottom:0;padding:24px;">
          <h3 style="font-size:20px;font-weight:700;color:#fff;margin-bottom:5px;">${ed(`items.${i}.title`, it.title)}</h3>
          <div style="font-size:14px;color:rgba(255,255,255,.78);">${ed(`items.${i}.text`, it.text)}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
  ],
}

export const ICONBOX = {
  type: 'iconbox', label: 'Icon-Boxen',
  variants: [
    {
      id: 'iconbox-raster', name: 'Icon-Raster',
      render: (c) => {
        const items = misch(c.items, [
          { icon: 'bolt', title: 'Schnell', text: LOREM.kurz }, { icon: 'shield-halved', title: 'Sicher', text: LOREM.kurz },
          { icon: 'handshake', title: 'Fair', text: LOREM.kurz }, { icon: 'medal', title: 'Geprüft', text: LOREM.kurz },
          { icon: 'clock', title: 'Pünktlich', text: LOREM.kurz }, { icon: 'heart', title: 'Persönlich', text: LOREM.kurz },
        ])
        return `
<section data-block="iconbox" data-variant="iconbox-raster" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    ${kopf(c, 'Vorteile', 'Warum Kunden uns wählen')}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:26px;">
      ${items.map((it, i) => `<div class="wg-reveal" style="text-align:center;transition-delay:${i * 60}ms;">
        <div style="width:58px;height:58px;border-radius:16px;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:21px;margin-bottom:14px;">${icon(`items.${i}.icon`, it.icon)}</div>
        <h3 style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:7px;">${ed(`items.${i}.title`, it.title)}</h3>
        <div style="font-size:14px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
    {
      id: 'iconbox-links', name: 'Icon links, Text rechts',
      render: (c) => {
        const items = misch(c.items, [
          { icon: 'certificate', title: 'Meisterbetrieb', text: LOREM.satz }, { icon: 'truck-fast', title: 'Schnell vor Ort', text: LOREM.satz },
          { icon: 'euro-sign', title: 'Transparente Preise', text: LOREM.satz }, { icon: 'headset', title: 'Fester Ansprechpartner', text: LOREM.satz },
        ])
        return `
<section data-block="iconbox" data-variant="iconbox-links" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap">
    ${kopf(c, 'Unsere Stärken', 'Darauf können Sie zählen', false)}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:26px;">
      ${items.map((it, i) => `<div class="wg-reveal" style="display:flex;gap:17px;align-items:flex-start;transition-delay:${i * 70}ms;">
        <div class="wg-iconchip" style="flex-shrink:0;">${icon(`items.${i}.icon`, it.icon)}</div>
        <div><h3 style="font-size:17.5px;font-weight:700;color:#0f172a;margin-bottom:6px;">${ed(`items.${i}.title`, it.title)}</h3>
        <div style="font-size:14.5px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div></div>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// HEADING — reiner Überschriften-Block
// ═══════════════════════════════════════════════════════════════════════════
export const HEADING = {
  type: 'heading', label: 'Überschrift',
  variants: [
    { id: 'head-mitte', name: 'Zentriert', render: (c) => `
<section data-block="heading" data-variant="head-mitte" style="${bg(c, 'background:#fff;')}padding:clamp(40px,6vw,80px) 0 clamp(10px,2vw,20px);">
  <div class="wg-wrap" style="text-align:center;max-width:780px;">
    <div class="wg-reveal">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Abschnitt')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Eine klare Überschrift')}</h2>
      <span class="wg-strichlinie mitte"></span>
      ${c.subtitle ? `<div class="wg-lead">${ed('subtitle', c.subtitle)}</div>` : ''}
    </div>
  </div>
</section>` },
    { id: 'head-links', name: 'Linksbündig', render: (c) => `
<section data-block="heading" data-variant="head-links" style="${bg(c, 'background:#fff;')}padding:clamp(40px,6vw,80px) 0 clamp(10px,2vw,20px);">
  <div class="wg-wrap">
    <div class="wg-reveal" style="max-width:680px;">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Abschnitt')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Eine klare Überschrift')}</h2>
      <span class="wg-strichlinie"></span>
    </div>
  </div>
</section>` },
    { id: 'head-gross', name: 'Riesig (Statement)', render: (c) => `
<section data-block="heading" data-variant="head-gross" style="${bg(c, 'background:#fff;')}padding:clamp(50px,8vw,110px) 0;">
  <div class="wg-wrap">
    <h2 class="wg-reveal wg-t1" style="max-width:1000px;">${txt('title', c.title, 'Große Worte für große Vorhaben.')}</h2>
  </div>
</section>` },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// COUNTER — hochzählende Zahlen
// ═══════════════════════════════════════════════════════════════════════════
export const COUNTER = {
  type: 'counter', label: 'Zahlen / Counter',
  variants: [
    {
      id: 'count-hell', name: 'Heller Balken',
      render: (c) => {
        const items = misch(c.items, [
          { num: '1200', suffix: '+', label: 'Betreute Objekte' }, { num: '18', suffix: '', label: 'Jahre Erfahrung' },
          { num: '45', suffix: '', label: 'Mitarbeiter' }, { num: '99', suffix: '%', label: 'Weiterempfehlung' },
        ])
        return `
<section data-block="counter" data-variant="count-hell" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px;text-align:center;">
      ${items.map((it, i) => `<div class="wg-reveal" style="transition-delay:${i * 80}ms;">
        <div class="wg-stat-num" style="font-size:clamp(36px,4.6vw,54px);"><span data-zahl="${esc(it.num)}">0</span>${esc(it.suffix || '')}</div>
        <div class="wg-stat-lab" style="font-size:14px;margin-top:7px;">${ed(`items.${i}.label`, it.label)}</div>
      </div>`).join('')}
    </div>
  </div>
  ${ZAEHL_JS}
</section>`
      }
    },
    {
      id: 'count-dunkel', name: 'Dunkler Balken',
      render: (c) => {
        const items = misch(c.items, [
          { num: '1200', suffix: '+', label: 'Betreute Objekte' }, { num: '18', suffix: '', label: 'Jahre Erfahrung' },
          { num: '99', suffix: '%', label: 'Weiterempfehlung' },
        ])
        return `
<section data-block="counter" data-variant="count-dunkel" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:linear-gradient(160deg,var(--p900),#0d1b2a 70%);')}position:relative;overflow:hidden;">
  <div class="wg-mesh"><span class="wg-blob wg-blob-b"></span></div>
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:26px;text-align:center;">
      ${items.map((it, i) => `<div class="wg-reveal" style="transition-delay:${i * 80}ms;">
        <div style="font-size:clamp(38px,5vw,62px);font-weight:200;color:#fff;letter-spacing:-.03em;line-height:1;"><span data-zahl="${esc(it.num)}">0</span>${esc(it.suffix || '')}</div>
        <div style="font-size:13.5px;color:rgba(255,255,255,.62);margin-top:9px;">${ed(`items.${i}.label`, it.label)}</div>
      </div>`).join('')}
    </div>
  </div>
  ${ZAEHL_JS}
</section>`
      }
    },
  ],
}

// Hochzähl-Effekt (einmal pro Seite genügt, doppeltes Einbinden schadet nicht)
const ZAEHL_JS = `<script>
(function(){
  if(window.__wgZaehl)return; window.__wgZaehl=1;
  function start(el){
    var ziel=parseFloat(el.getAttribute('data-zahl'))||0, t0=null, dauer=1500;
    function tick(t){ if(!t0)t0=t; var p=Math.min((t-t0)/dauer,1); var e=1-Math.pow(1-p,3);
      el.textContent=Math.round(ziel*e).toLocaleString('de-DE'); if(p<1)requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
  }
  function init(){
    var els=document.querySelectorAll('[data-zahl]');
    if(!('IntersectionObserver' in window)){els.forEach(function(e){start(e)});return;}
    var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){start(x.target);io.unobserve(x.target);}})},{threshold:.4});
    els.forEach(function(e){io.observe(e)});
  }
  if(document.readyState!=='loading')init(); else document.addEventListener('DOMContentLoaded',init);
})();
</script>`

// ═══════════════════════════════════════════════════════════════════════════
// LIST — Aufzählungen
// ═══════════════════════════════════════════════════════════════════════════
export const LISTE = {
  type: 'liste', label: 'Liste / Aufzählung',
  variants: [
    {
      id: 'list-haken', name: 'Häkchenliste (2 Spalten)',
      render: (c) => {
        const items = misch(c.items, [
          'Unterhaltsreinigung', 'Grundreinigung', 'Fensterreinigung', 'Treppenhausreinigung',
          'Bauabschlussreinigung', 'Winterdienst', 'Grünpflege', 'Hausmeisterservice',
        ])
        return `
<section data-block="liste" data-variant="list-haken" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    ${kopf(c, 'Leistungen', 'Alles auf einen Blick', false)}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px 30px;">
      ${items.map((it, i) => `<div class="wg-reveal" style="display:flex;align-items:center;gap:13px;padding:13px 0;border-bottom:1px solid rgba(15,23,42,.07);transition-delay:${i * 40}ms;">
        <span style="width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;"><i class="fa-solid fa-check"></i></span>
        <span style="font-size:15.5px;color:#334155;font-weight:500;">${ed(`items.${i}`, it)}</span>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
    {
      id: 'list-nummern', name: 'Nummerierte Liste',
      render: (c) => {
        const items = misch(c.items, ['Erstgespräch und Bestandsaufnahme', 'Angebot mit Festpreis', 'Terminabstimmung', 'Ausführung durch unser Team', 'Gemeinsame Abnahme'])
        return `
<section data-block="liste" data-variant="list-nummern" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap" style="max-width:820px;">
    ${kopf(c, 'Vorgehen', 'Schritt für Schritt')}
    <div>
      ${items.map((it, i) => `<div class="wg-reveal" style="display:flex;align-items:center;gap:20px;padding:18px 0;border-bottom:1px solid rgba(15,23,42,.08);transition-delay:${i * 60}ms;">
        <span style="font-size:26px;font-weight:200;color:var(--accent);min-width:44px;">${String(i + 1).padStart(2, '0')}</span>
        <span style="font-size:17px;color:#0f172a;font-weight:500;">${ed(`items.${i}`, it)}</span>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// PRICE LIST (Leistungen mit Preis) & PRICING TABLE (Pakete)
// ═══════════════════════════════════════════════════════════════════════════
export const PRICELIST = {
  type: 'pricelist', label: 'Preisliste',
  variants: [
    {
      id: 'plist-zeilen', name: 'Zeilen mit Preis',
      render: (c) => {
        const gruppen = misch(c.gruppen, [
          { name: 'Reinigung', items: [
            { name: 'Unterhaltsreinigung', desc: 'pro Stunde, inkl. Material', preis: 'ab 29,00 €' },
            { name: 'Grundreinigung', desc: 'pro m², nach Aufwand', preis: 'ab 3,50 €' },
            { name: 'Fensterreinigung', desc: 'pro Fenster beidseitig', preis: 'ab 6,00 €' },
          ] },
          { name: 'Außenbereich', items: [
            { name: 'Grünpflege', desc: 'pro Stunde', preis: 'ab 35,00 €' },
            { name: 'Winterdienst', desc: 'pro Einsatz', preis: 'auf Anfrage' },
          ] },
        ])
        return `
<section data-block="pricelist" data-variant="plist-zeilen" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap" style="max-width:880px;">
    ${kopf(c, 'Preise', 'Was kostet was?')}
    ${gruppen.map((g, gi) => `<div class="wg-reveal" style="margin-bottom:34px;transition-delay:${gi * 90}ms;">
      <h3 style="font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:14px;">${ed(`gruppen.${gi}.name`, g.name)}</h3>
      ${(g.items || []).map((it, i) => `<div style="display:flex;align-items:baseline;gap:14px;padding:14px 0;border-bottom:1px dashed rgba(15,23,42,.14);">
        <div style="flex-shrink:0;">
          <div style="font-size:16.5px;font-weight:700;color:#0f172a;">${ed(`gruppen.${gi}.items.${i}.name`, it.name)}</div>
          <div style="font-size:13.5px;color:#94a3b8;">${ed(`gruppen.${gi}.items.${i}.desc`, it.desc)}</div>
        </div>
        <div style="flex:1;border-bottom:1px dotted rgba(15,23,42,.18);transform:translateY(-4px);"></div>
        <div style="font-size:17px;font-weight:800;color:var(--accent);white-space:nowrap;">${ed(`gruppen.${gi}.items.${i}.preis`, it.preis)}</div>
      </div>`).join('')}
    </div>`).join('')}
    <div style="font-size:12.5px;color:#94a3b8;text-align:center;">${txt('hinweis', c.hinweis, 'Alle Preise inkl. gesetzlicher MwSt. Endpreis nach Aufmaß vor Ort.', 'span')}</div>
  </div>
</section>`
      }
    },
  ],
}

export const PRICINGTABLE = {
  type: 'pricingtable', label: 'Preistabelle / Pakete',
  variants: [
    {
      id: 'ptab-drei', name: 'Drei Pakete',
      render: (c) => {
        const pakete = misch(c.pakete, [
          { name: 'Basis', preis: '149', einheit: '€ / Monat', punkte: ['Wöchentliche Reinigung', 'Material inklusive', 'Fester Ansprechpartner'], cta: 'Anfragen' },
          { name: 'Komfort', preis: '279', einheit: '€ / Monat', beliebt: true, punkte: ['2× wöchentlich', 'Material inklusive', 'Fensterreinigung quartalsweise', 'Vorrangiger Support'], cta: 'Anfragen' },
          { name: 'Rundum', preis: '449', einheit: '€ / Monat', punkte: ['Täglich', 'Material inklusive', 'Fenster & Außenanlagen', 'Winterdienst', '24/7 erreichbar'], cta: 'Anfragen' },
        ])
        return `
<section data-block="pricingtable" data-variant="ptab-drei" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap">
    ${kopf(c, 'Pakete', 'Für jeden Bedarf das Richtige')}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:20px;align-items:stretch;">
      ${pakete.map((p, i) => `<div class="wg-reveal ${p.beliebt ? '' : 'wg-karte-hover'}" style="position:relative;border-radius:20px;padding:32px 28px;display:flex;flex-direction:column;transition-delay:${i * 90}ms;${p.beliebt
          ? 'background:linear-gradient(160deg,var(--p900),#0d1b2a);color:#fff;box-shadow:0 30px 64px rgba(15,23,42,.24);'
          : 'background:#fff;border:1px solid rgba(15,23,42,.09);'}">
        ${p.beliebt ? `<div style="position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;font-size:11px;font-weight:800;letter-spacing:.08em;padding:6px 16px;border-radius:99px;white-space:nowrap;">${ed(`pakete.${i}.hinweis`, p.hinweis || 'BELIEBT')}</div>` : ''}
        <div style="font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:${p.beliebt ? 'var(--accent)' : 'var(--p600)'};margin-bottom:12px;">${ed(`pakete.${i}.name`, p.name)}</div>
        <div style="display:flex;align-items:baseline;gap:7px;margin-bottom:6px;">
          <span style="font-size:clamp(38px,4.4vw,52px);font-weight:200;letter-spacing:-.03em;color:${p.beliebt ? '#fff' : '#0f172a'};">${ed(`pakete.${i}.preis`, p.preis)}</span>
          <span style="font-size:14px;color:${p.beliebt ? 'rgba(255,255,255,.6)' : '#94a3b8'};">${ed(`pakete.${i}.einheit`, p.einheit)}</span>
        </div>
        <div style="height:1px;background:${p.beliebt ? 'rgba(255,255,255,.16)' : 'rgba(15,23,42,.09)'};margin:18px 0 20px;"></div>
        <ul style="list-style:none;padding:0;margin:0 0 26px;display:grid;gap:11px;flex:1;">
          ${(p.punkte || []).map((pt, j) => `<li style="display:flex;align-items:flex-start;gap:11px;font-size:14.5px;color:${p.beliebt ? 'rgba(255,255,255,.82)' : '#475569'};">
            <i class="fa-solid fa-check" style="color:var(--accent);font-size:11px;margin-top:5px;flex-shrink:0;"></i>${ed(`pakete.${i}.punkte.${j}`, pt)}</li>`).join('')}
        </ul>
        <a href="kontakt.html" class="${p.beliebt ? 'wg-btn' : 'wg-btn-leer'}" style="justify-content:center;width:100%;">${ed(`pakete.${i}.cta`, p.cta)}</a>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// TEAM GRID
// ═══════════════════════════════════════════════════════════════════════════
export const TEAMGRID = {
  type: 'teamgrid', label: 'Team',
  variants: [
    {
      id: 'team-karten', name: 'Karten mit Foto',
      render: (c) => {
        const items = misch(c.items, [
          { name: 'Sabine Krause', rolle: 'Geschäftsführung', text: 'Seit 2008 im Betrieb.' },
          { name: 'Marek Nowak', rolle: 'Objektleitung', text: 'Ihr Ansprechpartner vor Ort.' },
          { name: 'Lena Fischer', rolle: 'Disposition', text: 'Plant Ihre Termine.' },
        ])
        return `
<section data-block="teamgrid" data-variant="team-karten" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    ${kopf(c, 'Team', 'Die Menschen dahinter')}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
      ${items.map((m, i) => `<div class="wg-reveal wg-karte wg-karte-hover" style="padding:0;overflow:hidden;text-align:center;transition-delay:${i * 80}ms;">
        <div class="wg-bildbox" style="border-radius:0;height:280px;">${bild(`items.${i}.image`, m.image, '', i + 1)}</div>
        <div style="padding:22px;">
          <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:3px;">${ed(`items.${i}.name`, m.name)}</h3>
          <div style="font-size:13px;font-weight:700;color:var(--accent);letter-spacing:.05em;text-transform:uppercase;margin-bottom:9px;">${ed(`items.${i}.rolle`, m.rolle)}</div>
          <div style="font-size:14px;color:#64748b;line-height:1.6;">${ed(`items.${i}.text`, m.text)}</div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
    {
      id: 'team-rund', name: 'Runde Portraits',
      render: (c) => {
        const items = misch(c.items, [
          { name: 'Sabine Krause', rolle: 'Geschäftsführung' }, { name: 'Marek Nowak', rolle: 'Objektleitung' },
          { name: 'Lena Fischer', rolle: 'Disposition' }, { name: 'Tom Weber', rolle: 'Technik' },
        ])
        return `
<section data-block="teamgrid" data-variant="team-rund" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap">
    ${kopf(c, 'Team', 'Ihre Ansprechpartner')}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:28px;text-align:center;">
      ${items.map((m, i) => `<div class="wg-reveal" style="transition-delay:${i * 70}ms;">
        <div class="wg-bildbox" style="width:150px;height:150px;border-radius:50%;margin:0 auto 16px;">${bild(`items.${i}.image`, m.image, '', i + 2)}</div>
        <h3 style="font-size:16.5px;font-weight:700;color:#0f172a;margin-bottom:3px;">${ed(`items.${i}.name`, m.name)}</h3>
        <div style="font-size:13px;color:#94a3b8;">${ed(`items.${i}.rolle`, m.rolle)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// TEXT BOX — freier Block: WYSIWYG-Inhalt ODER eigenes HTML/CSS/JS
// ═══════════════════════════════════════════════════════════════════════════
export const TEXTBOX = {
  type: 'textbox', label: 'Freier Textblock (HTML/CSS/JS)',
  variants: [
    {
      id: 'tbox-frei', name: 'Freier Inhalt',
      render: (c) => `
<section data-block="textbox" data-variant="tbox-frei" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  ${c.css ? `<style>${c.css}</style>` : ''}
  <div class="wg-wrap" style="max-width:${esc(c.breite || '860px')};">
    <div class="wg-reveal wg-freitext" data-html="inhalt" data-edit="html" style="outline:none;">
      ${c.html || `<h2 class="wg-t2">Freier Textblock</h2>
      <span class="wg-strichlinie"></span>
      <p class="wg-lead">Diesen Bereich kannst du im Editor komplett frei gestalten – mit dem Text-Editor oder direkt mit eigenem HTML, CSS und JavaScript.</p>`}
    </div>
  </div>
  ${c.js ? `<script>${c.js}</script>` : ''}
</section>`
    },
    {
      id: 'tbox-karte', name: 'Freier Inhalt in Karte',
      render: (c) => `
<section data-block="textbox" data-variant="tbox-karte" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  ${c.css ? `<style>${c.css}</style>` : ''}
  <div class="wg-wrap" style="max-width:${esc(c.breite || '900px')};">
    <div class="wg-reveal wg-karte wg-freitext" data-html="inhalt" data-edit="html" style="padding:clamp(26px,4vw,46px);outline:none;">
      ${c.html || `<h2 class="wg-t3">Eigener Inhalt</h2><p class="wg-lead" style="font-size:15.5px;">Hier kannst du alles einfügen – Text, Tabellen, eingebettete Inhalte.</p>`}
    </div>
  </div>
  ${c.js ? `<script>${c.js}</script>` : ''}
</section>`
    },
  ],
}

// Grundformatierung für frei eingegebenen Inhalt
export const FREITEXT_CSS = `
.wg-freitext h1{font-size:clamp(30px,4.4vw,48px);font-weight:300;letter-spacing:-.025em;line-height:1.12;margin:0 0 14px;color:#0f172a}
.wg-freitext h2{font-size:clamp(25px,3.4vw,38px);font-weight:300;letter-spacing:-.02em;line-height:1.18;margin:26px 0 12px;color:#0f172a}
.wg-freitext h3{font-size:20px;font-weight:700;margin:22px 0 9px;color:#0f172a}
.wg-freitext p{font-size:16.5px;line-height:1.75;color:#475569;margin:0 0 15px}
.wg-freitext ul,.wg-freitext ol{margin:0 0 16px;padding-left:22px;color:#475569;font-size:16px;line-height:1.75}
.wg-freitext li{margin-bottom:7px}
.wg-freitext a{color:var(--accent);text-decoration:underline}
.wg-freitext img{max-width:100%;height:auto;border-radius:14px;margin:14px 0}
.wg-freitext blockquote{border-left:4px solid var(--accent);padding:6px 0 6px 20px;margin:20px 0;font-size:18px;color:#0f172a;font-style:normal}
.wg-freitext table{width:100%;border-collapse:collapse;margin:16px 0;font-size:15px}
.wg-freitext th,.wg-freitext td{border:1px solid rgba(15,23,42,.12);padding:10px 13px;text-align:left}
.wg-freitext th{background:var(--p50);font-weight:700;color:#0f172a}
.wg-freitext hr{border:0;border-top:1px solid rgba(15,23,42,.12);margin:26px 0}
.wg-freitext code{background:var(--p50);padding:2px 6px;border-radius:5px;font-size:14px}
`

// ═══════════════════════════════════════════════════════════════════════════
// WORKING HOURS — Öffnungszeiten
// ═══════════════════════════════════════════════════════════════════════════
export const OEFFNUNG = {
  type: 'oeffnung', label: 'Öffnungszeiten',
  variants: [
    {
      id: 'oeff-karte', name: 'Zeiten & Kontakt',
      render: (c) => {
        const tage = misch(c.tage, [
          { tag: 'Montag – Donnerstag', zeit: '08:00 – 17:00' },
          { tag: 'Freitag', zeit: '08:00 – 15:00' },
          { tag: 'Samstag', zeit: 'nach Vereinbarung' },
          { tag: 'Sonntag', zeit: 'geschlossen', zu: true },
        ])
        return `
<section data-block="oeffnung" data-variant="oeff-karte" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,50px);align-items:center;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Öffnungszeiten')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Wann Sie uns erreichen')}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead">${txt('text', c.text, 'Außerhalb der Zeiten erreichen Sie uns per E-Mail – wir melden uns am nächsten Werktag zurück.', 'span')}</div>
      </div>
      <div class="wg-reveal re wg-karte" style="padding:8px 26px;transition-delay:.1s;">
        ${tage.map((t, i) => `<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;padding:15px 0;${i < tage.length - 1 ? 'border-bottom:1px solid rgba(15,23,42,.08);' : ''}">
          <span style="font-size:15px;font-weight:600;color:#0f172a;">${ed(`tage.${i}.tag`, t.tag)}</span>
          <span style="font-size:14.5px;font-weight:700;color:${t.zu ? '#94a3b8' : 'var(--accent)'};">${ed(`tage.${i}.zeit`, t.zeit)}</span>
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
// KARTE — OpenStreetMap, Adresse im Editor eingebbar (kein Google, kein Cookie)
// ═══════════════════════════════════════════════════════════════════════════
export const KARTE = {
  type: 'karte', label: 'Karte (OpenStreetMap)',
  variants: [
    {
      id: 'karte-breit', name: 'Breite Karte',
      render: (c) => `
<section data-block="karte" data-variant="karte-breit" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    ${kopf(c, 'Anfahrt', 'So finden Sie uns')}
    <div class="wg-reveal" style="border-radius:22px;overflow:hidden;box-shadow:0 22px 54px rgba(15,23,42,.14);">
      ${osmIframe(c, 420)}
    </div>
    <p style="text-align:center;font-size:14px;color:#64748b;margin-top:16px;">
      <i class="fa-solid fa-location-dot" style="color:var(--accent);margin-right:8px;"></i>${txt('adresse', c.adresse, 'Musterstraße 1, 10115 Berlin')}
    </p>
  </div>
</section>`
    },
    {
      id: 'karte-split', name: 'Karte neben Adresse',
      render: (c) => `
<section data-block="karte" data-variant="karte-split" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap">
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(22px,4vw,44px);align-items:center;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Anfahrt')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Besuchen Sie uns')}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-karte" style="padding:20px 22px;margin-bottom:16px;">
          <div style="font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#94a3b8;margin-bottom:5px;">${txt('lblAdresse', c.lblAdresse, 'Adresse')}</div>
          <div style="font-size:16px;font-weight:600;color:#0f172a;">${txt('adresse', c.adresse, 'Musterstraße 1, 10115 Berlin')}</div>
        </div>
        <a href="https://www.openstreetmap.org/search?query=${encodeURIComponent(c.adresse || 'Musterstraße 1, 10115 Berlin')}" target="_blank" rel="noreferrer" class="wg-btn">
          <i class="fa-solid fa-diamond-turn-right"></i>${txt('ctaRoute', c.ctaRoute, 'Route planen')}
        </a>
      </div>
      <div class="wg-reveal re" style="border-radius:20px;overflow:hidden;box-shadow:0 20px 46px rgba(15,23,42,.14);transition-delay:.1s;">
        ${osmIframe(c, 380)}
      </div>
    </div>
  </div>
</section>`
    },
  ],
}

// OpenStreetMap-Einbettung: braucht KEINEN Schlüssel, setzt KEINE Cookies.
// Ohne Koordinaten wird aus der Adresse ein Suchlink gebaut; mit lat/lon wird
// die Karte punktgenau angezeigt (Editor kann beides setzen).
// Karten-Skins: CSS-Filter auf der Karte – wirken im Editor UND im Export.
export const KARTEN_SKINS = [
  { id: 'standard', label: 'Standard', filter: '' },
  { id: 'grau', label: 'Grau', filter: 'grayscale(1)' },
  { id: 'schwarzweiss', label: 'Schwarz-Weiß', filter: 'grayscale(1) contrast(1.3)' },
  { id: 'dunkel', label: 'Dunkel', filter: 'invert(0.92) hue-rotate(180deg) contrast(0.9) brightness(0.95)' },
  { id: 'kontrast', label: 'Kontrast', filter: 'contrast(1.45) saturate(1.25)' },
  { id: 'sepia', label: 'Sepia', filter: 'sepia(0.65) contrast(1.05)' },
]
function kartenFilter(c) {
  const skin = KARTEN_SKINS.find(k => k.id === c.kartenSkin)
  return skin && skin.filter ? `filter:${skin.filter};` : ''
}

function osmIframe(c, hoehe = 400) {
  const adresse = esc(c.adresse || 'Musterstraße 1, 10115 Berlin')
  const lat = parseFloat(c.lat), lon = parseFloat(c.lon)
  if (!isNaN(lat) && !isNaN(lon)) {
    const d = 0.006
    const bbox = `${(lon - d).toFixed(5)},${(lat - d / 2).toFixed(5)},${(lon + d).toFixed(5)},${(lat + d / 2).toFixed(5)}`
    return `<iframe data-osm title="Karte" src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}" style="width:100%;height:${hoehe}px;border:0;display:block;${kartenFilter(c)}" loading="lazy"></iframe>`
  }
  return `<div data-osm-platzhalter style="width:100%;height:${hoehe}px;${kartenFilter(c)}background:var(--p100);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:var(--p700);text-align:center;padding:24px;">
    <i class="fa-solid fa-map-location-dot" style="font-size:34px;"></i>
    <div style="font-size:15px;font-weight:700;" data-hinweis>${adresse}</div>
    <div style="font-size:13px;opacity:.75;max-width:340px;" data-hinweis>Im Editor die Adresse eintragen – die Karte wird dann automatisch angezeigt.</div>
  </div>`
}

// ═══════════════════════════════════════════════════════════════════════════
// FAQ (Premium)
// ═══════════════════════════════════════════════════════════════════════════
export const FAQ_PLUS = {
  type: 'faq-plus', label: 'FAQ (Premium)',
  variants: [
    {
      id: 'faqp-akkordeon', name: 'Akkordeon',
      render: (c) => {
        const items = misch(c.items, [
          { q: 'Wie schnell bekomme ich einen Termin?', a: 'In der Regel innerhalb von zwei bis drei Werktagen. Bei dringenden Fällen versuchen wir, noch am selben Tag jemanden vorbeizuschicken.' },
          { q: 'Was kostet ein Vor-Ort-Termin?', a: 'Die Besichtigung und das Angebot sind für Sie kostenlos und unverbindlich. Erst wenn Sie zustimmen, entstehen Kosten.' },
          { q: 'Arbeiten Sie auch am Wochenende?', a: 'Nach Absprache ja. Gerade bei Gewerbeobjekten reinigen wir häufig außerhalb der Geschäftszeiten.' },
          { q: 'Ist Material im Preis enthalten?', a: 'Ja, sämtliche Reinigungsmittel und Geräte sind im genannten Preis bereits enthalten.' },
        ])
        return `
<section data-block="faq-plus" data-variant="faqp-akkordeon" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap" style="max-width:840px;">
    ${kopf(c, 'FAQ', 'Häufige Fragen')}
    <div style="display:grid;gap:11px;">
      ${items.map((it, i) => `<details class="wg-reveal wg-karte" style="padding:0;transition-delay:${i * 60}ms;">
        <summary style="list-style:none;cursor:pointer;display:flex;align-items:center;gap:16px;padding:20px 24px;font-size:16.5px;font-weight:700;color:#0f172a;">
          <span style="flex:1;">${ed(`items.${i}.q`, it.q)}</span>
          <span class="wg-faq-plus" style="width:30px;height:30px;border-radius:50%;background:var(--p50);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;transition:transform .25s;"><i class="fa-solid fa-plus"></i></span>
        </summary>
        <div style="padding:0 24px 22px;font-size:15px;color:#64748b;line-height:1.75;">${ed(`items.${i}.a`, it.a)}</div>
      </details>`).join('')}
    </div>
  </div>
  <style>details[open] .wg-faq-plus{transform:rotate(45deg)}summary::-webkit-details-marker{display:none}</style>
</section>`
      }
    },
    {
      id: 'faqp-zwei', name: 'Zwei Spalten',
      render: (c) => {
        const items = misch(c.items, [
          { q: 'Wie schnell bekomme ich einen Termin?', a: 'In der Regel innerhalb von zwei bis drei Werktagen.' },
          { q: 'Was kostet ein Vor-Ort-Termin?', a: 'Besichtigung und Angebot sind kostenlos und unverbindlich.' },
          { q: 'Arbeiten Sie auch am Wochenende?', a: 'Nach Absprache gerne, gerade bei Gewerbeobjekten.' },
          { q: 'Ist Material enthalten?', a: 'Ja, Reinigungsmittel und Geräte sind im Preis enthalten.' },
        ])
        return `
<section data-block="faq-plus" data-variant="faqp-zwei" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap">
    ${kopf(c, 'FAQ', 'Gute Fragen, klare Antworten')}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:26px 40px;">
      ${items.map((it, i) => `<div class="wg-reveal" style="transition-delay:${i * 60}ms;">
        <h3 style="display:flex;gap:11px;font-size:17px;font-weight:700;color:#0f172a;margin-bottom:9px;">
          <i class="fa-solid fa-circle-question" style="color:var(--accent);font-size:15px;margin-top:3px;"></i>${ed(`items.${i}.q`, it.q)}</h3>
        <div style="font-size:14.5px;color:#64748b;line-height:1.72;padding-left:26px;">${ed(`items.${i}.a`, it.a)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`
      }
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDER / KARUSSELLS — reines CSS-Scroll-Snap + kleines JS, kein Framework
// ═══════════════════════════════════════════════════════════════════════════
const SLIDER_JS = `<script>
(function(){
  if(window.__wgSlider)return; window.__wgSlider=1;
  function init(){
    document.querySelectorAll('[data-slider]').forEach(function(s){
      var spur=s.querySelector('[data-spur]'); if(!spur)return;
      var vor=s.querySelector('[data-vor]'), zur=s.querySelector('[data-zurueck]');
      var punkte=s.querySelectorAll('[data-punkt]');
      function breite(){ var k=spur.children[0]; return k?k.getBoundingClientRect().width+18:320 }
      vor&&vor.addEventListener('click',function(){spur.scrollBy({left:breite(),behavior:'smooth'})});
      zur&&zur.addEventListener('click',function(){spur.scrollBy({left:-breite(),behavior:'smooth'})});
      punkte.forEach(function(p,i){p.addEventListener('click',function(){spur.scrollTo({left:breite()*i,behavior:'smooth'})})});
      spur.addEventListener('scroll',function(){
        var idx=Math.round(spur.scrollLeft/breite());
        punkte.forEach(function(p,i){p.style.opacity=i===idx?'1':'.35';p.style.width=i===idx?'26px':'8px'});
      },{passive:true});
      // Automatik: NICHT im Editor (sonst faehrt der Inhalt unter dem
      // Mauszeiger weg) und nie, solange die Maus ueber dem Slider steht.
      if(s.hasAttribute('data-auto')&&!window.__wgEditor){
        var halt=false;
        s.addEventListener('mouseenter',function(){halt=true});
        s.addEventListener('mouseleave',function(){halt=false});
        setInterval(function(){
          if(halt)return;
          if(spur.scrollLeft+spur.clientWidth>=spur.scrollWidth-4)spur.scrollTo({left:0,behavior:'smooth'});
          else spur.scrollBy({left:breite(),behavior:'smooth'});
        },5200);
      }
    });
  }
  if(document.readyState!=='loading')init(); else document.addEventListener('DOMContentLoaded',init);
})();
</script>`

const SLIDER_CSS = `<style>
.wg-spur{display:flex;gap:18px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-ms-overflow-style:none;padding-bottom:4px}
.wg-spur::-webkit-scrollbar{display:none}
.wg-spur>*{scroll-snap-align:start;flex:0 0 auto}
.wg-pfeil{width:44px;height:44px;border-radius:50%;border:1px solid rgba(15,23,42,.14);background:#fff;color:#0f172a;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:14px;transition:all .2s}
.wg-pfeil:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
.wg-punkte{display:flex;gap:7px;justify-content:center;margin-top:22px}
.wg-punkt{height:8px;width:8px;border-radius:99px;background:var(--accent);opacity:.35;border:none;cursor:pointer;transition:all .25s}
</style>`

export const SLIDER = {
  type: 'slider', label: 'Slider / Karussell',
  variants: [
    {
      id: 'slider-stimmen', name: 'Kundenstimmen-Karussell',
      render: (c) => {
        const items = misch(c.items, [
          { text: 'Schnell, sauber und wirklich freundlich. Jederzeit wieder.', name: 'M. Schneider', rolle: 'Privatkundin' },
          { text: 'Termin gehalten, Preis gehalten, Ergebnis top.', name: 'T. Bergmann', rolle: 'Hausverwaltung' },
          { text: 'Endlich ein Betrieb, der zurückruft. Sehr angenehm.', name: 'K. Ahmadi', rolle: 'Gewerbekunde' },
          { text: 'Wir sind seit drei Jahren Kunde und rundum zufrieden.', name: 'S. Peters', rolle: 'Büroleitung' },
        ])
        return `
<section data-block="slider" data-variant="slider-stimmen" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}">
  <div class="wg-wrap" data-slider data-auto>
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:clamp(22px,3vw,38px);flex-wrap:wrap;">
      <div class="wg-reveal" style="max-width:620px;">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Kundenstimmen')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Was Kunden sagen')}</h2>
        <span class="wg-strichlinie"></span>
      </div>
      <div style="display:flex;gap:9px;">
        <button class="wg-pfeil" data-zurueck aria-label="Zurück"><i class="fa-solid fa-arrow-left"></i></button>
        <button class="wg-pfeil" data-vor aria-label="Weiter"><i class="fa-solid fa-arrow-right"></i></button>
      </div>
    </div>
    <div class="wg-spur" data-spur>
      ${items.map((it, i) => `<div class="wg-karte" style="width:min(400px,84vw);padding:28px;">
        <div style="color:var(--accent);font-size:14px;margin-bottom:13px;">${'<i class="fa-solid fa-star"></i>'.repeat(5)}</div>
        <p style="font-size:16.5px;line-height:1.68;color:#0f172a;font-weight:300;margin-bottom:20px;">„${ed(`items.${i}.text`, it.text)}"</p>
        <div style="display:flex;align-items:center;gap:12px;border-top:1px solid rgba(15,23,42,.08);padding-top:16px;">
          <div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--p500),var(--p700));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;">${esc((it.name || 'K')[0])}</div>
          <div><div style="font-size:14px;font-weight:700;color:#0f172a;">${ed(`items.${i}.name`, it.name)}</div>
          <div style="font-size:12px;color:#94a3b8;">${ed(`items.${i}.rolle`, it.rolle)}</div></div>
        </div>
      </div>`).join('')}
    </div>
    <div class="wg-punkte">${items.map((_, i) => `<button class="wg-punkt" data-punkt style="${i === 0 ? 'opacity:1;width:26px;' : ''}" aria-label="Zu ${i + 1}"></button>`).join('')}</div>
  </div>
  ${SLIDER_CSS}${SLIDER_JS}
</section>`
      }
    },
    {
      id: 'slider-galerie', name: 'Bilder-Karussell',
      render: (c) => {
        const imgs = misch(c.images, ['', '', '', '', ''])
        return `
<section data-block="slider" data-variant="slider-galerie" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap" data-slider data-auto>
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:clamp(20px,3vw,34px);flex-wrap:wrap;">
      <div class="wg-reveal" style="max-width:620px;">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Galerie')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Einblicke')}</h2>
        <span class="wg-strichlinie"></span>
      </div>
      <div style="display:flex;gap:9px;">
        <button class="wg-pfeil" data-zurueck aria-label="Zurück"><i class="fa-solid fa-arrow-left"></i></button>
        <button class="wg-pfeil" data-vor aria-label="Weiter"><i class="fa-solid fa-arrow-right"></i></button>
      </div>
    </div>
    <div class="wg-spur" data-spur>
      ${imgs.map((s, i) => `<div class="wg-bildbox" style="width:min(480px,86vw);height:340px;">${bild(`images.${i}`, s, '', i + 1)}</div>`).join('')}
    </div>
    <div class="wg-punkte">${imgs.map((_, i) => `<button class="wg-punkt" data-punkt style="${i === 0 ? 'opacity:1;width:26px;' : ''}" aria-label="Zu ${i + 1}"></button>`).join('')}</div>
  </div>
  ${SLIDER_CSS}${SLIDER_JS}
</section>`
      }
    },
    {
      id: 'slider-logos', name: 'Logo-Karussell',
      render: (c) => {
        const logos = misch(c.logos, ['Partner', 'Zertifikat', 'Innung', 'Verband', 'Auszeichnung', 'Mitglied'])
        return `
<section data-block="slider" data-variant="slider-logos" style="${bg(c, 'background:var(--p50);')}padding:clamp(30px,4vw,52px) 0;">
  <div class="wg-wrap" data-slider data-auto>
    <div class="wg-reveal" style="text-align:center;font-size:11.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#94a3b8;margin-bottom:24px;">${txt('tag', c.tag, 'Partner & Mitgliedschaften')}</div>
    <div class="wg-spur" data-spur style="align-items:center;">
      ${logos.map((l, i) => `<div style="width:190px;height:82px;background:#fff;border:1px solid rgba(15,23,42,.08);border-radius:14px;display:flex;align-items:center;justify-content:center;">
        ${(typeof l === 'string' && l.startsWith('data:')) || (typeof l === 'string' && l.startsWith('http'))
          ? `<img data-img="logo${i}" src="${esc(l)}" alt="" style="max-width:70%;max-height:56%;object-fit:contain;">`
          : `<span style="font-size:14px;font-weight:800;letter-spacing:.05em;color:#94a3b8;">${ed(`logos.${i}`, l)}</span>`}
      </div>`).join('')}
    </div>
  </div>
  ${SLIDER_CSS}${SLIDER_JS}
</section>`
      }
    },
    {
      id: 'slider-hero', name: 'Hero-Slider',
      render: (c) => {
        const folien = misch(c.folien, [
          { tag: 'Willkommen', headline: 'Sauber ist erst der Anfang', text: LOREM.satz, cta: 'Jetzt anfragen' },
          { tag: 'Gewerbe', headline: 'Verlässlich für Ihr Objekt', text: LOREM.satz, cta: 'Angebot holen' },
          { tag: 'Privat', headline: 'Mehr Zeit für Sie', text: LOREM.satz, cta: 'Kontakt' },
        ])
        return `
<section data-block="slider" data-variant="slider-hero" data-slider data-auto style="position:relative;">
  <div class="wg-spur" data-spur style="gap:0;">
    ${folien.map((f, i) => `<div style="width:100vw;max-width:100%;min-height:78vh;display:flex;align-items:center;position:relative;overflow:hidden;background:linear-gradient(160deg,var(--p900),#0d1b2a 70%);" class="wg-dunkelzone">
      ${f.image ? `<img src="${esc(f.image)}" data-img="folieImg${i}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.42;">` : `<div class="wg-mesh"><span class="wg-blob wg-blob-a"></span><span class="wg-blob wg-blob-b"></span></div>`}
      <div class="wg-wrap" style="position:relative;z-index:1;">
        <div style="max-width:720px;">
          <span class="wg-chip glas">${ed(`folien.${i}.tag`, f.tag)}</span>
          <h2 class="wg-t1" style="color:#fff;margin-top:20px;">${ed(`folien.${i}.headline`, f.headline)}</h2>
          <span class="wg-strichlinie"></span>
          <div class="wg-lead" style="color:rgba(255,255,255,.78);max-width:520px;margin-bottom:30px;">${ed(`folien.${i}.text`, f.text)}</div>
          <a href="kontakt.html" class="wg-btn">${ed(`folien.${i}.cta`, f.cta)}</a>
        </div>
      </div>
    </div>`).join('')}
  </div>
  <div style="position:absolute;left:0;right:0;bottom:26px;display:flex;justify-content:center;gap:9px;z-index:2;">
    ${folien.map((_, i) => `<button class="wg-punkt" data-punkt style="${i === 0 ? 'opacity:1;width:26px;' : ''}background:#fff;" aria-label="Zu ${i + 1}"></button>`).join('')}
  </div>
  <button class="wg-pfeil" data-zurueck aria-label="Zurück" style="position:absolute;left:20px;top:50%;transform:translateY(-50%);z-index:2;"><i class="fa-solid fa-arrow-left"></i></button>
  <button class="wg-pfeil" data-vor aria-label="Weiter" style="position:absolute;right:20px;top:50%;transform:translateY(-50%);z-index:2;"><i class="fa-solid fa-arrow-right"></i></button>
  ${SLIDER_CSS}${SLIDER_JS}
</section>`
      }
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// SITE PARTS — Navigation, Footer, 404
// ═══════════════════════════════════════════════════════════════════════════
export const SITEPARTS = {
  type: 'siteparts', label: 'Seiten-Teile',
  variants: [
    {
      id: 'nav-transparent', name: 'Navigation (transparent)',
      render: (c) => {
        const links = misch(c.navLinks, [{ label: 'Startseite', href: 'index.html' }, { label: 'Leistungen', href: 'leistungen.html' }, { label: 'Über uns', href: 'ueber-uns.html' }, { label: 'Kontakt', href: 'kontakt.html' }])
        return `
<nav data-block="siteparts" data-variant="nav-transparent" style="position:sticky;top:0;z-index:900;background:rgba(255,255,255,.86);backdrop-filter:blur(14px);border-bottom:1px solid rgba(15,23,42,.07);">
  <div class="wg-wrap" style="height:76px;display:flex;align-items:center;justify-content:space-between;gap:20px;">
    <a href="index.html" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
      ${c.logo ? `<img data-img="logo" src="${esc(c.logo)}" alt="" style="height:38px;width:auto;object-fit:contain;">`
        : `<span style="font-size:20px;font-weight:800;letter-spacing:-.03em;color:var(--p700);">${ed('firmenname', c.firmenname || 'Ihr Unternehmen')}</span>`}
    </a>
    <div class="nav-desktop" style="display:flex;align-items:center;gap:4px;">
      ${links.map((l, i) => `<a href="${esc(l.href)}" style="font-size:14.5px;font-weight:600;color:#475569;text-decoration:none;padding:9px 15px;border-radius:99px;">${ed(`navLinks.${i}.label`, l.label)}</a>`).join('')}
      <a href="kontakt.html" class="wg-btn" style="padding:12px 24px;font-size:14.5px;margin-left:10px;">${txt('cta', c.cta, 'Anfragen')}</a>
    </div>
    <button class="nav-burger" style="display:none;background:none;border:none;font-size:22px;color:var(--p700);cursor:pointer;"><i class="fa-solid fa-bars"></i></button>
  </div>
</nav>`
      }
    },
    {
      id: 'footer-gross', name: 'Footer (groß)',
      render: (c) => {
        const spalten = misch(c.spalten, [
          { titel: 'Navigation', punkte: ['Startseite', 'Leistungen', 'Über uns', 'Kontakt'] },
          { titel: 'Leistungen', punkte: ['Unterhaltsreinigung', 'Grundreinigung', 'Fensterreinigung', 'Winterdienst'] },
          { titel: 'Rechtliches', punkte: ['Impressum', 'Datenschutz', 'AGB'] },
        ])
        return `
<footer data-block="siteparts" data-variant="footer-gross" class="wg-dunkelzone" style="background:linear-gradient(160deg,var(--p900),#0d1b2a 70%);padding:clamp(46px,6vw,72px) 0 0;">
  <div class="wg-wrap">
    <div style="display:grid;grid-template-columns:1.4fr repeat(auto-fit,minmax(150px,1fr));gap:36px;padding-bottom:40px;">
      <div>
        <div style="font-size:21px;font-weight:800;color:#fff;letter-spacing:-.03em;margin-bottom:12px;">${txt('firmenname', c.firmenname, 'Ihr Unternehmen')}</div>
        <div style="font-size:14.5px;color:rgba(255,255,255,.6);line-height:1.7;max-width:320px;margin-bottom:18px;">${txt('text', c.text, 'Ihr verlässlicher Partner in der Region – seit vielen Jahren.', 'span')}</div>
        <div style="display:flex;gap:10px;">
          ${['facebook-f', 'instagram', 'linkedin-in'].map((s, i) => `<a href="${esc((c.social || [])[i] || '#')}" aria-label="${s}" style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.09);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;text-decoration:none;"><i class="fa-brands fa-${s}"></i></a>`).join('')}
        </div>
      </div>
      ${spalten.map((sp, si) => `<div>
        <div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:14px;">${ed(`spalten.${si}.titel`, sp.titel)}</div>
        ${(sp.punkte || []).map((p, pi) => `<a href="#" style="display:block;font-size:14.5px;color:rgba(255,255,255,.68);text-decoration:none;padding:5px 0;">${ed(`spalten.${si}.punkte.${pi}`, p)}</a>`).join('')}
      </div>`).join('')}
    </div>
    <div style="border-top:1px solid rgba(255,255,255,.12);padding:22px 0;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:13px;color:rgba(255,255,255,.5);">
      <span>© ${new Date().getFullYear()} ${ed('rechteText', c.rechteText || 'Ihr Unternehmen')}</span>
      <span>${txt('telefon', c.telefon, '+49 30 1234567')} · ${txt('email', c.email, 'info@beispiel.de')}</span>
    </div>
  </div>
</footer>`
      }
    },
    {
      id: 'fehler-404', name: '404-Seite',
      render: (c) => `
<section data-block="siteparts" data-variant="fehler-404" class="wg-dunkelzone" style="min-height:80vh;display:flex;align-items:center;justify-content:center;text-align:center;background:linear-gradient(160deg,var(--p900),#0d1b2a 70%);position:relative;overflow:hidden;">
  <div class="wg-mesh"><span class="wg-blob wg-blob-a"></span><span class="wg-blob wg-blob-b"></span></div>
  <div class="wg-wrap" style="position:relative;z-index:1;max-width:640px;">
    <div style="font-size:clamp(80px,16vw,180px);font-weight:200;color:#fff;line-height:1;letter-spacing:-.05em;">${ed('code', c.code || '404')}</div>
    <h1 class="wg-t3" style="color:#fff;margin:10px 0 12px;">${txt('title', c.title, 'Diese Seite gibt es nicht mehr')}</h1>
    <div class="wg-lead" style="color:rgba(255,255,255,.7);margin-bottom:30px;">${txt('text', c.text, 'Vielleicht wurde sie verschoben. Zurück zur Startseite geht es hier.', 'span')}</div>
    <a href="index.html" class="wg-btn"><i class="fa-solid fa-arrow-left"></i>${txt('cta', c.cta, 'Zur Startseite')}</a>
  </div>
</section>`
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRIERUNG
// ═══════════════════════════════════════════════════════════════════════════
export const ZUSATZ2_BLOECKE = {
  kickstart: KICKSTART, stepbox: STEPBOX, imagebox: IMAGEBOX, iconbox: ICONBOX,
  heading: HEADING, counter: COUNTER, liste: LISTE, pricelist: PRICELIST,
  pricingtable: PRICINGTABLE, teamgrid: TEAMGRID, textbox: TEXTBOX,
  oeffnung: OEFFNUNG, karte: KARTE, 'faq-plus': FAQ_PLUS, slider: SLIDER,
  siteparts: SITEPARTS,
}

export const ZUSATZ2_ADDABLE = [
  { type: 'heading', label: 'Überschrift', fa: 'heading', cat: 'Inhalt' },
  { type: 'textbox', label: 'Freier Textblock', fa: 'code', cat: 'Inhalt' },
  { type: 'kickstart', label: 'Kickstart / Einstieg', fa: 'rocket', cat: 'Inhalt' },
  { type: 'stepbox', label: 'Schritte / Ablauf', fa: 'list-ol', cat: 'Inhalt' },
  { type: 'imagebox', label: 'Bild-Boxen', fa: 'image', cat: 'Inhalt' },
  { type: 'iconbox', label: 'Icon-Boxen', fa: 'icons', cat: 'Inhalt' },
  { type: 'liste', label: 'Liste / Aufzählung', fa: 'list-check', cat: 'Inhalt' },
  { type: 'slider', label: 'Slider / Karussell', fa: 'images', cat: 'Inhalt' },
  { type: 'counter', label: 'Zahlen / Counter', fa: 'chart-simple', cat: 'Vertrauen' },
  { type: 'teamgrid', label: 'Team', fa: 'users', cat: 'Vertrauen' },
  { type: 'faq-plus', label: 'FAQ Premium', fa: 'circle-question', cat: 'Vertrauen' },
  { type: 'oeffnung', label: 'Öffnungszeiten', fa: 'clock', cat: 'Vertrauen' },
  { type: 'pricelist', label: 'Preisliste', fa: 'list-ul', cat: 'Konversion' },
  { type: 'pricingtable', label: 'Preistabelle / Pakete', fa: 'tags', cat: 'Konversion' },
  { type: 'karte', label: 'Karte (OpenStreetMap)', fa: 'map-location-dot', cat: 'Konversion' },
  { type: 'siteparts', label: 'Navigation / Footer / 404', fa: 'window-maximize', cat: 'Sonstiges' },
]

export const ZUSATZ2_DEFAULTS = {
  kickstart: { tag: 'So einfach geht es', title: 'In drei Schritten zum Ergebnis', text: LOREM.absatz },
  stepbox: { tag: 'Ablauf', title: 'So läuft die Zusammenarbeit' },
  imagebox: { tag: 'Bereiche', title: 'Was wir übernehmen' },
  iconbox: { tag: 'Vorteile', title: 'Warum Kunden uns wählen' },
  heading: { tag: 'Abschnitt', title: 'Eine klare Überschrift' },
  counter: { tag: 'Zahlen', title: 'Erfahrung in Zahlen' },
  liste: { tag: 'Leistungen', title: 'Alles auf einen Blick' },
  pricelist: { tag: 'Preise', title: 'Was kostet was?' },
  pricingtable: { tag: 'Pakete', title: 'Für jeden Bedarf das Richtige' },
  teamgrid: { tag: 'Team', title: 'Die Menschen dahinter' },
  textbox: { html: '', css: '', js: '', breite: '860px' },
  oeffnung: { tag: 'Öffnungszeiten', title: 'Wann Sie uns erreichen' },
  karte: { tag: 'Anfahrt', title: 'So finden Sie uns', adresse: 'Musterstraße 1, 10115 Berlin' },
  'faq-plus': { tag: 'FAQ', title: 'Häufige Fragen' },
  slider: { tag: 'Kundenstimmen', title: 'Was Kunden sagen' },
  siteparts: { firmenname: 'Ihr Unternehmen', telefon: '+49 30 1234567', email: 'info@beispiel.de' },
}
