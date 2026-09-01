import { renderBlock } from './blocks'
import { RECHTS_SEITEN } from './rechtsseiten'
import { generatorDesignCSS, GENERATOR_REVEAL_JS, GENERATOR_EDITOR_CSS } from './generatorDesign'
import { FREITEXT_CSS } from './blocksPlus2'
import { BILDLEER_CSS } from './heroes'

// Animations-CDNs (für die fertige Seite)
const ANIM_CDN = `
<link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css">
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/countup.js/2.6.2/countUp.umd.js"></script>`

// Gleiche Bibliotheken als lokale Dateien (Kauf-ZIP legt sie in assets/ ab)
const ANIM_LOKAL = `
<link rel="stylesheet" href="assets/aos.css">
<script src="assets/aos.js"></script>
<script src="assets/countup.js"></script>`

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
  // Kontaktformular – Ziel je nach Paket:
  //   Kauf-ZIP: mail.php auf dem eigenen Hosting (window.__wgFormular fehlt oder art:'php')
  //   Miete:    unser Server (art:'server' mit projekt+basis) – Kunde muss nichts einrichten
  document.querySelectorAll('[data-contact-form]').forEach(function(f){
    // Unsichtbares Honigtopf-Feld gegen Spam-Bots
    if(!f.querySelector('[name=firma_hp]')){var hp=document.createElement('input');hp.type='text';hp.name='firma_hp';hp.tabIndex=-1;hp.autocomplete='off';hp.setAttribute('aria-hidden','true');hp.style.cssText='position:absolute;left:-9999px;height:0;width:0;opacity:0;';f.appendChild(hp);}
    // Eigene Prüfung statt der Browser-Sprechblasen: die sehen in jedem
    // Browser anders aus und verschwinden sofort wieder.
    f.setAttribute('novalidate','novalidate');
    // Statuszeile unter dem Formular – dort steht IMMER, was passiert ist
    var box=f.querySelector('[data-form-status]');
    if(!box){box=document.createElement('div');box.setAttribute('data-form-status','');box.setAttribute('role','status');box.style.cssText='display:none;margin-top:14px;padding:12px 15px;border-radius:10px;font-size:14.5px;line-height:1.6;';f.appendChild(box);}
    function melde(art,html){
      var farben={ok:['#EAF6EF','#1F9D55','#14532d'],warn:['#FFFBEB','#F59E0B','#92400E'],fehler:['#FEF2F2','#DC2626','#991B1B']}[art]||['#F1F4F6','#94A3B8','#334155'];
      box.style.display='block';box.style.background=farben[0];box.style.border='1px solid '+farben[1];box.style.color=farben[2];box.innerHTML=html;
    }
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var form=this;var btn=form.querySelector('button[type=submit]');var orig=btn?btn.textContent:'';
      var cfg=window.__wgFormular||{};var fd=new FormData(form);
      var wert=function(n){var v=fd.get(n);return v?String(v).trim():'';};
      var name=wert('name'),mail=wert('email'),tel=wert('telefon'),nachricht=wert('nachricht');

      // 1) Prüfen, BEVOR irgendetwas verschickt wird
      if(!mail||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(mail)){melde('warn','Bitte eine gültige E-Mail-Adresse angeben, damit wir antworten können.');return;}
      if(!nachricht&&!name){melde('warn','Bitte schreiben Sie kurz, worum es geht.');return;}

      // 2) Vorschau im Kundenkonto: nichts verschicken, nur zeigen
      if(cfg.art==='demo'){melde('ok','<b>Vorschau:</b> Auf der fertigen Website wird die Nachricht jetzt an ' + (cfg.email||'Ihre E-Mail-Adresse') + ' zugestellt.');return;}

      // 3) Notfall: Nachricht geht NIE verloren – E-Mail-Programm bzw. Telefon
      function notfall(grund){
        var an=cfg.email||'';
        var betreff='Anfrage über die Website'+(name?' von '+name:'');
        var text='Name: '+name+String.fromCharCode(10)+'E-Mail: '+mail+String.fromCharCode(10)+'Telefon: '+tel+String.fromCharCode(10)+String.fromCharCode(10)+nachricht;
        var teile=[];
        if(an)teile.push('<a href="mailto:'+an+'?subject='+encodeURIComponent(betreff)+'&body='+encodeURIComponent(text)+'" style="font-weight:700;text-decoration:underline;color:inherit;">Nachricht jetzt per E-Mail-Programm senden</a>');
        if(cfg.telefon)teile.push('oder anrufen: <a href="tel:'+String(cfg.telefon).replace(/[^+0-9]/g,'')+'" style="font-weight:700;text-decoration:underline;color:inherit;">'+cfg.telefon+'</a>');
        melde('fehler','Der automatische Versand hat gerade nicht geklappt.'+(teile.length?' '+teile.join(' — '):' Bitte versuchen Sie es später noch einmal.'));
      }

      // 4) Senden – bei Miete über unseren Server, beim Kauf über mail.php.
      //    Klappt das eine nicht, wird automatisch das andere versucht.
      var ziele=[];
      if(cfg.art==='server'&&cfg.basis){fd.append('projekt',cfg.projekt||'');ziele.push(cfg.basis.replace(/\\/+$/,'')+'/api/formular');}
      ziele.push('mail.php');
      if(btn){btn.textContent='Wird gesendet …';btn.disabled=true;}

      function versuch(i){
        if(i>=ziele.length){if(btn){btn.textContent=orig;btn.disabled=false;}notfall();return;}
        fetch(ziele[i],{method:'POST',body:fd})
          .then(function(r){return r.text();})
          .then(function(t){
            var d=null;try{d=JSON.parse(t);}catch(x){}
            if(d&&(d.ok||d.success)){
              if(btn){btn.textContent='✓ Gesendet';}
              melde('ok','<b>Vielen Dank!</b> Ihre Nachricht ist angekommen – wir melden uns zeitnah zurück.');
              form.reset();
              setTimeout(function(){if(btn){btn.textContent=orig;btn.disabled=false;}},4000);
            } else { versuch(i+1); }
          })
          .catch(function(){versuch(i+1);});
      }
      versuch(0);
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
  function upd(){var els=document.querySelectorAll('[data-parallax]');var vh=window.innerHeight||800;for(var i=0;i<els.length;i++){var el=els[i];var sp=parseFloat(el.getAttribute('data-parallax'))||0;var ebene=el.querySelector('[data-parallax-ebene]');if(!sp){if(ebene)ebene.style.transform='';else el.style.backgroundPositionY='';continue;}var r=el.getBoundingClientRect();var off=((r.top+r.height/2)-vh/2)*sp;var max=r.height*0.16;if(off>max)off=max;if(off<-max)off=-max;if(ebene){ebene.style.transform='translate3d(0,'+off.toFixed(1)+'px,0)';}else{el.style.backgroundPositionY='calc(50% + '+off.toFixed(1)+'px)';}}}
  window.wgRunParallax=upd;
  window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);
  document.addEventListener('DOMContentLoaded',upd);setTimeout(upd,120);upd();
})();
</script>`

// Parallax: eigene, überdimensionierte Bild-Ebene HINTER dem Inhalt.
// Die Ebene wird ans ENDE der Sektion gehängt (Kindpfade davor bleiben
// stabil) und liegt dank z-index:-1 + isolation:isolate hinter allem –
// nachfolgende Elemente decken sie beim Scrollen sauber ab.
function applyParallaxAttr(html, c) {
  if (!c || !c.bgParallax || !c.bgImg) return html
  const sp = (typeof c.bgParallaxSpeed === 'number') ? c.bgParallaxSpeed : 0.3
  const m = html.match(/<(section|footer|nav|header|div)\b/i)
  if (!m) return html
  const tag = m[1].toLowerCase()
  let out = html.replace(new RegExp('(<' + tag + '\\b)', 'i'), `$1 data-parallax="${sp}"`)
  const schliesst = out.lastIndexOf('</' + tag + '>')
  if (schliesst < 0) return out
  const ov = c.bgOverlay || 'rgba(15,23,42,0.55)'
  const bild = String(c.bgImg).replace(/'/g, '%27')
  const ebenen = `<div data-parallax-ebene aria-hidden="true" style="position:absolute;left:0;right:0;top:-18%;bottom:-18%;z-index:-1;background-image:url('${bild}');background-size:cover;background-position:center;will-change:transform;pointer-events:none;"></div>` +
    `<div data-parallax-overlay aria-hidden="true" style="position:absolute;inset:0;z-index:-1;background:linear-gradient(${ov},${ov});pointer-events:none;"></div>`
  return out.slice(0, schliesst) + ebenen + out.slice(schliesst)
}

// ── Vom Nutzer eingegebenes HTML soll auch wie HTML AUSSEHEN ───────────────
// Wer im Panel <h1>, <ul> oder <blockquote> eintippt, bekommt sonst nur den
// vererbten Stil des umgebenden Textes. Diese Regeln geben Block-Tags in
// bearbeitbaren Feldern eine sichtbare Grundform – relativ (em), damit sie
// zur jeweiligen Textgröße passen. Eigene style=""-Angaben gewinnen immer.
// Zwei-Klick-Karte: veröffentlicht lädt OpenStreetMap erst nach Einwilligung,
// im Editor sofort (dort arbeitet nur der Websitebesitzer selbst).
const KARTE_JS = `<script>
(function(){
  function lade(w){
    var f=w.querySelector('[data-karte-src]');
    if(f&&!f.src)f.src=f.getAttribute('data-karte-src');
    var c=w.querySelector('[data-karte-consent]');
    if(c)c.style.display='none';
  }
  document.querySelectorAll('[data-karte-wrap]').forEach(function(w){
    if(window.__wgEditor){lade(w);return;}
    var c=w.querySelector('[data-karte-consent]');
    if(c)c.addEventListener('click',function(){lade(w);});
  });
})();
</script>`

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
const LAYOUT_PROPS = new Set(['marginTop','marginRight','marginBottom','marginLeft','paddingTop','paddingRight','paddingBottom','paddingLeft','width','maxWidth','minWidth','minHeight','height','zIndex','gridTemplateColumns','flexBasis','textAlign','alignSelf','justifySelf','alignItems','justifyContent','gap','borderRadius','background','overflow','display','objectFit','objectPosition','backgroundSize','backgroundPosition','backgroundRepeat','opacity'])
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

// ── Sprungmarken & interne Links ───────────────────────────────────────────
// Beim Onepager liegt alles auf EINER Seite — „Kontakt", „Leistungen" usw.
// müssen dort Sprungmarken sein statt Verweise auf Dateien, die es nicht gibt.
// Viele Bausteine verlinken intern fest auf kontakt.html; deshalb wird beim
// Rendern repariert: Zielseite vorhanden → Link bleibt, sonst wird daraus ein
// Sprung zum passenden Abschnitt derselben Seite.
const BLOCK_ANKER = {
  services: 'leistungen', leistungen: 'leistungen',
  about: 'about', team: 'team',
  gallery: 'galerie', galerie: 'galerie',
  pricing: 'preise', preise: 'preise',
  menu: 'speisekarte', contact: 'kontakt', kontakt: 'kontakt',
  faq: 'faq', fragen: 'faq',
}
const DATEI_ANKER = {
  kontakt: 'kontakt', leistungen: 'leistungen', 'ueber-uns': 'about', ueber: 'about',
  about: 'about', team: 'team', galerie: 'galerie', portfolio: 'galerie',
  preise: 'preise', speisekarte: 'speisekarte', faq: 'faq',
}

// Seitenname → Dateiname (gleiche Regel wie ZIP-Export und Generierung)
export function seitenDatei(s) {
  if (s === 'Startseite' || s === 'Start' || s === 'index') return 'index.html'
  return String(s).toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '.html'
}

// Fehlt dem Abschnitt eine id, bekommt er die zum Block-Typ passende —
// erst dadurch funktionieren Sprungmarken zuverlässig.
function mitAnker(html, typ) {
  const id = BLOCK_ANKER[typ]
  if (!id || / id="/i.test(html.slice(0, 400))) return html
  return html.replace(/^(\s*<(?:section|div|header|nav|footer)\b)/i, `$1 id="${id}"`)
}

// Verweise auf Seiten, die es in diesem Entwurf nicht gibt, werden zu
// Sprungmarken — gibt es auch den Abschnitt nicht, zum Seitenanfang.
// Auf UNTERSEITEN (Impressum, Datenschutz …) gibt es die Abschnitte der
// Startseite nicht: Sprungmarken müssen dort zur Startseite führen, sonst
// bleibt der Besucher beim Klick auf „Start" einfach stehen.
function interneLinksReparieren(html, seiten, aktuelleSeite) {
  if (!Array.isArray(seiten) || !seiten.length) return html
  const dateien = new Set(seiten.map(seitenDatei))
  const anker = new Set(
    Array.from(html.matchAll(/\sid="([a-z0-9_-]+)"/gi)).map(m => m[1].toLowerCase())
  )
  let out = html.replace(/href="([a-z0-9][a-z0-9-]*\.html)(#[^"]*)?"/gi, (voll, datei) => {
    const d = datei.toLowerCase()
    if (dateien.has(d)) return voll
    const basis = d.replace(/\.html$/, '')
    if (basis === 'index') return 'href="#"'
    const ziel = DATEI_ANKER[basis] || basis
    return anker.has(ziel) ? `href="#${ziel}"` : 'href="#"'
  })

  const istStartseite = !aktuelleSeite || seitenDatei(aktuelleSeite) === 'index.html'
  if (!istStartseite) {
    out = out.replace(/href="#([a-z0-9_-]*)"/gi, (voll, id) => {
      if (!id) return 'href="index.html"'
      return anker.has(id.toLowerCase()) ? voll : `href="index.html#${id}"`
    })
  }
  return out
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

// ── Eingebaute Elemente (frei in Container gezogen) ────────────────────────
// content._einbau = [ { ziel:'0.2.1', art:'bild'|'ueberschrift'|'text'|'button'|'abstand'|'html', … } ]
// ziel ist der Kindpfad INNERHALB der Sektion. Ein kleines Skript hängt die
// Elemente dort an – im Editor UND auf der fertigen Seite identisch, deshalb
// verschieben sie keine nth-child-Zählungen (immer ans Ende des Containers).
const eEsc = (s) => String(s ?? '')
const eBlock = /<\s*(h[1-6]|p|div|ul|ol|li|table|blockquote|section|figure|pre|hr)\b/i
const eEd = (pfad, wert, tag) => {
  const s = eEsc(wert)
  const t = eBlock.test(s) ? 'div' : (tag || 'span')
  return `<${t} data-edit="${pfad}" style="outline:none;${t === 'div' ? 'display:block;' : ''}">${s}</${t}>`
}

export function einbauWidgetHtml(w, wi) {
  const art = w?.art || 'text'
  const wrap = (innen, extra = '') => `<div class="wg-einbau" data-einbau="${wi}" data-einbau-art="${art}" style="margin:10px 0;${extra}">${innen}</div>`
  if (art === 'bild') {
    if (w.bild) return wrap(`<img data-img="_einbau.${wi}.bild" src="${eEsc(w.bild)}" alt="" style="width:100%;border-radius:12px;display:block;cursor:pointer;">`)
    return wrap(`<div data-img="_einbau.${wi}.bild" style="width:100%;min-height:130px;border:2px dashed rgba(15,23,42,.25);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#94a3b8;cursor:pointer;padding:18px;"><i class="fa-solid fa-image" style="font-size:22px;"></i><span style="font-size:13px;font-weight:600;">Bild einfügen</span></div>`)
  }
  if (art === 'ueberschrift') return wrap(`<h3 style="font-size:clamp(19px,2.4vw,26px);font-weight:800;letter-spacing:-.02em;color:inherit;">${eEd(`_einbau.${wi}.text`, w.text || 'Neue Überschrift')}</h3>`)
  if (art === 'button') return wrap(`<a href="${eEsc(w.href || '#')}" class="wg-btn" onclick="return false;">${eEd(`_einbau.${wi}.text`, w.text || 'Mehr erfahren')}</a>`)
  if (art === 'abstand') return wrap('', `height:${parseInt(w.hoehe, 10) || 32}px;margin:0;`)
  if (art === 'baustein') {
    // Ganzer Baustein im Container: mit EIGENEM Inhalt (w.inhalt) gerendert.
    // Alle Bearbeitungs-Anker werden in den Widget-Namensraum umgeschrieben –
    // dadurch ist JEDER Text und JEDES Bild darin ganz normal bearbeitbar,
    // ohne in den Inhalt des Gast-Bausteins zu schreiben.
    let h = ''
    try { h = renderBlock(w.typ, w.variante, w.inhalt || {}) } catch { h = '' }
    h = h.replace(/\sdata-(block|variant|bi)="[^"]*"/g, '')
    h = h.replace(/data-(edit|img|icon|stars|kopie)="([^"]*)"/g, (m, a, k) => `data-${a}="_einbau.${wi}.inhalt.${k}"`)
    return wrap(h)
  }
  if (art === 'html') return wrap(w.html || '<div style="padding:16px;border:2px dashed rgba(15,23,42,.2);border-radius:10px;color:#94a3b8;font-size:13px;">Eigener Code – über das Panel bearbeiten</div>')
  return wrap(`<div style="font-size:15px;line-height:1.65;">${eEd(`_einbau.${wi}.text`, w.text || 'Neuer Text. Anklicken und schreiben.')}</div>`)
}

const EINBAU_JS = `<script>
(function(){
  function kind(el,pfad){ if(pfad===''||pfad==null)return el; var n=el,t=String(pfad).split('.'); for(var i=0;i<t.length&&n;i++){ n=n.children[parseInt(t[i],10)]; } return n||null; }
  document.querySelectorAll('script[type="application/json"][data-einbau-json]').forEach(function(sc){
    var sec=document.querySelector('[data-bi="'+sc.getAttribute('data-einbau-json')+'"]'); if(!sec)return;
    var list=[]; try{ list=JSON.parse(sc.textContent) }catch(e){}
    list.forEach(function(w){ var z=kind(sec,w.ziel); if(z)z.insertAdjacentHTML('beforeend',w.html); });
  });
})();
</script>`

function einbauDaten(blocks) {
  const teile = []
  ;(blocks || []).forEach((b, i) => {
    const liste = Array.isArray(b.content?._einbau) ? b.content._einbau : []
    if (!liste.length) return
    const eintraege = liste.map((w, wi) => ({ ziel: String(w.ziel ?? ''), html: einbauWidgetHtml(w, wi) }))
    teile.push(`<script type="application/json" data-einbau-json="${i}">${JSON.stringify(eintraege).replace(/<\/script/gi, '<\\/script')}</script>`)
  })
  if (!teile.length) return ''
  return teile.join('\n') + '\n' + EINBAU_JS
}

// ── Motion Effects (Elementor-artig) ───────────────────────────────────────
// content._fx = { "<kindpfad>": { y, x, rot, skal, fade, blur, fix, hover } }
// y/x/rot/skal/fade/blur: Stärke (−10…10 bzw. 0…10), fix: sticky,
// hover: 'zoom' | 'anheben' | 'leuchten' | 'neigen'.
// Ein Läufer-Skript rechnet die Scroll-Position in Transformationen um –
// im Editor UND auf der fertigen Seite identisch.
const FX_CSS = `
.wg-fxh-zoom{transition:transform .35s ease;}
.wg-fxh-zoom:hover{transform:scale(1.045) !important;}
.wg-fxh-anheben{transition:transform .3s ease, box-shadow .3s ease;}
.wg-fxh-anheben:hover{transform:translateY(-8px) !important;box-shadow:0 18px 42px rgba(0,0,0,.2) !important;}
.wg-fxh-leuchten{transition:box-shadow .3s ease, filter .3s ease;}
.wg-fxh-leuchten:hover{filter:brightness(1.07);box-shadow:0 0 0 3px var(--accent), 0 12px 36px rgba(0,0,0,.22) !important;}
.wg-fxh-neigen{transition:transform .35s ease;}
.wg-fxh-neigen:hover{transform:perspective(700px) rotateX(4deg) rotateY(-4deg) !important;}
`

const FX_JS = `<script>
(function(){
  if(window.__wgFxLive)return;
  function kind(el,p){ if(p===''||p==null)return el; var n=el,t=String(p).split('.'); for(var i=0;i<t.length&&n;i++){ n=n.children[parseInt(t[i],10)]; } return n||null; }
  var eintraege=[];
  function registriere(el,cfg){
    if(!el.hasAttribute('data-fx-basis'))el.setAttribute('data-fx-basis',el.style.transform||'');
    if(cfg.hover&&cfg.hover!=='kein')el.classList.add('wg-fxh-'+cfg.hover);
    if(cfg.fix){el.style.position='sticky';el.style.top='18px';if(!el.style.zIndex)el.style.zIndex='5';}
    eintraege.push({el:el,cfg:cfg});
  }
  document.querySelectorAll('script[type="application/json"][data-fx-json]').forEach(function(sc){
    var sec=document.querySelector('[data-bi="'+sc.getAttribute('data-fx-json')+'"]'); if(!sec)return;
    var m={}; try{ m=JSON.parse(sc.textContent) }catch(e){}
    Object.keys(m).forEach(function(p){ var el=kind(sec,p); if(el)registriere(el,m[p]); });
  });
  var geplant=false,mx=0,my=0,hatMaus=false;
  function tick(){
    geplant=false;
    if(document.body.classList.contains('wg-stopp'))return;
    var vh=window.innerHeight||800;
    for(var i=0;i<eintraege.length;i++){
      var e=eintraege[i],cfg=e.cfg,el=e.el;
      var r=el.getBoundingClientRect();
      var t=((r.top+r.height/2)-vh/2)/vh; if(t>1)t=1; if(t<-1)t=-1;
      var tr=el.getAttribute('data-fx-basis')||'';
      if(cfg.y)tr+=' translateY('+(-t*cfg.y*40).toFixed(1)+'px)';
      if(cfg.x)tr+=' translateX('+(-t*cfg.x*40).toFixed(1)+'px)';
      if(cfg.rot)tr+=' rotate('+(t*cfg.rot*4).toFixed(2)+'deg)';
      if(cfg.skal)tr+=' scale('+(1-Math.abs(t)*cfg.skal*0.04).toFixed(3)+')';
      if(cfg.maus)tr+=' translate('+(-mx*cfg.maus*4).toFixed(1)+'px,'+(-my*cfg.maus*4).toFixed(1)+'px)';
      if(cfg.y||cfg.x||cfg.rot||cfg.skal||cfg.maus)el.style.transform=tr.trim();
      if(cfg.fade)el.style.opacity=String(Math.max(0,1-Math.abs(t)*cfg.fade*0.12).toFixed(3));
      if(cfg.blur)el.style.filter='blur('+(Math.abs(t)*cfg.blur*0.7).toFixed(2)+'px)';
    }
  }
  function plane(){ if(geplant)return; geplant=true; requestAnimationFrame(tick); }
  function mausAn(){
    if(hatMaus)return; hatMaus=true;
    // Maus-Parallax: Cursorabstand zur Bildschirmmitte (-1…1) bewegt das Element sanft mit.
    window.addEventListener('mousemove',function(ev){
      var vw=window.innerWidth||1200,vh2=window.innerHeight||800;
      mx=(ev.clientX-vw/2)/(vw/2); my=(ev.clientY-vh2/2)/(vh2/2);
      plane();
    },{passive:true});
  }
  for(var mi=0;mi<eintraege.length;mi++){ if(eintraege[mi].cfg.maus){ mausAn(); break; } }
  window.addEventListener('scroll',plane,{passive:true});
  window.addEventListener('resize',plane);
  setInterval(plane,400);
  plane();
  // Editor: Effekte live ändern
  window.__wgFxLive=function(bi,pfad,cfg){
    var sec=document.querySelector('[data-bi="'+bi+'"]'); if(!sec)return;
    var el=kind(sec,pfad); if(!el)return;
    for(var i=0;i<eintraege.length;i++){ if(eintraege[i].el===el){ eintraege.splice(i,1); break; } }
    el.className=String(el.className).replace(/\\bwg-fxh-[a-z]+\\b/g,'').trim();
    el.style.opacity='';el.style.filter='';
    el.style.transform=el.getAttribute('data-fx-basis')||'';
    if(el.style.position==='sticky'){el.style.position='';el.style.top='';}
    if(cfg&&(cfg.y||cfg.x||cfg.rot||cfg.skal||cfg.fade||cfg.blur||cfg.fix||cfg.maus||(cfg.hover&&cfg.hover!=='kein')))registriere(el,cfg);
    if(cfg&&cfg.maus)mausAn();
    plane();
  };
})();
</script>`

function fxDaten(blocks, forEditor) {
  const teile = []
  ;(blocks || []).forEach((b, i) => {
    const fx = b.content?._fx
    if (!fx || typeof fx !== 'object' || !Object.keys(fx).length) return
    teile.push(`<script type="application/json" data-fx-json="${i}">${JSON.stringify(fx).replace(/<\/script/gi, '<\\/script')}</script>`)
  })
  // Im Editor läuft der Läufer immer (für Live-Änderungen), veröffentlicht
  // nur, wenn es tatsächlich Effekte gibt.
  if (!teile.length && !forEditor) return ''
  return teile.join('\n') + '\n' + FX_JS
}

// ── Link-Overrides ─────────────────────────────────────────────────────────
// content._links = { "<kindpfad-des-a>": "https://…" }
// Der Nutzer setzt Button-/Link-Ziele im Panel; auf der fertigen Seite
// schreibt ein kleiner Läufer die href-Werte an die richtigen <a>-Elemente.
function linkDaten(blocks) {
  const teile = []
  ;(blocks || []).forEach((b, i) => {
    const links = b.content?._links
    if (!links || typeof links !== 'object' || !Object.keys(links).length) return
    teile.push(`<script type="application/json" data-links-json="${i}">${JSON.stringify(links).replace(/<\/script/gi, '<\\/script')}</script>`)
  })
  if (!teile.length) return ''
  return teile.join('\n') + `\n<script>
