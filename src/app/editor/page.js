'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { renderPage } from '@/lib/blockRenderer'
import { getVariants, ADDABLE_BLOCKS, BLOCK_CATEGORIES, BLOCK_REGISTRY, ZUSATZ_DEFAULTS } from '@/lib/blocks'
import { generateCIPalette } from '@/lib/colorSystem'
import { FONT_PAIRS } from '@/lib/fonts'
import { projektIdAusUrl, projektLaden, projektSpeichern, aktuellerNutzer } from '@/lib/projekte'
import { supabase } from '@/lib/supabaseClient'
import { starteCheckout } from '@/lib/checkout'
import { WarenkorbKnopf } from '@/components/Warenkorb'
import { useWarenkorb } from '@/lib/warenkorb'
import { KAUF, MIETE } from '@/lib/preise'
import { Kopf, BASIS_CSS } from '@/components/Kopf'
import { Brotkrumen } from '@/components/Brotkrumen'

const COLORS = ['#111827','#1e3a5f','#1d4ed8','#0891b2','#0f766e','#16a34a','#ca8a04','#c2410c','#dc2626','#e11d48','#9333ea','#7c3aed']

// Hintergrund-Muster für Design-Elemente
const PATTERNS = [
  { id: 'none', label: 'Keins', css: '' },
  { id: 'dots', label: 'Punkte', css: 'background-image:radial-gradient(circle,rgba(0,0,0,0.08) 1px,transparent 1px);background-size:20px 20px;' },
  { id: 'grid', label: 'Raster', css: 'background-image:linear-gradient(rgba(0,0,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.05) 1px,transparent 1px);background-size:24px 24px;' },
  { id: 'diagonal', label: 'Linien', css: 'background-image:repeating-linear-gradient(45deg,transparent,transparent 12px,rgba(0,0,0,0.03) 12px,rgba(0,0,0,0.03) 13px);' },
]

// Verlauf-Vorlagen für Bereich-Hintergründe (nutzen die CI-Farben der Seite)
const GRADIENTS = [
  { id: 'brand', label: 'Marke', css: 'linear-gradient(135deg,var(--p700),var(--p500))' },
  { id: 'brand-dark', label: 'Marke dunkel', css: 'linear-gradient(135deg,var(--p900),var(--p700))' },
  { id: 'accent', label: 'Akzent', css: 'linear-gradient(135deg,var(--p600),var(--accent))' },
  { id: 'soft', label: 'Sanft hell', css: 'linear-gradient(135deg,var(--p50),var(--p200))' },
  { id: 'night', label: 'Nacht', css: 'linear-gradient(135deg,#0f172a,var(--p800))' },
  { id: 'sunset', label: 'Sonnenuntergang', css: 'linear-gradient(135deg,#ff7e5f,#feb47b)' },
  { id: 'ocean', label: 'Ozean', css: 'linear-gradient(135deg,#2193b0,#6dd5ed)' },
  { id: 'violet', label: 'Violett', css: 'linear-gradient(135deg,#7c3aed,#2563eb)' },
]

// Muster pro Bereich (unabhängig von Bild/Farbe/Verlauf)
const SECTION_PATTERNS = [
  { id: 'none', label: 'Keins' },
  { id: 'dots', label: 'Punkte' },
  { id: 'grid', label: 'Raster' },
  { id: 'lines', label: 'Linien' },
]

// Icon-Auswahl (Font-Awesome-6-Solid-Namen ohne "fa-")
const ICON_CHOICES = ['star','heart','bolt','bullseye','handshake','shield-halved','circle-check','check','lightbulb','phone','envelope','location-dot','clock','trophy','rocket','wrench','screwdriver-wrench','palette','chart-line','chart-column','users','user','briefcase','house','scale-balanced','stethoscope','scissors','utensils','car','mobile-screen','laptop','earth-europe','lock','comments','gift','calendar-days','sack-dollar','gem','leaf','truck','graduation-cap','camera','fire','thumbs-up','award','headset','gears','hand-holding-heart']

