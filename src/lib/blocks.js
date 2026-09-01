// ─────────────────────────────────────────────────────────────
// BLOCK-BIBLIOTHEK
// Jeder Block: render(content) → HTML. Tailwind + CSS-Variablen.
// Editierbare Texte: data-edit="key" | Bilder: data-img="key"
// Farben über var(--p500) etc. → Live-Änderung möglich
// ─────────────────────────────────────────────────────────────

const esc = (s) => String(s ?? '')

// Helper: editierbarer Text
// Block-HTML (h1, p, ul, table …) muss in ein <div>: in einem <span> oder in
// einer Überschrift wirft der Browser solche Tags beim Einlesen wieder heraus.
const BLOCK_TAGS = /<\s*(h[1-6]|p|div|ul|ol|li|table|blockquote|section|figure|pre|hr)\b/i
const ed = (key, val, tag = 'span', cls = '') => {
  const s = esc(val)
  const t = BLOCK_TAGS.test(s) ? 'div' : tag
  return `<${t} data-edit="${key}" class="${cls}" style="outline:none;${t === 'div' ? 'display:block;' : ''}">${s}</${t}>`
}

// Standardwerte elementweise mischen: der Editor schickt nur den geänderten
// Pfad zurück – ohne das hier wären alle anderen Einträge danach leer.
const mischStd = (ist, standard) => {
  const a = Array.isArray(ist) ? ist : []
  const out = standard.map((v, i) => {
    const w = a[i]
    if (w === undefined || w === null || w === '') return v
    if (v && typeof v === 'object' && !Array.isArray(v) && w && typeof w === 'object') return { ...v, ...w }
    return w
  })
  if (a.length > standard.length) out.push(...a.slice(standard.length))
  return out
}

// ── Font-Awesome-Icons (editierbar via data-icon) ──
// Mappt alte Emojis auf FA-Namen, akzeptiert auch direkte FA-Namen ('bolt', 'fa-bolt')
const FA_EMOJI = { '🎯':'bullseye','⚡':'bolt','🤝':'handshake','🔥':'fire','⭐':'star','🌟':'star','✅':'circle-check','✔️':'check','💡':'lightbulb','🛡️':'shield-halved','📞':'phone','✉️':'envelope','📧':'envelope','📍':'location-dot','🕐':'clock','⏰':'clock','💪':'dumbbell','🏆':'trophy','❤️':'heart','🚀':'rocket','🔧':'wrench','🛠️':'screwdriver-wrench','🎨':'palette','📈':'chart-line','📊':'chart-column','👥':'users','👤':'user','💼':'briefcase','🏠':'house','⚖️':'scale-balanced','🩺':'stethoscope','✂️':'scissors','🍽️':'utensils','🚗':'car','📱':'mobile-screen','💻':'laptop','🌍':'earth-europe','🔒':'lock','💬':'comments','🎁':'gift','📅':'calendar-days','💰':'sack-dollar','⭐️':'star' }
function faName(v){ if(!v) return 'star'; v=String(v).trim(); if(FA_EMOJI[v]) return FA_EMOJI[v]; if(v.indexOf('fa-')===0) v=v.slice(3); v=v.replace(/[^a-z0-9-]/gi,''); return v || 'star' }
const icon = (key, name, size = 24, color = 'var(--p600)') =>
  `<i data-icon="${key}" class="fa-solid fa-${faName(name)}" style="font-size:${size}px;color:${color};line-height:1;cursor:pointer;"></i>`

const STARS = `<span style="display:inline-flex;gap:3px;">${'<i class="fa-solid fa-star"></i>'.repeat(5)}</span>`

// Editierbare Sterne-Bewertung (anklickbar im Editor via data-stars)
const stars = (key, rating = 5) => {
  const r = Math.max(0, Math.min(5, parseInt(rating) || 5))
  let out = ''
  for (let i = 1; i <= 5; i++) out += `<i class="fa-${i <= r ? 'solid' : 'regular'} fa-star"></i>`
  return `<span data-stars="${key}" data-rating="${r}" style="display:inline-flex;gap:3px;cursor:pointer;">${out}</span>`
}

// Helper: Bild mit Upload-Funktion
const img = (key, src, cls = '', fallbackGradient = true) => {
  if (src) return `<img data-img="${key}" src="${esc(src)}" class="${cls}" style="object-fit:cover;">`
  return `<div data-img="${key}" class="${cls}" style="background:linear-gradient(135deg,var(--p200),var(--p400));display:flex;align-items:center;justify-content:center;cursor:pointer;min-height:200px;">
    <span style="color:var(--p100);font-size:13px;font-weight:600;pointer-events:none;"><i class="fa-solid fa-image" style="margin-right:6px;"></i>Bild hochladen</span>
  </div>`
}

// ── Hintergrund-Muster (Punkte/Raster/Linien) – unabhängig von Bild/Farbe ──
function patternLayers(kind, col){
  if(kind==='dots') return [{img:`radial-gradient(circle, ${col} 1.3px, transparent 1.3px)`, size:'18px 18px', repeat:'repeat', pos:'0 0'}]
  if(kind==='grid') return [
    {img:`linear-gradient(${col} 1px,transparent 1px)`, size:'100% 24px', repeat:'repeat', pos:'0 0'},
    {img:`linear-gradient(90deg,${col} 1px,transparent 1px)`, size:'24px 100%', repeat:'repeat', pos:'0 0'},
  ]
  if(kind==='lines') return [{img:`repeating-linear-gradient(45deg,transparent,transparent 11px,${col} 11px,${col} 12px)`, size:'auto', repeat:'repeat', pos:'0 0'}]
  return []
}

// Baut den kompletten Section-Hintergrund aus content – alle Ebenen unabhängig kombinierbar:
//   bgColor | bgGradient (CSS-Gradient) | bgImg+bgOverlay+bgParallax | bgPattern ('dots'|'grid'|'lines')
export function buildSectionBg(c = {}, fallback = '') {
  const hasCustom = c.bgImg || c.bgGradient || c.bgColor || (c.bgPattern && c.bgPattern !== 'none')
  if (!hasCustom) return fallback
  const dark = !!(c.bgImg || c.bgGradient)
  const patCol = dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.06)'
  const layers = [], sizes = [], repeats = [], positions = []
  let baseColor = ''
  // 1) Muster ganz oben
  if (c.bgPattern && c.bgPattern !== 'none') {
    patternLayers(c.bgPattern, patCol).forEach(pp => { layers.push(pp.img); sizes.push(pp.size); repeats.push(pp.repeat); positions.push(pp.pos) })
  }
  // 2) Bild+Overlay ODER Verlauf ODER Farbe (sonst Default aus fallback)
  if (c.bgImg) {
    const overlay = c.bgOverlay || 'rgba(15,23,42,0.55)'
    const imgSize = c.bgSize === 'contain' ? 'contain' : 'cover'
    layers.push(`linear-gradient(${overlay},${overlay})`, `url('${esc(c.bgImg)}')`)
    sizes.push('cover', imgSize); repeats.push('no-repeat', 'no-repeat'); positions.push('center', 'center')
  } else if (c.bgGradient) {
    layers.push(esc(c.bgGradient)); sizes.push('cover'); repeats.push('no-repeat'); positions.push('center')
  } else if (c.bgColor) {
    baseColor = c.bgColor
  } else {
    const fb = (fallback || '').replace(/^background:\s*/,'').replace(/;\s*$/,'').trim()
    if (/gradient\(/i.test(fb)) { layers.push(fb); sizes.push('cover'); repeats.push('no-repeat'); positions.push('center') }
    else baseColor = fb || '#ffffff'
  }
  let css = ''
  if (layers.length) css += `background-image:${layers.join(',')};background-size:${sizes.join(',')};background-repeat:${repeats.join(',')};background-position:${positions.join(',')};`
  if (baseColor) css += `background-color:${baseColor};`
  return css
}

// Rückwärtskompatibel
function sectionBgStyle(c, fallback = '') { return buildSectionBg(c, fallback) }