(function(){
  function kind(el,p){ if(p===''||p==null)return el; var n=el,t=String(p).split('.'); for(var i=0;i<t.length&&n;i++){ n=n.children[parseInt(t[i],10)]; } return n||null; }
  document.querySelectorAll('script[type="application/json"][data-links-json]').forEach(function(sc){
    var sec=document.querySelector('[data-bi="'+sc.getAttribute('data-links-json')+'"]'); if(!sec)return;
    var m={}; try{ m=JSON.parse(sc.textContent) }catch(e){}
    Object.keys(m).forEach(function(p){ var el=kind(sec,p); if(el&&el.tagName==='A')el.setAttribute('href',m[p]); });
  });
})();
</script>`
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
// assetsLokal: Schriften/Icons/Skripte liegen als Dateien neben der Seite
//   (Kauf-ZIP – keine Google-/CDN-Aufrufe, wichtig für den Datenschutz).
// seo: { titel, beschreibung, ogBild, favicon, url } für Meta-Angaben.
// formular: { art:'php'|'server', projekt, basis, email } steuert das Kontaktformular-Ziel.
// seiten: Namen ALLER Seiten dieser Website. Damit weiß die Ausgabe, welche
// internen Links es wirklich gibt — fehlende werden zu Sprungmarken, und der
// Fußbereich verlinkt Impressum/Datenschutz nur, wenn es sie gibt.
export function renderPage({ blocks, palette, font = 'Inter Tight', fontHeadline, title = '', forEditor = false, assetsLokal = false, seo = null, formular = null, seiten = null, seite = null }) {
  const fontParam = font.replace(/ /g, '+')
  const headlineParam = fontHeadline && fontHeadline !== font ? `&family=${fontHeadline.replace(/ /g, '+')}:wght@200;300;400;500;600;700;800;900` : ''
  const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
  const seoTitel = seo?.titel || title
  const kopfAssets = assetsLokal
    ? `<link rel="stylesheet" href="assets/fonts.css">
