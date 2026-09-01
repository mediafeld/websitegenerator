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

// ═══════════════════════════════════════════════════════════════════════════
// FAQ / HÄUFIGE FRAGEN (10 Varianten)
// Aufklapp-Listen (details/summary – funktioniert ohne JavaScript), dazu
// Varianten mit Bild, Kategorien, Kontakt-Karte und offener Darstellung.
// ═══════════════════════════════════════════════════════════════════════════

const D_FRAGEN = [
  { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und durch Ihre echten Inhalte ersetzen.' },
  { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und durch Ihre echten Inhalte ersetzen.' },
  { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und durch Ihre echten Inhalte ersetzen.' },
  { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und durch Ihre echten Inhalte ersetzen.' },
  { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und durch Ihre echten Inhalte ersetzen.' },
  { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und durch Ihre echten Inhalte ersetzen.' },
]
const fragenListe = (c, n = 5) => misch(c.fragen, D_FRAGEN.slice(0, n))

// Aufklapp-Eintrag (details/summary; das Plus dreht sich beim Öffnen)
const faZeile = (it, i, feld = 'fragen', dunkel = false, offenErste = false) => `<details class="wg-reveal"${offenErste && i === 0 ? ' open' : ''} style="border-bottom:1px solid ${dunkel ? 'rgba(255,255,255,.14)' : 'var(--p100)'};">
        <summary style="list-style:none;cursor:pointer;display:flex;align-items:center;gap:14px;padding:16px 2px;font-size:15.5px;font-weight:700;color:${dunkel ? '#fff' : '#0f172a'};">
          <span style="flex:1;">${ed(`${feld}.${i}.q`, it.q)}</span>
          <span class="wg-fa-plus" style="width:26px;height:26px;border-radius:50%;background:${dunkel ? 'rgba(255,255,255,.12)' : 'var(--p50)'};color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;transition:transform .25s;"><i class="fa-solid fa-plus"></i></span>
        </summary>
        <div style="padding:0 40px 18px 2px;font-size:14.5px;color:${dunkel ? 'rgba(255,255,255,.72)' : '#64748b'};line-height:1.75;">${ed(`${feld}.${i}.a`, it.a)}</div>
      </details>`

const FA_CSS = '<style>details[open] .wg-fa-plus{transform:rotate(45deg)}summary::-webkit-details-marker{display:none}</style>'

const faKopf = (c, mitte = true, dTitle = 'Häufige Fragen') => `
    <div class="wg-reveal" style="${mitte ? 'text-align:center;max-width:700px;margin:0 auto clamp(26px,4vw,46px);' : 'margin-bottom:clamp(22px,3.4vw,38px);'}">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'FAQ')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, dTitle)}</h2>
      <span class="wg-strichlinie${mitte ? ' mitte' : ''}"></span>
      ${c.subtitle ? `<div class="wg-lead">${ed('subtitle', c.subtitle)}</div>` : ''}
    </div>`

const FA = []
const faNeu = (id, name, render) => FA.push({ id, name, render })
const faSekt = (id, c, innen, fallback = 'background:#fff;', wrapStil = '') =>
  `<section data-block="fragen" data-variant="${id}" class="wg-sekt" style="${bg(c, fallback)}">
  <div class="wg-wrap"${wrapStil ? ` style="${wrapStil}"` : ''}>
${innen}
  </div>
  ${FA_CSS}
</section>`

// 1 — Klassisch: zentriert, eine Spalte
faNeu('fa-klassisch', 'Klassisch zentriert', (c) => faSekt('fa-klassisch', c, `${faKopf(c)}
    <div style="display:grid;">
      ${fragenListe(c, 5).map((it, i) => faZeile(it, i)).join('')}
    </div>`, 'background:#fff;', 'max-width:860px;'))

// 2 — Bild links, Fragen rechts
faNeu('fa-bild-links', 'Bild links', (c) => faSekt('fa-bild-links', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, 'clamp(280px,34vw,420px)', '', 21)}</div>
      <div class="wg-reveal re">
        ${faKopf(c, false)}
        <div style="display:grid;">
          ${fragenListe(c, 5).map((it, i) => faZeile(it, i)).join('')}
        </div>
      </div>
    </div>`, 'background:var(--p50);'))

// 3 — Intro-Karte links, Fragen rechts
faNeu('fa-intro', 'Mit Intro-Karte', (c) => faSekt('fa-intro', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(24px,4vw,56px);align-items:start;">
      <div class="wg-karte wg-reveal li" style="background:#fff;border:1px solid var(--p100);border-radius:18px;padding:clamp(24px,3.4vw,36px);position:sticky;top:90px;">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'FAQ')}</span>
        <h2 style="font-size:clamp(20px,2.6vw,28px);font-weight:900;letter-spacing:-.02em;margin:12px 0 10px;">${txt('title', c.title, 'Häufige Fragen')}</h2>
        <div style="font-size:14px;color:#64748b;line-height:1.75;">${txt('text', c.text, 'Ihre Frage ist nicht dabei? Schreiben Sie uns – wir antworten gern persönlich.')}</div>
        <a href="${esc(c.ctaHref || 'kontakt.html')}" class="wg-btn" style="margin-top:18px;">${txt('cta', c.cta, 'Frage stellen')}</a>
      </div>
      <div class="wg-reveal re" style="display:grid;">
        ${fragenListe(c, 6).map((it, i) => faZeile(it, i, 'fragen', false, true)).join('')}
      </div>
    </div>`, 'background:var(--p50);'))

// 4 — Zwei Spalten aufklappbar
faNeu('fa-zwei-spalten', 'Zwei Spalten', (c) => {
  const li = fragenListe(c, 6)
  const links = li.slice(0, Math.ceil(li.length / 2))
  const rechts = li.slice(Math.ceil(li.length / 2))
  return faSekt('fa-zwei-spalten', c, `${faKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,3.4vw,44px);align-items:start;">
      <div class="wg-reveal li" style="display:grid;">
        ${links.map((it, i) => faZeile(it, i)).join('')}
      </div>
      <div class="wg-reveal re" style="display:grid;">
        ${rechts.map((it, k) => faZeile(it, k + links.length)).join('')}
      </div>
    </div>`)
})

// 5 — Zwei Kategorien nebeneinander
faNeu('fa-kategorien', 'Zwei Kategorien', (c) => {
  const gr = misch(c.gruppen, [
    { titel: 'Erste Kategorie', fragen: D_FRAGEN.slice(0, 3) },
    { titel: 'Zweite Kategorie', fragen: D_FRAGEN.slice(0, 3) },
  ])
  return faSekt('fa-kategorien', c, `${faKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,2.8vw,32px);align-items:start;">
      ${gr.map((g, i) => `<div class="wg-karte wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:18px;padding:clamp(20px,3vw,30px);">
        <h3 style="font-size:13px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin:0 0 12px;">${ed(`gruppen.${i}.titel`, g.titel)}</h3>
        <div style="display:grid;">
          ${(Array.isArray(g.fragen) ? g.fragen : []).map((it, j) => `<details class="wg-reveal" style="border-bottom:1px solid var(--p50);">
            <summary style="list-style:none;cursor:pointer;display:flex;align-items:center;gap:12px;padding:13px 2px;font-size:14.5px;font-weight:700;color:#0f172a;">
              <span style="flex:1;">${ed(`gruppen.${i}.fragen.${j}.q`, it.q)}</span>
              <span class="wg-fa-plus" style="width:24px;height:24px;border-radius:50%;background:var(--p50);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;transition:transform .25s;"><i class="fa-solid fa-plus"></i></span>
            </summary>
            <div style="padding:0 34px 14px 2px;font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`gruppen.${i}.fragen.${j}.a`, it.a)}</div>
          </details>`).join('')}
        </div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);')
})

// 6 — Dunkle Karte links, Fragen rechts
faNeu('fa-dunkel', 'Dunkle Karte', (c) => faSekt('fa-dunkel', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.35fr;gap:clamp(20px,3.4vw,44px);align-items:stretch;">
      <div class="wg-karte wg-dunkelzone wg-reveal li" style="position:relative;overflow:hidden;background:var(--p900);border-radius:20px;padding:clamp(26px,3.6vw,40px);color:#fff;display:flex;flex-direction:column;justify-content:space-between;">
        ${feMuster()}
        <div style="position:relative;">
          <span class="wg-eyebrow" style="color:var(--accent);">${txt('tag', c.tag, 'FAQ')}</span>
          <h2 style="font-size:clamp(21px,2.8vw,30px);font-weight:900;letter-spacing:-.02em;color:#fff;margin:12px 0 10px;">${txt('title', c.title, 'Häufige Fragen')}</h2>
          <div style="font-size:14px;color:rgba(255,255,255,.75);line-height:1.75;">${txt('text', c.text, 'Ihre Frage ist nicht dabei? Melden Sie sich einfach.')}</div>
        </div>
        <a href="${esc(c.ctaHref || 'kontakt.html')}" class="wg-btn" style="position:relative;margin-top:24px;align-self:flex-start;">${txt('cta', c.cta, 'Frage stellen')}</a>
      </div>
      <div class="wg-reveal re" style="display:grid;align-content:start;">
        ${fragenListe(c, 5).map((it, i) => faZeile(it, i)).join('')}
      </div>
    </div>`))

// 7 — Mit Kontakt-Karte unter den Fragen
faNeu('fa-kontakt', 'Mit Kontakt-Karte', (c) => faSekt('fa-kontakt', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(24px,4vw,54px);align-items:start;">
      <div class="wg-reveal li">
        ${faKopf(c, false)}
        <div style="font-size:14px;color:#64748b;line-height:1.75;">${txt('text', c.text, 'Ihre Frage ist nicht dabei? Rufen Sie uns an – wir helfen weiter.')}</div>
        <div class="wg-karte" style="display:flex;gap:14px;align-items:center;background:#fff;border:1px solid var(--p100);border-radius:14px;padding:16px 18px;margin-top:20px;">
          <span style="width:44px;height:44px;border-radius:50%;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${icon('icon', c.icon || 'phone')}</span>
          <div>
            <div style="font-size:11.5px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;">${txt('kontaktLabel', c.kontaktLabel, 'Direkt erreichbar')}</div>
            <div style="font-size:16px;font-weight:800;">${txt('telefon', c.telefon, 'Ihre Telefonnummer')}</div>
          </div>
        </div>
      </div>
      <div class="wg-reveal re" style="display:grid;">
        ${fragenListe(c, 5).map((it, i) => faZeile(it, i)).join('')}
      </div>
    </div>`, 'background:var(--p50);'))

// 8 — Nummerierte Gruppen (Zeitstrahl-artig)
faNeu('fa-nummern', 'Nummerierte Gruppen', (c) => {
  const gr = misch(c.gruppen, [
    { titel: 'Erste Kategorie', text: 'Kurz beschreiben, worum es in dieser Gruppe geht.', fragen: D_FRAGEN.slice(0, 2) },
    { titel: 'Zweite Kategorie', text: 'Kurz beschreiben, worum es in dieser Gruppe geht.', fragen: D_FRAGEN.slice(0, 2) },
  ])
  return faSekt('fa-nummern', c, `${faKopf(c, false)}
    <div style="display:grid;gap:clamp(24px,3.6vw,42px);">
      ${gr.map((g, i) => `<div class="wg-split wg-reveal" style="display:grid;grid-template-columns:1fr 2fr;gap:clamp(18px,3vw,40px);align-items:start;">
        <div style="display:flex;gap:14px;align-items:flex-start;">
          <span style="font-size:20px;font-weight:900;color:var(--p200);line-height:1.2;">${String(i + 1).padStart(2, '0')}</span>
          <div>
            <h3 style="font-size:16.5px;font-weight:800;margin:0 0 5px;">${ed(`gruppen.${i}.titel`, g.titel)}</h3>
            <div style="font-size:13px;color:#94a3b8;line-height:1.65;">${ed(`gruppen.${i}.text`, g.text)}</div>
          </div>
        </div>
        <div style="display:grid;">
          ${(Array.isArray(g.fragen) ? g.fragen : []).map((it, j) => `<details class="wg-reveal" style="border-bottom:1px solid var(--p100);">
            <summary style="list-style:none;cursor:pointer;display:flex;align-items:center;gap:12px;padding:14px 2px;font-size:15px;font-weight:700;color:#0f172a;">
              <span style="flex:1;">${ed(`gruppen.${i}.fragen.${j}.q`, it.q)}</span>
              <span class="wg-fa-plus" style="width:24px;height:24px;border-radius:50%;background:var(--p50);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;transition:transform .25s;"><i class="fa-solid fa-plus"></i></span>
            </summary>
            <div style="padding:0 36px 15px 2px;font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`gruppen.${i}.fragen.${j}.a`, it.a)}</div>
          </details>`).join('')}
        </div>
      </div>`).join('')}
    </div>`)
})

// 9 — Offene Frage-Antwort-Spalten (ohne Aufklappen)
faNeu('fa-offen', 'Offen in Spalten', (c) => faSekt('fa-offen', c, `${faKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(22px,3.6vw,48px);">
      ${fragenListe(c, 6).map((it, i) => `<div class="wg-reveal">
        <h3 style="font-size:16.5px;font-weight:800;margin:0 0 7px;">${ed(`fragen.${i}.q`, it.q)}</h3>
        <div style="font-size:14px;color:#64748b;line-height:1.75;">${ed(`fragen.${i}.a`, it.a)}</div>
      </div>`).join('')}
    </div>`))

// 10 — Karten-Raster mit Icon je Frage
faNeu('fa-karten', 'Karten mit Icon', (c) => faSekt('fa-karten', c, `${faKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,2.6vw,28px);">
      ${fragenListe(c, 6).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:16px;padding:clamp(20px,2.8vw,28px);display:flex;gap:14px;align-items:flex-start;">
        <span style="width:38px;height:38px;border-radius:10px;background:var(--p50);color:var(--accent);display:inline-flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">${icon(`fragen.${i}.icon`, it.icon || 'circle-question')}</span>
        <div>
          <h3 style="font-size:15.5px;font-weight:800;margin:0 0 6px;">${ed(`fragen.${i}.q`, it.q)}</h3>
          <div style="font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`fragen.${i}.a`, it.a)}</div>
        </div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

export const FRAGEN = { type: 'fragen', label: 'FAQ / Häufige Fragen', variants: FA }

// ═══════════════════════════════════════════════════════════════════════════
// FULL WIDTH DUO (38 Varianten)
// Sektionen über die VOLLE Breite, exakt 50 % / 50 % geteilt. Die Bildseite
// füllt die ganze Höhe (object-fit:cover), die Textseite ist mittig gesetzt.
// Auf dem Handy stehen beide Hälften untereinander (wg-split).
// Bewusst OHNE Video-Playknöpfe.
// ═══════════════════════════════════════════════════════════════════════════

const DUO_HOEHE = 'clamp(420px,52vw,640px)'

// Sektion: volle Breite, kein Innenabstand, zwei gleich große Hälften
const duoSekt = (id, c, links, rechts, fallback = 'background:#fff;', hoehe = DUO_HOEHE) =>
  `<section data-block="duo" data-variant="${id}" class="wg-sekt" style="${bg(c, fallback)}padding-top:0;padding-bottom:0;">
  <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;min-height:${hoehe};">
${links}
${rechts}
  </div>
</section>`

// Bildhälfte über die volle Höhe
const duoBild = (key, src, n = 1, extra = '') =>
  `    <div class="wg-bildbox" style="position:relative;overflow:hidden;min-height:300px;${extra}">${bild(key, src, 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;')}</div>`

// Bildhälfte mit Textauflage
const duoBildText = (c, key, src, n = 1) =>
  `    <div class="wg-bildbox wg-dunkelzone" style="position:relative;overflow:hidden;min-height:300px;display:flex;align-items:flex-end;">
      ${bild(key, src, 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;')}
      <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(10,15,28,.8),transparent 65%);"></div>
      <div style="position:relative;color:#fff;padding:clamp(22px,3.4vw,42px);">
        <div style="font-size:clamp(17px,2.2vw,23px);font-weight:800;">${txt('bildTitel', c.bildTitel, 'Bildunterschrift')}</div>
        <div style="font-size:13.5px;color:rgba(255,255,255,.8);margin-top:5px;">${txt('bildUnter', c.bildUnter, 'Kurze Erläuterung')}</div>
      </div>
    </div>`

// Texthälfte (hell oder dunkel), Inhalt mittig gesetzt
const duoText = (innen, dunkel = false, grund = '') =>
  `    <div class="wg-reveal${dunkel ? ' wg-dunkelzone' : ''}" style="display:flex;align-items:center;padding:clamp(28px,5vw,72px);${dunkel ? 'background:var(--p900);color:#fff;' : (grund || '')}">
      <div style="width:100%;max-width:540px;">
${innen}
      </div>
    </div>`

const duoKopf = (c, dunkel = false, dTitle = 'Ihre Überschrift für diesen Bereich') => `
        <span class="wg-eyebrow"${dunkel ? ' style="color:var(--accent);"' : ''}>${txt('tag', c.tag, 'Über uns')}</span>
        <h2 class="wg-t2" style="margin-top:12px;${dunkel ? 'color:#fff;' : ''}">${txt('title', c.title, dTitle)}</h2>
        <span class="wg-strichlinie"></span>`

const duoLead = (c, dunkel = false) =>
  `        <div style="font-size:16px;line-height:1.75;color:${dunkel ? 'rgba(255,255,255,.78)' : '#64748b'};">${txt('text', c.text, LOREM.absatz)}</div>`

const duoKnoepfe = (c, dunkel = false) => `
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:26px;">
          <a href="${esc(c.ctaHref || 'kontakt.html')}" class="wg-btn">${txt('cta', c.cta, 'Jetzt anfragen')}</a>
          <a href="${esc(c.cta2Href || 'leistungen.html')}" class="wg-btn-leer"${dunkel ? ' style="color:#fff;border-color:rgba(255,255,255,.4);"' : ''}>${txt('cta2', c.cta2, 'Mehr erfahren')}</a>
        </div>`

const duoHaken = (c, dunkel = false) => `
        <ul style="list-style:none;padding:0;margin:22px 0 0;display:grid;gap:11px;">
          ${misch(c.punkte, ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4']).map((p, i) => `<li style="display:flex;gap:12px;align-items:flex-start;font-size:15px;color:${dunkel ? 'rgba(255,255,255,.85)' : '#334155'};">
            <span style="width:23px;height:23px;border-radius:50%;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;margin-top:2px;"><i class="fa-solid fa-check"></i></span>${ed(`punkte.${i}`, p)}</li>`).join('')}
        </ul>`

const duoStats = (c, dunkel = false, spalten = 3) => `
        <div style="display:grid;grid-template-columns:repeat(${spalten},1fr);gap:14px;margin-top:26px;">
          ${misch(c.stats, D_STATS).slice(0, spalten).map((st, i) => `<div style="text-align:center;padding:16px 8px;border-radius:13px;background:${dunkel ? 'rgba(255,255,255,.08)' : 'var(--p50)'};">
            <div style="font-size:clamp(22px,2.6vw,30px);font-weight:900;color:${dunkel ? '#fff' : 'var(--p700)'};">${ed(`stats.${i}.num`, st.num)}</div>
            <div style="font-size:12px;color:${dunkel ? 'rgba(255,255,255,.7)' : '#64748b'};margin-top:3px;">${ed(`stats.${i}.label`, st.label)}</div>
          </div>`).join('')}
        </div>`

const duoIcons = (c, dunkel = false) => `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:26px;">
          ${items(c, 4).map((it, i) => `<div>
            <span style="width:42px;height:42px;border-radius:12px;background:${dunkel ? 'rgba(255,255,255,.1)' : 'var(--p50)'};color:${dunkel ? 'var(--accent)' : 'var(--p700)'};display:inline-flex;align-items:center;justify-content:center;font-size:16px;">${icon(`items.${i}.icon`, it.icon)}</span>
            <h3 style="font-size:15px;font-weight:800;margin:10px 0 4px;${dunkel ? 'color:#fff;' : ''}">${ed(`items.${i}.titel`, it.titel)}</h3>
            <div style="font-size:12.5px;line-height:1.6;color:${dunkel ? 'rgba(255,255,255,.7)' : '#64748b'};">${ed(`items.${i}.text`, it.text)}</div>
          </div>`).join('')}
        </div>`

const DU = []
const duNeu = (id, name, render) => DU.push({ id, name, render })

// ── 1–4: Grundformen hell/dunkel, Bild links/rechts ────────────────────────
duNeu('du-bild-links', 'Bild links, Text rechts', (c) => duoSekt('du-bild-links', c,
  duoBild('bildHaupt', c.bildHaupt, 1),
  duoText(`${duoKopf(c)}${duoLead(c)}${duoKnoepfe(c)}`)))

duNeu('du-bild-rechts', 'Text links, Bild rechts', (c) => duoSekt('du-bild-rechts', c,
  duoText(`${duoKopf(c)}${duoLead(c)}${duoKnoepfe(c)}`),
  duoBild('bildHaupt', c.bildHaupt, 2)))

duNeu('du-dunkel-links', 'Bild links, dunkler Text', (c) => duoSekt('du-dunkel-links', c,
  duoBild('bildHaupt', c.bildHaupt, 3),
  duoText(`${duoKopf(c, true)}${duoLead(c, true)}${duoKnoepfe(c, true)}`, true)))

duNeu('du-dunkel-rechts', 'Dunkler Text, Bild rechts', (c) => duoSekt('du-dunkel-rechts', c,
  duoText(`${duoKopf(c, true)}${duoLead(c, true)}${duoKnoepfe(c, true)}`, true),
  duoBild('bildHaupt', c.bildHaupt, 4)))

// ── 5–8: mit Häkchenliste ──────────────────────────────────────────────────
duNeu('du-liste-links', 'Bild links, Häkchenliste', (c) => duoSekt('du-liste-links', c,
  duoBild('bildHaupt', c.bildHaupt, 5),
  duoText(`${duoKopf(c)}${duoLead(c)}${duoHaken(c)}${duoKnoepfe(c)}`)))

duNeu('du-liste-rechts', 'Häkchenliste, Bild rechts', (c) => duoSekt('du-liste-rechts', c,
  duoText(`${duoKopf(c)}${duoLead(c)}${duoHaken(c)}${duoKnoepfe(c)}`),
  duoBild('bildHaupt', c.bildHaupt, 6)))

duNeu('du-liste-dunkel', 'Dunkle Häkchenliste', (c) => duoSekt('du-liste-dunkel', c,
  duoBild('bildHaupt', c.bildHaupt, 7),
  duoText(`${duoKopf(c, true)}${duoHaken(c, true)}${duoKnoepfe(c, true)}`, true)))

duNeu('du-liste-grau', 'Häkchenliste auf Grau', (c) => duoSekt('du-liste-grau', c,
  duoText(`${duoKopf(c)}${duoHaken(c)}${duoKnoepfe(c)}`, false, 'background:var(--p50);'),
  duoBild('bildHaupt', c.bildHaupt, 8)))

// ── 9–12: mit Zahlen ───────────────────────────────────────────────────────
duNeu('du-zahlen-links', 'Bild links, Zahlen', (c) => duoSekt('du-zahlen-links', c,
  duoBild('bildHaupt', c.bildHaupt, 9),
  duoText(`${duoKopf(c)}${duoLead(c)}${duoStats(c)}`)))

duNeu('du-zahlen-rechts', 'Zahlen, Bild rechts', (c) => duoSekt('du-zahlen-rechts', c,
  duoText(`${duoKopf(c)}${duoLead(c)}${duoStats(c)}`),
  duoBild('bildHaupt', c.bildHaupt, 10)))

duNeu('du-zahlen-dunkel', 'Dunkle Zahlen-Seite', (c) => duoSekt('du-zahlen-dunkel', c,
  duoText(`${duoKopf(c, true)}${duoLead(c, true)}${duoStats(c, true)}`, true),
  duoBild('bildHaupt', c.bildHaupt, 11)))

duNeu('du-grosse-zahl', 'Mit großer Zahl', (c) => duoSekt('du-grosse-zahl', c,
  duoBild('bildHaupt', c.bildHaupt, 12),
  duoText(`
        <div style="font-size:clamp(56px,7vw,104px);font-weight:900;letter-spacing:-.04em;line-height:1;color:var(--p600);">${txt('zahl', c.zahl, '0')}</div>
        <div style="font-size:14px;font-weight:800;color:#64748b;margin:8px 0 16px;">${txt('zahlLabel', c.zahlLabel, 'Ihre Kennzahl – hier eintragen')}</div>
        <h2 class="wg-t2">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
        ${duoLead(c)}`)))

// ── 13–16: mit Icon-Merkmalen ──────────────────────────────────────────────
duNeu('du-icons-links', 'Bild links, Icon-Merkmale', (c) => duoSekt('du-icons-links', c,
  duoBild('bildHaupt', c.bildHaupt, 13),
  duoText(`${duoKopf(c)}${duoIcons(c)}`)))

duNeu('du-icons-rechts', 'Icon-Merkmale, Bild rechts', (c) => duoSekt('du-icons-rechts', c,
  duoText(`${duoKopf(c)}${duoIcons(c)}`),
  duoBild('bildHaupt', c.bildHaupt, 14)))

duNeu('du-icons-dunkel', 'Dunkle Icon-Merkmale', (c) => duoSekt('du-icons-dunkel', c,
  duoBild('bildHaupt', c.bildHaupt, 15),
  duoText(`${duoKopf(c, true)}${duoIcons(c, true)}`, true)))

duNeu('du-icon-liste', 'Merkmale untereinander', (c) => duoSekt('du-icon-liste', c,
  duoText(`${duoKopf(c)}
        <div style="display:grid;gap:18px;margin-top:22px;">
          ${items(c, 3).map((it, i) => `<div style="display:flex;gap:14px;align-items:flex-start;">
            <span style="width:42px;height:42px;border-radius:12px;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${icon(`items.${i}.icon`, it.icon)}</span>
            <div>
              <h3 style="font-size:15.5px;font-weight:800;margin:0 0 4px;">${ed(`items.${i}.titel`, it.titel)}</h3>
              <div style="font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
            </div>
          </div>`).join('')}
        </div>`),
  duoBild('bildHaupt', c.bildHaupt, 16)))

// ── 17–20: Schritte, Balken, Chips, Badge ──────────────────────────────────
duNeu('du-schritte', 'Mit nummerierten Schritten', (c) => duoSekt('du-schritte', c,
  duoBild('bildHaupt', c.bildHaupt, 17),
  duoText(`${duoKopf(c, false, 'So läuft es Schritt für Schritt')}
        <div style="display:grid;gap:16px;margin-top:22px;">
          ${items(c, 3).map((it, i) => `<div style="display:flex;gap:14px;align-items:flex-start;">
            <span style="width:34px;height:34px;border-radius:10px;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0;">${i + 1}</span>
            <div>
              <h3 style="font-size:15.5px;font-weight:800;margin:0 0 3px;">${ed(`items.${i}.titel`, it.titel)}</h3>
              <div style="font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
            </div>
          </div>`).join('')}
        </div>`)))

duNeu('du-balken', 'Mit Balken', (c) => duoSekt('du-balken', c,
  duoText(`${duoKopf(c)}
        <div style="display:grid;gap:18px;margin-top:24px;">
          ${misch(c.balken, [{ label: 'Ihr Merkmal', wert: 0 }, { label: 'Ihr Merkmal', wert: 0 }, { label: 'Ihr Merkmal', wert: 0 }]).map((b, i) => `<div>
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px;">
              <span style="font-size:14.5px;font-weight:700;">${ed(`balken.${i}.label`, b.label)}</span>
              <span style="font-size:12.5px;color:#94a3b8;font-weight:700;">${ed(`balken.${i}.wert`, b.wert)}%</span>
            </div>
            <div style="height:7px;border-radius:99px;background:var(--p100);overflow:hidden;">
              <div style="height:100%;width:${Math.max(0, Math.min(100, parseInt(b.wert, 10) || 0))}%;background:linear-gradient(90deg,var(--p600),var(--accent));border-radius:99px;"></div>
            </div>
          </div>`).join('')}
        </div>`),
  duoBild('bildHaupt', c.bildHaupt, 18)))

duNeu('du-chips', 'Mit Stichwort-Chips', (c) => duoSekt('du-chips', c,
  duoBild('bildHaupt', c.bildHaupt, 19),
  duoText(`${duoKopf(c)}${duoLead(c)}
        <div style="display:flex;flex-wrap:wrap;gap:9px;margin-top:22px;">
          ${misch(c.chips, ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4', 'Stichwort 5']).map((ch, i) =>
            `<span style="background:var(--p50);border:1px solid var(--p100);color:var(--p700);font-size:13px;font-weight:700;border-radius:99px;padding:8px 16px;">${ed(`chips.${i}`, ch)}</span>`).join('')}
        </div>`)))

duNeu('du-badge', 'Mit Badge', (c) => duoSekt('du-badge', c,
  duoText(`
        <span style="display:inline-block;background:var(--accent);color:#fff;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;border-radius:99px;padding:7px 15px;">${txt('badge', c.badge, 'Ihr Stichwort')}</span>
        <h2 class="wg-t2" style="margin-top:16px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
        <span class="wg-strichlinie"></span>${duoLead(c)}${duoKnoepfe(c)}`),
  duoBild('bildHaupt', c.bildHaupt, 20)))

// ── 21–24: Zitat, Person, Bewertung, Unterschrift ──────────────────────────
duNeu('du-zitat', 'Mit Zitat', (c) => duoSekt('du-zitat', c,
  duoBild('bildHaupt', c.bildHaupt, 21),
  duoText(`
        <i class="fa-solid fa-quote-left" style="font-size:32px;color:var(--accent);"></i>
        <blockquote style="margin:16px 0 0;font-size:clamp(19px,2.4vw,26px);font-weight:700;line-height:1.45;">${txt('zitat', c.zitat, 'Hier steht später ein echtes Zitat – im Editor anklicken und ersetzen.')}</blockquote>
        <div style="display:flex;align-items:center;gap:12px;margin-top:20px;">
          <span style="width:34px;height:3px;background:var(--accent);border-radius:2px;"></span>
          <div>
            <div style="font-weight:800;font-size:15px;">${txt('name', c.name, 'Vorname Nachname')}</div>
            <div style="font-size:12.5px;color:#94a3b8;">${txt('rolle', c.rolle, 'Ihre Position')}</div>
          </div>
        </div>`)))

duNeu('du-person', 'Person vorstellen', (c) => duoSekt('du-person', c,
  duoBild('bildHaupt', c.bildHaupt, 22),
  duoText(`
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Über uns')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('name', c.name, 'Vorname Nachname')}</h2>
        <div style="font-size:13px;color:#94a3b8;margin-top:-6px;">${txt('rolle', c.rolle, 'Ihre Position')}</div>
        <span class="wg-strichlinie"></span>${duoLead(c)}
        <div style="display:flex;gap:12px;margin-top:22px;">
          ${misch(c.sozial, [{ icon: 'phone' }, { icon: 'envelope' }, { icon: 'location-dot' }]).map((sz, i) =>
            `<span style="width:40px;height:40px;border-radius:50%;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:15px;">${icon(`sozial.${i}.icon`, sz.icon)}</span>`).join('')}
        </div>`)))

duNeu('du-bewertung', 'Mit Bewertung', (c) => duoSekt('du-bewertung', c,
  duoText(`
        <div style="display:inline-flex;align-items:center;gap:10px;background:var(--p50);border:1px solid var(--p100);border-radius:99px;padding:8px 16px;margin-bottom:18px;">
          <span style="color:var(--accent);font-size:13px;">${'<i class="fa-solid fa-star"></i>'.repeat(5)}</span>
          <span style="font-size:13px;font-weight:700;">${txt('badge', c.badge, 'Ihre echte Bewertung eintragen')}</span>
        </div>
        <h2 class="wg-t2">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
        <span class="wg-strichlinie"></span>${duoLead(c)}${duoKnoepfe(c)}`),
  duoBild('bildHaupt', c.bildHaupt, 23)))

duNeu('du-signatur', 'Mit Unterschrift', (c) => duoSekt('du-signatur', c,
  duoBild('bildHaupt', c.bildHaupt, 24),
  duoText(`${duoKopf(c)}${duoLead(c)}
        <div style="margin-top:24px;">
          <div style="font-family:'Segoe Script','Brush Script MT',cursive;font-size:26px;line-height:1.1;color:var(--p800);">${txt('signatur', c.signatur, 'Ihr Name')}</div>
          <div style="font-size:12px;color:#94a3b8;margin-top:5px;">${txt('rolle', c.rolle, 'Ihre Position')}</div>
        </div>`)))

// ── 25–28: Formular, Newsletter, Öffnungszeiten, Kontaktdaten ──────────────
duNeu('du-formular', 'Mit Kontaktformular', (c) => duoSekt('du-formular', c,
  duoBild('bildHaupt', c.bildHaupt, 25),
  duoText(`${duoKopf(c, false, 'Schreiben Sie uns')}
        <form data-contact-form style="display:grid;gap:11px;margin-top:20px;">
          <input type="text" name="name" placeholder="Name" style="border:1.5px solid var(--p100);border-radius:10px;padding:12px 14px;font-size:14px;font-family:inherit;outline:none;">
          <input type="email" name="email" placeholder="E-Mail" style="border:1.5px solid var(--p100);border-radius:10px;padding:12px 14px;font-size:14px;font-family:inherit;outline:none;">
          <textarea name="nachricht" rows="4" placeholder="Ihre Nachricht" style="border:1.5px solid var(--p100);border-radius:10px;padding:12px 14px;font-size:14px;font-family:inherit;outline:none;resize:vertical;"></textarea>
          <button type="submit" class="wg-btn" style="border:none;cursor:pointer;justify-self:start;">${txt('cta', c.cta, 'Nachricht senden')}</button>
        </form>`)))

duNeu('du-newsletter', 'Mit Newsletter-Feld', (c) => duoSekt('du-newsletter', c,
  duoText(`${duoKopf(c, true, 'Bleiben Sie auf dem Laufenden')}
        <div style="font-size:15px;color:rgba(255,255,255,.78);line-height:1.7;">${txt('text', c.text, 'Ein kurzer Satz dazu, was Empfänger erwartet.')}</div>
        <form data-contact-form style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px;">
          <input type="email" name="email" placeholder="E-Mail-Adresse" style="flex:1;min-width:200px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08);color:#fff;border-radius:10px;padding:13px 15px;font-size:14px;font-family:inherit;outline:none;">
          <button type="submit" class="wg-btn" style="border:none;cursor:pointer;">${txt('cta', c.cta, 'Eintragen')}</button>
        </form>
        <div style="font-size:11.5px;color:rgba(255,255,255,.55);margin-top:12px;">${txt('hinweis', c.hinweis, 'Abmeldung jederzeit möglich.')}</div>`, true),
  duoBild('bildHaupt', c.bildHaupt, 26)))

duNeu('du-zeiten', 'Mit Öffnungszeiten', (c) => duoSekt('du-zeiten', c,
  duoBild('bildHaupt', c.bildHaupt, 27),
  duoText(`${duoKopf(c, false, 'Wann Sie uns erreichen')}
        <div style="display:grid;gap:0;margin-top:20px;">
          ${misch(c.zeiten, [
            { tag: 'Montag – Freitag', zeit: 'Ihre Zeiten eintragen' },
            { tag: 'Samstag', zeit: 'Ihre Zeiten eintragen' },
            { tag: 'Sonntag', zeit: 'Ihre Zeiten eintragen' },
          ]).map((z, i) => `<div style="display:flex;justify-content:space-between;gap:16px;padding:13px 2px;${i ? 'border-top:1px solid var(--p100);' : ''}">
            <span style="font-size:14.5px;font-weight:700;">${ed(`zeiten.${i}.tag`, z.tag)}</span>
            <span style="font-size:14.5px;color:#64748b;">${ed(`zeiten.${i}.zeit`, z.zeit)}</span>
          </div>`).join('')}
        </div>`)))

duNeu('du-kontakt', 'Mit Kontaktdaten', (c) => duoSekt('du-kontakt', c,
  duoText(`${duoKopf(c, true, 'So erreichen Sie uns')}
        <div style="display:grid;gap:12px;margin-top:22px;">
          ${misch(c.kontakt, [
            { icon: 'phone', label: 'Telefon', wert: 'Ihre Telefonnummer' },
            { icon: 'envelope', label: 'E-Mail', wert: 'Ihre E-Mail-Adresse' },
            { icon: 'location-dot', label: 'Adresse', wert: 'Ihre Anschrift' },
          ]).map((k, i) => `<div style="display:flex;gap:13px;align-items:center;background:rgba(255,255,255,.07);border-radius:12px;padding:13px 16px;">
            <span style="width:38px;height:38px;border-radius:10px;background:rgba(255,255,255,.12);color:var(--accent);display:inline-flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;">${icon(`kontakt.${i}.icon`, k.icon)}</span>
            <div>
              <div style="font-size:11px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:.05em;">${ed(`kontakt.${i}.label`, k.label)}</div>
              <div style="font-size:14.5px;font-weight:700;color:#fff;">${ed(`kontakt.${i}.wert`, k.wert)}</div>
            </div>
          </div>`).join('')}
        </div>`, true),
  duoBild('bildHaupt', c.bildHaupt, 28)))

// ── 29–32: Akkordeon, Preis, Karten, Downloads ─────────────────────────────
duNeu('du-fragen', 'Mit Aufklapp-Fragen', (c) => duoSekt('du-fragen', c,
  duoBild('bildHaupt', c.bildHaupt, 29),
  duoText(`${duoKopf(c, false, 'Häufige Fragen')}
        <div style="display:grid;margin-top:18px;">
          ${misch(c.fragen, [
            { q: 'Hier steht eine häufige Frage?', a: 'Und hier die passende Antwort – im Editor anklicken und ersetzen.' },
            { q: 'Hier steht eine häufige Frage?', a: 'Und hier die passende Antwort – im Editor anklicken und ersetzen.' },
            { q: 'Hier steht eine häufige Frage?', a: 'Und hier die passende Antwort – im Editor anklicken und ersetzen.' },
          ]).map((it, i) => `<details style="border-bottom:1px solid var(--p100);">
            <summary style="list-style:none;cursor:pointer;display:flex;align-items:center;gap:12px;padding:14px 2px;font-size:15px;font-weight:700;">
              <span style="flex:1;">${ed(`fragen.${i}.q`, it.q)}</span>
              <span class="wg-fa-plus" style="width:24px;height:24px;border-radius:50%;background:var(--p50);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;transition:transform .25s;"><i class="fa-solid fa-plus"></i></span>
            </summary>
            <div style="padding:0 36px 14px 2px;font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`fragen.${i}.a`, it.a)}</div>
          </details>`).join('')}
        </div>
        <style>details[open] .wg-fa-plus{transform:rotate(45deg)}summary::-webkit-details-marker{display:none}</style>`)))

duNeu('du-preis', 'Mit Angebot', (c) => duoSekt('du-preis', c,
  duoText(`${duoKopf(c, false, 'Unser Angebot')}
        <div class="wg-karte" style="background:var(--p50);border-radius:18px;padding:clamp(20px,3vw,30px);margin-top:20px;">
          <div style="display:flex;align-items:baseline;gap:8px;">
            <span style="font-size:clamp(28px,3.6vw,42px);font-weight:900;color:var(--p700);">${txt('preis', c.preis, 'Ihr Preis')}</span>
            <span style="font-size:13px;color:#94a3b8;">${txt('preisHinweis', c.preisHinweis, 'Hinweis eintragen')}</span>
          </div>
          <ul style="list-style:none;padding:0;margin:16px 0 0;display:grid;gap:9px;">
            ${misch(c.punkte, ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4']).map((p, i) => `<li style="display:flex;gap:10px;align-items:flex-start;font-size:14px;color:#334155;">
              <span style="color:var(--accent);font-size:12px;margin-top:3px;"><i class="fa-solid fa-check"></i></span>${ed(`punkte.${i}`, p)}</li>`).join('')}
          </ul>
          <a href="${esc(c.ctaHref || 'kontakt.html')}" class="wg-btn" style="margin-top:18px;">${txt('cta', c.cta, 'Jetzt anfragen')}</a>
        </div>`),
  duoBild('bildHaupt', c.bildHaupt, 30)))

duNeu('du-karten', 'Mit kleinen Karten', (c) => duoSekt('du-karten', c,
  duoBild('bildHaupt', c.bildHaupt, 31),
  duoText(`${duoKopf(c)}
        <div style="display:grid;gap:12px;margin-top:22px;">
          ${items(c, 3).map((it, i) => `<div class="wg-karte" style="display:flex;gap:14px;align-items:flex-start;background:#fff;border:1px solid var(--p100);border-radius:14px;padding:16px 18px;">
            <span style="color:var(--p600);font-size:18px;margin-top:2px;">${icon(`items.${i}.icon`, it.icon)}</span>
            <div>
              <h3 style="font-size:15px;font-weight:800;margin:0 0 3px;">${ed(`items.${i}.titel`, it.titel)}</h3>
              <div style="font-size:13px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
            </div>
          </div>`).join('')}
        </div>`, false, 'background:var(--p50);')))

duNeu('du-downloads', 'Mit Download-Liste', (c) => duoSekt('du-downloads', c,
  duoText(`${duoKopf(c, false, 'Unterlagen zum Mitnehmen')}
        <div style="display:grid;gap:10px;margin-top:22px;">
          ${misch(c.dateien, [
            { titel: 'Ihr Dokument', unter: 'PDF' },
            { titel: 'Ihr Dokument', unter: 'PDF' },
          ]).map((d, i) => `<a href="${esc(d.href || '#')}" class="wg-karte" style="display:flex;gap:14px;align-items:center;background:#fff;border:1px solid var(--p100);border-radius:14px;padding:15px 18px;text-decoration:none;color:inherit;">
            <span style="width:40px;height:40px;border-radius:11px;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${icon(`dateien.${i}.icon`, d.icon || 'file-lines')}</span>
            <div style="flex:1;">
              <div style="font-size:15px;font-weight:800;">${ed(`dateien.${i}.titel`, d.titel)}</div>
              <div style="font-size:12px;color:#94a3b8;">${ed(`dateien.${i}.unter`, d.unter)}</div>
            </div>
            <i class="fa-solid fa-arrow-down" style="color:var(--p300);font-size:14px;"></i>
          </a>`).join('')}
        </div>`),
  duoBild('bildHaupt', c.bildHaupt, 32)))

// ── 33–38: Sonderformen ────────────────────────────────────────────────────
duNeu('du-bild-text', 'Bild mit Beschriftung', (c) => duoSekt('du-bild-text', c,
  duoBildText(c, 'bildHaupt', c.bildHaupt, 33),
  duoText(`${duoKopf(c)}${duoLead(c)}${duoKnoepfe(c)}`)))

duNeu('du-zwei-bilder', 'Zwei Bilder', (c) => duoSekt('du-zwei-bilder', c,
  duoBildText(c, 'bildHaupt', c.bildHaupt, 34),
  `    <div class="wg-bildbox wg-dunkelzone" style="position:relative;overflow:hidden;min-height:300px;display:flex;align-items:flex-end;">
      ${bild('bildZwei', c.bildZwei, 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;')}
      <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(10,15,28,.8),transparent 65%);"></div>
      <div style="position:relative;color:#fff;padding:clamp(22px,3.4vw,42px);">
        <div style="font-size:clamp(17px,2.2vw,23px);font-weight:800;">${txt('bildTitel2', c.bildTitel2, 'Bildunterschrift')}</div>
        <div style="font-size:13.5px;color:rgba(255,255,255,.8);margin-top:5px;">${txt('bildUnter2', c.bildUnter2, 'Kurze Erläuterung')}</div>
      </div>
    </div>`))

duNeu('du-zwei-texte', 'Zwei Textflächen', (c) => duoSekt('du-zwei-texte', c,
  duoText(`${duoKopf(c)}${duoLead(c)}${duoKnoepfe(c)}`, false, 'background:var(--p50);'),
  duoText(`
        <h2 class="wg-t2" style="color:#fff;">${txt('title2', c.title2, 'Zweite Überschrift')}</h2>
        <span class="wg-strichlinie"></span>
        <div style="font-size:16px;line-height:1.75;color:rgba(255,255,255,.78);">${txt('text2', c.text2, LOREM.absatz)}</div>`, true)))

duNeu('du-riesenwort', 'Mit Riesenwort', (c) => duoSekt('du-riesenwort', c,
  `    <div class="wg-dunkelzone wg-reveal" style="position:relative;overflow:hidden;background:var(--p900);color:#fff;display:flex;align-items:center;justify-content:center;padding:clamp(24px,4vw,48px);">
      ${feMuster()}
      <div style="position:relative;text-align:center;">
        <div style="font-size:clamp(38px,6vw,84px);font-weight:900;letter-spacing:-.04em;line-height:1;">${txt('wort', c.wort, 'Ihr Wort')}</div>
        <div style="font-size:13.5px;color:rgba(255,255,255,.7);margin-top:12px;">${txt('wortUnter', c.wortUnter, 'Kurze Erläuterung')}</div>
      </div>
    </div>`,
  duoBild('bildHaupt', c.bildHaupt, 35)))

duNeu('du-karte-osm', 'Mit Anfahrtskarte', (c) => duoSekt('du-karte-osm', c,
  duoText(`${duoKopf(c, false, 'So finden Sie uns')}
        <div style="font-size:15px;color:#64748b;line-height:1.75;">${txt('adresse', c.adresse, 'Ihre Anschrift eintragen')}</div>
        ${duoKnoepfe(c)}`),
  `    <div class="wg-bildbox" style="position:relative;overflow:hidden;min-height:300px;">
      ${bild('bildHaupt', c.bildHaupt, 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;')}
    </div>`))

duNeu('du-abschluss', 'Abschluss-Aufruf', (c) => duoSekt('du-abschluss', c,
  duoBild('bildHaupt', c.bildHaupt, 36),
  duoText(`
        <span class="wg-chip glas">${txt('tag', c.tag, 'Nächster Schritt')}</span>
        <h2 style="font-size:clamp(24px,3.4vw,42px);font-weight:900;letter-spacing:-.03em;line-height:1.15;color:#fff;margin:16px 0 12px;">${txt('title', c.title, 'Ihre Aufforderung in einem Satz')}</h2>
        <div style="font-size:15.5px;color:rgba(255,255,255,.78);line-height:1.7;">${txt('text', c.text, 'Ein kurzer Satz, der erklärt, was als Nächstes passiert.')}</div>
        ${duoKnoepfe(c, true)}`, true)))

export const DUO = { type: 'duo', label: 'Full Width Duo (50/50)', variants: DU }

export const MERKMALE = { type: 'merkmale', label: 'Features / Merkmale', variants: FE }

export const ZUSATZ4_BLOECKE = { merkmale: MERKMALE, fragen: FRAGEN, duo: DUO }

export const ZUSATZ4_ADDABLE = [
  { type: 'merkmale', label: 'Features / Merkmale', fa: 'list-check', cat: 'Inhalt' },
  { type: 'fragen', label: 'FAQ / Häufige Fragen', fa: 'circle-question', cat: 'Inhalt' },
  { type: 'duo', label: 'Full Width Duo (50/50)', fa: 'table-columns', cat: 'Inhalt' },
]

export const ZUSATZ4_DEFAULTS = {
  duo: {
    tag: 'Über uns',
    title: 'Ihre Überschrift für diesen Bereich',
    title2: 'Zweite Überschrift',
    text: LOREM.absatz,
    text2: LOREM.absatz,
    cta: 'Jetzt anfragen', ctaHref: 'kontakt.html',
    cta2: 'Mehr erfahren', cta2Href: 'leistungen.html',
    badge: 'Ihr Stichwort',
    hinweis: 'Abmeldung jederzeit möglich.',
    zahl: '0', zahlLabel: 'Ihre Kennzahl – hier eintragen',
    wort: 'Ihr Wort', wortUnter: 'Kurze Erläuterung',
    preis: 'Ihr Preis', preisHinweis: 'Hinweis eintragen',
    zitat: 'Hier steht später ein echtes Zitat – im Editor anklicken und ersetzen.',
    name: 'Vorname Nachname', rolle: 'Ihre Position', signatur: 'Ihr Name',
    adresse: 'Ihre Anschrift eintragen',
    bildTitel: 'Bildunterschrift', bildUnter: 'Kurze Erläuterung',
    bildTitel2: 'Bildunterschrift', bildUnter2: 'Kurze Erläuterung',
    punkte: ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4'],
    chips: ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4', 'Stichwort 5'],
    items: [
      { icon: 'bolt', titel: 'Ihr Merkmal', text: 'Beschreiben Sie hier dieses Merkmal kurz.' },
      { icon: 'shield-halved', titel: 'Ihr Merkmal', text: 'Beschreiben Sie hier dieses Merkmal kurz.' },
      { icon: 'gears', titel: 'Ihr Merkmal', text: 'Beschreiben Sie hier dieses Merkmal kurz.' },
      { icon: 'gem', titel: 'Ihr Merkmal', text: 'Beschreiben Sie hier dieses Merkmal kurz.' },
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
    sozial: [{ icon: 'phone' }, { icon: 'envelope' }, { icon: 'location-dot' }],
    zeiten: [
      { tag: 'Montag – Freitag', zeit: 'Ihre Zeiten eintragen' },
      { tag: 'Samstag', zeit: 'Ihre Zeiten eintragen' },
      { tag: 'Sonntag', zeit: 'Ihre Zeiten eintragen' },
    ],
    kontakt: [
      { icon: 'phone', label: 'Telefon', wert: 'Ihre Telefonnummer' },
      { icon: 'envelope', label: 'E-Mail', wert: 'Ihre E-Mail-Adresse' },
      { icon: 'location-dot', label: 'Adresse', wert: 'Ihre Anschrift' },
    ],
    fragen: [
      { q: 'Hier steht eine häufige Frage?', a: 'Und hier die passende Antwort – im Editor anklicken und ersetzen.' },
      { q: 'Hier steht eine häufige Frage?', a: 'Und hier die passende Antwort – im Editor anklicken und ersetzen.' },
      { q: 'Hier steht eine häufige Frage?', a: 'Und hier die passende Antwort – im Editor anklicken und ersetzen.' },
    ],
    dateien: [
      { icon: 'file-lines', titel: 'Ihr Dokument', unter: 'PDF', href: '#' },
      { icon: 'file-lines', titel: 'Ihr Dokument', unter: 'PDF', href: '#' },
    ],
  },
  fragen: {
    tag: 'FAQ',
    title: 'Häufige Fragen',
    text: 'Ihre Frage ist nicht dabei? Schreiben Sie uns – wir antworten gern persönlich.',
    cta: 'Frage stellen', ctaHref: 'kontakt.html',
    icon: 'phone',
    kontaktLabel: 'Direkt erreichbar',
    telefon: 'Ihre Telefonnummer',
    fragen: [
      { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und durch Ihre echten Inhalte ersetzen.', icon: 'circle-question' },
      { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und durch Ihre echten Inhalte ersetzen.', icon: 'circle-question' },
      { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und durch Ihre echten Inhalte ersetzen.', icon: 'circle-question' },
      { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und durch Ihre echten Inhalte ersetzen.', icon: 'circle-question' },
      { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und durch Ihre echten Inhalte ersetzen.', icon: 'circle-question' },
      { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und durch Ihre echten Inhalte ersetzen.', icon: 'circle-question' },
    ],
    gruppen: [
      {
        titel: 'Erste Kategorie', text: 'Kurz beschreiben, worum es in dieser Gruppe geht.',
        fragen: [
          { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und ersetzen.' },
          { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und ersetzen.' },
          { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und ersetzen.' },
        ],
      },
      {
        titel: 'Zweite Kategorie', text: 'Kurz beschreiben, worum es in dieser Gruppe geht.',
        fragen: [
          { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und ersetzen.' },
          { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und ersetzen.' },
          { q: 'Hier steht eine häufige Frage Ihrer Kunden?', a: 'Und hier die passende Antwort – beides im Editor anklicken und ersetzen.' },
        ],
      },
    ],
  },
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
