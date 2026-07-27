'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { renderPage } from '@/lib/blockRenderer'
import { getVariants, ADDABLE_BLOCKS, BLOCK_CATEGORIES, BLOCK_REGISTRY, ALLE_DEFAULTS, renderBlock } from '@/lib/blocks'

// Einzel-Elemente: per Drag frei in JEDEN Container (Karte, Spalte, Rasterzelle)
const EINZEL_ELEMENTE = [
  { type: 'el-ueberschrift', label: 'Überschrift', fa: 'heading' },
  { type: 'el-text', label: 'Text', fa: 'font' },
  { type: 'el-bild', label: 'Bild', fa: 'image' },
  { type: 'el-button', label: 'Button', fa: 'hand-pointer' },
  { type: 'el-abstand', label: 'Abstand', fa: 'arrows-up-down' },
  { type: 'el-code', label: 'Eigener Code', fa: 'code' },
]
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
import { istPfad, pfadSetzen, listeAendern, layoutNachStruktur } from '@/lib/blockSchema'

// Auswahlfarbe für Sektionen/Container (Elementor-artig: pink)
const PINK = '#e6007e'

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
  const [contSel, setContSel] = useState(null)   // gewählte Sektion / Container (pinke Elementor-Auswahl)
  const [baum, setBaum] = useState([])           // Struktur der Seite für den Navigator
  const [navOffen, setNavOffen] = useState(false)
  const [vorschau, setVorschau] = useState(false)   // Seite ohne Baukasten-Elemente ansehen
  const [breiteLinks, setBreiteLinks] = useState(240)
  const [breiteRechts, setBreiteRechts] = useState(250)
  const [zieht, setZieht] = useState(null)          // 'links' | 'rechts' während des Ziehens

  // Seitenleisten an den Griffen ziehen → Mitte bekommt variabel Platz.
  // Während des Ziehens fängt das iframe keine Mausereignisse ab.
  function panelZiehen(e, seite) {
    e.preventDefault()
    setZieht(seite)
    const startX = e.clientX
    const start = seite === 'links' ? breiteLinks : breiteRechts
    const move = (ev) => {
      const d = ev.clientX - startX
      if (seite === 'links') setBreiteLinks(Math.max(56, Math.min(480, start + d)))
      else setBreiteRechts(Math.max(56, Math.min(520, start - d)))
    }
    const up = () => { setZieht(null); document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up) }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }
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
  const [bewegungStopp, setBewegungStopp] = useState(false)
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
    iframe.onload = () => { try { iframe.contentWindow?.scrollTo(0, sy) } catch {} }
    const html = renderPage({ blocks, palette, font, fontHeadline, title: activePage, forEditor: true })
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
    // Muss VOR den Baustein-Skripten laufen: Slider-Automatik u. Ä. erkennen
    // daran, dass sie im Editor stillhalten sollen.
    const kopf = `<script>window.__wgEditor=1;</script>`
    const css = `${kopf}<style id="wg-ed">
      * { scroll-behavior: auto !important; }
      /* Bewegung bleibt an – nur wenn "Bewegung anhalten" aktiv ist, wird
         alles eingefroren. Zusätzlich halten Laufbänder beim Drüberfahren
         von selbst an, damit man sie treffen kann. */
      /* Alle Effekte laufen normal weiter. Nur der ausgewählte Bereich hält
         an, damit man bewegte Inhalte in Ruhe bearbeiten kann. */
      /* Sobald die Maus irgendwo im Bereich ist, hält sein Laufband an –
         große, ruhige Trefferfläche statt millimetergenauem Zielen.
         Verlässt man den Bereich, läuft es sofort weiter. */
      [data-block]:hover .wg-laufband{animation-play-state:paused !important;}
      [data-block].wg-aktiv .wg-laufband,
      [data-block].wg-aktiv .wg-blob{animation-play-state:paused !important;}
      /* Mit dem Pause-Schalter friert alles ein. */
      body.wg-stopp *{animation-play-state:paused !important;}
      .wg-spur{scroll-behavior:auto !important;}
      [data-edit]{ cursor:text; border-radius:3px; }
      [data-edit]:hover{ outline:1px dashed ${primary}99; outline-offset:2px; }
      [data-sel]{ position:relative; transition:outline 0.1s; }
      [data-sel]:hover{ outline:2px solid ${primary}55; outline-offset:1px; cursor:pointer; }
      .wg-on{ outline:2px solid ${primary} !important; outline-offset:1px; }
      .wg-hover{ outline:1px dashed ${primary}88 !important; outline-offset:1px; cursor:pointer; }
      .wg-on::after{ content:attr(data-label); position:absolute; top:-19px; left:-2px; background:${primary}; color:#fff; font-size:10px; font-weight:700; padding:2px 7px; border-radius:4px 4px 0 0; white-space:nowrap; z-index:99999; pointer-events:none; font-family:sans-serif; }
      [data-block]{ position:relative; }
      [data-block]:hover{ outline:1px solid ${primary}33; outline-offset:-1px; }
      /* Sektions-Werkzeugleiste: mittig oben angedockt, wie bei Elementor */
      .wg-bc{ position:absolute; top:-1px; left:50%; transform:translateX(-50%); z-index:99998; display:none; gap:0; background:${PINK}; border-radius:0 0 8px 8px; padding:2px 4px; box-shadow:0 3px 10px rgba(0,0,0,.22); }
      [data-block]:hover .wg-bc{ display:flex; }
      .wg-b{ width:26px; height:24px; border:none; border-radius:5px; background:transparent; color:#fff; cursor:pointer; font-size:12px; display:flex; align-items:center; justify-content:center; }
      .wg-b:hover{ background:rgba(255,255,255,.22); }
      .wg-b.del:hover{ background:#7f1d1d; }
      /* Hover auf Sektionen/Containern */
      [data-block]:hover{ outline:1px solid ${PINK}55 !important; outline-offset:-1px; }
      .wg-c-hov{ outline:1px dashed ${PINK}aa !important; outline-offset:-1px; }
      /* Pinke Auswahl-Overlays (fixe Ebene über allem, blockiert nichts) */
      #wg-ov{ position:fixed; z-index:2147480000; pointer-events:none; display:none; }
      #wg-ov .wg-rahmen{ position:absolute; inset:0; outline:2px solid ${PINK}; outline-offset:-1px; box-shadow:0 0 0 1px #ffffff66 inset; }
      #wg-ov .wg-tabb{ position:absolute; top:-22px; left:0; background:${PINK}; color:#fff; font:700 11px/1 sans-serif; padding:5px 10px; border-radius:6px 6px 0 0; white-space:nowrap; max-width:260px; overflow:hidden; text-overflow:ellipsis; }
      #wg-ov .wg-mass{ position:absolute; bottom:-20px; right:0; background:#0f172a; color:#fff; font:600 10px/1 sans-serif; padding:4px 8px; border-radius:0 0 6px 6px; white-space:nowrap; }
      #wg-ov .wg-tools{ position:absolute; top:-24px; right:0; display:flex; gap:2px; pointer-events:auto; }
      #wg-ov .wg-tools button{ height:22px; min-width:24px; border:none; border-radius:5px; background:${PINK}; color:#fff; cursor:pointer; font-size:11px; display:flex; align-items:center; justify-content:center; padding:0 5px; box-shadow:0 2px 6px rgba(0,0,0,.25); }
      #wg-ov .wg-tools button:hover{ filter:brightness(1.15); }
      #wg-ov .wg-griff{ position:absolute; left:50%; transform:translateX(-50%); width:44px; height:9px; border-radius:6px; background:#fff; border:2px solid ${PINK}; cursor:ns-resize; pointer-events:auto; box-shadow:0 1px 5px rgba(0,0,0,.3); }
      #wg-ov .g-oben{ top:-5px; }
      #wg-ov .g-unten{ bottom:-5px; }
      .wg-teiler{ position:fixed; z-index:2147480001; width:12px; margin-left:-6px; cursor:col-resize; pointer-events:auto; display:flex; align-items:center; justify-content:center; }
      .wg-teiler::before{ content:''; width:4px; height:44px; border-radius:4px; background:${PINK}; border:1px solid #fff; box-shadow:0 1px 5px rgba(0,0,0,.3); }
      #wg-tip{ position:fixed; z-index:2147480002; background:#0f172a; color:#fff; font:700 11px/1 sans-serif; padding:5px 8px; border-radius:6px; pointer-events:none; display:none; }
      .wg-drop-ziel{ outline:3px dashed #16a34a !important; outline-offset:-3px; background:rgba(22,163,74,.1) !important; }
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
        // Nur der Block des ausgewaehlten Elements haelt seine Bewegung an
        document.querySelectorAll('[data-block].wg-aktiv').forEach(function(b){b.classList.remove('wg-aktiv')});
        var sec=el.closest('[data-block]'); if(sec)sec.classList.add('wg-aktiv');
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
          text:el.hasAttribute('data-edit')?el.innerHTML:'',
          key:el.getAttribute('data-edit')||el.getAttribute('data-img')||el.getAttribute('data-icon')||el.getAttribute('data-stars')||'',
          iconName:el.hasAttribute('data-icon')?(((el.getAttribute('class')||'').match(/fa-(?!solid|regular|brands)[a-z0-9-]+/)||[''])[0]):'',
          align:cs.textAlign,
          color:rgbToHex(cs.color),
          fontSize:parseInt(cs.fontSize)||16,
          fontWeight:cs.fontWeight,
          block:bIdx(el),
          pfad:kindPfad(el),
          linkHref:(function(){var a=el.closest('a');return a?(a.getAttribute('href')||''):null})(),
          linkPfad:(function(){var a=el.closest('a');return a?kindPfad(a):null})(),
          stil:{marginTop:cs.marginTop,marginRight:cs.marginRight,marginBottom:cs.marginBottom,marginLeft:cs.marginLeft,
                paddingTop:cs.paddingTop,paddingRight:cs.paddingRight,paddingBottom:cs.paddingBottom,paddingLeft:cs.paddingLeft,
                zIndex:cs.zIndex},
          rect:{top:r.top,left:r.left,width:r.width,height:r.height}
        },'*');
      }

      // ─────────────────────────────────────────────────────────────
      // AUSWAHL – neu und einheitlich.
      // EIN einziger Klick-Empfänger für das ganze Dokument. Er findet
      // immer das RICHTIGE Ziel, egal wo genau man hinklickt:
      //   1. Text/Bild/Icon unter dem Mauszeiger? -> das nehmen
      //   2. Sonst: enthält das Angeklickte genau EIN bearbeitbares
      //      Element? -> dieses nehmen (Klick auf den Rahmen zählt also)
      //   3. Sonst: das nächste sinnvolle Gestaltungs-Element
      // Damit ist nichts mehr "nicht wählbar".
      // ─────────────────────────────────────────────────────────────
      var BEARBEITBAR='[data-edit],[data-img],[data-icon],[data-stars]';
      var GESTALTBAR='h1,h2,h3,h4,h5,p,a,button,li,span,div,section,nav,footer';

      // Findet zu einem Klick immer das passende Ziel.
      // mx/my = Mausposition, damit bei mehreren Möglichkeiten das
      // nächstgelegene Element gewinnt.
      function zielFinden(start,mx,my){
        if(!start||start.closest('.wg-bc'))return null;
        // 1) direkt auf/über einem bearbeitbaren Element
        var t=start.closest(BEARBEITBAR);
        if(t)return t;
        // 2) nach oben laufen und im jeweiligen Rahmen suchen
        var el=start;
        for(var tiefe=0; el && tiefe<5; tiefe++){
          var innen=el.querySelectorAll(BEARBEITBAR);
          if(innen.length===1)return innen[0];
          if(innen.length>1){
            // mehrere: das dem Klick am nächsten liegende nehmen
            if(typeof mx!=='number')return innen[0];
            var best=null,bestD=Infinity;
            for(var i=0;i<innen.length;i++){
              var r=innen[i].getBoundingClientRect();
              if(!r.width&&!r.height)continue;
              var dx=Math.max(r.left-mx,0,mx-r.right);
              var dy=Math.max(r.top-my,0,my-r.bottom);
              var d=dx*dx+dy*dy;
              if(d<bestD){bestD=d;best=innen[i];}
            }
            if(best)return best;
          }
          el=el.parentElement;
        }
        // 3) irgendein gestaltbares Element
        return start.closest(GESTALTBAR)||start;
      }

      // Bearbeitbares Element, dessen Fläche den Punkt (mx,my) enthält –
      // auch wenn eine Deko-Ebene darüber liegt und den Klick abfängt.
      function editierbarAmPunkt(rahmen,mx,my){
        if(typeof mx!=='number')return null;
        var alle=rahmen.querySelectorAll(BEARBEITBAR);
        var best=null,bestF=Infinity;
        for(var i=0;i<alle.length;i++){
          var r=alle[i].getBoundingClientRect();
          if(!r.width||!r.height)continue;
          if(mx<r.left||mx>r.right||my<r.top||my>r.bottom)continue;
          var f=r.width*r.height;         // kleinstes getroffenes Element gewinnt
          if(f<bestF){bestF=f;best=alle[i];}
        }
        return best;
      }

      // Text/Bild/Icon anklicken → wie gehabt bearbeiten.
      function textAuswahl(ziel){
        contAbwaehlen(false);
        // Akkordeons (FAQ): Klick auf die Frage klappt die Antwort auf,
        // sonst wäre die Antwort im Editor nie erreichbar. Liegt das Ziel
        // selbst in einem zugeklappten Bereich, wird er geöffnet.
        var summ=ziel.closest('summary');
        if(summ){var det=summ.closest('details');if(det&&!det.open)det.open=true;}
        var det2=ziel.closest('details');
        if(det2&&!det2.open)det2.open=true;
        selectEl(ziel);
        if(ziel.hasAttribute('data-edit')){
          ziel.contentEditable=true;
          ziel.spellcheck=false;
          setTimeout(function(){
            ziel.focus();
            try{
              var r=document.createRange();r.selectNodeContents(ziel);r.collapse(false);
              var sl=window.getSelection();sl.removeAllRanges();sl.addRange(r);
            }catch(err){}
          },0);
        } else if(ziel.hasAttribute('data-icon')){
          parent.postMessage({t:'iconClick',key:ziel.getAttribute('data-icon'),block:bIdx(ziel)},'*');
        } else if(ziel.hasAttribute('data-img')){
          parent.postMessage({t:'imgClick',key:ziel.getAttribute('data-img'),block:bIdx(ziel)},'*');
        }
      }

      document.addEventListener('click',function(e){
        if(istChrome(e.target))return;             // eigene Werkzeugleisten
        if(e.target.isContentEditable)return;      // schon im Schreibmodus
        // 1) Direkt ein bearbeitbares Element getroffen? → Text-Bearbeitung
        var direkt=e.target.closest(BEARBEITBAR);
        if(direkt){ e.stopPropagation();e.preventDefault(); textAuswahl(direkt); return; }
        // 1b) Laufband-Kopie getroffen? → das Original mit gleichem Pfad wählen
        //     (Laufbänder zeigen jeden Eintrag doppelt für die Endlos-Schleife)
        var kopie=e.target.closest('[data-kopie]');
        if(kopie){
          var orig=(kopie.closest('[data-block]')||document).querySelector('[data-edit="'+kopie.getAttribute('data-kopie')+'"]');
          if(orig){ e.stopPropagation();e.preventDefault(); textAuswahl(orig); return; }
        }
        // 2) Nach oben laufen. Kleine Rahmen mit genau EINEM Text (z. B. ein
        //    Button) zählen weiter als Text-Klick; erst der erste echte
        //    Container/die Sektion wird pink gewählt (Elementor-Auswahl).
        var c=e.target,einzel=null;
        while(c&&c!==document.body&&c!==document.documentElement){
          if(c.hasAttribute&&c.hasAttribute('data-block'))break;
          if(istContainer(c))break;
          var inn=c.querySelectorAll(BEARBEITBAR);
          if(inn.length===1&&!einzel)einzel=inn[0];
          c=c.parentElement;
        }
        if(einzel){ e.stopPropagation();e.preventDefault(); textAuswahl(einzel); return; }
        if(c&&c!==document.body&&c!==document.documentElement){
          // Liegt unter dem Klickpunkt ein Text, der nur von einer Deko-Ebene
          // (Verlauf, Overlay – z. B. im Slider) überdeckt wird? Dann ist der
          // Text gemeint, nicht der Container. Gesucht wird in der GANZEN
          // Sektion – auch absolut positionierte Texte (Geist-Wort) zählen.
          var unterPunkt=editierbarAmPunkt(c.closest('[data-block]')||c,e.clientX,e.clientY);
          if(unterPunkt){ e.stopPropagation();e.preventDefault(); textAuswahl(unterPunkt); return; }
          var innen=c.querySelectorAll(BEARBEITBAR);
          if(innen.length===1&&!c.hasAttribute('data-block')){
            e.stopPropagation();e.preventDefault(); textAuswahl(innen[0]); return;
          }
          e.stopPropagation();e.preventDefault(); contWaehlen(c); return;
        }
        // 3) Sonst wie bisher das nächste sinnvolle Element
        var ziel=zielFinden(e.target,e.clientX,e.clientY);
        if(!ziel)return;
        e.stopPropagation();e.preventDefault();
        textAuswahl(ziel);
      },false);

      // Umrandung beim Überfahren, damit man sieht was man trifft:
      // Texte gestrichelt, Container/Sektionen pink gestrichelt.
      document.addEventListener('mouseover',function(e){
        if(istChrome(e.target))return;
        document.querySelectorAll('.wg-hover').forEach(function(x){x.classList.remove('wg-hover')});
        document.querySelectorAll('.wg-c-hov').forEach(function(x){x.classList.remove('wg-c-hov')});
        var direkt=e.target.closest(BEARBEITBAR);
        if(direkt){ if(direkt!==sel)direkt.classList.add('wg-hover'); return; }
        var c=e.target,einzel=null;
        while(c&&c!==document.body&&c!==document.documentElement){
          if((c.hasAttribute&&c.hasAttribute('data-block'))||istContainer(c))break;
          var inn=c.querySelectorAll(BEARBEITBAR);
          if(inn.length===1&&!einzel)einzel=inn[0];
          c=c.parentElement;
        }
        if(einzel){ if(einzel!==sel)einzel.classList.add('wg-hover'); return; }
        if(c&&c!==document.body&&c!==document.documentElement){
          var up=editierbarAmPunkt(c.closest('[data-block]')||c,e.clientX,e.clientY);
          if(up){ if(up!==sel)up.classList.add('wg-hover'); return; }
          if(!c.hasAttribute('data-block')&&c!==selC)c.classList.add('wg-c-hov');
        }
      },false);

      // Speichern beim Verlassen. Laufband-Kopien desselben Pfads werden
      // sofort mitgezogen, damit die Schleife nicht zweierlei Text zeigt.
      document.addEventListener('blur',function(e){
        var el=e.target;
        if(el&&el.hasAttribute&&el.hasAttribute('data-edit')&&el.isContentEditable){
          el.contentEditable=false;
          var key=el.getAttribute('data-edit');
          var blk=el.closest('[data-block]')||document;
          blk.querySelectorAll('[data-kopie="'+key+'"]').forEach(function(kp){kp.innerHTML=el.innerHTML;});
          parent.postMessage({t:'edit',key:key,val:el.innerHTML,block:bIdx(el)},'*');
        }
      },true);
      document.addEventListener('keydown',function(e){
        if(e.key==='Enter'&&!e.shiftKey&&e.target.isContentEditable){e.preventDefault();e.target.blur();}
        if(e.key==='Escape'&&e.target.isContentEditable){e.target.blur();}
      },true);

      // Bestandsaufnahme: alle sichtbaren Inhalte an den Editor melden.
      // Nötig, weil Bausteine Standardwerte anzeigen, die noch nicht im
      // gespeicherten Inhalt stehen. Ohne das gingen beim Ändern eines
      // Eintrags alle übrigen verloren.
      (function(){
        var bloecke=document.querySelectorAll('[data-block]');
        var inventar=[];
        for(var b=0;b<bloecke.length;b++){
          var felder={};
          var els=bloecke[b].querySelectorAll('[data-edit]');
          for(var i=0;i<els.length;i++){
            var k=els[i].getAttribute('data-edit');
            if(k)felder[k]=els[i].innerHTML;
          }
          // Icons mitschreiben, damit geklonte Karten ihr Icon behalten
          var ics=bloecke[b].querySelectorAll('[data-icon]');
          for(var j=0;j<ics.length;j++){
            var ik=ics[j].getAttribute('data-icon');
            var im=((ics[j].getAttribute('class')||'').match(/fa-(?!solid|regular|brands)[a-z0-9-]+/)||[null])[0];
            if(ik&&im)felder[ik]=im.slice(3);
          }
          inventar.push({block:b,felder:felder});
        }
        parent.postMessage({t:'inventar',inventar:inventar},'*');
      })();


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
        if(d.cmd==='bewegung'){document.body.classList.toggle('wg-stopp',!!d.stopp);return;}
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
        bc.innerHTML='<button class="wg-b" data-x="set" title="Sektion wählen (Abstände & Breite)"><i class="fa-solid fa-up-down-left-right"></i></button><button class="wg-b" data-x="var" title="Layout-Variante"><i class="fa-solid fa-rotate"></i></button><button class="wg-b" data-x="up" title="Hoch"><i class="fa-solid fa-arrow-up"></i></button><button class="wg-b" data-x="down" title="Runter"><i class="fa-solid fa-arrow-down"></i></button><button class="wg-b" data-x="dup" title="Duplizieren"><i class="fa-solid fa-clone"></i></button><button class="wg-b del" data-x="del" title="Löschen"><i class="fa-solid fa-xmark"></i></button>';
        bc.querySelectorAll('button').forEach(function(btn){
          btn.onclick=function(e){e.stopPropagation();var x=btn.dataset.x;
            if(x==='set')contWaehlen(el);
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
      function wgMakePlace(){ var d=document.createElement('div'); d.className='wg-place'; d.style.cssText='height:84px;margin:10px 14px;border:3px dashed ${primary};border-radius:16px;background:${primary}14;display:flex;align-items:center;justify-content:center;color:${primary};font:700 14px sans-serif;box-shadow:0 0 0 4px ${primary}22;'; d.innerHTML='<i class="fa-solid fa-arrow-down" style="margin-right:8px"></i>Hier einfügen'; return d; }
      function wgPlaceAt(y){
        var bs=Array.prototype.slice.call(document.querySelectorAll('[data-block]')).filter(function(b){return !b.classList.contains('wg-place');});
        if(!wgPlace) wgPlace=wgMakePlace();
        var target=null;
        for(var i=0;i<bs.length;i++){ var r=bs[i].getBoundingClientRect(); if(y < r.top + r.height/2){ target=bs[i]; window.__wgDropIndex=i; break; } }
        if(target){ target.parentNode.insertBefore(wgPlace, target); }
        else { var last=bs[bs.length-1]; if(last)last.parentNode.insertBefore(wgPlace, last.nextSibling); window.__wgDropIndex=bs.length; }
      }
      // Ziehen über einen Container (Karte, Rasterzelle, Spalte) → dort
      // einfügen. Sonst wie bisher zwischen den Sektionen.
      var dropZiel=null;
      function dropZielSetzen(el){
        if(dropZiel===el)return;
        if(dropZiel)dropZiel.classList.remove('wg-drop-ziel');
        dropZiel=el;
        if(dropZiel)dropZiel.classList.add('wg-drop-ziel');
      }
      function containerUnterPunkt(x,y){
        var el=document.elementFromPoint(x,y);
        while(el&&el!==document.body&&el!==document.documentElement){
          if(istChromeEl(el)){el=el.parentElement;continue;}
          if(el.hasAttribute&&el.hasAttribute('data-block'))return null; // Sektion selbst = zwischen Sektionen
          if(istContainer(el))return el;
          el=el.parentElement;
        }
        return null;
      }
      document.addEventListener('dragover',function(e){ if(!parent.__wgDrag)return; e.preventDefault(); try{e.dataTransfer.dropEffect='copy';}catch(x){}
        var z=containerUnterPunkt(e.clientX,e.clientY);
        if(z){ wgRemovePlace(); dropZielSetzen(z); }
        else { dropZielSetzen(null); wgPlaceAt(e.clientY); }
      });
      document.addEventListener('drop',function(e){ if(!parent.__wgDrag)return; e.preventDefault();
        if(dropZiel){
          var pf=kindPfad(dropZiel);
          var bi=bIdx(dropZiel);
          dropZielSetzen(null); wgRemovePlace();
          if(pf!=null&&bi>=0){ parent.postMessage({t:'dropInContainer', blockType:parent.__wgDrag, block:bi, pfad:pf},'*'); return; }
        }
        var idx=window.__wgDropIndex||0; wgRemovePlace(); parent.postMessage({t:'dropBlock', blockType:parent.__wgDrag, index:idx},'*');
      });
      window.addEventListener('message',function(e){ var dd=e.data; if(!dd)return; if(dd.cmd==='wgDragEnd'){wgRemovePlace();dropZielSetzen(null);} if(dd.cmd==='setParallax'){ var bs=document.querySelectorAll('[data-block]'); var el=bs[dd.block]; if(el){ if(dd.on){el.setAttribute('data-parallax',dd.speed);}else{el.removeAttribute('data-parallax');el.style.backgroundPositionY='';} if(typeof window.wgRunParallax==='function')window.wgRunParallax(); } } if(dd.cmd==='gotoBlock'){ var bs2=document.querySelectorAll('[data-block]'); var el2=bs2[dd.index]; if(el2){ el2.scrollIntoView({behavior:'smooth',block:'start'}); el2.style.transition='outline 0.2s'; el2.style.outline='3px solid ${primary}'; setTimeout(function(){el2.style.outline='';},900); } } });

      // ═══════════════════════════════════════════════════════════════
      // SEKTIONEN & CONTAINER – Elementor-artige Auswahl
      //   • pinke Umrandung mit Namens-Tab + Breite×Höhe
      //   • Griffe: Kanten ziehen = Innenabstand; Trennlinien = Spalten
      //   • Karten, die zu einer Liste gehören, können geklont/gelöscht
      //     und verschoben werden – über den INHALT, nie übers HTML
      //   • Abstände/Breite kommen aus content._layout und werden hier
      //     direkt am Element gesetzt (fertige Seite: gebackenes CSS)
      // ═══════════════════════════════════════════════════════════════
      var selC=null;

      function istChrome(el){
        return !!(el&&el.closest&&el.closest('#wg-ov,.wg-bc,.wg-teiler,#wg-tip,.wg-place,[data-wg-chrome]'));
      }
      function istChromeEl(c){
        if(!c||c.nodeType!==1)return true;
        if(c.hasAttribute('data-wg-chrome'))return true;
        var kl=(typeof c.className==='string')?c.className:'';
        return /(^|\\s)(wg-bc|wg-teiler|wg-place)(\\s|$)/.test(kl)||c.id==='wg-ov'||c.id==='wg-tip';
      }
      function echteKinder(el){
        return [].filter.call(el.children,function(c){return !istChromeEl(c);});
      }
      function istContainer(el){
        if(!el||el.nodeType!==1)return false;
        if(istChromeEl(el))return false;
        var tag=el.tagName.toLowerCase();
        if(tag==='style'||tag==='script'||tag==='i'||tag==='br'||tag==='img'||tag==='iframe')return false;
        if(el.hasAttribute('data-edit')||el.hasAttribute('data-img')||el.hasAttribute('data-icon')||el.hasAttribute('data-stars'))return false;
        if(el.closest('[data-edit]'))return false;
        if(el.hasAttribute('data-einbau'))return true;   // frei eingefügtes Element
        var kl=(typeof el.className==='string')?el.className:'';
        if(/(^|\\s)wg-(wrap|karte|split|bildbox)(\\s|$)/.test(kl))return true;
        var cs=getComputedStyle(el);
        return cs.display==='grid'||cs.display==='flex'||cs.display==='inline-grid';
      }
      // Kindpfad: Position des Elements innerhalb der Sektion, z. B. "0.2"
      function kindPfad(el){
        var sec=el.closest('[data-block]'); if(!sec)return null;
        if(el===sec)return '';
        var teile=[],n=el;
        while(n&&n!==sec){
          var p=n.parentElement; if(!p)return null;
          var ix=echteKinder(p).indexOf(n); if(ix<0)return null;
          teile.unshift(ix); n=p;
        }
        return teile.join('.');
      }
      function vonPfad(sec,pfad){
        if(pfad===''||pfad==null)return sec;
        var n=sec,teile=String(pfad).split('.');
        for(var i=0;i<teile.length;i++){
          n=echteKinder(n)[parseInt(teile[i],10)];
          if(!n)return null;
        }
        return n;
      }
      // Gehört diese Karte zu content[feld][index]? (alle Pfade gleicher Anfang)
      function bindung(el){
        // Frei eingefügte Elemente hängen an der Liste content._einbau
        if(el.hasAttribute&&el.hasAttribute('data-einbau'))return {feld:'_einbau',index:parseInt(el.getAttribute('data-einbau'),10)};
        var els=el.querySelectorAll('[data-edit],[data-img],[data-icon],[data-stars]');
        if(!els.length)return null;
        var feld=null,ix=null;
        for(var i=0;i<els.length;i++){
          var k=els[i].getAttribute('data-edit')||els[i].getAttribute('data-img')||els[i].getAttribute('data-icon')||els[i].getAttribute('data-stars')||'';
          var m=k.match(/^([a-zA-Z0-9_]+)\\.(\\d+)(?:\\.|$)/);
          if(!m)return null;
          if(feld===null){feld=m[1];ix=m[2];}
          else if(feld!==m[1]||ix!==m[2])return null;
        }
        return {feld:feld,index:parseInt(ix,10)};
      }
      function contLabel(el){
        var kl=(typeof el.className==='string')?el.className:'';
        if(el.hasAttribute&&el.hasAttribute('data-einbau')){
          var artN={bild:'Bild',ueberschrift:'Überschrift',text:'Text',button:'Button',abstand:'Abstand',html:'Eigener Code',baustein:'Baustein'};
          return 'Eingefügt: '+(artN[el.getAttribute('data-einbau-art')]||'Element');
        }
        var b=bindung(el); if(b)return 'Karte '+(b.index+1);
        if(/wg-wrap/.test(kl))return 'Innen-Bereich';
        if(/wg-karte/.test(kl))return 'Karte';
        var cs=getComputedStyle(el);
        if(cs.display==='grid'||cs.display==='inline-grid')return 'Raster';
        if(cs.display==='flex')return 'Zeile';
        return 'Container';
      }
      function cssProp(p){return p.replace(/[A-Z]/g,function(m){return '-'+m.toLowerCase()});}

      // ── Overlay (fixe Ebene, blockiert nichts) ──
      var ov=document.createElement('div');ov.id='wg-ov';ov.setAttribute('data-wg-chrome','1');
      ov.innerHTML='<div class="wg-rahmen"></div><div class="wg-tabb"></div><div class="wg-mass"></div><div class="wg-tools"></div><div class="wg-griff g-oben" title="Innenabstand oben ziehen"></div><div class="wg-griff g-unten" title="Innenabstand unten ziehen"></div>';
      document.body.appendChild(ov);
      var tip=document.createElement('div');tip.id='wg-tip';tip.setAttribute('data-wg-chrome','1');document.body.appendChild(tip);
      var teilerBox=[];

      function ovTab(){return ov.querySelector('.wg-tabb');}
      function ovUpdate(){
        if(!selC||!document.contains(selC)){ov.style.display='none';teilerWeg();requestAnimationFrame(ovUpdate);return;}
        var r=selC.getBoundingClientRect();
        ov.style.display='block';
        ov.style.left=r.left+'px';ov.style.top=r.top+'px';
        ov.style.width=r.width+'px';ov.style.height=r.height+'px';
        ov.querySelector('.wg-mass').textContent=Math.round(r.width)+' × '+Math.round(r.height)+' px';
        teilerUpdate();
        requestAnimationFrame(ovUpdate);
      }
      requestAnimationFrame(ovUpdate);

      function contAbwaehlen(melden){
        selC=null;
        ov.style.display='none';teilerWeg();
        if(melden)parent.postMessage({t:'contWeg'},'*');
      }
      function contWaehlen(el){
        if(sel){sel.classList.remove('wg-on');sel.contentEditable=false;sel=null;}
        document.querySelectorAll('.wg-c-hov').forEach(function(x){x.classList.remove('wg-c-hov')});
        selC=el;
        var istSek=el.hasAttribute('data-block');
        var bi=bIdx(el);
        var name;
        if(istSek){
          var lj=(window.__wgLayout||{})[bi];
          name=(lj&&lj.name)||WG_NAMES[el.getAttribute('data-block')]||'Sektion';
        } else name=contLabel(el);
        ovTab().textContent=name;
        // Bewegung im Bereich anhalten, damit man in Ruhe arbeiten kann
        document.querySelectorAll('[data-block].wg-aktiv').forEach(function(b){b.classList.remove('wg-aktiv')});
        var seine=el.closest('[data-block]');if(seine)seine.classList.add('wg-aktiv');
        // Werkzeuge
        var tools=ov.querySelector('.wg-tools');var h='';
        if(!istSek){
          h+='<button data-w="eltern" title="Übergeordnetes Element wählen"><i class="fa-solid fa-turn-up"></i></button>';
          var b=bindung(el);
          if(b){
            h+='<button data-w="hoch" title="Nach vorn"><i class="fa-solid fa-arrow-left"></i></button>';
            h+='<button data-w="runter" title="Nach hinten"><i class="fa-solid fa-arrow-right"></i></button>';
            h+='<button data-w="dup" title="Karte klonen"><i class="fa-solid fa-clone"></i></button>';
            h+='<button data-w="del" title="Karte löschen"><i class="fa-solid fa-xmark"></i></button>';
          }
        }
        tools.innerHTML=h;
        tools.querySelectorAll('button').forEach(function(btn){
          btn.onclick=function(ev){ev.stopPropagation();
            var w=btn.getAttribute('data-w');
            if(w==='eltern'){
              var p=selC.parentElement;
              while(p&&!istContainer(p)&&!p.hasAttribute('data-block'))p=p.parentElement;
              if(p)contWaehlen(p);
              return;
            }
            var bb=bindung(selC);if(!bb)return;
            parent.postMessage({t:'arrayOp',block:bIdx(selC),feld:bb.feld,index:bb.index,op:w},'*');
          };
        });
        // Meldung ans Panel
        var cs=getComputedStyle(el);var r=el.getBoundingClientRect();
        parent.postMessage({t:'contSel',block:bi,pfad:istSek?'':kindPfad(el),kind:istSek?'sektion':'container',name:name,
          bind:istSek?null:bindung(el),
          stil:{marginTop:cs.marginTop,marginRight:cs.marginRight,marginBottom:cs.marginBottom,marginLeft:cs.marginLeft,
                paddingTop:cs.paddingTop,paddingRight:cs.paddingRight,paddingBottom:cs.paddingBottom,paddingLeft:cs.paddingLeft,
                zIndex:cs.zIndex,breite:Math.round(r.width),hoehe:Math.round(r.height),display:cs.display}
        },'*');
        teilerBauen();
      }

      // ── Kanten ziehen = Innenabstand oben/unten ──
      function griffDrag(griff,eigenschaft){
        griff.addEventListener('mousedown',function(e){
          if(!selC)return;
          e.preventDefault();e.stopPropagation();
          var startY=e.clientY;
          var start=parseFloat(getComputedStyle(selC)[eigenschaft])||0;
          var richtung=(eigenschaft==='paddingTop')?-1:1; // unten: nach unten ziehen = mehr Innenabstand
          function move(ev){
            var d=(ev.clientY-startY)*richtung;
            var wert=Math.max(0,Math.round(start+d));
            selC.style.setProperty(cssProp(eigenschaft),wert+'px','important');
            tip.style.display='block';
            tip.style.left=(ev.clientX+14)+'px';tip.style.top=(ev.clientY+14)+'px';
            tip.textContent=(eigenschaft==='paddingTop'?'Innenabstand oben: ':'Innenabstand unten: ')+wert+'px';
          }
          function up(ev){
            document.removeEventListener('mousemove',move);
            document.removeEventListener('mouseup',up);
            tip.style.display='none';
            if(!selC)return;
            var fertig=parseFloat(getComputedStyle(selC)[eigenschaft])||0;
            var stil={};stil[eigenschaft]=Math.round(fertig)+'px';
            parent.postMessage({t:'layout',block:bIdx(selC),pfad:kindPfad(selC),stil:stil},'*');
          }
          document.addEventListener('mousemove',move);
          document.addEventListener('mouseup',up);
        });
      }
      griffDrag(ov.querySelector('.g-oben'),'paddingTop');
      griffDrag(ov.querySelector('.g-unten'),'paddingBottom');

      // ── Spalten-Trennlinien (Raster/Zeilen) ──
      function spaltenInfo(el){
        if(!el)return null;
        var cs=getComputedStyle(el);
        var kids=echteKinder(el).filter(function(c){return getComputedStyle(c).position!=='absolute';});
        if(kids.length<2)return null;
        if(cs.display==='grid'||cs.display==='inline-grid'){
          var cols=cs.gridTemplateColumns.split(' ').filter(Boolean);
          if(cols.length<2)return null;
          return {typ:'grid',kids:kids.slice(0,cols.length),anzahl:cols.length};
        }
        if(cs.display==='flex'&&(cs.flexDirection==='row'||cs.flexDirection==='row-reverse'))return {typ:'flex',kids:kids,anzahl:kids.length};
        return null;
      }
      function teilerWeg(){teilerBox.forEach(function(t){t.remove()});teilerBox=[];}
      function teilerBauen(){
        teilerWeg();
        var info=spaltenInfo(selC);if(!info)return;
        for(var i=0;i<info.anzahl-1;i++){
          (function(i){
            var t=document.createElement('div');t.className='wg-teiler';t.setAttribute('data-wg-chrome','1');
            t.title='Spaltenbreite ziehen';
            document.body.appendChild(t);teilerBox.push(t);
            t.addEventListener('mousedown',function(e){
              e.preventDefault();e.stopPropagation();
              var info2=spaltenInfo(selC);if(!info2)return;
              var breiten=info2.kids.map(function(k){return k.getBoundingClientRect().width;});
              var startX=e.clientX;
              function move(ev){
                var d=ev.clientX-startX;
                var w=breiten.slice();
                var min=40;
                d=Math.max(-(w[i]-min),Math.min(w[i+1]-min,d));
                w[i]+=d;w[i+1]-=d;
                if(info2.typ==='grid'){
                  selC.style.setProperty('grid-template-columns',w.map(function(x){return x.toFixed(1)+'fr';}).join(' '),'important');
                } else {
                  var summe=w.reduce(function(a,b){return a+b},0);
                  info2.kids[i].style.setProperty('flex','0 0 '+(w[i]/summe*100).toFixed(1)+'%','important');
                  info2.kids[i+1].style.setProperty('flex','0 0 '+(w[i+1]/summe*100).toFixed(1)+'%','important');
                }
                tip.style.display='block';
                tip.style.left=(ev.clientX+14)+'px';tip.style.top=(ev.clientY-28)+'px';
                tip.textContent=Math.round(w[i])+'px | '+Math.round(w[i+1])+'px';
              }
              function up(){
                document.removeEventListener('mousemove',move);
                document.removeEventListener('mouseup',up);
                tip.style.display='none';
                if(!selC)return;
                if(info2.typ==='grid'){
                  parent.postMessage({t:'layout',block:bIdx(selC),pfad:kindPfad(selC),stil:{gridTemplateColumns:selC.style.gridTemplateColumns}},'*');
                } else {
                  var basisPfad=kindPfad(selC);
                  [i,i+1].forEach(function(j){
                    var kp=kindPfad(info2.kids[j]);
                    if(kp!=null)parent.postMessage({t:'layout',block:bIdx(selC),pfad:kp,stil:{flexBasis:info2.kids[j].style.flexBasis||((100/info2.anzahl).toFixed(1)+'%')}},'*');
                  });
                }
              }
              document.addEventListener('mousemove',move);
              document.addEventListener('mouseup',up);
            });
          })(i);
        }
        teilerUpdate();
      }
      function teilerUpdate(){
        if(!teilerBox.length)return;
        var info=spaltenInfo(selC);
        if(!info){teilerWeg();return;}
        for(var i=0;i<teilerBox.length&&i<info.anzahl-1;i++){
          var a=info.kids[i].getBoundingClientRect();
          var b=info.kids[i+1].getBoundingClientRect();
          var x=(a.right+b.left)/2;
          teilerBox[i].style.left=x+'px';
          teilerBox[i].style.top=Math.min(a.top,b.top)+'px';
          teilerBox[i].style.height=Math.max(a.height,b.height)+'px';
        }
      }

      // ── Gespeicherte Layout-Overrides direkt am Element anwenden ──
      (function(){
        var L=window.__wgLayout||{};
        var secs=document.querySelectorAll('[data-block]');
        Object.keys(L).forEach(function(bi){
          var sec=secs[parseInt(bi,10)];if(!sec)return;
          var lay=L[bi].layout||{};
          Object.keys(lay).forEach(function(pfad){
            var el=vonPfad(sec,pfad);if(!el)return;
            var st=lay[pfad]||{};
            Object.keys(st).forEach(function(p){
              if(st[p]!==''&&st[p]!=null)el.style.setProperty(cssProp(p),String(st[p]),'important');
            });
          });
          var br=L[bi].breite;
          if(br){var w=sec.querySelector('.wg-wrap');if(w){
            if(br.modus==='voll')w.style.setProperty('max-width','100%','important');
            else if(br.modus==='boxed'&&parseInt(br.wert,10))w.style.setProperty('max-width',parseInt(br.wert,10)+'px','important');
          }}
        });
      })();

      // ── Strukturbaum für den Navigator ──
      function leafLabel(el){
        if(el.hasAttribute('data-img'))return 'Bild';
        if(el.hasAttribute('data-icon'))return 'Icon';
        if(el.hasAttribute('data-stars'))return 'Sterne';
        var t=(el.textContent||'').trim().replace(/\\s+/g,' ');
        return t?t.slice(0,26):'Text';
      }
      function kinderVon(el,tiefe){
        if(tiefe>4)return [];
        var res=[];
        var kids=echteKinder(el);
        for(var i=0;i<kids.length;i++){
          var k=kids[i],tag=k.tagName.toLowerCase();
          if(tag==='style'||tag==='script')continue;
          if(k.hasAttribute('data-edit')||k.hasAttribute('data-img')||k.hasAttribute('data-icon')||k.hasAttribute('data-stars')){
            res.push({art:k.hasAttribute('data-img')?'bild':(k.hasAttribute('data-icon')?'icon':'text'),pfad:kindPfad(k),label:leafLabel(k)});
          } else if(istContainer(k)){
            res.push({art:'container',pfad:kindPfad(k),label:contLabel(k),bind:bindung(k),kinder:kinderVon(k,tiefe+1)});
          } else {
            var unter=kinderVon(k,tiefe);
            for(var j=0;j<unter.length;j++)res.push(unter[j]);
          }
        }
        return res;
      }
      function baumBauen(){
        var secs=document.querySelectorAll('[data-block]');var out=[];
        for(var i=0;i<secs.length;i++){
          var lj=(window.__wgLayout||{})[i];
          out.push({bi:i,typ:secs[i].getAttribute('data-block'),
            label:(lj&&lj.name)||WG_NAMES[secs[i].getAttribute('data-block')]||'Sektion',
            kinder:kinderVon(secs[i],0)});
        }
        parent.postMessage({t:'baum',baum:out},'*');
      }
      baumBauen();
      // kleine Prüf-Schnittstelle (auch für automatische Tests)
      window.__wgApi={kindPfad:kindPfad,vonPfad:vonPfad,istContainer:istContainer,bindung:bindung,contWaehlen:contWaehlen,spaltenInfo:spaltenInfo,baumBauen:baumBauen};
      parent.postMessage({t:'bereit'},'*');

      // ── Befehle vom Panel / Navigator ──
      window.addEventListener('message',function(e){
        var d=e.data;if(!d||!d.cmd)return;
        var secs=document.querySelectorAll('[data-block]');
        if(d.cmd==='layout'){
          var sec=secs[d.block];if(!sec)return;
          var el=vonPfad(sec,d.pfad);if(!el)return;
          Object.keys(d.stil||{}).forEach(function(p){
            if(d.stil[p]===''||d.stil[p]==null)el.style.removeProperty(cssProp(p));
            else el.style.setProperty(cssProp(p),String(d.stil[p]),'important');
          });
        }
        if(d.cmd==='breite'){
          var sec2=secs[d.block];if(!sec2)return;
          var w=sec2.querySelector('.wg-wrap');if(!w)return;
          if(d.modus==='voll')w.style.setProperty('max-width','100%','important');
          else if(d.modus==='boxed'&&parseInt(d.wert,10))w.style.setProperty('max-width',parseInt(d.wert,10)+'px','important');
          else w.style.removeProperty('max-width');
        }
        if(d.cmd==='contName'){
          if(window.__wgLayout&&window.__wgLayout[d.block])window.__wgLayout[d.block].name=d.name;
          if(selC&&bIdx(selC)===d.block&&selC.hasAttribute('data-block'))ovTab().textContent=d.name||WG_NAMES[selC.getAttribute('data-block')]||'Sektion';
          baumBauen();
        }
        if(d.cmd==='gehePfad'){
          var sec3=secs[d.block];if(!sec3)return;
          var el3=vonPfad(sec3,d.pfad);if(!el3)return;
          el3.scrollIntoView({behavior:'smooth',block:'center'});
          if(el3.hasAttribute('data-edit')||el3.hasAttribute('data-img')||el3.hasAttribute('data-icon')||el3.hasAttribute('data-stars'))textAuswahl(el3);
          else contWaehlen(el3);
        }
        if(d.cmd==='hovPfad'){
          document.querySelectorAll('.wg-c-hov').forEach(function(x){x.classList.remove('wg-c-hov')});
          if(d.pfad==null)return;
          var sec4=secs[d.block];if(!sec4)return;
          var el4=vonPfad(sec4,d.pfad);
          if(el4&&el4!==selC)el4.classList.add('wg-c-hov');
        }
        if(d.cmd==='deselect'){contAbwaehlen(false);}
        // Live-Text aus dem Panel: direkt am Element, kein Neuaufbau nötig
        if(d.cmd==='setzeText'){
          var sT=secs[d.block];if(!sT)return;
          var eT=sT.querySelector('[data-edit="'+d.key+'"]');
          if(eT&&!eT.isContentEditable)eT.innerHTML=d.val;
          sT.querySelectorAll('[data-kopie="'+d.key+'"]').forEach(function(k){k.innerHTML=d.val;});
        }
        // Verlinkung live setzen (Button-/Link-Ziel)
        if(d.cmd==='setzeHref'){
          var sH=secs[d.block];if(!sH)return;
          var eH=vonPfad(sH,d.pfad);
          if(eH&&eH.tagName==='A')eH.setAttribute('href',d.href||'#');
        }
      });
      document.addEventListener('keydown',function(e){
        if(e.key==='Escape'&&selC){contAbwaehlen(true);}
      },true);
    })();</script>`

    return html.replace('</head>', css + '</head>').replace('</body>', js + '</body>')
  }

  // ── Messages aus iframe ──
  useEffect(() => {
    function onMsg(e) {
      const d = e.data
      if (!d?.t) return
      if (d.t === 'inventar') { inventarUebernehmen(d.inventar); return }
      if (d.t === 'edit') updateContent(d.block, d.key, d.val, false)
      if (d.t === 'imgClick') { setLastImgClick({ blockIdx: d.block, key: d.key }) }
      if (d.t === 'iconClick') setIconPicker({ blockIdx: d.block, key: d.key })
      if (d.t === 'select') { setContSel(null); setSelected(d) }
      if (d.t === 'selectSection') { const t = pages[activePage]?.[d.block]?.type; setSelected({ isSection: true, block: d.block, secName: BLOCK_REGISTRY[t]?.label || 'Bereich' }) }
      if (d.t === 'contSel') { setSelected(null); setContSel(d) }
      if (d.t === 'contWeg') setContSel(null)
      if (d.t === 'layout') applyLayoutPatch(d.block, d.pfad, d.stil)
      if (d.t === 'arrayOp') doArrayOp(d.block, d.feld, d.index, d.op)
      if (d.t === 'baum') setBaum(d.baum || [])
      if (d.t === 'bereit') { if (contSel) sendeAnVorschau({ cmd: 'gehePfad', block: contSel.block, pfad: contSel.pfad }) }
      if (d.t === 'sectionStyle') saveSectionStyle(d.block, d.img, d.overlay, d.parallax)
      if (d.t === 'deselect') setSelected(null)
      if (d.t === 'style') { /* live im iframe, kein extra Speichern nötig */ }
      if (d.t === 'variant') setVariantPicker({ blockIdx: d.block, type: d.type })
      if (d.t === 'move') moveBlock(d.block, d.dir)
      if (d.t === 'del') delBlock(d.block)
      if (d.t === 'dup') dupBlock(d.block)
      if (d.t === 'dropBlock') addBlockAt(d.index, d.blockType)
      if (d.t === 'dropInContainer') widgetEinfuegen(d.block, d.pfad, d.blockType)
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [activePage, pages, histIdx, history, contSel])

  // Befehl an iframe senden (Formatierung)
  function sendCmd(cmd, val) {
    iframeRef.current?.contentWindow?.postMessage({ cmd, val }, '*')
  }
  // Befehl mit mehreren Feldern an die Vorschau senden
  function sendeAnVorschau(obj) {
    iframeRef.current?.contentWindow?.postMessage(obj, '*')
  }

  // ── Layout-Overrides (Elementor-artig): Abstände, Breite, Z-Index ──
  // Persistiert in content._layout[pfad]; die Vorschau setzt die Werte sofort
  // am Element, die fertige Seite bekommt sie als gebackenes CSS.
  function applyLayoutPatch(blockIdx, pfad, patch) {
    const arr = [...(pages[activePage] || [])]
    const b = arr[blockIdx]; if (!b) return
    const c = { ...(b.content || {}) }
    const layout = { ...(c._layout || {}) }
    const eintrag = { ...(layout[pfad ?? ''] || {}), ...(patch || {}) }
    Object.keys(eintrag).forEach(k => { if (eintrag[k] === '' || eintrag[k] === null || eintrag[k] === undefined) delete eintrag[k] })
    if (Object.keys(eintrag).length) layout[pfad ?? ''] = eintrag
    else delete layout[pfad ?? '']
    c._layout = layout
    arr[blockIdx] = { ...b, content: c }
    const next = { ...pages }; next[activePage] = arr
    applyPages(next, true, false)
  }
  // Vom Panel aus: live in die Vorschau UND persistieren
  function layoutAendern(blockIdx, pfad, patch) {
    sendeAnVorschau({ cmd: 'layout', block: blockIdx, pfad: pfad ?? '', stil: patch })
    applyLayoutPatch(blockIdx, pfad ?? '', patch)
  }
  // Innenbreite der Sektion: voll / boxed (+px)
  function breiteAendern(blockIdx, modus, wert) {
    sendeAnVorschau({ cmd: 'breite', block: blockIdx, modus, wert })
    const arr = [...(pages[activePage] || [])]
    const b = arr[blockIdx]; if (!b) return
    arr[blockIdx] = { ...b, content: { ...(b.content || {}), _breite: modus ? { modus, wert } : undefined } }
    const next = { ...pages }; next[activePage] = arr
    applyPages(next, true, false)
  }
  // Name / CSS-ID / CSS-Klassen / beliebige Felder einer Sektion
  function contFeld(blockIdx, fields, neuAufbau = false) {
    const arr = [...(pages[activePage] || [])]
    const b = arr[blockIdx]; if (!b) return
    arr[blockIdx] = { ...b, content: { ...(b.content || {}), ...fields } }
    const next = { ...pages }; next[activePage] = arr
    applyPages(next, true, neuAufbau)
    if (fields._name !== undefined) sendeAnVorschau({ cmd: 'contName', block: blockIdx, name: fields._name })
  }

  // Live-Text aus dem Panel: sofort in der Vorschau sichtbar (ohne Neuaufbau,
  // also ohne Scroll-Sprung) UND persistiert. Ersetzt das alte „Übernehmen".
  function textLive(blockIdx, key, val) {
    sendeAnVorschau({ cmd: 'setzeText', block: blockIdx, key, val })
    updateContent(blockIdx, key, val, false, false)
  }
  // Verlinkung (Button-/Link-Ziel): live setzen + in content._links persistieren;
  // die fertige Seite bekommt die Ziele über einen kleinen Läufer gebacken.
  function linkAendern(blockIdx, pfad, href) {
    if (pfad == null) return
    sendeAnVorschau({ cmd: 'setzeHref', block: blockIdx, pfad, href })
    const arr = [...(pages[activePage] || [])]
    const b = arr[blockIdx]; if (!b) return
    const links = { ...(b.content?._links || {}) }
    if (href && href.trim()) links[pfad] = href.trim()
    else delete links[pfad]
    arr[blockIdx] = { ...b, content: { ...(b.content || {}), _links: links } }
    const next = { ...pages }; next[activePage] = arr
    applyPages(next, true, false)
  }
  // Element frei in einen Container einfügen (per Drag & Drop).
  // Einzel-Elemente werden echte Bearbeitungs-Elemente; ganze Bausteine
  // landen als eingebetteter freier HTML-Inhalt (ohne fremde Anker, die
  // sonst in den Inhalt des Gast-Bausteins schreiben würden).
  function widgetEinfuegen(blockIdx, pfad, blockType) {
    const arr = [...(pages[activePage] || [])]
    const b = arr[blockIdx]; if (!b || pfad == null) return
    let w
    if (blockType === 'el-bild') w = { ziel: pfad, art: 'bild', bild: '' }
    else if (blockType === 'el-ueberschrift') w = { ziel: pfad, art: 'ueberschrift', text: 'Neue Überschrift' }
    else if (blockType === 'el-text') w = { ziel: pfad, art: 'text', text: 'Neuer Text. Anklicken und schreiben.' }
    else if (blockType === 'el-button') w = { ziel: pfad, art: 'button', text: 'Mehr erfahren', href: '#' }
    else if (blockType === 'el-abstand') w = { ziel: pfad, art: 'abstand', hoehe: 32 }
    else if (blockType === 'el-code') w = { ziel: pfad, art: 'html', html: '' }
    else {
      // Ganzer Baustein → als eingebetteter Baustein mit EIGENEM Inhalt.
      // Der Renderer schreibt die Bearbeitungs-Anker in den Widget-Namensraum
      // um – Texte und Bilder darin bleiben voll bearbeitbar.
      const vid = getVariants(blockType)[0]?.id
      if (!vid) return
      w = { ziel: pfad, art: 'baustein', typ: blockType, variante: vid, inhalt: buildDefaultContent(blockType) }
    }
    arr[blockIdx] = { ...b, content: { ...(b.content || {}), _einbau: [...(b.content?._einbau || []), w] } }
    const next = { ...pages }; next[activePage] = arr
    applyPages(next, true, true)
  }

  // Karten klonen / löschen / verschieben – ändert die LISTE im Inhalt,
  // damit nichts auseinanderlaufen kann.
  function doArrayOp(blockIdx, feld, index, op) {
    const arr = [...(pages[activePage] || [])]
    const b = arr[blockIdx]; if (!b) return
    const neu = listeAendern(b.content || {}, feld, index, op)
    if (!neu) return
    arr[blockIdx] = { ...b, content: layoutNachStruktur(neu) }
    const next = { ...pages }; next[activePage] = arr
    applyPages(next, true, true)
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
  // Schreibt eine komplette Liste (alle Einträge auf einmal). Verhindert
  // lückenhafte Listen, wenn der Baustein bisher nur Standardwerte zeigte.
  // Schreibt alle in der Vorschau sichtbaren Werte in den gespeicherten Inhalt,
  // sofern dort noch nichts steht. Danach ist jede Liste vollständig und
  // einzelne Änderungen können nichts mehr überschreiben.
  const inventarGesetzt = useRef(false)
  useEffect(() => { inventarGesetzt.current = false }, [activePage])
  function inventarUebernehmen(inventar) {
    if (!inventar || inventarGesetzt.current) return
    inventarGesetzt.current = true
    const arr = [...(pages[activePage] || [])]
    let geaendert = false
    inventar.forEach(({ block, felder }) => {
      if (!arr[block]) return
      let content = { ...(arr[block].content || {}) }
      Object.entries(felder || {}).forEach(([pfad, wert]) => {
        if (!istPfad(pfad)) { if (content[pfad] === undefined) { content[pfad] = wert; geaendert = true } return }
        const teile = pfad.split('.')
        let ziel = content, fehlt = false
        for (let i = 0; i < teile.length; i++) {
          if (ziel === undefined || ziel === null) { fehlt = true; break }
          ziel = ziel[teile[i]]
        }
        if (fehlt || ziel === undefined) { content = pfadSetzen(content, pfad, wert); geaendert = true }
      })
      arr[block] = { ...arr[block], content }
    })
    if (!geaendert) return
    const next = { ...pages }; next[activePage] = arr
    setPages(next)
  }

  function updateContent(blockIdx, key, val, isImage = false, neuAufbau = false) {
    const next = { ...pages }
    const arr = [...next[activePage]]
    const block = { ...arr[blockIdx] }
    const content = { ...block.content }

    // Eindeutiger Pfad (z. B. "items.2.title") – kein Raten mehr nötig.
    if (istPfad(key)) {
      block.content = pfadSetzen(content, key, val)
      arr[blockIdx] = block; next[activePage] = arr
      // Bilder mit Pfadschlüssel (images.0, members.2.img) brauchen den
      // Neuaufbau genauso wie Panel-Übernahmen – sonst erscheint das
      // hochgeladene Bild erst irgendwann später.
      applyPages(next, true, !!neuAufbau || isImage); return
    }

    // Alles andere ist ein einfaches Feld auf oberster Ebene.
    // Verschachtelte Werte kommen immer als Pfad ("items.2.title") an –
    // dafür ist der Zweig oben zuständig. Geraten wird hier nichts mehr.
    content[key] = val

    block.content = content; arr[blockIdx] = block; next[activePage] = arr
    // Text-Edits direkt in der Vorschau: KEIN iframe-Neubau (kein Scroll-Sprung).
    // Bilder UND Panel-Übernahmen („neuAufbau") brauchen den Neubau – sonst
    // sagt das Panel „Übernommen“, aber die Vorschau zeigt den alten Text.
    // (Genau das war der Hero-Fehler: subline/headline sind einfache Felder.)
    applyPages(next, true, isImage || !!neuAufbau)
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
          <button onClick={undo} disabled={histIdx <= 0} title="Rückgängig" style={{ width: 32, height: 30, border: '1px solid #e5e5e5', borderRadius: 7, background: '#fff', cursor: histIdx <= 0 ? 'not-allowed' : 'pointer', opacity: histIdx <= 0 ? 0.35 : 1, fontSize: 15 }}><i className="fa-solid fa-rotate-left" /></button>
          <button onClick={redo} disabled={histIdx >= history.length - 1} title="Wiederholen" style={{ width: 32, height: 30, border: '1px solid #e5e5e5', borderRadius: 7, background: '#fff', cursor: histIdx >= history.length - 1 ? 'not-allowed' : 'pointer', opacity: histIdx >= history.length - 1 ? 0.35 : 1, fontSize: 15 }}><i className="fa-solid fa-rotate-right" /></button>
          <button onClick={resetAll} title="Alles zurücksetzen" style={{ width: 32, height: 30, border: '1px solid #e5e5e5', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 13 }}>⟲</button>
        </div>

        <div style={{ flex: 1 }} />
        {[['desktop','desktop'],['tablet-screen-button','tablet'],['mobile-screen','mobile']].map(([ic, d]) => (
          <button key={d} onClick={() => setDevice(d)} title={d} style={{ width: 30, height: 30, border: `1px solid ${device === d ? primary : '#e5e5e5'}`, borderRadius: 7, background: device === d ? '#f5f5f5' : '#fff', cursor: 'pointer', fontSize: 14, color: device === d ? primary : '#475569' }}><i className={`fa-solid fa-${ic}`} /></button>
        ))}
        <button onClick={() => { const n = !bewegungStopp; setBewegungStopp(n); iframeRef.current?.contentWindow?.postMessage({ cmd: 'bewegung', stopp: n }, '*') }}
          title={bewegungStopp ? 'Bewegung läuft wieder' : 'Bewegung anhalten (zum Bearbeiten)'}
          style={{ width: 30, height: 30, border: `1px solid ${bewegungStopp ? primary : '#e5e5e5'}`, borderRadius: 7, background: bewegungStopp ? primary + '14' : '#fff', cursor: 'pointer', fontSize: 13, color: bewegungStopp ? primary : '#475569' }}>
          <i className={`fa-solid fa-${bewegungStopp ? 'play' : 'pause'}`} />
        </button>
        <button onClick={() => { const n = !vorschau; setVorschau(n); if (n) { setSelected(null); setContSel(null) } }} title={vorschau ? 'Zurück zum Bearbeiten' : 'Vorschau – Seite ohne Baukasten-Elemente ansehen'} style={{ height: 30, border: `1px solid ${vorschau ? '#16a34a' : '#e5e5e5'}`, borderRadius: 7, background: vorschau ? '#16a34a14' : '#fff', cursor: 'pointer', fontSize: 12, color: vorschau ? '#16a34a' : '#475569', padding: '0 10px', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}><i className={`fa-solid fa-${vorschau ? 'pen' : 'eye'}`} />{vorschau ? 'Bearbeiten' : 'Vorschau'}</button>
        <button onClick={() => setNavOffen(o => !o)} title="Navigator – Struktur der Seite" style={{ height: 30, border: `1px solid ${navOffen ? PINK : '#e5e5e5'}`, borderRadius: 7, background: navOffen ? PINK + '14' : '#fff', cursor: 'pointer', fontSize: 12, color: navOffen ? PINK : '#475569', padding: '0 10px', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}><i className="fa-solid fa-layer-group" />Navigator</button>
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
        <div style={{ width: breiteLinks, borderRight: '1px solid #e5e5e5', display: 'flex', flexDirection: 'column', flexShrink: 0, background: '#fff', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5' }}>
            {[['Blöcke', 'blocks'], ['Bereiche', 'sections'], ['Seiten', 'pages']].map(([l, id]) => (
              <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: '9px 0', fontSize: 10, fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none', borderBottom: `2px solid ${tab === id ? primary : 'transparent'}`, color: tab === id ? '#111' : '#999', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {tab === 'blocks' && (
              <>
                <div style={{ fontSize: 9, color: '#bbb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 4px', marginBottom: 6 }}>Elemente – frei platzierbar</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 6 }}>
                  {EINZEL_ELEMENTE.map(el => (
                    <div key={el.type} draggable
                      onDragStart={e => { window.__wgDrag = el.type; e.dataTransfer.effectAllowed = 'copy'; try { e.dataTransfer.setData('text/plain', el.type) } catch {} }}
                      onDragEnd={() => { window.__wgDrag = null; iframeRef.current?.contentWindow?.postMessage({ cmd: 'wgDragEnd' }, '*') }}
                      onClick={() => { if (contSel && contSel.pfad) widgetEinfuegen(contSel.block, contSel.pfad, el.type) }}
                      title={contSel?.pfad ? 'Klick: in die pinke Auswahl einfügen' : 'In eine Karte/Spalte in der Vorschau ziehen'}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 4px 8px', border: '1px dashed #cbd5e1', borderRadius: 9, cursor: 'grab', background: '#fafbff', textAlign: 'center' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.background = '#f0fdf4' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#fafbff' }}>
                      <i className={`fa-solid fa-${el.fa}`} style={{ fontSize: 15, color: '#16a34a' }} />
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: '#334155', lineHeight: 1.15 }}>{el.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 9.5, color: '#94a3b8', lineHeight: 1.45, padding: '0 4px', marginBottom: 12 }}>In eine Karte, Spalte oder Rasterzelle ziehen – das Ziel leuchtet grün. Auch ganze Bausteine aus der Bibliothek unten lassen sich so IN einen Bereich ziehen.</div>

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
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, lineHeight: 1.5, padding: '0 4px' }}>Klick auf einen Block: wähle aus mehreren Design-Vorlagen mit Live-Vorschau.</div>
              </>
            )}
            {tab === 'sections' && (
              <>
                <div style={{ fontSize: 9, color: '#bbb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 4px', marginBottom: 6 }}>Bereiche dieser Seite</div>
                {blocks.map((b, i) => {
                  if (b.type === 'nav' || b.type === 'footer') return null
                  const meta = ADDABLE_BLOCKS.find(a => a.type === b.type)
                  const name = b.content?._name || BLOCK_REGISTRY[b.type]?.label || b.type
                  const active = (selected?.isSection && selected.block === i) || contSel?.block === i || selected?.block === i
                  return (
                    <div key={i} onClick={() => { setSelected({ isSection: true, block: i, secName: name }); iframeRef.current?.contentWindow?.postMessage({ cmd: 'gotoBlock', index: i }, '*') }} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', border: `1px solid ${active ? primary : '#e5e5e5'}`, borderRadius: 8, marginBottom: 5, cursor: 'pointer', background: active ? primary + '12' : '#fff' }}>
                      <i className={`fa-solid fa-${meta?.fa || 'cube'}`} style={{ fontSize: 13, color: primary, width: 16, textAlign: 'center' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#334155', flex: 1 }}>{name}</span>
                      <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 700 }}>{i}</span>
                    </div>
                  )
                })}
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 8, lineHeight: 1.5, padding: '0 4px' }}>Klick auf einen Bereich: springt in der Vorschau dorthin und öffnet die Bearbeitung rechts.</div>
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

        {/* Zieh-Griff links: Vorschau-Fläche variabel machen */}
        <div onMouseDown={(e) => panelZiehen(e, 'links')} title="Ziehen: linke Leiste breiter/schmaler" style={{ width: 6, cursor: 'col-resize', flexShrink: 0, background: zieht === 'links' ? PINK : '#eef1f5', borderRight: '1px solid #e5e5e5', transition: 'background .12s' }}
          onMouseEnter={e => { if (!zieht) e.currentTarget.style.background = PINK + '55' }} onMouseLeave={e => { if (!zieht) e.currentTarget.style.background = '#eef1f5' }} />

        {/* PREVIEW */}
        <div style={{ flex: 1, background: '#e8e8e8', overflow: 'auto', display: 'flex', justifyContent: 'center', padding: 16, position: 'relative', minWidth: 320 }}>
          <div style={{ width: device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '390px', maxWidth: '100%', transition: 'width 0.3s', position: 'relative', height: 'fit-content' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', overflow: 'hidden', borderRadius: 8 }}>
              <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%) rotate(-25deg)', fontSize: 13, fontWeight: 700, color: 'rgba(0,0,0,0.04)', letterSpacing: '0.3em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>websitegenerator24.de · Vorschau</div>
            </div>
            <iframe ref={iframeRef} style={{ width: '100%', minHeight: '85vh', border: 'none', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.12)', display: 'block', background: '#fff', pointerEvents: zieht ? 'none' : 'auto' }} />
          </div>
          {navOffen && (
            <Navigator baum={baum} primary={primary}
              aktivBlock={contSel ? contSel.block : selected?.block}
              aktivPfad={contSel ? (contSel.pfad ?? '') : selected?.pfad}
              onClose={() => setNavOffen(false)}
              onHover={(bi, pfad) => sendeAnVorschau({ cmd: 'hovPfad', block: bi, pfad })}
              onGehe={(bi, pfad, art) => sendeAnVorschau({ cmd: 'gehePfad', block: bi, pfad, art })}
              onName={(bi, name) => contFeld(bi, { _name: name })}
              onMove={(bi, dir) => moveBlock(bi, dir)}
              onDup={(bi) => dupBlock(bi)}
              onDel={(bi) => delBlock(bi)}
              onArrayOp={(bi, bind, op) => doArrayOp(bi, bind.feld, bind.index, op)}
            />
          )}
        </div>

        {/* Zieh-Griff rechts */}
        <div onMouseDown={(e) => panelZiehen(e, 'rechts')} title="Ziehen: rechte Leiste breiter/schmaler" style={{ width: 6, cursor: 'col-resize', flexShrink: 0, background: zieht === 'rechts' ? PINK : '#eef1f5', borderLeft: '1px solid #e5e5e5', transition: 'background .12s' }}
          onMouseEnter={e => { if (!zieht) e.currentTarget.style.background = PINK + '55' }} onMouseLeave={e => { if (!zieht) e.currentTarget.style.background = '#eef1f5' }} />

        {/* RIGHT PANEL */}
        <div style={{ width: breiteRechts, borderLeft: '1px solid #e5e5e5', background: '#fff', overflowY: 'auto', flexShrink: 0, padding: 14 }}>
          {contSel ? (
            <LayoutPanel contSel={contSel} primary={primary} content={pages[activePage]?.[contSel.block]?.content}
              blockTyp={pages[activePage]?.[contSel.block]?.type}
              onFelder={(f) => contFeld(contSel.block, f, true)}
              onLayout={(patch) => layoutAendern(contSel.block, contSel.pfad ?? '', patch)}
              onBreite={(m, w) => breiteAendern(contSel.block, m, w)}
              onFeld={(f) => contFeld(contSel.block, f)}
              onArrayOp={(op) => contSel.bind && doArrayOp(contSel.block, contSel.bind.feld, contSel.bind.index, op)}
              onWert={(k, v) => updateContent(contSel.block, k, v, false, true)}
              onClose={() => { sendCmd('deselect'); setContSel(null) }}
              onStilOeffnen={() => { const t = pages[activePage]?.[contSel.block]?.type; setContSel(null); setSelected({ isSection: true, block: contSel.block, secName: BLOCK_REGISTRY[t]?.label || 'Bereich' }) }}
              onEltern={() => { const p = String(contSel.pfad || '').split('.').slice(0, -1).join('.'); sendeAnVorschau({ cmd: 'gehePfad', block: contSel.block, pfad: contSel.pfad ? p : '' }) }}
            />
          ) : selected ? (
            <PropsPanel selected={selected} primary={primary} onLayout={selected.pfad != null ? (patch) => layoutAendern(selected.block, selected.pfad, patch) : null} onTextChange={(v) => { textLive(selected.block, selected.key, v); setSelected(sx => sx ? { ...sx, text: v } : sx) }} onLink={selected.linkPfad != null ? (href) => linkAendern(selected.block, selected.linkPfad, href) : null} palette={palette} sendCmd={sendCmd} onClose={() => { sendCmd('deselect'); setSelected(null) }} onImageClick={() => { setImgTarget({ blockIdx: selected.block, key: selected.key }); setLastImgClick({ blockIdx: selected.block, key: selected.key }); fileRef.current?.click() }} onAIImage={() => { setAiPanel(true); setAiTab('images') }} onSectionBg={(opts) => setSectionBg(selected.block, opts)} sectionContent={selected.isSection ? pages[activePage]?.[selected.block]?.content : null} onSectionImageUpload={() => { setImgTarget({ blockIdx: selected.block, key: '__sectionBg' }); fileRef.current?.click() }} onSectionField={(fields) => setSectionField(selected.block, fields)} onParallax={(on, speed) => applySectionParallax(selected.block, on, speed)} onIconClick={() => setIconPicker({ blockIdx: selected.block, key: selected.key })} onSetRating={(r) => updateContent(selected.block, selected.key, r, true)} imageQuota={imageQuota} imagesUsed={imagesUsed} />
          ) : (
          <div>
          <div style={{ fontSize: 9, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Logo</div>
          <div style={{ marginBottom: 14 }}>
            <button onClick={() => { setImgTarget('logo'); fileRef.current?.click() }} style={{ width: '100%', border: '1px dashed #cbd5e1', background: '#fafbff', padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#475569', marginBottom: 6 }}>Header-Logo hochladen</button>
            <button onClick={() => { setImgTarget('logoFooter'); fileRef.current?.click() }} style={{ width: '100%', border: '1px dashed #cbd5e1', background: '#fafbff', padding: '10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Footer-Logo (hell/invertiert)</button>
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
            {[['pen', 'Text anklicken – Panel rechts öffnet sich'], ['image', 'Bild anklicken – hochladen'], ['rotate', 'Layout-Variante wechseln'], ['clone', 'Block duplizieren'], ['up-down', 'Block verschieben'], ['rotate-left', 'Rückgängig']].map(([ic, t]) => (
              <div key={t} style={{ display: 'flex', gap: 8, fontSize: 11, color: '#666', padding: '3px 0', alignItems: 'center' }}><span style={{ width: 18, textAlign: 'center', color: '#94a3b8' }}><i className={`fa-solid fa-${ic}`} /></span><span>{t}</span></div>
            ))}
          </div>

          {projektIdRef.current && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
              <button onClick={jetztSpeichern} style={{ width: '100%', border: 'none', background: primary, color: '#fff', padding: 9, borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {speicherStatus === 'speichert' ? 'Speichert…' : 'Jetzt speichern'}
              </button>
              <div style={{ fontSize: 9.5, textAlign: 'center', marginTop: 6, minHeight: 13, color: speicherStatus === 'fehler' ? '#dc2626' : '#94a3b8', fontWeight: 600 }}>
                {speicherStatus === 'gespeichert' && <><i className="fa-solid fa-check" style={{ marginRight: 5 }} />In deinem Konto gespeichert</>}
                {speicherStatus === 'speichert' && 'Änderungen werden gesichert…'}
                {speicherStatus === 'fehler' && 'Speichern fehlgeschlagen'}
                {speicherStatus === '' && 'Änderungen werden automatisch gesichert'}
              </div>
              <button onClick={() => router.push('/dashboard')} style={{ width: '100%', border: '1px solid #e5e5e5', background: '#fff', padding: 8, borderRadius: 7, fontSize: 10, fontWeight: 600, cursor: 'pointer', color: '#666', marginTop: 8 }}><i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />Meine Websites</button>
            </div>
          )}
          <button onClick={() => { if (confirm('Neu starten? Aktuelle Website geht verloren.')) { sessionStorage.clear(); router.push('/start') } }} style={{ width: '100%', border: '1px solid #e5e5e5', background: '#fff', padding: 8, borderRadius: 7, fontSize: 10, fontWeight: 600, cursor: 'pointer', color: '#666', marginTop: 12 }}><i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }} />Neu starten</button>
          </div>
          )}
        </div>
      </div>

      {/* VOLLBILD-VORSCHAU: Seite wie live, responsiv testbar */}
      {vorschau && (
        <VorschauVollbild
          html={injectPattern(renderPage({ blocks, palette, font, fontHeadline, title: activePage, forEditor: false }))}
          seiten={pageList} aktiveSeite={activePage} onSeite={setActivePage}
          onSchliessen={() => setVorschau(false)}
        />
      )}

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
                    {isActive && <span style={{ fontSize: 11, color: '#fff' }}><i className="fa-solid fa-check" /></span>}
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
          <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}><i className="fa-solid fa-xmark" /></button>
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

  const tabs = [['seo', 'magnifying-glass', 'SEO'], ['headlines', 'heading', 'Headlines'], ['cta', 'bullhorn', 'CTA'], ['images', 'image', 'Bilder']]

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 500, width: 320, background: '#0f172a', borderRadius: 14, boxShadow: '0 12px 48px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}><i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 7 }} />AI Designer</span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 24, height: 24, borderRadius: 6, cursor: 'pointer' }}><i className="fa-solid fa-xmark" /></button>
      </div>
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {tabs.map(([id, ic, l]) => (
          <button key={id} onClick={() => setAiTab(id)} style={{ flex: 1, padding: '10px 4px', fontSize: 11, fontWeight: 600, background: aiTab === id ? 'rgba(255,255,255,0.1)' : 'none', border: 'none', color: aiTab === id ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', borderBottom: aiTab === id ? `2px solid ${primary}` : '2px solid transparent' }}><i className={`fa-solid fa-${ic}`} style={{ marginRight: 5 }} />{l}</button>
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
              <i className="fa-solid fa-lightbulb" style={{ marginRight: 6 }} />Alle Texte wurden bereits SEO-optimiert generiert. Du kannst sie direkt in der Vorschau anklicken und anpassen.
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
// ── Vollbild-Vorschau: die Seite wie live, mit Responsive-Test ──
// Desktop/Tablet/Mobil als Voreinstellung, zusätzlich frei ziehbare Breite
// über Griffe an beiden Seiten – zum Testen jedes Zwischenformats.
function VorschauVollbild({ html, seiten, aktiveSeite, onSeite, onSchliessen }) {
  const [breite, setBreite] = useState(0)          // 0 = volle Breite
  const [zieht, setZieht] = useState(false)
  const rahmenRef = useRef(null)
  const GERAETE = [['desktop', 'Desktop', 0], ['tablet-screen-button', 'Tablet', 768], ['mobile-screen', 'Mobil', 390]]
  const ziehen = (e, seite) => {
    e.preventDefault()
    setZieht(true)
    const startX = e.clientX
    const max = (rahmenRef.current?.clientWidth || window.innerWidth) - 24
    const start = breite === 0 ? max : breite
    const move = (ev) => {
      const d = (ev.clientX - startX) * (seite === 'rechts' ? 2 : -2)  // beidseitig symmetrisch
      setBreite(Math.max(300, Math.min(max, Math.round(start + d))))
    }
    const up = () => { setZieht(false); document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up) }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }
  const griffStil = { width: 14, cursor: 'col-resize', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#94a3b8' }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-eye" style={{ color: '#16a34a' }} />Vorschau</span>
        {seiten.length > 1 && (
          <select value={aktiveSeite} onChange={e => onSeite(e.target.value)} style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, padding: '5px 9px', fontSize: 12, fontFamily: 'inherit' }}>
            {seiten.map(pg => <option key={pg} value={pg} style={{ color: '#111' }}>{pg}</option>)}
          </select>
        )}
        <div style={{ flex: 1 }} />
        {GERAETE.map(([ic, l, w]) => (
          <button key={l} onClick={() => setBreite(w)} title={l} style={{ height: 32, padding: '0 12px', border: `1px solid ${breite === w ? '#16a34a' : 'rgba(255,255,255,0.18)'}`, borderRadius: 7, background: breite === w ? 'rgba(22,163,74,0.18)' : 'transparent', color: breite === w ? '#4ade80' : 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}><i className={`fa-solid fa-${ic}`} />{l}</button>
        ))}
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11.5, fontWeight: 700, minWidth: 76, textAlign: 'center' }}>{breite === 0 ? 'volle Breite' : breite + ' px'}</span>
        <button onClick={onSchliessen} style={{ height: 32, padding: '0 14px', border: 'none', borderRadius: 7, background: '#16a34a', color: '#fff', cursor: 'pointer', fontSize: 12.5, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 7 }}><i className="fa-solid fa-pen" />Zurück zum Bearbeiten</button>
      </div>
      <div ref={rahmenRef} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'stretch', padding: '0 12px 12px', overflow: 'hidden' }}>
        <div onMouseDown={e => ziehen(e, 'links')} title="Breite ziehen" style={griffStil}><i className="fa-solid fa-grip-lines-vertical" /></div>
        <div style={{ width: breite === 0 ? '100%' : breite, maxWidth: '100%', transition: zieht ? 'none' : 'width .2s', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 10px 60px rgba(0,0,0,0.5)' }}>
          <iframe title="Vorschau" srcDoc={html} style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: zieht ? 'none' : 'auto' }} />
        </div>
        <div onMouseDown={e => ziehen(e, 'rechts')} title="Breite ziehen" style={griffStil}><i className="fa-solid fa-grip-lines-vertical" /></div>
      </div>
    </div>
  )
}

// ── Abstände wie bei Elementor: 4 Felder (oben/rechts/unten/links) + Kette + Einheit ──
function AbstandGruppe({ titel, praefix, werte, onAendern, primary }) {
  const SEITEN = [['Top', 'OBEN'], ['Right', 'RECHTS'], ['Bottom', 'UNTEN'], ['Left', 'LINKS']]
  const zerlege = (v) => { const m = String(v ?? '').match(/^(-?[\d.]+)/); return m ? m[1] : '' }
  const [einheit, setEinheit] = useState(() => { const m = String(werte?.[praefix + 'Top'] ?? '').match(/(px|%|em|rem)/); return m ? m[1] : 'px' })
  const [kette, setKette] = useState(false)
  const [felder, setFelder] = useState(() => Object.fromEntries(SEITEN.map(([s]) => [s, zerlege(werte?.[praefix + s])])))
  const werteKey = JSON.stringify([werte?.[praefix + 'Top'], werte?.[praefix + 'Right'], werte?.[praefix + 'Bottom'], werte?.[praefix + 'Left']])
  useEffect(() => { setFelder(Object.fromEntries(SEITEN.map(([s]) => [s, zerlege(werte?.[praefix + s])]))) }, [werteKey]) // eslint-disable-line
  const setze = (seite, wert) => {
    const neu = kette ? Object.fromEntries(SEITEN.map(([s]) => [s, wert])) : { ...felder, [seite]: wert }
    setFelder(neu)
    const patch = {}
    ;(kette ? SEITEN.map(([s]) => s) : [seite]).forEach(s => { patch[praefix + s] = wert === '' ? '' : `${parseFloat(wert) || 0}${einheit}` })
    onAendern(patch)
  }
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{titel}</span>
        <span style={{ display: 'flex', gap: 2 }}>
          {['px', 'em', '%', 'rem'].map(u => (
            <button key={u} onClick={() => setEinheit(u)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 9.5, fontWeight: 700, color: einheit === u ? primary : '#94a3b8', textDecoration: einheit === u ? 'underline' : 'none', padding: '0 2px' }}>{u.toUpperCase()}</button>
          ))}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 26px', gap: 4, alignItems: 'start' }}>
        {SEITEN.map(([s, l]) => (
          <div key={s}>
            <input type="number" value={felder[s]} placeholder="–" onChange={e => setze(s, e.target.value)}
              style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 6, padding: '7px 4px', fontSize: 12, textAlign: 'center', fontFamily: 'inherit', outline: 'none' }} />
            <div style={{ fontSize: 7.5, fontWeight: 700, color: '#b6c0cd', textAlign: 'center', marginTop: 3, letterSpacing: '0.04em' }}>{l}</div>
          </div>
        ))}
        <button onClick={() => setKette(k => !k)} title="Werte verknüpfen (alle vier gleich)" style={{ height: 30, border: `1px solid ${kette ? primary : '#e5e5e5'}`, borderRadius: 6, background: kette ? primary + '14' : '#fff', color: kette ? primary : '#94a3b8', cursor: 'pointer', fontSize: 11 }}><i className="fa-solid fa-link" /></button>
      </div>
    </div>
  )
}

// ── Karten-Adresse LIVE suchen (OpenStreetMap / Nominatim, ohne Schlüssel) ──
// Tippen → Vorschläge → Klick setzt Adresse + GPS → Karte erscheint sofort.
function KartenSuche({ content, onFelder, primary }) {
  const [suche, setSuche] = useState(content?.adresse || '')
  const [treffer, setTreffer] = useState([])
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  const timer = useRef(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  const suchen = (q) => {
    setSuche(q); setFehler('')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      if (!q || q.trim().length < 3) { setTreffer([]); return }
      setLaedt(true)
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&accept-language=de&q=${encodeURIComponent(q)}`)
        const js = await r.json()
        setTreffer(Array.isArray(js) ? js : [])
        if (Array.isArray(js) && !js.length) setFehler('Keine Treffer – Adresse anders formulieren.')
      } catch { setTreffer([]); setFehler('Suche gerade nicht erreichbar.') }
      setLaedt(false)
    }, 450)
  }
  const waehlen = (t) => {
    setSuche(t.display_name); setTreffer([])
    onFelder({ adresse: t.display_name, lat: parseFloat(t.lat), lon: parseFloat(t.lon) })
  }
  return (
    <div style={{ marginBottom: 14, padding: 10, border: '1px solid #bbf7d0', background: '#f0fdf4', borderRadius: 9 }}>
      <div style={{ fontSize: 10, fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}><i className="fa-solid fa-map-location-dot" style={{ marginRight: 5 }} />Karte – Adresse live suchen</div>
      <div style={{ position: 'relative' }}>
        <input value={suche} onChange={e => suchen(e.target.value)} placeholder="Straße Hausnummer, Ort …"
          style={{ width: '100%', border: '1px solid #86efac', borderRadius: 7, padding: '8px 10px', fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
        {laedt && <i className="fa-solid fa-spinner fa-spin" style={{ position: 'absolute', right: 9, top: 9, fontSize: 12, color: '#16a34a' }} />}
      </div>
      {!!treffer.length && (
        <div style={{ marginTop: 5, border: '1px solid #bbf7d0', borderRadius: 7, background: '#fff', overflow: 'hidden' }}>
          {treffer.map((t, i) => (
            <div key={i} onClick={() => waehlen(t)} style={{ padding: '7px 9px', fontSize: 11, color: '#334155', cursor: 'pointer', borderBottom: i < treffer.length - 1 ? '1px solid #f0fdf4' : 'none', lineHeight: 1.4 }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4' }} onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}>
              <i className="fa-solid fa-location-dot" style={{ marginRight: 6, color: '#16a34a' }} />{t.display_name}
            </div>
          ))}
        </div>
      )}
      {!!fehler && <div style={{ fontSize: 10.5, color: '#b45309', marginTop: 5 }}>{fehler}</div>}
      <div style={{ display: 'flex', gap: 5, marginTop: 8, alignItems: 'center' }}>
        <input type="number" step="0.00001" defaultValue={content?.lat ?? ''} key={'lat' + (content?.lat ?? '')} placeholder="Breite (lat)" onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onFelder({ lat: v }) }}
          style={{ flex: 1, border: '1px solid #d1fae5', borderRadius: 6, padding: '6px 7px', fontSize: 10.5, fontFamily: 'monospace', outline: 'none', minWidth: 0 }} />
        <input type="number" step="0.00001" defaultValue={content?.lon ?? ''} key={'lon' + (content?.lon ?? '')} placeholder="Länge (lon)" onBlur={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onFelder({ lon: v }) }}
          style={{ flex: 1, border: '1px solid #d1fae5', borderRadius: 6, padding: '6px 7px', fontSize: 10.5, fontFamily: 'monospace', outline: 'none', minWidth: 0 }} />
      </div>
      <div style={{ fontSize: 9.5, color: '#15803d', marginTop: 6, lineHeight: 1.4 }}>Treffer anklicken → Karte springt sofort auf den Ort. GPS-Felder für Feinjustierung. Daten: OpenStreetMap/Nominatim.</div>
    </div>
  )
}

// ── Panel für gewählte Sektion / Container (pinke Elementor-Auswahl) ──
function LayoutPanel({ contSel, primary, content, onLayout, onBreite, onFeld, onArrayOp, onClose, onStilOeffnen, onEltern, onWert, blockTyp, onFelder }) {
  const einbau = contSel.bind?.feld === '_einbau' ? (content?._einbau || [])[contSel.bind.index] : null
  const [codeText, setCodeText] = useState(einbau?.art === 'html' ? (einbau.html || '') : '')
  const codeTimer = useRef(null)
  useEffect(() => { setCodeText(einbau?.art === 'html' ? (einbau.html || '') : '') }, [contSel.block, contSel.pfad]) // eslint-disable-line
  useEffect(() => () => { if (codeTimer.current) clearTimeout(codeTimer.current) }, [])
  const istSek = contSel.kind === 'sektion'
  const eintrag = (content?._layout || {})[contSel.pfad ?? ''] || {}
  const werte = { ...(contSel.stil || {}), ...eintrag }
  const br = content?._breite || null
  const [zIdx, setZIdx] = useState(eintrag.zIndex ?? '')
  const [boxBreite, setBoxBreite] = useState(br?.wert || 1160)
  useEffect(() => { setZIdx(eintrag.zIndex ?? ''); setBoxBreite((content?._breite?.wert) || 1160) }, [contSel.block, contSel.pfad]) // eslint-disable-line
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: '#e6007e', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <i className={`fa-solid fa-${istSek ? 'table-cells-large' : 'square-full'}`} style={{ fontSize: 11 }} />{contSel.name || (istSek ? 'Sektion' : 'Container')}
        </span>
        <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', width: 26, height: 26, borderRadius: 7, cursor: 'pointer', fontSize: 12 }}><i className="fa-solid fa-xmark" /></button>
      </div>
      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 12 }}>{contSel.stil?.breite} × {contSel.stil?.hoehe} px {istSek ? '· Sektion' : '· innerhalb der Sektion'}</div>

      {istSek && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Name der Sektion</div>
          <input defaultValue={content?._name || contSel.name} key={contSel.block}
            onBlur={e => onFeld({ _name: e.target.value.trim() })}
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
            style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 7, padding: '8px 10px', fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
        </div>
      )}

      {!istSek && (
        <button onClick={onEltern} style={{ width: '100%', border: '1px solid #e5e5e5', background: '#fff', padding: '7px 0', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#475569', marginBottom: 12 }}><i className="fa-solid fa-turn-up" style={{ marginRight: 6 }} />Übergeordnetes Element wählen</button>
      )}

      {blockTyp === 'karte' && onFelder && (
        <KartenSuche content={content} onFelder={onFelder} primary={primary} />
      )}

      {contSel.bind && (
        <div style={{ marginBottom: 14, padding: 10, border: '1px solid #fbcfe8', background: '#fdf2f8', borderRadius: 9 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#be185d', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Karte {contSel.bind.index + 1} · Liste „{contSel.bind.feld}“</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[['hoch', 'arrow-left', 'Vor'], ['runter', 'arrow-right', 'Zurück'], ['dup', 'clone', 'Klonen'], ['del', 'xmark', 'Löschen']].map(([op, ic, l]) => (
              <button key={op} onClick={() => onArrayOp(op)} style={{ flex: 1, border: '1px solid #f9a8d4', borderRadius: 6, background: '#fff', padding: '7px 0', fontSize: 10, fontWeight: 700, cursor: 'pointer', color: op === 'del' ? '#dc2626' : '#9d174d' }}><i className={`fa-solid fa-${ic}`} style={{ marginRight: 3 }} />{l}</button>
            ))}
          </div>
          <div style={{ fontSize: 9.5, color: '#be185d', marginTop: 6, lineHeight: 1.4 }}>Klonen/Löschen ändert die Inhalts-Liste – die anderen Karten bleiben unangetastet.</div>
        </div>
      )}

      {einbau?.art === 'html' && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Eigener HTML-Code</div>
          <textarea value={codeText} onChange={e => { const v = e.target.value; setCodeText(v); if (codeTimer.current) clearTimeout(codeTimer.current); codeTimer.current = setTimeout(() => onWert(`_einbau.${contSel.bind.index}.html`, v), 900) }} rows={7} spellCheck={false}
            style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 8, padding: 9, fontSize: 11.5, fontFamily: 'monospace', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          <div style={{ fontSize: 10, color: '#16a34a', marginTop: 5, fontWeight: 600 }}><i className="fa-solid fa-bolt" style={{ marginRight: 5 }} />Wird beim Tippen automatisch übernommen.</div>
        </div>
      )}
      {einbau?.art === 'abstand' && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Höhe des Abstands</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="number" defaultValue={einbau.hoehe || 32} key={'ab' + contSel.pfad} onBlur={e => onWert(`_einbau.${contSel.bind.index}.hoehe`, parseInt(e.target.value) || 32)} onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
              style={{ flex: 1, border: '1px solid #e5e5e5', borderRadius: 7, padding: '8px 10px', fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>px</span>
          </div>
        </div>
      )}
      {einbau?.art === 'button' && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Button-Ziel (Link)</div>
          <input defaultValue={einbau.href || '#'} key={'bh' + contSel.pfad} onBlur={e => onWert(`_einbau.${contSel.bind.index}.href`, e.target.value.trim() || '#')} onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
            placeholder="kontakt.html oder https://…" style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 7, padding: '8px 10px', fontSize: 12, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      )}

      <AbstandGruppe titel="Außenabstand (Margin)" praefix="margin" werte={werte} onAendern={onLayout} primary={primary} />
      <AbstandGruppe titel="Innenabstand (Padding)" praefix="padding" werte={werte} onAendern={onLayout} primary={primary} />

      {istSek && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Inhaltsbreite</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {[[null, 'Standard'], ['boxed', 'Boxed'], ['voll', 'Volle Breite']].map(([m, l]) => (
              <button key={l} onClick={() => onBreite(m, m === 'boxed' ? boxBreite : undefined)} style={{ flex: 1, border: `1px solid ${(br?.modus ?? null) === m ? primary : '#e5e5e5'}`, borderRadius: 6, background: (br?.modus ?? null) === m ? primary + '12' : '#fff', padding: '7px 0', fontSize: 10.5, fontWeight: 700, cursor: 'pointer', color: (br?.modus ?? null) === m ? primary : '#475569' }}>{l}</button>
            ))}
          </div>
          {br?.modus === 'boxed' && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="number" value={boxBreite} onChange={e => { const w = parseInt(e.target.value) || 1160; setBoxBreite(w); onBreite('boxed', w) }} style={{ flex: 1, border: '1px solid #e5e5e5', borderRadius: 6, padding: '7px 8px', fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>px</span>
            </div>
          )}
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Z-Index</div>
        <input type="number" value={zIdx} placeholder="automatisch" onChange={e => { setZIdx(e.target.value); onLayout({ zIndex: e.target.value }) }} style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 7, padding: '8px 10px', fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
      </div>

      {istSek && (
        <>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>CSS-ID</div>
            <input defaultValue={content?._cssId || ''} key={'id' + contSel.block} onBlur={e => onFeld({ _cssId: e.target.value.trim() })} placeholder="z. B. angebot" style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 7, padding: '8px 10px', fontSize: 12, fontFamily: 'monospace', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>CSS-Klassen</div>
            <input defaultValue={content?._cssKlassen || ''} key={'kl' + contSel.block} onBlur={e => onFeld({ _cssKlassen: e.target.value.trim() })} placeholder="meine-klasse andere" style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 7, padding: '8px 10px', fontSize: 12, fontFamily: 'monospace', outline: 'none' }} />
          </div>
          <button onClick={onStilOeffnen} style={{ width: '100%', border: 'none', background: primary, color: '#fff', padding: '9px 0', borderRadius: 7, fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}><i className="fa-solid fa-palette" style={{ marginRight: 6 }} />Hintergrund &amp; Stil bearbeiten</button>
        </>
      )}
      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 12, lineHeight: 1.5 }}><i className="fa-solid fa-lightbulb" style={{ marginRight: 5 }} />Kanten der pinken Auswahl ziehen = Innenabstand. Trennlinien zwischen Spalten ziehen = Spaltenbreite.</div>
    </div>
  )
}

// ── Navigator: Strukturbaum der Seite (wie Elementor) ──
function Navigator({ baum, primary, onClose, onHover, onGehe, onName, onMove, onDup, onDel, onArrayOp, aktivBlock, aktivPfad }) {
  const [offen, setOffen] = useState({})
  const [editiert, setEditiert] = useState(null)
  const aktivRef = useRef(null)
  // Auswahl in der Vorschau → Sektion aufklappen und zur Zeile scrollen (wie Elementor)
  useEffect(() => {
    if (aktivBlock == null) return
    setOffen(o => (o[aktivBlock] === false ? { ...o, [aktivBlock]: true } : o))
    const t = setTimeout(() => { aktivRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, 60)
    return () => clearTimeout(t)
  }, [aktivBlock, aktivPfad])
  const ICONS = { container: 'square-full', text: 'font', bild: 'image', icon: 'star', sterne: 'star' }
  const Zeile = ({ knoten, bi, tiefe }) => {
    const istAktiv = bi === aktivBlock && knoten.pfad != null && knoten.pfad === aktivPfad
    return (
      <div>
        <div ref={istAktiv ? aktivRef : null} onMouseEnter={() => onHover(bi, knoten.pfad)} onMouseLeave={() => onHover(bi, null)} onClick={() => onGehe(bi, knoten.pfad, knoten.art)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 8px', paddingLeft: 8 + tiefe * 14, borderRadius: 6, cursor: 'pointer', fontSize: 11, color: istAktiv ? '#9d174d' : '#475569', background: istAktiv ? '#fce7f3' : 'transparent', fontWeight: istAktiv ? 700 : 400 }}
          onMouseOver={e => { if (!istAktiv) e.currentTarget.style.background = '#fdf2f8' }} onMouseOut={e => { e.currentTarget.style.background = istAktiv ? '#fce7f3' : 'transparent' }}>
          <i className={`fa-solid fa-${ICONS[knoten.art] || 'square-full'}`} style={{ fontSize: 9, color: '#e6007e', width: 12, textAlign: 'center' }} />
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{knoten.label}</span>
          {knoten.bind && (
            <span style={{ display: 'flex', gap: 1 }} onClick={e => e.stopPropagation()}>
              {[['hoch', 'arrow-up', 'Vor'], ['runter', 'arrow-down', 'Zurück'], ['dup', 'clone', 'Klonen'], ['del', 'xmark', 'Löschen']].map(([op, ic, t]) => (
                <button key={op} title={t} onClick={() => onArrayOp(bi, knoten.bind, op)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: op === 'del' ? '#f87171' : '#c4899f', fontSize: 9, width: 15, height: 15, padding: 0 }}><i className={`fa-solid fa-${ic}`} /></button>
              ))}
            </span>
          )}
        </div>
        {(knoten.kinder || []).map((k, i) => <Zeile key={i} knoten={k} bi={bi} tiefe={tiefe + 1} />)}
      </div>
    )
  }
  return (
    <div style={{ position: 'absolute', top: 10, right: 10, bottom: 10, width: 250, background: '#fff', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.18)', zIndex: 30, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
      <div style={{ padding: '10px 12px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 12 }}><i className="fa-solid fa-layer-group" style={{ marginRight: 7, color: '#e6007e' }} />Navigator</span>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 22, height: 22, borderRadius: 6, cursor: 'pointer', fontSize: 11 }}><i className="fa-solid fa-xmark" /></button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 6 }}>
        {baum.map((sek) => {
          const auf = offen[sek.bi] !== false
          const istAktiv = aktivBlock === sek.bi && (aktivPfad === '' || aktivPfad == null)
          return (
            <div key={sek.bi} style={{ marginBottom: 2 }}>
              <div onMouseEnter={() => onHover(sek.bi, '')} onMouseLeave={() => onHover(sek.bi, null)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 7, background: istAktiv ? '#fdf2f8' : '#f8fafc', border: `1px solid ${istAktiv ? '#f9a8d4' : '#f1f5f9'}`, cursor: 'pointer' }}>
                <button onClick={() => setOffen(o => ({ ...o, [sek.bi]: !auf }))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 9, width: 14 }}><i className={`fa-solid fa-chevron-${auf ? 'down' : 'right'}`} /></button>
                {editiert === sek.bi ? (
                  <input autoFocus defaultValue={sek.label} onBlur={e => { onName(sek.bi, e.target.value.trim()); setEditiert(null) }} onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') setEditiert(null) }}
                    style={{ flex: 1, border: '1px solid #e6007e', borderRadius: 5, padding: '2px 6px', fontSize: 11, fontFamily: 'inherit', outline: 'none' }} />
                ) : (
                  <span onClick={() => onGehe(sek.bi, '', 'sektion')} onDoubleClick={() => setEditiert(sek.bi)} title="Doppelklick: umbenennen" style={{ flex: 1, fontSize: 11.5, fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sek.label}</span>
                )}
                <span style={{ display: 'flex', gap: 1 }}>
                  {[['up', 'arrow-up', () => onMove(sek.bi, -1)], ['down', 'arrow-down', () => onMove(sek.bi, 1)], ['dup', 'clone', () => onDup(sek.bi)], ['del', 'xmark', () => onDel(sek.bi)]].map(([k, ic, fn]) => (
                    <button key={k} onClick={e => { e.stopPropagation(); fn() }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: k === 'del' ? '#f87171' : '#94a3b8', fontSize: 10, width: 17, height: 17 }}><i className={`fa-solid fa-${ic}`} /></button>
                  ))}
                </span>
              </div>
              {auf && (sek.kinder || []).map((k, i) => <Zeile key={i} knoten={k} bi={sek.bi} tiefe={1} />)}
            </div>
          )
        })}
        {!baum.length && <div style={{ fontSize: 11, color: '#94a3b8', padding: 12, textAlign: 'center' }}>Struktur wird geladen…</div>}
      </div>
      <div style={{ padding: '8px 12px', borderTop: '1px solid #f1f5f9', fontSize: 9.5, color: '#94a3b8', lineHeight: 1.4 }}>Klick wählt das Element in der Vorschau. Doppelklick auf einen Sektionsnamen benennt ihn um.</div>
    </div>
  )
}

function PropsPanel({ selected, primary, palette, sendCmd, onClose, onTextChange, onLink, onImageClick, onAIImage, onSectionBg, sectionContent, onSectionImageUpload, onSectionField, onParallax, onIconClick, onSetRating, imageQuota = 8, imagesUsed = 0, onLayout }) {
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
          <div style={{ width: 28, height: 28, borderRadius: 7, background: primary + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{selected.isImg ? <i className="fa-solid fa-image" /> : 'T'}</div>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>{label}</span>
        </div>
        <button onClick={onClose} style={{ background: '#f5f5f5', border: 'none', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontSize: 13, color: '#666' }}><i className="fa-solid fa-xmark" /></button>
      </div>

      {/* Element-Aktionen */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
        <button onClick={() => sendCmd('dupEl')} title="Duplizieren" style={{ flex: 1, padding: '8px 0', border: '1px solid #e5e5e5', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#475569' }}><i className="fa-solid fa-clone" style={{ marginRight: 5 }} />Klonen</button>
        <button onClick={() => sendCmd('delEl')} title="Löschen" style={{ flex: 1, padding: '8px 0', border: '1px solid #fecaca', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#dc2626' }}><i className="fa-solid fa-xmark" style={{ marginRight: 5 }} />Löschen</button>
      </div>

      {selected.isText && (
        <Section title="Inhalt bearbeiten">
          <TextFeld
            wert={selected.text || ''}
            primary={primary}
            imLink={selected.linkPfad != null}
            onLive={v => onTextChange(v)}
          />
        </Section>
      )}

      {onLink && (
        <Section title="Verlinkung (Ziel)">
          <input defaultValue={selected.linkHref || ''} key={'lnk' + selected.block + (selected.linkPfad || '')}
            placeholder="kontakt.html, #bereich oder https://…"
            onChange={e => onLink(e.target.value)}
            style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 7, padding: '8px 10px', fontSize: 12, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }} />
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 5, lineHeight: 1.45 }}>Setzt das Ziel des Buttons/Links – Design und Text bleiben unangetastet. Gilt live und auf der fertigen Seite.</div>
        </Section>
      )}

      {selected.isSection ? (
        <>
          <Section title="Eigener Code (HTML / CSS / JS)">
            <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.55, marginBottom: 9 }}>
              Volle Freiheit für diesen Bereich. CSS wirkt automatisch nur hier – mit <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 4 }}>&amp;</code> sprichst du den Bereich selbst an.
            </div>
            <CodeFeld label="HTML (ersetzt den Bereich)" wert={sectionContent?.customHTML || ''} sprache="html" primary={primary}
              onSpeichern={v => onSectionField({ customHTML: v })} />
            <CodeFeld label="CSS" wert={sectionContent?.customCSS || ''} sprache="css" primary={primary}
              onSpeichern={v => onSectionField({ customCSS: v })} />
            <CodeFeld label="JavaScript" wert={sectionContent?.customJS || ''} sprache="js" primary={primary}
              onSpeichern={v => onSectionField({ customJS: v })} />
          </Section>

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
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${sectionContent?.bgParallax ? primary : '#ccc'}`, background: sectionContent?.bgParallax ? primary : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11 }}>{sectionContent?.bgParallax ? <i className="fa-solid fa-check" /> : ''}</div>
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
          <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}><i className="fa-solid fa-lightbulb" style={{ marginRight: 6 }} />Klick auf einzelne Elemente (Text, Icons, Buttons) im Bereich, um sie separat zu bearbeiten.</div>
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
              {[['left', 'align-left', 'Links'], ['center', 'align-center', 'Mitte'], ['right', 'align-right', 'Rechts'], ['justify', 'align-justify', 'Blocksatz']].map(([val, ic, t]) => (
                <button key={val} title={t} onClick={() => sendCmd('align', val)} style={{ flex: 1, padding: '9px 0', border: `1px solid ${selected.align === val ? primary : '#e5e5e5'}`, borderRadius: 7, background: selected.align === val ? primary + '0d' : '#fff', cursor: 'pointer', fontSize: 13, color: selected.align === val ? primary : '#475569' }}><i className={`fa-solid fa-${ic}`} /></button>
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

          {onLayout && (
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12, marginTop: 4 }}>
              <div style={{ fontSize: 9, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Erweitert – Abstände</div>
              <AbstandGruppe titel="Außenabstand (Margin)" praefix="margin" werte={selected.stil || {}} onAendern={onLayout} primary={primary} />
              <AbstandGruppe titel="Innenabstand (Padding)" praefix="padding" werte={selected.stil || {}} onAendern={onLayout} primary={primary} />
            </div>
          )}
          <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}><i className="fa-solid fa-lightbulb" style={{ marginRight: 6 }} />Einfacher Klick auf den Text in der Vorschau – dann direkt tippen oder das Feld oben im Panel benutzen.</div>
        </>
      )}
    </div>
  )
}

function SeoRow({ ok, label, val }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 12 }}>
      <span style={{ color: ok ? '#22c55e' : '#f59e0b' }}><i className={`fa-solid fa-${ok ? 'check' : 'triangle-exclamation'}`} /></span>
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
            <button onClick={einsetzen} style={{ flex: 1, background: primary, color: '#fff', border: 'none', borderRadius: 7, padding: '9px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}><i className="fa-solid fa-check" style={{ marginRight: 5 }} />Einsetzen</button>
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
            {loading ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} />Wird generiert…</> : rest <= 0 ? 'Kontingent aufgebraucht' : <><i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 6 }} />Bild generieren</>}
          </button>
        </>
      )}
    </div>
  )
}

