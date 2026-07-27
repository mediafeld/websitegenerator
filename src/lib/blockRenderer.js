import { renderBlock } from './blocks'
import { generatorDesignCSS, GENERATOR_REVEAL_JS, GENERATOR_EDITOR_CSS } from './generatorDesign'
import { FREITEXT_CSS } from './blocksPlus2'
import { BILDLEER_CSS } from './heroes'

// Animations-CDNs (für die fertige Seite)
const ANIM_CDN = `
<link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css">
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/countup.js/2.6.2/countUp.umd.js"></script>`

const ANIM_INIT = `
<script>
  // Scroll-Reveal
  if(window.AOS){
    document.querySelectorAll('[data-reveal]').forEach((el,i)=>{
      el.setAttribute('data-aos','fade-up');
      el.setAttribute('data-aos-delay',(i%4)*80);
    });
    AOS.init({duration:700,once:true,offset:50});
  }
  // CountUp für Zahlen
  document.querySelectorAll('[data-edit^="stat"]').forEach(el=>{
    var txt=el.textContent.trim();
    var num=parseFloat(txt.replace(/[^0-9.]/g,''));
    if(isNaN(num))return;
    var suffix=txt.replace(/[0-9.,]/g,'');
    if(window.countUp){
      var obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){try{new countUp.CountUp(el,num,{suffix:suffix,duration:2}).start();}catch(x){}obs.disconnect();}});},{threshold:0.5});
      obs.observe(el);
    }
  });
  // FAQ Toggle Icon
  document.querySelectorAll('details').forEach(d=>{
    d.addEventListener('toggle',()=>{var s=d.querySelector('.faq-ic i')||d.querySelector('summary span:last-child i');if(s)s.className=d.open?'fa-solid fa-minus':'fa-solid fa-plus';});
  });
  // Kontaktformular
  document.querySelectorAll('[data-contact-form]').forEach(f=>{
    f.addEventListener('submit',function(e){
      e.preventDefault();var btn=this.querySelector('button[type=submit]');var orig=btn.textContent;
      btn.textContent='Wird gesendet...';btn.disabled=true;
      fetch('mail.php',{method:'POST',body:new FormData(this)})
        .then(r=>r.json()).then(d=>{btn.textContent=(d.ok||d.success)?'✓ Gesendet!':'Fehler – bitte anrufen';if(d.ok||d.success)this.reset();})
        .catch(()=>{btn.textContent='Fehler – bitte anrufen';})
        .finally(()=>{setTimeout(()=>{btn.textContent=orig;btn.disabled=false;},3000);});
    });
  });
  // Mobile nav
  if(window.innerWidth<=768){
    document.querySelectorAll('.nav-desktop').forEach(n=>n.style.display='none');
    document.querySelectorAll('.nav-burger').forEach(b=>b.style.display='block');
    document.querySelectorAll('.hero-split-grid,.about-grid,.contact-grid,.footer-grid').forEach(g=>g.style.gridTemplateColumns='1fr');
  }
</script>`

// Baut CSS-Variablen aus Palette
function buildCSSVars(palette) {
  const p = palette?.primary || {}
  return `:root{
    --p50:${p[50]||'#eff6ff'};--p100:${p[100]||'#dbeafe'};--p200:${p[200]||'#bfdbfe'};
    --p300:${p[300]||'#93c5fd'};--p400:${p[400]||'#60a5fa'};--p500:${p[500]||'#3b82f6'};
    --p600:${p[600]||'#2563eb'};--p700:${p[700]||'#1d4ed8'};--p800:${p[800]||'#1e40af'};
    --p900:${p[900]||'#1e3a8a'};--accent:${palette?.accent?.base||p[400]||'#60a5fa'};
  }`
}

