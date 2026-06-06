'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { renderPage } from '@/lib/blockRenderer'
import { getVariants, ADDABLE_BLOCKS, BLOCK_REGISTRY } from '@/lib/blocks'
import { generateCIPalette } from '@/lib/colorSystem'
import { FONT_PAIRS } from '@/lib/fonts'

const COLORS = ['#111827','#1e3a5f','#1d4ed8','#0891b2','#0f766e','#16a34a','#ca8a04','#c2410c','#dc2626','#e11d48','#9333ea','#7c3aed']

// Hintergrund-Muster für Design-Elemente
const PATTERNS = [
  { id: 'none', label: 'Keins', css: '' },
  { id: 'dots', label: 'Punkte', css: 'background-image:radial-gradient(circle,rgba(0,0,0,0.08) 1px,transparent 1px);background-size:20px 20px;' },
  { id: 'grid', label: 'Raster', css: 'background-image:linear-gradient(rgba(0,0,0,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.05) 1px,transparent 1px);background-size:24px 24px;' },
  { id: 'diagonal', label: 'Linien', css: 'background-image:repeating-linear-gradient(45deg,transparent,transparent 12px,rgba(0,0,0,0.03) 12px,rgba(0,0,0,0.03) 13px);' },
]

export default function EditorPage() {
  const router = useRouter()
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
  const formDataRef = useRef({})
  const [expandedBlock, setExpandedBlock] = useState(null) // welcher Block in der Liste aufgeklappt ist

  // Undo/Redo Historie
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const initialRef = useRef(null)

  // Modals
  const [variantPicker, setVariantPicker] = useState(null)
  const [imgTarget, setImgTarget] = useState(null)
  const [aiPanel, setAiPanel] = useState(false)
  const [aiTab, setAiTab] = useState('seo')
  const [customEditor, setCustomEditor] = useState(null)

  const iframeRef = useRef(null)
  const fileRef = useRef(null)

  // ── Laden ──
  useEffect(() => {
    const p = sessionStorage.getItem('wg24_pages')
    const pal = sessionStorage.getItem('wg24_palette')
    const f = sessionStorage.getItem('wg24_font')
    const fd = sessionStorage.getItem('wg24_formData')
    if (!p) { router.push('/'); return }
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
    const html = renderPage({ blocks, palette, font, fontHeadline, title: activePage, forEditor: true })
    iframeRef.current.srcdoc = injectEditor(injectPattern(html))
  }, [renderKey, activePage, palette, font, fontHeadline, pagePattern])

  function applyPattern(pat) {
    setPagePattern(pat.id)
  }

  function injectPattern(html) {
    const pat = PATTERNS.find(p => p.id === pagePattern)
    if (!pat || !pat.css) return html
    const patternCss = `<style id="wg-pattern">body{position:relative;}body::before{content:'';position:fixed;inset:0;z-index:-1;pointer-events:none;${pat.css}}</style>`
    return html.replace('</head>', patternCss + '</head>')
  }

  function injectEditor(html) {
    const css = `<style id="wg-ed">
      [data-edit]{cursor:text;transition:outline 0.12s;border-radius:3px;}
      [data-edit]:hover{outline:2px dashed ${primary}88;outline-offset:2px;}
      [data-edit]:focus{outline:2px solid ${primary};outline-offset:2px;background:${primary}0a;}
      [data-img]{cursor:pointer;position:relative;transition:outline 0.12s;}
      [data-img]:hover{outline:3px solid ${primary};outline-offset:-3px;}
      [data-block]{position:relative;transition:outline 0.12s;}
      [data-block]:hover{outline:2px solid ${primary}44;outline-offset:-2px;}
      .wg-bc{position:absolute;top:10px;right:10px;z-index:99999;display:none;gap:5px;}
      [data-block]:hover .wg-bc{display:flex;}
      .wg-b{width:30px;height:30px;border:none;border-radius:7px;background:rgba(15,23,42,0.88);color:#fff;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
      .wg-b:hover{background:${primary};transform:scale(1.1);}
      .wg-b.del:hover{background:#dc2626;}
      .wg-tb{position:fixed;z-index:999999;background:#0f172a;border-radius:9px;padding:5px;display:none;gap:3px;box-shadow:0 6px 24px rgba(0,0,0,0.35);}
      .wg-tb button{background:none;border:none;color:#fff;cursor:pointer;width:30px;height:28px;border-radius:6px;font-size:13px;display:flex;align-items:center;justify-content:center;}
      .wg-tb button:hover{background:rgba(255,255,255,0.18);}
      .wg-tb button.on{background:${primary};}
      .wg-tb .sep{width:1px;background:rgba(255,255,255,0.2);margin:2px 1px;}
    </style>`

    const js = `<script>(function(){
      if(window.__wgE)return;window.__wgE=1;
      var activeEl=null;

      // Toolbar bauen
      var tb=document.createElement('div');tb.className='wg-tb';
      tb.innerHTML='<button data-c="bold" title="Fett"><b>B</b></button><button data-c="italic" title="Kursiv"><i>I</i></button><button data-c="underline" title="Unterstrichen"><u>U</u></button><div class="sep"></div><button data-a="left" title="Links">⬅</button><button data-a="center" title="Mitte">⬛</button><button data-a="right" title="Rechts">➡</button><div class="sep"></div><button data-s="up" title="Größer">A+</button><button data-s="down" title="Kleiner">A-</button>';
      document.body.appendChild(tb);

      tb.querySelectorAll('button').forEach(function(b){
        b.addEventListener('mousedown',function(e){
          e.preventDefault();
          if(!activeEl)return;
          activeEl.contentEditable=true;
          if(b.dataset.c){
            // Wenn nichts markiert: ganzes Element markieren
            var sel=window.getSelection();
            if(sel.isCollapsed){
              var range=document.createRange();
              range.selectNodeContents(activeEl);
              sel.removeAllRanges();sel.addRange(range);
            }
            document.execCommand('styleWithCSS',false,true);
            document.execCommand(b.dataset.c,false,null);
          }
          if(b.dataset.a)activeEl.style.textAlign=b.dataset.a;
          if(b.dataset.s){
            var cur=parseInt(window.getComputedStyle(activeEl).fontSize)||16;
            activeEl.style.fontSize=(b.dataset.s==='up'?cur+2:Math.max(10,cur-2))+'px';
          }
          saveEdit(activeEl);
        });
      });

      function showTB(el){
        var r=el.getBoundingClientRect();
        tb.style.display='flex';
        tb.style.top=Math.max(8,r.top-44)+'px';
        tb.style.left=Math.max(8,r.left)+'px';
      }
      function hideTB(){tb.style.display='none';}

      // editable text
      document.querySelectorAll('[data-edit]').forEach(function(el){
        el.addEventListener('click',function(e){
          e.stopPropagation();
          if(activeEl&&activeEl!==this){activeEl.contentEditable=false;}
          this.contentEditable=true;this.focus();activeEl=this;showTB(this);
        });
        el.addEventListener('blur',function(){saveEdit(this);});
        el.addEventListener('keydown',function(e){if(e.key==='Enter'&&this.tagName!=='TEXTAREA'&&!e.shiftKey){e.preventDefault();this.blur();hideTB();}});
      });
      function saveEdit(el){
        parent.postMessage({t:'edit',key:el.dataset.edit,val:el.innerHTML,align:el.style.textAlign,fs:el.style.fontSize,block:bIdx(el)},'*');
      }

      // images
      document.querySelectorAll('[data-img]').forEach(function(el){
        el.addEventListener('click',function(e){e.stopPropagation();parent.postMessage({t:'img',key:this.dataset.img,block:bIdx(this)},'*');});
      });

      // block controls
      document.querySelectorAll('[data-block]').forEach(function(el,i){
        var type=el.dataset.block;
        if(type==='nav'||type==='footer')return;
        var bc=document.createElement('div');bc.className='wg-bc';
        bc.innerHTML='<button class="wg-b" data-x="var" title="Layout">⟳</button><button class="wg-b" data-x="up" title="Hoch">↑</button><button class="wg-b" data-x="down" title="Runter">↓</button><button class="wg-b" data-x="dup" title="Duplizieren">⎘</button><button class="wg-b del" data-x="del" title="Löschen">✕</button>';
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

      document.addEventListener('click',function(e){
        if(!e.target.closest('[data-edit]')&&activeEl){activeEl.contentEditable=false;activeEl=null;hideTB();}
      });
      document.addEventListener('scroll',function(){if(activeEl)showTB(activeEl);},true);
    })();</script>`

    return html.replace('</head>', css + '</head>').replace('</body>', js + '</body>')
  }

  // ── Messages aus iframe ──
  useEffect(() => {
    function onMsg(e) {
      const d = e.data
      if (!d?.t) return
      if (d.t === 'edit') updateContent(d.block, d.key, d.val, false)
      if (d.t === 'img') { setImgTarget({ blockIdx: d.block, key: d.key }); setLastImgClick({ blockIdx: d.block, key: d.key }); fileRef.current?.click() }
      if (d.t === 'variant') setVariantPicker({ blockIdx: d.block, type: d.type })
      if (d.t === 'move') moveBlock(d.block, d.dir)
      if (d.t === 'del') delBlock(d.block)
      if (d.t === 'dup') dupBlock(d.block)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [activePage, pages, histIdx, history])

  // ── Content-Operationen ──
  function updateContent(blockIdx, key, val, isImage = false) {
    const next = { ...pages }
    const arr = [...next[activePage]]
    const block = { ...arr[blockIdx] }
    const content = { ...block.content }

    if (key.startsWith('svc_title_') || key.startsWith('svc_text_')) {
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: '"Inter Tight",sans-serif', fontSize: 13 }}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* TOPBAR */}
      <div style={{ height: 50, borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 8, flexShrink: 0, background: '#fff' }}>
        <b style={{ fontSize: 14, letterSpacing: -0.5 }}>websitegenerator24<span style={{ color: '#aaa', fontWeight: 400 }}>.de</span></b>
        <span style={{ color: '#ddd' }}>|</span>
        <span style={{ color: '#666', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blocks.find(b => b.type === 'nav')?.content?.firmenname}</span>

        {/* Undo/Redo */}
        <div style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
          <button onClick={undo} disabled={histIdx <= 0} title="Rückgängig" style={{ width: 32, height: 30, border: '1px solid #e5e5e5', borderRadius: 7, background: '#fff', cursor: histIdx <= 0 ? 'not-allowed' : 'pointer', opacity: histIdx <= 0 ? 0.35 : 1, fontSize: 15 }}>↶</button>
          <button onClick={redo} disabled={histIdx >= history.length - 1} title="Wiederholen" style={{ width: 32, height: 30, border: '1px solid #e5e5e5', borderRadius: 7, background: '#fff', cursor: histIdx >= history.length - 1 ? 'not-allowed' : 'pointer', opacity: histIdx >= history.length - 1 ? 0.35 : 1, fontSize: 15 }}>↷</button>
          <button onClick={resetAll} title="Alles zurücksetzen" style={{ width: 32, height: 30, border: '1px solid #e5e5e5', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 13 }}>⟲</button>
        </div>

        <div style={{ flex: 1 }} />
        {[['🖥','desktop'],['📱','tablet'],['📲','mobile']].map(([ic, d]) => (
          <button key={d} onClick={() => setDevice(d)} style={{ width: 30, height: 30, border: `1px solid ${device === d ? primary : '#e5e5e5'}`, borderRadius: 7, background: device === d ? '#f5f5f5' : '#fff', cursor: 'pointer', fontSize: 14 }}>{ic}</button>
        ))}
        <div style={{ width: 1, height: 18, background: '#e5e5e5', margin: '0 4px' }} />
        <button onClick={() => setAiPanel(o => !o)} style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', border: 'none', borderRadius: 7, padding: '6px 12px', cursor: 'pointer' }}>✨ AI Designer</button>
        <button onClick={() => alert('Checkout kommt bald!')} style={{ background: primary, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Kaufen & Download →</button>
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
            {[['Blöcke', 'blocks'], ['Seiten', 'pages']].map(([l, id]) => (
              <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '9px 0', fontSize: 10, fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none', borderBottom: `2px solid ${tab === id ? primary : 'transparent'}`, color: tab === id ? '#111' : '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {tab === 'blocks' && (
              <>
                <div style={{ fontSize: 9, color: '#bbb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 4px', marginBottom: 4 }}>Block hinzufügen – Layout wählen</div>
                {ADDABLE_BLOCKS.filter(b => !b.nurBranche || b.nurBranche.includes(formDataRef.current?.branche)).map(b => {
                  const variants = getVariants(b.type)
                  const isOpen = expandedBlock === b.type
                  return (
                    <div key={b.type} style={{ marginBottom: 4 }}>
                      <div onClick={() => setExpandedBlock(isOpen ? null : b.type)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', border: `1px solid ${isOpen ? primary : '#e5e5e5'}`, borderRadius: 8, cursor: 'pointer', background: isOpen ? primary + '0a' : '#fff', transition: 'all 0.1s' }}>
                        <span style={{ fontSize: 17 }}>{b.emoji}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{b.label}</span>
                        <span style={{ marginLeft: 'auto', color: '#aaa', fontSize: 12, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>›</span>
                      </div>
                      {isOpen && (
                        <div style={{ padding: '6px 4px 4px', animation: 'slideDown 0.2s ease' }}>
                          {variants.map(v => (
                            <div key={v.id} onClick={() => addBlock(b.type, v.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 7, cursor: 'pointer', marginBottom: 3, background: '#f8fafc', border: '1px solid #f0f0f0' }}
                              onMouseEnter={e => { e.currentTarget.style.background = primary + '14'; e.currentTarget.style.borderColor = primary }}
                              onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f0f0f0' }}>
                              <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{v.name}</span>
                              <span style={{ marginLeft: 'auto', color: primary, fontWeight: 700, fontSize: 14 }}>+</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
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
        <div style={{ width: 210, borderLeft: '1px solid #e5e5e5', background: '#fff', overflowY: 'auto', flexShrink: 0, padding: 12 }}>
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
            <select value={font} onChange={e => { setFont(e.target.value); sessionStorage.setItem('wg24_font', e.target.value) }} style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 7, padding: '7px 9px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' }}>
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

          <button onClick={() => { if (confirm('Neu starten? Aktuelle Website geht verloren.')) { sessionStorage.clear(); router.push('/') } }} style={{ width: '100%', border: '1px solid #e5e5e5', background: '#fff', padding: 8, borderRadius: 7, fontSize: 10, fontWeight: 600, cursor: 'pointer', color: '#666', marginTop: 12 }}>← Neu starten</button>
        </div>
      </div>

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
    </div>
  )
}

// ── Modal ──
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
    'hero-full': { tag: 'Willkommen', headline: 'Deine Überschrift', subline: 'Beschreibe dein Angebot.', cta1: 'Kontakt', cta2: 'Mehr', stats: [{ num: '10+', label: 'Jahre' }, { num: '200+', label: 'Kunden' }, { num: '100%', label: 'Qualität' }] },
    'header-slim': { tag: 'Seite', headline: 'Seitentitel', subline: 'Beschreibung.' },
    services: { tag: 'Leistungen', title: 'Was wir bieten', subtitle: 'Überblick.', items: [{ icon: '⚡', title: 'Leistung 1', text: 'Beschreibung.' }, { icon: '🎯', title: 'Leistung 2', text: 'Beschreibung.' }, { icon: '🤝', title: 'Leistung 3', text: 'Beschreibung.' }] },
    about: { tag: 'Über uns', title: 'Wer wir sind', text1: 'Absatz 1.', text2: 'Absatz 2.', stats: [{ num: '15+', label: 'Jahre' }, { num: '500+', label: 'Kunden' }, { num: '98%', label: 'Zufrieden' }, { num: '24/7', label: 'Support' }] },
    team: { tag: 'Team', title: 'Unser Team', members: [{ name: 'Max Mustermann', role: 'Geschäftsführer', bio: 'Bio.', img: '' }, { name: 'Lisa Schmidt', role: 'Beraterin', bio: 'Bio.', img: '' }, { name: 'Tom Berg', role: 'Experte', bio: 'Bio.', img: '' }] },
    testimonials: { title: 'Was Kunden sagen', items: [{ quote: 'Top!', name: 'Anna K.', role: 'Kundin' }, { quote: 'Sehr gut.', name: 'Peter M.', role: 'Kunde' }, { quote: 'Empfehlung.', name: 'Sara L.', role: 'Kundin' }] },
    stats: { items: [{ num: '15+', label: 'Jahre' }, { num: '500+', label: 'Kunden' }, { num: '98%', label: 'Zufrieden' }, { num: '24/7', label: 'Support' }] },
    cta: { title: 'Bereit loszulegen?', subtitle: 'Kontaktiere uns.', cta1: 'Jetzt anfragen', telefon: '+49 30 1234567' },
    gallery: { title: 'Galerie', images: ['', '', '', '', '', ''] },
    faq: { title: 'Häufige Fragen', items: [{ q: 'Frage 1?', a: 'Antwort.' }, { q: 'Frage 2?', a: 'Antwort.' }, { q: 'Frage 3?', a: 'Antwort.' }] },
    contact: { tag: 'Kontakt', title: 'Sprich uns an', subtitle: 'Wir freuen uns.', adresse: 'Musterstr. 1, Berlin', telefon: '+49 30 1234567', email: 'info@beispiel.de', oeffnung: 'Mo-Fr: 9-18 Uhr' },
    menu: { tag: 'Speisekarte', title: 'Unsere Speisekarte', kategorien: [{ name: 'Vorspeisen', items: [{ name: 'Bruschetta', desc: 'Geröstetes Brot mit Tomaten', preis: '6,90 €' }, { name: 'Caprese', desc: 'Tomate, Mozzarella, Basilikum', preis: '8,50 €' }] }, { name: 'Hauptgerichte', items: [{ name: 'Pasta Carbonara', desc: 'Mit Speck und Ei', preis: '12,90 €' }, { name: 'Pizza Margherita', desc: 'Klassisch italienisch', preis: '9,90 €' }] }] },
    custom: { html: '' },
  }
  return d[type] || {}
}