// ═══════════════════════════════════════════════════════════════
// NAVIGATION (überall identisch)
// ═══════════════════════════════════════════════════════════════
export const NAV = {
  type: 'nav',
  label: 'Navigation',
  variants: [{
    id: 'nav-modern', name: 'Modern',
    render: (c) => `
<nav data-block="nav" style="position:sticky;top:0;z-index:1000;background:rgba(255,255,255,0.9);backdrop-filter:blur(12px);border-bottom:1px solid #f0f0f0;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;height:68px;display:flex;align-items:center;justify-content:space-between;">
    <a href="index.html" data-logo style="font-size:20px;font-weight:800;letter-spacing:-0.03em;color:var(--p700);text-decoration:none;display:flex;align-items:center;gap:8px;">
      <img data-img="logo" src="${c.logo || ''}" style="height:36px;width:auto;object-fit:contain;${c.logo ? '' : 'display:none;'}">
      ${c.logo ? '' : ed('firmenname', c.firmenname, 'span')}
    </a>
    <div style="display:flex;align-items:center;gap:4px;" class="nav-desktop">
      ${(c.navLinks || []).map((l, i) => `<a href="${l.href}" style="font-size:14px;font-weight:500;color:#475569;text-decoration:none;padding:8px 14px;border-radius:8px;transition:all 0.2s;" onmouseover="this.style.background='var(--p50)';this.style.color='var(--p700)'" onmouseout="this.style.background='transparent';this.style.color='#475569'">${ed(`navLinks.${i}.label`, l.label)}</a>`).join('')}
      ${c.navCtaHref === '' ? '' : `<a href="${esc(c.navCtaHref || 'kontakt.html')}" style="background:var(--p500);color:#fff;text-decoration:none;padding:9px 20px;border-radius:8px;font-weight:600;font-size:14px;margin-left:8px;">${ed('navCta', c.navCta || 'Kontakt')}</a>`}
    </div>
    <button class="nav-burger" onclick="this.nextElementSibling?this.parentElement.parentElement.querySelector('.nav-mobile').classList.toggle('hidden'):0" style="display:none;background:none;border:none;cursor:pointer;font-size:22px;color:var(--p700);"><i class="fa-solid fa-bars"></i></button>
  </div>
  <div class="nav-mobile hidden" style="display:none;padding:12px 24px;border-top:1px solid #f0f0f0;flex-direction:column;gap:4px;">
    ${(c.navLinks || []).map((l, i) => `<a href="${l.href}" style="font-size:15px;font-weight:500;color:#475569;text-decoration:none;padding:10px;"><span data-kopie="navLinks.${i}.label">${esc(l.label)}</span></a>`).join('')}
  </div>
</nav>`
  }]
}

// ═══════════════════════════════════════════════════════════════
// HERO FULL (Startseite – groß)
// ═══════════════════════════════════════════════════════════════
// HERO_FULL kommt jetzt vollständig aus lib/heroes.js
import { HERO_FULL } from './heroes'

// ═══════════════════════════════════════════════════════════════
// HEADER SLIM (Unterseiten – kompakt)
// ═══════════════════════════════════════════════════════════════
export const HEADER_SLIM = {
  type: 'header-slim',
  label: 'Seiten-Header',
  variants: [
    {
      id: 'header-gradient', name: 'Gradient',
      render: (c) => `
<section data-block="header-slim" data-variant="header-gradient" data-section="1" style="${sectionBgStyle(c,'background:linear-gradient(135deg,var(--p800),var(--p600));')}padding:80px 0 64px;position:relative;overflow:hidden;">
  <div style="position:absolute;top:-50px;right:10%;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.08),transparent 70%);"></div>
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;position:relative;z-index:1;">
    <div data-reveal style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.8);background:rgba(255,255,255,0.12);padding:6px 14px;border-radius:99px;margin-bottom:16px;">${ed('tag', c.tag, 'span')}</div>
    <h1 data-reveal style="font-size:clamp(32px,4.5vw,52px);font-weight:900;letter-spacing:-0.03em;color:#fff;margin-bottom:12px;">${ed('headline', c.headline, 'span')}</h1>
    <div data-reveal style="font-size:18px;color:rgba(255,255,255,0.75);max-width:560px;line-height:1.6;">${ed('subline', c.subline, 'span')}</div>
  </div>
</section>`
    },
    {
      id: 'header-light', name: 'Hell',
      render: (c) => `
<section data-block="header-slim" data-variant="header-light" data-section="1" style="${sectionBgStyle(c,'background:var(--p50);')}padding:72px 0 56px;border-bottom:1px solid var(--p100);">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;text-align:center;">
    <div data-reveal style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--p600);background:var(--p100);padding:6px 14px;border-radius:99px;margin-bottom:16px;">${ed('tag', c.tag, 'span')}</div>
    <h1 data-reveal style="font-size:clamp(32px,4.5vw,52px);font-weight:900;letter-spacing:-0.03em;color:#0f172a;margin-bottom:12px;">${ed('headline', c.headline, 'span')}</h1>
    <div data-reveal style="font-size:18px;color:#64748b;max-width:560px;margin:0 auto;line-height:1.6;">${ed('subline', c.subline, 'span')}</div>
  </div>
</section>`
    },
  ]
}

// ═══════════════════════════════════════════════════════════════
// LEISTUNGEN
// ═══════════════════════════════════════════════════════════════
export const SERVICES = {
  type: 'services',
  label: 'Leistungen',
  variants: [
    {
      id: 'services-cards', name: 'Cards 3-Spalten',
      render: (c) => `
<section data-block="services" data-variant="services-cards" id="leistungen" data-section="1" style="${sectionBgStyle(c,'background:#fff;')}padding:80px 0;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;">
    <div data-reveal style="margin-bottom:48px;max-width:560px;">
      <div style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--p600);background:var(--p50);padding:6px 14px;border-radius:99px;margin-bottom:16px;">${ed('tag', c.tag, 'span')}</div>
      <h2 style="font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-0.03em;color:#0f172a;margin-bottom:12px;">${ed('title', c.title, 'span')}</h2>
      <div style="font-size:17px;color:#64748b;line-height:1.7;">${ed('subtitle', c.subtitle, 'span')}</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;">
      ${(c.items || []).map((it, i) => `
        <div data-reveal style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px;transition:all 0.3s;" onmouseover="this.style.boxShadow='0 12px 40px rgba(0,0,0,0.08)';this.style.transform='translateY(-4px)';this.style.borderColor='var(--p200)'" onmouseout="this.style.boxShadow='none';this.style.transform='none';this.style.borderColor='#e2e8f0'">
          <div style="width:52px;height:52px;background:var(--p50);border-radius:13px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">${icon(`items.${i}.icon`, it.icon, 24, 'var(--p600)')}</div>
          <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:8px;">${ed(`items.${i}.title`, it.title)}</h3>
          <div style="font-size:14px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
        </div>`).join('')}
    </div>
  </div>
</section>`
    },
    {
      id: 'services-list', name: 'Liste mit Nummern',
      render: (c) => `
<section data-block="services" data-variant="services-list" id="leistungen" data-section="1" style="${sectionBgStyle(c,'background:var(--p50);')}padding:80px 0;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;">
    <div data-reveal style="text-align:center;margin-bottom:48px;">
      <div style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--p600);background:var(--p100);padding:6px 14px;border-radius:99px;margin-bottom:16px;">${ed('tag', c.tag, 'span')}</div>
      <h2 style="font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-0.03em;color:#0f172a;">${ed('title', c.title, 'span')}</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;max-width:900px;margin:0 auto;">
      ${(c.items || []).map((it, i) => `
        <div data-reveal style="background:#fff;border-radius:14px;padding:24px;display:flex;gap:16px;align-items:flex-start;">
          <div style="width:40px;height:40px;background:var(--p500);color:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;flex-shrink:0;">${i+1}</div>
          <div><h3 style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:6px;">${ed(`items.${i}.title`, it.title)}</h3><div style="font-size:14px;color:#64748b;line-height:1.6;">${ed(`items.${i}.text`, it.text)}</div></div>
        </div>`).join('')}
    </div>
  </div>
</section>`
    },
    {
      id: 'services-icons', name: 'Icon-Grid',
      render: (c) => `
<section data-block="services" data-variant="services-icons" id="leistungen" data-section="1" style="${sectionBgStyle(c,'background:#fff;')}padding:80px 0;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;">
    <div data-reveal style="text-align:center;margin-bottom:48px;max-width:560px;margin-left:auto;margin-right:auto;">
      <h2 style="font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-0.03em;color:#0f172a;margin-bottom:12px;">${ed('title', c.title, 'span')}</h2>
      <div style="font-size:17px;color:#64748b;">${ed('subtitle', c.subtitle, 'span')}</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:32px;">
      ${(c.items || []).map((it, i) => `
        <div data-reveal style="text-align:center;">
          <div style="width:64px;height:64px;background:linear-gradient(135deg,var(--p400),var(--p600));border-radius:18px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">${icon(`items.${i}.icon`, it.icon, 28, '#fff')}</div>
          <h3 style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:8px;">${ed(`items.${i}.title`, it.title)}</h3>
          <div style="font-size:14px;color:#64748b;line-height:1.65;">${ed(`items.${i}.text`, it.text)}</div>
        </div>`).join('')}
    </div>
  </div>
</section>`
    },
  ]
}