export default function EditorPage() {
  const router = useRouter()
  const { setzePaket, setOffen } = useWarenkorb()
  const [pages, setPages] = useState({})
  const [palette, setPalette] = useState(null)
  const [font, setFont] = useState('Inter Tight')
  const [fontHeadline, setFontHeadline] = useState('Inter Tight')
  const [activePage, setActivePage] = useState('')
  const [device, setDevice] = useState('desktop')
  const [color, setColor] = useState('#1d4ed8')
  const [tab, setTab] = useState('blocks')
  const [pagePattern, setPagePattern] = useState('none')
  const [imageQuota, setImageQuota] = useState(8)
  const [imagesUsed, setImagesUsed] = useState(0)
  const [lastImgClick, setLastImgClick] = useState(null)
  const [renderKey, setRenderKey] = useState(0)
  const [selected, setSelected] = useState(null)
  const [blockPicker, setBlockPicker] = useState(null)
  const formDataRef = useRef({})
  const [expandedBlock, setExpandedBlock] = useState(null) // welcher Block in der Liste aufgeklappt ist

  // Undo/Redo Historie
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const initialRef = useRef(null)

  // Modals
  const [variantPicker, setVariantPicker] = useState(null)
  const [iconPicker, setIconPicker] = useState(null)
  const [imgTarget, setImgTarget] = useState(null)
  const [aiPanel, setAiPanel] = useState(false)
  const [aiTab, setAiTab] = useState('seo')
  const [customEditor, setCustomEditor] = useState(null)

  const iframeRef = useRef(null)
  const fileRef = useRef(null)
  const projektIdRef = useRef(null)
  const [speicherStatus, setSpeicherStatus] = useState('')   // '' | 'speichert' | 'gespeichert' | 'fehler'
  const [nutzer, setNutzer] = useState(null)
  const [kauft, setKauft] = useState(false)
  const [domainModal, setDomainModal] = useState(false)
  const [domainWunsch, setDomainWunsch] = useState('')
  const [domainDaten, setDomainDaten] = useState(null)
  const [domainLaedt, setDomainLaedt] = useState(false)

  // Domain im Editor nachträglich festlegen – gleiche Prüfung wie Startseite/Wizard
  async function domainPruefen() {
    const n = (domainWunsch || '').trim()
    if (!n) return
    setDomainLaedt(true); setDomainDaten(null)
    try {
      const res = await fetch('/api/domain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: n, tlds: ['de', 'com', 'net', 'org'] }) })
      setDomainDaten(await res.json())
    } catch { setDomainDaten({ error: 'Prüfung gerade nicht erreichbar.' }) }
    setDomainLaedt(false)
  }
  function domainWaehlen(d) {
    formDataRef.current = { ...(formDataRef.current || {}), domain: d }
    try { sessionStorage.setItem('wg24_formData', JSON.stringify(formDataRef.current)) } catch {}
    if (projektIdRef.current) projektSpeichern(projektIdRef.current, { form_data: formDataRef.current }).catch(() => {})
    setDomainModal(false); setDomainDaten(null); setDomainWunsch('')
  }
  const [kontoMenu, setKontoMenu] = useState(false)

  // Angemeldeten Nutzer holen (für Kopfzeile / Konto-Menü)
  useEffect(() => { aktuellerNutzer().then(setNutzer).catch(() => {}) }, [])

  // ── Laden ──
  useEffect(() => {
    const id = projektIdAusUrl()

    // Fall A: Projekt aus der Datenbank laden
    if (id) {
      projektIdRef.current = id
      projektLaden(id).then(p => {
        if (!p) { router.push('/dashboard'); return }
        if (!p.pages) {
          // Projekt wurde angelegt, aber nie fertig generiert (z. B. abgebrochene Generierung).
          // Die Angaben sind noch da — wir generieren einfach neu, statt tatenlos zurückzuspringen.
          if (p.form_data) {
            try {
              sessionStorage.setItem('wg24_formData', JSON.stringify(p.form_data))
              if (p.palette) sessionStorage.setItem('wg24_palette', JSON.stringify(p.palette))
            } catch {}
            router.push('/generating')
          } else {
            router.push('/start')
          }
          return
        }
        setPages(p.pages)
        setActivePage(Object.keys(p.pages)[0])
        const palObj = p.palette || generateCIPalette('#1d4ed8')
        setPalette(palObj)
        setColor(palObj.primary?.[500] || '#1d4ed8')
        if (p.font) setFont(p.font)
        if (p.form_data) {
          const data = p.form_data
          if (data.fontHeadline) setFontHeadline(data.fontHeadline)
          formDataRef.current = data
          setImageQuota(data.paket === 'business' ? 12 : data.paket === 'onepager' ? 6 : 8)
        }
        initialRef.current = JSON.stringify(p.pages)
        setHistory([JSON.stringify(p.pages)])
        setHistIdx(0)
      })
      return
    }

    // Fall B: wie bisher aus dem Browser-Zwischenspeicher
    const p = sessionStorage.getItem('wg24_pages')
    const pal = sessionStorage.getItem('wg24_palette')
    const f = sessionStorage.getItem('wg24_font')
    const fd = sessionStorage.getItem('wg24_formData')
    if (!p) { router.push('/start'); return }
    const parsed = JSON.parse(p)
    setPages(parsed)
    setActivePage(Object.keys(parsed)[0])
    const palObj = pal ? JSON.parse(pal) : generateCIPalette('#1d4ed8')
    setPalette(palObj)
    setColor(palObj.primary?.[500] || '#1d4ed8')
    if (f) setFont(f)
    if (fd) {
      const data = JSON.parse(fd)
      if (data.fontHeadline) setFontHeadline(data.fontHeadline)
      formDataRef.current = data
      // Kontingent aus Paket
      const quota = data.paket === 'business' ? 12 : data.paket === 'onepager' ? 6 : 8
      setImageQuota(quota)
      const used = parseInt(sessionStorage.getItem('wg24_imagesUsed') || '0')
      setImagesUsed(used)
    }
    // Historie initialisieren
    initialRef.current = JSON.stringify(parsed)
    setHistory([JSON.stringify(parsed)])
    setHistIdx(0)
  }, [])

  const blocks = pages[activePage] || []
  const primary = palette?.primary?.[500] || color

  // ── Historie-Push (für Undo) ──
  const pushHistory = useCallback((newPages) => {
    const snapshot = JSON.stringify(newPages)
    setHistory(prev => {
      const cut = prev.slice(0, histIdx + 1)
      cut.push(snapshot)
      // Max 50 Schritte
      if (cut.length > 50) cut.shift()
      return cut
    })
    setHistIdx(prev => Math.min(prev + 1, 49))
  }, [histIdx])

  function applyPages(newPages, addHistory = true, structural = true) {
    setPages(newPages)
    safeStore(newPages)
    if (addHistory) pushHistory(newPages)
    if (structural) setRenderKey(k => k + 1)
  }

  // sessionStorage sicher speichern (fängt Quota-Überlauf ab)
  function safeStore(newPages) {
    try {
      sessionStorage.setItem('wg24_pages', JSON.stringify(newPages))
    } catch (err) {
      console.warn('Speicher voll – Bilder werden komprimiert gehalten', err)
    }
    datenbankSpeichernVerzoegert(newPages)
  }

  // In die Datenbank speichern – gebündelt, damit nicht bei jedem Klick gespeichert wird
  const saveTimerRef = useRef(null)
  function datenbankSpeichernVerzoegert(newPages) {
    if (!projektIdRef.current) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSpeicherStatus('speichert')
    saveTimerRef.current = setTimeout(async () => {
      const ok = await projektSpeichern(projektIdRef.current, {
        pages: newPages,
        palette,
        font,
      })
      setSpeicherStatus(ok ? 'gespeichert' : 'fehler')
      if (ok) setTimeout(() => setSpeicherStatus(''), 2500)
    }, 2500)
  }

  // Sofort speichern (Knopf)
  async function jetztSpeichern() {
    if (!projektIdRef.current) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    setSpeicherStatus('speichert')
    const ok = await projektSpeichern(projektIdRef.current, { pages, palette, font })
    setSpeicherStatus(ok ? 'gespeichert' : 'fehler')
    if (ok) setTimeout(() => setSpeicherStatus(''), 2500)
  }

  function undo() {
    if (histIdx <= 0) return
    const idx = histIdx - 1
    setHistIdx(idx)
    const restored = JSON.parse(history[idx])
    setPages(restored)
    safeStore(restored)
    setRenderKey(k => k + 1)
  }
  function redo() {
    if (histIdx >= history.length - 1) return
    const idx = histIdx + 1
    setHistIdx(idx)
    const restored = JSON.parse(history[idx])
    setPages(restored)
    safeStore(restored)
    setRenderKey(k => k + 1)
  }
  function resetAll() {
    if (!confirm('Alle Änderungen zurücksetzen auf den Erstentwurf?')) return
    const restored = JSON.parse(initialRef.current)
    setPages(restored)
    safeStore(restored)
    setHistory([initialRef.current])
    setHistIdx(0)
    setRenderKey(k => k + 1)
  }

  // ── Render in iframe – NUR bei strukturellen Änderungen (renderKey) ──
  useEffect(() => {
    if (!iframeRef.current || !palette || !activePage || !blocks.length) return
    const iframe = iframeRef.current
    // Scroll-Position merken, damit der Editor beim Neuaufbau nicht nach oben springt
    let sy = 0
    try { sy = iframe.contentWindow?.scrollY || 0 } catch { sy = 0 }
    const html = renderPage({ blocks, palette, font, fontHeadline, title: activePage, forEditor: true })
    iframe.onload = () => { try { iframe.contentWindow?.scrollTo(0, sy) } catch {} }
    iframe.srcdoc = injectEditor(injectPattern(html))
  }, [renderKey, activePage, palette, font, fontHeadline, pagePattern])

  function applyPattern(pat) {
    setPagePattern(pat.id)
  }

  // Font Awesome auch für die Editor-Oberfläche laden (für Icon-Auswahl)
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById('wg-fa')) return
    const l = document.createElement('link')
    l.id = 'wg-fa'; l.rel = 'stylesheet'
    l.href = '/fa/css/all.min.css'
    document.head.appendChild(l)
  }, [])

  // Bereich-Hintergrundfelder setzen (Farbe / Verlauf / Muster / Bild entfernen) – mit Neuaufbau
  function setSectionField(blockIdx, fields) {
    const next = { ...pages }; const arr = [...next[activePage]]
    arr[blockIdx] = { ...arr[blockIdx], content: { ...arr[blockIdx].content, ...fields } }
    next[activePage] = arr; applyPages(next, true, true)
  }

  // Felder OHNE Neuaufbau speichern (für Live-Regler wie Parallax)
  function setSectionFieldLive(blockIdx, fields) {
    const next = { ...pages }; const arr = [...next[activePage]]
    arr[blockIdx] = { ...arr[blockIdx], content: { ...arr[blockIdx].content, ...fields } }
    next[activePage] = arr; applyPages(next, true, false)
  }

  // Parallax live im Vorschaufenster setzen + speichern
  function applySectionParallax(blockIdx, on, speed) {
    iframeRef.current?.contentWindow?.postMessage({ cmd: 'setParallax', block: blockIdx, on, speed }, '*')
    setSectionFieldLive(blockIdx, { bgParallax: on, bgParallaxSpeed: speed })
  }

  // Icon eines Elements ändern
  function setIconForBlock(blockIdx, key, faIconName) {
    updateContent(blockIdx, key, faIconName, true)
    setIconPicker(null)
  }

  function injectPattern(html) {
    const pat = PATTERNS.find(p => p.id === pagePattern)
    if (!pat || !pat.css) return html
    const patternCss = `<style id="wg-pattern">body{position:relative;}body::before{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;${pat.css}}</style>`
    return html.replace('</head>', patternCss + '</head>')
  }

  function injectEditor(html) {
    const css = `<style id="wg-ed">
      * { scroll-behavior: auto !important; }
      [data-edit]{ cursor:text; border-radius:3px; }
      [data-edit]:hover{ outline:1px dashed ${primary}99; outline-offset:2px; }
      [data-sel]{ position:relative; transition:outline 0.1s; }
      [data-sel]:hover{ outline:2px solid ${primary}55; outline-offset:1px; cursor:pointer; }
      .wg-on{ outline:2px solid ${primary} !important; outline-offset:1px; }
      .wg-on::after{ content:attr(data-label); position:absolute; top:-19px; left:-2px; background:${primary}; color:#fff; font-size:10px; font-weight:700; padding:2px 7px; border-radius:4px 4px 0 0; white-space:nowrap; z-index:99999; pointer-events:none; font-family:sans-serif; }
      [data-block]{ position:relative; }
      [data-block]:hover{ outline:1px solid ${primary}33; outline-offset:-1px; }
      .wg-bc{ position:absolute; top:8px; right:8px; z-index:99998; display:none; gap:4px; }
      [data-block]:hover .wg-bc{ display:flex; }
      .wg-b{ width:28px; height:28px; border:none; border-radius:6px; background:rgba(15,23,42,0.85); color:#fff; cursor:pointer; font-size:13px; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); }
      .wg-b:hover{ background:${primary}; }
      .wg-b.del:hover{ background:#dc2626; }
    </style>`

    const js = `<script>(function(){
      if(window.__wgE)return;window.__wgE=1;
      var sel=null;
      var WG_NAMES=${JSON.stringify(Object.fromEntries(Object.entries(BLOCK_REGISTRY).map(([k, v]) => [k, v.label])))};

      // 1) ALLE Klicks abfangen - keine Navigation im Editor
      document.addEventListener('click',function(e){
        var a=e.target.closest('a');
        if(a){e.preventDefault();}
        // Buttons auch nicht auslösen
        if(e.target.closest('button')&&!e.target.closest('.wg-bc')){e.preventDefault();}
      },true);

      // 2) Wählbare Elemente markieren: Überschriften, Absätze, Buttons, Links, Bilder, Icons
      var SEL='h1,h2,h3,h4,p,a,button,[data-img],[data-icon],[data-stars],[data-edit],span[style],.wg-btn,li';
      function labelFor(el){
        var t=el.tagName.toLowerCase();
        if(el.hasAttribute('data-img'))return 'Bild';
        if(t==='a'||t==='button')return 'Button';
        if(t==='h1')return 'Überschrift H1';
        if(t==='h2'||t==='h3'||t==='h4')return 'Überschrift';
        if(t==='p')return 'Text';
        if(t==='li')return 'Listenpunkt';
        return 'Element';
      }

      function selectEl(el){
        if(sel)sel.classList.remove('wg-on');
        sel=el;
        el.classList.add('wg-on');
        el.setAttribute('data-label',labelFor(el));
        var cs=window.getComputedStyle(el);
        var r=el.getBoundingClientRect();
        parent.postMessage({t:'select',
          tag:el.tagName.toLowerCase(),
          isImg:el.hasAttribute('data-img'),
          isIcon:el.hasAttribute('data-icon'),
          isStars:el.hasAttribute('data-stars'),
          rating:el.hasAttribute('data-stars')?(parseInt(el.getAttribute('data-rating'))||5):0,
          isText:el.hasAttribute('data-edit'),
          key:el.getAttribute('data-edit')||el.getAttribute('data-img')||el.getAttribute('data-icon')||el.getAttribute('data-stars')||'',
          iconName:el.hasAttribute('data-icon')?(((el.getAttribute('class')||'').match(/fa-(?!solid|regular|brands)[a-z0-9-]+/)||[''])[0]):'',
          align:cs.textAlign,
          color:rgbToHex(cs.color),
          fontSize:parseInt(cs.fontSize)||16,
          fontWeight:cs.fontWeight,
          block:bIdx(el),
          rect:{top:r.top,left:r.left,width:r.width,height:r.height}
        },'*');
      }

      // Klick auf Element = auswählen (nicht navigieren)
      document.querySelectorAll(SEL).forEach(function(el){
        if(el.closest('.wg-bc'))return;
        el.setAttribute('data-sel','1');
        el.addEventListener('click',function(e){
          e.stopPropagation();e.preventDefault();
          selectEl(this);
          // Text: editierbar machen
          if(this.hasAttribute('data-edit')){this.contentEditable=true;}
          else if(this.hasAttribute('data-icon')){parent.postMessage({t:'iconClick',key:this.getAttribute('data-icon'),block:bIdx(this)},'*');}
          else if(this.hasAttribute('data-img')){parent.postMessage({t:'imgClick',key:this.getAttribute('data-img'),block:bIdx(this)},'*');}
        });
      });

      // Text-Speichern bei Blur
      document.querySelectorAll('[data-edit]').forEach(function(el){
        el.addEventListener('blur',function(){
          parent.postMessage({t:'edit',key:el.dataset.edit,val:el.innerHTML,block:bIdx(el)},'*');
        });
        el.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();this.blur();}});
      });

      // 3) Befehle von React empfangen (Formatierung etc.)
      window.addEventListener('message',function(e){
        var d=e.data;if(!d||!d.cmd||!sel)return;
        // Block-Level-Element für Ausrichtung finden (span ist inline → wirkt nicht)
        var target=sel;
        var tn=sel.tagName.toLowerCase();
        if(tn==='span'){ var p=sel.parentElement; if(p) target=p; }
        if(d.cmd==='align'){ target.style.textAlign=d.val; saveSel(); }
        if(d.cmd==='color'){sel.style.color=d.val;}
        if(d.cmd==='fontSize'){sel.style.fontSize=d.val;}
        if(d.cmd==='bold'){toggleStyle(sel,'fontWeight','700','400');saveSel();}
        if(d.cmd==='italic'){toggleStyle(sel,'fontStyle','italic','normal');saveSel();}
        if(d.cmd==='underline'){toggleStyle(sel,'textDecoration','underline','none');saveSel();}
        if(d.cmd==='sectionBg'){var s=sel.closest('[data-section]')||sel.closest('[data-block]');if(s){s.style.backgroundImage="linear-gradient("+d.overlay+","+d.overlay+"),url('"+d.img+"')";s.style.backgroundSize='cover';s.style.backgroundPosition='center';}parent.postMessage({t:'sectionStyle',block:bIdx(sel),img:d.img,overlay:d.overlay,parallax:d.parallax},'*');}
        if(d.cmd==='dupEl'){var cl=sel.cloneNode(true);cl.classList.remove('wg-on');sel.parentNode.insertBefore(cl,sel.nextSibling);}
        if(d.cmd==='delEl'){var pn=sel.parentNode;sel.remove();sel=null;parent.postMessage({t:'deselect'},'*');}
        if(d.cmd==='deselect'){if(sel){sel.classList.remove('wg-on');sel.contentEditable=false;sel=null;}}
      });
      function toggleStyle(el,prop,on,off){
        var cur=window.getComputedStyle(el)[prop];
        el.style[prop]=(cur===on||cur.indexOf(on)>=0)?off:on;
      }
      function saveSel(){
        if(!sel)return;
        if(sel.hasAttribute('data-edit')){
          parent.postMessage({t:'edit',key:sel.dataset.edit,val:sel.innerHTML,block:bIdx(sel)},'*');
        }
        // Stil-Änderungen an Nicht-Text-Elementen: als Style speichern
        parent.postMessage({t:'style',block:bIdx(sel),key:sel.getAttribute('data-edit')||'',cssText:sel.style.cssText},'*');
      }

      // 4) Block-Steuerung
      document.querySelectorAll('[data-block]').forEach(function(el,i){
        var type=el.dataset.block;
        if(type==='nav'||type==='footer')return;
        var bc=document.createElement('div');bc.className='wg-bc';
        bc.innerHTML='<button class="wg-b" data-x="var" title="Layout">⟳</button><button class="wg-b" data-x="up" title="Hoch">↑</button><button class="wg-b" data-x="down" title="Runter">↓</button><button class="wg-b" data-x="dup" title="Duplizieren">⧉</button><button class="wg-b del" data-x="del" title="Löschen">✕</button>';
        bc.querySelectorAll('button').forEach(function(btn){
          btn.onclick=function(e){e.stopPropagation();var x=btn.dataset.x;
            if(x==='var')parent.postMessage({t:'variant',block:i,type:type},'*');
            if(x==='up')parent.postMessage({t:'move',block:i,dir:-1},'*');
            if(x==='down')parent.postMessage({t:'move',block:i,dir:1},'*');
            if(x==='dup')parent.postMessage({t:'dup',block:i},'*');
            if(x==='del')parent.postMessage({t:'del',block:i},'*');
          };
        });
        el.appendChild(bc);
      });

      function bIdx(node){var b=node.closest('[data-block]');if(!b)return -1;var all=document.querySelectorAll('[data-block]');for(var i=0;i<all.length;i++)if(all[i]===b)return i;return -1;}
      function rgbToHex(rgb){var m=rgb.match(/\\d+/g);if(!m)return '#000000';return '#'+m.slice(0,3).map(function(x){return ('0'+parseInt(x).toString(16)).slice(-2)}).join('');}

      // Klick auf Section-Hintergrund (nicht auf Inhalt) = Section wählen
      document.querySelectorAll('[data-section]').forEach(function(s){
        s.addEventListener('click',function(e){
          // nur wenn direkt auf die Section geklickt (nicht auf Kind-Element)
          if(e.target===this){
            e.stopPropagation();
            if(sel)sel.classList.remove('wg-on');
            sel=this;this.classList.add('wg-on');this.setAttribute('data-label',WG_NAMES[this.getAttribute('data-block')]||'Bereich');
            var cs=window.getComputedStyle(this);
            parent.postMessage({t:'selectSection',block:bIdx(this)},'*');
          }
        });
      });
      // ── Drag & Drop: Block aus der Bibliothek einfuegen (mit Platzhalter-Rahmen) ──
      var wgPlace=null;
      function wgRemovePlace(){ if(wgPlace&&wgPlace.parentNode)wgPlace.parentNode.removeChild(wgPlace); wgPlace=null; }
      function wgMakePlace(){ var d=document.createElement('div'); d.className='wg-place'; d.style.cssText='height:84px;margin:10px 14px;border:3px dashed ${primary};border-radius:16px;background:${primary}14;display:flex;align-items:center;justify-content:center;color:${primary};font:700 14px sans-serif;box-shadow:0 0 0 4px ${primary}22;'; d.textContent='⬇ Hier einfügen'; return d; }
      function wgPlaceAt(y){
        var bs=Array.prototype.slice.call(document.querySelectorAll('[data-block]')).filter(function(b){return !b.classList.contains('wg-place');});
        if(!wgPlace) wgPlace=wgMakePlace();
        var target=null;
        for(var i=0;i<bs.length;i++){ var r=bs[i].getBoundingClientRect(); if(y < r.top + r.height/2){ target=bs[i]; window.__wgDropIndex=i; break; } }
        if(target){ target.parentNode.insertBefore(wgPlace, target); }
        else { var last=bs[bs.length-1]; if(last)last.parentNode.insertBefore(wgPlace, last.nextSibling); window.__wgDropIndex=bs.length; }
      }
      document.addEventListener('dragover',function(e){ if(!parent.__wgDrag)return; e.preventDefault(); try{e.dataTransfer.dropEffect='copy';}catch(x){} wgPlaceAt(e.clientY); });
      document.addEventListener('drop',function(e){ if(!parent.__wgDrag)return; e.preventDefault(); var idx=window.__wgDropIndex||0; wgRemovePlace(); parent.postMessage({t:'dropBlock', blockType:parent.__wgDrag, index:idx},'*'); });
      window.addEventListener('message',function(e){ var dd=e.data; if(!dd)return; if(dd.cmd==='wgDragEnd')wgRemovePlace(); if(dd.cmd==='setParallax'){ var bs=document.querySelectorAll('[data-block]'); var el=bs[dd.block]; if(el){ if(dd.on){el.setAttribute('data-parallax',dd.speed);}else{el.removeAttribute('data-parallax');el.style.backgroundPositionY='';} if(typeof window.wgRunParallax==='function')window.wgRunParallax(); } } if(dd.cmd==='gotoBlock'){ var bs2=document.querySelectorAll('[data-block]'); var el2=bs2[dd.index]; if(el2){ el2.scrollIntoView({behavior:'smooth',block:'start'}); el2.style.transition='outline 0.2s'; el2.style.outline='3px solid ${primary}'; setTimeout(function(){el2.style.outline='';},900); } } });
    })();</script>`

    return html.replace('</head>', css + '</head>').replace('</body>', js + '</body>')
  }

  // ── Messages aus iframe ──
  useEffect(() => {
    function onMsg(e) {
      const d = e.data
      if (!d?.t) return
      if (d.t === 'edit') updateContent(d.block, d.key, d.val, false)
      if (d.t === 'imgClick') { setLastImgClick({ blockIdx: d.block, key: d.key }) }
      if (d.t === 'iconClick') setIconPicker({ blockIdx: d.block, key: d.key })
      if (d.t === 'select') setSelected(d)
      if (d.t === 'selectSection') { const t = pages[activePage]?.[d.block]?.type; setSelected({ isSection: true, block: d.block, secName: BLOCK_REGISTRY[t]?.label || 'Bereich' }) }
      if (d.t === 'sectionStyle') saveSectionStyle(d.block, d.img, d.overlay, d.parallax)
      if (d.t === 'deselect') setSelected(null)
      if (d.t === 'style') { /* live im iframe, kein extra Speichern nötig */ }
      if (d.t === 'variant') setVariantPicker({ blockIdx: d.block, type: d.type })
      if (d.t === 'move') moveBlock(d.block, d.dir)
      if (d.t === 'del') delBlock(d.block)
      if (d.t === 'dup') dupBlock(d.block)
      if (d.t === 'dropBlock') addBlockAt(d.index, d.blockType)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [activePage, pages, histIdx, history])

  // Befehl an iframe senden (Formatierung)
  function sendCmd(cmd, val) {
    iframeRef.current?.contentWindow?.postMessage({ cmd, val }, '*')
  }

  // Section-Hintergrund speichern (im content als bgImg/bgOverlay/bgParallax)
  function saveSectionStyle(blockIdx, bgImg, bgOverlay, bgParallax) {
    const next = { ...pages }; const arr = [...next[activePage]]
    arr[blockIdx] = { ...arr[blockIdx], content: { ...arr[blockIdx].content, bgImg, bgOverlay, bgParallax } }
    next[activePage] = arr; applyPages(next, true, false)
  }

  // Section-Hintergrundbild setzen (von Panel)
  function setSectionBg(blockIdx, opts) {
    const block = pages[activePage]?.[blockIdx]
    const img = opts.img !== undefined ? opts.img : block?.content?.bgImg
    const overlay = opts.overlay !== undefined ? opts.overlay : (block?.content?.bgOverlay || 'rgba(15,23,42,0.55)')
    const parallax = opts.parallax !== undefined ? opts.parallax : (block?.content?.bgParallax || false)
    iframeRef.current?.contentWindow?.postMessage({ cmd: 'sectionBg', img, overlay, parallax }, '*')
    saveSectionStyle(blockIdx, img, overlay, parallax)
  }

  // ── Content-Operationen ──
  function updateContent(blockIdx, key, val, isImage = false) {
    const next = { ...pages }
    const arr = [...next[activePage]]
    const block = { ...arr[blockIdx] }
    const content = { ...block.content }

    if (key.startsWith('svc_icon_')) {
      const idx = parseInt(key.split('_').pop())
      content.items = [...(content.items || [])]; content.items[idx] = { ...content.items[idx], icon: val }
    } else if (key.startsWith('plan_feat_')) {
      const parts = key.split('_'); const j = parseInt(parts.pop()); const i = parseInt(parts.pop())
      content.plans = [...(content.plans || [])]
      const features = [...(content.plans[i]?.features || [])]; features[j] = val
      content.plans[i] = { ...content.plans[i], features }
    } else if (key.startsWith('plan_')) {
      const parts = key.split('_'); const i = parseInt(parts.pop()); const field = parts[1]
      content.plans = [...(content.plans || [])]; content.plans[i] = { ...content.plans[i], [field]: val }
    } else if (key.startsWith('step_icon_')) {
      const i = parseInt(key.split('_').pop())
      content.steps = [...(content.steps || [])]; content.steps[i] = { ...content.steps[i], icon: val }
    } else if (key.startsWith('step_')) {
      const parts = key.split('_'); const i = parseInt(parts.pop()); const field = parts[1]
      content.steps = [...(content.steps || [])]; content.steps[i] = { ...content.steps[i], [field]: val }
    } else if (key.startsWith('logo_')) {
      const i = parseInt(key.split('_').pop())
      content.logos = [...(content.logos || [])]; content.logos[i] = val
    } else if (key.startsWith('svc_title_') || key.startsWith('svc_text_')) {
      const idx = parseInt(key.split('_').pop()); const field = key.includes('title') ? 'title' : 'text'
      content.items = [...(content.items || [])]; content.items[idx] = { ...content.items[idx], [field]: val }
    } else if (key.startsWith('testi_') || key.startsWith('faq_')) {
      const parts = key.split('_'); const idx = parseInt(parts.pop()); const field = parts[1]
      content.items = [...(content.items || [])]; content.items[idx] = { ...content.items[idx], [field]: val }
    } else if (key.startsWith('team_')) {
      const parts = key.split('_'); const idx = parseInt(parts.pop()); const field = parts[1]
      content.members = [...(content.members || [])]; content.members[idx] = { ...content.members[idx], [field]: val }
    } else if (key.startsWith('menu_kat_')) {
      const ki = parseInt(key.split('_').pop())
      content.kategorien = [...(content.kategorien || [])]
      content.kategorien[ki] = { ...content.kategorien[ki], name: val }
    } else if (key.startsWith('menu_name_') || key.startsWith('menu_desc_') || key.startsWith('menu_preis_')) {
      const parts = key.split('_'); const ii = parseInt(parts.pop()); const ki = parseInt(parts.pop())
      const field = parts[1] === 'name' ? 'name' : parts[1] === 'desc' ? 'desc' : 'preis'
      content.kategorien = [...(content.kategorien || [])]
      const items = [...(content.kategorien[ki]?.items || [])]
      items[ii] = { ...items[ii], [field]: val }
      content.kategorien[ki] = { ...content.kategorien[ki], items }
    } else if (key.startsWith('img_')) {
      const idx = parseInt(key.split('_').pop())
      content.images = [...(content.images || [])]; content.images[idx] = val
    } else { content[key] = val }

    block.content = content; arr[blockIdx] = block; next[activePage] = arr
    // Text-Edits: KEIN iframe-Neubau (kein Scroll-Sprung, Formatierung bleibt)
    // Bilder: Neubau nötig damit Bild erscheint
    applyPages(next, true, isImage)
  }

  function changeVariant(blockIdx, variantId) {
    const next = { ...pages }; const arr = [...next[activePage]]
    arr[blockIdx] = { ...arr[blockIdx], variant: variantId }; next[activePage] = arr
    applyPages(next); setVariantPicker(null)
  }
  function moveBlock(blockIdx, dir) {
    const next = { ...pages }; const arr = [...next[activePage]]; const to = blockIdx + dir
    if (to <= 0 || to >= arr.length - 1) return
    ;[arr[blockIdx], arr[to]] = [arr[to], arr[blockIdx]]; next[activePage] = arr; applyPages(next)
  }
  function delBlock(blockIdx) {
    const next = { ...pages }; const arr = [...next[activePage]]; arr.splice(blockIdx, 1); next[activePage] = arr; applyPages(next)
  }
  function dupBlock(blockIdx) {
    const next = { ...pages }; const arr = [...next[activePage]]
    arr.splice(blockIdx + 1, 0, JSON.parse(JSON.stringify(arr[blockIdx]))); next[activePage] = arr; applyPages(next)
  }
  function addBlock(type, variantId) {
    const variants = getVariants(type); if (!variants.length) return
    const next = { ...pages }; const arr = [...next[activePage]]
    arr.splice(arr.length - 1, 0, { type, variant: variantId || variants[0].id, content: buildDefaultContent(type) })
    next[activePage] = arr; applyPages(next)
    setExpandedBlock(null)
  }

  // Block per Drag & Drop an bestimmter Position einfügen (nicht vor nav, nicht nach footer)
  function addBlockAt(index, type) {
    const variants = getVariants(type); if (!variants.length) return
    const next = { ...pages }; const arr = [...next[activePage]]
    const i = Math.max(1, Math.min(index, arr.length - 1))
    arr.splice(i, 0, { type, variant: variants[0].id, content: buildDefaultContent(type) })
    next[activePage] = arr; applyPages(next)
  }

  function onFile(e) {
    const file = e.target.files?.[0]; if (!file || !imgTarget) return
    compressImage(file, (compressedSrc) => {
      if (imgTarget === 'logo' || imgTarget === 'logoFooter') {
        const next = { ...pages }
        const logoKey = imgTarget === 'logoFooter' ? 'logoFooter' : 'logo'
        Object.keys(next).forEach(seite => {
          next[seite] = next[seite].map(b => {
            if (imgTarget === 'logo' && b.type === 'nav') return { ...b, content: { ...b.content, logo: compressedSrc } }
            if (imgTarget === 'logoFooter' && b.type === 'footer') return { ...b, content: { ...b.content, logo: compressedSrc } }
            if (imgTarget === 'logo' && b.type === 'footer' && !b.content.logo) return { ...b, content: { ...b.content, logo: compressedSrc } }
            return b
          })
        })
        applyPages(next)
      } else if (imgTarget?.key === '__sectionBg') {
        setSectionBg(imgTarget.blockIdx, { img: compressedSrc })
      } else {
        updateContent(imgTarget.blockIdx, imgTarget.key, compressedSrc, true)
      }
      setImgTarget(null)
    })
    e.target.value = ''
  }

  // Bild komprimieren (max 1600px, WebP/JPEG) → passt in sessionStorage
  function compressImage(file, callback) {
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const maxDim = 1600
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * maxDim / width); width = maxDim }
          else { width = Math.round(width * maxDim / height); height = maxDim }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        // WebP wenn möglich, sonst JPEG
        let out
        try { out = canvas.toDataURL('image/webp', 0.82) } catch { out = canvas.toDataURL('image/jpeg', 0.85) }
        if (!out.startsWith('data:image/webp')) out = canvas.toDataURL('image/jpeg', 0.85)
        callback(out)
      }
      img.onerror = () => callback(ev.target.result)
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  function updateColor(c) {
    setColor(c); const pal = generateCIPalette(c); setPalette(pal)
    sessionStorage.setItem('wg24_palette', JSON.stringify(pal))
    if (projektIdRef.current) projektSpeichern(projektIdRef.current, { palette: pal })
  }

  function saveCustom(blockIdx, htmlCode) {
    const next = { ...pages }; const arr = [...next[activePage]]
    arr[blockIdx] = { ...arr[blockIdx], content: { ...arr[blockIdx].content, html: htmlCode } }
    next[activePage] = arr; applyPages(next); setCustomEditor(null)
  }

  // Generiertes KI-Bild einsetzen
  function handleGeneratedImage(imgData) {
    // Setze in zuletzt angeklickten Bildbereich, sonst ersten img-Block der Seite
    let target = lastImgClick
    if (!target) {
      // Finde ersten Block mit Bild-Feld
      const arr = pages[activePage] || []
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].type === 'hero-full' || arr[i].type === 'about' || arr[i].type === 'gallery') {
          target = { blockIdx: i, key: arr[i].type === 'gallery' ? 'img_0' : 'image' }
          break
        }
      }
    }
    if (target) updateContent(target.blockIdx, target.key, imgData, true)
    const newUsed = imagesUsed + 1
    setImagesUsed(newUsed)
    sessionStorage.setItem('wg24_imagesUsed', String(newUsed))
  }

  const pageList = Object.keys(pages)

  if (!palette || !activePage) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #f0f0f0', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <>
    {/* Editor ist Teil der eigentlichen Seite: echter Header oben (mit Warenkorb) */}
    <style dangerouslySetInnerHTML={{ __html: BASIS_CSS }} />
    <Kopf />
    <div style={{ height: 'calc(100vh - 108px)', minHeight: 560, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: '"Inter Tight",sans-serif', fontSize: 13 }}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Wo bin ich? */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '0 14px', flexShrink: 0 }}>
        <Brotkrumen pfad={[['Start', '/'], ['Meine Websites', '/dashboard'], [(blocks.find(b => b.type === 'nav')?.content?.firmenname) || 'Website'], ['Editor']]} />
      </div>

      {/* TOPBAR */}
      <div style={{ height: 50, borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, flexShrink: 0, background: '#fff' }}>
        {/* Logo/Login/Warenkorb liefert der echte Seiten-Header oben – hier nur
            das, was zum Projekt gehört: Firmenname + gebuchte Domain. */}
        <span style={{ fontWeight: 700, color: '#0f172a', maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blocks.find(b => b.type === 'nav')?.content?.firmenname || 'Deine Website'}</span>
        {formDataRef.current?.domain ? (
          <a href={`https://${String(formDataRef.current.domain).replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" title="Website ansehen" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: primary, background: primary + '12', border: `1px solid ${primary}33`, borderRadius: 99, padding: '4px 11px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            <i className="fa-solid fa-globe" />{formDataRef.current.domain}
          </a>
        ) : (
          <button onClick={() => setDomainModal(true)} title="Domain festlegen" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: '#64748b', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: 99, padding: '4px 11px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            <i className="fa-solid fa-globe" />Domain festlegen
          </button>
        )}

        {/* Undo/Redo */}
        <div style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
          <button onClick={undo} disabled={histIdx <= 0} title="Rückgängig" style={{ width: 32, height: 30, border: '1px solid #e5e5e5', borderRadius: 7, background: '#fff', cursor: histIdx <= 0 ? 'not-allowed' : 'pointer', opacity: histIdx <= 0 ? 0.35 : 1, fontSize: 15 }}>↶</button>
          <button onClick={redo} disabled={histIdx >= history.length - 1} title="Wiederholen" style={{ width: 32, height: 30, border: '1px solid #e5e5e5', borderRadius: 7, background: '#fff', cursor: histIdx >= history.length - 1 ? 'not-allowed' : 'pointer', opacity: histIdx >= history.length - 1 ? 0.35 : 1, fontSize: 15 }}>↷</button>
          <button onClick={resetAll} title="Alles zurücksetzen" style={{ width: 32, height: 30, border: '1px solid #e5e5e5', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 13 }}>⟲</button>
        </div>

        <div style={{ flex: 1 }} />
        {[['desktop','desktop'],['tablet-screen-button','tablet'],['mobile-screen','mobile']].map(([ic, d]) => (
          <button key={d} onClick={() => setDevice(d)} title={d} style={{ width: 30, height: 30, border: `1px solid ${device === d ? primary : '#e5e5e5'}`, borderRadius: 7, background: device === d ? '#f5f5f5' : '#fff', cursor: 'pointer', fontSize: 14, color: device === d ? primary : '#475569' }}><i className={`fa-solid fa-${ic}`} /></button>
        ))}
        <div style={{ width: 1, height: 18, background: '#e5e5e5', margin: '0 4px' }} />
        <button onClick={() => setAiPanel(o => !o)} style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', border: 'none', borderRadius: 7, padding: '6px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}><i className="fa-solid fa-wand-magic-sparkles" />AI Designer</button>
        <button disabled={kauft} onClick={async () => {
          if (!nutzer) { router.push('/login'); return }
          const fd = formDataRef.current || {}
          const za = fd.zahlungsart === 'mieten' ? 'mieten' : 'kaufen'
          const quelle = za === 'mieten' ? MIETE : KAUF
          const size = fd.paket || 'multipage'
          const p = quelle.find(x => (x.id === size) || (za === 'mieten' && { start: 'onepager', plus: 'multipage', pro: 'business' }[x.id] === size)) || quelle[1]
          // Warenkorb synchron halten …
          setzePaket({ id: 'paket-' + p.id, titel: `Website ${za === 'mieten' ? 'mieten' : 'kaufen'} — ${p.name}`, unter: p.kurz, preis: p.preis, art: za === 'mieten' ? 'monatlich' : 'einmalig' })
          // … und direkt zu Stripe weiterleiten
          setKauft(true)
          const { error } = await starteCheckout({ paketId: p.id, modus: za, projektId: projektIdRef.current, domain: fd.domain })
          if (error) { setKauft(false); alert(error) }
        }} style={{ background: primary, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: kauft ? 'wait' : 'pointer', opacity: kauft ? .7 : 1, display: 'inline-flex', alignItems: 'center', gap: 6 }}>{kauft ? 'Öffne Kasse…' : <>Kaufen &amp; Download<i className="fa-solid fa-arrow-right" /></>}</button>

        {/* Konto/Warenkorb sitzen im echten Seiten-Header oben – hier bewusst nicht doppelt. */}
      </div>

      {/* PAGE TABS */}
      {pageList.length > 1 && (
        <div style={{ borderBottom: '1px solid #e5e5e5', display: 'flex', padding: '0 14px', background: '#fff', flexShrink: 0, overflowX: 'auto' }}>
          {pageList.map(pg => (
            <button key={pg} onClick={() => setActivePage(pg)} style={{ padding: '9px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', borderBottom: `2px solid ${activePage === pg ? primary : 'transparent'}`, color: activePage === pg ? '#111' : '#888', whiteSpace: 'nowrap' }}>{pg}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT PANEL */}
        <div style={{ width: 240, borderRight: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column', flexShrink: 0, background: '#fff' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5' }}>
            {[['Blöcke', 'blocks'], ['Bereiche', 'sections'], ['Seiten', 'pages']].map(([l, id]) => (
              <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '9px 0', fontSize: 10, fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none', borderBottom: `2px solid ${tab === id ? primary : 'transparent'}`, color: tab === id ? '#111' : '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {tab === 'blocks' && (
              <>
                <div style={{ fontSize: 9, color: '#bbb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 4px', marginBottom: 6 }}>Block-Bibliothek</div>
                {BLOCK_CATEGORIES.map(cat => {
                  const items = ADDABLE_BLOCKS.filter(b => b.cat === cat && (!b.nurBranche || b.nurBranche.includes(formDataRef.current?.branche)))
                  if (!items.length) return null
                  return (
                    <div key={cat} style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', padding: '0 4px 7px', letterSpacing: '0.02em' }}>{cat}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                        {items.map(b => {
                          const n = getVariants(b.type).length
                          return (
                            <div key={b.type} draggable onDragStart={e => { window.__wgDrag = b.type; e.dataTransfer.effectAllowed = 'copy'; try { e.dataTransfer.setData('text/plain', b.type) } catch {} }} onDragEnd={() => { window.__wgDrag = null; iframeRef.current?.contentWindow?.postMessage({ cmd: 'wgDragEnd' }, '*') }} onClick={() => setBlockPicker(b.type)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '13px 6px 9px', border: '1px solid #e5e5e5', borderRadius: 10, cursor: 'grab', background: '#fff', transition: 'all 0.12s', textAlign: 'center', position: 'relative' }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = primary; e.currentTarget.style.background = primary + '08'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none' }}>
                              <i className={`fa-solid fa-${b.fa || 'cube'}`} style={{ fontSize: 19, color: primary }} />
                              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#334155', lineHeight: 1.2 }}>{b.label}</span>
                              <span style={{ fontSize: 8.5, fontWeight: 700, color: '#94a3b8', background: '#f1f5f9', borderRadius: 99, padding: '1px 7px' }}>{n} {n === 1 ? 'Vorlage' : 'Vorlagen'}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, lineHeight: 1.5, padding: '0 4px' }}>Klick auf einen Block → wähle aus mehreren Design-Vorlagen mit Live-Vorschau.</div>
              </>
            )}
            {tab === 'sections' && (
              <>
                <div style={{ fontSize: 9, color: '#bbb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 4px', marginBottom: 6 }}>Bereiche dieser Seite</div>
                {blocks.map((b, i) => {
                  if (b.type === 'nav' || b.type === 'footer') return null
                  const meta = ADDABLE_BLOCKS.find(a => a.type === b.type)
                  const name = BLOCK_REGISTRY[b.type]?.label || b.type
                  const active = selected?.isSection && selected.block === i
                  return (
                    <div key={i} onClick={() => { setSelected({ isSection: true, block: i, secName: name }); iframeRef.current?.contentWindow?.postMessage({ cmd: 'gotoBlock', index: i }, '*') }} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', border: `1px solid ${active ? primary : '#e5e5e5'}`, borderRadius: 8, marginBottom: 5, cursor: 'pointer', background: active ? primary + '12' : '#fff' }}>
                      <i className={`fa-solid fa-${meta?.fa || 'cube'}`} style={{ fontSize: 13, color: primary, width: 16, textAlign: 'center' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#334155', flex: 1 }}>{name}</span>
                      <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 700 }}>{i}</span>
                    </div>
                  )
                })}
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 8, lineHeight: 1.5, padding: '0 4px' }}>Klick auf einen Bereich → springt in der Vorschau dorthin und öffnet die Bearbeitung rechts.</div>
              </>
            )}
            {tab === 'pages' && (
              <>
                <div style={{ fontSize: 9, color: '#bbb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 4px', marginBottom: 4 }}>Seiten</div>
                {pageList.map(pg => (
                  <div key={pg} onClick={() => setActivePage(pg)} style={{ padding: '10px 12px', border: `1px solid ${activePage === pg ? primary : '#e5e5e5'}`, borderRadius: 8, marginBottom: 4, cursor: 'pointer', background: activePage === pg ? `${primary}12` : '#fff', fontSize: 12, fontWeight: activePage === pg ? 600 : 400 }}>{pg}</div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* PREVIEW */}
        <div style={{ flex: 1, background: '#e8e8e8', overflow: 'auto', display: 'flex', justifyContent: 'center', padding: 16, position: 'relative' }}>
          <div style={{ width: device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '390px', maxWidth: '100%', transition: 'width 0.3s', position: 'relative', height: 'fit-content' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', overflow: 'hidden', borderRadius: 8 }}>
              <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%) rotate(-25deg)', fontSize: 13, fontWeight: 700, color: 'rgba(0,0,0,0.04)', letterSpacing: '0.3em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>websitegenerator24.de · Vorschau</div>
            </div>
            <iframe ref={iframeRef} style={{ width: '100%', minHeight: '85vh', border: 'none', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.12)', display: 'block', background: '#fff' }} />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ width: 250, borderLeft: '1px solid #e5e5e5', background: '#fff', overflowY: 'auto', flexShrink: 0, padding: 14 }}>
          {selected ? (
            <PropsPanel selected={selected} primary={primary} palette={palette} sendCmd={sendCmd} onClose={() => { sendCmd('deselect'); setSelected(null) }} onImageClick={() => { setImgTarget({ blockIdx: selected.block, key: selected.key }); setLastImgClick({ blockIdx: selected.block, key: selected.key }); fileRef.current?.click() }} onAIImage={() => { setAiPanel(true); setAiTab('images') }} onSectionBg={(opts) => setSectionBg(selected.block, opts)} sectionContent={selected.isSection ? pages[activePage]?.[selected.block]?.content : null} onSectionImageUpload={() => { setImgTarget({ blockIdx: selected.block, key: '__sectionBg' }); fileRef.current?.click() }} onSectionField={(fields) => setSectionField(selected.block, fields)} onParallax={(on, speed) => applySectionParallax(selected.block, on, speed)} onIconClick={() => setIconPicker({ blockIdx: selected.block, key: selected.key })} onSetRating={(r) => updateContent(selected.block, selected.key, r, true)} imageQuota={imageQuota} imagesUsed={imagesUsed} />
          ) : (
          <div>
          <div style={{ fontSize: 9, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Logo</div>
          <div style={{ marginBottom: 14 }}>
            <button onClick={() => { setImgTarget('logo'); fileRef.current?.click() }} style={{ width: '100%', border: '1px dashed #cbd5e1', background: '#fafbff', padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#475569', marginBottom: 6 }}>🖼 Header-Logo hochladen</button>
            <button onClick={() => { setImgTarget('logoFooter'); fileRef.current?.click() }} style={{ width: '100%', border: '1px dashed #cbd5e1', background: '#fafbff', padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#475569' }}>🖼 Footer-Logo (hell/invertiert)</button>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 6, lineHeight: 1.4 }}>Footer ist meist dunkel – lad dort eine helle Logo-Version hoch. Ohne Footer-Logo wird das Header-Logo automatisch aufgehellt.</div>
          </div>

          <div style={{ fontSize: 9, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>CI Hauptfarbe</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => updateColor(c)} style={{ width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer', outline: color === c ? `2px solid ${c}` : 'none', outlineOffset: 2, transform: color === c ? 'scale(1.15)' : 'scale(1)' }} />
            ))}
            <input type="color" value={color} onChange={e => updateColor(e.target.value)} style={{ width: 22, height: 22, borderRadius: '50%', border: '1px dashed #ccc', cursor: 'pointer', padding: 1 }} />
          </div>

          {/* Schrift live wechseln */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Schrift</div>
            <select value={font} onChange={e => { setFont(e.target.value); sessionStorage.setItem('wg24_font', e.target.value); if (projektIdRef.current) projektSpeichern(projektIdRef.current, { font: e.target.value }) }} style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 7, padding: '7px 9px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}>
              {FONT_PAIRS.map(p => <option key={p.id} value={p.body}>{p.label} ({p.headline})</option>)}
            </select>
          </div>

          {/* Hintergrund-Muster */}
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10, marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Hintergrund-Muster</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
              {PATTERNS.map(pat => (
                <div key={pat.id} onClick={() => applyPattern(pat)} style={{ border: `2px solid ${pagePattern === pat.id ? primary : '#e5e5e5'}`, borderRadius: 7, padding: '8px 6px', cursor: 'pointer', textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#555', background: pagePattern === pat.id ? primary + '0d' : '#fff' }}>{pat.label}</div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 10 }}>
            <div style={{ fontSize: 9, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>So bearbeitest du</div>
            {[['📝', 'Text anklicken → Toolbar'], ['🖼️', 'Bild anklicken → hochladen'], ['⟳', 'Layout-Variante wechseln'], ['⎘', 'Block duplizieren'], ['↑↓', 'Block verschieben'], ['↶', 'Rückgängig']].map(([ic, t]) => (
              <div key={t} style={{ display: 'flex', gap: 8, fontSize: 11, color: '#666', padding: '3px 0', alignItems: 'center' }}><span style={{ width: 18 }}>{ic}</span><span>{t}</span></div>
            ))}
          </div>

          {projektIdRef.current && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
              <button onClick={jetztSpeichern} style={{ width: '100%', border: 'none', background: primary, color: '#fff', padding: 9, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {speicherStatus === 'speichert' ? 'Speichert…' : 'Jetzt speichern'}
              </button>
              <div style={{ fontSize: 9.5, textAlign: 'center', marginTop: 6, minHeight: 13, color: speicherStatus === 'fehler' ? '#dc2626' : '#94a3b8', fontWeight: 600 }}>
                {speicherStatus === 'gespeichert' && '✓ In deinem Konto gespeichert'}
                {speicherStatus === 'speichert' && 'Änderungen werden gesichert…'}
                {speicherStatus === 'fehler' && 'Speichern fehlgeschlagen'}
                {speicherStatus === '' && 'Änderungen werden automatisch gesichert'}
              </div>
              <button onClick={() => router.push('/dashboard')} style={{ width: '100%', border: '1px solid #e5e5e5', background: '#fff', padding: 8, borderRadius: 7, fontSize: 10, fontWeight: 600, cursor: 'pointer', color: '#666', marginTop: 8 }}>← Meine Websites</button>
            </div>
          )}
          <button onClick={() => { if (confirm('Neu starten? Aktuelle Website geht verloren.')) { sessionStorage.clear(); router.push('/start') } }} style={{ width: '100%', border: '1px solid #e5e5e5', background: '#fff', padding: 8, borderRadius: 7, fontSize: 10, fontWeight: 600, cursor: 'pointer', color: '#666', marginTop: 12 }}>← Neu starten</button>
          </div>
          )}
        </div>
      </div>

      {/* BLOCK PICKER (Element hinzufügen mit Vorschau) */}
      {blockPicker && (
        <Modal onClose={() => setBlockPicker(null)} title={`${BLOCK_REGISTRY[blockPicker]?.label || 'Element'} hinzufügen`} sub="Wähle ein Design – wird an deine Farben & Inhalte angepasst">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {getVariants(blockPicker).map(v => {
              const previewHtml = renderPage({ blocks: [{ type: blockPicker, variant: v.id, content: buildDefaultContent(blockPicker) }], palette, font, fontHeadline, forEditor: true })
              return (
                <div key={v.id} onClick={() => { addBlock(blockPicker, v.id); setBlockPicker(null) }} style={{ border: '2px solid #e5e5e5', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = primary; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${primary}22` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
                  <div style={{ height: 200, overflow: 'hidden', background: '#fff', position: 'relative', borderBottom: '1px solid #f0f0f0' }}>
                    <iframe srcDoc={previewHtml} style={{ width: '285%', height: '570%', transform: 'scale(0.35)', transformOrigin: 'top left', border: 'none', pointerEvents: 'none' }} />
                  </div>
                  <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{v.name}</span>
                    <span style={{ background: primary, color: '#fff', borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 700 }}>+ Einfügen</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Modal>
      )}

      {/* VARIANT PICKER */}
      {variantPicker && (
        <Modal onClose={() => setVariantPicker(null)} title="Layout wählen" sub={`${BLOCK_REGISTRY[variantPicker.type]?.label} – deine Inhalte bleiben erhalten`}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
            {getVariants(variantPicker.type).map(v => {
              const curBlock = blocks[variantPicker.blockIdx]
              const isActive = curBlock?.variant === v.id
              const previewHtml = renderPage({ blocks: [{ type: variantPicker.type, variant: v.id, content: curBlock?.content || {} }], palette, font, fontHeadline })
              return (
                <div key={v.id} onClick={() => changeVariant(variantPicker.blockIdx, v.id)} style={{ border: `3px solid ${isActive ? primary : '#e5e5e5'}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ padding: '10px 14px', background: isActive ? primary : '#f9f9f9', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? '#fff' : '#111' }}>{v.name}</span>
                    {isActive && <span style={{ fontSize: 11, color: '#fff' }}>✓</span>}
                  </div>
                  <div style={{ height: 200, overflow: 'hidden', background: '#fff' }}>
                    <iframe srcDoc={previewHtml} style={{ width: '300%', height: '600%', transform: 'scale(0.333)', transformOrigin: 'top left', border: 'none', pointerEvents: 'none' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Modal>
      )}

      {/* ICON PICKER */}
      {iconPicker && (
        <Modal onClose={() => setIconPicker(null)} title="Icon wählen" sub="Klick auf ein Symbol – es ersetzt das aktuelle Icon">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(56px,1fr))', gap: 8 }}>
            {ICON_CHOICES.map(name => (
              <div key={name} onClick={() => setIconForBlock(iconPicker.blockIdx, iconPicker.key, name)} title={name} style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e5e5', borderRadius: 10, cursor: 'pointer', fontSize: 20, color: '#334155', background: '#fff' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = primary; e.currentTarget.style.color = primary; e.currentTarget.style.background = primary + '0d' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.color = '#334155'; e.currentTarget.style.background = '#fff' }}>
                <i className={`fa-solid fa-${name}`} />
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* AI PANEL (Floating) */}
      {aiPanel && (
        <AIPanel onClose={() => setAiPanel(false)} primary={primary} aiTab={aiTab} setAiTab={setAiTab} blocks={blocks} activePage={activePage} onImageGenerated={handleGeneratedImage} imageQuota={imageQuota} imagesUsed={imagesUsed} formDataRef={formDataRef} />
      )}

      {/* CUSTOM CODE EDITOR */}
      {customEditor !== null && (
        <Modal onClose={() => setCustomEditor(null)} title="Eigener Code" sub="HTML, CSS und JS – wird 1:1 eingefügt">
          <textarea defaultValue={blocks[customEditor]?.content?.html || ''} id="customCode" style={{ width: '100%', height: 300, fontFamily: 'monospace', fontSize: 13, border: '1px solid #e5e5e5', borderRadius: 8, padding: 12, boxSizing: 'border-box' }} placeholder="<div>Dein HTML hier...</div>" />
          <button onClick={() => saveCustom(customEditor, document.getElementById('customCode').value)} style={{ marginTop: 12, background: primary, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Speichern</button>
        </Modal>
      )}

      {/* DOMAIN FESTLEGEN */}
      {domainModal && (
        <Modal onClose={() => setDomainModal(false)} title="Domain festlegen" sub="Prüfen und übernehmen – erscheint danach dauerhaft oben in der Leiste">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: '2px solid #e5e5e5', borderRadius: 10, padding: '0 12px' }}>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>www.</span>
              <input value={domainWunsch} onChange={e => setDomainWunsch(e.target.value)} onKeyDown={e => e.key === 'Enter' && domainPruefen()} placeholder="deinefirma" style={{ flex: 1, border: 'none', outline: 'none', padding: '11px 4px', fontSize: 14, fontFamily: 'inherit' }} />
            </div>
            <button onClick={domainPruefen} disabled={domainLaedt} style={{ background: primary, color: '#fff', border: 'none', borderRadius: 10, padding: '0 20px', fontWeight: 700, fontSize: 13, cursor: domainLaedt ? 'wait' : 'pointer', fontFamily: 'inherit' }}>{domainLaedt ? 'Prüfe…' : 'Prüfen'}</button>
          </div>
          {domainDaten?.error && <div style={{ fontSize: 12.5, color: '#B4232A', marginBottom: 10 }}>{domainDaten.error}</div>}
          <div style={{ display: 'grid', gap: 7 }}>
            {(domainDaten?.ergebnisse || []).map(e => (
              <div key={e.domain} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #e5e5e5', borderRadius: 10, padding: '10px 13px', opacity: e.frei ? 1 : .55 }}>
                <i className={`fa-solid ${e.frei ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ color: e.frei ? '#1F9D55' : '#B4232A' }} />
                <span style={{ flex: 1, fontWeight: e.frei ? 700 : 500, fontSize: 13.5 }}>{e.domain}</span>
                {e.frei
                  ? <button onClick={() => domainWaehlen(e.domain)} style={{ background: primary, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Übernehmen</button>
                  : <span style={{ fontSize: 11.5, color: '#94a3b8' }}>vergeben</span>}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 12, lineHeight: 1.55 }}>Eine Domain pro Paket. Bei Miete ist sie inklusive – beim Kauf bringst du sie selbst mit.</div>
        </Modal>
      )}
    </div>
    </>
  )
}

// ── Modal ──
const menuBtn = { display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: '#334155', fontFamily: 'inherit' }

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  )
}

function Modal({ children, onClose, title, sub }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 820, width: '100%', maxHeight: '82vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div><h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>{title}</h3>{sub && <p style={{ fontSize: 13, color: '#888' }}>{sub}</p>}</div>
          <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── AI Designer Panel ──
function AIPanel({ onClose, primary, aiTab, setAiTab, blocks, activePage, onImageGenerated, imageQuota, imagesUsed, formDataRef }) {
  // SEO-Check aus vorhandenen Blöcken (KEIN API)
  const h1 = blocks.find(b => b.content?.headline)?.content?.headline || '–'
  const allText = JSON.stringify(blocks)
  const wordCount = (allText.match(/\w+/g) || []).length
  const hasContact = blocks.some(b => b.type === 'contact')
  const hasCTA = blocks.some(b => b.type === 'cta')

  const tabs = [['seo', '🔍 SEO'], ['headlines', '📝 Headlines'], ['cta', '🎯 CTA'], ['images', '🖼️ Bilder']]

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 500, width: 320, background: '#0f172a', borderRadius: 14, boxShadow: '0 12px 48px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>✨ AI Designer</span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 24, height: 24, borderRadius: 6, cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {tabs.map(([id, l]) => (
          <button key={id} onClick={() => setAiTab(id)} style={{ flex: 1, padding: '10px 4px', fontSize: 11, fontWeight: 600, background: aiTab === id ? 'rgba(255,255,255,0.1)' : 'none', border: 'none', color: aiTab === id ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', borderBottom: aiTab === id ? `2px solid ${primary}` : '2px solid transparent' }}>{l}</button>
        ))}
      </div>
      <div style={{ padding: 16, color: '#fff', maxHeight: 320, overflowY: 'auto' }}>
        {aiTab === 'seo' && (
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>SEO-Check (Seite: {activePage})</div>
            <SeoRow ok={h1 !== '–'} label="H1-Überschrift" val={h1.slice(0, 30)} />
            <SeoRow ok={wordCount > 100} label="Textlänge" val={`${wordCount} Wörter`} />
            <SeoRow ok={hasContact} label="Kontaktbereich" val={hasContact ? 'vorhanden' : 'fehlt'} />
            <SeoRow ok={hasCTA} label="Call-to-Action" val={hasCTA ? 'vorhanden' : 'fehlt'} />
            <div style={{ marginTop: 12, padding: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              💡 Alle Texte wurden bereits SEO-optimiert generiert. Du kannst sie direkt in der Vorschau anklicken und anpassen.
            </div>
          </div>
        )}
        {aiTab === 'headlines' && (
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Überschriften dieser Seite</div>
            {blocks.filter(b => b.content?.headline || b.content?.title).map((b, i) => (
              <div key={i} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: 7, marginBottom: 6, fontSize: 12 }}>
                <span style={{ fontSize: 9, color: primary, fontWeight: 700 }}>{b.content?.headline ? 'H1' : 'H2'}</span>
                <div style={{ marginTop: 2 }}>{b.content?.headline || b.content?.title}</div>
              </div>
            ))}
            <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Klick eine Überschrift in der Vorschau an, um sie zu ändern.</div>
          </div>
        )}
        {aiTab === 'cta' && (
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>CTA-Buttons & Phrasen</div>
            {['Jetzt Kontakt aufnehmen', 'Kostenloses Angebot', 'Termin vereinbaren', 'Mehr erfahren', 'Jetzt anfragen', 'Unverbindlich beraten lassen'].map(c => (
              <div key={c} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: 7, marginBottom: 6, fontSize: 12, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                onClick={() => navigator.clipboard?.writeText(c)}>
                <span>{c}</span><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>kopieren</span>
              </div>
            ))}
          </div>
        )}
        {aiTab === 'images' && (
          <ImageGenerator primary={primary} onImageGenerated={onImageGenerated} imageQuota={imageQuota} imagesUsed={imagesUsed} formDataRef={formDataRef} />
        )}
      </div>
      <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 10, color: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between' }}>
        <span>v3.0 · websitegenerator24</span>
      </div>
    </div>
  )
}

// ── Eigenschaften-Panel (Elementor-Stil) ──
function PropsPanel({ selected, primary, palette, sendCmd, onClose, onImageClick, onAIImage, onSectionBg, sectionContent, onSectionImageUpload, onSectionField, onParallax, onIconClick, onSetRating, imageQuota = 8, imagesUsed = 0 }) {
  const imgRest = Math.max(0, imageQuota - imagesUsed)
  const pp = palette?.primary || {}
  const ac = palette?.accent?.base || primary
  const gradPresets = [
    { label: 'Marke', css: `linear-gradient(135deg,${pp[700] || primary},${pp[500] || primary})` },
    { label: 'Marke dunkel', css: `linear-gradient(135deg,${pp[900] || '#0f172a'},${pp[700] || primary})` },
    { label: 'Akzent', css: `linear-gradient(135deg,${pp[600] || primary},${ac})` },
    { label: 'Sanft hell', css: `linear-gradient(135deg,${pp[50] || '#f8fafc'},${pp[200] || '#e2e8f0'})` },
    { label: 'Nacht', css: `linear-gradient(135deg,#0f172a,${pp[800] || '#1e293b'})` },
    { label: 'Sonnenuntergang', css: 'linear-gradient(135deg,#ff7e5f,#feb47b)' },
    { label: 'Ozean', css: 'linear-gradient(135deg,#2193b0,#6dd5ed)' },
    { label: 'Violett', css: 'linear-gradient(135deg,#7c3aed,#2563eb)' },
  ]
  const [g1, setG1] = useState(pp[700] || primary)
  const [g2, setG2] = useState(pp[400] || pp[300] || primary)
  const [gAngle, setGAngle] = useState(135)
  const [fontSize, setFontSize] = useState(selected.fontSize || 16)
  const [unit, setUnit] = useState('px')
  const [color, setColor] = useState(selected.color || '#000000')
  const [overlayColor, setOverlayColor] = useState('#0f172a')
  const [overlayOpacity, setOverlayOpacity] = useState(55)
  const [parallax, setParallax] = useState(sectionContent?.bgParallax || false)
  const selKey = (selected.block ?? '') + ':' + (selected.key || selected.tag || (selected.isSection ? 'section' : ''))

  useEffect(() => {
    setFontSize(selected.fontSize || 16)
    setColor(selected.color || '#000000')
    setUnit('px')
    setParallax(sectionContent?.bgParallax || false)
  }, [selKey])

  function hexToRgba(hex, opacity) {
    const h = hex.replace('#', '')
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r},${g},${b},${(opacity / 100).toFixed(2)})`
  }
  function applyOverlay(c, o, p) {
    onSectionBg({ overlay: hexToRgba(c, o), parallax: p })
  }

  const label = selected.isSection ? (selected.secName || 'Bereich') : selected.isStars ? 'Bewertung (Sterne)' : selected.isIcon ? 'Icon' : selected.isImg ? 'Bild' : selected.tag === 'h1' ? 'Überschrift H1' : selected.tag === 'a' || selected.tag === 'button' ? 'Button' : selected.tag?.startsWith('h') ? 'Überschrift' : selected.tag === 'p' ? 'Text' : 'Element'

  function applyFontSize(val, u) {
    setFontSize(val)
    const v = u === 'em' ? (val / 16).toFixed(2) + 'em' : val + 'px'
    sendCmd('fontSize', v)
  }

  const selectedIconName = (selected.iconName || '').replace('fa-', '')

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '2px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: primary + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{selected.isImg ? '🖼️' : 'T'}</div>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{label}</span>
        </div>
        <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#666' }}>✕</button>
      </div>

      {/* Element-Aktionen */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
        <button onClick={() => sendCmd('dupEl')} title="Duplizieren" style={{ flex: 1, padding: '8px 0', border: '1px solid #e5e5e5', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#475569' }}>⧉ Klonen</button>
        <button onClick={() => sendCmd('delEl')} title="Löschen" style={{ flex: 1, padding: '8px 0', border: '1px solid #fecaca', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#dc2626' }}>✕ Löschen</button>
      </div>

      {selected.isSection ? (
        <>
          <Section title="Aktueller Hintergrund">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 46, height: 32, borderRadius: 7, flexShrink: 0, boxShadow: '0 0 0 1px #e5e5e5', background: sectionContent?.bgImg ? `center/cover url(${sectionContent.bgImg})` : (sectionContent?.bgGradient || sectionContent?.bgColor || '#f1f5f9') }} />
              <div style={{ fontSize: 12, color: '#475569' }}>
                <div style={{ fontWeight: 700 }}>{sectionContent?.bgImg ? 'Bild' : sectionContent?.bgGradient ? 'Farbverlauf' : sectionContent?.bgColor ? 'Farbe' : 'Standard'}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {sectionContent?.bgPattern && sectionContent.bgPattern !== 'none' ? `Muster: ${sectionContent.bgPattern}` : 'kein Muster'}
                  {sectionContent?.bgParallax ? ' · Parallax an' : ''}
                </div>
              </div>
            </div>
          </Section>
          <Section title="Hintergrundbild">
            {sectionContent?.bgImg && <img src={sectionContent.bgImg} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
            <button onClick={onSectionImageUpload} style={{ width: '100%', background: primary, color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 6, fontFamily: 'inherit' }}><i className="fa-solid fa-image" style={{ marginRight: 6 }} />Bild hochladen</button>
            <button onClick={onAIImage} style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 6 }}><i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 6 }} />KI-Bild generieren</button>
            {sectionContent?.bgImg && <button onClick={() => onSectionField({ bgImg: '' })} style={{ width: '100%', background: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '8px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}><i className="fa-solid fa-trash" style={{ marginRight: 6 }} />Foto entfernen</button>}
          </Section>

          {sectionContent?.bgImg && (
            <Section title="Overlay (Abdunkelung)">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                <input type="color" value={overlayColor} onChange={e => { setOverlayColor(e.target.value); applyOverlay(e.target.value, overlayOpacity, parallax) }} style={{ width: 40, height: 34, borderRadius: 7, border: '1px solid #e5e5e5', cursor: 'pointer', padding: 2 }} />
                <span style={{ fontSize: 12, color: '#64748b' }}>Deckkraft: {overlayOpacity}%</span>
              </div>
              <input type="range" min="0" max="90" value={overlayOpacity} onChange={e => { const v = parseInt(e.target.value); setOverlayOpacity(v); applyOverlay(overlayColor, v, parallax) }} style={{ width: '100%', accentColor: primary }} />
            </Section>
          )}

          <Section title="Farbverlauf">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 10 }}>
              {gradPresets.map(g => (
                <div key={g.label} title={g.label} onClick={() => onSectionField({ bgGradient: g.css, bgImg: '', bgColor: '' })} style={{ height: 34, borderRadius: 7, cursor: 'pointer', background: g.css, border: `2px solid ${sectionContent?.bgGradient === g.css ? primary : 'transparent'}`, boxShadow: '0 0 0 1px #e5e5e5' }} />
              ))}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>Eigener Verlauf</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <input type="color" value={g1} onChange={e => setG1(e.target.value)} style={{ width: 36, height: 32, borderRadius: 6, border: '1px solid #e5e5e5', cursor: 'pointer', padding: 2 }} />
              <input type="color" value={g2} onChange={e => setG2(e.target.value)} style={{ width: 36, height: 32, borderRadius: 6, border: '1px solid #e5e5e5', cursor: 'pointer', padding: 2 }} />
              <div style={{ flex: 1, height: 32, borderRadius: 6, background: `linear-gradient(${gAngle}deg,${g1},${g2})`, boxShadow: '0 0 0 1px #e5e5e5' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>Winkel {gAngle}°</span>
              <input type="range" min="0" max="360" value={gAngle} onChange={e => setGAngle(parseInt(e.target.value))} style={{ flex: 1, accentColor: primary }} />
            </div>
            <button onClick={() => onSectionField({ bgGradient: `linear-gradient(${gAngle}deg,${g1},${g2})`, bgImg: '', bgColor: '' })} style={{ width: '100%', background: primary, color: '#fff', border: 'none', borderRadius: 7, padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 6 }}>Verlauf anwenden</button>
            {sectionContent?.bgGradient && <button onClick={() => onSectionField({ bgGradient: '' })} style={{ width: '100%', background: '#fff', color: '#64748b', border: '1px solid #e5e5e5', borderRadius: 7, padding: '6px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Verlauf entfernen</button>}
          </Section>

          <Section title="Farbe">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={sectionContent?.bgColor || '#ffffff'} onChange={e => onSectionField({ bgColor: e.target.value, bgImg: '', bgGradient: '' })} style={{ width: 40, height: 36, borderRadius: 7, border: '1px solid #e5e5e5', cursor: 'pointer', padding: 2 }} />
              <span style={{ fontSize: 12, color: '#64748b' }}>Einfarbiger Hintergrund</span>
            </div>
          </Section>

          <Section title="Muster (über allem)">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
              {SECTION_PATTERNS.map(p => {
                const active = (sectionContent?.bgPattern || 'none') === p.id
                return <div key={p.id} onClick={() => onSectionField({ bgPattern: p.id })} style={{ border: `2px solid ${active ? primary : '#e5e5e5'}`, borderRadius: 7, padding: '7px 4px', cursor: 'pointer', textAlign: 'center', fontSize: 10, fontWeight: 600, color: '#555', background: active ? primary + '0d' : '#fff' }}>{p.label}</div>
              })}
            </div>
          </Section>

          {sectionContent?.bgImg && (
            <Section title="Bild-Darstellung">
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {[['cover', 'Füllend'], ['contain', 'Einpassen']].map(([v, l]) => {
                  const active = (sectionContent?.bgSize || 'cover') === v
                  return <div key={v} onClick={() => onSectionField({ bgSize: v })} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', border: `2px solid ${active ? primary : '#e5e5e5'}`, borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#475569', background: active ? primary + '0d' : '#fff' }}>{l}</div>
                })}
              </div>
              <div onClick={() => onParallax(!sectionContent?.bgParallax, sectionContent?.bgParallaxSpeed ?? 0.3)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `2px solid ${sectionContent?.bgParallax ? primary : '#e5e5e5'}`, borderRadius: 8, cursor: 'pointer', background: sectionContent?.bgParallax ? primary + '0d' : '#fff', marginBottom: 10 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${sectionContent?.bgParallax ? primary : '#ccc'}`, background: sectionContent?.bgParallax ? primary : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11 }}>{sectionContent?.bgParallax ? '✓' : ''}</div>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>Parallax-Effekt</div><div style={{ fontSize: 11, color: '#94a3b8' }}>Bild bewegt sich beim Scrollen</div></div>
              </div>
              {sectionContent?.bgParallax && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}><span>Geschwindigkeit</span><span style={{ fontWeight: 700, color: primary }}>{(sectionContent?.bgParallaxSpeed ?? 0.3).toFixed(1)}</span></div>
                  <input type="range" min="-1" max="1" step="0.1" value={sectionContent?.bgParallaxSpeed ?? 0.3} onChange={e => onParallax(true, parseFloat(e.target.value))} style={{ width: '100%', accentColor: primary }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#cbd5e1' }}><span>−1.0</span><span>0</span><span>+1.0</span></div>
                </div>
              )}
            </Section>
          )}
          <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>💡 Klick auf einzelne Elemente (Text, Icons, Buttons) im Bereich, um sie separat zu bearbeiten.</div>
        </>
      ) : selected.isStars ? (
        <Section title="Sterne-Bewertung">
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => onSetRating(n)} title={`${n} Sterne`} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: n <= (selected.rating || 5) ? '#f59e0b' : '#cbd5e1', padding: 0 }}>
                <i className="fa-solid fa-star" />
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>{selected.rating || 5} von 5 Sternen</div>
        </Section>
      ) : selected.isIcon ? (
        <Section title="Icon">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, padding: '10px', border: '1px solid #e5e5e5', borderRadius: 8 }}>
            <i className={`fa-solid ${selected.iconName || 'fa-star'}`} style={{ fontSize: 22, color: primary }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>{selectedIconName || 'Icon'}</span>
          </div>
          <button onClick={onIconClick} style={{ width: '100%', background: primary, color: '#fff', border: 'none', borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Anderes Icon wählen</button>
        </Section>
      ) : selected.isImg ? (
        <Section title="Bild">
          <button onClick={onImageClick} style={{ width: '100%', background: primary, color: '#fff', border: 'none', borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 8, fontFamily: 'inherit' }}><i className="fa-solid fa-arrow-up-from-bracket" style={{ marginRight: 6 }} />Bild hochladen</button>
          <button onClick={onAIImage} style={{ width: '100%', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff', border: 'none', borderRadius: 8, padding: '11px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}><i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 6 }} />KI-Bild generieren</button>
          <div style={{ fontSize: 11, color: imgRest > 0 ? '#16a34a' : '#f59e0b', fontWeight: 700, textAlign: 'center', marginTop: 8 }}>{imgRest} von {imageQuota} KI-Bildern frei</div>
        </Section>
      ) : (
        <>
          <Section title="Ausrichtung">
            <div style={{ display: 'flex', gap: 4 }}>
              {[['left', '⬅', 'Links'], ['center', '⬛', 'Mitte'], ['right', '➡', 'Rechts'], ['justify', '☰', 'Blocksatz']].map(([val, ic, t]) => (
                <button key={val} title={t} onClick={() => sendCmd('align', val)} style={{ flex: 1, padding: '9px 0', border: `1px solid ${selected.align === val ? primary : '#e5e5e5'}`, borderRadius: 7, background: selected.align === val ? primary + '0d' : '#fff', cursor: 'pointer', fontSize: 13 }}>{ic}</button>
              ))}
            </div>
          </Section>

          <Section title="Stil">
            <div style={{ display: 'flex', gap: 4 }}>
              {[['bold', 'B', { fontWeight: 800 }], ['italic', 'I', { fontStyle: 'italic' }], ['underline', 'U', { textDecoration: 'underline' }]].map(([cmd, ic, st]) => (
                <button key={cmd} onClick={() => sendCmd(cmd)} style={{ flex: 1, padding: '9px 0', border: '1px solid #e5e5e5', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 14, ...st }}>{ic}</button>
              ))}
            </div>
          </Section>

          <Section title="Schriftgröße">
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
              <input type="number" value={fontSize} onChange={e => applyFontSize(parseInt(e.target.value) || 16, unit)} style={{ width: 60, border: '1px solid #e5e5e5', borderRadius: 7, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
              <div style={{ display: 'flex', border: '1px solid #e5e5e5', borderRadius: 7, overflow: 'hidden' }}>
                {['px', 'em'].map(u => (
                  <button key={u} onClick={() => { setUnit(u); applyFontSize(fontSize, u) }} style={{ padding: '8px 12px', border: 'none', background: unit === u ? primary : '#fff', color: unit === u ? '#fff' : '#666', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>{u}</button>
                ))}
              </div>
            </div>
            <input type="range" min="10" max="80" value={fontSize} onChange={e => applyFontSize(parseInt(e.target.value), unit)} style={{ width: '100%', accentColor: primary }} />
          </Section>

          <Section title="Textfarbe">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={color} onChange={e => { setColor(e.target.value); sendCmd('color', e.target.value) }} style={{ width: 40, height: 36, borderRadius: 7, border: '1px solid #e5e5e5', cursor: 'pointer', padding: 2 }} />
              <input type="text" value={color} onChange={e => { setColor(e.target.value); sendCmd('color', e.target.value) }} style={{ flex: 1, border: '1px solid #e5e5e5', borderRadius: 7, padding: '8px 10px', fontSize: 13, fontFamily: 'monospace', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 8, flexWrap: 'wrap' }}>
              {['#000000', '#ffffff', primary, '#64748b', '#dc2626', '#16a34a', '#ca8a04'].map(c => (
                <div key={c} onClick={() => { setColor(c); sendCmd('color', c) }} style={{ width: 24, height: 24, borderRadius: 6, background: c, cursor: 'pointer', border: '1px solid #e5e5e5' }} />
              ))}
            </div>
          </Section>

          <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>💡 Doppelklick auf den Text in der Vorschau, um ihn direkt zu bearbeiten.</div>
        </>
      )}
    </div>
  )
}

function SeoRow({ ok, label, val }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 12 }}>
      <span style={{ color: ok ? '#22c55e' : '#f59e0b' }}>{ok ? '✓' : '!'}</span>
      <span style={{ flex: 1, color: 'rgba(255,255,255,0.8)' }}>{label}</span>
      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{val}</span>
    </div>
  )
}

