import { sektionBg } from './sektionBg'
import { LOREM, platzhalterBild } from './blocksPlus'
// ═══════════════════════════════════════════════════════════════════════════
// BAUSTEIN-BIBLIOTHEK — TEIL 3: BILD + TEXT KOMBIS (30 Varianten)
// Nach dem Kickstart-Vorbild: Bild-Text-Anordnungen in vielen Spielarten
// (Überlappungen, Badges, dunkle Karten, Zahlen, Zitate, Collagen …).
//
// Regeln wie überall:
//  • JEDER Text über ed()/txt() bearbeitbar, Listen über misch() + Pfade
//  • JEDES Bild als <img data-img="…"> → Hochladen/KI/Medien/Darstellung
//    (Cover/Contain/Höhe/Position) funktionieren automatisch
//  • saubere Container (wg-wrap/wg-split/wg-karte bzw. grid/flex) → pinke
//    Auswahl, Abstände, Effekte, Einbau-Elemente greifen überall
//  • Standardtexte sind NEUTRAL – keine erfundenen Zahlen/Namen/Behauptungen
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

// ── Wiederkehrende Bauteile ────────────────────────────────────────────────
const COVER = 'width:100%;height:100%;object-fit:cover;display:block;'
const RUND = 'border-radius:18px;'

// Bildfläche mit fester Höhe (per Panel/Layout überschreibbar)
const bildBox = (key, src, hoehe = 'clamp(280px,36vw,440px)', extra = '', n = 1) =>
  `<div class="wg-bildbox" style="height:${hoehe};${RUND}overflow:hidden;${extra}">${bild(key, src, COVER, n)}</div>`

// Eyebrow + Titel + Strich (linksbündig)
const kopfLinks = (c, dTag, dTitle) => `
        <span class="wg-eyebrow">${txt('tag', c.tag, dTag)}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, dTitle)}</h2>
        <span class="wg-strichlinie"></span>`

const knoepfe = (c, dunkel = false) => `
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:26px;">
          <a href="kontakt.html" class="wg-btn">${txt('cta', c.cta, 'Mehr erfahren')}</a>
          ${c.cta2 !== undefined || true ? `<a href="kontakt.html" class="wg-btn-leer" style="${dunkel ? 'color:#fff;border-color:rgba(255,255,255,.4);' : ''}">${txt('cta2', c.cta2, 'Kontakt aufnehmen')}</a>` : ''}
        </div>`

const D_PUNKTE = ['Punkt 1 eintragen', 'Punkt 2 eintragen', 'Punkt 3 eintragen', 'Punkt 4 eintragen']
const D_STATS = [{ num: '0', label: 'Ihre Kennzahl' }, { num: '0', label: 'Ihre Kennzahl' }, { num: '0', label: 'Ihre Kennzahl' }]

const haken = (c, spalten = 1) => `
        <ul style="list-style:none;padding:0;margin:22px 0 0;display:grid;grid-template-columns:repeat(${spalten},1fr);gap:12px;">
          ${misch(c.punkte, D_PUNKTE).map((p, i) => `<li style="display:flex;align-items:flex-start;gap:11px;font-size:15.5px;color:inherit;">
            <span style="width:22px;height:22px;border-radius:50%;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;margin-top:2px;"><i class="fa-solid fa-check"></i></span>${ed(`punkte.${i}`, p)}</li>`).join('')}
        </ul>`

const statsZeile = (c, hell = false) => `
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,3vw,30px);margin-top:clamp(28px,4vw,46px);">
        ${misch(c.stats, D_STATS).map((s, i) => `<div style="text-align:center;padding:18px 10px;border-radius:14px;background:${hell ? 'rgba(255,255,255,.08)' : 'var(--p50)'};">
          <div style="font-size:clamp(26px,3.4vw,38px);font-weight:900;letter-spacing:-.02em;color:${hell ? '#fff' : 'var(--p700)'};">${ed(`stats.${i}.num`, s.num)}</div>
          <div style="font-size:12.5px;margin-top:3px;color:${hell ? 'rgba(255,255,255,.7)' : '#64748b'};">${ed(`stats.${i}.label`, s.label)}</div>
        </div>`).join('')}
      </div>`

// ── Varianten-Sammlung ─────────────────────────────────────────────────────
const V = []
const neu = (id, name, render) => V.push({ id, name, render })
const sekt = (id, c, innen, fallback = 'background:#fff;') =>
  `<section data-block="kombi" data-variant="${id}" class="wg-sekt" style="${bg(c, fallback)}">
  <div class="wg-wrap">
${innen}
  </div>
</section>`

// 1 — Bild links, Text rechts
neu('ko-bild-links', 'Bild links, Text rechts', (c) => sekt('ko-bild-links', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, undefined, '', 1)}</div>
      <div class="wg-reveal re">
        ${kopfLinks(c, 'Über uns', 'Ihre Überschrift für diesen Bereich')}
        <div class="wg-lead">${txt('text', c.text, LOREM.absatz)}</div>
        ${knoepfe(c)}
      </div>
    </div>`))

// 2 — Text links, Bild rechts
neu('ko-bild-rechts', 'Text links, Bild rechts', (c) => sekt('ko-bild-rechts', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.05fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">
        ${kopfLinks(c, 'Über uns', 'Ihre Überschrift für diesen Bereich')}
        <div class="wg-lead">${txt('text', c.text, LOREM.absatz)}</div>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re">${bildBox('bildHaupt', c.bildHaupt, undefined, '', 2)}</div>
    </div>`))

// 3 — Zwei Bilder überlappend
neu('ko-ueberlappung', 'Zwei Bilder überlappend', (c) => sekt('ko-ueberlappung', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li" style="position:relative;min-height:clamp(320px,42vw,480px);">
        <div class="wg-bildbox" style="position:absolute;top:0;left:0;width:72%;height:74%;${RUND}overflow:hidden;box-shadow:0 22px 60px rgba(15,23,42,.18);">${bild('bildHaupt', c.bildHaupt, COVER, 1)}</div>
        <div class="wg-bildbox" style="position:absolute;bottom:0;right:0;width:56%;height:58%;${RUND}overflow:hidden;border:6px solid #fff;box-shadow:0 22px 60px rgba(15,23,42,.22);">${bild('bildZwei', c.bildZwei, COVER, 2)}</div>
      </div>
      <div class="wg-reveal re">
        ${kopfLinks(c, 'Einblicke', 'Zwei Blickwinkel, eine Handschrift')}
        <div class="wg-lead">${txt('text', c.text, LOREM.absatz)}</div>
        ${knoepfe(c)}
      </div>
    </div>`))

// 4 — Bild mit dunkler Info-Karte
neu('ko-badge-karte', 'Bild mit Info-Karte', (c) => sekt('ko-badge-karte', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li" style="position:relative;">
        ${bildBox('bildHaupt', c.bildHaupt, undefined, '', 3)}
        <div class="wg-karte wg-dunkelzone" style="position:absolute;right:-14px;bottom:-18px;max-width:64%;background:var(--p900);color:#fff;border-radius:16px;padding:20px 22px;box-shadow:0 18px 44px rgba(15,23,42,.3);">
          <div style="font-size:12px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);">${txt('badge', c.badge, 'Ihr Stichwort')}</div>
          <div style="font-size:14.5px;margin-top:6px;color:rgba(255,255,255,.85);line-height:1.6;">${txt('badgeText', c.badgeText, LOREM.kurz)}</div>
        </div>
      </div>
      <div class="wg-reveal re">
        ${kopfLinks(c, 'Über uns', 'Ihre Überschrift für diesen Bereich')}
        <div class="wg-lead">${txt('text', c.text, LOREM.absatz)}</div>
        ${knoepfe(c)}
      </div>
    </div>`))

// 5 — Zentrierter Text, Bild breit darunter
neu('ko-zentriert-bild', 'Zentriert mit Panorama-Bild', (c) => sekt('ko-zentriert-bild', c, `
    <div class="wg-reveal" style="text-align:center;max-width:760px;margin:0 auto clamp(28px,4vw,48px);">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Über uns')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
      <span class="wg-strichlinie mitte"></span>
      <div class="wg-lead">${txt('text', c.text, LOREM.satz)}</div>
    </div>
    <div class="wg-reveal">${bildBox('bildHaupt', c.bildHaupt, 'clamp(260px,38vw,460px)', '', 4)}</div>`))

// 6 — Dunkle Sektion, Bild im Rahmen
neu('ko-dunkel', 'Dunkle Fläche mit Bild', (c) => `
<section data-block="kombi" data-variant="ko-dunkel" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:linear-gradient(160deg,var(--p900),#0d1b2a 75%);')}">
  <div class="wg-wrap">
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li" style="color:#fff;">
        <span class="wg-chip glas">${txt('tag', c.tag, 'Über uns')}</span>
        <h2 class="wg-t2" style="color:#fff;margin-top:18px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead" style="color:rgba(255,255,255,.78);">${txt('text', c.text, LOREM.absatz)}</div>
        ${knoepfe(c, true)}
      </div>
      <div class="wg-reveal re" style="padding:clamp(10px,2vw,22px);border:1px solid rgba(255,255,255,.18);border-radius:24px;">
        ${bildBox('bildHaupt', c.bildHaupt, 'clamp(280px,36vw,430px)', '', 5)}
      </div>
    </div>
  </div>
</section>`)

// 7 — Bild + Häkchenliste
neu('ko-liste', 'Mit Häkchenliste', (c) => sekt('ko-liste', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, undefined, '', 6)}</div>
      <div class="wg-reveal re">
        ${kopfLinks(c, 'Vorteile', 'Was diesen Bereich ausmacht')}
        <div class="wg-lead">${txt('text', c.text, LOREM.satz)}</div>
        ${haken(c)}
        ${knoepfe(c)}
      </div>
    </div>`))

// 8 — Bild+Text mit Zahlen-Zeile darunter
neu('ko-stats', 'Mit Zahlen-Zeile', (c) => sekt('ko-stats', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.05fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">
        ${kopfLinks(c, 'Über uns', 'Ihre Überschrift für diesen Bereich')}
        <div class="wg-lead">${txt('text', c.text, LOREM.absatz)}</div>
      </div>
      <div class="wg-reveal re">${bildBox('bildHaupt', c.bildHaupt, 'clamp(240px,30vw,360px)', '', 7)}</div>
    </div>
    ${statsZeile(c)}`))

// 9 — Eine große Karte (Bild oben, Text unten)
neu('ko-grosse-karte', 'Große Karte', (c) => sekt('ko-grosse-karte', c, `
    <div class="wg-karte wg-reveal" style="max-width:820px;margin:0 auto;border-radius:22px;overflow:hidden;box-shadow:0 24px 70px rgba(15,23,42,.12);background:#fff;">
      <div class="wg-bildbox" style="height:clamp(220px,30vw,360px);overflow:hidden;">${bild('bildHaupt', c.bildHaupt, COVER, 8)}</div>
      <div style="padding:clamp(24px,4vw,44px);">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Über uns')}</span>
        <h2 class="wg-t2" style="margin-top:10px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
        <div class="wg-lead" style="margin-top:12px;">${txt('text', c.text, LOREM.absatz)}</div>
        ${knoepfe(c)}
      </div>
    </div>`, 'background:var(--p50);'))