// ═══════════════════════════════════════════════════════════════
// ABOUT
// ═══════════════════════════════════════════════════════════════
export const ABOUT = {
  type: 'about',
  label: 'Über uns',
  variants: [
    {
      id: 'about-split', name: 'Text + Stats',
      render: (c) => `
<section data-block="about" data-variant="about-split" id="about" data-section="1" style="${sectionBgStyle(c,'background:var(--p50);')}padding:80px 0;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;" class="about-grid">
    <div data-reveal>
      ${img('aboutImg', c.aboutImg, 'border-radius:20px;width:100%;height:400px;')}
    </div>
    <div data-reveal>
      <div style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--p600);background:var(--p100);padding:6px 14px;border-radius:99px;margin-bottom:16px;">${ed('tag', c.tag, 'span')}</div>
      <h2 style="font-size:clamp(28px,3.5vw,40px);font-weight:800;letter-spacing:-0.03em;color:#0f172a;margin-bottom:16px;">${ed('title', c.title, 'span')}</h2>
      <div style="font-size:16px;color:#475569;line-height:1.8;margin-bottom:14px;">${ed('text1', c.text1, 'span')}</div>
      <div style="font-size:15px;color:#64748b;line-height:1.8;margin-bottom:28px;">${ed('text2', c.text2, 'span')}</div>
      <a href="kontakt.html" style="background:var(--p500);color:#fff;text-decoration:none;padding:13px 26px;border-radius:10px;font-weight:700;font-size:15px;display:inline-block;">${ed('cta', c.cta || 'Mehr erfahren', 'span')}</a>
    </div>
  </div>
</section>`
    },
    {
      id: 'about-stats', name: 'Text + Zahlen-Grid',
      render: (c) => `
<section data-block="about" data-variant="about-stats" id="about" data-section="1" style="${sectionBgStyle(c,'background:#fff;')}padding:80px 0;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;" class="about-grid">
    <div data-reveal>
      <div style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--p600);background:var(--p50);padding:6px 14px;border-radius:99px;margin-bottom:16px;">${ed('tag', c.tag, 'span')}</div>
      <h2 style="font-size:clamp(28px,3.5vw,40px);font-weight:800;letter-spacing:-0.03em;color:#0f172a;margin-bottom:16px;">${ed('title', c.title, 'span')}</h2>
      <div style="font-size:16px;color:#475569;line-height:1.8;margin-bottom:14px;">${ed('text1', c.text1, 'span')}</div>
      <div style="font-size:15px;color:#64748b;line-height:1.8;">${ed('text2', c.text2, 'span')}</div>
    </div>
    <div data-reveal style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      ${(c.stats || []).map((s, i) => `<div style="background:${i%2===0?'linear-gradient(135deg,var(--p500),var(--p700))':'var(--p50)'};color:${i%2===0?'#fff':'#0f172a'};border-radius:16px;padding:28px;text-align:center;${i%2!==0?'border:1px solid var(--p100);':''}"><div style="font-size:36px;font-weight:900;letter-spacing:-0.02em;${i%2!==0?'color:var(--p600);':''}">${ed(`stats.${i}.num`, s.num)}</div><div style="font-size:13px;${i%2===0?'opacity:0.8;':'color:#94a3b8;'}margin-top:4px;">${ed(`stats.${i}.label`, s.label)}</div></div>`).join('')}
    </div>
  </div>
</section>`
    },
  ]
}

// ═══════════════════════════════════════════════════════════════
// TEAM
// ═══════════════════════════════════════════════════════════════
export const TEAM = {
  type: 'team',
  label: 'Team',
  variants: [
    {
      id: 'team-cards', name: 'Karten mit Foto',
      render: (c) => `
<section data-block="team" data-variant="team-cards" id="team" data-section="1" style="${sectionBgStyle(c,'background:#fff;')}padding:80px 0;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;">
    <div data-reveal style="text-align:center;margin-bottom:48px;">
      <div style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--p600);background:var(--p50);padding:6px 14px;border-radius:99px;margin-bottom:16px;">${ed('tag', c.tag, 'span')}</div>
      <h2 style="font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-0.03em;color:#0f172a;">${ed('title', c.title, 'span')}</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;">
      ${(c.members || []).map((m, i) => `
        <div data-reveal style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;transition:all 0.3s;" onmouseover="this.style.boxShadow='0 12px 40px rgba(0,0,0,0.1)';this.style.transform='translateY(-4px)'" onmouseout="this.style.boxShadow='none';this.style.transform='none'">
          ${img(`members.${i}.img`, m.img, 'width:100%;height:220px;')}
          <div style="padding:20px;">
            <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin-bottom:3px;">${ed(`members.${i}.name`, m.name)}</h3>
            <div style="font-size:13px;color:var(--p600);font-weight:600;margin-bottom:10px;">${ed(`members.${i}.rolle`, m.rolle || m.role)}</div>
            <div style="font-size:13px;color:#64748b;line-height:1.6;">${ed(`members.${i}.text`, m.text || m.bio)}</div>
          </div>
        </div>`).join('')}
    </div>
  </div>
</section>`
    },
  ]
}

// ═══════════════════════════════════════════════════════════════
// TESTIMONIALS
// ═══════════════════════════════════════════════════════════════
export const TESTIMONIALS = {
  type: 'testimonials',
  label: 'Kundenstimmen',
  variants: [
    {
      id: 'testi-cards', name: 'Karten',
      render: (c) => `
<section data-block="testimonials" data-variant="testi-cards" data-section="1" style="${sectionBgStyle(c,'background:var(--p50);')}padding:80px 0;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;">
    <div data-reveal style="text-align:center;margin-bottom:48px;">
      <div style="color:#f59e0b;font-size:18px;margin-bottom:12px;">${STARS}</div>
      <h2 style="font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-0.03em;color:#0f172a;">${ed('title', c.title, 'span')}</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
      ${(c.items || []).map((t, i) => `
        <div data-reveal style="background:#fff;border-radius:16px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.05);">
          <div style="color:#f59e0b;font-size:16px;margin-bottom:14px;">${stars(`items.${i}.sterne`, t.sterne || t.rating || 5)}</div>
          <p style="font-size:15px;color:#475569;line-height:1.7;font-style:italic;margin-bottom:20px;">"${ed(`items.${i}.text`, t.text || t.quote)}"</p>
          <div style="display:flex;align-items:center;gap:12px;padding-top:16px;border-top:1px solid #f1f5f9;">
            <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--p400),var(--p600));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0;">${esc((t.name||'?').charAt(0))}</div>
            <div><div style="font-size:14px;font-weight:700;color:#0f172a;">${ed(`items.${i}.name`, t.name)}</div><div style="font-size:12px;color:#94a3b8;">${ed(`items.${i}.ort`, t.ort || t.role)}</div></div>
          </div>
        </div>`).join('')}
    </div>
  </div>
</section>`
    },
  ]
}