// JS-Parallax (für Editor-Vorschau UND fertige Seite) – Geschwindigkeit über data-parallax
const PARALLAX_JS = `<script>
(function(){
  function upd(){var els=document.querySelectorAll('[data-parallax]');var vh=window.innerHeight||800;for(var i=0;i<els.length;i++){var el=els[i];var sp=parseFloat(el.getAttribute('data-parallax'))||0;if(!sp){el.style.backgroundPositionY='';continue;}var r=el.getBoundingClientRect();var off=((r.top+r.height/2)-vh/2)*sp;var max=r.height*0.18;if(off>max)off=max;if(off<-max)off=-max;el.style.backgroundPositionY='calc(50% + '+off.toFixed(1)+'px)';}}
  window.wgRunParallax=upd;
  window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);
  document.addEventListener('DOMContentLoaded',upd);setTimeout(upd,120);upd();
})();
</script>`

// Fügt das data-parallax-Attribut an Sektionen mit aktiviertem Parallax
function applyParallaxAttr(html, c) {
  if (!c || !c.bgParallax || !c.bgImg) return html
  const sp = (typeof c.bgParallaxSpeed === 'number') ? c.bgParallaxSpeed : 0.3
  return html.replace(/(<section\b)/i, `$1 data-parallax="${sp}"`)
}

// ── Vom Nutzer eingegebenes HTML soll auch wie HTML AUSSEHEN ───────────────
// Wer im Panel <h1>, <ul> oder <blockquote> eintippt, bekommt sonst nur den
// vererbten Stil des umgebenden Textes. Diese Regeln geben Block-Tags in
// bearbeitbaren Feldern eine sichtbare Grundform – relativ (em), damit sie
// zur jeweiligen Textgröße passen. Eigene style=""-Angaben gewinnen immer.
const NUTZER_HTML_CSS = `
[data-edit] h1{font-size:2.4em;font-weight:800;line-height:1.15;margin:.25em 0;}
[data-edit] h2{font-size:1.9em;font-weight:800;line-height:1.2;margin:.25em 0;}
[data-edit] h3{font-size:1.5em;font-weight:700;line-height:1.25;margin:.25em 0;}
[data-edit] h4{font-size:1.2em;font-weight:700;margin:.25em 0;}
[data-edit] p{margin:.35em 0;line-height:1.65;}
[data-edit] ul,[data-edit] ol{margin:.4em 0;padding-left:1.3em;}
[data-edit] ul{list-style:disc;}
[data-edit] ol{list-style:decimal;}
[data-edit] li{margin:.15em 0;}
[data-edit] blockquote{border-left:3px solid var(--accent);padding:.2em 0 .2em .8em;margin:.4em 0;font-style:italic;}
[data-edit] pre{background:#0f172a;color:#e2e8f0;border-radius:8px;padding:12px 14px;overflow:auto;font-size:.85em;}
[data-edit] hr{border:none;border-top:1px solid rgba(15,23,42,.15);margin:.6em 0;}
[data-edit] table{border-collapse:collapse;width:100%;margin:.4em 0;}
[data-edit] td,[data-edit] th{border:1px solid rgba(15,23,42,.2);padding:6px 10px;text-align:left;}
`

// ── Layout-Overrides (Elementor-artig) ─────────────────────────────────────
// content._layout = { "<kindpfad>": { marginTop:'12px', paddingLeft:'8%', … } }
// Der Kindpfad ist die Element-Position innerhalb der Sektion ("" = Sektion
// selbst, "0.2" = 1. Kind → 3. Kind). Für die fertige Seite wird daraus pures
// CSS über nth-child – funktioniert also auch im Download ohne Editor.
// content._breite = { modus:'voll'|'boxed', wert:1160 } steuert die Innenbreite.
const LAYOUT_PROPS = new Set(['marginTop','marginRight','marginBottom','marginLeft','paddingTop','paddingRight','paddingBottom','paddingLeft','width','maxWidth','minWidth','minHeight','height','zIndex','gridTemplateColumns','flexBasis','textAlign','alignSelf','justifySelf','alignItems','justifyContent','gap','borderRadius','background','overflow'])
const cssName = (p) => p.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())

