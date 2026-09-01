import { sektionBg } from './sektionBg'
import { LOREM, platzhalterBild } from './blocksPlus'
// ═══════════════════════════════════════════════════════════════════════════
// BAUSTEIN-BIBLIOTHEK — TEIL 4: FEATURES / MERKMALE (30 Varianten)
// Produkt- und Leistungsmerkmale in vielen Anordnungen: Bild neben
// Merkmalsliste, Raster, Bento, Zickzack, Vergleiche, dunkle Flächen.
//
// Regeln wie in allen Teilen:
//  • JEDER Text über ed()/txt(), Listen über misch() + echte Pfade
//  • JEDES Bild als <img data-img> (Panel: Hochladen/KI/Cover/Höhe/Position)
//  • Icons als <i data-icon> (Icon-Auswahl)
//  • Buttons als echte <a href> (Verlinkung im Panel)
//  • saubere Container (wg-wrap/wg-split/wg-karte) für Auswahl, Abstände,
//    Effekte, Drag & Drop und freie Elemente
//  • Standardtexte NEUTRAL – keine erfundenen Zahlen, Namen, Behauptungen
// ═══════════════════════════════════════════════════════════════════════════

const esc = (s) => String(s ?? '')
const BLOCK_TAGS = /<\s*(h[1-6]|p|div|ul|ol|li|table|blockquote|section|figure|pre|hr)\b/i
const ed = (key, val, tag) => {
  const s = String(val ?? '')
  const t = BLOCK_TAGS.test(s) ? 'div' : (tag || 'span')
  return `<${t} data-edit="${key}" style="outline:none;${t === 'div' ? 'display:block;' : ''}">${s}</${t}>`
}
const txt = (key, val, fallback, tag) => ed(key, (val && String(val).trim()) ? val : fallback, tag)

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
const bild = (key, src, stil = '', n = 1) =>
  `<img data-img="${key}" src="${esc(src || platzhalterBild(n))}" alt="" style="${stil}">`
function bg(c = {}, fallback = '') { return sektionBg(c, fallback) }

const COVER = 'width:100%;height:100%;object-fit:cover;display:block;'
const RUND = 'border-radius:18px;'
const bildBox = (key, src, hoehe = 'clamp(280px,36vw,440px)', extra = '', n = 1) =>
  `<div class="wg-bildbox" style="height:${hoehe};${RUND}overflow:hidden;${extra}">${bild(key, src, COVER, n)}</div>`

// Diagonal-Muster für dunkle Flächen
const feMuster = (deck = 'rgba(255,255,255,.05)') =>
  `<div aria-hidden="true" style="position:absolute;inset:0;pointer-events:none;background-image:repeating-linear-gradient(45deg,transparent 0 14px,${deck} 14px 15px),repeating-linear-gradient(-45deg,transparent 0 14px,${deck} 14px 15px);"></div>`

// ── Standardinhalte ────────────────────────────────────────────────────────
const D_TEXT = 'Beschreiben Sie hier dieses Merkmal in ein bis zwei Sätzen.'
const D_ITEMS3 = [
  { icon: 'bolt', titel: 'Ihr Merkmal', text: D_TEXT },
  { icon: 'shield-halved', titel: 'Ihr Merkmal', text: D_TEXT },
  { icon: 'gears', titel: 'Ihr Merkmal', text: D_TEXT },
]
const D_ITEMS4 = D_ITEMS3.concat([{ icon: 'gem', titel: 'Ihr Merkmal', text: D_TEXT }])
const D_ITEMS6 = D_ITEMS4.concat([
  { icon: 'clock', titel: 'Ihr Merkmal', text: D_TEXT },
  { icon: 'star', titel: 'Ihr Merkmal', text: D_TEXT },
])
const D_STATS = [
  { num: '0', label: 'Ihre Kennzahl' },
  { num: '0', label: 'Ihre Kennzahl' },
  { num: '0', label: 'Ihre Kennzahl' },
]

const items = (c, n = 3) => misch(c.items, n === 4 ? D_ITEMS4 : (n === 6 ? D_ITEMS6 : D_ITEMS3))

const feKopf = (c, dTitle = 'Was diese Lösung ausmacht', mitte = true) => `
    <div class="wg-reveal" style="${mitte ? 'text-align:center;max-width:740px;margin:0 auto clamp(28px,4.5vw,52px);' : 'max-width:640px;margin-bottom:clamp(24px,3.6vw,42px);'}">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Merkmale')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, dTitle)}</h2>
      <span class="wg-strichlinie${mitte ? ' mitte' : ''}"></span>
      ${c.subtitle ? `<div class="wg-lead">${ed('subtitle', c.subtitle)}</div>` : ''}
    </div>`