<link rel="stylesheet" href="assets/fontawesome.css">`
    : `<link href="https://fonts.googleapis.com/css2?family=${fontParam}:wght@300;400;500;600;700;800;900${headlineParam}&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">`
  const animKopf = forEditor ? '' : (assetsLokal ? ANIM_LOKAL : ANIM_CDN)
  const seoMeta = [
    seo?.beschreibung ? `<meta name="description" content="${esc(seo.beschreibung)}">` : '',
    seoTitel ? `<meta property="og:title" content="${esc(seoTitel)}">` : '',
    seo?.beschreibung ? `<meta property="og:description" content="${esc(seo.beschreibung)}">` : '',
    seo?.ogBild ? `<meta property="og:image" content="${esc(seo.ogBild)}">` : '',
    seo?.url ? `<link rel="canonical" href="${esc(seo.url)}">` : '',
    seo?.favicon ? `<link rel="icon" href="${esc(seo.favicon)}">` : '',
  ].filter(Boolean).join('\n')
  // Fußbereich: Impressum/Datenschutz nur verlinken, wenn es die Seiten gibt.
  const bloeckeGeprueft = Array.isArray(seiten) && seiten.length
    ? (blocks || []).map(b => b?.type === 'footer'
      ? { ...b, content: { ...(b.content || {}), rechtsLinks: RECHTS_SEITEN.filter(d => seiten.includes(d.seite)).map(d => ({ label: d.linkLabel, href: d.datei })) } }
      : b)
    : (blocks || [])

  const blocksHtml = interneLinksReparieren(
    bloeckeGeprueft
      .map((b, i) => mitIndexAttr(mitEigenemCode(applyParallaxAttr(mitAnker(renderBlock(b.type, b.variant, b.content), b.type), b.content), b.content, i), b.content, i))
      .join('\n'),
    seiten,
    seite || title,
  )

  // Layout-Overrides (Abstände, Breiten, Z-Index) des Nutzers:
  //  - fertige Seite: als pures CSS gebacken (funktioniert ohne Editor/JS)
  //  - Editor-Vorschau: als Daten hinterlegt; das Editor-Skript wendet sie
  //    direkt am Element an, damit eigene Hilfs-Elemente die Zählung der
  //    nth-child-Selektoren nicht verschieben können.
  const alleLayoutRegeln = (blocks || []).flatMap((b, i) => layoutRegeln(b.content, i))
  const layoutCSS = !forEditor && alleLayoutRegeln.length ? `<style data-wg-layout>${alleLayoutRegeln.join('\n')}</style>` : ''
  const layoutDaten = forEditor
    ? `<script>window.__wgLayout=${JSON.stringify(Object.fromEntries((blocks || []).map((b, i) => [i, { layout: b.content?._layout || {}, breite: b.content?._breite || null, name: b.content?._name || '', links: b.content?._links || {} }])))};</script>`
    : ''

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${seoTitel}</title>
${seoMeta}
${kopfAssets}
${animKopf}
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
  ${FX_CSS}
  [data-parallax]{position:relative;overflow:hidden;isolation:isolate;}
  ${forEditor ? '[data-reveal]{opacity:1 !important;transform:none !important;}' + GENERATOR_EDITOR_CSS : ''}
</style>
${layoutCSS}
${layoutDaten}
</head>
<body>
${blocksHtml}
${einbauDaten(blocks)}
${linkDaten(blocks)}
${fxDaten(blocks, forEditor)}
${PARALLAX_JS}
${KARTE_JS}
${!forEditor && formular ? `<script>window.__wgFormular=${JSON.stringify(formular).replace(/<\/script/gi, '<\\/script')};</script>` : ''}
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
