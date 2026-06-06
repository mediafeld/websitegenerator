// Generiert eine komplette CI-Palette aus einer Hauptfarbe

function hexToHsl(hex) {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) { h = s = 0 }
  else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      default: h = (r - g) / d + 4
    }
    h /= 6
  }
  return [h * 360, s * 100, l * 100]
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0')
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

export function generateCIPalette(baseHex = '#1d4ed8') {
  const [h, s, l] = hexToHsl(baseHex)

  // Primary-Palette 50-900 (gleiche Hue, variierende Lightness)
  const lightnessMap = {
    50: 97, 100: 93, 200: 85, 300: 74, 400: 60,
    500: 50, 600: 42, 700: 35, 800: 28, 900: 20,
  }
  const primary = {}
  Object.entries(lightnessMap).forEach(([key, targetL]) => {
    // Sättigung bei sehr hellen/dunklen Tönen leicht reduzieren
    let sat = s
    if (targetL > 90) sat = Math.min(s, 60)
    if (targetL < 25) sat = Math.min(s * 1.1, 90)
    primary[key] = hslToHex(h, sat, targetL)
  })
  // Die 500er behält die Originalfarbe
  primary[500] = baseHex

  // Akzentfarbe (komplementär, +180° verschoben aber abgemildert)
  const accentHue = (h + 30) % 360
  const accent = {
    light: hslToHex(accentHue, Math.min(s, 70), 75),
    base: hslToHex(accentHue, Math.min(s, 75), 58),
    dark: hslToHex(accentHue, Math.min(s, 80), 42),
  }

  // Neutral-Palette (sehr leicht getönt)
  const neutral = {
    50: hslToHex(h, 8, 98), 100: hslToHex(h, 8, 96), 200: hslToHex(h, 6, 90),
    300: hslToHex(h, 5, 80), 400: hslToHex(h, 4, 64), 500: hslToHex(h, 4, 46),
    600: hslToHex(h, 5, 34), 700: hslToHex(h, 6, 25), 800: hslToHex(h, 7, 16), 900: hslToHex(h, 8, 10),
  }

  // CSS-Variablen-String
  const cssVars = Object.entries(primary).map(([k, v]) => `--p${k}:${v};`).join('') +
    `--accent:${accent.base};--accent-light:${accent.light};--accent-dark:${accent.dark};`

  return { primary, accent, neutral, cssVars, base: baseHex }
}
