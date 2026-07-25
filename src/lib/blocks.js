// ─────────────────────────────────────────────────────────────
// BLOCK-BIBLIOTHEK
// Jeder Block: render(content) → HTML. Tailwind + CSS-Variablen.
// Editierbare Texte: data-edit="key" | Bilder: data-img="key"
// Farben über var(--p500) etc. → Live-Änderung möglich
// ─────────────────────────────────────────────────────────────

const esc = (s) => String(s ?? '')

// Helper: editierbarer Text
const ed = (key, val, tag = 'span', cls = '') =>
  `<${tag} data-edit="${key}" class="${cls}" style="outline:none;">${esc(val)}</${tag}>`

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
      ${(c.navLinks || []).map(l => `<a href="${l.href}" style="font-size:14px;font-weight:500;color:#475569;text-decoration:none;padding:8px 14px;border-radius:8px;transition:all 0.2s;" onmouseover="this.style.background='var(--p50)';this.style.color='var(--p700)'" onmouseout="this.style.background='transparent';this.style.color='#475569'">${esc(l.label)}</a>`).join('')}
      <a href="kontakt.html" style="background:var(--p500);color:#fff;text-decoration:none;padding:9px 20px;border-radius:8px;font-weight:600;font-size:14px;margin-left:8px;">Kontakt</a>
    </div>
    <button class="nav-burger" onclick="this.nextElementSibling?this.parentElement.parentElement.querySelector('.nav-mobile').classList.toggle('hidden'):0" style="display:none;background:none;border:none;cursor:pointer;font-size:22px;color:var(--p700);"><i class="fa-solid fa-bars"></i></button>
  </div>
  <div class="nav-mobile hidden" style="display:none;padding:12px 24px;border-top:1px solid #f0f0f0;flex-direction:column;gap:4px;">
    ${(c.navLinks || []).map(l => `<a href="${l.href}" style="font-size:15px;font-weight:500;color:#475569;text-decoration:none;padding:10px;">${esc(l.label)}</a>`).join('')}
  </div>
</nav>`
  }]
}

// ═══════════════════════════════════════════════════════════════
// HERO FULL (Startseite – groß)
// ═══════════════════════════════════════════════════════════════
export const HERO_FULL = {
  type: 'hero-full',
  label: 'Hero (Startseite)',
  variants: [
    {
      id: 'hero-gradient', name: 'Gradient Dunkel',
      render: (c) => `
<section data-block="hero-full" data-variant="hero-gradient" data-section="1" style="position:relative;min-height:88vh;display:flex;align-items:center;overflow:hidden;${sectionBgStyle(c, 'background:linear-gradient(135deg,var(--p900),var(--p700) 60%,var(--p600));')}padding:80px 0;">
  <div style="position:absolute;top:-100px;right:-100px;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,0.08),transparent 70%);"></div>
  <div style="position:absolute;bottom:-80px;left:5%;width:300px;height:300px;border-radius:50%;background:var(--accent);opacity:0.12;filter:blur(40px);"></div>
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;position:relative;z-index:1;">
    <div data-reveal style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:99px;padding:6px 16px;margin-bottom:24px;">
      <div style="width:7px;height:7px;background:#22c55e;border-radius:50%;"></div>
      ${ed('tag', c.tag, 'span', '')} 
    </div>
    <h1 data-reveal style="font-size:clamp(40px,6vw,72px);font-weight:900;line-height:1.05;letter-spacing:-0.04em;color:#fff;max-width:800px;margin-bottom:20px;">${ed('headline', c.headline, 'span')}</h1>
    <p data-reveal style="font-size:19px;color:rgba(255,255,255,0.75);max-width:560px;line-height:1.7;margin-bottom:36px;">${ed('subline', c.subline, 'span')}</p>
    <div data-reveal style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:56px;">
      <a href="kontakt.html" style="background:#fff;color:var(--p700);text-decoration:none;padding:15px 30px;border-radius:10px;font-weight:700;font-size:16px;">${ed('cta1', c.cta1, 'span')}</a>
      <a href="#leistungen" style="background:rgba(255,255,255,0.1);color:#fff;text-decoration:none;padding:15px 30px;border-radius:10px;font-weight:600;font-size:16px;border:1px solid rgba(255,255,255,0.3);">${ed('cta2', c.cta2, 'span')}</a>
    </div>
    <div data-reveal style="display:flex;gap:48px;flex-wrap:wrap;">
      ${(c.stats || []).map(s => `<div><div style="font-size:38px;font-weight:800;color:#fff;letter-spacing:-0.02em;">${ed('stat_'+s.label, s.num, 'span')}</div><div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:2px;">${esc(s.label)}</div></div>`).join('')}
    </div>
  </div>
</section>`
    },
    {
      id: 'hero-split', name: 'Split mit Bild',
      render: (c) => `