export function layoutRegeln(c, index) {
  const regeln = []
  const basis = `[data-bi="${index}"]`
  if (c && c._layout && typeof c._layout === 'object') {
    for (const [pfad, stile] of Object.entries(c._layout)) {
      if (!stile || typeof stile !== 'object') continue
      const sel = pfad === '' ? basis
        : basis + String(pfad).split('.').filter(s => s !== '').map(n => ` > :nth-child(${(parseInt(n, 10) || 0) + 1})`).join('')
      const dekl = Object.entries(stile)
        .filter(([p, v]) => LAYOUT_PROPS.has(p) && v !== '' && v !== null && v !== undefined)
        .map(([p, v]) => `${cssName(p)}:${v} !important;`)
        .join('')
      if (dekl) regeln.push(`${sel}{${dekl}}`)
    }
  }
  if (c && c._breite) {
    if (c._breite.modus === 'voll') regeln.push(`${basis} .wg-wrap{max-width:100% !important;}`)
    else if (c._breite.modus === 'boxed' && parseInt(c._breite.wert, 10)) regeln.push(`${basis} .wg-wrap{max-width:${parseInt(c._breite.wert, 10)}px !important;}`)
  }
  return regeln
}

// Kennzeichnet die Sektion (data-bi) und hängt CSS-ID/-Klassen des Nutzers an.
function mitIndexAttr(html, c, index) {
  return html.replace(/^(\s*<(?:section|nav|footer|div|header)\b[^>]*?)>/i, (m, tag) => {
    let t = `${tag} data-bi="${index}"`
    if (c && c._cssId && !/ id="/.test(t)) t += ` id="${String(c._cssId).replace(/[^\w-]/g, '')}"`
    if (c && c._cssKlassen) {
      const kl = String(c._cssKlassen).replace(/[^\w\s-]/g, '').trim()
      if (kl) {
        if (/class="/.test(t)) t = t.replace(/class="/, `class="${kl} `)
        else t += ` class="${kl}"`
      }
    }
    return t + '>'
  })
}

// ── Freie Bearbeitung für JEDEN Baustein ───────────────────────────────────
// Jeder Block kann zusätzlich mitbringen:
//   content.customHTML → ersetzt den Baustein komplett durch eigenen Code
//   content.customCSS  → eigenes CSS, automatisch NUR auf diesen Block begrenzt
//   content.customJS   → eigenes JavaScript für diesen Block
// Damit ist jeder Baustein frei änderbar – auch die alten.
function mitEigenemCode(html, c, index) {
  if (!c) return html
  // Hat der Nutzer eine eigene CSS-ID vergeben, nutzt auch das eigene CSS/JS
  // diese ID – so gibt es nur EINE Kennung am Element.
  const id = (c._cssId && String(c._cssId).replace(/[^\w-]/g, '')) || `wgb${index}`
  let out = html

  if (c.customHTML && String(c.customHTML).trim()) {
    out = `<section data-block="eigen" data-eigen="1">${c.customHTML}</section>`
  }

  const hatCSS = c.customCSS && String(c.customCSS).trim()
  const hatJS = c.customJS && String(c.customJS).trim()
  if (!hatCSS && !hatJS) return out

  // Kennung ans äußerste Element hängen, damit CSS/JS zielen können
  out = out.replace(/^(\s*<(?:section|nav|footer|div|header)\b)/i, `$1 id="${id}"`)

  let zusatz = ''
  if (hatCSS) {
    // "&" steht für den Baustein selbst. Ohne "&" wird jede Regel automatisch
    // auf diesen Baustein begrenzt, damit eigenes CSS nie die ganze Seite trifft.
    const css = String(c.customCSS)
    let begrenzt = css.includes('&')
      ? css.replace(/&/g, `#${id}`)
      : css.replace(/(^|\})\s*([^{}@]+)\s*\{/g, (m, vor, sel) => `${vor} #${id} ${sel.trim()} {`)
    // Nutzer-CSS gewinnt IMMER – auch gegen die eingebauten style=""-Angaben
    // der Bausteine. Deshalb bekommt jede Angabe automatisch !important.
    begrenzt = begrenzt.replace(/([a-zA-Z-]+)\s*:\s*([^;{}]+)(;|(?=\}))/g, (m, p, v, e) =>
      /!\s*important/i.test(v) ? m : `${p}:${v.trim()} !important${e === ';' ? ';' : ''}`)
    zusatz += `\n<style data-eigen-css="${id}">${begrenzt}</style>`
  }
  if (hatJS) {
    zusatz += `\n<script data-eigen-js="${id}">(function(){var block=document.getElementById('${id}');try{${c.customJS}}catch(e){console.warn('Eigener Code:',e)}})();</script>`
  }
  return out + zusatz
}