// ═══════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════
export const STATS = {
  type: 'stats',
  label: 'Zahlen & Fakten',
  variants: [{
    id: 'stats-bar', name: 'Farbiger Balken',
    render: (c) => `
<section data-block="stats" data-variant="stats-bar" data-section="1" style="${sectionBgStyle(c,'background:linear-gradient(135deg,var(--p600),var(--p800));')}padding:60px 0;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:32px;">
    ${mischStd(c.items, [{num:'0',label:'Ihre Kennzahl'},{num:'0',label:'Ihre Kennzahl'},{num:'0',label:'Ihre Kennzahl'}]).map((s, i) => `<div data-reveal style="text-align:center;"><div style="font-size:clamp(36px,5vw,52px);font-weight:900;color:#fff;letter-spacing:-0.03em;">${ed(`items.${i}.num`, s.num)}</div><div style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:4px;">${ed(`items.${i}.label`, s.label)}</div></div>`).join('')}
  </div>
</section>`
  }]
}

// ═══════════════════════════════════════════════════════════════
// CTA
// ═══════════════════════════════════════════════════════════════
export const CTA = {
  type: 'cta',
  label: 'Call to Action',
  variants: [
    {
      id: 'cta-gradient', name: 'Gradient zentriert',
      render: (c) => `
<section data-block="cta" data-variant="cta-gradient" data-section="1" style="${sectionBgStyle(c,'background:linear-gradient(135deg,var(--p800),var(--p600));')}padding:80px 0;text-align:center;position:relative;overflow:hidden;">
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:300px;background:radial-gradient(ellipse,rgba(255,255,255,0.1),transparent 70%);"></div>
  <div style="max-width:600px;margin:0 auto;padding:0 24px;position:relative;z-index:1;">
    <h2 data-reveal style="font-size:clamp(28px,4.5vw,48px);font-weight:900;letter-spacing:-0.03em;color:#fff;margin-bottom:14px;">${ed('title', c.title, 'span')}</h2>
    <div data-reveal style="font-size:18px;color:rgba(255,255,255,0.8);margin-bottom:32px;">${ed('subtitle', c.subtitle, 'span')}</div>
    <div data-reveal style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">
      <a href="kontakt.html" style="background:#fff;color:var(--p700);text-decoration:none;padding:15px 32px;border-radius:10px;font-weight:700;font-size:16px;">${ed('cta1', c.cta1, 'span')}</a>
      <a href="tel:${esc(c.telefon)}" style="background:rgba(255,255,255,0.12);color:#fff;text-decoration:none;padding:15px 32px;border-radius:10px;font-weight:600;font-size:16px;border:1px solid rgba(255,255,255,0.3);">${ed('telefon', c.telefon, 'span')}</a>
    </div>
  </div>
</section>`
    },
  ]
}

// ═══════════════════════════════════════════════════════════════
// GALLERY
// ═══════════════════════════════════════════════════════════════
export const GALLERY = {
  type: 'gallery',
  label: 'Galerie',
  variants: [{
    id: 'gallery-grid', name: 'Bilder-Grid',
    render: (c) => `
<section data-block="gallery" data-variant="gallery-grid" id="galerie" data-section="1" style="${sectionBgStyle(c,'background:#fff;')}padding:80px 0;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;">
    <div data-reveal style="text-align:center;margin-bottom:40px;">
      <h2 style="font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-0.03em;color:#0f172a;">${ed('title', c.title, 'span')}</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;">
      ${(c.images || [1,2,3,4,5,6]).map((im, i) => `<div data-reveal>${img(`images.${i}`, typeof im==='string'?im:'', 'border-radius:14px;width:100%;height:240px;')}</div>`).join('')}
    </div>
  </div>
</section>`
  }]
}

// ═══════════════════════════════════════════════════════════════
// FAQ
// ═══════════════════════════════════════════════════════════════
export const FAQ = {
  type: 'faq',
  label: 'FAQ',
  variants: [{
    id: 'faq-accordion', name: 'Accordion',
    render: (c) => `
<section data-block="faq" data-variant="faq-accordion" data-section="1" style="${sectionBgStyle(c,'background:var(--p50);')}padding:80px 0;">
  <div style="max-width:720px;margin:0 auto;padding:0 24px;">
    <div data-reveal style="text-align:center;margin-bottom:40px;">
      <h2 style="font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-0.03em;color:#0f172a;">${ed('title', c.title, 'span')}</h2>
    </div>
    ${(c.items || []).map((f, i) => `
      <details data-reveal style="background:#fff;border-radius:12px;margin-bottom:10px;padding:0 20px;border:1px solid #e2e8f0;">
        <summary style="padding:18px 0;cursor:pointer;font-weight:600;font-size:16px;color:#0f172a;list-style:none;display:flex;justify-content:space-between;align-items:center;">${ed(`items.${i}.frage`, f.frage || f.q)}<span class="faq-ic" style="color:var(--p500);font-size:18px;">${'<i class="fa-solid fa-plus"></i>'}</span></summary>
        <div style="padding:0 0 18px;font-size:15px;color:#64748b;line-height:1.7;">${ed(`items.${i}.antwort`, f.antwort || f.a)}</div>
      </details>`).join('')}
  </div>
</section>`
  }]
}

// ═══════════════════════════════════════════════════════════════
// CONTACT
// ═══════════════════════════════════════════════════════════════
export const CONTACT = {
  type: 'contact',
  label: 'Kontakt',
  variants: [{
    id: 'contact-split', name: 'Formular + Infos',
    render: (c) => `
<section data-block="contact" data-variant="contact-split" id="kontakt" data-section="1" style="${sectionBgStyle(c,'background:#fff;')}padding:80px 0;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;">
    <div data-reveal style="margin-bottom:48px;">
      <div style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--p600);background:var(--p50);padding:6px 14px;border-radius:99px;margin-bottom:16px;">${ed('tag', c.tag || 'Kontakt', 'span')}</div>
      <h2 style="font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-0.03em;color:#0f172a;margin-bottom:12px;">${ed('title', c.title, 'span')}</h2>
      <div style="font-size:17px;color:#64748b;">${ed('subtitle', c.subtitle, 'span')}</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;" class="contact-grid">
      <form action="mail.php" method="POST" data-contact-form>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
          <div><label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:5px;">${ed('lblName', c.lblName || 'Name *')}</label><input type="text" name="name" required style="width:100%;border:1.5px solid #e2e8f0;border-radius:10px;padding:12px 14px;font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='var(--p500)'" onblur="this.style.borderColor='#e2e8f0'"></div>
          <div><label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:5px;">${ed('lblEmail', c.lblEmail || 'E-Mail *')}</label><input type="email" name="email" required style="width:100%;border:1.5px solid #e2e8f0;border-radius:10px;padding:12px 14px;font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='var(--p500)'" onblur="this.style.borderColor='#e2e8f0'"></div>
        </div>
        <div style="margin-bottom:12px;"><label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:5px;">${ed('lblTelefon', c.lblTelefon || 'Telefon')}</label><input type="tel" name="telefon" style="width:100%;border:1.5px solid #e2e8f0;border-radius:10px;padding:12px 14px;font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='var(--p500)'" onblur="this.style.borderColor='#e2e8f0'"></div>
        <div style="margin-bottom:16px;"><label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:5px;">${ed('lblNachricht', c.lblNachricht || 'Nachricht *')}</label><textarea name="nachricht" rows="5" required style="width:100%;border:1.5px solid #e2e8f0;border-radius:10px;padding:12px 14px;font-size:14px;font-family:inherit;outline:none;resize:vertical;box-sizing:border-box;" onfocus="this.style.borderColor='var(--p500)'" onblur="this.style.borderColor='#e2e8f0'"></textarea></div>
        <button type="submit" style="width:100%;background:var(--p500);color:#fff;border:none;padding:14px;border-radius:10px;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit;">${ed('ctaSenden', c.ctaSenden || 'Nachricht senden')} <i class="fa-solid fa-paper-plane" style="margin-left:6px;"></i></button>
      </form>
      <div style="display:flex;flex-direction:column;gap:14px;justify-content:center;">
        ${[['location-dot','Adresse','adresse'],['phone','Telefon','telefon'],['envelope','E-Mail','email'],['clock','Öffnungszeiten','oeffnung']].map(([ic,lb,k]) => `
          <div style="background:var(--p50);border:1px solid var(--p100);border-radius:12px;padding:18px;display:flex;align-items:center;gap:14px;">
            <div style="width:44px;height:44px;background:var(--p100);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--p600);flex-shrink:0;"><i class="fa-solid fa-${ic}"></i></div>
            <div><div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">${ed('lbl_' + k, c['lbl_' + k] || lb)}</div><div style="font-size:14px;font-weight:600;color:#0f172a;">${ed(k, c[k], 'span')}</div></div>
          </div>`).join('')}
      </div>
    </div>
  </div>
</section>`
  }]
}

// ═══════════════════════════════════════════════════════════════
// FOOTER (überall identisch)
// ═══════════════════════════════════════════════════════════════
export const FOOTER = {
  type: 'footer',
  label: 'Footer',
  variants: [{
    id: 'footer-modern', name: 'Modern',
    render: (c) => `
<footer data-block="footer" style="background:#0f172a;color:rgba(255,255,255,0.6);padding:56px 0 0;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;">
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:48px;" class="footer-grid">
      <div>
        <div data-logo style="font-size:20px;font-weight:800;color:#fff;margin-bottom:12px;letter-spacing:-0.02em;">
          <img data-img="logoFooter" src="${c.logoFooter || c.logo || ''}" style="height:32px;width:auto;object-fit:contain;${(c.logoFooter || c.logo) ? '' : 'display:none;'}margin-bottom:8px;${c.logoFooter ? '' : 'filter:brightness(0) invert(1);'}">
          ${c.logo ? '' : ed('firmenname', c.firmenname, 'span')}
        </div>
        <div style="font-size:14px;line-height:1.7;max-width:260px;">${ed('footerDesc', c.footerDesc || c.beschreibung || 'Ihr verlässlicher Partner in der Region – persönlich, sauber, termintreu.')}</div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.3);margin-bottom:14px;">${ed('spTitelNav', c.spTitelNav || 'Navigation')}</div>
        ${(c.navLinks || []).map((l, i) => `<a href="${l.href}" style="font-size:14px;color:rgba(255,255,255,0.5);text-decoration:none;display:block;margin-bottom:8px;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">${ed(`navLinks.${i}.label`, l.label)}</a>`).join('')}
      </div>
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.3);margin-bottom:14px;">${ed('spTitelKontakt', c.spTitelKontakt || 'Kontakt')}</div>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;">
          <span>${ed('telefon', c.telefon, 'span')}</span>
          <span>${ed('email', c.email, 'span')}</span>
        </div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.3);margin-bottom:14px;">${ed('spTitelZeiten', c.spTitelZeiten || 'Öffnungszeiten')}</div>
        <div style="font-size:14px;line-height:1.8;">${ed('oeffnung', c.oeffnung, 'span')}</div>
      </div>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.08);padding:20px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
      <span style="font-size:13px;">© ${new Date().getFullYear()} ${ed('rechteText', c.rechteText || 'Ihr Unternehmen. Alle Rechte vorbehalten.')}</span>
      <div style="display:flex;gap:20px;">
        ${/* Rechtslinks kommen aus dem Inhalt: nur verlinken, was es als Seite
             wirklich gibt (rechtsSeitenSync pflegt das). Ohne die Angabe gilt
             das alte Verhalten – wichtig für bereits erzeugte Websites. */''}
        ${(Array.isArray(c.rechtsLinks)
          ? c.rechtsLinks
          : [{ label: c.lblImpressum || 'Impressum', href: 'impressum.html' }, { label: c.lblDatenschutz || 'Datenschutz', href: 'datenschutz.html' }]
        ).map((l, i) => `<a href="${esc(l.href)}" style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;">${ed(`rechtsLinks.${i}.label`, l.label)}</a>`).join('')}
      </div>
    </div>
  </div>