<section data-block="hero-full" data-variant="hero-split" style="background:var(--p50);padding:80px 0;min-height:85vh;display:flex;align-items:center;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;" class="hero-split-grid">
    <div>
      <div data-reveal style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--p600);background:var(--p100);padding:6px 14px;border-radius:99px;margin-bottom:20px;">${ed('tag', c.tag, 'span')}</div>
      <h1 data-reveal style="font-size:clamp(36px,5vw,58px);font-weight:900;line-height:1.1;letter-spacing:-0.04em;color:#0f172a;margin-bottom:20px;">${ed('headline', c.headline, 'span')}</h1>
      <p data-reveal style="font-size:18px;color:#64748b;line-height:1.7;margin-bottom:32px;max-width:480px;">${ed('subline', c.subline, 'span')}</p>
      <div data-reveal style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:40px;">
        <a href="kontakt.html" style="background:var(--p500);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:16px;">${ed('cta1', c.cta1, 'span')}</a>
        <a href="#leistungen" style="background:#fff;color:var(--p700);text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:16px;border:1.5px solid var(--p200);">${ed('cta2', c.cta2, 'span')}</a>
      </div>
      <div data-reveal style="display:flex;gap:32px;flex-wrap:wrap;">
        ${(c.stats || []).map(s => `<div><div style="font-size:28px;font-weight:800;color:var(--p600);">${ed('stat_'+s.label, s.num, 'span')}</div><div style="font-size:13px;color:#94a3b8;">${esc(s.label)}</div></div>`).join('')}
      </div>
    </div>
    <div data-reveal style="position:relative;">
      ${img('heroImg', c.heroImg, 'border-radius:20px;width:100%;height:480px;')}
      <div style="position:absolute;bottom:20px;left:20px;background:#fff;border-radius:12px;padding:14px 18px;box-shadow:0 8px 32px rgba(0,0,0,0.12);display:flex;align-items:center;gap:10px;">
        <div style="width:10px;height:10px;background:#22c55e;border-radius:50%;"></div>
        <span style="font-size:13px;font-weight:600;color:#0f172a;">${ed('badge', c.badge || c.tag, 'span')}</span>
      </div>
    </div>
  </div>
</section>`
    },
    {
      id: 'hero-center', name: 'Zentriert Minimal',
      render: (c) => `
<section data-block="hero-full" data-variant="hero-center" data-section="1" style="${sectionBgStyle(c, 'background:#fff;')}padding:120px 0 100px;text-align:center;position:relative;overflow:hidden;">
  <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:700px;height:400px;background:radial-gradient(ellipse,var(--p100),transparent 70%);opacity:0.6;"></div>
  <div style="max-width:800px;margin:0 auto;padding:0 24px;position:relative;z-index:1;">
    <div data-reveal style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--p600);background:var(--p50);padding:6px 16px;border-radius:99px;margin-bottom:24px;">${ed('tag', c.tag, 'span')}</div>
    <h1 data-reveal style="font-size:clamp(40px,6vw,68px);font-weight:900;line-height:1.08;letter-spacing:-0.04em;color:${c.bgImg ? '#fff' : '#0f172a'};margin-bottom:24px;">${ed('headline', c.headline, 'span')}</h1>
    <p data-reveal style="font-size:20px;color:${c.bgImg ? 'rgba(255,255,255,0.85)' : '#64748b'};line-height:1.7;margin:0 auto 36px;max-width:560px;">${ed('subline', c.subline, 'span')}</p>
    <div data-reveal style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:64px;">
      <a href="kontakt.html" style="background:var(--p500);color:#fff;text-decoration:none;padding:15px 32px;border-radius:10px;font-weight:700;font-size:16px;">${ed('cta1', c.cta1, 'span')}</a>
      <a href="#leistungen" style="background:${c.bgImg ? 'rgba(255,255,255,0.15)' : '#fff'};color:${c.bgImg ? '#fff' : 'var(--p700)'};text-decoration:none;padding:15px 32px;border-radius:10px;font-weight:600;font-size:16px;border:1.5px solid ${c.bgImg ? 'rgba(255,255,255,0.4)' : 'var(--p200)'};">${ed('cta2', c.cta2, 'span')}</a>
    </div>
    ${c.bgImg ? '' : `<div data-reveal>${img('heroImg', c.heroImg, 'border-radius:20px;width:100%;height:400px;box-shadow:0 20px 60px rgba(0,0,0,0.15);')}</div>`}
  </div>
</section>`
    },
    {
      id: 'hero-bild', name: 'Text + Bild',
      render: (c) => `
<section data-block="hero-full" data-variant="hero-split" data-section="1" style="${sectionBgStyle(c, 'background:#fff;')}padding:90px 0;position:relative;overflow:hidden;">
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center;" class="about-grid">
    <div data-reveal>
      <div style="display:inline-block;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--p600);background:var(--p50);padding:6px 16px;border-radius:99px;margin-bottom:20px;">${ed('tag', c.tag, 'span')}</div>
      <h1 style="font-size:clamp(34px,4.5vw,56px);font-weight:900;line-height:1.1;letter-spacing:-0.04em;color:#0f172a;margin-bottom:20px;">${ed('headline', c.headline, 'span')}</h1>
      <p style="font-size:18px;color:#64748b;line-height:1.7;margin-bottom:32px;">${ed('subline', c.subline, 'span')}</p>
      <div style="display:flex;gap:14px;flex-wrap:wrap;">
        <a href="kontakt.html" style="background:var(--p500);color:#fff;text-decoration:none;padding:15px 32px;border-radius:10px;font-weight:700;font-size:16px;">${ed('cta1', c.cta1, 'span')}</a>
        <a href="#leistungen" style="background:#fff;color:var(--p700);text-decoration:none;padding:15px 32px;border-radius:10px;font-weight:600;font-size:16px;border:1.5px solid var(--p200);">${ed('cta2', c.cta2, 'span')}</a>
      </div>
    </div>
    <div data-reveal>
      ${img('heroImg', c.heroImg, 'border-radius:20px;width:100%;height:440px;box-shadow:0 24px 60px rgba(0,0,0,0.14);')}
    </div>
  </div>