// Rendere eine komplette Seite aus Block-Array
export function renderPage({ blocks, palette, font = 'Inter Tight', fontHeadline, title = '', forEditor = false }) {
  const fontParam = font.replace(/ /g, '+')
  const headlineParam = fontHeadline && fontHeadline !== font ? `&family=${fontHeadline.replace(/ /g, '+')}:wght@200;300;400;500;600;700;800;900` : ''
  const blocksHtml = (blocks || [])
    .map((b, i) => mitIndexAttr(mitEigenemCode(applyParallaxAttr(renderBlock(b.type, b.variant, b.content), b.content), b.content, i), b.content, i))
    .join('\n')

  // Layout-Overrides (Abstände, Breiten, Z-Index) des Nutzers:
  //  - fertige Seite: als pures CSS gebacken (funktioniert ohne Editor/JS)
  //  - Editor-Vorschau: als Daten hinterlegt; das Editor-Skript wendet sie
  //    direkt am Element an, damit eigene Hilfs-Elemente die Zählung der
  //    nth-child-Selektoren nicht verschieben können.
  const alleLayoutRegeln = (blocks || []).flatMap((b, i) => layoutRegeln(b.content, i))
  const layoutCSS = !forEditor && alleLayoutRegeln.length ? `<style data-wg-layout>${alleLayoutRegeln.join('\n')}</style>` : ''
  const layoutDaten = forEditor
    ? `<script>window.__wgLayout=${JSON.stringify(Object.fromEntries((blocks || []).map((b, i) => [i, { layout: b.content?._layout || {}, breite: b.content?._breite || null, name: b.content?._name || '' }])))};</script>`
    : ''

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=${fontParam}:wght@300;400;500;600;700;800;900${headlineParam}&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
${forEditor ? '' : ANIM_CDN}
<style>
  *{font-family:'${font}',sans-serif;box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{color:#0f172a;overflow-x:hidden;}
  ${buildCSSVars(palette)}
  details summary::-webkit-details-marker{display:none;}
  a{transition:all 0.2s;}
  ${generatorDesignCSS({ fontHeadline })}
  ${FREITEXT_CSS}
  ${BILDLEER_CSS}
  ${NUTZER_HTML_CSS}
  ${forEditor ? '[data-reveal]{opacity:1 !important;transform:none !important;}' + GENERATOR_EDITOR_CSS : ''}
</style>
${layoutCSS}
${layoutDaten}
</head>
<body>
${blocksHtml}
${PARALLAX_JS}
${forEditor ? '' : GENERATOR_REVEAL_JS}
${forEditor ? '' : ANIM_INIT}
</body>
</html>`
}

// Block-Inhalte → flaches Objekt (für Editor data-edit Mapping)
export function flattenContent(blocks) {
  const map = {}
  blocks?.forEach((b, bi) => {
    Object.entries(b.content || {}).forEach(([k, v]) => {
      map[`${bi}:${k}`] = v
    })
  })
  return map
}
