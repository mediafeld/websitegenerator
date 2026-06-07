import { renderBlock } from './blocks'

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

// Rendere eine komplette Seite aus Block-Array
export function renderPage({ blocks, palette, font = 'Inter Tight', fontHeadline, title = '', forEditor = false }) {
  const fontParam = font.replace(/ /g, '+')
  const headlineParam = fontHeadline && fontHeadline !== font ? `&family=${fontHeadline.replace(/ /g, '+')}:wght@400;500;600;700;800;900` : ''
  const blocksHtml = (blocks || [])
    .map(b => applyParallaxAttr(renderBlock(b.type, b.variant, b.content), b.content))
    .join('\n')

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
  ${forEditor ? '[data-reveal]{opacity:1 !important;transform:none !important;}' : ''}
</style>
</head>
<body>
${blocksHtml}
${PARALLAX_JS}
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
