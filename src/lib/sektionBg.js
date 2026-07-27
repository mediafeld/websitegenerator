// ───────────────────────────────────────────────────────────────────────────
// EIN Hintergrund-Helfer für ALLE Bausteine (Basis, Premium, Heros).
// Baut den kompletten Sektions-Hintergrund aus dem Inhalt – alle Ebenen
// unabhängig kombinierbar:
//   bgColor | bgGradient (CSS-Verlauf) | bgImg + bgOverlay (+ bgParallax)
//   bgPattern ('dots' | 'grid' | 'lines') als Ebene darüber
// Wichtig: kein 'use client' – wird von Browser UND Build benutzt.
// ───────────────────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? '')

function patternLayers(kind, col) {
  if (kind === 'dots') return [{ img: `radial-gradient(circle, ${col} 1.3px, transparent 1.3px)`, size: '18px 18px', repeat: 'repeat', pos: '0 0' }]
  if (kind === 'grid') return [
    { img: `linear-gradient(${col} 1px,transparent 1px)`, size: '100% 24px', repeat: 'repeat', pos: '0 0' },
    { img: `linear-gradient(90deg,${col} 1px,transparent 1px)`, size: '24px 100%', repeat: 'repeat', pos: '0 0' },
  ]
  if (kind === 'lines' || kind === 'diagonal') return [{ img: `repeating-linear-gradient(45deg,transparent,transparent 11px,${col} 11px,${col} 12px)`, size: 'auto', repeat: 'repeat', pos: '0 0' }]
  return []
}

export function sektionBg(c = {}, fallback = '') {
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
  // 2) Bild+Overlay ODER Verlauf ODER Farbe (sonst Standard aus fallback)
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
    const fb = (fallback || '').replace(/^background:\s*/, '').replace(/;\s*$/, '').trim()
    if (/gradient\(/i.test(fb)) { layers.push(fb); sizes.push('cover'); repeats.push('no-repeat'); positions.push('center') }
    else baseColor = fb || '#ffffff'
  }
  let css = ''
  if (layers.length) css += `background-image:${layers.join(',')};background-size:${sizes.join(',')};background-repeat:${repeats.join(',')};background-position:${positions.join(',')};`
  if (baseColor) css += `background-color:${baseColor};`
  return css
}