const feKnopf = (c, hell = false) => `
        <a href="${esc(c.ctaHref || 'leistungen.html')}" class="wg-btn"${hell ? ' style="margin-top:24px;"' : ' style="margin-top:24px;"'}>${txt('cta', c.cta, 'Mehr erfahren')}</a>`

// Merkmalszeile mit Icon (für Listen neben Bildern)
const feZeile = (it, i, hell = false) => `<div style="display:flex;gap:15px;align-items:flex-start;">
          <span style="width:42px;height:42px;border-radius:12px;background:${hell ? 'rgba(255,255,255,.12)' : 'var(--p50)'};color:${hell ? 'var(--accent)' : 'var(--p700)'};display:inline-flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${icon(`items.${i}.icon`, it.icon)}</span>
          <div>
            <h3 style="font-size:16px;font-weight:800;margin:0 0 4px;${hell ? 'color:#fff;' : ''}">${ed(`items.${i}.titel`, it.titel)}</h3>
            <div style="font-size:13.5px;line-height:1.7;color:${hell ? 'rgba(255,255,255,.72)' : '#64748b'};">${ed(`items.${i}.text`, it.text)}</div>
          </div>
        </div>`

const FE = []
const feNeu = (id, name, render) => FE.push({ id, name, render })
const feSekt = (id, c, innen, fallback = 'background:#fff;') =>
  `<section data-block="merkmale" data-variant="${id}" class="wg-sekt" style="${bg(c, fallback)}">
  <div class="wg-wrap">
${innen}
  </div>
</section>`

// 1 — Bild links, Merkmalsliste rechts
feNeu('fe-bild-links', 'Bild links, Merkmale rechts', (c) => feSekt('fe-bild-links', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, undefined, '', 1)}</div>
      <div class="wg-reveal re">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Merkmale')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Was diese Lösung ausmacht')}</h2>
        <span class="wg-strichlinie"></span>
        <div style="display:grid;gap:20px;margin-top:6px;">
          ${items(c, 3).map((it, i) => feZeile(it, i)).join('')}
        </div>
      </div>
    </div>`))

// 2 — Merkmale links, Bild rechts
feNeu('fe-bild-rechts', 'Merkmale links, Bild rechts', (c) => feSekt('fe-bild-rechts', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Merkmale')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Was diese Lösung ausmacht')}</h2>
        <span class="wg-strichlinie"></span>
        <div style="display:grid;gap:20px;margin-top:6px;">
          ${items(c, 3).map((it, i) => feZeile(it, i)).join('')}
        </div>
      </div>
      <div class="wg-reveal re">${bildBox('bildHaupt', c.bildHaupt, undefined, '', 2)}</div>
    </div>`, 'background:var(--p50);'))