function buildDefaultContent(type) {
  // Die Standardinhalte stehen an EINER Stelle: lib/blocks.js (ALLE_DEFAULTS).
  // Früher gab es hier eine zweite Liste mit Emojis und Platzhaltern wie
  // "Absatz 1." – die hat die guten Vorgaben überschrieben.
  const d = ALLE_DEFAULTS[type]
  return d ? JSON.parse(JSON.stringify(d)) : {}
}


// Eingabefeld für eigenen Code (HTML/CSS/JS) – speichert erst auf Klick,
// damit nicht bei jedem Tastendruck neu gerendert wird.
function CodeFeld({ label, wert, sprache, primary, onSpeichern }) {
  const [text, setText] = useState(wert || '')
  const [offen, setOffen] = useState(false)
  const timerRef = useRef(null)
  const eigenRef = useRef(wert || '')
  useEffect(() => { if ((wert || '') !== eigenRef.current) { eigenRef.current = wert || ''; setText(wert || '') } }, [wert])
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])
  // Live: Code fließt entprellt (Neuaufbau der Vorschau ist hier nötig)
  const live = (v) => {
    eigenRef.current = v
    setText(v)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSpeichern(v), 900)
  }
  const farbe = { html: '#e11d48', css: '#2563eb', js: '#ca8a04' }[sprache] || '#475569'
  return (
    <div style={{ marginBottom: 10, border: '1px solid #e5e5e5', borderRadius: 9, overflow: 'hidden' }}>
      <button onClick={() => setOffen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', background: '#fafbfc', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: farbe, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#334155' }}>{label}</span>
        {!!(wert || '').trim() && <span style={{ fontSize: 9.5, fontWeight: 800, background: primary, color: '#fff', padding: '2px 6px', borderRadius: 99 }}>AKTIV</span>}
        <i className={`fa-solid fa-chevron-${offen ? 'up' : 'down'}`} style={{ fontSize: 10, color: '#94a3b8' }} />
      </button>
      {offen && (
        <div style={{ padding: 10, borderTop: '1px solid #eef2f6' }}>
          <textarea value={text} onChange={e => live(e.target.value)} rows={8} spellCheck={false}
            placeholder={sprache === 'html' ? '<div>Eigenes HTML …</div>' : sprache === 'css' ? '& { background: #111; }\n& h2 { color: gold; }' : "block.querySelector('h2').style.opacity = .9"}
            style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 7, padding: 9, fontSize: 11.5, fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace', lineHeight: 1.55, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 7, marginTop: 8, alignItems: 'center' }}>
            <span style={{ flex: 1, fontSize: 10.5, color: '#16a34a', fontWeight: 600 }}><i className="fa-solid fa-bolt" style={{ marginRight: 5 }} />Wird beim Tippen automatisch übernommen.</span>
            {!!text && <button onClick={() => { setText(''); eigenRef.current = ''; onSpeichern('') }} style={{ border: '1px solid #e5e5e5', background: '#fff', borderRadius: 7, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#64748b', fontFamily: 'inherit' }}>Leeren</button>}
          </div>
        </div>
      )}
    </div>
  )
}


// Panel-Eingabe für Texte, Zahlen und Beschriftungen.
// Zusätzlich zur Direktbearbeitung in der Vorschau – wichtig bei Elementen,
// die sich bewegen oder schwer zu treffen sind.
// ── Font-Awesome-Bibliothek (Free) für den Text-Editor ──
// Solid-Icons + gängige Marken; zusätzlich freie Eingabe für jeden Namen.
const FA_SOLID = ('star heart check xmark plus minus circle-check circle-xmark circle-info circle-question circle-exclamation triangle-exclamation thumbs-up thumbs-down face-smile face-frown face-meh fire bolt sun moon cloud cloud-rain snowflake droplet leaf seedling tree feather bug spider fish dove crow paw shield shield-halved lock lock-open key user user-plus user-check user-group users user-tie user-gear person person-walking person-running children baby house house-chimney building building-columns city shop store warehouse industry hotel school hospital church landmark bridge road map map-pin map-location-dot location-dot location-arrow compass route signs-post car car-side taxi bus van-shuttle truck truck-fast truck-pickup motorcycle bicycle train plane plane-departure plane-arrival ship anchor rocket gauge gas-pump charging-station phone phone-volume mobile mobile-screen tablet-screen-button laptop desktop computer tv camera camera-retro video film microphone headphones music volume-high volume-low play pause stop forward backward envelope envelope-open paper-plane inbox at comment comments message bell bell-slash share share-nodes rss wifi signal satellite-dish globe earth-europe earth-americas language calendar calendar-days calendar-check clock hourglass stopwatch timer bars ellipsis grip magnifying-glass magnifying-glass-plus filter sliders gear gears wrench screwdriver screwdriver-wrench hammer toolbox paint-roller paintbrush palette brush pen pencil pen-to-square highlighter eraser scissors ruler ruler-combined pen-ruler compass-drafting stapler paperclip thumbtack link link-slash copy paste clipboard clipboard-check file file-lines file-pdf file-word file-excel file-image file-zipper folder folder-open box box-open boxes-stacked archive book book-open bookmark newspaper graduation-cap chalkboard award trophy medal certificate ribbon gem crown gift cart-shopping bag-shopping basket-shopping credit-card money-bill money-bill-wave coins piggy-bank wallet receipt tag tags percent scale-balanced chart-line chart-column chart-pie chart-area arrow-trend-up arrow-trend-down briefcase handshake handshake-angle hand hand-holding-heart hands-holding people-group rotate rotate-left rotate-right arrows-rotate repeat shuffle arrow-up arrow-down arrow-left arrow-right arrow-up-right-from-square up-down-left-right maximize minimize expand compress eye eye-slash heart-pulse stethoscope syringe pills capsules prescription-bottle kit-medical tooth brain lungs virus bacteria dna weight-scale dumbbell person-swimming futbol basketball baseball table-tennis-paddle-ball golf-ball-tee medal utensils utensil-spoon fork-knife plate-wheat burger pizza-slice hotdog ice-cream cake-candles mug-hot mug-saucer wine-glass martini-glass beer-mug-empty seedling apple-whole carrot lemon egg fish-fins shrimp bone cookie candy-cane wheat-awn jar bottle-water temperature-high temperature-low fan snowplow umbrella umbrella-beach mountain mountain-sun water ship sailboat masks-theater ticket ticket-simple gamepad chess chess-knight dice dice-five puzzle-piece wand-magic-sparkles hat-wizard ghost robot alien-8bit lightbulb plug plug-circle-bolt battery-full battery-half solar-panel wind broom soap spray-can-sparkles recycle trash trash-can dumpster bath shower toilet faucet sink couch chair bed lamp door-open door-closed window-restore stairs elevator igloo campground tent caravan bell-concierge suitcase suitcase-rolling passport id-card address-card signature stamp scroll section gavel handcuffs building-shield person-military-pointing binoculars magnifying-glass-location fingerprint spa hand-sparkles hand-holding-droplet pump-soap mask-face head-side-mask vial vials microscope flask atom magnet radiation biohazard skull-crossbones fire-extinguisher house-fire truck-medical bell-school bus-simple cable-car ferry helicopter jet-fighter parachute-box satellite shuttle-space sim-card microchip memory hard-drive database server network-wired ethernet code code-branch code-merge terminal bug-slash cube cubes layer-group sitemap diagram-project qrcode barcode print scanner-touchscreen keyboard computer-mouse power-off circle-play circle-pause circle-stop backward-step forward-step infinity equals divide calculator square-root-variable pi superscript subscript quote-left quote-right heading paragraph text-height text-width align-left align-center align-right align-justify list list-ol list-check indent outdent table table-cells table-list border-all vector-square crop crop-simple object-group object-ungroup clone images image photo-film panorama circle-half-stroke droplet-slash swatchbook stamp wand-magic spell-check font italic bold underline strikethrough').split(' ')
const FA_MARKEN = 'facebook-f instagram linkedin-in x-twitter youtube tiktok whatsapp pinterest-p snapchat telegram github google apple amazon paypal stripe cc-visa cc-mastercard android windows'.split(' ')

// ── Text-Editor im Panel: echtes Bearbeiten wie in WordPress ──
// „Editor“ = visuelles Bearbeiten mit Werkzeugleiste + Font-Awesome-Icons,
// „HTML“ = Roh-Ansicht. Beides schreibt denselben Wert.
function TextFeld({ wert, primary, onLive, imLink = false }) {
  const [htmlModus, setHtmlModus] = useState(false)
  const [text, setText] = useState(wert || '')
  const [iconOffen, setIconOffen] = useState(false)
  const [iconSuche, setIconSuche] = useState('')
  const [linkOffen, setLinkOffen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const editRef = useRef(null)
  const rangeRef = useRef(null)
  const timerRef = useRef(null)
  const wertRef = useRef(wert || '')
  useEffect(() => {
    if ((wert || '') === wertRef.current) return   // eigenes Live-Update kam zurück
    wertRef.current = wert || ''
    setText(wert || ''); setIconOffen(false); setLinkOffen(false)
    if (editRef.current) editRef.current.innerHTML = wert || ''
  }, [wert])
  useEffect(() => { if (!htmlModus && editRef.current) editRef.current.innerHTML = text }, [htmlModus]) // eslint-disable-line
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])
  // ALLES LIVE: Änderungen fließen entprellt sofort in Vorschau + Inhalt.
  const live = (v) => {
    wertRef.current = v
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onLive(v), 280)
  }
  const merken = () => { const s = window.getSelection(); if (s && s.rangeCount && editRef.current && editRef.current.contains(s.anchorNode)) rangeRef.current = s.getRangeAt(0).cloneRange() }
  const herstellen = () => { const r = rangeRef.current; if (!r) return; try { const s = window.getSelection(); s.removeAllRanges(); s.addRange(r) } catch {} }
  const uebernehmen = () => { if (editRef.current) { setText(editRef.current.innerHTML); live(editRef.current.innerHTML) } }
  const cmd = (c, v) => { editRef.current?.focus(); herstellen(); document.execCommand(c, false, v); uebernehmen(); merken() }
  const einfuegen = (html) => { editRef.current?.focus(); herstellen(); document.execCommand('insertHTML', false, html); uebernehmen(); merken() }
  // Link setzen: ohne Auswahl wird der GANZE Text verlinkt – so geht der
  // Link nie „verloren“, und im HTML-Tab steht sichtbar das <a href="…">.
  const linkSetzen = () => {
    if (!editRef.current) return
    editRef.current.focus()
    herstellen()
    const s = window.getSelection()
    if (!s || !s.rangeCount || s.isCollapsed || !editRef.current.contains(s.anchorNode)) {
      const r = document.createRange(); r.selectNodeContents(editRef.current)
      s.removeAllRanges(); s.addRange(r)
    }
    document.execCommand('createLink', false, linkUrl || '#')
    uebernehmen(); merken()
    setLinkOffen(false)
  }
  const KNOPF = { minWidth: 26, height: 26, border: '1px solid #e5e5e5', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 11, color: '#475569', padding: '0 5px' }
  const treffer = (iconSuche
    ? FA_SOLID.filter(n => n.includes(iconSuche.toLowerCase())).map(n => [n, 'solid']).concat(FA_MARKEN.filter(n => n.includes(iconSuche.toLowerCase())).map(n => [n, 'brands']))
    : FA_SOLID.slice(0, 48).map(n => [n, 'solid'])
  ).slice(0, 60)
  return (
    <div>
      <div style={{ display: 'flex', gap: 5, marginBottom: 7 }}>
        {[['Editor', false], ['HTML', true]].map(([l, v]) => (
          <button key={l} onClick={() => { if (v && editRef.current && !htmlModus) setText(editRef.current.innerHTML); setHtmlModus(v) }} style={{ flex: 1, padding: '6px 0', border: `1px solid ${htmlModus === v ? primary : '#e5e5e5'}`, borderRadius: 6, background: htmlModus === v ? primary + '12' : '#fff', color: htmlModus === v ? primary : '#64748b', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
        ))}
      </div>

      {htmlModus ? (
        <textarea value={text} onChange={e => { setText(e.target.value); live(e.target.value) }} rows={8} spellCheck={false}
          placeholder='<h2>Überschrift</h2> <b>fett</b> <i class="fa-solid fa-star"></i>'
          style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 7, padding: 9, fontSize: 11.5, fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace', lineHeight: 1.6, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
      ) : (
        <>
          {/* Werkzeugleiste */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 6, alignItems: 'center' }}>
            <select onChange={e => { cmd('formatBlock', e.target.value); e.target.value = '' }} defaultValue="" style={{ height: 26, border: '1px solid #e5e5e5', borderRadius: 6, fontSize: 11, color: '#475569', fontFamily: 'inherit', maxWidth: 78 }}>
              <option value="" disabled>Absatz</option>
              <option value="p">Absatz</option>
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
              <option value="blockquote">Zitat</option>
            </select>
            <button title="Fett" onClick={() => cmd('bold')} style={{ ...KNOPF, fontWeight: 800 }}>B</button>
            <button title="Kursiv" onClick={() => cmd('italic')} style={{ ...KNOPF, fontStyle: 'italic' }}>I</button>
            <button title="Unterstrichen" onClick={() => cmd('underline')} style={{ ...KNOPF, textDecoration: 'underline' }}>U</button>
            <button title="Durchgestrichen" onClick={() => cmd('strikeThrough')} style={{ ...KNOPF, textDecoration: 'line-through' }}>S</button>
            <button title="Aufzählung" onClick={() => cmd('insertUnorderedList')} style={KNOPF}><i className="fa-solid fa-list" /></button>
            <button title="Nummerierte Liste" onClick={() => cmd('insertOrderedList')} style={KNOPF}><i className="fa-solid fa-list-ol" /></button>
            {!imLink && <button title="Link" onClick={() => { merken(); setLinkOffen(o => !o); setIconOffen(false) }} style={{ ...KNOPF, borderColor: linkOffen ? primary : '#e5e5e5', color: linkOffen ? primary : '#475569' }}><i className="fa-solid fa-link" /></button>}
            <button title="Font-Awesome-Icon einfügen" onClick={() => { merken(); setIconOffen(o => !o); setLinkOffen(false) }} style={{ ...KNOPF, borderColor: iconOffen ? primary : '#e5e5e5', color: iconOffen ? primary : '#475569' }}><i className="fa-solid fa-star" /></button>
            <button title="Formatierung entfernen" onClick={() => { cmd('removeFormat'); cmd('unlink') }} style={KNOPF}><i className="fa-solid fa-eraser" /></button>
          </div>

          {linkOffen && !imLink && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
              <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://… oder kontakt.html" onKeyDown={e => { if (e.key === 'Enter') linkSetzen() }}
                style={{ flex: 1, border: `1px solid ${primary}`, borderRadius: 6, padding: '6px 8px', fontSize: 11.5, fontFamily: 'monospace', outline: 'none' }} />
              <button onClick={linkSetzen} style={{ ...KNOPF, background: primary, color: '#fff', borderColor: primary }}>OK</button>
            </div>
          )}
          {imLink && (
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6, lineHeight: 1.4 }}><i className="fa-solid fa-link" style={{ marginRight: 5 }} />Dieses Element ist ein Button/Link – das Ziel setzt du unten im Feld „Verlinkung“.</div>
          )}

          {iconOffen && (
            <div style={{ border: '1px solid #e5e5e5', borderRadius: 8, padding: 8, marginBottom: 6, background: '#fafbff' }}>
              <input value={iconSuche} onChange={e => setIconSuche(e.target.value)} placeholder="Icon suchen (z. B. star, phone, check …)"
                style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 6, padding: '6px 8px', fontSize: 11.5, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 7 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 2, maxHeight: 128, overflowY: 'auto' }}>
                {treffer.map(([n, stil]) => (
                  <button key={stil + n} title={n} onClick={() => einfuegen(`<i class="fa-${stil} fa-${n}"></i>&nbsp;`)}
                    style={{ height: 26, border: 'none', borderRadius: 5, background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#334155' }}
                    onMouseEnter={e => { e.currentTarget.style.background = primary + '1a' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                    <i className={`fa-${stil} fa-${n}`} />
                  </button>
                ))}
                {!treffer.length && <div style={{ gridColumn: '1/-1', fontSize: 10.5, color: '#94a3b8', padding: 6 }}>Nichts gefunden – Name unten frei eingeben.</div>}
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 7 }}>
                <input id="wg-fa-frei" placeholder="fa-Name frei, z. B. mug-hot" onKeyDown={e => { if (e.key === 'Enter') { einfuegen(`<i class="fa-solid fa-${e.target.value.replace(/^fa-/, '').trim()}"></i>&nbsp;`) } }}
                  style={{ flex: 1, border: '1px solid #e5e5e5', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontFamily: 'monospace', outline: 'none' }} />
                <button onClick={() => { const el = document.getElementById('wg-fa-frei'); if (el && el.value.trim()) einfuegen(`<i class="fa-solid fa-${el.value.replace(/^fa-/, '').trim()}"></i>&nbsp;`) }} style={{ ...KNOPF }}>Einfügen</button>
              </div>
            </div>
          )}

          {/* Visueller Bearbeitungsbereich – schreibt LIVE in die Vorschau */}
          <div ref={editRef} contentEditable suppressContentEditableWarning spellCheck={false}
            onInput={() => { if (editRef.current) { setText(editRef.current.innerHTML); live(editRef.current.innerHTML) } }} onKeyUp={merken} onMouseUp={merken} onBlur={() => { merken(); uebernehmen() }}
            style={{ width: '100%', minHeight: 110, maxHeight: 300, overflowY: 'auto', border: '1px solid #e5e5e5', borderRadius: 7, padding: 10, fontSize: 13, lineHeight: 1.6, outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
        </>
      )}

      <div style={{ fontSize: 10.5, color: '#16a34a', marginTop: 7, lineHeight: 1.5, fontWeight: 600 }}>
        <i className="fa-solid fa-bolt" style={{ marginRight: 5 }} />Änderungen werden sofort live übernommen – kein Extra-Klick nötig.
      </div>
      <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 4, lineHeight: 1.5 }}>
        Editor: markieren und formatieren wie in Word – Icons über den Stern. HTML: voller Zugriff auf den Code.
      </div>
    </div>
  )
}