</footer>`
  }]
}

// ═══════════════════════════════════════════════════════════════
// SPEISEKARTE (Restaurant)
// ═══════════════════════════════════════════════════════════════
export const MENU = {
  type: 'menu',
  label: 'Speisekarte',
  variants: [{
    id: 'menu-cards', name: 'Karten mit Preisen',
    render: (c) => `
<section data-block="menu" data-variant="menu-cards" id="speisekarte" data-section="1" style="${sectionBgStyle(c,'background:var(--p50);')}padding:80px 0;">
  <div style="max-width:1100px;margin:0 auto;padding:0 24px;">
    <div data-reveal style="text-align:center;margin-bottom:48px;">
      <div style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--p600);background:var(--p100);padding:6px 14px;border-radius:99px;margin-bottom:16px;">${ed('tag', c.tag || 'Speisekarte', 'span')}</div>
      <h2 style="font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-0.03em;color:#0f172a;">${ed('title', c.title || 'Unsere Speisekarte', 'span')}</h2>
    </div>
    ${(c.kategorien || []).map((kat, ki) => `
      <div data-reveal style="margin-bottom:40px;">
        <h3 style="font-size:20px;font-weight:700;color:var(--p700);margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid var(--p200);">${ed(`kategorien.${ki}.name`, kat.name)}</h3>
        <div style="display:grid;gap:14px;">
          ${(kat.items || []).map((it, ii) => `
            <div style="display:flex;justify-content:space-between;align-items:baseline;gap:16px;">
              <div style="flex:1;">
                <div style="font-size:16px;font-weight:600;color:#0f172a;">${ed(`kategorien.${ki}.items.${ii}.name`, it.name)}</div>
                <div style="font-size:13px;color:#64748b;margin-top:2px;">${ed(`kategorien.${ki}.items.${ii}.beschreibung`, it.beschreibung || it.desc || '')}</div>
              </div>
              <div style="border-bottom:1px dotted #cbd5e1;flex:0 0 30px;align-self:flex-end;margin-bottom:6px;"></div>
              <div style="font-size:16px;font-weight:700;color:var(--p600);white-space:nowrap;">${ed(`kategorien.${ki}.items.${ii}.preis`, it.preis)}</div>
            </div>`).join('')}
        </div>
      </div>`).join('')}
  </div>
</section>`
  }]
}

// ═══════════════════════════════════════════════════════════════
// CUSTOM HTML/CSS/JS
// ═══════════════════════════════════════════════════════════════
export const CUSTOM = {
  type: 'custom',
  label: 'Eigener Code',
  variants: [{
    id: 'custom-html', name: 'HTML/CSS/JS',
    render: (c) => `
<section data-block="custom" data-variant="custom-html" style="padding:40px 0;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;">
    <div data-edit="html" style="outline:none;">${c.html || '<div style="padding:60px;text-align:center;border:2px dashed #cbd5e1;border-radius:12px;color:#94a3b8;">Eigener Code-Block – hier klicken und Inhalt einfügen</div>'}</div>
  </div>
</section>`
  }]
}

// ═══════════════════════════════════════════════════════════════
// PREISE / PAKETE
// ═══════════════════════════════════════════════════════════════
export const PRICING = {
  type: 'pricing',
  label: 'Preise / Pakete',
  variants: [
    {
      id: 'pricing-cards', name: 'Karten 3-Spalten',
      render: (c) => `