</section>`
    },
    {
      id: 'hero-mesh', name: 'Modern Bewegt',
      render: (c) => `
<section data-block="hero-full" data-variant="hero-mesh" data-section="1" style="position:relative;min-height:90vh;display:flex;align-items:center;overflow:hidden;background:linear-gradient(160deg,var(--p900),#0d1b2a 65%);padding:90px 0;">
  <style>
    @keyframes hmDriftA{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(70px,50px) scale(1.2)}}
    @keyframes hmDriftB{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-60px,-40px) scale(1.15)}}
    @keyframes hmStrich{to{clip-path:inset(0 0 0 0)}}
    .hm-strich{clip-path:inset(0 100% 0 0);animation:hmStrich .9s .5s cubic-bezier(.25,.7,.3,1) forwards}
  </style>
  <div aria-hidden="true" style="position:absolute;top:-160px;left:-100px;width:560px;height:560px;border-radius:50%;filter:blur(60px);background:radial-gradient(circle,var(--accent),transparent 70%);opacity:.55;animation:hmDriftA 24s ease-in-out infinite;"></div>
  <div aria-hidden="true" style="position:absolute;bottom:-180px;right:-80px;width:520px;height:520px;border-radius:50%;filter:blur(60px);background:radial-gradient(circle,var(--p500),transparent 70%);opacity:.5;animation:hmDriftB 29s ease-in-out infinite;"></div>
  <div style="max-width:1200px;margin:0 auto;padding:0 24px;position:relative;z-index:1;">
    <div data-reveal style="display:inline-flex;align-items:center;gap:9px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);border-radius:99px;padding:8px 18px;margin-bottom:26px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#fff;">
      <span style="width:7px;height:7px;background:var(--accent);border-radius:50%;"></span>${ed('tag', c.tag, 'span')}
    </div>
    <h1 data-reveal style="font-size:clamp(42px,7vw,84px);font-weight:200;line-height:1.06;letter-spacing:-.03em;color:#fff;max-width:820px;margin-bottom:22px;">
      ${ed('headline', c.headline, 'span')}
    </h1>
    <p data-reveal style="font-size:19px;font-weight:400;color:rgba(255,255,255,.75);max-width:560px;line-height:1.7;margin-bottom:38px;">${ed('subline', c.subline, 'span')}</p>
    <div data-reveal style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:58px;">
      <a href="kontakt.html" style="background:var(--accent);color:#fff;text-decoration:none;padding:17px 32px;border-radius:99px;font-weight:700;font-size:16px;box-shadow:0 14px 30px rgba(0,0,0,.3);">${ed('cta1', c.cta1, 'span')}</a>
      <a href="#leistungen" style="background:transparent;color:#fff;text-decoration:none;padding:17px 32px;border-radius:99px;font-weight:600;font-size:16px;border:1.5px solid rgba(255,255,255,.35);">${ed('cta2', c.cta2, 'span')}</a>
    </div>
    <div data-reveal style="display:flex;gap:48px;flex-wrap:wrap;">
      ${(c.stats || []).map(s => `<div><div style="font-size:36px;font-weight:800;color:#fff;letter-spacing:-.02em;">${ed('stat_'+s.label, s.num, 'span')}</div><div style="font-size:13px;color:rgba(255,255,255,.6);margin-top:2px;">${esc(s.label)}</div></div>`).join('')}
    </div>
  </div>
</section>`
    },
    {
      id: 'hero-foto', name: 'Foto Vollbild',
      render: (c) => `
<section data-block="hero-full" data-variant="hero-foto" data-section="1" class="wg-dunkelzone" style="position:relative;min-height:92vh;display:flex;align-items:flex-end;overflow:hidden;${sectionBgStyle(c, 'background:linear-gradient(160deg,var(--p900),#0d1b2a);')}">
  <div aria-hidden="true" style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,20,32,.15),rgba(10,20,32,.8));"></div>
  <div class="wg-wrap" style="position:relative;z-index:1;padding-top:124px;padding-bottom:66px;">
    <div class="wg-reveal" style="max-width:920px;">
      <span class="wg-chip glas">${ed('tag', c.tag, 'span')}</span>
      <h1 class="wg-t1" style="color:#fff;margin-top:22px;">${ed('headline', c.headline, 'span')}</h1>
      <span class="wg-strichlinie"></span>
      <p class="wg-lead" style="color:rgba(255,255,255,.8);max-width:600px;">${ed('subline', c.subline, 'span')}</p>
    </div>
    <div class="wg-reveal" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:34px;transition-delay:.1s;">
      <a href="kontakt.html" class="wg-btn">${ed('cta1', c.cta1, 'span')}</a>
      <a href="#leistungen" class="wg-btn-leer hell">${ed('cta2', c.cta2, 'span')}</a>
    </div>
    ${(c.stats && c.stats.length) ? `<div class="wg-reveal" style="display:flex;gap:46px;flex-wrap:wrap;margin-top:48px;transition-delay:.18s;">${c.stats.map(s => `<div><div class="wg-stat-num">${ed('stat_' + s.label, s.num, 'span')}</div><div class="wg-stat-lab">${esc(s.label)}</div></div>`).join('')}</div>` : ''}
  </div>
</section>`
    },
    {
      id: 'hero-editorial', name: 'Editorial Hell',
      render: (c) => `