// ── KI-Bild-Generator (DALL-E 3) ──
function ImageGenerator({ primary, onImageGenerated, imageQuota, imagesUsed, formDataRef }) {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('landscape')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)

  const fd = formDataRef?.current || {}
  const rest = Math.max(0, imageQuota - imagesUsed)

  // Branchen-Vorschläge
  const branche = fd.branche || ''
  const stadt = fd.stadt || ''
  const VORSCHLAEGE = {
    restaurant: ['Modernes Restaurant-Interieur mit warmer Beleuchtung', 'Appetitliches Gericht auf elegantem Teller', 'Gemütliche Café-Atmosphäre mit Holzmöbeln'],
    salon: ['Modernes Friseur-Studio hell und stilvoll', 'Entspannte Beauty-Behandlung', 'Elegante Salon-Einrichtung'],
    fitness: ['Modernes Fitnessstudio mit Geräten', 'Person beim Krafttraining', 'Helle Gruppenkursfläche'],
    anwalt: ['Seriöses Anwaltsbüro mit Bücherregal', 'Professionelle Beratungssituation', 'Moderne Kanzlei-Empfang'],
    praxis: ['Moderne helle Arztpraxis', 'Freundlicher Empfangsbereich Praxis', 'Behandlungsraum sauber und modern'],
    handwerk: ['Handwerker bei der Arbeit', 'Werkzeuge professionell arrangiert', 'Moderne Baustelle'],
    immobilien: ['Modernes Wohnhaus von außen', 'Helle stilvolle Wohnung innen', 'Immobilienmakler vor Haus'],
    agentur: ['Modernes kreatives Büro', 'Team bei Meeting', 'Arbeitsplatz mit Laptop'],
    fahrschule: ['Modernes Fahrschulauto', 'Fahrlehrer mit Schüler im Auto', 'Theorieraum einer Fahrschule'],
    andere: ['Professionelles Business-Umfeld', 'Moderne Arbeitsatmosphäre', 'Freundliches Team'],
  }
  const vorschlaege = VORSCHLAEGE[branche] || VORSCHLAEGE.andere

  async function generate() {
    if (!prompt.trim()) { setError('Bitte beschreibe das Bild'); return }
    if (rest <= 0) { setError('Dein Bild-Kontingent ist aufgebraucht'); return }
    setLoading(true); setError(null); setPreview(null)
    try {
      const res = await fetch('/api/image', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, size }) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPreview(data.image)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  function einsetzen() {
    if (!preview) return
    onImageGenerated(preview)
    setPreview(null); setPrompt('')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>KI-Bilder</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: rest > 0 ? '#22c55e' : '#f59e0b' }}>{rest} / {imageQuota} übrig</span>
      </div>

      {preview ? (
        <div>
          <img src={preview} alt="Vorschau" style={{ width: '100%', borderRadius: 8, marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={einsetzen} style={{ flex: 1, background: primary, color: '#fff', border: 'none', borderRadius: 7, padding: '9px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>✓ Einsetzen</button>
            <button onClick={() => setPreview(null)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 7, padding: '9px 12px', fontSize: 12, cursor: 'pointer' }}>Verwerfen</button>
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Klick vorher in der Vorschau auf den Bildbereich, wo das Bild hin soll.</div>
        </div>
      ) : (
        <>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Beschreibe das gewünschte Bild..." rows={3} style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: 10, fontSize: 12, color: '#fff', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box', marginBottom: 8 }} />

          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Vorschläge für deine Branche:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
            {vorschlaege.map(v => (
              <div key={v} onClick={() => setPrompt(stadt ? `${v}, ${stadt}` : v)} style={{ padding: '6px 9px', background: 'rgba(255,255,255,0.06)', borderRadius: 6, fontSize: 11, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>+ {v}</div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
            {[['landscape', 'Quer'], ['square', 'Quadrat'], ['portrait', 'Hoch']].map(([id, l]) => (
              <button key={id} onClick={() => setSize(id)} style={{ flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer', background: size === id ? primary : 'rgba(255,255,255,0.1)', color: '#fff' }}>{l}</button>
            ))}
          </div>

          {error && <div style={{ fontSize: 11, color: '#f87171', marginBottom: 8 }}>{error}</div>}

          <button onClick={generate} disabled={loading || rest <= 0} style={{ width: '100%', background: rest <= 0 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#7c3aed,#2563eb)', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', fontSize: 13, fontWeight: 700, cursor: loading || rest <= 0 ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? '✨ Wird generiert...' : rest <= 0 ? 'Kontingent aufgebraucht' : '✨ Bild generieren'}
          </button>
        </>
      )}
    </div>
  )
}

function buildDefaultContent(type) {
  const d = {
    ...ZUSATZ_DEFAULTS,
    'hero-full': { tag: 'Willkommen', headline: 'Deine Überschrift', subline: 'Beschreibe dein Angebot.', cta1: 'Kontakt', cta2: 'Mehr', stats: [{ num: '10+', label: 'Jahre' }, { num: '200+', label: 'Kunden' }, { num: '100%', label: 'Qualität' }] },
    'header-slim': { tag: 'Seite', headline: 'Seitentitel', subline: 'Beschreibung.' },
    services: { tag: 'Leistungen', title: 'Was wir bieten', subtitle: 'Überblick.', items: [{ icon: '⚡', title: 'Leistung 1', text: 'Beschreibung.' }, { icon: '🎯', title: 'Leistung 2', text: 'Beschreibung.' }, { icon: '🤝', title: 'Leistung 3', text: 'Beschreibung.' }] },
    steps: { tag: 'Ablauf', title: 'So funktioniert es', subtitle: 'In wenigen Schritten zum Ziel.', steps: [{ icon: 'phone', title: 'Kontakt', text: 'Du meldest dich bei uns.' }, { icon: 'comments', title: 'Beratung', text: 'Wir besprechen dein Anliegen.' }, { icon: 'circle-check', title: 'Umsetzung', text: 'Wir erledigen den Rest.' }] },
    pricing: { tag: 'Preise', title: 'Unsere Pakete', subtitle: 'Transparent und fair.', plans: [{ name: 'Basis', price: '49 €', period: '/ Monat', features: ['Leistung A', 'Leistung B', 'E-Mail Support'], cta: 'Auswählen', featured: false }, { name: 'Profi', price: '99 €', period: '/ Monat', badge: 'Beliebt', features: ['Alles aus Basis', 'Leistung C', 'Priorisierter Support', 'Monatlicher Report'], cta: 'Auswählen', featured: true }, { name: 'Premium', price: '199 €', period: '/ Monat', features: ['Alles aus Profi', 'Persönlicher Ansprechpartner', '24/7 Support'], cta: 'Auswählen', featured: false }] },
    logos: { title: 'Vertraut von führenden Unternehmen', logos: ['Firma Eins', 'Beispiel GmbH', 'Muster AG', 'Partner Co', 'Acme'] },
    about: { tag: 'Über uns', title: 'Wer wir sind', text1: 'Absatz 1.', text2: 'Absatz 2.', stats: [{ num: '15+', label: 'Jahre' }, { num: '500+', label: 'Kunden' }, { num: '98%', label: 'Zufrieden' }, { num: '24/7', label: 'Support' }] },
    team: { tag: 'Team', title: 'Unser Team', members: [{ name: 'Max Mustermann', role: 'Geschäftsführer', bio: 'Bio.', img: '' }, { name: 'Lisa Schmidt', role: 'Beraterin', bio: 'Bio.', img: '' }, { name: 'Tom Berg', role: 'Experte', bio: 'Bio.', img: '' }] },
    testimonials: { title: 'Was Kunden sagen', items: [{ quote: 'Top!', name: 'Anna K.', role: 'Kundin' }, { quote: 'Sehr gut.', name: 'Peter M.', role: 'Kunde' }, { quote: 'Empfehlung.', name: 'Sara L.', role: 'Kundin' }] },
    stats: { items: [{ num: '15+', label: 'Jahre' }, { num: '500+', label: 'Kunden' }, { num: '98%', label: 'Zufrieden' }, { num: '24/7', label: 'Support' }] },
    cta: { title: 'Bereit loszulegen?', subtitle: 'Kontaktiere uns.', cta1: 'Jetzt anfragen', telefon: '+49 30 1234567' },
    gallery: { title: 'Galerie', images: ['', '', '', '', '', ''] },
    image: { image: '', image2: '', caption: '' },
    faq: { title: 'Häufige Fragen', items: [{ q: 'Frage 1?', a: 'Antwort.' }, { q: 'Frage 2?', a: 'Antwort.' }, { q: 'Frage 3?', a: 'Antwort.' }] },
    contact: { tag: 'Kontakt', title: 'Sprich uns an', subtitle: 'Wir freuen uns.', adresse: 'Musterstr. 1, Berlin', telefon: '+49 30 1234567', email: 'info@beispiel.de', oeffnung: 'Mo-Fr: 9-18 Uhr' },
    menu: { tag: 'Speisekarte', title: 'Unsere Speisekarte', kategorien: [{ name: 'Vorspeisen', items: [{ name: 'Bruschetta', desc: 'Geröstetes Brot mit Tomaten', preis: '6,90 €' }, { name: 'Caprese', desc: 'Tomate, Mozzarella, Basilikum', preis: '8,50 €' }] }, { name: 'Hauptgerichte', items: [{ name: 'Pasta Carbonara', desc: 'Mit Speck und Ei', preis: '12,90 €' }, { name: 'Pizza Margherita', desc: 'Klassisch italienisch', preis: '9,90 €' }] }] },
    custom: { html: '' },
  }
  return d[type] || {}
}