<section data-block="pricing" data-variant="pricing-cards" id="preise" data-section="1" style="${sectionBgStyle(c,'background:var(--p50);')}padding:80px 0;">
  <div style="max-width:1100px;margin:0 auto;padding:0 24px;">
    <div data-reveal style="text-align:center;margin-bottom:48px;max-width:560px;margin-left:auto;margin-right:auto;">
      <div style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--p600);background:var(--p100);padding:6px 14px;border-radius:99px;margin-bottom:16px;">${ed('tag', c.tag, 'span')}</div>
      <h2 style="font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-0.03em;color:#0f172a;margin-bottom:12px;">${ed('title', c.title, 'span')}</h2>
      <div style="font-size:17px;color:#64748b;">${ed('subtitle', c.subtitle, 'span')}</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;align-items:stretch;">
      ${(c.plans || []).map((p, i) => `
        <div data-reveal style="background:${p.featured ? 'linear-gradient(160deg,var(--p700),var(--p900))' : '#fff'};color:${p.featured ? '#fff' : '#0f172a'};border:1px solid ${p.featured ? 'transparent' : '#e2e8f0'};border-radius:18px;padding:32px 28px;display:flex;flex-direction:column;position:relative;${p.featured ? 'box-shadow:0 20px 50px rgba(0,0,0,0.18);transform:translateY(-6px);' : ''}">
          ${p.featured ? `<div style="position:absolute;top:16px;right:16px;background:var(--accent);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:99px;text-transform:uppercase;letter-spacing:0.05em;">${ed(`plans.${i}.badge`, p.badge || 'Beliebt')}</div>` : ''}
          <h3 style="font-size:19px;font-weight:800;margin-bottom:8px;">${ed(`plans.${i}.name`, p.name)}</h3>
          <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:18px;">
            <span style="font-size:42px;font-weight:900;letter-spacing:-0.03em;">${ed(`plans.${i}.preis`, p.preis || p.price)}</span>
            <span style="font-size:14px;opacity:0.7;">${ed(`plans.${i}.hinweis`, p.hinweis || p.period || '/ Monat')}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:11px;margin-bottom:28px;flex:1;">
            ${(p.punkte || p.features || []).map((f, j) => `<div style="display:flex;align-items:flex-start;gap:10px;font-size:14px;line-height:1.5;"><i class="fa-solid fa-circle-check" style="color:${p.featured || p.highlight ? 'var(--accent)' : 'var(--p500)'};margin-top:3px;flex-shrink:0;"></i>${ed(`plans.${i}.punkte.${j}`, f)}</div>`).join('')}
          </div>
          <a href="kontakt.html" style="background:${p.featured ? '#fff' : 'var(--p500)'};color:${p.featured ? 'var(--p800)' : '#fff'};text-decoration:none;padding:13px;border-radius:10px;font-weight:700;font-size:15px;text-align:center;">${ed(`plans.${i}.cta`, p.cta || 'Auswählen')}</a>
        </div>`).join('')}
    </div>
  </div>
</section>`
    },
  ]
}

// ═══════════════════════════════════════════════════════════════
// PARTNER-LOGOS / SOCIAL PROOF
// ═══════════════════════════════════════════════════════════════
export const LOGOS = {
  type: 'logos',
  label: 'Partner-Logos',
  variants: [
    {
      id: 'logos-row', name: 'Logo-Leiste',
      render: (c) => `
<section data-block="logos" data-variant="logos-row" data-section="1" style="${sectionBgStyle(c,'background:#fff;')}padding:56px 0;">
  <div style="max-width:1100px;margin:0 auto;padding:0 24px;text-align:center;">
    <div data-reveal style="font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;margin-bottom:28px;">${ed('title', c.title, 'span')}</div>
    <div data-reveal style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:18px 40px;">
      ${(c.logos || []).map((l, i) => `<span style="font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#cbd5e1;">${ed(`logos.${i}`, l)}</span>`).join('')}
    </div>
  </div>
</section>`
    },
  ]
}

// ═══════════════════════════════════════════════════════════════
// ABLAUF / SO FUNKTIONIERT'S
// ═══════════════════════════════════════════════════════════════
export const STEPS = {
  type: 'steps',
  label: 'Ablauf / Schritte',
  variants: [
    {
      id: 'steps-horizontal', name: 'Schritte mit Icons',
      render: (c) => `
<section data-block="steps" data-variant="steps-horizontal" data-section="1" style="${sectionBgStyle(c,'background:#fff;')}padding:80px 0;">
  <div style="max-width:1100px;margin:0 auto;padding:0 24px;">
    <div data-reveal style="text-align:center;margin-bottom:52px;max-width:560px;margin-left:auto;margin-right:auto;">
      <div style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--p600);background:var(--p50);padding:6px 14px;border-radius:99px;margin-bottom:16px;">${ed('tag', c.tag, 'span')}</div>
      <h2 style="font-size:clamp(28px,4vw,42px);font-weight:800;letter-spacing:-0.03em;color:#0f172a;margin-bottom:12px;">${ed('title', c.title, 'span')}</h2>
      <div style="font-size:17px;color:#64748b;">${ed('subtitle', c.subtitle, 'span')}</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:28px;">
      ${(c.steps || []).map((s, i) => `
        <div data-reveal style="text-align:center;position:relative;">
          <div style="width:72px;height:72px;background:linear-gradient(135deg,var(--p500),var(--p700));border-radius:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;position:relative;">
            ${icon(`steps.${i}.icon`, s.icon, 28, '#fff')}
            <span style="position:absolute;top:-8px;right:-8px;width:26px;height:26px;background:var(--accent);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;border:2px solid #fff;">${i + 1}</span>
          </div>
          <h3 style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:8px;">${ed(`steps.${i}.title`, s.title)}</h3>
          <div style="font-size:14px;color:#64748b;line-height:1.65;">${ed(`steps.${i}.text`, s.text)}</div>
        </div>`).join('')}
    </div>
  </div>
</section>`
    },
  ]
}

// ═══════════════════════════════════════════════════════════════
// BILD (einzeln / Duo)
// ═══════════════════════════════════════════════════════════════
export const IMAGE = {
  type: 'image',
  label: 'Bild',
  variants: [
    {
      id: 'image-full', name: 'Großes Bild',
      render: (c) => `
<section data-block="image" data-variant="image-full" data-section="1" style="${sectionBgStyle(c,'background:#fff;')}padding:48px 0;">
  <div style="max-width:1100px;margin:0 auto;padding:0 24px;">
    <div data-reveal style="border-radius:18px;overflow:hidden;box-shadow:0 16px 50px rgba(0,0,0,0.10);">
      ${img('image', c.image, 'width:100%;height:auto;min-height:280px;display:block;')}
    </div>
    ${c.caption ? `<div style="text-align:center;font-size:13px;color:#94a3b8;margin-top:12px;">${ed('caption', c.caption, 'span')}</div>` : ''}
  </div>
</section>`
    },
    {
      id: 'image-duo', name: 'Zwei Bilder',
      render: (c) => `
<section data-block="image" data-variant="image-duo" data-section="1" style="${sectionBgStyle(c,'background:#fff;')}padding:48px 0;">
  <div style="max-width:1100px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:18px;" class="about-grid">
    <div data-reveal style="border-radius:16px;overflow:hidden;">${img('image', c.image, 'width:100%;height:320px;')}</div>
    <div data-reveal style="border-radius:16px;overflow:hidden;">${img('image2', c.image2, 'width:100%;height:320px;')}</div>
  </div>
</section>`
    },
  ]
}

// ═══════════════════════════════════════════════════════════════
// RECHTSTEXT (Impressum / Datenschutz als eigene Unterseite)
// Der lange Text bleibt EIN editierbares Feld mit erhaltenen
// Zeilenumbrüchen (white-space:pre-wrap) — so ist er im Editor
// bearbeitbar, ohne dass die Absätze verloren gehen.
// ═══════════════════════════════════════════════════════════════
export const RECHTSTEXT = {
  type: 'rechtstext',
  label: 'Rechtstext',
  variants: [
    {
      id: 'rt-schlicht', name: 'Schlicht',
      render: (c) => `