// 3 — Drei Karten mit Bild oben
feNeu('fe-karten-bild', 'Karten mit Bild', (c) => feSekt('fe-karten-bild', c, `${feKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.6vw,30px);">
      ${items(c, 3).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:18px;overflow:hidden;">
        <div class="wg-bildbox" style="height:clamp(150px,18vw,210px);overflow:hidden;">${bild(`items.${i}.bild`, it.bild, COVER, i + 1)}</div>
        <div style="padding:clamp(20px,2.8vw,28px);">
          <h3 style="font-size:17px;font-weight:800;margin:0 0 7px;">${ed(`items.${i}.titel`, it.titel)}</h3>
          <div style="font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
        </div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 4 — Zickzack (abwechselnd Bild/Text)
feNeu('fe-zickzack', 'Zickzack', (c) => feSekt('fe-zickzack', c, `${feKopf(c)}
    <div style="display:grid;gap:clamp(26px,4vw,54px);">
      ${items(c, 3).map((it, i) => `<div class="wg-split wg-reveal" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(22px,3.6vw,50px);align-items:center;">
        <div style="${i % 2 ? 'order:2;' : ''}">
          <div class="wg-bildbox" style="height:clamp(200px,24vw,300px);${RUND}overflow:hidden;">${bild(`items.${i}.bild`, it.bild, COVER, i + 3)}</div>
        </div>
        <div style="${i % 2 ? 'order:1;' : ''}">
          <span style="width:46px;height:46px;border-radius:13px;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:17px;">${icon(`items.${i}.icon`, it.icon)}</span>
          <h3 style="font-size:clamp(18px,2.3vw,24px);font-weight:800;margin:14px 0 8px;">${ed(`items.${i}.titel`, it.titel)}</h3>
          <div style="font-size:14.5px;color:#64748b;line-height:1.75;">${ed(`items.${i}.text`, it.text)}</div>
        </div>
      </div>`).join('')}
    </div>`))

// 5 — Vier Kacheln
feNeu('fe-vier', 'Vier Kacheln', (c) => feSekt('fe-vier', c, `${feKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,26px);">
      ${items(c, 4).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:16px;padding:clamp(20px,2.8vw,28px);">
        <span style="width:48px;height:48px;border-radius:13px;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:18px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:16px;font-weight:800;margin:14px 0 6px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 6 — Dunkle Fläche mit Muster
feNeu('fe-dunkel', 'Dunkel mit Muster', (c) => `
<section data-block="merkmale" data-variant="fe-dunkel" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:var(--p900);')}position:relative;overflow:hidden;">
  ${feMuster()}
  <div class="wg-wrap" style="position:relative;">
    <div class="wg-reveal" style="text-align:center;max-width:740px;margin:0 auto clamp(28px,4.5vw,52px);color:#fff;">
      <span class="wg-chip glas">${txt('tag', c.tag, 'Merkmale')}</span>
      <h2 class="wg-t2" style="color:#fff;margin-top:14px;">${txt('title', c.title, 'Was diese Lösung ausmacht')}</h2>
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2.4vw,26px);">
      ${items(c, 3).map((it, i) => `<div class="wg-karte wg-reveal" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:clamp(22px,3vw,32px);color:#fff;">
        <span style="width:48px;height:48px;border-radius:13px;background:rgba(255,255,255,.1);color:var(--accent);display:inline-flex;align-items:center;justify-content:center;font-size:18px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:17px;font-weight:800;margin:14px 0 7px;color:#fff;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;color:rgba(255,255,255,.72);line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`)

// 7 — Bento: eine große Kachel + kleine
feNeu('fe-bento', 'Bento-Raster', (c) => {
  const li = items(c, 4)
  return feSekt('fe-bento', c, `${feKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:1.3fr 1fr 1fr;grid-auto-rows:minmax(150px,auto);gap:clamp(14px,2.2vw,22px);">
      <div class="wg-karte wg-reveal" style="grid-row:span 2;background:var(--p900);border-radius:20px;overflow:hidden;position:relative;color:#fff;display:flex;flex-direction:column;justify-content:flex-end;padding:clamp(22px,3vw,32px);">
        <div class="wg-bildbox" style="position:absolute;inset:0;opacity:.42;">${bild('bildHaupt', c.bildHaupt, COVER, 6)}</div>
        <div class="wg-dunkelzone" style="position:relative;">
          <span style="width:46px;height:46px;border-radius:13px;background:rgba(255,255,255,.16);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:17px;">${icon('items.0.icon', li[0].icon)}</span>
          <h3 style="font-size:19px;font-weight:800;margin:14px 0 7px;color:#fff;">${ed('items.0.titel', li[0].titel)}</h3>
          <div style="font-size:13.5px;color:rgba(255,255,255,.8);line-height:1.7;">${ed('items.0.text', li[0].text)}</div>
        </div>
      </div>
      ${li.slice(1).map((it, k) => {
        const i = k + 1
        return `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:18px;padding:clamp(18px,2.6vw,26px);${k === 2 ? 'grid-column:span 2;' : ''}">
        <span style="color:var(--p600);font-size:22px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:16px;font-weight:800;margin:12px 0 6px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`
      }).join('')}
    </div>`, 'background:var(--p50);')
})

// 8 — Bild mittig, Merkmale links und rechts
feNeu('fe-mitte-bild', 'Bild in der Mitte', (c) => {
  const li = items(c, 4)
  return feSekt('fe-mitte-bild', c, `${feKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.1fr 1fr;gap:clamp(20px,3.2vw,42px);align-items:center;">
      <div class="wg-reveal li" style="display:grid;gap:clamp(20px,3vw,34px);">
        ${li.slice(0, 2).map((it, i) => `<div style="text-align:right;">
          <span style="width:44px;height:44px;border-radius:12px;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:16px;">${icon(`items.${i}.icon`, it.icon)}</span>
          <h3 style="font-size:15.5px;font-weight:800;margin:11px 0 5px;">${ed(`items.${i}.titel`, it.titel)}</h3>
          <div style="font-size:13px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
        </div>`).join('')}
      </div>
      <div class="wg-reveal">${bildBox('bildHaupt', c.bildHaupt, 'clamp(280px,34vw,420px)', '', 7)}</div>
      <div class="wg-reveal re" style="display:grid;gap:clamp(20px,3vw,34px);">
        ${li.slice(2, 4).map((it, k) => {
          const i = k + 2
          return `<div>
          <span style="width:44px;height:44px;border-radius:12px;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:16px;">${icon(`items.${i}.icon`, it.icon)}</span>
          <h3 style="font-size:15.5px;font-weight:800;margin:11px 0 5px;">${ed(`items.${i}.titel`, it.titel)}</h3>
          <div style="font-size:13px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
        </div>`
        }).join('')}
      </div>
    </div>`)
})

// 9 — Vergleichsliste (dabei / nicht dabei)
feNeu('fe-vergleich', 'Vergleichsliste', (c) => {
  const sp = misch(c.vergleich, [
    { titel: 'Ihr Angebot', punkte: ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4'], gut: true },
    { titel: 'Zum Vergleich', punkte: ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4'], gut: false },
  ])
  return feSekt('fe-vergleich', c, `${feKopf(c, 'Der Unterschied auf einen Blick')}
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,2.6vw,30px);max-width:900px;margin:0 auto;">
      ${sp.map((s, i) => `<div class="wg-karte wg-reveal" style="border-radius:18px;padding:clamp(22px,3vw,32px);${s.gut ? 'background:#fff;border:2px solid var(--p600);box-shadow:0 18px 46px rgba(15,23,42,.1);' : 'background:var(--p50);border:1px solid var(--p100);'}">
        <h3 style="font-size:17px;font-weight:800;margin:0 0 14px;">${ed(`vergleich.${i}.titel`, s.titel)}</h3>
        <ul style="list-style:none;padding:0;margin:0;display:grid;gap:11px;">
          ${(Array.isArray(s.punkte) ? s.punkte : []).map((p, j) => `<li style="display:flex;gap:11px;align-items:flex-start;font-size:14px;color:${s.gut ? '#334155' : '#94a3b8'};">
            <span style="width:22px;height:22px;border-radius:50%;flex-shrink:0;margin-top:1px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;background:${s.gut ? 'var(--accent)' : '#e2e8f0'};color:${s.gut ? '#fff' : '#94a3b8'};"><i class="fa-solid fa-${s.gut ? 'check' : 'xmark'}"></i></span>${ed(`vergleich.${i}.punkte.${j}`, p)}</li>`).join('')}
        </ul>
      </div>`).join('')}
    </div>`)
})

// 10 — Merkmale mit Häkchen neben Bild
feNeu('fe-haken', 'Häkchenliste neben Bild', (c) => feSekt('fe-haken', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, undefined, '', 8)}</div>
      <div class="wg-reveal re">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Merkmale')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Was diese Lösung ausmacht')}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead">${txt('text', c.text, LOREM.satz)}</div>
        <ul style="list-style:none;padding:0;margin:20px 0 0;display:grid;gap:11px;">
          ${misch(c.punkte, ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4']).map((p, i) => `<li style="display:flex;gap:12px;align-items:flex-start;font-size:15px;color:#334155;">
            <span style="width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;margin-top:1px;"><i class="fa-solid fa-check"></i></span>${ed(`punkte.${i}`, p)}</li>`).join('')}
        </ul>
        ${feKnopf(c)}
      </div>
    </div>`, 'background:var(--p50);'))

// 11 — Sechser-Raster schlicht
feNeu('fe-sechs', 'Sechser-Raster', (c) => feSekt('fe-sechs', c, `${feKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(18px,3vw,38px);">
      ${items(c, 6).map((it, i) => `<div class="wg-reveal" style="display:flex;gap:14px;align-items:flex-start;">
        <span style="color:var(--p600);font-size:21px;margin-top:2px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <div>
          <h3 style="font-size:15.5px;font-weight:800;margin:0 0 5px;">${ed(`items.${i}.titel`, it.titel)}</h3>
          <div style="font-size:13px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
        </div>
      </div>`).join('')}
    </div>`))

// 12 — Nummerierte Merkmale neben Bild
feNeu('fe-nummern', 'Nummeriert neben Bild', (c) => feSekt('fe-nummern', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.05fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">
        <h2 class="wg-t2">${txt('title', c.title, 'Was diese Lösung ausmacht')}</h2>
        <span class="wg-strichlinie"></span>
        <div style="display:grid;gap:18px;margin-top:6px;">
          ${items(c, 3).map((it, i) => `<div style="display:flex;gap:15px;align-items:flex-start;">
            <span style="font-size:24px;font-weight:900;color:var(--p200);line-height:1.1;">${String(i + 1).padStart(2, '0')}</span>
            <div>
              <h3 style="font-size:16px;font-weight:800;margin:0 0 4px;">${ed(`items.${i}.titel`, it.titel)}</h3>
              <div style="font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
      <div class="wg-reveal re">${bildBox('bildHaupt', c.bildHaupt, undefined, '', 9)}</div>
    </div>`))

// 13 — Merkmale mit Zahlen-Zeile
feNeu('fe-zahlen', 'Mit Zahlen-Zeile', (c) => feSekt('fe-zahlen', c, `${feKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.6vw,30px);">
      ${items(c, 3).map((it, i) => `<div class="wg-karte wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:16px;padding:clamp(20px,2.8vw,30px);">
        <span style="color:var(--p600);font-size:22px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:16px;font-weight:800;margin:12px 0 6px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2.4vw,26px);margin-top:clamp(24px,3.6vw,42px);">
      ${misch(c.stats, D_STATS).map((st, i) => `<div class="wg-reveal" style="text-align:center;padding:20px 10px;border-radius:14px;background:var(--p50);">
        <div style="font-size:clamp(24px,3.2vw,36px);font-weight:900;color:var(--p700);">${ed(`stats.${i}.num`, st.num)}</div>
        <div style="font-size:12.5px;color:#64748b;margin-top:3px;">${ed(`stats.${i}.label`, st.label)}</div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 14 — Breites Bild oben, Merkmale darunter
feNeu('fe-bild-oben', 'Bild oben, Merkmale unten', (c) => feSekt('fe-bild-oben', c, `${feKopf(c)}
    <div class="wg-reveal" style="margin-bottom:clamp(24px,3.6vw,42px);">${bildBox('bildHaupt', c.bildHaupt, 'clamp(220px,30vw,400px)', '', 10)}</div>
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(18px,3vw,36px);">
      ${items(c, 3).map((it, i) => `<div class="wg-reveal">
        <span style="color:var(--accent);font-size:22px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:16.5px;font-weight:800;margin:12px 0 6px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 15 — Dunkle Karten mit Bild
feNeu('fe-dunkle-karten', 'Dunkle Karten mit Bild', (c) => feSekt('fe-dunkle-karten', c, `${feKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.6vw,30px);">
      ${items(c, 3).map((it, i) => `<div class="wg-karte wg-dunkelzone wg-karte-hover wg-reveal" style="background:var(--p900);border-radius:18px;overflow:hidden;color:#fff;position:relative;">
        <div class="wg-bildbox" style="height:clamp(140px,17vw,190px);overflow:hidden;opacity:.75;">${bild(`items.${i}.bild`, it.bild, COVER, i + 11)}</div>
        <div style="padding:clamp(20px,2.8vw,28px);">
          <h3 style="font-size:16.5px;font-weight:800;margin:0 0 7px;color:#fff;">${ed(`items.${i}.titel`, it.titel)}</h3>
          <div style="font-size:13.5px;color:rgba(255,255,255,.72);line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
        </div>
      </div>`).join('')}
    </div>`))

// 16 — Zwei große Merkmal-Karten
feNeu('fe-zwei-gross', 'Zwei große Karten', (c) => feSekt('fe-zwei-gross', c, `${feKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(18px,3vw,34px);">
      ${items(c, 3).slice(0, 2).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:var(--p50);border-radius:22px;padding:clamp(26px,3.6vw,44px);">
        <span style="width:60px;height:60px;border-radius:16px;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:22px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:clamp(19px,2.4vw,25px);font-weight:800;margin:18px 0 9px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:14.5px;color:#64748b;line-height:1.75;">${ed(`items.${i}.text`, it.text)}</div>
        <div class="wg-bildbox" style="height:clamp(150px,18vw,210px);${RUND}overflow:hidden;margin-top:20px;">${bild(`items.${i}.bild`, it.bild, COVER, i + 14)}</div>
      </div>`).join('')}
    </div>`))

// 17 — Merkmale als Streifen mit Trennlinien
feNeu('fe-streifen', 'Streifen mit Linien', (c) => feSekt('fe-streifen', c, `${feKopf(c, 'Was diese Lösung ausmacht', false)}
    <div style="display:grid;">
      ${items(c, 4).map((it, i) => `<div class="wg-split wg-reveal" style="display:grid;grid-template-columns:auto 1fr 2fr;gap:clamp(16px,2.8vw,36px);align-items:center;padding:clamp(18px,2.8vw,28px) 0;${i ? 'border-top:1px solid var(--p100);' : ''}">
        <span style="width:46px;height:46px;border-radius:13px;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:17px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:17px;font-weight:800;margin:0;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:14px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 18 — Bild mit überlappender Merkmal-Karte
feNeu('fe-ueberlappt', 'Überlappende Karte', (c) => feSekt('fe-ueberlappt', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(20px,3vw,40px);align-items:center;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, 'clamp(300px,38vw,460px)', '', 16)}</div>
      <div class="wg-karte wg-reveal re" style="background:#fff;border-radius:20px;padding:clamp(24px,3.4vw,40px);box-shadow:0 24px 64px rgba(15,23,42,.14);margin-left:clamp(-60px,-4vw,0px);">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Merkmale')}</span>
        <h2 style="font-size:clamp(20px,2.6vw,28px);font-weight:900;letter-spacing:-.02em;margin:12px 0 16px;">${txt('title', c.title, 'Was diese Lösung ausmacht')}</h2>
        <div style="display:grid;gap:16px;">
          ${items(c, 3).map((it, i) => feZeile(it, i)).join('')}
        </div>
      </div>
    </div>`, 'background:var(--p50);'))

// 19 — Merkmale mit Pfeil-Link
feNeu('fe-pfeil', 'Mit Pfeil-Link', (c) => feSekt('fe-pfeil', c, `${feKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.6vw,30px);">
      ${items(c, 3).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:16px;padding:clamp(22px,3vw,32px);display:flex;flex-direction:column;">
        <span style="width:50px;height:50px;border-radius:14px;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:19px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:16.5px;font-weight:800;margin:14px 0 7px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.7;flex:1;">${ed(`items.${i}.text`, it.text)}</div>
        <a href="${esc(it.href || 'leistungen.html')}" style="display:inline-flex;align-items:center;gap:8px;margin-top:16px;font-weight:800;color:var(--p600);text-decoration:none;font-size:13.5px;">${ed(`items.${i}.cta`, it.cta || 'Mehr erfahren')} <i class="fa-solid fa-arrow-right" style="font-size:12px;"></i></a>
      </div>`).join('')}
    </div>`))

// 20 — Split: dunkle Textfläche + Bild
feNeu('fe-split-dunkel', 'Dunkler Split', (c) => `
<section data-block="merkmale" data-variant="fe-split-dunkel" class="wg-sekt" style="${bg(c, 'background:#fff;')}padding-top:0;padding-bottom:0;">
  <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;min-height:clamp(340px,42vw,520px);">
    <div class="wg-dunkelzone" style="position:relative;overflow:hidden;background:var(--p900);color:#fff;display:flex;align-items:center;padding:clamp(28px,5vw,68px);">
      ${feMuster()}
      <div class="wg-reveal li" style="position:relative;">
        <span class="wg-eyebrow" style="color:var(--accent);">${txt('tag', c.tag, 'Merkmale')}</span>
        <h2 class="wg-t2" style="color:#fff;margin-top:12px;">${txt('title', c.title, 'Was diese Lösung ausmacht')}</h2>
        <span class="wg-strichlinie"></span>
        <div style="display:grid;gap:18px;margin-top:6px;">
          ${items(c, 3).map((it, i) => feZeile(it, i, true)).join('')}
        </div>
      </div>
    </div>
    <div class="wg-bildbox" style="overflow:hidden;min-height:280px;">${bild('bildHaupt', c.bildHaupt, COVER, 17)}</div>
  </div>
</section>`)

// 21 — Merkmale als Pillen-Liste
feNeu('fe-pillen', 'Pillen-Liste', (c) => feSekt('fe-pillen', c, `${feKopf(c)}
    <div style="max-width:680px;margin:0 auto;display:grid;gap:12px;">
      ${items(c, 4).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="display:flex;gap:16px;align-items:center;background:#fff;border:1px solid var(--p100);border-radius:99px;padding:12px 22px 12px 12px;">
        <span style="width:46px;height:46px;border-radius:50%;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;">${icon(`items.${i}.icon`, it.icon)}</span>
        <div style="flex:1;">
          <h3 style="font-size:15.5px;font-weight:800;margin:0;">${ed(`items.${i}.titel`, it.titel)}</h3>
          <div style="font-size:13px;color:#64748b;line-height:1.55;">${ed(`items.${i}.text`, it.text)}</div>
        </div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 22 — Zwei Spalten mit Bild in der Mitte oben
feNeu('fe-kopf-bild', 'Kopf-Bild + zwei Spalten', (c) => feSekt('fe-kopf-bild', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,54px);align-items:end;margin-bottom:clamp(24px,3.6vw,42px);">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Merkmale')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Was diese Lösung ausmacht')}</h2>
      </div>
      <div class="wg-reveal re" style="font-size:14.5px;color:#64748b;line-height:1.8;">${txt('text', c.text, LOREM.satz)}</div>
    </div>
    <div class="wg-reveal" style="margin-bottom:clamp(24px,3.6vw,42px);">${bildBox('bildHaupt', c.bildHaupt, 'clamp(220px,28vw,360px)', '', 18)}</div>
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,28px);">
      ${items(c, 4).map((it, i) => `<div class="wg-reveal">
        <span style="color:var(--p600);font-size:20px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:15px;font-weight:800;margin:10px 0 5px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:12.5px;color:#64748b;line-height:1.6;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 23 — Karten mit Oberrand-Akzent
feNeu('fe-oberrand', 'Karten mit Akzentrand', (c) => feSekt('fe-oberrand', c, `${feKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,26px);">
      ${items(c, 4).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-top:4px solid var(--accent);border-radius:14px;padding:clamp(18px,2.6vw,26px);">
        <span style="color:var(--p600);font-size:21px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:15.5px;font-weight:800;margin:12px 0 6px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 24 — Merkmale mit Bildschirm-Rahmen
feNeu('fe-rahmen', 'Mit Bildschirm-Rahmen', (c) => feSekt('fe-rahmen', c, `${feKopf(c)}
    <div class="wg-reveal" style="max-width:900px;margin:0 auto clamp(24px,3.6vw,42px);border:10px solid var(--p900);border-radius:22px;overflow:hidden;box-shadow:0 26px 70px rgba(15,23,42,.2);">
      <div class="wg-bildbox" style="height:clamp(220px,30vw,420px);overflow:hidden;">${bild('bildHaupt', c.bildHaupt, COVER, 19)}</div>
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(18px,3vw,36px);">
      ${items(c, 3).map((it, i) => `<div class="wg-reveal" style="text-align:center;">
        <span style="width:50px;height:50px;border-radius:50%;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:18px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:16px;font-weight:800;margin:12px 0 6px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 25 — Merkmal-Liste mit Fortschrittsbalken
feNeu('fe-balken', 'Mit Balken', (c) => feSekt('fe-balken', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Merkmale')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Was diese Lösung ausmacht')}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead">${txt('text', c.text, LOREM.satz)}</div>
        ${feKnopf(c)}
      </div>
      <div class="wg-reveal re" style="display:grid;gap:18px;">
        ${misch(c.balken, [
          { label: 'Ihr Merkmal', wert: 0 },
          { label: 'Ihr Merkmal', wert: 0 },
          { label: 'Ihr Merkmal', wert: 0 },
        ]).map((b, i) => `<div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px;">
            <span style="font-size:14.5px;font-weight:700;">${ed(`balken.${i}.label`, b.label)}</span>
            <span style="font-size:12.5px;color:#94a3b8;font-weight:700;">${ed(`balken.${i}.wert`, b.wert)}%</span>
          </div>
          <div style="height:7px;border-radius:99px;background:var(--p100);overflow:hidden;">
            <div style="height:100%;width:${Math.max(0, Math.min(100, parseInt(b.wert, 10) || 0))}%;background:linear-gradient(90deg,var(--p600),var(--accent));border-radius:99px;"></div>
          </div>
        </div>`).join('')}
      </div>
    </div>`, 'background:var(--p50);'))

// 26 — Glas-Karten auf Verlauf
feNeu('fe-glas', 'Glas-Karten', (c) => `
<section data-block="merkmale" data-variant="fe-glas" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:linear-gradient(135deg,var(--p700),var(--p900) 70%);')}position:relative;overflow:hidden;">
  <div class="wg-mesh"><span class="wg-blob wg-blob-a"></span><span class="wg-blob wg-blob-b"></span></div>
  <div class="wg-wrap" style="position:relative;">
    <div class="wg-reveal" style="text-align:center;max-width:740px;margin:0 auto clamp(28px,4.5vw,52px);color:#fff;">
      <span class="wg-chip glas">${txt('tag', c.tag, 'Merkmale')}</span>
      <h2 class="wg-t2" style="color:#fff;margin-top:14px;">${txt('title', c.title, 'Was diese Lösung ausmacht')}</h2>
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2.4vw,26px);">
      ${items(c, 3).map((it, i) => `<div class="wg-karte wg-reveal" style="background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.2);border-radius:18px;padding:clamp(22px,3vw,34px);color:#fff;backdrop-filter:blur(6px);">
        <span style="width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:19px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:16.5px;font-weight:800;margin:15px 0 7px;color:#fff;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;color:rgba(255,255,255,.78);line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`)

// 27 — Zwei Merkmale + großes Bild unten
feNeu('fe-bild-unten', 'Merkmale über Bild', (c) => feSekt('fe-bild-unten', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(22px,3.6vw,48px);align-items:start;margin-bottom:clamp(24px,3.6vw,42px);">
      ${items(c, 3).slice(0, 2).map((it, i) => `<div class="wg-reveal">
        <span style="width:52px;height:52px;border-radius:14px;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:19px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:clamp(18px,2.2vw,23px);font-weight:800;margin:14px 0 8px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:14px;color:#64748b;line-height:1.75;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>
    <div class="wg-reveal">${bildBox('bildHaupt', c.bildHaupt, 'clamp(220px,30vw,400px)', '', 20)}</div>`, 'background:var(--p50);'))

// 28 — Merkmale mit Badge
feNeu('fe-badge', 'Mit Badge', (c) => feSekt('fe-badge', c, `${feKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.6vw,30px);">
      ${items(c, 3).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:16px;padding:clamp(22px,3vw,32px);">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
          <span style="width:46px;height:46px;border-radius:12px;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:17px;">${icon(`items.${i}.icon`, it.icon)}</span>
          <span style="background:var(--p50);color:var(--p700);font-size:10.5px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;border-radius:99px;padding:5px 12px;">${ed(`items.${i}.badge`, it.badge || 'Stichwort')}</span>
        </div>
        <h3 style="font-size:16.5px;font-weight:800;margin:0 0 7px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 29 — Merkmale in zwei Spalten neben schmalem Intro
feNeu('fe-intro-liste', 'Intro + Merkmalsliste', (c) => feSekt('fe-intro-liste', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(26px,4.5vw,60px);align-items:start;">
      <div class="wg-reveal li" style="position:sticky;top:90px;">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Merkmale')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Was diese Lösung ausmacht')}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead">${txt('text', c.text, LOREM.satz)}</div>
        ${feKnopf(c)}
      </div>
      <div class="wg-reveal re" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(18px,3vw,32px);">
        ${items(c, 4).map((it, i) => `<div>
          <span style="color:var(--accent);font-size:21px;">${icon(`items.${i}.icon`, it.icon)}</span>
          <h3 style="font-size:16px;font-weight:800;margin:11px 0 5px;">${ed(`items.${i}.titel`, it.titel)}</h3>
          <div style="font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
        </div>`).join('')}
      </div>
    </div>`))

// 30 — Abschluss: Merkmale + Aufruf-Karte
feNeu('fe-mit-cta', 'Merkmale + Aufruf', (c) => feSekt('fe-mit-cta', c, `${feKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,26px);align-items:stretch;">
      ${items(c, 3).map((it, i) => `<div class="wg-karte wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:16px;padding:clamp(18px,2.6vw,26px);">
        <span style="width:46px;height:46px;border-radius:13px;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:18px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:15.5px;font-weight:800;margin:13px 0 6px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
      <div class="wg-karte wg-dunkelzone wg-reveal" style="position:relative;overflow:hidden;background:var(--p800);border-radius:16px;padding:clamp(18px,2.6vw,26px);color:#fff;display:flex;flex-direction:column;justify-content:center;text-align:center;">
        ${feMuster('rgba(255,255,255,.05)')}
        <div style="position:relative;">
          <div style="font-size:16.5px;font-weight:800;">${txt('ctaTitel', c.ctaTitel, 'Klingt passend?')}</div>
          <a href="${esc(c.ctaHref || 'kontakt.html')}" class="wg-btn" style="margin-top:15px;">${txt('cta', c.cta, 'Jetzt anfragen')}</a>
        </div>
      </div>
    </div>`, 'background:var(--p50);'))

export const MERKMALE = { type: 'merkmale', label: 'Features / Merkmale', variants: FE }

export const ZUSATZ4_BLOECKE = { merkmale: MERKMALE }

export const ZUSATZ4_ADDABLE = [
  { type: 'merkmale', label: 'Features / Merkmale', fa: 'list-check', cat: 'Inhalt' },
]

export const ZUSATZ4_DEFAULTS = {
  merkmale: {
    tag: 'Merkmale',
    title: 'Was diese Lösung ausmacht',
    text: LOREM.satz,
    cta: 'Mehr erfahren', ctaHref: 'leistungen.html',
    ctaTitel: 'Klingt passend?',
    punkte: ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4'],
    items: [
      { icon: 'bolt', titel: 'Ihr Merkmal', text: D_TEXT, badge: 'Stichwort', cta: 'Mehr erfahren', href: 'leistungen.html' },
      { icon: 'shield-halved', titel: 'Ihr Merkmal', text: D_TEXT, badge: 'Stichwort', cta: 'Mehr erfahren', href: 'leistungen.html' },
      { icon: 'gears', titel: 'Ihr Merkmal', text: D_TEXT, badge: 'Stichwort', cta: 'Mehr erfahren', href: 'leistungen.html' },
      { icon: 'gem', titel: 'Ihr Merkmal', text: D_TEXT, badge: 'Stichwort', cta: 'Mehr erfahren', href: 'leistungen.html' },
      { icon: 'clock', titel: 'Ihr Merkmal', text: D_TEXT, badge: 'Stichwort', cta: 'Mehr erfahren', href: 'leistungen.html' },
      { icon: 'star', titel: 'Ihr Merkmal', text: D_TEXT, badge: 'Stichwort', cta: 'Mehr erfahren', href: 'leistungen.html' },
    ],
    stats: [
      { num: '0', label: 'Ihre Kennzahl' },
      { num: '0', label: 'Ihre Kennzahl' },
      { num: '0', label: 'Ihre Kennzahl' },
    ],
    balken: [
      { label: 'Ihr Merkmal', wert: 0 },
      { label: 'Ihr Merkmal', wert: 0 },
      { label: 'Ihr Merkmal', wert: 0 },
    ],
    vergleich: [
      { titel: 'Ihr Angebot', punkte: ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4'], gut: true },
      { titel: 'Zum Vergleich', punkte: ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4'], gut: false },
    ],
  },
}
