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

export const KOMBI = { type: 'kombi', label: 'Bild + Text Kombis', variants: V }

export const ZUSATZ3_BLOECKE = { kombi: KOMBI }

export const ZUSATZ3_ADDABLE = [
  { type: 'kombi', label: 'Bild + Text Kombis', fa: 'object-group', cat: 'Inhalt' },
]

export const ZUSATZ3_DEFAULTS = {
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