<section data-block="hero-full" data-variant="hero-editorial" data-section="1" style="${sectionBgStyle(c, 'background:#fff;')}padding:clamp(96px,12vw,150px) 0 clamp(56px,7vw,88px);position:relative;overflow:hidden;">
  <div class="wg-wrap">
    <div class="wg-reveal" style="max-width:780px;">
      <span class="wg-eyebrow">${ed('tag', c.tag, 'span')}</span>
      <h1 class="wg-t1" style="margin-top:20px;">${ed('headline', c.headline, 'span')}</h1>
      <span class="wg-strichlinie"></span>
    </div>
    <div class="wg-split" style="display:grid;grid-template-columns:1.15fr .85fr;gap:48px;align-items:end;margin-top:22px;">
      <div class="wg-reveal li wg-bildbox" style="height:clamp(280px,42vw,460px);transition-delay:.08s;">${img('heroImg', c.heroImg, '')}</div>
      <div class="wg-reveal re" style="transition-delay:.14s;">
        <p class="wg-lead" style="margin-bottom:26px;">${ed('subline', c.subline, 'span')}</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px;">
          <a href="kontakt.html" class="wg-btn">${ed('cta1', c.cta1, 'span')}</a>
          <a href="#leistungen" class="wg-btn-leer">${ed('cta2', c.cta2, 'span')}</a>
        </div>
        ${(c.stats && c.stats.length) ? `<div style="display:flex;gap:34px;flex-wrap:wrap;border-top:1px solid rgba(15,23,42,.1);padding-top:22px;">${c.stats.map(s => `<div><div class="wg-stat-num">${ed('stat_' + s.label, s.num, 'span')}</div><div class="wg-stat-lab">${esc(s.label)}</div></div>`).join('')}</div>` : ''}
      </div>
    </div>
  </div>
</section>`
    },
    {
      id: 'hero-akzent', name: 'Akzent Hell',
      render: (c) => `
<section data-block="hero-full" data-variant="hero-akzent" data-section="1" style="${sectionBgStyle(c, 'background:var(--p50);')}padding:clamp(88px,11vw,140px) 0;position:relative;overflow:hidden;">
  <div aria-hidden="true" style="position:absolute;top:-120px;right:-60px;width:520px;height:520px;border-radius:50%;background:radial-gradient(circle,var(--p200),transparent 70%);opacity:.55;"></div>
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1fr 1fr;gap:52px;align-items:center;">
      <div class="wg-reveal li">
        <span class="wg-eyebrow">${ed('tag', c.tag, 'span')}</span>
        <h1 class="wg-t1" style="margin-top:18px;">${ed('headline', c.headline, 'span')}</h1>
        <span class="wg-strichlinie"></span>
        <p class="wg-lead" style="max-width:480px;margin-bottom:32px;">${ed('subline', c.subline, 'span')}</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <a href="kontakt.html" class="wg-btn">${ed('cta1', c.cta1, 'span')}</a>
          <a href="#leistungen" class="wg-btn-leer">${ed('cta2', c.cta2, 'span')}</a>
        </div>
      </div>
      <div class="wg-reveal re" style="position:relative;transition-delay:.12s;">
        <div class="wg-bildbox" style="height:clamp(320px,44vw,480px);box-shadow:0 30px 70px rgba(15,23,42,.18);">${img('heroImg', c.heroImg, '')}</div>
        <div style="position:absolute;left:-18px;bottom:26px;background:#fff;border-radius:14px;padding:14px 18px;box-shadow:0 14px 34px rgba(15,23,42,.16);display:flex;align-items:center;gap:10px;">
          <span style="width:10px;height:10px;border-radius:50%;background:var(--accent);"></span>
          <span style="font-size:13px;font-weight:700;color:#0f172a;">${ed('badge', c.badge || c.tag, 'span')}</span>
        </div>
      </div>
    </div>
  </div>
</section>`
    },
    {
      id: 'hero-magazin', name: 'Magazin',
      render: (c) => `
<section data-block="hero-full" data-variant="hero-magazin" data-section="1" style="${sectionBgStyle(c, 'background:#fff;')}padding:clamp(80px,10vw,120px) 0;position:relative;overflow:hidden;">
  <div class="wg-wrap">
    <div class="wg-split" style="display:grid;grid-template-columns:1.05fr .95fr;gap:0;align-items:center;">
      <div class="wg-reveal" style="position:relative;z-index:2;">
        <span class="wg-eyebrow">${ed('tag', c.tag, 'span')}</span>
        <h1 class="wg-t1" style="margin-top:18px;font-size:clamp(44px,7.5vw,92px);">${ed('headline', c.headline, 'span')}</h1>
        <p class="wg-lead" style="max-width:440px;margin:22px 0 30px;">${ed('subline', c.subline, 'span')}</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <a href="kontakt.html" class="wg-btn">${ed('cta1', c.cta1, 'span')}</a>
          <a href="#leistungen" class="wg-btn-leer">${ed('cta2', c.cta2, 'span')}</a>
        </div>
      </div>
      <div class="wg-reveal re wg-bildbox wg-hide-mob" style="height:clamp(360px,46vw,540px);margin-left:-40px;transition-delay:.12s;">${img('heroImg', c.heroImg, '')}</div>
    </div>
  </div>
</section>`
    },
    {
      id: 'hero-duo', name: 'Duo Karten',
      render: (c) => `