<section data-block="rechtstext" data-variant="rt-schlicht" data-section="1" style="${sectionBgStyle(c, 'background:#fff;')}padding:clamp(60px,7vw,100px) 0;">
  <div style="max-width:840px;margin:0 auto;padding:0 24px;">
    <div data-reveal style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--p600);background:var(--p100);padding:6px 14px;border-radius:99px;margin-bottom:18px;">${ed('tag', c.tag || 'Rechtliches', 'span')}</div>
    <h1 data-reveal style="font-size:clamp(28px,3.6vw,42px);font-weight:800;letter-spacing:-0.03em;color:#0f172a;margin-bottom:10px;">${ed('title', c.title || 'Impressum', 'span')}</h1>
    <div data-reveal style="font-size:15px;color:#64748b;line-height:1.7;margin-bottom:28px;">${ed('untertitel', c.untertitel || 'Angaben gemäß den gesetzlichen Vorgaben.', 'span')}</div>
    <div style="height:3px;width:64px;background:var(--p500);border-radius:99px;margin-bottom:30px;"></div>
    <div data-edit="text" style="white-space:pre-wrap;font-size:16px;line-height:1.85;color:#334155;outline:none;">${esc(c.text || '')}</div>
  </div>
</section>`
    },
    {
      id: 'rt-karte', name: 'Karte',
      render: (c) => `
<section data-block="rechtstext" data-variant="rt-karte" data-section="1" style="${sectionBgStyle(c, 'background:var(--p50);')}padding:clamp(60px,7vw,100px) 0;">
  <div style="max-width:900px;margin:0 auto;padding:0 24px;">
    <div data-reveal style="background:#fff;border:1px solid #e2e8f0;border-radius:22px;padding:clamp(28px,4vw,52px);box-shadow:0 18px 50px rgba(15,23,42,.06);">
      <h1 style="font-size:clamp(26px,3.2vw,38px);font-weight:800;letter-spacing:-0.03em;color:#0f172a;margin-bottom:8px;">${ed('title', c.title || 'Impressum', 'span')}</h1>
      <div style="font-size:15px;color:#64748b;line-height:1.7;margin-bottom:26px;">${ed('untertitel', c.untertitel || 'Angaben gemäß den gesetzlichen Vorgaben.', 'span')}</div>
      <div data-edit="text" style="white-space:pre-wrap;font-size:15.5px;line-height:1.85;color:#334155;outline:none;">${esc(c.text || '')}</div>
    </div>
  </div>