// 10 — Zwei Karten nebeneinander
neu('ko-zwei-karten', 'Zwei Karten', (c) => {
  const karten = misch(c.karten, [
    { titel: 'Erster Bereich', text: LOREM.kurz, cta: 'Mehr erfahren' },
    { titel: 'Zweiter Bereich', text: LOREM.kurz, cta: 'Mehr erfahren' },
  ])
  return sekt('ko-zwei-karten', c, `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(18px,3vw,32px);" class="wg-split">
      ${karten.map((k, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="border-radius:20px;overflow:hidden;background:#fff;box-shadow:0 16px 46px rgba(15,23,42,.1);">
        <div class="wg-bildbox" style="height:clamp(180px,22vw,260px);overflow:hidden;">${bild(`karten.${i}.bild`, k.bild, COVER, i + 1)}</div>
        <div style="padding:clamp(20px,3vw,30px);">
          <h3 style="font-size:20px;font-weight:800;margin:0 0 8px;">${ed(`karten.${i}.titel`, k.titel)}</h3>
          <div style="font-size:14.5px;color:#64748b;line-height:1.7;">${ed(`karten.${i}.text`, k.text)}</div>
          <a href="kontakt.html" style="display:inline-flex;align-items:center;gap:8px;margin-top:14px;font-weight:700;color:var(--p600);text-decoration:none;font-size:14px;">${ed(`karten.${i}.cta`, k.cta)} <i class="fa-solid fa-arrow-right" style="font-size:12px;"></i></a>
        </div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);')
})

// 11 — Bild + Zitat
neu('ko-zitat', 'Mit Zitat', (c) => sekt('ko-zitat', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, 'clamp(280px,34vw,420px)', '', 9)}</div>
      <div class="wg-reveal re">
        <i class="fa-solid fa-quote-left" style="font-size:34px;color:var(--accent);"></i>
        <blockquote style="margin:18px 0 0;font-size:clamp(20px,2.6vw,28px);font-weight:700;line-height:1.45;letter-spacing:-.01em;">${txt('zitat', c.zitat, 'Hier steht später ein echtes Zitat – zum Beispiel Ihr Leitgedanke oder eine Kundenstimme.')}</blockquote>
        <div style="display:flex;align-items:center;gap:12px;margin-top:22px;">
          <span style="width:38px;height:3px;background:var(--accent);border-radius:2px;"></span>
          <div>
            <div style="font-weight:800;font-size:15px;">${txt('zname', c.zname, 'Name eintragen')}</div>
            <div style="font-size:12.5px;color:#94a3b8;">${txt('zrolle', c.zrolle, 'Rolle oder Firma')}</div>
          </div>
        </div>
      </div>
    </div>`))

// 12 — Riesige Zahl
neu('ko-grosse-zahl', 'Mit großer Zahl', (c) => sekt('ko-grosse-zahl', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:auto 1fr 1fr;gap:clamp(22px,4vw,54px);align-items:center;">
      <div class="wg-reveal" style="line-height:1;">
        <div style="font-size:clamp(64px,10vw,130px);font-weight:900;letter-spacing:-.04em;color:var(--p600);">${txt('zahl', c.zahl, '0')}</div>
        <div style="font-size:14px;font-weight:700;color:#64748b;margin-top:6px;">${txt('zahlLabel', c.zahlLabel, 'Ihre Kennzahl – hier eintragen')}</div>
      </div>
      <div class="wg-reveal li">
        ${kopfLinks(c, 'Zahlen', 'Ihre Überschrift für diesen Bereich')}
        <div class="wg-lead">${txt('text', c.text, LOREM.satz)}</div>
      </div>
      <div class="wg-reveal re">${bildBox('bildHaupt', c.bildHaupt, 'clamp(220px,26vw,320px)', '', 10)}</div>
    </div>`))

// 13 — Dunkles Band mit kleinem Bild
neu('ko-band', 'Dunkles Band', (c) => `
<section data-block="kombi" data-variant="ko-band" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:var(--p900);')}padding-top:clamp(34px,5vw,60px);padding-bottom:clamp(34px,5vw,60px);">
  <div class="wg-wrap">
    <div class="wg-split" style="display:grid;grid-template-columns:1.4fr 1fr;gap:clamp(24px,4vw,50px);align-items:center;">
      <div class="wg-reveal li" style="color:#fff;">
        <span class="wg-eyebrow" style="color:var(--accent);">${txt('tag', c.tag, 'Kurz gesagt')}</span>
        <h2 class="wg-t2" style="color:#fff;margin-top:10px;">${txt('title', c.title, 'Ihre Kernaussage in einem Satz')}</h2>
        <div style="color:rgba(255,255,255,.75);font-size:15.5px;line-height:1.7;margin-top:12px;">${txt('text', c.text, LOREM.kurz)}</div>
        ${knoepfe(c, true)}
      </div>
      <div class="wg-reveal re">${bildBox('bildHaupt', c.bildHaupt, 'clamp(200px,24vw,300px)', '', 11)}</div>
    </div>
  </div>
</section>`)

// 14 — Bild mit versetztem Rahmen
neu('ko-rahmen', 'Bild mit Rahmen', (c) => sekt('ko-rahmen', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(30px,5vw,64px);align-items:center;">
      <div class="wg-reveal li" style="position:relative;padding:0 18px 18px 0;">
        <div style="position:absolute;top:22px;left:22px;right:0;bottom:0;border:3px solid var(--accent);border-radius:20px;"></div>
        <div class="wg-bildbox" style="position:relative;height:clamp(280px,36vw,440px);${RUND}overflow:hidden;">${bild('bildHaupt', c.bildHaupt, COVER, 12)}</div>
      </div>
      <div class="wg-reveal re">
        ${kopfLinks(c, 'Über uns', 'Ihre Überschrift für diesen Bereich')}
        <div class="wg-lead">${txt('text', c.text, LOREM.absatz)}</div>
        ${knoepfe(c)}
      </div>
    </div>`))

// 15 — Rundes Bild
neu('ko-rund', 'Rundes Bild', (c) => sekt('ko-rund', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:auto 1fr;gap:clamp(30px,5vw,70px);align-items:center;">
      <div class="wg-reveal li" style="width:clamp(220px,28vw,360px);">
        <div class="wg-bildbox" style="height:clamp(220px,28vw,360px);border-radius:50%;overflow:hidden;border:8px solid var(--p50);box-shadow:0 20px 55px rgba(15,23,42,.15);">${bild('bildHaupt', c.bildHaupt, COVER, 13)}</div>
      </div>
      <div class="wg-reveal re">
        ${kopfLinks(c, 'Persönlich', 'Ihre Überschrift für diesen Bereich')}
        <div class="wg-lead">${txt('text', c.text, LOREM.absatz)}</div>
        ${knoepfe(c)}
      </div>
    </div>`))

// 16 — Collage 2×2
neu('ko-collage', 'Bild-Collage', (c) => sekt('ko-collage', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        <div class="wg-bildbox" style="height:clamp(140px,17vw,210px);${RUND}overflow:hidden;">${bild('bildHaupt', c.bildHaupt, COVER, 1)}</div>
        <div class="wg-bildbox" style="height:clamp(140px,17vw,210px);${RUND}overflow:hidden;margin-top:22px;">${bild('bildZwei', c.bildZwei, COVER, 2)}</div>
        <div class="wg-bildbox" style="height:clamp(140px,17vw,210px);${RUND}overflow:hidden;margin-top:-22px;">${bild('bildDrei', c.bildDrei, COVER, 3)}</div>
        <div class="wg-bildbox" style="height:clamp(140px,17vw,210px);${RUND}overflow:hidden;">${bild('bildVier', c.bildVier, COVER, 4)}</div>
      </div>
      <div class="wg-reveal re">
        ${kopfLinks(c, 'Einblicke', 'Vier Ausschnitte, ein Ganzes')}
        <div class="wg-lead">${txt('text', c.text, LOREM.absatz)}</div>
        ${knoepfe(c)}
      </div>
    </div>`))

// 17 — Text mit Stichwort-Chips
neu('ko-chips', 'Mit Stichwort-Chips', (c) => sekt('ko-chips', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.05fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">
        ${kopfLinks(c, 'Schwerpunkte', 'Ihre Überschrift für diesen Bereich')}
        <div class="wg-lead">${txt('text', c.text, LOREM.satz)}</div>
        <div style="display:flex;flex-wrap:wrap;gap:9px;margin-top:20px;">
          ${misch(c.chips, ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4']).map((p, i) =>
            `<span style="background:var(--p50);border:1px solid var(--p100);color:var(--p700);font-size:13px;font-weight:700;border-radius:99px;padding:8px 16px;">${ed(`chips.${i}`, p)}</span>`).join('')}
        </div>
      </div>
      <div class="wg-reveal re">${bildBox('bildHaupt', c.bildHaupt, undefined, '', 14)}</div>
    </div>`))

// 18 — Prozent-Badge auf dem Bild
neu('ko-prozent', 'Mit Prozent-Badge', (c) => sekt('ko-prozent', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li" style="position:relative;">
        ${bildBox('bildHaupt', c.bildHaupt, undefined, '', 15)}
        <div style="position:absolute;top:-16px;right:-10px;width:108px;height:108px;border-radius:50%;background:var(--accent);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 16px 40px rgba(15,23,42,.25);transform:rotate(6deg);">
          <div style="font-size:24px;font-weight:900;">${txt('prozent', c.prozent, '0 %')}</div>
          <div style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;opacity:.85;text-align:center;padding:0 8px;">${txt('prozentLabel', c.prozentLabel, 'Ihre Kennzahl')}</div>
        </div>
      </div>
      <div class="wg-reveal re">
        ${kopfLinks(c, 'Ergebnis', 'Ihre Überschrift für diesen Bereich')}
        <div class="wg-lead">${txt('text', c.text, LOREM.absatz)}</div>
        ${knoepfe(c)}
      </div>
    </div>`))

// 19 — Farbige Hälfte (vollflächig)
neu('ko-farbhaelfte', 'Farbige Hälfte', (c) => `
<section data-block="kombi" data-variant="ko-farbhaelfte" class="wg-sekt" style="${bg(c, 'background:#fff;')}padding-top:0;padding-bottom:0;">
  <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;min-height:clamp(360px,46vw,540px);">
    <div class="wg-dunkelzone" style="background:var(--p800);color:#fff;display:flex;align-items:center;padding:clamp(30px,5vw,70px);">
      <div class="wg-reveal li">
        <span class="wg-eyebrow" style="color:var(--accent);">${txt('tag', c.tag, 'Über uns')}</span>
        <h2 class="wg-t2" style="color:#fff;margin-top:12px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
        <span class="wg-strichlinie"></span>
        <div style="color:rgba(255,255,255,.78);font-size:15.5px;line-height:1.75;">${txt('text', c.text, LOREM.absatz)}</div>
        ${knoepfe(c, true)}
      </div>
    </div>
    <div class="wg-bildbox" style="overflow:hidden;min-height:280px;">${bild('bildHaupt', c.bildHaupt, COVER, 16)}</div>
  </div>
</section>`)

// 20 — Bild + Mini-Schritte
neu('ko-schritte', 'Mit Mini-Schritten', (c) => {
  const schritte = misch(c.schritte, [
    { titel: 'Schritt 1', text: 'Beschreiben Sie hier den ersten Schritt.' },
    { titel: 'Schritt 2', text: 'Beschreiben Sie hier den zweiten Schritt.' },
    { titel: 'Schritt 3', text: 'Beschreiben Sie hier den dritten Schritt.' },
  ])
  return sekt('ko-schritte', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.05fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, undefined, '', 17)}</div>
      <div class="wg-reveal re">
        ${kopfLinks(c, 'So läuft es', 'In wenigen Schritten ans Ziel')}
        <div style="display:grid;gap:16px;margin-top:20px;">
          ${schritte.map((s, i) => `<div style="display:flex;gap:15px;align-items:flex-start;">
            <span style="width:34px;height:34px;border-radius:10px;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0;">${i + 1}</span>
            <div>
              <div style="font-weight:800;font-size:15.5px;">${ed(`schritte.${i}.titel`, s.titel)}</div>
              <div style="font-size:14px;color:#64748b;line-height:1.65;margin-top:3px;">${ed(`schritte.${i}.text`, s.text)}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>`)
})

// 21 — Zwei Bilder gestapelt
neu('ko-gestapelt', 'Bilder gestapelt', (c) => sekt('ko-gestapelt', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.15fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li" style="display:grid;gap:16px;">
        <div class="wg-bildbox" style="height:clamp(170px,21vw,260px);${RUND}overflow:hidden;">${bild('bildHaupt', c.bildHaupt, COVER, 5)}</div>
        <div class="wg-bildbox" style="height:clamp(130px,16vw,200px);${RUND}overflow:hidden;width:82%;justify-self:end;">${bild('bildZwei', c.bildZwei, COVER, 6)}</div>
      </div>
      <div class="wg-reveal re">
        ${kopfLinks(c, 'Über uns', 'Ihre Überschrift für diesen Bereich')}
        <div class="wg-lead">${txt('text', c.text, LOREM.absatz)}</div>
        ${knoepfe(c)}
      </div>
    </div>`))

// 22 — Vollbild mit Textstreifen
neu('ko-vollbild', 'Vollbild mit Textstreifen', (c) => `
<section data-block="kombi" data-variant="ko-vollbild" class="wg-sekt" style="${bg(c, 'background:#fff;')}padding-top:0;padding-bottom:0;">
  <div style="position:relative;min-height:clamp(380px,52vw,560px);overflow:hidden;">
    <div class="wg-bildbox" style="position:absolute;inset:0;">${bild('bildHaupt', c.bildHaupt, COVER, 18)}</div>
    <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(10,15,28,.82) 0%,rgba(10,15,28,.25) 55%,transparent 100%);"></div>
    <div class="wg-wrap" style="position:relative;display:flex;align-items:flex-end;min-height:clamp(380px,52vw,560px);padding-bottom:clamp(26px,4vw,50px);">
      <div class="wg-reveal wg-dunkelzone" style="color:#fff;max-width:640px;">
        <span class="wg-chip glas">${txt('tag', c.tag, 'Einblick')}</span>
        <h2 class="wg-t2" style="color:#fff;margin-top:14px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
        <div style="color:rgba(255,255,255,.82);font-size:15.5px;line-height:1.7;margin-top:10px;">${txt('text', c.text, LOREM.satz)}</div>
        ${knoepfe(c, true)}
      </div>
    </div>
  </div>
</section>`)

// 23 — Karte mit Muster + Bild
neu('ko-muster-karte', 'Muster-Karte + Bild', (c) => sekt('ko-muster-karte', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(18px,3vw,32px);align-items:stretch;">
      <div class="wg-karte wg-dunkelzone wg-reveal li" style="background:var(--p900);border-radius:22px;padding:clamp(26px,4vw,46px);position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;">
        <div style="position:absolute;inset:0;opacity:.14;background-image:radial-gradient(circle at 1px 1px, #fff 1px, transparent 0);background-size:22px 22px;"></div>
        <div style="position:relative;color:#fff;">
          <span class="wg-eyebrow" style="color:var(--accent);">${txt('tag', c.tag, 'Über uns')}</span>
          <h2 class="wg-t2" style="color:#fff;margin-top:10px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
          <div style="color:rgba(255,255,255,.78);font-size:15px;line-height:1.7;margin-top:12px;">${txt('text', c.text, LOREM.satz)}</div>
          ${knoepfe(c, true)}
        </div>
      </div>
      <div class="wg-bildbox wg-reveal re" style="border-radius:22px;overflow:hidden;min-height:clamp(260px,32vw,420px);">${bild('bildHaupt', c.bildHaupt, COVER, 19)}</div>
    </div>`, 'background:var(--p50);'))

// 24 — Bild + zweispaltige Häkchenliste
neu('ko-liste-breit', 'Häkchenliste zweispaltig', (c) => sekt('ko-liste-breit', c, `
    <div class="wg-reveal" style="max-width:720px;margin:0 auto clamp(26px,4vw,44px);text-align:center;">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Vorteile')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
      <span class="wg-strichlinie mitte"></span>
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, 'clamp(240px,30vw,380px)', '', 20)}</div>
      <div class="wg-reveal re">${haken(c, 2)}${knoepfe(c)}</div>
    </div>`))

// 25 — Textkarte über großem Bild
neu('ko-textkarte', 'Textkarte über Bild', (c) => sekt('ko-textkarte', c, `
    <div style="position:relative;">
      <div class="wg-bildbox" style="height:clamp(300px,42vw,520px);${RUND}overflow:hidden;">${bild('bildHaupt', c.bildHaupt, COVER, 21)}</div>
      <div class="wg-karte wg-reveal" style="position:relative;background:#fff;border-radius:20px;padding:clamp(24px,4vw,42px);max-width:560px;margin:-70px auto 0;box-shadow:0 24px 70px rgba(15,23,42,.16);">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Über uns')}</span>
        <h2 class="wg-t2" style="margin-top:10px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
        <div style="font-size:15px;color:#64748b;line-height:1.7;margin-top:10px;">${txt('text', c.text, LOREM.satz)}</div>
        ${knoepfe(c)}
      </div>
    </div>`))

// 26 — Bild + Bewertungs-Badge
neu('ko-bewertung', 'Mit Bewertungs-Zeile', (c) => sekt('ko-bewertung', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.05fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">
        <div style="display:inline-flex;align-items:center;gap:10px;background:var(--p50);border:1px solid var(--p100);border-radius:99px;padding:8px 16px;margin-bottom:18px;">
          <span style="color:var(--accent);font-size:13px;">${'<i class="fa-solid fa-star"></i>'.repeat(5)}</span>
          <span style="font-size:13px;font-weight:700;">${txt('badge', c.badge, 'Ihre echte Bewertung eintragen')}</span>
        </div>
        ${kopfLinks(c, 'Vertrauen', 'Ihre Überschrift für diesen Bereich')}
        <div class="wg-lead">${txt('text', c.text, LOREM.absatz)}</div>
        ${knoepfe(c)}
      </div>
      <div class="wg-reveal re">${bildBox('bildHaupt', c.bildHaupt, undefined, '', 22)}</div>
    </div>`))

// 27 — Mini-Kachel + großer Titel
neu('ko-mini-kachel', 'Mini-Kachel + großer Titel', (c) => sekt('ko-mini-kachel', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:auto 1fr;gap:clamp(24px,4vw,52px);align-items:start;">
      <div class="wg-reveal li" style="width:clamp(120px,15vw,190px);">
        <div class="wg-bildbox" style="height:clamp(120px,15vw,190px);border-radius:16px;overflow:hidden;box-shadow:0 14px 38px rgba(15,23,42,.14);">${bild('bildHaupt', c.bildHaupt, COVER, 23)}</div>
      </div>
      <div class="wg-reveal re">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Kurz vorgestellt')}</span>
        <h2 style="font-size:clamp(28px,4.4vw,50px);font-weight:900;letter-spacing:-.03em;line-height:1.12;margin:12px 0 0;">${txt('title', c.title, 'Ein großer Satz, der hängen bleibt')}</h2>
        <div class="wg-lead" style="margin-top:16px;max-width:640px;">${txt('text', c.text, LOREM.satz)}</div>
        ${knoepfe(c)}
      </div>
    </div>`))