<section data-block="hero-full" data-variant="hero-duo" data-section="1" class="wg-dunkelzone" style="position:relative;min-height:86vh;display:flex;align-items:center;overflow:hidden;${sectionBgStyle(c, 'background:linear-gradient(160deg,var(--p900),#0d1b2a 70%);')}">
  <div class="wg-mesh"><span class="wg-blob wg-blob-a"></span><span class="wg-blob wg-blob-b"></span></div>
  <div class="wg-wrap" style="position:relative;z-index:1;">
    <div class="wg-split" style="display:grid;grid-template-columns:1.1fr .9fr;gap:52px;align-items:center;">
      <div class="wg-reveal">
        <span class="wg-chip glas">${ed('tag', c.tag, 'span')}</span>
        <h1 class="wg-t1" style="color:#fff;margin-top:22px;">${ed('headline', c.headline, 'span')}</h1>
        <p class="wg-lead" style="color:rgba(255,255,255,.78);max-width:520px;margin:22px 0 32px;">${ed('subline', c.subline, 'span')}</p>
        <div style="display:flex;gap:14px;flex-wrap:wrap;">
          <a href="kontakt.html" class="wg-btn">${ed('cta1', c.cta1, 'span')}</a>
          <a href="#leistungen" class="wg-btn-leer hell">${ed('cta2', c.cta2, 'span')}</a>
        </div>
      </div>
      <div class="wg-reveal re" style="display:flex;flex-direction:column;gap:16px;transition-delay:.12s;">
        ${((c.stats && c.stats.length ? c.stats : [{ num: '100%', label: 'Zuverlässig' }, { num: '24/7', label: 'Erreichbar' }]).slice(0, 3)).map(s => `<div class="wg-karte" style="display:flex;align-items:center;gap:16px;padding:20px 22px;"><div class="wg-iconchip" style="width:46px;height:46px;font-size:18px;"><i class="fa-solid fa-check"></i></div><div><div style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-.02em;">${esc(s.num)}</div><div style="font-size:13px;color:#64748b;">${esc(s.label)}</div></div></div>`).join('')}
      </div>
    </div>
  </div>
</section>`
    },
    {
      id: 'hero-minimal', name: 'Vollbild Minimal',
      render: (c) => `
<section data-block="hero-full" data-variant="hero-minimal" data-section="1" class="wg-dunkelzone" style="position:relative;min-height:96vh;display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden;${sectionBgStyle(c, 'background:linear-gradient(160deg,#0d1b2a,var(--p900));')}">
  <div class="wg-mesh"><span class="wg-blob wg-blob-a"></span><span class="wg-blob wg-blob-b"></span><span class="wg-blob wg-blob-c"></span></div>
  <div class="wg-wrap" style="position:relative;z-index:1;max-width:900px;">
    <div class="wg-reveal">
      <span class="wg-chip glas">${ed('tag', c.tag, 'span')}</span>
      <h1 class="wg-t1" style="color:#fff;margin:24px auto 0;font-size:clamp(44px,8vw,96px);">${ed('headline', c.headline, 'span')}</h1>
      <span class="wg-strichlinie mitte"></span>
      <p class="wg-lead" style="color:rgba(255,255,255,.78);max-width:560px;margin:0 auto 36px;">${ed('subline', c.subline, 'span')}</p>
      <a href="kontakt.html" class="wg-btn">${ed('cta1', c.cta1, 'span')}</a>
    </div>
  </div>