</section>`
    },
  ],
}

// ─────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────
import { ZUSATZ_BLOECKE, ZUSATZ_ADDABLE, ZUSATZ_DEFAULTS } from './blocksPlus'
import { ZUSATZ2_BLOECKE, ZUSATZ2_ADDABLE, ZUSATZ2_DEFAULTS } from './blocksPlus2'
import { ZUSATZ3_BLOECKE, ZUSATZ3_ADDABLE, ZUSATZ3_DEFAULTS } from './blocksPlus3'
import { ZUSATZ4_BLOECKE, ZUSATZ4_ADDABLE, ZUSATZ4_DEFAULTS } from './blocksPlus4'

export const BLOCK_REGISTRY = {
  ...ZUSATZ_BLOECKE,
  ...ZUSATZ2_BLOECKE,
  ...ZUSATZ3_BLOECKE,
  ...ZUSATZ4_BLOECKE,
  nav: NAV,
  'hero-full': HERO_FULL,
  'header-slim': HEADER_SLIM,
  services: SERVICES,
  steps: STEPS,
  pricing: PRICING,
  logos: LOGOS,
  about: ABOUT,
  team: TEAM,
  testimonials: TESTIMONIALS,
  stats: STATS,
  cta: CTA,
  gallery: GALLERY,
  image: IMAGE,
  faq: FAQ,
  contact: CONTACT,
  footer: FOOTER,
  menu: MENU,
  rechtstext: RECHTSTEXT,
  custom: CUSTOM,
}

// Blöcke die der Nutzer im Editor hinzufügen kann
// (Premium-Bausteine aus blocksPlus.js zuerst – das sind die schönen.)
export const ADDABLE_BLOCKS = [
  ...ZUSATZ_ADDABLE,
  ...ZUSATZ2_ADDABLE,
  ...ZUSATZ3_ADDABLE,
  ...ZUSATZ4_ADDABLE,
  { type: 'hero-full', label: 'Hero', fa: 'rectangle-ad', cat: 'Kopf & Hero' },
  { type: 'header-slim', label: 'Seiten-Header', fa: 'window-minimize', cat: 'Kopf & Hero' },
  { type: 'services', label: 'Leistungen', fa: 'bolt', cat: 'Inhalt' },
  { type: 'steps', label: 'Ablauf / Schritte', fa: 'list-ol', cat: 'Inhalt' },
  { type: 'about', label: 'Über uns', fa: 'circle-info', cat: 'Inhalt' },
  { type: 'team', label: 'Team', fa: 'users', cat: 'Inhalt' },
  { type: 'image', label: 'Bild', fa: 'image', cat: 'Inhalt' },
  { type: 'gallery', label: 'Galerie', fa: 'images', cat: 'Inhalt' },
  { type: 'faq', label: 'FAQ', fa: 'circle-question', cat: 'Inhalt' },
  { type: 'testimonials', label: 'Kundenstimmen', fa: 'comment', cat: 'Vertrauen' },
  { type: 'stats', label: 'Zahlen', fa: 'chart-simple', cat: 'Vertrauen' },
  { type: 'logos', label: 'Partner-Logos', fa: 'handshake-angle', cat: 'Vertrauen' },
  { type: 'pricing', label: 'Preise / Pakete', fa: 'tags', cat: 'Konversion' },
  { type: 'cta', label: 'Call to Action', fa: 'bullhorn', cat: 'Konversion' },
  { type: 'contact', label: 'Kontakt', fa: 'envelope', cat: 'Konversion' },
  { type: 'menu', label: 'Speisekarte', fa: 'utensils', cat: 'Sonstiges', nurBranche: ['restaurant'] },
  { type: 'rechtstext', label: 'Rechtstext', fa: 'scale-balanced', cat: 'Sonstiges' },
  { type: 'custom', label: 'Eigener Code', fa: 'code', cat: 'Sonstiges' },
]

// Kategorien-Reihenfolge für die Editor-Bibliothek
export const BLOCK_CATEGORIES = ['Kopf & Hero', 'Inhalt', 'Vertrauen', 'Konversion', 'Sonstiges']

// Hole alle Varianten eines Block-Typs (für Editor-Auswahl)
export function getVariants(type) {
  return BLOCK_REGISTRY[type]?.variants || []
}

// Standard-Inhalte für die klassischen Bausteine.
// Ohne diese Werte wird ein frisch eingefügter Block leer gerendert – dann
// sieht die Seite kaputt aus, obwohl nur noch nichts eingetragen wurde.
export const BASIS_DEFAULTS = {
  nav: { firmenname: 'Ihr Unternehmen', navLinks: [{ label: 'Startseite', href: 'index.html' }, { label: 'Leistungen', href: 'leistungen.html' }, { label: 'Über uns', href: 'ueber-uns.html' }, { label: 'Kontakt', href: 'kontakt.html' }] },
  'header-slim': { tag: 'Willkommen', headline: 'Überschrift der Seite', subline: 'Ein kurzer Satz, der erklärt, worum es auf dieser Seite geht.' },
  services: {
    tag: 'Leistungen', title: 'Das können wir für Sie tun', subtitle: 'Von der ersten Beratung bis zur fertigen Umsetzung – alles aus einer Hand.',
    items: [
      { icon: 'bolt', title: 'Schnelle Umsetzung', text: 'Kurze Wege, klare Absprachen und Termine, die auch halten.' },
      { icon: 'shield-halved', title: 'Geprüfte Qualität', text: 'Saubere Arbeit nach Norm – geprüft, dokumentiert und versichert.' },
      { icon: 'handshake', title: 'Ihr Vorteil', text: 'Beschreiben Sie hier in einem Satz, was Kunden bei Ihnen erwartet.' },
    ],
  },
  steps: {
    tag: 'Ablauf', title: 'So läuft es bei uns ab', subtitle: 'Vier Schritte bis zum fertigen Ergebnis.',
    steps: [
      { title: 'Anfrage', text: 'Sie schildern uns kurz, worum es geht – per Telefon oder Formular.' },
      { title: 'Termin vor Ort', text: 'Wir schauen uns die Lage an und beraten Sie ehrlich.' },
      { title: 'Angebot', text: 'Beschreiben Sie hier, wie dieser Schritt bei Ihnen abläuft.' },
      { title: 'Umsetzung', text: 'Unser Team erledigt die Arbeit – sauber und zum vereinbarten Termin.' },
    ],
  },
  pricing: {
    tag: 'Preise', title: 'Klare Pakete, klare Preise', subtitle: 'Kein Kleingedrucktes – Sie wissen vorher, was es kostet.',
    plans: [
      { name: 'Basis', preis: 'ab 89 €', hinweis: 'einmalig', punkte: ['Leistung 1 eintragen', 'Leistung 2 eintragen', 'Leistung 3 eintragen'], cta: 'Anfragen' },
      { name: 'Komfort', preis: 'ab 149 €', hinweis: 'einmalig', punkte: ['Alles aus Basis', 'Wunschtermin', 'Verlängerte Garantie'], cta: 'Anfragen', highlight: true },
      { name: 'Rundum', preis: 'auf Anfrage', hinweis: 'individuell', punkte: ['Alles aus Komfort', 'Regelmäßige Wartung', 'Fester Ansprechpartner'], cta: 'Beraten lassen' },
    ],
  },
  logos: { title: 'Partner, die uns vertrauen', logos: ['Partner', 'Zertifikat', 'Innung', 'Verband', 'Auszeichnung', 'Mitglied'] },
  about: {
    tag: 'Über uns', title: 'Ein Team, auf das Sie sich verlassen können',
    text1: 'Seit vielen Jahren sind wir in der Region für unsere Kundinnen und Kunden im Einsatz. Was klein angefangen hat, ist heute ein eingespieltes Team mit einem klaren Anspruch: saubere Arbeit, ehrliche Beratung und Termine, die halten.',
    text2: 'Wir nehmen uns Zeit für Ihr Anliegen, erklären jeden Schritt verständlich und bleiben auch nach Abschluss ansprechbar.',
    cta: 'Lernen Sie uns kennen',
    stats: [{ num: '0', label: 'Ihre Kennzahl' }, { num: '0', label: 'Ihre Kennzahl' }, { num: '0', label: 'Ihre Kennzahl' }],
  },
  team: {
    tag: 'Team', title: 'Die Menschen hinter dem Namen',
    members: [
      { name: 'Vorname Nachname', rolle: 'Position', text: 'Kurze Beschreibung dieser Person.' },
      { name: 'Vorname Nachname', rolle: 'Position', text: 'Kurze Beschreibung dieser Person.' },
      { name: 'Vorname Nachname', rolle: 'Position', text: 'Kurze Beschreibung dieser Person.' },
    ],
  },
  testimonials: {
    title: 'Das sagen unsere Kunden',
    items: [
      { text: 'Hier steht später eine echte Kundenstimme – im Editor anklicken und ersetzen.', name: 'Kundenname', ort: 'Ort', sterne: 5 },
      { text: 'Endlich ein Betrieb, der zurückruft und sich an Absprachen hält.', name: 'M. Schuster', ort: 'Potsdam', sterne: 5 },
      { text: 'Faires Angebot, saubere Arbeit, alles wie besprochen.', name: 'L. Wagner', ort: 'Berlin', sterne: 5 },
    ],
  },
  stats: { items: [{ num: '0', label: 'Ihre Kennzahl' }, { num: '0', label: 'Ihre Kennzahl' }, { num: '0', label: 'Ihre Kennzahl' }] },
  cta: { title: 'Bereit für den nächsten Schritt?', subtitle: 'Schreiben Sie uns oder rufen Sie an – wir melden uns am selben Tag zurück.', cta1: 'Jetzt anfragen', telefon: '+49 30 1234567' },
  gallery: { title: 'Einblicke in unsere Arbeit', images: ['', '', '', '', '', ''] },
  image: { caption: 'Kurze Bildunterschrift' },
  faq: {
    title: 'Häufige Fragen',
    items: [
      { frage: 'Wie schnell bekomme ich einen Termin?', antwort: 'In der Regel innerhalb weniger Tage. Bei dringenden Fällen melden wir uns noch am selben Tag.' },
      { frage: 'Was kostet die Beratung?', antwort: 'Das Erstgespräch und die Besichtigung vor Ort sind für Sie kostenlos und unverbindlich.' },
      { frage: 'Hier steht eine häufige Kundenfrage?', antwort: 'Und hier die passende Antwort – beides im Editor anklicken und durch echte Inhalte ersetzen.' },
      { frage: 'In welchem Umkreis sind Sie tätig?', antwort: 'Im gesamten Stadtgebiet und im Umkreis von rund 50 Kilometern.' },
    ],
  },
  contact: { tag: 'Kontakt', title: 'Schreiben Sie uns', subtitle: 'Wir antworten in der Regel noch am selben Werktag.', adresse: 'Musterstraße 1, 10115 Berlin', telefon: '+49 30 1234567', email: 'info@beispiel.de', oeffnung: 'Mo–Fr 9–18 Uhr' },
  footer: { firmenname: 'Ihr Unternehmen', footerDesc: 'Ihr verlässlicher Partner in der Region – persönlich, sauber, termintreu.', telefon: '+49 30 1234567', email: 'info@beispiel.de', oeffnung: 'Mo–Fr 9–18 Uhr', navLinks: [{ label: 'Startseite', href: 'index.html' }, { label: 'Leistungen', href: 'leistungen.html' }, { label: 'Kontakt', href: 'kontakt.html' }] },
  menu: {
    tag: 'Karte', title: 'Unsere Speisekarte',
    kategorien: [
      { name: 'Vorspeisen', items: [{ name: 'Hausgemachte Suppe', beschreibung: 'Mit frischen Kräutern', preis: '5,90 €' }, { name: 'Bruschetta', beschreibung: 'Tomate, Basilikum, Olivenöl', preis: '6,50 €' }] },
      { name: 'Hauptgerichte', items: [{ name: 'Schnitzel', beschreibung: 'Mit Pommes und Salat', preis: '14,90 €' }, { name: 'Pasta des Tages', beschreibung: 'Täglich wechselnd', preis: '12,50 €' }] },
    ],
  },
  custom: { html: '<div style="padding:40px;text-align:center;">Hier steht Ihr eigener HTML-Code.</div>' },
  rechtstext: {
    tag: 'Rechtliches', title: 'Impressum', untertitel: 'Angaben gemäß den gesetzlichen Vorgaben.',
    text: 'Diesen Text im Kundenkonto unter „Rechtstexte" erzeugen lassen oder hier direkt einfügen.',
  },
}

// Standard-Inhalte für neu eingefügte Bausteine
export const ALLE_DEFAULTS = { ...ZUSATZ_DEFAULTS, ...ZUSATZ2_DEFAULTS, ...ZUSATZ3_DEFAULTS, ...ZUSATZ4_DEFAULTS, ...BASIS_DEFAULTS }
export { ZUSATZ_DEFAULTS, ZUSATZ2_DEFAULTS }

// Rendere einen Block
export function renderBlock(type, variantId, content) {
  const block = BLOCK_REGISTRY[type]
  if (!block) return ''
  const variant = block.variants.find(v => v.id === variantId) || block.variants[0]
  return variant.render(content || {})
}