// 28 — Bild + zwei Icon-Boxen
neu('ko-icons', 'Mit Icon-Boxen', (c) => {
  const icons = misch(c.icons, [
    { icon: 'bolt', titel: 'Ihr Vorteil', text: LOREM.kurz },
    { icon: 'shield-halved', titel: 'Ihr Vorteil', text: LOREM.kurz },
  ])
  return sekt('ko-icons', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, undefined, '', 24)}</div>
      <div class="wg-reveal re">
        ${kopfLinks(c, 'Über uns', 'Ihre Überschrift für diesen Bereich')}
        <div class="wg-lead">${txt('text', c.text, LOREM.satz)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:22px;">
          ${icons.map((it, i) => `<div class="wg-karte" style="background:var(--p50);border-radius:14px;padding:18px;">
            <span style="width:40px;height:40px;border-radius:11px;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:16px;">${icon(`icons.${i}.icon`, it.icon)}</span>
            <div style="font-weight:800;font-size:15px;margin-top:11px;">${ed(`icons.${i}.titel`, it.titel)}</div>
            <div style="font-size:13px;color:#64748b;line-height:1.6;margin-top:4px;">${ed(`icons.${i}.text`, it.text)}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>`)
})

// 29 — Schmaler Bildstreifen + Text (magazinartig)
neu('ko-magazin', 'Magazin-Aufteilung', (c) => sekt('ko-magazin', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 2px 1.2fr;gap:clamp(22px,3.5vw,46px);align-items:center;">
      <div class="wg-reveal li">
        <div class="wg-bildbox" style="height:clamp(300px,40vw,500px);${RUND}overflow:hidden;">${bild('bildHaupt', c.bildHaupt, COVER, 25)}</div>
      </div>
      <div style="background:var(--p100);height:70%;align-self:center;"></div>
      <div class="wg-reveal re">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Im Detail')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
        <span class="wg-strichlinie"></span>
        <div style="columns:2;column-gap:28px;font-size:14.5px;color:#475569;line-height:1.75;" class="wg-hide-mob-spalten">${txt('text', c.text, LOREM.lang)}</div>
        ${knoepfe(c)}
      </div>
    </div>`))

// 30 — Abschluss-Aufruf mit Bild-Hintergrund
neu('ko-abschluss', 'Abschluss-Aufruf', (c) => `
<section data-block="kombi" data-variant="ko-abschluss" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    <div style="position:relative;border-radius:26px;overflow:hidden;min-height:clamp(280px,34vw,420px);display:flex;align-items:center;justify-content:center;">
      <div class="wg-bildbox" style="position:absolute;inset:0;">${bild('bildHaupt', c.bildHaupt, COVER, 26)}</div>
      <div style="position:absolute;inset:0;background:rgba(10,15,28,.66);"></div>
      <div class="wg-reveal wg-dunkelzone" style="position:relative;text-align:center;color:#fff;max-width:620px;padding:clamp(26px,5vw,50px);">
        <span class="wg-chip glas">${txt('tag', c.tag, 'Jetzt starten')}</span>
        <h2 class="wg-t2" style="color:#fff;margin-top:14px;">${txt('title', c.title, 'Ihre Aufforderung in einem Satz')}</h2>
        <div style="color:rgba(255,255,255,.82);font-size:15.5px;line-height:1.7;margin-top:10px;">${txt('text', c.text, LOREM.kurz)}</div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:24px;">
          <a href="kontakt.html" class="wg-btn">${txt('cta', c.cta, 'Jetzt anfragen')}</a>
          <a href="kontakt.html" class="wg-btn-leer" style="color:#fff;border-color:rgba(255,255,255,.4);">${txt('cta2', c.cta2, 'Mehr erfahren')}</a>
        </div>
      </div>
    </div>
  </div>
</section>`)

// ═══════════════════════════════════════════════════════════════════════════
// STEP BOX — ABLÄUFE & SCHRITTE (30 Varianten)
// Gleiche Regeln wie oben: alles bearbeitbar, Nummern kommen automatisch aus
// der Reihenfolge (Klonen/Löschen im pinken Panel nummeriert sauber um).
// ═══════════════════════════════════════════════════════════════════════════

const D_SCHRITT_TEXT = 'Beschreiben Sie hier diesen Schritt in ein bis zwei Sätzen.'
const D_SCHRITTE3 = [
  { icon: 'comments', titel: 'Schritt 1', text: D_SCHRITT_TEXT },
  { icon: 'clipboard-list', titel: 'Schritt 2', text: D_SCHRITT_TEXT },
  { icon: 'flag-checkered', titel: 'Schritt 3', text: D_SCHRITT_TEXT },
]
const D_SCHRITTE4 = [
  { icon: 'comments', titel: 'Schritt 1', text: D_SCHRITT_TEXT },
  { icon: 'clipboard-list', titel: 'Schritt 2', text: D_SCHRITT_TEXT },
  { icon: 'gears', titel: 'Schritt 3', text: D_SCHRITT_TEXT },
  { icon: 'flag-checkered', titel: 'Schritt 4', text: D_SCHRITT_TEXT },
]
const nn = (i) => String(i + 1).padStart(2, '0')

// Kopf (zentriert) für Ablauf-Sektionen
const sbKopf = (c, dTitle = 'So läuft es Schritt für Schritt') => `
    <div class="wg-reveal" style="text-align:center;max-width:720px;margin:0 auto clamp(28px,4.5vw,54px);">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Ablauf')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, dTitle)}</h2>
      <span class="wg-strichlinie mitte"></span>
      ${c.subtitle ? `<div class="wg-lead">${ed('subtitle', c.subtitle)}</div>` : ''}
    </div>`

const sbSchritte = (c, n = 4) => misch(c.schritte, n === 3 ? D_SCHRITTE3 : D_SCHRITTE4)

const SB = []
const sbNeu = (id, name, render) => SB.push({ id, name, render })
const sbSekt = (id, c, innen, fallback = 'background:#fff;') =>
  `<section data-block="ablauf" data-variant="${id}" class="wg-sekt" style="${bg(c, fallback)}">
  <div class="wg-wrap">
${innen}
  </div>
</section>`

// 1 — Drei Karten mit Nummern-Kreis
sbNeu('sb-drei-karten', 'Drei Karten', (c) => sbSekt('sb-drei-karten', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.6vw,28px);">
      ${sbSchritte(c, 3).map((s, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:18px;padding:clamp(22px,3vw,32px);text-align:center;">
        <span style="width:52px;height:52px;border-radius:50%;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:19px;">${i + 1}</span>
        <h3 style="font-size:18px;font-weight:800;margin:16px 0 8px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        <div style="font-size:14px;color:#64748b;line-height:1.7;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 2 — Vier Spalten mit Verbindungslinie
sbNeu('sb-vier-linie', 'Vier Spalten, verbunden', (c) => sbSekt('sb-vier-linie', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.2vw,26px);position:relative;">
      <div style="position:absolute;top:24px;left:12%;right:12%;height:2px;background:var(--p100);" class="wg-hide-mob"></div>
      ${sbSchritte(c, 4).map((s, i) => `<div class="wg-reveal" style="text-align:center;position:relative;">
        <span style="width:48px;height:48px;border-radius:50%;background:#fff;border:2px solid var(--p600);color:var(--p600);display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:17px;position:relative;">${i + 1}</span>
        <h3 style="font-size:16px;font-weight:800;margin:14px 0 6px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.65;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>`))

// 3 — Vertikaler Zeitstrahl
sbNeu('sb-zeitstrahl', 'Vertikaler Zeitstrahl', (c) => sbSekt('sb-zeitstrahl', c, `${sbKopf(c)}
    <div style="max-width:680px;margin:0 auto;position:relative;padding-left:34px;">
      <div style="position:absolute;left:11px;top:8px;bottom:8px;width:2px;background:var(--p100);"></div>
      <div style="display:grid;gap:clamp(20px,3vw,32px);">
        ${sbSchritte(c, 4).map((s, i) => `<div class="wg-reveal" style="position:relative;">
          <span style="position:absolute;left:-34px;top:2px;width:24px;height:24px;border-radius:50%;background:var(--p600);border:5px solid var(--p50);"></span>
          <h3 style="font-size:17px;font-weight:800;margin:0 0 6px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
          <div style="font-size:14.5px;color:#64748b;line-height:1.7;">${ed(`schritte.${i}.text`, s.text)}</div>
        </div>`).join('')}
      </div>
    </div>`))

// 4 — Zickzack (alternierend)
sbNeu('sb-zickzack', 'Zickzack-Zeitstrahl', (c) => sbSekt('sb-zickzack', c, `${sbKopf(c)}
    <div style="position:relative;max-width:860px;margin:0 auto;">
      <div style="position:absolute;left:50%;top:0;bottom:0;width:2px;background:var(--p100);transform:translateX(-50%);" class="wg-hide-mob"></div>
      <div style="display:grid;gap:clamp(18px,3vw,30px);">
        ${sbSchritte(c, 4).map((s, i) => `<div class="wg-reveal ${i % 2 ? 're' : 'li'}" style="display:grid;grid-template-columns:1fr 1fr;gap:34px;align-items:center;">
          <div style="${i % 2 ? 'order:2;text-align:left;' : 'text-align:right;'}">
            <div class="wg-karte" style="display:inline-block;background:#fff;border:1px solid var(--p100);border-radius:16px;padding:20px 24px;max-width:360px;text-align:left;box-shadow:0 12px 34px rgba(15,23,42,.07);">
              <h3 style="font-size:16.5px;font-weight:800;margin:0 0 6px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
              <div style="font-size:13.5px;color:#64748b;line-height:1.65;">${ed(`schritte.${i}.text`, s.text)}</div>
            </div>
          </div>
          <div style="${i % 2 ? 'order:1;text-align:right;' : ''}">
            <span style="width:44px;height:44px;border-radius:50%;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:900;">${i + 1}</span>
          </div>
        </div>`).join('')}
      </div>
    </div>`, 'background:var(--p50);'))

// 5 — Spalten mit Pfeilen
sbNeu('sb-pfeile', 'Mit Pfeilen', (c) => {
  const liste = sbSchritte(c, 3)
  return sbSekt('sb-pfeile', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:${liste.map(() => '1fr').join(' auto ')};gap:clamp(10px,2vw,22px);align-items:center;">
      ${liste.map((s, i) => `<div class="wg-reveal" style="text-align:center;">
        <span style="width:50px;height:50px;border-radius:14px;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:19px;">${icon(`schritte.${i}.icon`, s.icon)}</span>
        <h3 style="font-size:16.5px;font-weight:800;margin:13px 0 6px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.65;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>${i < liste.length - 1 ? '<i class="fa-solid fa-chevron-right wg-hide-mob" style="color:var(--p200);font-size:20px;"></i>' : ''}`).join('')}
    </div>`)
})

// 6 — Icon-Kreise
sbNeu('sb-icons', 'Icon-Kreise', (c) => sbSekt('sb-icons', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(16px,2.6vw,30px);">
      ${sbSchritte(c, 4).map((s, i) => `<div class="wg-reveal" style="text-align:center;">
        <span style="width:70px;height:70px;border-radius:50%;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:25px;box-shadow:0 14px 34px rgba(15,23,42,.16);">${icon(`schritte.${i}.icon`, s.icon)}</span>
        <div style="font-size:12px;font-weight:900;letter-spacing:.1em;color:var(--accent);margin-top:14px;">${nn(i)}</div>
        <h3 style="font-size:16.5px;font-weight:800;margin:5px 0 6px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.65;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>`))

// 7 — Dunkle Fläche
sbNeu('sb-dunkel', 'Dunkle Fläche', (c) => `
<section data-block="ablauf" data-variant="sb-dunkel" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:linear-gradient(160deg,var(--p900),#0d1b2a 75%);')}">
  <div class="wg-wrap">
    <div class="wg-reveal" style="text-align:center;max-width:720px;margin:0 auto clamp(28px,4.5vw,54px);color:#fff;">
      <span class="wg-chip glas">${txt('tag', c.tag, 'Ablauf')}</span>
      <h2 class="wg-t2" style="color:#fff;margin-top:14px;">${txt('title', c.title, 'So läuft es Schritt für Schritt')}</h2>
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,26px);">
      ${sbSchritte(c, 4).map((s, i) => `<div class="wg-karte wg-reveal" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:clamp(18px,2.6vw,28px);color:#fff;">
        <div style="font-size:30px;font-weight:900;color:var(--accent);">${nn(i)}</div>
        <h3 style="font-size:16px;font-weight:800;margin:10px 0 6px;color:#fff;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        <div style="font-size:13.5px;color:rgba(255,255,255,.72);line-height:1.65;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`)

// 8 — Bild links, Schritte rechts
sbNeu('sb-bild-links', 'Bild links', (c) => sbSekt('sb-bild-links', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.05fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, 'clamp(300px,40vw,480px)', '', 27)}</div>
      <div class="wg-reveal re">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Ablauf')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'So läuft es Schritt für Schritt')}</h2>
        <span class="wg-strichlinie"></span>
        <div style="display:grid;gap:18px;margin-top:6px;">
          ${sbSchritte(c, 4).map((s, i) => `<div style="display:flex;gap:15px;align-items:flex-start;">
            <span style="width:36px;height:36px;border-radius:11px;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;flex-shrink:0;">${i + 1}</span>
            <div>
              <h3 style="font-size:15.5px;font-weight:800;margin:0;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
              <div style="font-size:13.5px;color:#64748b;line-height:1.65;margin-top:3px;">${ed(`schritte.${i}.text`, s.text)}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>`))

// 9 — Schritte links, Bild rechts
sbNeu('sb-bild-rechts', 'Bild rechts', (c) => sbSekt('sb-bild-rechts', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Ablauf')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'So läuft es Schritt für Schritt')}</h2>
        <span class="wg-strichlinie"></span>
        <div style="display:grid;gap:16px;margin-top:6px;">
          ${sbSchritte(c, 3).map((s, i) => `<div class="wg-karte" style="display:flex;gap:15px;align-items:flex-start;background:var(--p50);border-radius:14px;padding:16px 18px;">
            <span style="font-size:24px;font-weight:900;color:var(--p300);line-height:1;">${nn(i)}</span>
            <div>
              <h3 style="font-size:15.5px;font-weight:800;margin:0;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
              <div style="font-size:13.5px;color:#64748b;line-height:1.65;margin-top:3px;">${ed(`schritte.${i}.text`, s.text)}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
      <div class="wg-reveal re">${bildBox('bildHaupt', c.bildHaupt, 'clamp(300px,40vw,480px)', '', 28)}</div>
    </div>`))

// 10 — Riesige Nummern hinter dem Text
sbNeu('sb-grosse-nummern', 'Riesige Nummern', (c) => sbSekt('sb-grosse-nummern', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(18px,3vw,34px);">
      ${sbSchritte(c, 3).map((s, i) => `<div class="wg-reveal" style="position:relative;padding-top:34px;">
        <div style="position:absolute;top:-6px;left:-4px;font-size:96px;font-weight:900;color:var(--p50);line-height:1;user-select:none;">${nn(i)}</div>
        <div style="position:relative;">
          <h3 style="font-size:18px;font-weight:800;margin:0 0 8px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
          <div style="font-size:14px;color:#64748b;line-height:1.7;">${ed(`schritte.${i}.text`, s.text)}</div>
        </div>
      </div>`).join('')}
    </div>`))

// 11 — Fortschrittsbalken
sbNeu('sb-fortschritt', 'Fortschrittsbalken', (c) => {
  const liste = sbSchritte(c, 4)
  return sbSekt('sb-fortschritt', c, `${sbKopf(c)}
    <div style="position:relative;margin:0 auto;max-width:980px;">
      <div style="height:6px;background:var(--p100);border-radius:99px;position:relative;margin:0 6% 30px;">
        <div style="position:absolute;left:0;top:0;bottom:0;width:100%;background:linear-gradient(90deg,var(--p600),var(--accent));border-radius:99px;opacity:.85;"></div>
        ${liste.map((_, i) => `<span style="position:absolute;left:${liste.length > 1 ? (i / (liste.length - 1)) * 100 : 0}%;top:50%;transform:translate(-50%,-50%);width:22px;height:22px;border-radius:50%;background:#fff;border:5px solid var(--p600);"></span>`).join('')}
      </div>
      <div class="wg-split" style="display:grid;grid-template-columns:repeat(${liste.length},1fr);gap:clamp(12px,2vw,24px);">
        ${liste.map((s, i) => `<div class="wg-reveal" style="text-align:center;">
          <h3 style="font-size:15.5px;font-weight:800;margin:0 0 5px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
          <div style="font-size:13px;color:#64748b;line-height:1.6;">${ed(`schritte.${i}.text`, s.text)}</div>
        </div>`).join('')}
      </div>
    </div>`)
})

// 12 — Karten mit farbigem Oberrand
sbNeu('sb-oberrand', 'Karten mit Akzentrand', (c) => sbSekt('sb-oberrand', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,26px);">
      ${sbSchritte(c, 4).map((s, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-top:4px solid var(--accent);border-radius:14px;padding:clamp(18px,2.6vw,26px);">
        <span style="display:inline-flex;background:var(--p50);color:var(--p700);font-weight:900;font-size:12px;border-radius:99px;padding:4px 12px;">${nn(i)}</span>
        <h3 style="font-size:16px;font-weight:800;margin:12px 0 6px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.65;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 13 — Schmale zentrierte Liste
sbNeu('sb-liste-schmal', 'Schmale Liste', (c) => sbSekt('sb-liste-schmal', c, `${sbKopf(c)}
    <div style="max-width:620px;margin:0 auto;display:grid;gap:14px;">
      ${sbSchritte(c, 4).map((s, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="display:flex;gap:16px;align-items:center;background:#fff;border:1px solid var(--p100);border-radius:14px;padding:16px 20px;">
        <span style="width:40px;height:40px;border-radius:50%;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:900;flex-shrink:0;">${i + 1}</span>
        <div style="flex:1;">
          <h3 style="font-size:15.5px;font-weight:800;margin:0;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
          <div style="font-size:13.5px;color:#64748b;line-height:1.6;margin-top:2px;">${ed(`schritte.${i}.text`, s.text)}</div>
        </div>
        <i class="fa-solid fa-arrow-down" style="color:var(--p200);font-size:14px;"></i>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 14 — Punkte auf horizontaler Linie
sbNeu('sb-punkte-linie', 'Punkte auf Linie', (c) => {
  const liste = sbSchritte(c, 4)
  return sbSekt('sb-punkte-linie', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(${liste.length},1fr);gap:clamp(12px,2vw,24px);position:relative;">
      <div style="position:absolute;top:8px;left:10%;right:10%;height:2px;background:repeating-linear-gradient(90deg,var(--p200) 0 10px,transparent 10px 20px);" class="wg-hide-mob"></div>
      ${liste.map((s, i) => `<div class="wg-reveal" style="text-align:center;position:relative;">
        <span style="width:18px;height:18px;border-radius:50%;background:var(--accent);display:inline-block;box-shadow:0 0 0 6px var(--p50);"></span>
        <div style="font-size:12px;font-weight:900;letter-spacing:.08em;color:#94a3b8;margin-top:14px;">${nn(i)}</div>
        <h3 style="font-size:16px;font-weight:800;margin:4px 0 6px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.65;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>`)
})

// 15 — Checkliste
sbNeu('sb-checkliste', 'Als Checkliste', (c) => sbSekt('sb-checkliste', c, `${sbKopf(c)}
    <div style="max-width:680px;margin:0 auto;display:grid;gap:0;">
      ${sbSchritte(c, 4).map((s, i) => `<div class="wg-reveal" style="display:flex;gap:16px;align-items:flex-start;padding:18px 4px;border-bottom:1px solid var(--p50);">
        <span style="width:30px;height:30px;border-radius:50%;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-top:2px;"><i class="fa-solid fa-check"></i></span>
        <div>
          <h3 style="font-size:16px;font-weight:800;margin:0;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
          <div style="font-size:14px;color:#64748b;line-height:1.7;margin-top:3px;">${ed(`schritte.${i}.text`, s.text)}</div>
        </div>
      </div>`).join('')}
    </div>`))

// 16 — Pillen-Kopfzeile über Karten
sbNeu('sb-pillen', 'Pillen + Karten', (c) => {
  const liste = sbSchritte(c, 3)
  return sbSekt('sb-pillen', c, `${sbKopf(c)}
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:clamp(20px,3vw,32px);">
      ${liste.map((s, i) => `<span style="background:${i === 0 ? 'var(--p600)' : 'var(--p50)'};color:${i === 0 ? '#fff' : 'var(--p700)'};font-weight:800;font-size:13px;border-radius:99px;padding:9px 18px;">${i + 1}. ${ed(`schritte.${i}.titel`, s.titel)}</span>`).join('')}
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2.4vw,26px);">
      ${liste.map((s, i) => `<div class="wg-karte wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:16px;padding:clamp(18px,2.6vw,28px);">
        <div style="font-size:26px;font-weight:900;color:var(--p200);">${nn(i)}</div>
        <div style="font-size:13.5px;color:#64748b;line-height:1.7;margin-top:8px;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);')
})

// 17 — Treppenartig versetzt
sbNeu('sb-versetzt', 'Treppen-Versatz', (c) => sbSekt('sb-versetzt', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.6vw,30px);align-items:start;">
      ${sbSchritte(c, 3).map((s, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border-radius:18px;padding:clamp(20px,3vw,30px);box-shadow:0 16px 44px rgba(15,23,42,.09);margin-top:${i * 26}px;">
        <span style="width:46px;height:46px;border-radius:13px;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:17px;">${i + 1}</span>
        <h3 style="font-size:17px;font-weight:800;margin:14px 0 7px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        <div style="font-size:14px;color:#64748b;line-height:1.7;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 18 — 2×2 Raster mit Nummern-Ecke
sbNeu('sb-raster', '2×2 Raster', (c) => sbSekt('sb-raster', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(14px,2.4vw,26px);max-width:900px;margin:0 auto;">
      ${sbSchritte(c, 4).map((s, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="position:relative;background:#fff;border:1px solid var(--p100);border-radius:16px;padding:clamp(20px,3vw,30px);overflow:hidden;">
        <span style="position:absolute;top:-12px;right:-4px;font-size:64px;font-weight:900;color:var(--p50);line-height:1;">${nn(i)}</span>
        <h3 style="position:relative;font-size:16.5px;font-weight:800;margin:0 0 7px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        <div style="position:relative;font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>`))

// 19 — Outline-Kreise mittig
sbNeu('sb-outline', 'Outline-Kreise', (c) => sbSekt('sb-outline', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(18px,3vw,36px);">
      ${sbSchritte(c, 3).map((s, i) => `<div class="wg-reveal" style="text-align:center;">
        <span style="width:84px;height:84px;border-radius:50%;border:3px solid var(--p600);color:var(--p600);display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:28px;">${i + 1}</span>
        <h3 style="font-size:17px;font-weight:800;margin:16px 0 7px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        <div style="font-size:14px;color:#64748b;line-height:1.7;max-width:280px;margin:0 auto;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>`))

// 20 — Dunkle Einzelkarten
sbNeu('sb-dunkle-karten', 'Dunkle Karten', (c) => sbSekt('sb-dunkle-karten', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2.4vw,26px);">
      ${sbSchritte(c, 3).map((s, i) => `<div class="wg-karte wg-dunkelzone wg-karte-hover wg-reveal" style="background:var(--p900);border-radius:18px;padding:clamp(22px,3vw,32px);color:#fff;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.1);color:var(--accent);display:inline-flex;align-items:center;justify-content:center;font-size:17px;">${icon(`schritte.${i}.icon`, s.icon)}</span>
          <span style="font-size:26px;font-weight:900;color:rgba(255,255,255,.16);">${nn(i)}</span>
        </div>
        <h3 style="font-size:17px;font-weight:800;margin:16px 0 7px;color:#fff;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        <div style="font-size:13.5px;color:rgba(255,255,255,.72);line-height:1.7;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>`))

// 21 — Mit Abschluss-Karte (CTA)
sbNeu('sb-mit-cta', 'Mit Abschluss-Karte', (c) => sbSekt('sb-mit-cta', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,26px);align-items:stretch;">
      ${sbSchritte(c, 3).map((s, i) => `<div class="wg-karte wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:16px;padding:clamp(18px,2.6vw,26px);">
        <span style="width:40px;height:40px;border-radius:50%;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-weight:900;">${i + 1}</span>
        <h3 style="font-size:16px;font-weight:800;margin:12px 0 6px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.65;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
      <div class="wg-karte wg-dunkelzone wg-reveal" style="background:var(--p700);border-radius:16px;padding:clamp(18px,2.6vw,26px);color:#fff;display:flex;flex-direction:column;justify-content:center;text-align:center;">
        <div style="font-size:17px;font-weight:800;">${txt('ctaTitel', c.ctaTitel, 'Bereit loszulegen?')}</div>
        <a href="kontakt.html" class="wg-btn" style="margin:16px auto 0;">${txt('cta', c.cta, 'Jetzt anfragen')}</a>
      </div>
    </div>`, 'background:var(--p50);'))

// 22 — Gestrichelte Roadmap
sbNeu('sb-roadmap', 'Roadmap', (c) => {
  const liste = sbSchritte(c, 4)
  return sbSekt('sb-roadmap', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(${liste.length},1fr);gap:clamp(12px,2vw,24px);">
      ${liste.map((s, i) => `<div class="wg-reveal" style="text-align:center;position:relative;">
        ${i < liste.length - 1 ? '<div class="wg-hide-mob" style="position:absolute;top:33px;left:calc(50% + 40px);right:calc(-50% + 40px);border-top:2px dashed var(--p200);"></div>' : ''}
        <span style="width:66px;height:66px;border-radius:50%;background:${i === 0 ? 'var(--p600)' : 'var(--p50)'};color:${i === 0 ? '#fff' : 'var(--p700)'};display:inline-flex;align-items:center;justify-content:center;font-size:22px;position:relative;">${icon(`schritte.${i}.icon`, s.icon)}</span>
        <h3 style="font-size:15.5px;font-weight:800;margin:13px 0 5px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        <div style="font-size:13px;color:#64748b;line-height:1.6;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>`)
})

// 23 — Akzentbalken links
sbNeu('sb-akzent', 'Akzentbalken', (c) => sbSekt('sb-akzent', c, `${sbKopf(c)}
    <div style="max-width:760px;margin:0 auto;display:grid;gap:14px;">
      ${sbSchritte(c, 4).map((s, i) => `<div class="wg-karte wg-reveal" style="border-left:5px solid var(--accent);background:var(--p50);border-radius:0 14px 14px 0;padding:18px 22px;">
        <div style="display:flex;align-items:baseline;gap:12px;">
          <span style="font-size:13px;font-weight:900;color:var(--accent);">${nn(i)}</span>
          <h3 style="font-size:16px;font-weight:800;margin:0;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        </div>
        <div style="font-size:13.5px;color:#64748b;line-height:1.65;margin-top:5px;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>`))

// 24 — Icon oben, Nummer klein
sbNeu('sb-icon-nummer', 'Icon + kleine Nummer', (c) => sbSekt('sb-icon-nummer', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,26px);">
      ${sbSchritte(c, 4).map((s, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:16px;padding:clamp(18px,2.6vw,26px);text-align:center;position:relative;">
        <span style="position:absolute;top:12px;right:14px;width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;">${i + 1}</span>
        <span style="width:54px;height:54px;border-radius:15px;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:21px;">${icon(`schritte.${i}.icon`, s.icon)}</span>
        <h3 style="font-size:15.5px;font-weight:800;margin:13px 0 6px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        <div style="font-size:13px;color:#64748b;line-height:1.6;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>`))

// 25 — Panorama-Bild oben
sbNeu('sb-panorama', 'Mit Panorama-Bild', (c) => sbSekt('sb-panorama', c, `${sbKopf(c)}
    <div class="wg-reveal" style="margin-bottom:clamp(24px,4vw,42px);">${bildBox('bildHaupt', c.bildHaupt, 'clamp(200px,26vw,320px)', '', 29)}</div>
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,26px);">
      ${sbSchritte(c, 4).map((s, i) => `<div class="wg-reveal">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="width:34px;height:34px;border-radius:50%;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;flex-shrink:0;">${i + 1}</span>
          <h3 style="font-size:15.5px;font-weight:800;margin:0;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        </div>
        <div style="font-size:13.5px;color:#64748b;line-height:1.65;margin-top:8px;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>`))

// 26 — Nummern rechts (magazinartig)
sbNeu('sb-magazin', 'Magazin-Liste', (c) => sbSekt('sb-magazin', c, `${sbKopf(c)}
    <div style="max-width:820px;margin:0 auto;">
      ${sbSchritte(c, 4).map((s, i) => `<div class="wg-reveal" style="display:grid;grid-template-columns:1fr auto;gap:26px;align-items:center;padding:clamp(18px,3vw,28px) 4px;border-bottom:1px solid var(--p50);">
        <div>
          <h3 style="font-size:clamp(17px,2.2vw,22px);font-weight:800;margin:0;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
          <div style="font-size:14px;color:#64748b;line-height:1.7;margin-top:5px;">${ed(`schritte.${i}.text`, s.text)}</div>
        </div>
        <span style="font-size:clamp(34px,5vw,54px);font-weight:900;color:var(--p100);line-height:1;">${nn(i)}</span>
      </div>`).join('')}
    </div>`))

// 27 — Farbverlaufskarten
sbNeu('sb-verlauf', 'Verlaufskarten', (c) => sbSekt('sb-verlauf', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2.4vw,26px);">
      ${sbSchritte(c, 3).map((s, i) => `<div class="wg-karte wg-dunkelzone wg-karte-hover wg-reveal" style="background:linear-gradient(150deg,var(--p${[600, 700, 800][i % 3]}),var(--p900));border-radius:18px;padding:clamp(22px,3vw,32px);color:#fff;">
        <span style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;">${i + 1}</span>
        <h3 style="font-size:17px;font-weight:800;margin:15px 0 7px;color:#fff;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
        <div style="font-size:13.5px;color:rgba(255,255,255,.78);line-height:1.7;">${ed(`schritte.${i}.text`, s.text)}</div>
      </div>`).join('')}
    </div>`))

// 28 — Kompakter Streifen
sbNeu('sb-kompakt', 'Kompakter Streifen', (c) => sbSekt('sb-kompakt', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:auto repeat(4,1fr);gap:clamp(14px,2.4vw,30px);align-items:center;">
      <div class="wg-reveal" style="max-width:220px;">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Ablauf')}</span>
        <h2 style="font-size:clamp(19px,2.4vw,25px);font-weight:900;letter-spacing:-.02em;margin:8px 0 0;line-height:1.25;">${txt('title', c.title, 'So läuft es bei uns')}</h2>
      </div>
      ${sbSchritte(c, 4).map((s, i) => `<div class="wg-reveal" style="display:flex;gap:11px;align-items:center;">
        <span style="width:32px;height:32px;border-radius:50%;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;flex-shrink:0;">${i + 1}</span>
        <div style="font-size:14px;font-weight:800;line-height:1.35;">${ed(`schritte.${i}.titel`, s.titel)}</div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 29 — Vertikal mit Icons und Linie
sbNeu('sb-vertikal-icons', 'Vertikal mit Icons', (c) => sbSekt('sb-vertikal-icons', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.15fr;gap:clamp(26px,4.5vw,60px);align-items:start;">
      <div class="wg-reveal li" style="position:sticky;top:90px;">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Ablauf')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'So läuft es Schritt für Schritt')}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead">${txt('text', c.text, 'Beschreiben Sie hier in zwei Sätzen, wie die Zusammenarbeit grundsätzlich abläuft.')}</div>
        <a href="kontakt.html" class="wg-btn" style="margin-top:22px;">${txt('cta', c.cta, 'Jetzt anfragen')}</a>
      </div>
      <div class="wg-reveal re" style="position:relative;padding-left:38px;">
        <div style="position:absolute;left:17px;top:12px;bottom:12px;width:2px;background:var(--p100);"></div>
        <div style="display:grid;gap:clamp(20px,3vw,32px);">
          ${sbSchritte(c, 4).map((s, i) => `<div style="position:relative;">
            <span style="position:absolute;left:-38px;top:0;width:36px;height:36px;border-radius:50%;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:14px;">${icon(`schritte.${i}.icon`, s.icon)}</span>
            <h3 style="font-size:16.5px;font-weight:800;margin:0 0 5px;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
            <div style="font-size:14px;color:#64748b;line-height:1.7;">${ed(`schritte.${i}.text`, s.text)}</div>
          </div>`).join('')}
        </div>
      </div>
    </div>`))

// 30 — Abschluss mit Bild-Karte
sbNeu('sb-bild-abschluss', 'Schritte + Bild-Karte', (c) => sbSekt('sb-bild-abschluss', c, `${sbKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(18px,3vw,32px);align-items:stretch;">
      <div style="display:grid;gap:14px;">
        ${sbSchritte(c, 3).map((s, i) => `<div class="wg-karte wg-reveal" style="display:flex;gap:16px;align-items:flex-start;background:#fff;border:1px solid var(--p100);border-radius:14px;padding:18px 20px;">
          <span style="width:38px;height:38px;border-radius:11px;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-weight:900;flex-shrink:0;">${i + 1}</span>
          <div>
            <h3 style="font-size:15.5px;font-weight:800;margin:0;">${ed(`schritte.${i}.titel`, s.titel)}</h3>
            <div style="font-size:13.5px;color:#64748b;line-height:1.65;margin-top:3px;">${ed(`schritte.${i}.text`, s.text)}</div>
          </div>
        </div>`).join('')}
      </div>
      <div class="wg-reveal re" style="position:relative;border-radius:18px;overflow:hidden;min-height:280px;display:flex;align-items:flex-end;">
        <div class="wg-bildbox" style="position:absolute;inset:0;">${bild('bildHaupt', c.bildHaupt, COVER, 30)}</div>
        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(10,15,28,.78),transparent 60%);"></div>
        <div class="wg-dunkelzone" style="position:relative;color:#fff;padding:24px;">
          <div style="font-size:17px;font-weight:800;">${txt('ctaTitel', c.ctaTitel, 'Bereit loszulegen?')}</div>
          <a href="kontakt.html" class="wg-btn" style="margin-top:12px;">${txt('cta', c.cta, 'Jetzt anfragen')}</a>
        </div>
      </div>
    </div>`, 'background:var(--p50);'))

export const ABLAUF = { type: 'ablauf', label: 'Step Box / Abläufe', variants: SB }

// ═══════════════════════════════════════════════════════════════════════════
// ICON-BOXEN (30 Varianten)
// Vorteils-/Merkmal-Kacheln mit Icon, Titel, Text — vom schlichten Raster
// bis zu Glas-Karten. Icons sind anklickbar (Icon-Auswahl), jede Box ist
// über das pinke Panel klon-/lösch-/verschiebbar (Liste `items`).
// ═══════════════════════════════════════════════════════════════════════════

const D_IB_TEXT = 'Beschreiben Sie hier diesen Vorteil in ein bis zwei Sätzen.'
const D_IB3 = [
  { icon: 'bolt', titel: 'Ihr Vorteil', text: D_IB_TEXT },
  { icon: 'shield-halved', titel: 'Ihr Vorteil', text: D_IB_TEXT },
  { icon: 'handshake', titel: 'Ihr Vorteil', text: D_IB_TEXT },
]
const D_IB4 = [
  { icon: 'bolt', titel: 'Ihr Vorteil', text: D_IB_TEXT },
  { icon: 'shield-halved', titel: 'Ihr Vorteil', text: D_IB_TEXT },
  { icon: 'handshake', titel: 'Ihr Vorteil', text: D_IB_TEXT },
  { icon: 'gem', titel: 'Ihr Vorteil', text: D_IB_TEXT },
]
const D_IB6 = D_IB4.concat([
  { icon: 'clock', titel: 'Ihr Vorteil', text: D_IB_TEXT },
  { icon: 'star', titel: 'Ihr Vorteil', text: D_IB_TEXT },
])

const ibKopf = (c, dTitle = 'Warum Kunden sich für uns entscheiden') => `
    <div class="wg-reveal" style="text-align:center;max-width:720px;margin:0 auto clamp(28px,4.5vw,54px);">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Vorteile')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, dTitle)}</h2>
      <span class="wg-strichlinie mitte"></span>
      ${c.subtitle ? `<div class="wg-lead">${ed('subtitle', c.subtitle)}</div>` : ''}
    </div>`

const ibItems = (c, n = 4) => misch(c.items, n === 3 ? D_IB3 : (n === 6 ? D_IB6 : D_IB4))

const IB = []
const ibNeu = (id, name, render) => IB.push({ id, name, render })
const ibSekt = (id, c, innen, fallback = 'background:#fff;') =>
  `<section data-block="iconboxen" data-variant="${id}" class="wg-sekt" style="${bg(c, fallback)}">
  <div class="wg-wrap">
${innen}
  </div>
</section>`

// Bausteine für Wiederverwendung
const ibIconKreis = (it, i, gr = 62, extra = '') =>
  `<span style="width:${gr}px;height:${gr}px;border-radius:50%;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:${Math.round(gr * .38)}px;${extra}">${icon(`items.${i}.icon`, it.icon)}</span>`

// 1 — Drei Spalten zentriert
ibNeu('ib-drei', 'Drei Spalten', (c) => ibSekt('ib-drei', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(18px,3vw,36px);">
      ${ibItems(c, 3).map((it, i) => `<div class="wg-reveal" style="text-align:center;">
        ${ibIconKreis(it, i)}
        <h3 style="font-size:18px;font-weight:800;margin:16px 0 8px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:14px;color:#64748b;line-height:1.7;max-width:300px;margin:0 auto;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 2 — Vier Spalten kompakt
ibNeu('ib-vier', 'Vier Spalten', (c) => ibSekt('ib-vier', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,28px);">
      ${ibItems(c, 4).map((it, i) => `<div class="wg-reveal" style="text-align:center;">
        ${ibIconKreis(it, i, 54)}
        <h3 style="font-size:15.5px;font-weight:800;margin:13px 0 6px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 3 — Weiße Karten mit Schatten
ibNeu('ib-karten', 'Karten mit Schatten', (c) => ibSekt('ib-karten', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.6vw,30px);">
      ${ibItems(c, 3).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border-radius:18px;padding:clamp(24px,3.4vw,36px);box-shadow:0 18px 50px rgba(15,23,42,.09);">
        <span style="width:52px;height:52px;border-radius:14px;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:20px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:17px;font-weight:800;margin:15px 0 7px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:14px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 4 — Icon links, Text rechts (2 Spalten)
ibNeu('ib-links', 'Icon links', (c) => ibSekt('ib-links', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,2.8vw,34px);max-width:960px;margin:0 auto;">
      ${ibItems(c, 4).map((it, i) => `<div class="wg-reveal" style="display:flex;gap:16px;align-items:flex-start;">
        <span style="width:46px;height:46px;border-radius:12px;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;">${icon(`items.${i}.icon`, it.icon)}</span>
        <div>
          <h3 style="font-size:16px;font-weight:800;margin:0 0 5px;">${ed(`items.${i}.titel`, it.titel)}</h3>
          <div style="font-size:13.5px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
        </div>
      </div>`).join('')}
    </div>`))

// 5 — Outline-Kreise
ibNeu('ib-outline', 'Outline-Kreise', (c) => ibSekt('ib-outline', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,28px);">
      ${ibItems(c, 4).map((it, i) => `<div class="wg-reveal" style="text-align:center;">
        <span style="width:64px;height:64px;border-radius:50%;border:2.5px solid var(--p600);color:var(--p600);display:inline-flex;align-items:center;justify-content:center;font-size:22px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:15.5px;font-weight:800;margin:13px 0 6px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 6 — Eckige Icon-Kacheln
ibNeu('ib-quadrate', 'Eckige Kacheln', (c) => ibSekt('ib-quadrate', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.6vw,30px);">
      ${ibItems(c, 3).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:12px;padding:clamp(22px,3vw,32px);">
        <span style="width:50px;height:50px;border-radius:10px;background:var(--p900);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:19px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:17px;font-weight:800;margin:15px 0 7px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:14px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 7 — Dunkle Fläche
ibNeu('ib-dunkel', 'Dunkle Fläche', (c) => `
<section data-block="iconboxen" data-variant="ib-dunkel" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:linear-gradient(160deg,var(--p900),#0d1b2a 75%);')}">
  <div class="wg-wrap">
    <div class="wg-reveal" style="text-align:center;max-width:720px;margin:0 auto clamp(28px,4.5vw,54px);color:#fff;">
      <span class="wg-chip glas">${txt('tag', c.tag, 'Vorteile')}</span>
      <h2 class="wg-t2" style="color:#fff;margin-top:14px;">${txt('title', c.title, 'Warum Kunden sich für uns entscheiden')}</h2>
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,26px);">
      ${ibItems(c, 4).map((it, i) => `<div class="wg-reveal" style="text-align:center;color:#fff;">
        <span style="width:58px;height:58px;border-radius:50%;background:rgba(255,255,255,.1);color:var(--accent);display:inline-flex;align-items:center;justify-content:center;font-size:21px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:15.5px;font-weight:800;margin:13px 0 6px;color:#fff;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13px;color:rgba(255,255,255,.72);line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`)

// 8 — Dunkle Einzelkarten
ibNeu('ib-dunkle-karten', 'Dunkle Karten', (c) => ibSekt('ib-dunkle-karten', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2.4vw,26px);">
      ${ibItems(c, 3).map((it, i) => `<div class="wg-karte wg-dunkelzone wg-karte-hover wg-reveal" style="background:var(--p900);border-radius:18px;padding:clamp(24px,3.4vw,36px);color:#fff;">
        <span style="width:50px;height:50px;border-radius:13px;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:19px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:17px;font-weight:800;margin:15px 0 7px;color:#fff;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;color:rgba(255,255,255,.72);line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 9 — Linker Akzentbalken
ibNeu('ib-akzentrand', 'Akzentbalken links', (c) => ibSekt('ib-akzentrand', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(2,1fr);gap:clamp(14px,2.4vw,26px);max-width:900px;margin:0 auto;">
      ${ibItems(c, 4).map((it, i) => `<div class="wg-karte wg-reveal" style="background:var(--p50);border-left:5px solid var(--accent);border-radius:0 14px 14px 0;padding:20px 22px;display:flex;gap:15px;align-items:flex-start;">
        <span style="color:var(--p700);font-size:22px;margin-top:2px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <div>
          <h3 style="font-size:15.5px;font-weight:800;margin:0 0 4px;">${ed(`items.${i}.titel`, it.titel)}</h3>
          <div style="font-size:13.5px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
        </div>
      </div>`).join('')}
    </div>`))

// 10 — Karten mit Oberlinie
ibNeu('ib-oberlinie', 'Karten mit Oberlinie', (c) => ibSekt('ib-oberlinie', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,26px);">
      ${ibItems(c, 4).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-top:4px solid var(--p600);border-radius:12px;padding:clamp(18px,2.6vw,26px);">
        <span style="color:var(--p600);font-size:24px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:15.5px;font-weight:800;margin:12px 0 6px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 11 — Erste Karte hervorgehoben
ibNeu('ib-hervorgehoben', 'Eine hervorgehoben', (c) => ibSekt('ib-hervorgehoben', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.6vw,30px);">
      ${ibItems(c, 3).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal${i === 0 ? ' wg-dunkelzone' : ''}" style="border-radius:18px;padding:clamp(24px,3.4vw,36px);${i === 0 ? 'background:var(--p700);color:#fff;box-shadow:0 20px 55px rgba(15,23,42,.25);' : 'background:#fff;border:1px solid var(--p100);'}">
        <span style="width:52px;height:52px;border-radius:50%;background:${i === 0 ? 'rgba(255,255,255,.16)' : 'var(--p50)'};color:${i === 0 ? '#fff' : 'var(--p700)'};display:inline-flex;align-items:center;justify-content:center;font-size:20px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:17px;font-weight:800;margin:15px 0 7px;${i === 0 ? 'color:#fff;' : ''}">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:14px;line-height:1.7;${i === 0 ? 'color:rgba(255,255,255,.78);' : 'color:#64748b;'}">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 12 — Minimal (Icon + Titel)
ibNeu('ib-minimal', 'Minimal', (c) => ibSekt('ib-minimal', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,30px);max-width:920px;margin:0 auto;">
      ${ibItems(c, 4).map((it, i) => `<div class="wg-reveal" style="text-align:center;">
        <span style="color:var(--p600);font-size:30px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:14.5px;font-weight:800;margin:10px 0 0;">${ed(`items.${i}.titel`, it.titel)}</h3>
      </div>`).join('')}
    </div>`))

// 13 — Zwei große Boxen
ibNeu('ib-zwei-gross', 'Zwei große Boxen', (c) => ibSekt('ib-zwei-gross', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(18px,3vw,34px);">
      ${ibItems(c, 3).slice(0, 2).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:var(--p50);border-radius:22px;padding:clamp(28px,4vw,48px);">
        ${ibIconKreis(it, i, 66)}
        <h3 style="font-size:clamp(19px,2.4vw,24px);font-weight:800;margin:18px 0 9px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:15px;color:#64748b;line-height:1.75;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 14 — Große Icons, viel Weißraum
ibNeu('ib-luftig', 'Groß & luftig', (c) => ibSekt('ib-luftig', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(24px,4vw,60px);max-width:1000px;margin:0 auto;">
      ${ibItems(c, 3).map((it, i) => `<div class="wg-reveal" style="text-align:center;">
        <span style="color:var(--accent);font-size:44px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:18px;font-weight:800;margin:18px 0 9px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:14.5px;color:#64748b;line-height:1.75;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 15 — Icon + Nummer
ibNeu('ib-nummer', 'Mit Nummern', (c) => ibSekt('ib-nummer', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,26px);">
      ${ibItems(c, 4).map((it, i) => `<div class="wg-karte wg-reveal" style="position:relative;background:#fff;border:1px solid var(--p100);border-radius:14px;padding:clamp(18px,2.6vw,26px);overflow:hidden;">
        <span style="position:absolute;top:-10px;right:-2px;font-size:58px;font-weight:900;color:var(--p50);line-height:1;">${String(i + 1).padStart(2, '0')}</span>
        <span style="position:relative;color:var(--p600);font-size:24px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="position:relative;font-size:15.5px;font-weight:800;margin:12px 0 6px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="position:relative;font-size:13px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 16 — Pillen-Zeilen
ibNeu('ib-pillen', 'Pillen-Zeilen', (c) => ibSekt('ib-pillen', c, `${ibKopf(c)}
    <div style="max-width:640px;margin:0 auto;display:grid;gap:12px;">
      ${ibItems(c, 4).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="display:flex;gap:15px;align-items:center;background:#fff;border:1px solid var(--p100);border-radius:99px;padding:12px 20px 12px 12px;">
        <span style="width:44px;height:44px;border-radius:50%;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${icon(`items.${i}.icon`, it.icon)}</span>
        <div style="flex:1;">
          <h3 style="font-size:15px;font-weight:800;margin:0;display:inline;">${ed(`items.${i}.titel`, it.titel)}</h3>
          <span style="font-size:13px;color:#64748b;"> — ${ed(`items.${i}.text`, it.text)}</span>
        </div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 17 — Verlaufs-Icons
ibNeu('ib-verlauf', 'Verlaufs-Icons', (c) => ibSekt('ib-verlauf', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.6vw,30px);">
      ${ibItems(c, 3).map((it, i) => `<div class="wg-reveal" style="text-align:center;">
        <span style="width:66px;height:66px;border-radius:20px;background:linear-gradient(135deg,var(--p500),var(--p800));color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 14px 34px rgba(15,23,42,.2);transform:rotate(-4deg);">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:17px;font-weight:800;margin:16px 0 7px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:14px;color:#64748b;line-height:1.7;max-width:300px;margin:0 auto;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 18 — Schwebende Icons über Karte
ibNeu('ib-schwebend', 'Schwebende Icons', (c) => ibSekt('ib-schwebend', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.6vw,30px);padding-top:26px;">
      ${ibItems(c, 3).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:16px;padding:44px 24px 26px;text-align:center;position:relative;margin-top:26px;">
        <span style="position:absolute;top:-26px;left:50%;transform:translateX(-50%);width:56px;height:56px;border-radius:50%;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:21px;box-shadow:0 12px 30px rgba(15,23,42,.22);border:4px solid #fff;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:16.5px;font-weight:800;margin:0 0 7px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 19 — Treppen-Versatz
ibNeu('ib-versetzt', 'Treppen-Versatz', (c) => ibSekt('ib-versetzt', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.6vw,30px);align-items:start;">
      ${ibItems(c, 3).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border-radius:18px;padding:clamp(22px,3vw,32px);box-shadow:0 16px 44px rgba(15,23,42,.09);margin-top:${i * 24}px;">
        <span style="width:50px;height:50px;border-radius:14px;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:19px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:16.5px;font-weight:800;margin:14px 0 7px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 20 — Vertikale Trennlinien
ibNeu('ib-trennlinien', 'Mit Trennlinien', (c) => {
  const liste = ibItems(c, 3)
  return ibSekt('ib-trennlinien', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:${liste.map(() => '1fr').join(' auto ')};gap:clamp(16px,2.8vw,40px);align-items:start;">
      ${liste.map((it, i) => `<div class="wg-reveal" style="text-align:center;">
        <span style="color:var(--p600);font-size:28px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:16px;font-weight:800;margin:12px 0 6px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
      </div>${i < liste.length - 1 ? '<div class="wg-hide-mob" style="width:1px;background:var(--p100);align-self:stretch;"></div>' : ''}`).join('')}
    </div>`)
})

// 21 — Intro links + Icon-Raster rechts
ibNeu('ib-intro-raster', 'Intro + Raster', (c) => ibSekt('ib-intro-raster', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.25fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Vorteile')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Warum Kunden sich für uns entscheiden')}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead">${txt('text', c.text, LOREM.satz)}</div>
        <a href="kontakt.html" class="wg-btn" style="margin-top:22px;">${txt('cta', c.cta, 'Kontakt aufnehmen')}</a>
      </div>
      <div class="wg-reveal re" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        ${ibItems(c, 4).map((it, i) => `<div class="wg-karte" style="background:var(--p50);border-radius:14px;padding:20px;">
          <span style="color:var(--p600);font-size:22px;">${icon(`items.${i}.icon`, it.icon)}</span>
          <h3 style="font-size:14.5px;font-weight:800;margin:10px 0 4px;">${ed(`items.${i}.titel`, it.titel)}</h3>
          <div style="font-size:12.5px;color:#64748b;line-height:1.6;">${ed(`items.${i}.text`, it.text)}</div>
        </div>`).join('')}
      </div>
    </div>`))

// 22 — Badge über dem Titel
ibNeu('ib-badge', 'Mit Badge', (c) => ibSekt('ib-badge', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.6vw,30px);">
      ${ibItems(c, 3).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:16px;padding:clamp(22px,3vw,32px);">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
          <span style="width:46px;height:46px;border-radius:12px;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:17px;">${icon(`items.${i}.icon`, it.icon)}</span>
          <span style="background:var(--p50);color:var(--p700);font-size:10.5px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;border-radius:99px;padding:5px 12px;">${ed(`items.${i}.badge`, it.badge || 'Stichwort')}</span>
        </div>
        <h3 style="font-size:16.5px;font-weight:800;margin:0 0 7px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 23 — Blasser Riesen-Kreis hinterm Icon
ibNeu('ib-kreisgrund', 'Kreis-Hintergrund', (c) => ibSekt('ib-kreisgrund', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(18px,3vw,40px);">
      ${ibItems(c, 3).map((it, i) => `<div class="wg-reveal" style="text-align:center;position:relative;padding-top:18px;">
        <span style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:96px;height:96px;border-radius:50%;background:var(--p50);"></span>
        <span style="position:relative;color:var(--p700);font-size:34px;line-height:96px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:16.5px;font-weight:800;margin:14px 0 7px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.65;max-width:280px;margin:0 auto;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

// 24 — Schmale Mittelliste
ibNeu('ib-mittig', 'Schmale Liste', (c) => ibSekt('ib-mittig', c, `${ibKopf(c)}
    <div style="max-width:560px;margin:0 auto;display:grid;gap:0;">
      ${ibItems(c, 4).map((it, i) => `<div class="wg-reveal" style="display:flex;gap:16px;align-items:flex-start;padding:18px 4px;border-bottom:1px solid var(--p50);">
        <span style="width:40px;height:40px;border-radius:50%;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;">${icon(`items.${i}.icon`, it.icon)}</span>
        <div>
          <h3 style="font-size:15.5px;font-weight:800;margin:0 0 3px;">${ed(`items.${i}.titel`, it.titel)}</h3>
          <div style="font-size:13.5px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
        </div>
      </div>`).join('')}
    </div>`))

// 25 — Mit Abschluss-Karte
ibNeu('ib-mit-cta', 'Mit Abschluss-Karte', (c) => ibSekt('ib-mit-cta', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,26px);align-items:stretch;">
      ${ibItems(c, 3).map((it, i) => `<div class="wg-karte wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:16px;padding:clamp(18px,2.6vw,26px);">
        <span style="width:46px;height:46px;border-radius:13px;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:18px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:15.5px;font-weight:800;margin:13px 0 6px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
      <div class="wg-karte wg-dunkelzone wg-reveal" style="background:var(--p700);border-radius:16px;padding:clamp(18px,2.6vw,26px);color:#fff;display:flex;flex-direction:column;justify-content:center;text-align:center;">
        <div style="font-size:16.5px;font-weight:800;">${txt('ctaTitel', c.ctaTitel, 'Überzeugen Sie sich selbst')}</div>
        <a href="kontakt.html" class="wg-btn" style="margin:15px auto 0;">${txt('cta', c.cta, 'Jetzt anfragen')}</a>
      </div>
    </div>`, 'background:var(--p50);'))

// 26 — Glas-Karten auf Verlauf
ibNeu('ib-glas', 'Glas-Karten', (c) => `
<section data-block="iconboxen" data-variant="ib-glas" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:linear-gradient(135deg,var(--p700),var(--p900) 70%);')}">
  <div class="wg-wrap">
    <div class="wg-reveal" style="text-align:center;max-width:720px;margin:0 auto clamp(28px,4.5vw,54px);color:#fff;">
      <span class="wg-chip glas">${txt('tag', c.tag, 'Vorteile')}</span>
      <h2 class="wg-t2" style="color:#fff;margin-top:14px;">${txt('title', c.title, 'Warum Kunden sich für uns entscheiden')}</h2>
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2.4vw,26px);">
      ${ibItems(c, 3).map((it, i) => `<div class="wg-karte wg-reveal" style="background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.2);border-radius:18px;padding:clamp(22px,3vw,34px);color:#fff;backdrop-filter:blur(6px);">
        <span style="width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:19px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:16.5px;font-weight:800;margin:15px 0 7px;color:#fff;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;color:rgba(255,255,255,.78);line-height:1.7;">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>`)

// 27 — Sechser-Raster
ibNeu('ib-sechs', 'Sechser-Raster', (c) => ibSekt('ib-sechs', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2.4vw,26px);">
      ${ibItems(c, 6).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:14px;padding:20px;display:flex;gap:14px;align-items:flex-start;">
        <span style="width:40px;height:40px;border-radius:11px;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;">${icon(`items.${i}.icon`, it.icon)}</span>
        <div>
          <h3 style="font-size:14.5px;font-weight:800;margin:0 0 4px;">${ed(`items.${i}.titel`, it.titel)}</h3>
          <div style="font-size:12.5px;color:#64748b;line-height:1.6;">${ed(`items.${i}.text`, it.text)}</div>
        </div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 28 — Mit Pfeil-Link je Box
ibNeu('ib-pfeil-link', 'Mit Pfeil-Link', (c) => ibSekt('ib-pfeil-link', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2.6vw,30px);">
      ${ibItems(c, 3).map((it, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:16px;padding:clamp(22px,3vw,32px);display:flex;flex-direction:column;">
        <span style="width:50px;height:50px;border-radius:14px;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:19px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:16.5px;font-weight:800;margin:14px 0 7px;">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;color:#64748b;line-height:1.7;flex:1;">${ed(`items.${i}.text`, it.text)}</div>
        <a href="kontakt.html" style="display:inline-flex;align-items:center;gap:8px;margin-top:16px;font-weight:800;color:var(--p600);text-decoration:none;font-size:13.5px;">${ed(`items.${i}.cta`, it.cta || 'Mehr erfahren')} <i class="fa-solid fa-arrow-right" style="font-size:12px;"></i></a>
      </div>`).join('')}
    </div>`))

// 29 — Icon-Band in einer Reihe
ibNeu('ib-band', 'Icon-Band', (c) => ibSekt('ib-band', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2.4vw,30px);align-items:center;">
      ${ibItems(c, 4).map((it, i) => `<div class="wg-reveal" style="display:flex;gap:13px;align-items:center;justify-content:center;">
        <span style="color:var(--accent);font-size:26px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <div>
          <h3 style="font-size:14.5px;font-weight:800;margin:0;">${ed(`items.${i}.titel`, it.titel)}</h3>
          <div style="font-size:12px;color:#94a3b8;">${ed(`items.${i}.text`, it.text)}</div>
        </div>
      </div>`).join('')}
    </div>`, 'background:var(--p50);'))

// 30 — Wechselnde Ausrichtung (Schachbrett)
ibNeu('ib-schach', 'Schachbrett', (c) => ibSekt('ib-schach', c, `${ibKopf(c)}
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(14px,2.4vw,26px);max-width:900px;margin:0 auto;">
      ${ibItems(c, 4).map((it, i) => `<div class="wg-karte wg-reveal${i % 3 === 0 ? ' wg-dunkelzone' : ''}" style="border-radius:16px;padding:clamp(20px,3vw,30px);${i % 3 === 0 ? 'background:var(--p900);color:#fff;' : 'background:var(--p50);'}">
        <span style="width:46px;height:46px;border-radius:12px;background:${i % 3 === 0 ? 'rgba(255,255,255,.14)' : '#fff'};color:${i % 3 === 0 ? 'var(--accent)' : 'var(--p700)'};display:inline-flex;align-items:center;justify-content:center;font-size:17px;">${icon(`items.${i}.icon`, it.icon)}</span>
        <h3 style="font-size:16px;font-weight:800;margin:13px 0 6px;${i % 3 === 0 ? 'color:#fff;' : ''}">${ed(`items.${i}.titel`, it.titel)}</h3>
        <div style="font-size:13.5px;line-height:1.65;${i % 3 === 0 ? 'color:rgba(255,255,255,.75);' : 'color:#64748b;'}">${ed(`items.${i}.text`, it.text)}</div>
      </div>`).join('')}
    </div>`))

export const ICONBOXEN = { type: 'iconboxen', label: 'Icon-Boxen (Vorteile)', variants: IB }

// ═══════════════════════════════════════════════════════════════════════════
// CALL TO ACTION (20 Varianten)
// Handlungsaufrufe: schmale Bänder bis große Abschluss-Flächen. Buttons sind
// echte <a>-Elemente (Ziel im Panel unter „Verlinkung" setzbar), Texte und
// Bilder wie überall direkt bearbeitbar.
// ═══════════════════════════════════════════════════════════════════════════

// Diagonal-Muster als eigene Ebene (dunkle CTA-Flächen aus der Vorlage)
const ctaMuster = (deck = 'rgba(255,255,255,.05)') =>
  `<div aria-hidden="true" style="position:absolute;inset:0;pointer-events:none;background-image:repeating-linear-gradient(45deg,transparent 0 14px,${deck} 14px 15px),repeating-linear-gradient(-45deg,transparent 0 14px,${deck} 14px 15px);"></div>`

const D_CTA_TITEL = 'Ihre Aufforderung in einem Satz'
const D_CTA_TEXT = 'Ein kurzer Satz, der erklärt, was als Nächstes passiert.'
const D_CTA_PUNKTE = [
  { icon: 'check', text: 'Stichwort 1' },
  { icon: 'check', text: 'Stichwort 2' },
  { icon: 'check', text: 'Stichwort 3' },
]

// Knopfpaar (immer echte Links → Verlinkung im Panel)
const ctaKnoepfe = (c, hell = false, mitte = false) => `
        <div style="display:flex;gap:12px;flex-wrap:wrap;${mitte ? 'justify-content:center;' : ''}margin-top:24px;">
          <a href="${esc(c.ctaHref || 'kontakt.html')}" class="wg-btn">${txt('cta', c.cta, 'Jetzt anfragen')}</a>
          <a href="${esc(c.cta2Href || 'leistungen.html')}" class="wg-btn-leer"${hell ? ' style="color:#fff;border-color:rgba(255,255,255,.4);"' : ''}>${txt('cta2', c.cta2, 'Mehr erfahren')}</a>
        </div>`

const CTA = []
const ctaNeu = (id, name, render) => CTA.push({ id, name, render })
const ctaSekt = (id, c, innen, fallback = 'background:#fff;') =>
  `<section data-block="aufruf" data-variant="${id}" class="wg-sekt" style="${bg(c, fallback)}">
  <div class="wg-wrap">
${innen}
  </div>
</section>`

// 1 — Zentriert, hell
ctaNeu('cta-zentriert', 'Zentriert', (c) => ctaSekt('cta-zentriert', c, `
    <div class="wg-reveal" style="text-align:center;max-width:700px;margin:0 auto;">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Nächster Schritt')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, D_CTA_TITEL)}</h2>
      <span class="wg-strichlinie mitte"></span>
      <div class="wg-lead">${txt('text', c.text, D_CTA_TEXT)}</div>
      ${ctaKnoepfe(c, false, true)}
    </div>`, 'background:var(--p50);'))

// 2 — Dunkle Fläche mit Diagonal-Muster
ctaNeu('cta-muster', 'Dunkel mit Muster', (c) => `
<section data-block="aufruf" data-variant="cta-muster" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:var(--p900);')}position:relative;overflow:hidden;">
  ${ctaMuster()}
  <div class="wg-wrap" style="position:relative;">
    <div class="wg-reveal" style="text-align:center;max-width:720px;margin:0 auto;color:#fff;">
      <span class="wg-chip glas">${txt('tag', c.tag, 'Nächster Schritt')}</span>
      <h2 class="wg-t2" style="color:#fff;margin-top:16px;">${txt('title', c.title, D_CTA_TITEL)}</h2>
      <div style="color:rgba(255,255,255,.8);font-size:16px;line-height:1.7;margin-top:12px;">${txt('text', c.text, D_CTA_TEXT)}</div>
      ${ctaKnoepfe(c, true, true)}
    </div>
  </div>
</section>`)

// 3 — Schmales Band, Text links / Knopf rechts
ctaNeu('cta-band', 'Schmales Band', (c) => `
<section data-block="aufruf" data-variant="cta-band" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}padding-top:clamp(24px,3.5vw,40px);padding-bottom:clamp(24px,3.5vw,40px);">
  <div class="wg-wrap">
    <div class="wg-split wg-reveal" style="display:grid;grid-template-columns:1fr auto;gap:clamp(16px,3vw,36px);align-items:center;">
      <div>
        <h2 style="font-size:clamp(18px,2.4vw,26px);font-weight:900;letter-spacing:-.02em;margin:0;">${txt('title', c.title, D_CTA_TITEL)}</h2>
        <div style="font-size:14.5px;color:#64748b;margin-top:5px;">${txt('text', c.text, D_CTA_TEXT)}</div>
      </div>
      <a href="${esc(c.ctaHref || 'kontakt.html')}" class="wg-btn">${txt('cta', c.cta, 'Jetzt anfragen')}</a>
    </div>
  </div>
</section>`)

// 4 — Dunkles Pillen-Band
ctaNeu('cta-pille', 'Dunkle Pille', (c) => ctaSekt('cta-pille', c, `
    <div class="wg-karte wg-dunkelzone wg-reveal" style="position:relative;overflow:hidden;background:var(--p900);border-radius:99px;padding:clamp(16px,2.4vw,22px) clamp(22px,3.4vw,38px);display:flex;gap:clamp(14px,2.5vw,28px);align-items:center;flex-wrap:wrap;justify-content:space-between;">
      ${ctaMuster('rgba(255,255,255,.045)')}
      <div style="position:relative;color:#fff;flex:1;min-width:220px;">
        <div style="font-size:clamp(16px,2vw,21px);font-weight:800;">${txt('title', c.title, D_CTA_TITEL)}</div>
      </div>
      <a href="${esc(c.ctaHref || 'kontakt.html')}" class="wg-btn" style="position:relative;">${txt('cta', c.cta, 'Jetzt anfragen')}</a>
    </div>`))

// 5 — Text links, Bild rechts
ctaNeu('cta-bild-rechts', 'Mit Bild rechts', (c) => ctaSekt('cta-bild-rechts', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.05fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Nächster Schritt')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, D_CTA_TITEL)}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead">${txt('text', c.text, D_CTA_TEXT)}</div>
        ${ctaKnoepfe(c)}
      </div>
      <div class="wg-reveal re">${bildBox('bildHaupt', c.bildHaupt, 'clamp(240px,32vw,400px)', '', 31)}</div>
    </div>`, 'background:var(--p50);'))

// 6 — Bild links, Text rechts
ctaNeu('cta-bild-links', 'Mit Bild links', (c) => ctaSekt('cta-bild-links', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, 'clamp(240px,32vw,400px)', '', 32)}</div>
      <div class="wg-reveal re">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Nächster Schritt')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, D_CTA_TITEL)}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead">${txt('text', c.text, D_CTA_TEXT)}</div>
        ${ctaKnoepfe(c)}
      </div>
    </div>`))

// 7 — Vollbild-Hintergrund mit Überlagerung
ctaNeu('cta-vollbild', 'Auf Vollbild', (c) => `
<section data-block="aufruf" data-variant="cta-vollbild" class="wg-sekt" style="${bg(c, 'background:#fff;')}">
  <div class="wg-wrap">
    <div class="wg-reveal" style="position:relative;border-radius:24px;overflow:hidden;min-height:clamp(300px,36vw,440px);display:flex;align-items:center;justify-content:center;">
      <div class="wg-bildbox" style="position:absolute;inset:0;">${bild('bildHaupt', c.bildHaupt, COVER, 33)}</div>
      <div style="position:absolute;inset:0;background:rgba(10,15,28,.68);"></div>
      <div class="wg-dunkelzone" style="position:relative;text-align:center;color:#fff;max-width:640px;padding:clamp(26px,5vw,52px);">
        <span class="wg-chip glas">${txt('tag', c.tag, 'Nächster Schritt')}</span>
        <h2 class="wg-t2" style="color:#fff;margin-top:14px;">${txt('title', c.title, D_CTA_TITEL)}</h2>
        <div style="color:rgba(255,255,255,.84);font-size:15.5px;line-height:1.7;margin-top:10px;">${txt('text', c.text, D_CTA_TEXT)}</div>
        ${ctaKnoepfe(c, true, true)}
      </div>
    </div>
  </div>
</section>`)

// 8 — Dunkle Karte mit drei Merkmalen
ctaNeu('cta-merkmale', 'Mit Merkmalen', (c) => `
<section data-block="aufruf" data-variant="cta-merkmale" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:var(--p900);')}position:relative;overflow:hidden;">
  ${ctaMuster()}
  <div class="wg-wrap" style="position:relative;">
    <div class="wg-reveal" style="text-align:center;max-width:720px;margin:0 auto;color:#fff;">
      <span class="wg-eyebrow" style="color:var(--accent);">${txt('tag', c.tag, 'Nächster Schritt')}</span>
      <h2 class="wg-t2" style="color:#fff;margin-top:12px;">${txt('title', c.title, D_CTA_TITEL)}</h2>
      <div style="color:rgba(255,255,255,.78);font-size:15.5px;line-height:1.7;margin-top:10px;">${txt('text', c.text, D_CTA_TEXT)}</div>
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2.4vw,26px);margin-top:clamp(26px,4vw,42px);">
      ${misch(c.punkte, D_CTA_PUNKTE).map((p, i) => `<div class="wg-karte wg-reveal" style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:20px;text-align:center;color:#fff;">
        <span style="color:var(--accent);font-size:20px;">${icon(`punkte.${i}.icon`, p.icon)}</span>
        <div style="font-size:14.5px;font-weight:800;margin-top:10px;">${ed(`punkte.${i}.text`, p.text)}</div>
      </div>`).join('')}
    </div>
    <div style="display:flex;justify-content:center;">${ctaKnoepfe(c, true, true)}</div>
  </div>
</section>`)

// 9 — Newsletter-Anmeldung
ctaNeu('cta-newsletter', 'Newsletter-Feld', (c) => ctaSekt('cta-newsletter', c, `
    <div class="wg-karte wg-reveal" style="max-width:680px;margin:0 auto;background:#fff;border:1px solid var(--p100);border-radius:20px;padding:clamp(26px,4vw,44px);text-align:center;box-shadow:0 18px 50px rgba(15,23,42,.08);">
      <span style="width:56px;height:56px;border-radius:50%;background:var(--p50);color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:21px;">${icon('icon', c.icon || 'envelope')}</span>
      <h2 class="wg-t2" style="margin:16px 0 8px;">${txt('title', c.title, 'Bleiben Sie auf dem Laufenden')}</h2>
      <div style="font-size:14.5px;color:#64748b;line-height:1.7;">${txt('text', c.text, 'Ein kurzer Satz dazu, was Empfänger erwartet.')}</div>
      <form data-contact-form style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:22px;">
        <input type="email" name="email" placeholder="E-Mail-Adresse" style="flex:1;min-width:220px;border:1.5px solid var(--p100);border-radius:10px;padding:13px 15px;font-size:14.5px;font-family:inherit;outline:none;">
        <button type="submit" class="wg-btn" style="border:none;cursor:pointer;">${txt('cta', c.cta, 'Eintragen')}</button>
      </form>
      <div style="font-size:11.5px;color:#94a3b8;margin-top:12px;">${txt('hinweis', c.hinweis, 'Abmeldung jederzeit möglich.')}</div>
    </div>`, 'background:var(--p50);'))

// 10 — Zwei Karten nebeneinander (zwei Wege)
ctaNeu('cta-zwei-wege', 'Zwei Wege', (c) => {
  const wege = misch(c.wege, [
    { icon: 'phone', titel: 'Direkt anrufen', text: 'Kurz sprechen und offene Fragen klären.', cta: 'Nummer anzeigen', href: 'kontakt.html' },
    { icon: 'calendar-days', titel: 'Termin vereinbaren', text: 'Wir melden uns mit einem Terminvorschlag.', cta: 'Termin anfragen', href: 'kontakt.html' },
  ])
  return ctaSekt('cta-zwei-wege', c, `
    <div class="wg-reveal" style="text-align:center;max-width:640px;margin:0 auto clamp(24px,3.5vw,42px);">
      <h2 class="wg-t2">${txt('title', c.title, D_CTA_TITEL)}</h2>
      <span class="wg-strichlinie mitte"></span>
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,2.6vw,30px);">
      ${wege.map((w, i) => `<div class="wg-karte wg-karte-hover wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:18px;padding:clamp(24px,3.4vw,36px);text-align:center;">
        <span style="width:54px;height:54px;border-radius:50%;background:var(--p600);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:20px;">${icon(`wege.${i}.icon`, w.icon)}</span>
        <h3 style="font-size:18px;font-weight:800;margin:15px 0 7px;">${ed(`wege.${i}.titel`, w.titel)}</h3>
        <div style="font-size:14px;color:#64748b;line-height:1.7;">${ed(`wege.${i}.text`, w.text)}</div>
        <a href="${esc(w.href || 'kontakt.html')}" class="wg-btn" style="margin-top:18px;">${ed(`wege.${i}.cta`, w.cta)}</a>
      </div>`).join('')}
    </div>`, 'background:var(--p50);')
})

// 11 — Mit Zahlen-Zeile
ctaNeu('cta-zahlen', 'Mit Zahlen', (c) => ctaSekt('cta-zahlen', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">
        <h2 class="wg-t2">${txt('title', c.title, D_CTA_TITEL)}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead">${txt('text', c.text, D_CTA_TEXT)}</div>
        ${ctaKnoepfe(c)}
      </div>
      <div class="wg-reveal re" style="display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(12px,2vw,22px);">
        ${misch(c.stats, D_STATS).map((st, i) => `<div style="text-align:center;padding:18px 8px;border-radius:14px;background:var(--p50);">
          <div style="font-size:clamp(22px,3vw,32px);font-weight:900;color:var(--p700);">${ed(`stats.${i}.num`, st.num)}</div>
          <div style="font-size:12px;color:#64748b;margin-top:3px;">${ed(`stats.${i}.label`, st.label)}</div>
        </div>`).join('')}
      </div>
    </div>`))

// 12 — Bewertungs-Zeile über dem Aufruf
ctaNeu('cta-bewertung', 'Mit Bewertung', (c) => ctaSekt('cta-bewertung', c, `
    <div class="wg-reveal" style="text-align:center;max-width:680px;margin:0 auto;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:var(--p50);border:1px solid var(--p100);border-radius:99px;padding:8px 18px;margin-bottom:18px;">
        <span style="color:var(--accent);font-size:13px;">${'<i class="fa-solid fa-star"></i>'.repeat(5)}</span>
        <span style="font-size:13px;font-weight:700;">${txt('badge', c.badge, 'Ihre echte Bewertung eintragen')}</span>
      </div>
      <h2 class="wg-t2">${txt('title', c.title, D_CTA_TITEL)}</h2>
      <div class="wg-lead">${txt('text', c.text, D_CTA_TEXT)}</div>
      ${ctaKnoepfe(c, false, true)}
    </div>`))

// 13 — Kontaktdaten-Zeile mit Aufruf
ctaNeu('cta-kontaktzeile', 'Mit Kontaktdaten', (c) => ctaSekt('cta-kontaktzeile', c, `
    <div class="wg-karte wg-reveal" style="background:#fff;border:1px solid var(--p100);border-radius:20px;padding:clamp(24px,3.6vw,40px);">
      <div class="wg-split" style="display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(20px,3.4vw,44px);align-items:center;">
        <div>
          <h2 style="font-size:clamp(20px,2.6vw,28px);font-weight:900;letter-spacing:-.02em;margin:0 0 8px;">${txt('title', c.title, D_CTA_TITEL)}</h2>
          <div style="font-size:14.5px;color:#64748b;line-height:1.7;">${txt('text', c.text, D_CTA_TEXT)}</div>
          ${ctaKnoepfe(c)}
        </div>
        <div style="display:grid;gap:12px;">
          ${misch(c.kontakt, [
            { icon: 'phone', label: 'Telefon', wert: 'Ihre Telefonnummer' },
            { icon: 'envelope', label: 'E-Mail', wert: 'Ihre E-Mail-Adresse' },
            { icon: 'clock', label: 'Erreichbar', wert: 'Ihre Zeiten eintragen' },
          ]).map((k, i) => `<div style="display:flex;gap:13px;align-items:center;background:var(--p50);border-radius:12px;padding:13px 16px;">
            <span style="width:38px;height:38px;border-radius:10px;background:#fff;color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;">${icon(`kontakt.${i}.icon`, k.icon)}</span>
            <div>
              <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;">${ed(`kontakt.${i}.label`, k.label)}</div>
              <div style="font-size:14px;font-weight:700;">${ed(`kontakt.${i}.wert`, k.wert)}</div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>`, 'background:var(--p50);'))

// 14 — Video-Teaser mit Aufruf
ctaNeu('cta-video', 'Video-Teaser', (c) => ctaSekt('cta-video', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.05fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li" style="position:relative;border-radius:20px;overflow:hidden;min-height:clamp(220px,28vw,340px);display:flex;align-items:center;justify-content:center;">
        <div class="wg-bildbox" style="position:absolute;inset:0;">${bild('bildHaupt', c.bildHaupt, COVER, 34)}</div>
        <div style="position:absolute;inset:0;background:rgba(10,15,28,.4);"></div>
        <span style="position:relative;width:74px;height:74px;border-radius:50%;background:#fff;color:var(--p700);display:inline-flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 16px 40px rgba(0,0,0,.3);">${icon('icon', c.icon || 'play')}</span>
      </div>
      <div class="wg-reveal re">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Einblick')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, D_CTA_TITEL)}</h2>
        <span class="wg-strichlinie"></span>
        <div class="wg-lead">${txt('text', c.text, D_CTA_TEXT)}</div>
        ${ctaKnoepfe(c)}
      </div>
    </div>`))

// 15 — Häkchenliste neben dem Aufruf
ctaNeu('cta-liste', 'Mit Häkchenliste', (c) => `
<section data-block="aufruf" data-variant="cta-liste" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:linear-gradient(150deg,var(--p800),var(--p900));')}position:relative;overflow:hidden;">
  ${ctaMuster('rgba(255,255,255,.04)')}
  <div class="wg-wrap" style="position:relative;">
    <div class="wg-split" style="display:grid;grid-template-columns:1.15fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li" style="color:#fff;">
        <h2 class="wg-t2" style="color:#fff;">${txt('title', c.title, D_CTA_TITEL)}</h2>
        <span class="wg-strichlinie"></span>
        <div style="color:rgba(255,255,255,.78);font-size:15.5px;line-height:1.7;">${txt('text', c.text, D_CTA_TEXT)}</div>
        ${ctaKnoepfe(c, true)}
      </div>
      <div class="wg-reveal re">
        <ul style="list-style:none;padding:0;margin:0;display:grid;gap:12px;">
          ${misch(c.punkte, D_CTA_PUNKTE).map((p, i) => `<li style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:13px 16px;color:#fff;font-size:14.5px;font-weight:600;">
            <span style="width:26px;height:26px;border-radius:50%;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0;">${icon(`punkte.${i}.icon`, p.icon)}</span>${ed(`punkte.${i}.text`, p.text)}</li>`).join('')}
        </ul>
      </div>
    </div>
  </div>
</section>`)

// 16 — Riesen-Überschrift, minimal
ctaNeu('cta-gross', 'Riesen-Überschrift', (c) => ctaSekt('cta-gross', c, `
    <div class="wg-reveal" style="text-align:center;max-width:900px;margin:0 auto;">
      <h2 style="font-size:clamp(30px,6vw,68px);font-weight:900;letter-spacing:-.04em;line-height:1.05;margin:0;">${txt('title', c.title, D_CTA_TITEL)}</h2>
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:28px;">
        <a href="${esc(c.ctaHref || 'kontakt.html')}" class="wg-btn">${txt('cta', c.cta, 'Jetzt anfragen')}</a>
        <a href="${esc(c.cta2Href || 'leistungen.html')}" class="wg-btn-leer">${txt('cta2', c.cta2, 'Mehr erfahren')}</a>
      </div>
    </div>`))

// 17 — Chip-Wolke unter dem Aufruf
ctaNeu('cta-chips', 'Mit Stichwort-Chips', (c) => `
<section data-block="aufruf" data-variant="cta-chips" class="wg-sekt wg-dunkelzone" style="${bg(c, 'background:var(--p900);')}position:relative;overflow:hidden;">
  ${ctaMuster()}
  <div class="wg-wrap" style="position:relative;">
    <div class="wg-reveal" style="text-align:center;max-width:760px;margin:0 auto;color:#fff;">
      <h2 class="wg-t2" style="color:#fff;">${txt('title', c.title, D_CTA_TITEL)}</h2>
      <div style="color:rgba(255,255,255,.78);font-size:15.5px;line-height:1.7;margin-top:10px;">${txt('text', c.text, D_CTA_TEXT)}</div>
      <div style="display:flex;flex-wrap:wrap;gap:9px;justify-content:center;margin:24px 0 4px;">
        ${misch(c.chips, ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4', 'Stichwort 5']).map((ch, i) =>
          `<span style="background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.18);color:#fff;font-size:13px;font-weight:700;border-radius:99px;padding:8px 16px;">${ed(`chips.${i}`, ch)}</span>`).join('')}
      </div>
      ${ctaKnoepfe(c, true, true)}
    </div>
  </div>
</section>`)

// 18 — Karte über der Kante (überlappend)
ctaNeu('cta-ueberlappt', 'Überlappende Karte', (c) => `
<section data-block="aufruf" data-variant="cta-ueberlappt" class="wg-sekt" style="${bg(c, 'background:var(--p50);')}padding-top:0;">
  <div class="wg-wrap">
    <div class="wg-karte wg-dunkelzone wg-reveal" style="position:relative;overflow:hidden;background:var(--p800);border-radius:24px;padding:clamp(28px,4.4vw,54px);margin-top:-40px;box-shadow:0 26px 70px rgba(15,23,42,.28);color:#fff;text-align:center;">
      ${ctaMuster('rgba(255,255,255,.05)')}
      <div style="position:relative;">
        <span class="wg-chip glas">${txt('tag', c.tag, 'Nächster Schritt')}</span>
        <h2 class="wg-t2" style="color:#fff;margin-top:14px;">${txt('title', c.title, D_CTA_TITEL)}</h2>
        <div style="color:rgba(255,255,255,.8);font-size:15.5px;line-height:1.7;margin-top:10px;max-width:600px;margin-left:auto;margin-right:auto;">${txt('text', c.text, D_CTA_TEXT)}</div>
        <div style="display:flex;justify-content:center;">${ctaKnoepfe(c, true, true)}</div>
      </div>
    </div>
  </div>
</section>`)

// 19 — Farbige Hälfte (Text | Bild, vollflächig)
ctaNeu('cta-haelfte', 'Farbige Hälfte', (c) => `
<section data-block="aufruf" data-variant="cta-haelfte" class="wg-sekt" style="${bg(c, 'background:#fff;')}padding-top:0;padding-bottom:0;">
  <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;min-height:clamp(300px,38vw,460px);">
    <div class="wg-dunkelzone" style="position:relative;overflow:hidden;background:var(--p800);color:#fff;display:flex;align-items:center;padding:clamp(28px,5vw,68px);">
      ${ctaMuster('rgba(255,255,255,.05)')}
      <div class="wg-reveal li" style="position:relative;">
        <span class="wg-eyebrow" style="color:var(--accent);">${txt('tag', c.tag, 'Nächster Schritt')}</span>
        <h2 class="wg-t2" style="color:#fff;margin-top:12px;">${txt('title', c.title, D_CTA_TITEL)}</h2>
        <span class="wg-strichlinie"></span>
        <div style="color:rgba(255,255,255,.78);font-size:15.5px;line-height:1.75;">${txt('text', c.text, D_CTA_TEXT)}</div>
        ${ctaKnoepfe(c, true)}
      </div>
    </div>
    <div class="wg-bildbox" style="overflow:hidden;min-height:260px;">${bild('bildHaupt', c.bildHaupt, COVER, 35)}</div>
  </div>
</section>`)

// 20 — Schlichte Linie mit Aufruf
ctaNeu('cta-schlicht', 'Schlicht mit Linie', (c) => `
<section data-block="aufruf" data-variant="cta-schlicht" class="wg-sekt" style="${bg(c, 'background:#fff;')}padding-top:clamp(26px,4vw,46px);padding-bottom:clamp(26px,4vw,46px);">
  <div class="wg-wrap">
    <div class="wg-reveal" style="border-top:1px solid var(--p100);border-bottom:1px solid var(--p100);padding:clamp(22px,3.4vw,38px) 0;text-align:center;">
      <h2 style="font-size:clamp(18px,2.4vw,26px);font-weight:800;letter-spacing:-.02em;margin:0 0 6px;">${txt('title', c.title, D_CTA_TITEL)}</h2>
      <div style="font-size:14.5px;color:#64748b;">${txt('text', c.text, D_CTA_TEXT)}</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:18px;">
        <a href="${esc(c.ctaHref || 'kontakt.html')}" class="wg-btn">${txt('cta', c.cta, 'Jetzt anfragen')}</a>
      </div>
    </div>
  </div>
</section>`)

export const AUFRUF = { type: 'aufruf', label: 'Call to Action', variants: CTA }

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT (23 Varianten)
// Redaktionelle Inhaltsbereiche: mehrspaltige Fließtexte, Text-Bild-Kombis,
// Merkmal-Spalten mit Links, Autorenzeile mit Unterschrift, Können-Balken.
// Für alles, was zwischen Hero und Aufruf an echtem Inhalt steht.
// ═══════════════════════════════════════════════════════════════════════════

const D_IN_ABSATZ = LOREM.absatz
const D_IN_SPALTEN = [
  { text: LOREM.absatz },
  { text: LOREM.absatz },
]
const D_IN_MERKMALE = [
  { titel: 'Ihr Schwerpunkt', text: 'Beschreiben Sie hier diesen Punkt in ein bis zwei Sätzen.', cta: 'Mehr erfahren' },
  { titel: 'Ihr Schwerpunkt', text: 'Beschreiben Sie hier diesen Punkt in ein bis zwei Sätzen.', cta: 'Mehr erfahren' },
]
const D_IN_LISTEN = [
  { titel: 'Warum wir', punkte: ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4'], cta: 'Mehr erfahren' },
  { titel: 'Unsere Leistungen', punkte: ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4'], cta: 'Mehr erfahren' },
]
const D_IN_KOENNEN = [
  { label: 'Ihr Schwerpunkt', wert: 0 },
  { label: 'Ihr Schwerpunkt', wert: 0 },
  { label: 'Ihr Schwerpunkt', wert: 0 },
]

// Unterschrift-Zeile (frei beschreibbar, wirkt wie eine Signatur)
const inSignatur = (c, hell = false) => `
        <div style="margin-top:22px;">
          <div style="font-family:'Segoe Script','Brush Script MT',cursive;font-size:26px;line-height:1.1;color:${hell ? '#fff' : 'var(--p800)'};">${txt('signatur', c.signatur, 'Ihr Name')}</div>
          <div style="font-size:12px;color:${hell ? 'rgba(255,255,255,.6)' : '#94a3b8'};margin-top:5px;">${txt('signaturRolle', c.signaturRolle, 'Ihre Position')}</div>
        </div>`

const inKopfMitte = (c, dTitle) => `
    <div class="wg-reveal" style="text-align:center;max-width:760px;margin:0 auto clamp(26px,4vw,46px);">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Über uns')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, dTitle)}</h2>
      <span class="wg-strichlinie mitte"></span>
    </div>`

const inSpalten = (c, n = 2) => misch(c.spalten, D_IN_SPALTEN.slice(0, n))
const inTextSpalten = (c, n = 2, farbe = '#64748b') => `
      <div class="wg-split" style="display:grid;grid-template-columns:repeat(${n},1fr);gap:clamp(20px,3.4vw,44px);">
        ${inSpalten(c, n).map((sp, i) => `<div class="wg-reveal" style="font-size:14.5px;color:${farbe};line-height:1.8;">${ed(`spalten.${i}.text`, sp.text)}</div>`).join('')}
      </div>`

const IN = []
const inNeu = (id, name, render) => IN.push({ id, name, render })
const inSekt = (id, c, innen, fallback = 'background:#fff;') =>
  `<section data-block="inhalt" data-variant="${id}" class="wg-sekt" style="${bg(c, fallback)}">
  <div class="wg-wrap">
${innen}
  </div>
</section>`

// 1 — Titel mittig, Bild links + zwei Bilder rechts, Textspalte
inNeu('in-drei-bilder', 'Titel + drei Bilder', (c) => inSekt('in-drei-bilder', c, `${inKopfMitte(c, 'Ihre Überschrift für diesen Bereich')}
    <div class="wg-split" style="display:grid;grid-template-columns:1.15fr 1fr;gap:clamp(20px,3.4vw,44px);align-items:start;">
      <div class="wg-reveal li">
        <div class="wg-bildbox" style="height:clamp(260px,34vw,420px);${RUND}overflow:hidden;">${bild('bildHaupt', c.bildHaupt, COVER, 1)}</div>
        <div style="font-size:14px;color:#64748b;line-height:1.75;margin-top:18px;">${txt('text', c.text, LOREM.satz)}</div>
      </div>
      <div class="wg-reveal re" style="display:grid;gap:14px;border-left:1px solid var(--p100);padding-left:clamp(18px,2.6vw,32px);">
        <div>
          <h3 style="font-size:17px;font-weight:800;margin:0 0 6px;">${txt('untertitel', c.untertitel, 'Ihr Schwerpunkt')}</h3>
          <div style="font-size:13.5px;color:#64748b;line-height:1.7;">${txt('untertext', c.untertext, LOREM.kurz)}</div>
          <a href="${esc(c.ctaHref || 'leistungen.html')}" style="display:inline-flex;align-items:center;gap:7px;margin-top:10px;font-weight:800;color:var(--accent);text-decoration:none;font-size:13px;">${txt('cta', c.cta, 'Mehr erfahren')} <i class="fa-solid fa-arrow-right" style="font-size:11px;"></i></a>
        </div>
        <div class="wg-bildbox" style="height:clamp(110px,14vw,150px);${RUND}overflow:hidden;">${bild('bildZwei', c.bildZwei, COVER, 2)}</div>
        <div class="wg-bildbox" style="height:clamp(110px,14vw,150px);${RUND}overflow:hidden;">${bild('bildDrei', c.bildDrei, COVER, 3)}</div>
      </div>
    </div>`, 'background:var(--p50);'))

// 2 — Text links, Können-Balken rechts
inNeu('in-koennen', 'Mit Können-Balken', (c) => inSekt('in-koennen', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(26px,4.5vw,60px);align-items:center;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Über uns')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
        <div class="wg-lead">${txt('text', c.text, LOREM.satz)}</div>
        <div style="display:inline-flex;align-items:center;gap:12px;margin-top:20px;">
          <span style="width:42px;height:42px;border-radius:50%;background:var(--accent);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:16px;">${icon('icon', c.icon || 'phone')}</span>
          <div style="font-size:17px;font-weight:800;">${txt('telefon', c.telefon, 'Ihre Telefonnummer')}</div>
        </div>
      </div>
      <div class="wg-reveal re" style="display:grid;gap:18px;">
        ${misch(c.koennen, D_IN_KOENNEN).map((k, i) => `<div>
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px;">
            <span style="font-size:14.5px;font-weight:700;">${ed(`koennen.${i}.label`, k.label)}</span>
            <span style="font-size:12.5px;color:#94a3b8;font-weight:700;">${ed(`koennen.${i}.wert`, k.wert)}%</span>
          </div>
          <div style="height:6px;border-radius:99px;background:var(--p100);overflow:hidden;">
            <div style="height:100%;width:${Math.max(0, Math.min(100, parseInt(k.wert, 10) || 0))}%;background:var(--accent);border-radius:99px;"></div>
          </div>
        </div>`).join('')}
      </div>
    </div>`, 'background:var(--p50);'))

// 3 — Titel oben, großes Bild links, kleines Bild mit Beschriftung rechts
inNeu('in-zwei-bilder', 'Titel + zwei Bilder', (c) => inSekt('in-zwei-bilder', c, `
    <div class="wg-reveal" style="max-width:640px;margin-bottom:clamp(24px,3.6vw,42px);">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Über uns')}</span>
      <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
      <div style="font-size:14.5px;color:#64748b;line-height:1.75;margin-top:12px;">${txt('text', c.text, LOREM.satz)}</div>
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:1.25fr 1fr;gap:clamp(20px,3.4vw,44px);align-items:end;">
      <div class="wg-reveal li">
        <div class="wg-bildbox" style="height:clamp(280px,36vw,440px);${RUND}overflow:hidden;">${bild('bildHaupt', c.bildHaupt, COVER, 4)}</div>
        <h3 style="font-size:15px;font-weight:800;margin:14px 0 0;">${txt('bildTitel', c.bildTitel, 'Bildunterschrift')}</h3>
        <div style="font-size:12.5px;color:#94a3b8;">${txt('bildUnter', c.bildUnter, 'Kurze Erläuterung')}</div>
      </div>
      <div class="wg-reveal re">
        <div class="wg-bildbox" style="height:clamp(180px,22vw,280px);${RUND}overflow:hidden;">${bild('bildZwei', c.bildZwei, COVER, 5)}</div>
        <h3 style="font-size:15px;font-weight:800;margin:14px 0 0;">${txt('bildTitel2', c.bildTitel2, 'Bildunterschrift')}</h3>
        <div style="font-size:12.5px;color:#94a3b8;">${txt('bildUnter2', c.bildUnter2, 'Kurze Erläuterung')}</div>
      </div>
    </div>`))

// 4 — Bild mittig, Text rechts, Titel links unten
inNeu('in-versetzt', 'Versetzter Aufbau', (c) => inSekt('in-versetzt', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr 1.1fr;gap:clamp(20px,3.4vw,44px);align-items:center;">
      <div class="wg-reveal li" style="order:2;">
        <div class="wg-bildbox" style="height:clamp(240px,32vw,400px);${RUND}overflow:hidden;">${bild('bildHaupt', c.bildHaupt, COVER, 6)}</div>
      </div>
      <div class="wg-reveal" style="order:1;align-self:end;">
        <h2 style="font-size:clamp(20px,2.6vw,30px);font-weight:900;letter-spacing:-.02em;line-height:1.25;margin:0;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
      </div>
      <div class="wg-reveal re" style="order:3;font-size:14px;color:#64748b;line-height:1.8;">${txt('text', c.text, D_IN_ABSATZ)}</div>
    </div>`, 'background:var(--p50);'))

// 5 — Titel links, zwei Textspalten, Bild rechts
inNeu('in-spalten-bild', 'Textspalten + Bild', (c) => inSekt('in-spalten-bild', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.3fr 1fr;gap:clamp(24px,4vw,54px);align-items:center;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Über uns')}</span>
        <h2 class="wg-t2" style="margin:12px 0 18px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
        ${inTextSpalten(c, 2)}
      </div>
      <div class="wg-reveal re">${bildBox('bildHaupt', c.bildHaupt, 'clamp(280px,36vw,440px)', '', 7)}</div>
    </div>`))

// 6 — Bild links, rechts Text mit Trennlinie und Untertitel
inNeu('in-trennlinie', 'Mit Trennlinie', (c) => inSekt('in-trennlinie', c, `${inKopfMitte(c, 'Ihre Überschrift für diesen Bereich')}
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1px 1fr;gap:clamp(20px,3.4vw,44px);align-items:center;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, 'clamp(240px,30vw,380px)', '', 8)}</div>
      <div class="wg-hide-mob" style="background:var(--p100);align-self:stretch;"></div>
      <div class="wg-reveal re">
        <h3 style="font-size:19px;font-weight:800;margin:0 0 8px;">${txt('untertitel', c.untertitel, 'Ihr Schwerpunkt')}</h3>
        <div style="font-size:14px;color:#64748b;line-height:1.8;">${txt('text', c.text, D_IN_ABSATZ)}</div>
        <a href="${esc(c.ctaHref || 'leistungen.html')}" style="display:inline-flex;align-items:center;gap:7px;margin-top:14px;font-weight:800;color:var(--accent);text-decoration:none;font-size:13.5px;">${txt('cta', c.cta, 'Mehr erfahren')} <i class="fa-solid fa-arrow-right" style="font-size:11px;"></i></a>
      </div>
    </div>`))

// 7 — Großer Titel, drei Textspalten, Bild rechts
inNeu('in-drei-spalten', 'Drei Textspalten', (c) => inSekt('in-drei-spalten', c, `
    <div class="wg-reveal" style="max-width:720px;margin-bottom:clamp(22px,3.4vw,38px);">
      <span class="wg-eyebrow">${txt('tag', c.tag, 'Über uns')}</span>
      <h2 style="font-size:clamp(22px,3.2vw,38px);font-weight:900;letter-spacing:-.03em;line-height:1.2;margin:12px 0 0;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:1.6fr 1fr;gap:clamp(22px,3.6vw,48px);align-items:start;">
      <div class="wg-reveal li">
        <h3 style="font-size:12px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--p700);margin:0 0 14px;">${txt('untertitel', c.untertitel, 'Ihr Schwerpunkt')}</h3>
        ${inTextSpalten(c, 3)}
      </div>
      <div class="wg-reveal re">
        <div class="wg-bildbox" style="height:clamp(200px,26vw,320px);${RUND}overflow:hidden;">${bild('bildHaupt', c.bildHaupt, COVER, 9)}</div>
        <div style="font-size:13px;font-weight:800;margin-top:12px;">${txt('bildTitel', c.bildTitel, 'Bildunterschrift')}</div>
      </div>
    </div>`))

// 8 — Bild links, mehrspaltiger Text rechts
inNeu('in-bild-spalten', 'Bild + zwei Spalten', (c) => inSekt('in-bild-spalten', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(24px,4vw,54px);align-items:start;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, 'clamp(280px,36vw,440px)', '', 10)}</div>
      <div class="wg-reveal re">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Über uns')}</span>
        <h2 class="wg-t2" style="margin:12px 0 18px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
        ${inTextSpalten(c, 2)}
      </div>
    </div>`, 'background:var(--p50);'))

// 9 — Titel + Text, großes Bild darunter
inNeu('in-text-bild', 'Text über Bild', (c) => inSekt('in-text-bild', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,4vw,54px);align-items:start;margin-bottom:clamp(24px,3.6vw,42px);">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Über uns')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
      </div>
      <div class="wg-reveal re" style="font-size:14.5px;color:#64748b;line-height:1.8;">${txt('text', c.text, D_IN_ABSATZ)}</div>
    </div>
    <div class="wg-reveal">${bildBox('bildHaupt', c.bildHaupt, 'clamp(240px,32vw,420px)', '', 11)}</div>`))

// 10 — Zentriert mit Unterschrift
inNeu('in-signatur', 'Zentriert mit Unterschrift', (c) => inSekt('in-signatur', c, `${inKopfMitte(c, 'Warum Kunden sich für uns entscheiden')}
    <div style="max-width:820px;margin:0 auto;">
      ${inTextSpalten(c, 2)}
      <div class="wg-reveal" style="text-align:center;">${inSignatur(c)}</div>
    </div>`))

// 11 — Person mit Bild, Text und Unterschrift
inNeu('in-person', 'Person mit Unterschrift', (c) => inSekt('in-person', c, `
    <div class="wg-reveal" style="text-align:center;max-width:640px;margin:0 auto;">
      <div class="wg-bildbox" style="width:96px;height:96px;border-radius:50%;overflow:hidden;margin:0 auto;">${bild('bildHaupt', c.bildHaupt, COVER, 12)}</div>
      <h3 style="font-size:19px;font-weight:800;margin:16px 0 4px;">${txt('name', c.name, 'Vorname Nachname')}</h3>
      <div style="font-size:12.5px;color:#94a3b8;">${txt('rolle', c.rolle, 'Ihre Position')}</div>
      <div style="font-size:14.5px;color:#64748b;line-height:1.8;margin-top:16px;">${txt('text', c.text, LOREM.satz)}</div>
      ${inSignatur(c)}
    </div>`, 'background:var(--p50);'))

// 12 — Merkmal links, Bild rechts, zweites Merkmal unten
inNeu('in-merkmal-bild', 'Merkmale + Bild', (c) => inSekt('in-merkmal-bild', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.3fr;gap:clamp(22px,3.6vw,48px);align-items:center;">
      <div class="wg-reveal li" style="display:grid;gap:clamp(20px,3vw,34px);">
        ${misch(c.merkmale, D_IN_MERKMALE).map((m, i) => `<div>
          <h3 style="font-size:16.5px;font-weight:800;margin:0 0 6px;">${ed(`merkmale.${i}.titel`, m.titel)}</h3>
          <div style="font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`merkmale.${i}.text`, m.text)}</div>
        </div>`).join('')}
      </div>
      <div class="wg-reveal re">${bildBox('bildHaupt', c.bildHaupt, 'clamp(260px,32vw,400px)', '', 13)}</div>
    </div>`))

// 13 — Großes Bild links, kompakter Text rechts oben
inNeu('in-bild-gross', 'Großes Bild', (c) => inSekt('in-bild-gross', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.5fr 1fr;gap:clamp(22px,3.6vw,48px);align-items:start;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, 'clamp(280px,38vw,470px)', '', 14)}</div>
      <div class="wg-reveal re">
        <h2 class="wg-t2">${txt('title', c.title, 'Ihre Überschrift')}</h2>
        <span class="wg-strichlinie"></span>
        <div style="font-size:14px;color:#64748b;line-height:1.8;">${txt('text', c.text, D_IN_ABSATZ)}</div>
      </div>
    </div>`, 'background:var(--p50);'))

// 14 — Bild oben, zwei Textspalten darunter
inNeu('in-bild-oben', 'Bild oben, Text unten', (c) => inSekt('in-bild-oben', c, `
    <div class="wg-reveal" style="margin-bottom:clamp(24px,3.6vw,42px);">${bildBox('bildHaupt', c.bildHaupt, 'clamp(240px,32vw,420px)', '', 15)}</div>
    ${inTextSpalten(c, 2)}`))

// 15 — Bild oben links, Text rechts, zweites Bild unten rechts
inNeu('in-treppe', 'Treppen-Anordnung', (c) => inSekt('in-treppe', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.2fr 1fr;gap:clamp(20px,3.4vw,44px);align-items:start;">
      <div class="wg-reveal li">
        <div class="wg-bildbox" style="height:clamp(220px,28vw,340px);${RUND}overflow:hidden;">${bild('bildHaupt', c.bildHaupt, COVER, 16)}</div>
        <div style="font-size:13.5px;color:#64748b;line-height:1.75;margin-top:16px;">${txt('text', c.text, LOREM.satz)}</div>
      </div>
      <div class="wg-reveal re" style="margin-top:clamp(30px,5vw,70px);">
        <div style="font-size:13.5px;color:#64748b;line-height:1.75;margin-bottom:16px;">${txt('text2', c.text2, LOREM.satz)}</div>
        <div class="wg-bildbox" style="height:clamp(200px,26vw,320px);${RUND}overflow:hidden;">${bild('bildZwei', c.bildZwei, COVER, 17)}</div>
      </div>
    </div>`))

// 16 — Kleines Bild links, großes rechts, Text darüber
inNeu('in-bild-duo', 'Bild-Duo', (c) => inSekt('in-bild-duo', c, `
    <div class="wg-reveal" style="max-width:620px;margin-bottom:clamp(22px,3.4vw,38px);">
      <div style="font-size:14.5px;color:#64748b;line-height:1.8;">${txt('text', c.text, LOREM.satz)}</div>
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.9fr;gap:clamp(16px,2.6vw,30px);align-items:end;">
      <div class="wg-reveal li"><div class="wg-bildbox" style="height:clamp(150px,19vw,230px);${RUND}overflow:hidden;">${bild('bildZwei', c.bildZwei, COVER, 18)}</div></div>
      <div class="wg-reveal re"><div class="wg-bildbox" style="height:clamp(220px,30vw,380px);${RUND}overflow:hidden;">${bild('bildHaupt', c.bildHaupt, COVER, 19)}</div></div>
    </div>`, 'background:var(--p50);'))

// 17 — Titel, zwei Spalten, Autorenzeile
inNeu('in-autor', 'Mit Autorenzeile', (c) => inSekt('in-autor', c, `
    <div class="wg-reveal" style="max-width:720px;margin-bottom:clamp(22px,3.4vw,38px);">
      <h2 class="wg-t2">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
      <span class="wg-strichlinie"></span>
    </div>
    ${inTextSpalten(c, 2)}
    <div class="wg-reveal" style="display:flex;align-items:center;gap:14px;margin-top:clamp(22px,3.4vw,36px);padding-top:20px;border-top:1px solid var(--p100);">
      <div class="wg-bildbox" style="width:48px;height:48px;border-radius:50%;overflow:hidden;flex-shrink:0;">${bild('bildHaupt', c.bildHaupt, COVER, 20)}</div>
      <div>
        <div style="font-size:15px;font-weight:800;">${txt('name', c.name, 'Vorname Nachname')}</div>
        <div style="font-size:12.5px;color:#94a3b8;">${txt('rolle', c.rolle, 'Ihre Position')}</div>
      </div>
    </div>`))

// 18 — Text + Unterschrift links, zwei Häkchenlisten rechts
inNeu('in-listen', 'Mit zwei Listen', (c) => inSekt('in-listen', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.15fr;gap:clamp(24px,4vw,56px);align-items:start;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${txt('tag', c.tag, 'Über uns')}</span>
        <h2 class="wg-t2" style="margin-top:12px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
        <div style="font-size:14px;color:#64748b;line-height:1.8;margin-top:12px;">${txt('text', c.text, LOREM.satz)}</div>
        ${inSignatur(c)}
      </div>
      <div class="wg-reveal re" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(18px,3vw,36px);">
        ${misch(c.listen, D_IN_LISTEN).map((l, i) => `<div>
          <h3 style="font-size:15.5px;font-weight:800;margin:0 0 12px;">${ed(`listen.${i}.titel`, l.titel)}</h3>
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:9px;">
            ${(Array.isArray(l.punkte) ? l.punkte : []).map((p, j) => `<li style="display:flex;gap:10px;align-items:flex-start;font-size:13.5px;color:#475569;">
              <span style="color:var(--accent);font-size:12px;margin-top:3px;"><i class="fa-solid fa-check"></i></span>${ed(`listen.${i}.punkte.${j}`, p)}</li>`).join('')}
          </ul>
          <a href="${esc(l.href || 'leistungen.html')}" style="display:inline-flex;align-items:center;gap:7px;margin-top:14px;font-weight:800;color:var(--accent);text-decoration:none;font-size:13px;">${ed(`listen.${i}.cta`, l.cta)} <i class="fa-solid fa-arrow-right" style="font-size:11px;"></i></a>
        </div>`).join('')}
      </div>
    </div>`, 'background:var(--p50);'))

// 19 — Titel links, Bild mittig, Einträge rechts
inNeu('in-drei-zonen', 'Drei Zonen', (c) => inSekt('in-drei-zonen', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:clamp(20px,3.4vw,44px);align-items:center;">
      <div class="wg-reveal li">
        <h2 style="font-size:clamp(21px,2.8vw,32px);font-weight:900;letter-spacing:-.03em;line-height:1.2;margin:0 0 12px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
        <div style="font-size:13.5px;color:#64748b;line-height:1.75;">${txt('text', c.text, LOREM.kurz)}</div>
      </div>
      <div class="wg-reveal"><div class="wg-bildbox" style="height:clamp(240px,30vw,380px);${RUND}overflow:hidden;">${bild('bildHaupt', c.bildHaupt, COVER, 21)}</div></div>
      <div class="wg-reveal re" style="display:grid;gap:0;">
        ${misch(c.merkmale, D_IN_MERKMALE).map((m, i) => `<div style="padding:16px 0;${i ? 'border-top:1px solid var(--p100);' : ''}">
          <h3 style="font-size:15.5px;font-weight:800;margin:0 0 5px;">${ed(`merkmale.${i}.titel`, m.titel)}</h3>
          <div style="font-size:13px;color:#64748b;line-height:1.65;">${ed(`merkmale.${i}.text`, m.text)}</div>
        </div>`).join('')}
      </div>
    </div>`))

// 20 — Titel links, zwei Text-Einträge mit Links rechts
inNeu('in-zwei-links', 'Zwei Einträge mit Link', (c) => inSekt('in-zwei-links', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.2fr;gap:clamp(24px,4vw,56px);align-items:start;">
      <div class="wg-reveal li">
        <h2 class="wg-t2">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
        <span class="wg-strichlinie"></span>
      </div>
      <div class="wg-reveal re" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(18px,3vw,36px);">
        ${misch(c.merkmale, D_IN_MERKMALE).map((m, i) => `<div>
          <div style="font-size:13px;font-weight:900;color:var(--accent);margin-bottom:7px;">${ed(`merkmale.${i}.titel`, m.titel)}</div>
          <div style="font-size:13.5px;color:#64748b;line-height:1.75;">${ed(`merkmale.${i}.text`, m.text)}</div>
          <a href="${esc(m.href || 'leistungen.html')}" style="display:inline-flex;align-items:center;gap:7px;margin-top:12px;font-weight:800;color:var(--p700);text-decoration:none;font-size:13px;">${ed(`merkmale.${i}.cta`, m.cta)} <i class="fa-solid fa-arrow-right" style="font-size:11px;"></i></a>
        </div>`).join('')}
      </div>
    </div>`))

// 21 — Badge, Titel links, farbige Einträge rechts
inNeu('in-badge', 'Mit Badge', (c) => inSekt('in-badge', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.15fr;gap:clamp(24px,4vw,56px);align-items:start;">
      <div class="wg-reveal li">
        <span style="display:inline-block;background:var(--p50);border:1px solid var(--p100);color:var(--p700);font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;border-radius:99px;padding:6px 14px;">${txt('badge', c.badge, 'Ihr Stichwort')}</span>
        <h2 class="wg-t2" style="margin-top:16px;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
      </div>
      <div class="wg-reveal re" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(18px,3vw,34px);">
        ${misch(c.merkmale, D_IN_MERKMALE).map((m, i) => `<div class="wg-karte" style="background:var(--p50);border-radius:14px;padding:20px;">
          <div style="font-size:14px;font-weight:900;color:var(--accent);margin-bottom:7px;">${ed(`merkmale.${i}.titel`, m.titel)}</div>
          <div style="font-size:13px;color:#64748b;line-height:1.7;">${ed(`merkmale.${i}.text`, m.text)}</div>
        </div>`).join('')}
      </div>
    </div>`))

// 22 — Titel links, Text rechts, zwei Bilder unten
inNeu('in-titel-bilder', 'Titel + Bilder unten', (c) => inSekt('in-titel-bilder', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1.2fr;gap:clamp(22px,3.6vw,48px);align-items:start;margin-bottom:clamp(22px,3.4vw,38px);">
      <div class="wg-reveal li">
        <h2 style="font-size:clamp(21px,2.9vw,34px);font-weight:900;letter-spacing:-.03em;line-height:1.2;margin:0;">${txt('title', c.title, 'Ihre Überschrift für diesen Bereich')}</h2>
      </div>
      <div class="wg-reveal re" style="font-size:14px;color:#64748b;line-height:1.8;">${txt('text', c.text, D_IN_ABSATZ)}</div>
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:clamp(16px,2.6vw,28px);">
      <div class="wg-reveal li"><div class="wg-bildbox" style="height:clamp(200px,25vw,300px);${RUND}overflow:hidden;">${bild('bildHaupt', c.bildHaupt, COVER, 22)}</div></div>
      <div class="wg-reveal re"><div class="wg-bildbox" style="height:clamp(200px,25vw,300px);${RUND}overflow:hidden;">${bild('bildZwei', c.bildZwei, COVER, 23)}</div></div>
    </div>`, 'background:var(--p50);'))

// 23 — Bild links, nummerierte Einträge rechts
inNeu('in-bild-eintraege', 'Bild + Einträge', (c) => inSekt('in-bild-eintraege', c, `
    <div class="wg-split" style="display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(22px,3.6vw,48px);align-items:center;">
      <div class="wg-reveal li">${bildBox('bildHaupt', c.bildHaupt, 'clamp(240px,30vw,380px)', '', 24)}</div>
      <div class="wg-reveal re" style="display:grid;gap:0;">
        ${misch(c.merkmale, D_IN_MERKMALE).map((m, i) => `<div style="padding:18px 0;${i ? 'border-top:1px solid var(--p100);' : ''}">
          <h3 style="font-size:16px;font-weight:800;margin:0 0 6px;">${ed(`merkmale.${i}.titel`, m.titel)}</h3>
          <div style="font-size:13.5px;color:#64748b;line-height:1.7;">${ed(`merkmale.${i}.text`, m.text)}</div>
        </div>`).join('')}
      </div>
    </div>`))

export const INHALT = { type: 'inhalt', label: 'Content / Textbereiche', variants: IN }

export const KOMBI = { type: 'kombi', label: 'Bild + Text Kombis', variants: V }

export const ZUSATZ3_BLOECKE = { kombi: KOMBI, ablauf: ABLAUF, iconboxen: ICONBOXEN, aufruf: AUFRUF, inhalt: INHALT }

export const ZUSATZ3_ADDABLE = [
  { type: 'kombi', label: 'Bild + Text Kombis', fa: 'object-group', cat: 'Inhalt' },
  { type: 'ablauf', label: 'Step Box / Abläufe', fa: 'stairs', cat: 'Inhalt' },
  { type: 'iconboxen', label: 'Icon-Boxen (Vorteile)', fa: 'icons', cat: 'Inhalt' },
  { type: 'aufruf', label: 'Call to Action', fa: 'bullhorn', cat: 'Konversion' },
  { type: 'inhalt', label: 'Content / Textbereiche', fa: 'align-left', cat: 'Inhalt' },
]

export const ZUSATZ3_DEFAULTS = {
  inhalt: {
    tag: 'Über uns',
    title: 'Ihre Überschrift für diesen Bereich',
    text: LOREM.absatz,
    text2: LOREM.satz,
    untertitel: 'Ihr Schwerpunkt',
    untertext: LOREM.kurz,
    cta: 'Mehr erfahren', ctaHref: 'leistungen.html',
    badge: 'Ihr Stichwort',
    icon: 'phone',
    telefon: 'Ihre Telefonnummer',
    name: 'Vorname Nachname', rolle: 'Ihre Position',
    signatur: 'Ihr Name', signaturRolle: 'Ihre Position',
    bildTitel: 'Bildunterschrift', bildUnter: 'Kurze Erläuterung',
    bildTitel2: 'Bildunterschrift', bildUnter2: 'Kurze Erläuterung',
    spalten: [{ text: LOREM.absatz }, { text: LOREM.absatz }, { text: LOREM.absatz }],
    koennen: [
      { label: 'Ihr Schwerpunkt', wert: 0 },
      { label: 'Ihr Schwerpunkt', wert: 0 },
      { label: 'Ihr Schwerpunkt', wert: 0 },
    ],
    merkmale: [
      { titel: 'Ihr Schwerpunkt', text: 'Beschreiben Sie hier diesen Punkt in ein bis zwei Sätzen.', cta: 'Mehr erfahren', href: 'leistungen.html' },
      { titel: 'Ihr Schwerpunkt', text: 'Beschreiben Sie hier diesen Punkt in ein bis zwei Sätzen.', cta: 'Mehr erfahren', href: 'leistungen.html' },
    ],
    listen: [
      { titel: 'Warum wir', punkte: ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4'], cta: 'Mehr erfahren', href: 'leistungen.html' },
      { titel: 'Unsere Leistungen', punkte: ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4'], cta: 'Mehr erfahren', href: 'leistungen.html' },
    ],
  },
  aufruf: {
    tag: 'Nächster Schritt',
    title: 'Ihre Aufforderung in einem Satz',
    text: 'Ein kurzer Satz, der erklärt, was als Nächstes passiert.',
    cta: 'Jetzt anfragen', ctaHref: 'kontakt.html',
    cta2: 'Mehr erfahren', cta2Href: 'leistungen.html',
    badge: 'Ihre echte Bewertung eintragen',
    hinweis: 'Abmeldung jederzeit möglich.',
    icon: 'envelope',
    chips: ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4', 'Stichwort 5'],
    punkte: [
      { icon: 'check', text: 'Stichwort 1' },
      { icon: 'check', text: 'Stichwort 2' },
      { icon: 'check', text: 'Stichwort 3' },
    ],
    stats: [{ num: '0', label: 'Ihre Kennzahl' }, { num: '0', label: 'Ihre Kennzahl' }, { num: '0', label: 'Ihre Kennzahl' }],
    wege: [
      { icon: 'phone', titel: 'Direkt anrufen', text: 'Kurz sprechen und offene Fragen klären.', cta: 'Nummer anzeigen', href: 'kontakt.html' },
      { icon: 'calendar-days', titel: 'Termin vereinbaren', text: 'Wir melden uns mit einem Terminvorschlag.', cta: 'Termin anfragen', href: 'kontakt.html' },
    ],
    kontakt: [
      { icon: 'phone', label: 'Telefon', wert: 'Ihre Telefonnummer' },
      { icon: 'envelope', label: 'E-Mail', wert: 'Ihre E-Mail-Adresse' },
      { icon: 'clock', label: 'Erreichbar', wert: 'Ihre Zeiten eintragen' },
    ],
  },
  iconboxen: {
    tag: 'Vorteile',
    title: 'Warum Kunden sich für uns entscheiden',
    text: LOREM.satz,
    cta: 'Kontakt aufnehmen',
    ctaTitel: 'Überzeugen Sie sich selbst',
    items: [
      { icon: 'bolt', titel: 'Ihr Vorteil', text: 'Beschreiben Sie hier diesen Vorteil in ein bis zwei Sätzen.', badge: 'Stichwort', cta: 'Mehr erfahren' },
      { icon: 'shield-halved', titel: 'Ihr Vorteil', text: 'Beschreiben Sie hier diesen Vorteil in ein bis zwei Sätzen.', badge: 'Stichwort', cta: 'Mehr erfahren' },
      { icon: 'handshake', titel: 'Ihr Vorteil', text: 'Beschreiben Sie hier diesen Vorteil in ein bis zwei Sätzen.', badge: 'Stichwort', cta: 'Mehr erfahren' },
      { icon: 'gem', titel: 'Ihr Vorteil', text: 'Beschreiben Sie hier diesen Vorteil in ein bis zwei Sätzen.', badge: 'Stichwort', cta: 'Mehr erfahren' },
    ],
  },
  ablauf: {
    tag: 'Ablauf',
    title: 'So läuft es Schritt für Schritt',
    text: 'Beschreiben Sie hier in zwei Sätzen, wie die Zusammenarbeit grundsätzlich abläuft.',
    cta: 'Jetzt anfragen',
    ctaTitel: 'Bereit loszulegen?',
    schritte: [
      { icon: 'comments', titel: 'Schritt 1', text: 'Beschreiben Sie hier diesen Schritt in ein bis zwei Sätzen.' },
      { icon: 'clipboard-list', titel: 'Schritt 2', text: 'Beschreiben Sie hier diesen Schritt in ein bis zwei Sätzen.' },
      { icon: 'gears', titel: 'Schritt 3', text: 'Beschreiben Sie hier diesen Schritt in ein bis zwei Sätzen.' },
      { icon: 'flag-checkered', titel: 'Schritt 4', text: 'Beschreiben Sie hier diesen Schritt in ein bis zwei Sätzen.' },
    ],
  },
  kombi: {
    tag: 'Über uns',
    title: 'Ihre Überschrift für diesen Bereich',
    text: LOREM.absatz,
    cta: 'Mehr erfahren',
    cta2: 'Kontakt aufnehmen',
    badge: 'Ihr Stichwort',
    badgeText: LOREM.kurz,
    punkte: D_PUNKTE,
    stats: D_STATS,
    zitat: 'Hier steht später ein echtes Zitat – zum Beispiel Ihr Leitgedanke oder eine Kundenstimme.',
    zname: 'Name eintragen', zrolle: 'Rolle oder Firma',
    zahl: '0', zahlLabel: 'Ihre Kennzahl – hier eintragen',
    prozent: '0 %', prozentLabel: 'Ihre Kennzahl',
    chips: ['Stichwort 1', 'Stichwort 2', 'Stichwort 3', 'Stichwort 4'],
    schritte: [
      { titel: 'Schritt 1', text: 'Beschreiben Sie hier den ersten Schritt.' },
      { titel: 'Schritt 2', text: 'Beschreiben Sie hier den zweiten Schritt.' },
      { titel: 'Schritt 3', text: 'Beschreiben Sie hier den dritten Schritt.' },
    ],
    icons: [
      { icon: 'bolt', titel: 'Ihr Vorteil', text: LOREM.kurz },
      { icon: 'shield-halved', titel: 'Ihr Vorteil', text: LOREM.kurz },
    ],
    karten: [
      { titel: 'Erster Bereich', text: LOREM.kurz, cta: 'Mehr erfahren' },
      { titel: 'Zweiter Bereich', text: LOREM.kurz, cta: 'Mehr erfahren' },
    ],
  },
}