</section>`
    },
  ]
}

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
    <p data-reveal style="font-size:18px;color:rgba(255,255,255,0.75);max-width:560px;line-height:1.6;">${ed('subline', c.subline, 'span')}</p>
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
    <p data-reveal style="font-size:18px;color:#64748b;max-width:560px;margin:0 auto;line-height:1.6;">${ed('subline', c.subline, 'span')}</p>
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
      <p style="font-size:17px;color:#64748b;line-height:1.7;">${ed('subtitle', c.subtitle, 'span')}</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;">
      ${(c.items || []).map((it, i) => `
        <div data-reveal style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px;transition:all 0.3s;" onmouseover="this.style.boxShadow='0 12px 40px rgba(0,0,0,0.08)';this.style.transform='translateY(-4px)';this.style.borderColor='var(--p200)'" onmouseout="this.style.boxShadow='none';this.style.transform='none';this.style.borderColor='#e2e8f0'">
          <div style="width:52px;height:52px;background:var(--p50);border-radius:13px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">${icon('svc_icon_'+i, it.icon, 24, 'var(--p600)')}</div>
          <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:8px;">${ed('svc_title_'+i, it.title, 'span')}</h3>
          <p style="font-size:14px;color:#64748b;line-height:1.65;">${ed('svc_text_'+i, it.text, 'span')}</p>
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
          <div><h3 style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:6px;">${ed('svc_title_'+i, it.title, 'span')}</h3><p style="font-size:14px;color:#64748b;line-height:1.6;">${ed('svc_text_'+i, it.text, 'span')}</p></div>
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
      <p style="font-size:17px;color:#64748b;">${ed('subtitle', c.subtitle, 'span')}</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:32px;">
      ${(c.items || []).map((it, i) => `
        <div data-reveal style="text-align:center;">
          <div style="width:64px;height:64px;background:linear-gradient(135deg,var(--p400),var(--p600));border-radius:18px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">${icon('svc_icon_'+i, it.icon, 28, '#fff')}</div>
          <h3 style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:8px;">${ed('svc_title_'+i, it.title, 'span')}</h3>
          <p style="font-size:14px;color:#64748b;line-height:1.65;">${ed('svc_text_'+i, it.text, 'span')}</p>
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
      <p style="font-size:16px;color:#475569;line-height:1.8;margin-bottom:14px;">${ed('text1', c.text1, 'span')}</p>
      <p style="font-size:15px;color:#64748b;line-height:1.8;margin-bottom:28px;">${ed('text2', c.text2, 'span')}</p>
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
      <p style="font-size:16px;color:#475569;line-height:1.8;margin-bottom:14px;">${ed('text1', c.text1, 'span')}</p>
      <p style="font-size:15px;color:#64748b;line-height:1.8;">${ed('text2', c.text2, 'span')}</p>
    </div>
    <div data-reveal style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      ${(c.stats || []).map((s, i) => `<div style="background:${i%2===0?'linear-gradient(135deg,var(--p500),var(--p700))':'var(--p50)'};color:${i%2===0?'#fff':'#0f172a'};border-radius:16px;padding:28px;text-align:center;${i%2!==0?'border:1px solid var(--p100);':''}"><div style="font-size:36px;font-weight:900;letter-spacing:-0.02em;${i%2!==0?'color:var(--p600);':''}">${ed('astat_'+i, s.num, 'span')}</div><div style="font-size:13px;${i%2===0?'opacity:0.8;':'color:#94a3b8;'}margin-top:4px;">${esc(s.label)}</div></div>`).join('')}
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
          ${img('team_img_'+i, m.img, 'width:100%;height:220px;')}
          <div style="padding:20px;">
            <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin-bottom:3px;">${ed('team_name_'+i, m.name, 'span')}</h3>
            <div style="font-size:13px;color:var(--p600);font-weight:600;margin-bottom:10px;">${ed('team_role_'+i, m.role, 'span')}</div>
            <p style="font-size:13px;color:#64748b;line-height:1.6;">${ed('team_bio_'+i, m.bio, 'span')}</p>
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
          <div style="color:#f59e0b;font-size:16px;margin-bottom:14px;">${stars('testi_rating_'+i, t.rating || 5)}</div>
          <p style="font-size:15px;color:#475569;line-height:1.7;font-style:italic;margin-bottom:20px;">"${ed('testi_quote_'+i, t.quote, 'span')}"</p>
          <div style="display:flex;align-items:center;gap:12px;padding-top:16px;border-top:1px solid #f1f5f9;">
            <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--p400),var(--p600));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0;">${esc((t.name||'?').charAt(0))}</div>
            <div><div style="font-size:14px;font-weight:700;color:#0f172a;">${ed('testi_name_'+i, t.name, 'span')}</div><div style="font-size:12px;color:#94a3b8;">${ed('testi_role_'+i, t.role, 'span')}</div></div>
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
    ${(c.items || []).map((s, i) => `<div data-reveal style="text-align:center;"><div style="font-size:clamp(36px,5vw,52px);font-weight:900;color:#fff;letter-spacing:-0.03em;">${ed('stat_'+i, s.num, 'span')}</div><div style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:4px;">${esc(s.label)}</div></div>`).join('')}
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
    <p data-reveal style="font-size:18px;color:rgba(255,255,255,0.8);margin-bottom:32px;">${ed('subtitle', c.subtitle, 'span')}</p>
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
      ${(c.images || [1,2,3,4,5,6]).map((im, i) => `<div data-reveal>${img('img_'+i, typeof im==='string'?im:'', 'border-radius:14px;width:100%;height:240px;')}</div>`).join('')}
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
        <summary style="padding:18px 0;cursor:pointer;font-weight:600;font-size:16px;color:#0f172a;list-style:none;display:flex;justify-content:space-between;align-items:center;">${ed('faq_q_'+i, f.q, 'span')}<span class="faq-ic" style="color:var(--p500);font-size:18px;">${'<i class="fa-solid fa-plus"></i>'}</span></summary>
        <p style="padding:0 0 18px;font-size:15px;color:#64748b;line-height:1.7;">${ed('faq_a_'+i, f.a, 'span')}</p>
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
      <p style="font-size:17px;color:#64748b;">${ed('subtitle', c.subtitle, 'span')}</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;" class="contact-grid">
      <form action="mail.php" method="POST" data-contact-form>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
          <div><label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:5px;">Name *</label><input type="text" name="name" required style="width:100%;border:1.5px solid #e2e8f0;border-radius:10px;padding:12px 14px;font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='var(--p500)'" onblur="this.style.borderColor='#e2e8f0'"></div>
          <div><label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:5px;">E-Mail *</label><input type="email" name="email" required style="width:100%;border:1.5px solid #e2e8f0;border-radius:10px;padding:12px 14px;font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='var(--p500)'" onblur="this.style.borderColor='#e2e8f0'"></div>
        </div>
        <div style="margin-bottom:12px;"><label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:5px;">Telefon</label><input type="tel" name="telefon" style="width:100%;border:1.5px solid #e2e8f0;border-radius:10px;padding:12px 14px;font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='var(--p500)'" onblur="this.style.borderColor='#e2e8f0'"></div>
        <div style="margin-bottom:16px;"><label style="font-size:12px;font-weight:600;color:#475569;display:block;margin-bottom:5px;">Nachricht *</label><textarea name="nachricht" rows="5" required style="width:100%;border:1.5px solid #e2e8f0;border-radius:10px;padding:12px 14px;font-size:14px;font-family:inherit;outline:none;resize:vertical;box-sizing:border-box;" onfocus="this.style.borderColor='var(--p500)'" onblur="this.style.borderColor='#e2e8f0'"></textarea></div>
        <button type="submit" style="width:100%;background:var(--p500);color:#fff;border:none;padding:14px;border-radius:10px;font-weight:700;font-size:15px;cursor:pointer;font-family:inherit;">Nachricht senden <i class="fa-solid fa-paper-plane" style="margin-left:6px;"></i></button>
      </form>
      <div style="display:flex;flex-direction:column;gap:14px;justify-content:center;">
        ${[['location-dot','Adresse','adresse'],['phone','Telefon','telefon'],['envelope','E-Mail','email'],['clock','Öffnungszeiten','oeffnung']].map(([ic,lb,k]) => `
          <div style="background:var(--p50);border:1px solid var(--p100);border-radius:12px;padding:18px;display:flex;align-items:center;gap:14px;">
            <div style="width:44px;height:44px;background:var(--p100);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--p600);flex-shrink:0;"><i class="fa-solid fa-${ic}"></i></div>
            <div><div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">${lb}</div><div style="font-size:14px;font-weight:600;color:#0f172a;">${ed(k, c[k], 'span')}</div></div>
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
        <p style="font-size:14px;line-height:1.7;max-width:260px;">${ed('footer_desc', c.footerDesc || c.beschreibung, 'span')}</p>
      </div>
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.3);margin-bottom:14px;">Navigation</div>
        ${(c.navLinks || []).map(l => `<a href="${l.href}" style="font-size:14px;color:rgba(255,255,255,0.5);text-decoration:none;display:block;margin-bottom:8px;transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.5)'">${esc(l.label)}</a>`).join('')}
      </div>
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.3);margin-bottom:14px;">Kontakt</div>
        <div style="display:flex;flex-direction:column;gap:8px;font-size:14px;">
          <span>${ed('telefon', c.telefon, 'span')}</span>
          <span>${ed('email', c.email, 'span')}</span>
        </div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.3);margin-bottom:14px;">Öffnungszeiten</div>
        <div style="font-size:14px;line-height:1.8;">${ed('oeffnung', c.oeffnung, 'span')}</div>
      </div>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.08);padding:20px 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
      <span style="font-size:13px;">© ${new Date().getFullYear()} ${ed('firmenname2', c.firmenname, 'span')}. Alle Rechte vorbehalten.</span>
      <div style="display:flex;gap:20px;">
        <a href="impressum.html" style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;">Impressum</a>
        <a href="datenschutz.html" style="font-size:13px;color:rgba(255,255,255,0.4);text-decoration:none;">Datenschutz</a>
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
        <h3 style="font-size:20px;font-weight:700;color:var(--p700);margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid var(--p200);">${ed('menu_kat_' + ki, kat.name, 'span')}</h3>
        <div style="display:grid;gap:14px;">
          ${(kat.items || []).map((it, ii) => `
            <div style="display:flex;justify-content:space-between;align-items:baseline;gap:16px;">
              <div style="flex:1;">
                <div style="font-size:16px;font-weight:600;color:#0f172a;">${ed('menu_name_' + ki + '_' + ii, it.name, 'span')}</div>
                <div style="font-size:13px;color:#64748b;margin-top:2px;">${ed('menu_desc_' + ki + '_' + ii, it.desc || '', 'span')}</div>
              </div>
              <div style="border-bottom:1px dotted #cbd5e1;flex:0 0 30px;align-self:flex-end;margin-bottom:6px;"></div>
              <div style="font-size:16px;font-weight:700;color:var(--p600);white-space:nowrap;">${ed('menu_preis_' + ki + '_' + ii, it.preis, 'span')}</div>
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
    ${c.html || '<div style="padding:60px;text-align:center;border:2px dashed #cbd5e1;border-radius:12px;color:#94a3b8;">Eigener Code-Block – im Editor bearbeiten</div>'}
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
      <p style="font-size:17px;color:#64748b;">${ed('subtitle', c.subtitle, 'span')}</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;align-items:stretch;">
      ${(c.plans || []).map((p, i) => `
        <div data-reveal style="background:${p.featured ? 'linear-gradient(160deg,var(--p700),var(--p900))' : '#fff'};color:${p.featured ? '#fff' : '#0f172a'};border:1px solid ${p.featured ? 'transparent' : '#e2e8f0'};border-radius:18px;padding:32px 28px;display:flex;flex-direction:column;position:relative;${p.featured ? 'box-shadow:0 20px 50px rgba(0,0,0,0.18);transform:translateY(-6px);' : ''}">
          ${p.featured ? `<div style="position:absolute;top:16px;right:16px;background:var(--accent);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;border-radius:99px;text-transform:uppercase;letter-spacing:0.05em;">${ed('plan_badge_'+i, p.badge || 'Beliebt', 'span')}</div>` : ''}
          <h3 style="font-size:19px;font-weight:800;margin-bottom:8px;">${ed('plan_name_'+i, p.name, 'span')}</h3>
          <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:18px;">
            <span style="font-size:42px;font-weight:900;letter-spacing:-0.03em;">${ed('plan_price_'+i, p.price, 'span')}</span>
            <span style="font-size:14px;opacity:0.7;">${ed('plan_period_'+i, p.period || '/ Monat', 'span')}</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:11px;margin-bottom:28px;flex:1;">
            ${(p.features || []).map((f, j) => `<div style="display:flex;align-items:flex-start;gap:10px;font-size:14px;line-height:1.5;"><i class="fa-solid fa-circle-check" style="color:${p.featured ? 'var(--accent)' : 'var(--p500)'};margin-top:3px;flex-shrink:0;"></i><span data-edit="plan_feat_${i}_${j}" style="outline:none;">${esc(f)}</span></div>`).join('')}
          </div>
          <a href="kontakt.html" style="background:${p.featured ? '#fff' : 'var(--p500)'};color:${p.featured ? 'var(--p800)' : '#fff'};text-decoration:none;padding:13px;border-radius:10px;font-weight:700;font-size:15px;text-align:center;">${ed('plan_cta_'+i, p.cta || 'Auswählen', 'span')}</a>
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
    <p data-reveal style="font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;margin-bottom:28px;">${ed('title', c.title, 'span')}</p>
    <div data-reveal style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:18px 40px;">
      ${(c.logos || []).map((l, i) => `<span data-edit="logo_${i}" style="font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#cbd5e1;outline:none;">${esc(l)}</span>`).join('')}
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
      <p style="font-size:17px;color:#64748b;">${ed('subtitle', c.subtitle, 'span')}</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:28px;">
      ${(c.steps || []).map((s, i) => `
        <div data-reveal style="text-align:center;position:relative;">
          <div style="width:72px;height:72px;background:linear-gradient(135deg,var(--p500),var(--p700));border-radius:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;position:relative;">
            ${icon('step_icon_'+i, s.icon, 28, '#fff')}
            <span style="position:absolute;top:-8px;right:-8px;width:26px;height:26px;background:var(--accent);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;border:2px solid #fff;">${i + 1}</span>
          </div>
          <h3 style="font-size:17px;font-weight:700;color:#0f172a;margin-bottom:8px;">${ed('step_title_'+i, s.title, 'span')}</h3>
          <p style="font-size:14px;color:#64748b;line-height:1.65;">${ed('step_text_'+i, s.text, 'span')}</p>
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
    ${c.caption ? `<p style="text-align:center;font-size:13px;color:#94a3b8;margin-top:12px;">${ed('caption', c.caption, 'span')}</p>` : ''}
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

// ─────────────────────────────────────────────────────────────
// REGISTRY
// ─────────────────────────────────────────────────────────────
export const BLOCK_REGISTRY = {
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
  custom: CUSTOM,
}

// Blöcke die der Nutzer im Editor hinzufügen kann
export const ADDABLE_BLOCKS = [
  { type: 'hero-full', label: 'Hero', emoji: '🦸', fa: 'rectangle-ad', cat: 'Kopf & Hero' },
  { type: 'header-slim', label: 'Seiten-Header', emoji: '📰', fa: 'window-minimize', cat: 'Kopf & Hero' },
  { type: 'services', label: 'Leistungen', emoji: '⚡', fa: 'bolt', cat: 'Inhalt' },
  { type: 'steps', label: 'Ablauf / Schritte', emoji: '🪜', fa: 'list-ol', cat: 'Inhalt' },
  { type: 'about', label: 'Über uns', emoji: '👤', fa: 'circle-info', cat: 'Inhalt' },
  { type: 'team', label: 'Team', emoji: '👥', fa: 'users', cat: 'Inhalt' },
  { type: 'image', label: 'Bild', emoji: '🖼️', fa: 'image', cat: 'Inhalt' },
  { type: 'gallery', label: 'Galerie', emoji: '🖼️', fa: 'images', cat: 'Inhalt' },
  { type: 'faq', label: 'FAQ', emoji: '❓', fa: 'circle-question', cat: 'Inhalt' },
  { type: 'testimonials', label: 'Kundenstimmen', emoji: '💬', fa: 'comment', cat: 'Vertrauen' },
  { type: 'stats', label: 'Zahlen', emoji: '📊', fa: 'chart-simple', cat: 'Vertrauen' },
  { type: 'logos', label: 'Partner-Logos', emoji: '🏷️', fa: 'handshake-angle', cat: 'Vertrauen' },
  { type: 'pricing', label: 'Preise / Pakete', emoji: '💶', fa: 'tags', cat: 'Konversion' },
  { type: 'cta', label: 'Call to Action', emoji: '🎯', fa: 'bullhorn', cat: 'Konversion' },
  { type: 'contact', label: 'Kontakt', emoji: '✉️', fa: 'envelope', cat: 'Konversion' },
  { type: 'menu', label: 'Speisekarte', emoji: '🍽️', fa: 'utensils', cat: 'Sonstiges', nurBranche: ['restaurant'] },
  { type: 'custom', label: 'Eigener Code', emoji: '💻', fa: 'code', cat: 'Sonstiges' },
]

// Kategorien-Reihenfolge für die Editor-Bibliothek
export const BLOCK_CATEGORIES = ['Kopf & Hero', 'Inhalt', 'Vertrauen', 'Konversion', 'Sonstiges']

// Hole alle Varianten eines Block-Typs (für Editor-Auswahl)
export function getVariants(type) {
  return BLOCK_REGISTRY[type]?.variants || []
}

// Rendere einen Block
export function renderBlock(type, variantId, content) {
  const block = BLOCK_REGISTRY[type]
  if (!block) return ''
  const variant = block.variants.find(v => v.id === variantId) || block.variants[0]
  return variant.render(content || {})
}
