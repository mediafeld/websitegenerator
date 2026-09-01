'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { KAUF, MIETE, eur, ALLE_TLDS, TLD_PREISE } from '@/lib/preise'
import { ARTEN } from '@/lib/produkt'
import { generateCIPalette } from '@/lib/colorSystem'
import { BRANCHEN, getBranche, getBranchenFelder } from '@/lib/branchen'
import { FONTS, FONT_PAIRS, BRANCHEN_FONT, allGoogleFontsParam } from '@/lib/fonts'
import MenuBuilder from '@/components/MenuBuilder'
import { aktuellerNutzer, projektLaden } from '@/lib/projekte'
import { supabase } from '@/lib/supabaseClient'
import { ausFormular, impressumText, datenschutzText } from '@/lib/rechtstexteVorlagen'
import { Kopf, BASIS_CSS } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'
import { useWarenkorb } from '@/lib/warenkorb'
import { Brotkrumen } from '@/components/Brotkrumen'

// Größen-Zuordnung: Miet-Stufen und Kauf-Stufen haben denselben Umfang
const GROESSE_MAP = { start: 'onepager', plus: 'multipage', pro: 'business', onepager: 'onepager', multipage: 'multipage', business: 'business' }
const MIETE_IDS = new Set(MIETE.map(m => m.id))
const PAKET_ICON = { onepager: 'fa-file', multipage: 'fa-folder-open', business: 'fa-building' }
const MAX_SEITEN = { onepager: 1, multipage: 5, business: 8 }
// Miet-Stufen tragen andere Namen – der Umfang ist identisch. Damit klar ist,
// dass "Start" ein Onepager ist, zeigen wir den Umfang immer mit an.
const UMFANG_NAME = { onepager: 'Onepager', multipage: 'Multipage', business: 'Business' }
const UMFANG_KURZ = { onepager: '1 Seite', multipage: 'bis 5 Unterseiten', business: 'bis 8 Unterseiten' }
const KI_BILDER = { onepager: 6, multipage: 8, business: 12 }

// Was im Paket steckt – wird im Warenkorb aufgelistet, damit der Kunde sieht,
// wie viel er tatsächlich bekommt.
function paketLeistungen(size, miete) {
  return [
    `${UMFANG_KURZ[size]} – fertig aufgebaut`,
    `${KI_BILDER[size]} KI-Bilder inklusive`,
    'Impressum & Datenschutzerklärung inklusive',
    'Cookie-Hinweis inklusive',
    'Kontaktformular inklusive',
    'Für Handy & Tablet optimiert',
    'SEO-Grundeinstellungen inklusive',
    'Live-Editor (Drag & Drop) inklusive',
    ...(miete
      ? [
          'Domain inklusive (1 pro Paket)',
          size === 'onepager' ? 'E-Mail-Weiterleitung inklusive'
            : size === 'multipage' ? 'Echtes E-Mail-Postfach inklusive'
            : '3 E-Mail-Postfächer inklusive',
          'Hosting & SSL inklusive',
          'Laufende Sicherungen',
          size === 'onepager' ? 'Änderungen jederzeit selbst'
            : size === 'multipage' ? '1 Änderungswunsch pro Monat durch uns'
            : '3 Änderungswünsche pro Monat durch uns',
        ]
      : ['Kompletter Quellcode als ZIP (HTML/CSS/JS)', 'Keine laufenden Kosten']),
  ]
}
const DEFAULT_MENU = () => ([
  { id: 'p_start', label: 'Startseite', fix: true, children: [] },
  { id: 'p_leist', label: 'Leistungen', children: [] },
  { id: 'p_about', label: 'Über uns', children: [] },
  { id: 'p_kontakt', label: 'Kontakt', fix: true, children: [] },
])
// Onepager = alles auf EINER Seite → nur die Startseite, kein Menü
const ONEPAGER_MENU = () => ([{ id: 'p_start', label: 'Startseite', fix: true, children: [] }])

// Farbstimmung (nur Optik) – jetzt Teil des Farbwahl-Schritts im Wizard
const STIMMUNGEN = [
  { id: 'dark-elite', name: 'Dunkel & edel', desc: 'Dunkle Hero-Bereiche, edle Kontraste', bg: (p) => `linear-gradient(135deg,${p[900]},${p[700]})` },
  { id: 'clean-pro', name: 'Hell & klar', desc: 'Helle Flächen, viel Weißraum', bg: (p) => `linear-gradient(135deg,${p[50]},${p[200]})` },
  { id: 'bold-center', name: 'Kräftig & zentriert', desc: 'Große zentrierte Aussagen', bg: (p) => `linear-gradient(160deg,#fff,${p[100]})` },
]

// ── Konstanten ──────────────────────────────────────────────
const PRESET_COLORS = ['#111827','#1e3a5f','#1d4ed8','#0891b2','#0f766e','#16a34a','#ca8a04','#c2410c','#dc2626','#e11d48','#9333ea','#7c3aed']

const TONE_PRESETS = [
  { id: 'professionell', label: 'Professionell', sub: 'Seriös, kompetent', icon: 'fa-user-tie' },
  { id: 'serioes', label: 'Seriös wie eine Bank', sub: 'Förmlich, präzise', icon: 'fa-building-columns' },
  { id: 'herzlich', label: 'Locker & herzlich', sub: 'Nahbar, sympathisch', icon: 'fa-face-smile' },
  { id: 'jugendlich', label: 'Jugendlich & modern', sub: 'Dynamisch, frisch', icon: 'fa-rocket' },
  { id: 'premium', label: 'Exklusiv & Premium', sub: 'Hochwertig, elegant', icon: 'fa-gem' },
  { id: 'technisch', label: 'Technisch & präzise', sub: 'Faktenbasiert', icon: 'fa-wrench' },
  { id: 'empathisch', label: 'Empathisch & fürsorglich', sub: 'Verständnisvoll', icon: 'fa-heart' },
  { id: 'kreativ', label: 'Mutig & kreativ', sub: 'Außergewöhnlich', icon: 'fa-palette' },
  { id: 'bodenstaendig', label: 'Bodenständig & ehrlich', sub: 'Direkt, verlässlich', icon: 'fa-handshake' },
]

const CTA_STILE = [
  { id: 'soft', label: 'Soft', sub: '"Erfahren Sie mehr"' },
  { id: 'direkt', label: 'Direkt', sub: '"Jetzt kontaktieren"' },
  { id: 'hardsell', label: 'Hard-Sell', sub: '"Jetzt buchen"' },
  { id: 'frage', label: 'Als Frage', sub: '"Haben Sie Fragen?"' },
  { id: 'vertrauen', label: 'Vertrauen', sub: '"Unverbindlich & kostenlos"' },
]

const STILE = [
  { id: 'modern', label: 'Modern', sub: 'Clean & minimalistisch', bg: 'linear-gradient(135deg,#1a1a2e,#374151)' },
  { id: 'bold', label: 'Bold', sub: 'Kräftig & auffallend', bg: 'linear-gradient(135deg,#dc2626,#f97316)' },
  { id: 'elegant', label: 'Elegant', sub: 'Hochwertig & klassisch', bg: 'linear-gradient(135deg,#1e293b,#d97706)' },
  { id: 'warm', label: 'Warm', sub: 'Freundlich & natürlich', bg: 'linear-gradient(135deg,#16a34a,#84cc16)' },
]

const TOTAL_STEPS = 8

// ── Präsentations-Komponenten (AUSSERHALB → kein Re-Mount, kein Fokus-Bug) ──
function Field({ label, value, onChange, placeholder, type = 'text', primary, hint, badge, rows = 3 }) {
  const base = {
    width: '100%', border: `2px solid ${value ? primary + '55' : '#e5e5e5'}`, borderRadius: 10,
    padding: '11px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s', resize: 'vertical',
  }
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
        {label}
        {badge && <span style={{ fontSize: 10, fontWeight: 600, background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: 99 }}>{badge}</span>}
      </label>
      {type === 'textarea' ? (
        <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={base}
          onFocus={e => e.target.style.borderColor = primary} onBlur={e => e.target.style.borderColor = value ? primary + '55' : '#e5e5e5'} />
      ) : (
        <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base}
          onFocus={e => e.target.style.borderColor = primary} onBlur={e => e.target.style.borderColor = value ? primary + '55' : '#e5e5e5'} />
      )}
      {hint && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5 }}>{hint}</div>}
    </div>
  )
}

function Select({ label, value, onChange, options, primary }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>{label}</label>
      <select value={value || ''} onChange={e => onChange(e.target.value)} style={{ width: '100%', border: `2px solid ${value ? primary + '55' : '#e5e5e5'}`, borderRadius: 10, padding: '11px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none', background: '#fff', cursor: 'pointer', boxSizing: 'border-box' }}>
        <option value="">Bitte wählen...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function Check({ label, checked, onChange, primary }) {
  return (
    <div onClick={() => onChange(!checked)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `2px solid ${checked ? primary : '#e5e5e5'}`, borderRadius: 12, cursor: 'pointer', marginBottom: 8, background: checked ? primary + '0d' : '#fff', transition: 'all 0.15s' }}>
      <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${checked ? primary : '#ccc'}`, background: checked ? primary : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, flexShrink: 0 }}>{checked && <i className="fa-solid fa-check" aria-hidden="true" />}</div>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{label}</span>
    </div>
  )
}

function Card({ active, onClick, children, primary, style = {} }) {
  return (
    <div onClick={onClick} style={{ border: `2px solid ${active ? primary : '#e5e5e5'}`, borderRadius: 14, padding: 14, cursor: 'pointer', background: active ? primary + '0d' : '#fff', transition: 'all 0.15s', ...style }}>
      {children}
    </div>
  )
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: sub ? 4 : 0 }}>{children}</h3>
      {sub && <p style={{ fontSize: 13, color: '#94a3b8' }}>{sub}</p>}
    </div>
  )
}

// ── HAUPT-WIZARD ────────────────────────────────────────────
export default function WizardPage() {
  return (
    <Suspense fallback={null}>
      <WizardInnen />
    </Suspense>
  )
}

function WizardInnen() {
  const router = useRouter()
  const params = useSearchParams()
  const [step, setStep] = useState(1)
  const { setzePaket, setzeDomain, setOffen } = useWarenkorb()
  const [fd, setFd] = useState({
    paket: 'multipage', preis: 149, zahlungsart: 'kaufen',
    branche: '', brancheCustom: '',
    firmenname: '', email: '', telefon: '', website: '', strasse: '', plz: '', stadt: '', land: 'Deutschland', oeffnung: '',
    gegruendet: '', mitarbeiter: '', beschreibung: '', leistungen: '', usps: '', geschichte: '', auszeichnungen: '', referenzen: '',
    geschaeftsmodell: 'b2c', interaktion: 'gemischt', einzugsgebiet: 'lokal', staedte: '',
    anrede: 'sie', tonPreset: 'professionell', tonCustom: '', satzlaenge: 'gemischt', tiefe: 'ausgewogen', ctaStil: 'direkt',
    altersgruppe: '', geschlecht: 'Alle', bildung: '', einkommen: '', entscheidung: 'gemischt', schmerzpunkte: '', ziele: '',
    markenwerte: '', vertrauen: '', abgrenzung: '', verboten: '',
    seoPrimaer: '', seoSekundaer: '',
    brancheDetails: {},
    farbe: '#1d4ed8', fontPair: 'clean', stil: 'modern', stilVariante: 'dark-elite',
    seiten: ['Startseite', 'Leistungen', 'Über uns', 'Kontakt'],
    menu: [
      { id: 'p_start', label: 'Startseite', fix: true, children: [] },
      { id: 'p_leist', label: 'Leistungen', children: [] },
      { id: 'p_about', label: 'Über uns', children: [] },
      { id: 'p_kontakt', label: 'Kontakt', fix: true, children: [] },
    ],
  })

  const [nutzer, setNutzer] = useState(null)
  const [profil, setProfil] = useState(null)      // Konto-Angaben für die Rechtstexte
  const rechtAutoRef = useRef(true)               // false, sobald der Kunde selbst tippt
  // gesetzt, wenn eine BESTEHENDE Website neu konfiguriert wird
  const [neuAufbau, setNeuAufbau] = useState(null)
  useEffect(() => { aktuellerNutzer().then(setNutzer).catch(() => {}) }, [])
  // Wunschdomain aus der Startseite übernehmen
  useEffect(() => {
    try {
      const d = sessionStorage.getItem('wg24_domain')
      if (d) setFd(prev => (prev.domain ? prev : { ...prev, domain: d }))
    } catch {}
  }, [])

  // Paket-Wahl von der Preise-Seite/Startseite übernehmen (?paket=multipage
  // ODER ?paket=plus, je nachdem ob Kauf- oder Mietkarte angeklickt wurde) —
  // Mieten-Stufen und Kauf-Stufen haben denselben Umfang, nur andere Namen.
  useEffect(() => {
    const paketId = params.get('paket')
    if (GROESSE_MAP[paketId]) {
      // Von Startseite/Preise gekommen → Paket setzen + Schritt 1 überspringen
      const zahlungsart = MIETE_IDS.has(paketId) ? 'mieten' : (params.get('modus') === 'mieten' ? 'mieten' : 'kaufen')
      waehlePaket(zahlungsart, paketId)
      setStep(2)
    } else {
      // Frischer Start → Standard-Paket direkt in den Warenkorb (Badge zeigt 1)
      waehlePaket('kaufen', 'multipage')
    }
  }, [])

  // ── Bestehende Website neu konfigurieren (/start?projekt=…) ───────────────
  // Von der Übersicht aus: alle Angaben kommen zurück in den Baukasten, dort
  // lässt sich auch das Produkt (mieten/kaufen) ändern. Bezahlte Websites
  // werden nicht angefasst.
  useEffect(() => {
    const pid = params.get('projekt')
    if (!pid) { try { sessionStorage.removeItem('wg24_projektId') } catch {} ; return }
    projektLaden(pid).then(p => {
      if (!p) return
      const bezahlt = !!p.bezahlt_am || ['online', 'gekauft', 'gekuendigt'].includes(p.status)
      if (bezahlt) { setNeuAufbau({ id: pid, name: p.name, gesperrt: true }); return }
      try { sessionStorage.setItem('wg24_projektId', pid) } catch {}
      setNeuAufbau({ id: pid, name: p.name, gesperrt: false })
      if (p.form_data) setFd(prev => ({ ...prev, ...p.form_data }))
      const za = p.form_data?.zahlungsart === 'mieten' ? 'mieten' : 'kaufen'
      waehlePaket(za, p.paket_id || p.form_data?.paket || 'multipage')
      setStep(1)
    }).catch(() => {})
  }, [])

  const upd = (k, v) => setFd(prev => ({ ...prev, [k]: v }))
  const updDetail = (k, v) => setFd(prev => ({ ...prev, brancheDetails: { ...prev.brancheDetails, [k]: v } }))

  // ── Rechtstexte im Baukasten ──────────────────────────────────────────────
  // Beide Texte werden aus den Angaben vorbereitet, sobald Schritt 8 erreicht
  // ist. Wer eine Seite nicht will, schaltet sie ab (= leeres Feld) — dann gibt
  // es später weder die Unterseite noch den Link im Fußbereich.
  useEffect(() => {
    if (!nutzer) return
    supabase.from('profile').select('*').eq('id', nutzer.id).maybeSingle()
      .then(({ data }) => setProfil(data || null)).catch(() => {})
  }, [nutzer])

  useEffect(() => {
    if (step !== 8) return
    setFd(prev => {
      const erstesMal = prev.textImpressum === undefined && prev.textDatenschutz === undefined
      // Nur nachbessern, solange der Kunde die Texte nicht selbst angefasst hat
      if (!erstesMal && !rechtAutoRef.current) return prev
      const d = ausFormular(prev, profil)
      const imp = impressumText(d)
      const dat = datenschutzText(d)
      if (prev.textImpressum === imp && prev.textDatenschutz === dat) return prev
      return {
        ...prev,
        // Abgeschaltete Seiten ('') bleiben abgeschaltet
        textImpressum: prev.textImpressum === '' ? '' : imp,
        textDatenschutz: prev.textDatenschutz === '' ? '' : dat,
      }
    })
  }, [step, profil])

  function rechtstextSchalten(key, an) {
    rechtAutoRef.current = false
    if (!an) { upd(key, ''); return }
    const d = ausFormular(fd, profil)
    upd(key, key === 'textImpressum' ? impressumText(d) : datenschutzText(d))
  }

  // Paket wählen (Kauf ODER Miete) → in Wizard-Daten UND direkt in den Warenkorb.
  // oeffnen=true klappt den Warenkorb auf, damit jede Preisänderung sofort
  // sichtbar ist (keine bösen Überraschungen).
  function waehlePaket(zahlungsart, id, oeffnen = false) {
    const size = GROESSE_MAP[id] || 'multipage'
    const quelle = zahlungsart === 'mieten' ? MIETE : KAUF
    const p = quelle.find(x => x.id === id) || quelle.find(x => GROESSE_MAP[x.id] === size)
    if (!p) return
    setFd(prev => {
      // Menü dynamisch ans Paket anpassen: Onepager = 1 Seite; wechselt man von
      // Onepager wieder hoch, kommt das Standard-Menü zurück.
      const istOne = size === 'onepager'
      const warOne = (prev.menu || []).length <= 1
      let menu = prev.menu
      if (istOne) menu = ONEPAGER_MENU()
      else if (warOne) menu = DEFAULT_MENU()
      return { ...prev, paket: size, zahlungsart, preis: p.preis, menu }
    })
    setzePaket({
      id: 'paket-' + p.id,
      titel: `Website ${zahlungsart === 'mieten' ? 'mieten' : 'kaufen'} — ${p.name}${p.name !== UMFANG_NAME[size] ? ` (${UMFANG_NAME[size]})` : ''}`,
      unter: p.kurz,
      preis: p.preis,
      art: zahlungsart === 'mieten' ? 'monatlich' : 'einmalig',
      fest: true,
      punkte: paketLeistungen(size, zahlungsart === 'mieten'),
      // Zur Website gehörig — ohne diese ID kann die Kasse die Zahlung später
      // keiner Website zuordnen (der Stripe-Webhook braucht sie).
      projektId: neuAufbau?.id || null,
      website: fd.firmenname || 'Neue Website',
      domain: zahlungsart === 'mieten' ? (fd.domain || '') : '',
    })
    if (oeffnen) setOffen(true)
  }

  function handleLogoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const maxDim = 600
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * maxDim / width); width = maxDim }
          else { width = Math.round(width * maxDim / height); height = maxDim }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        let out
        try { out = canvas.toDataURL('image/webp', 0.9) } catch { out = canvas.toDataURL('image/png') }
        upd('logo', out)
      }
      img.onerror = () => upd('logo', ev.target.result)
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  // Eigene Bilder hochladen (max 20, nur webp/jpg/png, komprimiert)
  function handleUserImages(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const allowed = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png']
    const room = 20 - (fd.userImages?.length || 0)
    const valid = files.filter(f => allowed.includes(f.type))
    if (valid.length !== files.length) alert('Es sind nur WebP, JPG und PNG erlaubt.')
    valid.slice(0, room).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        const img = new Image()
        img.onload = () => {
          const maxDim = 1600
          let { width, height } = img
          if (width > maxDim || height > maxDim) { if (width > height) { height = Math.round(height * maxDim / width); width = maxDim } else { width = Math.round(width * maxDim / height); height = maxDim } }
          const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
          canvas.getContext('2d').drawImage(img, 0, 0, width, height)
          let out; try { out = canvas.toDataURL('image/webp', 0.82) } catch { out = ev.target.result }
          setFd(prev => ({ ...prev, userImages: [...(prev.userImages || []), { data: out, desc: '' }] }))
        }
        img.onerror = () => setFd(prev => ({ ...prev, userImages: [...(prev.userImages || []), { data: ev.target.result, desc: '' }] }))
        img.src = ev.target.result
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }
  function updUserImageDesc(i, desc) { setFd(prev => { const arr = [...(prev.userImages || [])]; arr[i] = { ...arr[i], desc }; return { ...prev, userImages: arr } }) }
  function removeUserImage(i) { setFd(prev => ({ ...prev, userImages: (prev.userImages || []).filter((_, j) => j !== i) })) }

  const palette = generateCIPalette(fd.farbe)
  const primary = palette?.primary?.[500] || fd.farbe
  const branche = getBranche(fd.branche)
  const brancheFelder = getBranchenFelder(fd.branche)

  // Font-Empfehlung bei Branchenwahl setzen
  useEffect(() => {
    if (fd.branche && BRANCHEN_FONT[fd.branche]) {
      upd('fontPair', BRANCHEN_FONT[fd.branche])
    }
  }, [fd.branche])

  function next() { setStep(s => Math.min(s + 1, TOTAL_STEPS)) }
  function back() { setStep(s => Math.max(s - 1, 1)) }

  async function finish() {
    const adresse = [fd.strasse, `${fd.plz} ${fd.stadt}`.trim(), fd.land].filter(Boolean).join(', ')
    const pair = FONT_PAIRS.find(p => p.id === fd.fontPair) || FONT_PAIRS[0]
    // Menü → flache Seitenliste (Haupt + Unterseiten)
    const seitenFlat = []
    ;(fd.menu || []).forEach(m => {
      seitenFlat.push(m.label)
      ;(m.children || []).forEach(c => seitenFlat.push(c.label))
    })
    const formData = {
      ...fd,
      adresse,
      font: pair.body,
      fontHeadline: pair.headline,
      branche: fd.branche,
      seiten: seitenFlat.length ? seitenFlat : ['Startseite', 'Kontakt'],
      menuStruktur: fd.menu,
    }
    sessionStorage.setItem('wg24_formData', JSON.stringify(formData))
    sessionStorage.setItem('wg24_palette', JSON.stringify(palette))

    // Ohne Konto keine Generierung (schützt vor Missbrauch und du findest deine Website wieder)
    const u = await aktuellerNutzer()
    if (!u) { router.push('/login?next=/design-auswahl'); return }

    router.push('/design-auswahl')
  }

  const pair = FONT_PAIRS.find(p => p.id === fd.fontPair) || FONT_PAIRS[0]

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: BASIS_CSS }} />
    <Kopf />
    <div style={{ display: 'flex', flexDirection: 'column', fontFamily: '"Inter Tight",sans-serif', background: '#f8fafc' }}>
      {/* Google Fonts laden für Vorschau */}
      <link href={`https://fonts.googleapis.com/css2?${allGoogleFontsParam()}&display=swap`} rel="stylesheet" />

      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 24px' }}>
          <Brotkrumen pfad={[['Start', '/'], ['Website erstellen'], [`Schritt ${step} von ${TOTAL_STEPS}`]]} />
        </div>
      </div>

      {/* Schritte + Preis/Domain in EINER Zeile */}
      <div style={{ borderBottom: '1px solid #e5e5e5', background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', flex: 1 }}>
          {['Paket','Branche','Unternehmen','Details','Stil & Marke','Design','SEO','Seiten'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {i > 0 && <div style={{ width: 16, height: 1, background: '#e5e5e5', margin: '0 4px' }} />}
              <div onClick={() => i + 1 < step && setStep(i + 1)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 0', cursor: i + 1 < step ? 'pointer' : 'default' }}>
                <div style={{ width: 23, height: 23, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: step > i + 1 ? '#1F9D55' : step === i + 1 ? primary : '#E1E7EB', color: step >= i + 1 ? '#fff' : '#94a3b8', transition: 'all 0.2s' }}>
                  {step > i + 1 ? <i className="fa-solid fa-check" aria-hidden="true" /> : i + 1}
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: step === i + 1 ? '#111' : '#999', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {/* Produkt-Anzeige: in JEDEM Schritt sichtbar, damit nie unklar ist,
              ob gerade eine Miet- oder eine Kauf-Website gebaut wird. */}
          {(() => {
            const a = ARTEN[fd.zahlungsart === 'mieten' ? 'mieten' : 'kaufen']
            return (
              <span title={a.satz} style={{ fontSize: 12.5, fontWeight: 800, color: a.farbe, background: a.bg, border: `1px solid ${a.rand}`, borderRadius: 99, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
                <i className={`fa-solid ${a.icon}`} aria-hidden="true" />{a.name}
              </span>
            )
          })()}
          {fd.domain && (
            <span title="Gewählte Domain" style={{ fontSize: 12.5, fontWeight: 700, color: primary, background: primary + '12', border: `1px solid ${primary}33`, borderRadius: 99, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
              <i className="fa-solid fa-globe" aria-hidden="true" />{fd.domain}
            </span>
          )}
          <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', whiteSpace: 'nowrap' }}>{eur(fd.preis)} €{fd.zahlungsart === 'mieten' ? ' /Monat' : ''} <span style={{ fontWeight: 500, fontSize: 11, color: '#94a3b8' }}>inkl. MwSt.</span></span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px 100px' }}>

          {/* Hinweis, wenn eine bestehende Website neu konfiguriert wird */}
          {neuAufbau && (
            <div style={{ background: neuAufbau.gesperrt ? '#FEF2F2' : '#E7F4FC', border: `1px solid ${neuAufbau.gesperrt ? '#FECACA' : '#BBE0F4'}`, borderRadius: 14, padding: '16px 20px', marginBottom: 26, fontSize: 14, lineHeight: 1.7, color: neuAufbau.gesperrt ? '#B91C1C' : '#0A1824' }}>
              {neuAufbau.gesperrt ? (
                <><i className="fa-solid fa-lock" style={{ marginRight: 9 }} aria-hidden="true" />
                  „{neuAufbau.name}" ist bereits bezahlt und wird hier nicht verändert. Wenn du eine weitere
                  Website möchtest, konfiguriere sie einfach neu — sie kommt als eigenes Produkt dazu.</>
              ) : (
                <><i className="fa-solid fa-sliders" style={{ marginRight: 9, color: '#1B93D2' }} aria-hidden="true" />
                  Du bearbeitest die Angaben von <strong>„{neuAufbau.name}"</strong>. Hier kannst du auch zwischen
                  <strong> mieten</strong> und <strong>kaufen</strong> wechseln. Beim Abschluss wird die Website mit
                  den neuen Angaben <strong>neu aufgebaut</strong> — dein bisheriger Stand wird vorher automatisch
                  im Verlauf gesichert (im Editor unter „Verlauf" wiederherstellbar).</>
              )}
            </div>
          )}

          {/* STEP 1 – PAKET (Kaufen ODER Mieten) */}
          {step === 1 && (
            <>
              <StepHead n={1} title="Welches Paket passt zu dir?" sub="Kaufen (einmalig, ZIP-Download) oder mieten (monatlich, Domain & Hosting inklusive) – der Umfang ist identisch." />

              {/* Umschalter Kaufen / Mieten */}
              <div style={{ display: 'inline-flex', background: '#eef2f6', borderRadius: 99, padding: 4, marginBottom: 24 }}>
                {[['kaufen', 'Kaufen', 'fa-download'], ['mieten', 'Mieten', 'fa-calendar-days']].map(([za, lab, ic]) => (
                  <button key={za} onClick={() => { const ziel = za === 'mieten' ? (MIETE.find(m => GROESSE_MAP[m.id] === fd.paket)?.id || 'plus') : fd.paket; waehlePaket(za, ziel) }} style={{ border: 'none', cursor: 'pointer', borderRadius: 99, padding: '9px 22px', fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8, background: fd.zahlungsart === za ? '#fff' : 'transparent', color: fd.zahlungsart === za ? primary : '#64748b', boxShadow: fd.zahlungsart === za ? '0 2px 8px rgba(15,23,42,.1)' : 'none', transition: 'all .15s' }}><i className={`fa-solid ${ic}`} aria-hidden="true" />{lab}</button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, marginBottom: 24 }}>
                {(fd.zahlungsart === 'mieten' ? MIETE : KAUF).map(p => {
                  const size = GROESSE_MAP[p.id]
                  const aktiv = fd.paket === size
                  const miete = fd.zahlungsart === 'mieten'
                  return (
                    <div key={p.id} onClick={() => waehlePaket(fd.zahlungsart, p.id)} style={{ border: `2px solid ${aktiv ? primary : '#e5e5e5'}`, borderRadius: 16, padding: 24, cursor: 'pointer', background: aktiv ? primary + '0a' : '#fff', position: 'relative', transition: 'all 0.15s' }}>
                      {p.beliebt && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: primary, color: '#fff', fontSize: 11, fontWeight: 700, padding: '5px 15px', borderRadius: 99, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}><i className="fa-solid fa-star" style={{ fontSize: 9 }} aria-hidden="true" />Beliebteste</div>}
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: primary + '14', color: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, marginBottom: 12 }}><i className={`fa-solid ${PAKET_ICON[size]}`} aria-hidden="true" /></div>
                      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 2 }}>{p.name}{miete && <span style={{ fontWeight: 500, fontSize: 13, color: '#64748b' }}> · {UMFANG_NAME[size]}</span>}</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 6 }}>{UMFANG_KURZ[size]}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 2 }}>{eur(p.preis)} <span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>€{miete ? ' /Monat' : ''}</span></div>
                      <div style={{ fontSize: 11, color: '#aaa', marginBottom: 16 }}>inkl. MwSt. · {miete ? 'monatlich' : 'einmalig'}</div>
                      <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
                        {(p.punkte || []).slice(0, 7).map((pt, i) => <Feat key={i} primary={primary} bold={i < 2}>{pt}</Feat>)}
                      </div>
                    </div>
                  )
                })}
              </div>
              <InfoBox primary={primary}>
                <b>Kaufen</b> = einmalig zahlen, Website als ZIP herunterladen (Domain/Hosting bringst du mit). <b>Mieten</b> = monatlich, Domain, Hosting & SSL inklusive – wir kümmern uns. Dein gewähltes Paket liegt bereits im Warenkorb (oben rechts).
              </InfoBox>
            </>
          )}

          {/* STEP 2 – BRANCHE */}
          {step === 2 && (
            <>
              <StepHead n={2} title="Was ist deine Branche?" sub="Bestimmt Wortwahl, Kontext und welche Spezial-Elemente du bekommst." />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 20 }}>
                {BRANCHEN.map(b => (
                  <Card key={b.id} active={fd.branche === b.id} onClick={() => upd('branche', b.id)} primary={primary}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: fd.branche === b.id ? primary : '#F1F4F6', color: fd.branche === b.id ? '#fff' : primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, marginBottom: 8, transition: 'all .15s' }}><i className={`fa-solid ${b.icon}`} aria-hidden="true" /></div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{b.label}</div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 3 }}>{b.beschreibung}</div>
                  </Card>
                ))}
              </div>
              {fd.branche === 'andere' && (
                <Field label="Deine Branche (eigene Eingabe)" value={fd.brancheCustom} onChange={v => upd('brancheCustom', v)} placeholder="z.B. Tierheilpraxis" primary={primary} />
              )}
              <div style={{ marginTop: 12 }}>
                <SectionTitle>Geschäftsmodell</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                  {[['b2c','B2C – Privatkunden','user'],['b2b','B2B – Geschäftskunden','building'],['beide','Beide','users']].map(([id, l, ic]) => (
                    <Card key={id} active={fd.geschaeftsmodell === id} onClick={() => upd('geschaeftsmodell', id)} primary={primary} style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><i className={`fa-solid fa-${ic}`} style={{ color: primary }} aria-hidden="true" />{l}</span>
                    </Card>
                  ))}
                </div>
                <SectionTitle>Einzugsgebiet</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
                  {[['lokal','Lokal','location-dot'],['regional','Regional','map'],['national','National','flag'],['international','International','earth-europe']].map(([id, l, ic]) => (
                    <Card key={id} active={fd.einzugsgebiet === id} onClick={() => upd('einzugsgebiet', id)} primary={primary} style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 7 }}><i className={`fa-solid fa-${ic}`} style={{ color: primary }} aria-hidden="true" />{l}</span>
                    </Card>
                  ))}
                </div>
                <Field label="Relevante Städte / Regionen" value={fd.staedte} onChange={v => upd('staedte', v)} placeholder="z.B. Berlin, Potsdam" primary={primary} />
              </div>
            </>
          )}

          {/* STEP 3 – UNTERNEHMEN */}
          {step === 3 && (
            <>
              <StepHead n={3} title="Dein Unternehmen" sub="Je mehr Infos, desto besser die Texte. Pflichtfelder mit *" />
              <Panel>
                <SectionTitle sub="Kontaktdaten">Kontakt</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Firmenname *" value={fd.firmenname} onChange={v => upd('firmenname', v)} placeholder="Muster GmbH" primary={primary} />
                  <Field label="Telefon *" value={fd.telefon} onChange={v => upd('telefon', v)} placeholder="030 1234567" primary={primary} />
                  <Field label="E-Mail *" value={fd.email} onChange={v => upd('email', v)} placeholder="info@muster.de" type="email" primary={primary} />
                  <Field label="Website" value={fd.website} onChange={v => upd('website', v)} placeholder="https://muster.de" primary={primary} />
                  <Field label="Straße & Nr." value={fd.strasse} onChange={v => upd('strasse', v)} placeholder="Musterstr. 1" primary={primary} />
                  <Field label="PLZ" value={fd.plz} onChange={v => upd('plz', v)} placeholder="10115" primary={primary} />
                  <Field label="Stadt *" value={fd.stadt} onChange={v => upd('stadt', v)} placeholder="Berlin" primary={primary} />
                  <Field label="Land" value={fd.land} onChange={v => upd('land', v)} placeholder="Deutschland" primary={primary} />
                </div>
                <Field label="Öffnungszeiten *" value={fd.oeffnung} onChange={v => upd('oeffnung', v)} type="textarea" rows={2} placeholder="Mo-Fr: 9:00-18:00 Uhr&#10;Sa: nach Vereinbarung" primary={primary} />
              </Panel>

              <Panel>
                <SectionTitle sub="Diese Infos fließen direkt in die Texte">Über das Unternehmen</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Gegründet" value={fd.gegruendet} onChange={v => upd('gegruendet', v)} placeholder="2015" primary={primary} />
                  <Field label="Mitarbeiter" value={fd.mitarbeiter} onChange={v => upd('mitarbeiter', v)} placeholder="10" primary={primary} />
                </div>
                <Field label="Unternehmensbeschreibung *" value={fd.beschreibung} onChange={v => upd('beschreibung', v)} type="textarea" rows={4} placeholder="Beschreibe dein Unternehmen – wer ihr seid, was euch antreibt..." primary={primary} />
                <Field label="Leistungen / Produkte" value={fd.leistungen} onChange={v => upd('leistungen', v)} type="textarea" rows={3} placeholder="Eure wichtigsten Leistungen oder Produkte..." primary={primary} />
                <Field label="USPs / Alleinstellungsmerkmale" value={fd.usps} onChange={v => upd('usps', v)} type="textarea" rows={2} placeholder="Was macht euch besonders? z.B. zentrale Lage, persönliche Beratung..." primary={primary} />
                <Field label="Geschichte & Meilensteine" value={fd.geschichte} onChange={v => upd('geschichte', v)} type="textarea" rows={2} placeholder="z.B. Wie alles begann, wichtige Entwicklungen... (optional)" primary={primary} />
                <Field label="Auszeichnungen & Zertifikate" value={fd.auszeichnungen} onChange={v => upd('auszeichnungen', v)} placeholder="z.B. TÜV-zertifiziert, Top-Arbeitgeber 2024 (optional)" primary={primary} />
                <Field label="Referenzkunden / Projekte" value={fd.referenzen} onChange={v => upd('referenzen', v)} placeholder="z.B. Zusammenarbeit mit ... (optional)" primary={primary} />
              </Panel>

              <Panel>
                {fd.zahlungsart === 'mieten' ? (
                  <>
                    <SectionTitle sub="Im Mietpaket ist eine Domain enthalten – hier prüfen und sichern.">Wunsch-Domain</SectionTitle>
                    <DomainCheck fd={fd} primary={primary} upd={upd} setzeDomain={setzeDomain} setOffen={setOffen} />
                  </>
                ) : (
                  <>
                    <SectionTitle sub="Beim Kauf lädst du die fertige Website als ZIP herunter und nutzt deine eigene Domain bei deinem Hoster – eine Domain-Buchung gibt es hier deshalb nicht.">Deine Domain</SectionTitle>
                    <div style={{ border: '1px dashed #cbd5e1', background: '#f8fafc', borderRadius: 12, padding: '14px 16px', fontSize: 13.5, color: '#475569', lineHeight: 1.6 }}>
                      <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: primary }} />
                      Du möchtest Domain, Hosting &amp; SSL von uns? Dann wähle in Schritt 1 <b>„Website mieten"</b> – dort ist die Wunsch-Domain inklusive.
                    </div>
                  </>
                )}
              </Panel>

              <Panel>
                <SectionTitle sub="Erscheint im Header, Footer und während der Generierung">Logo</SectionTitle>
                <div onClick={() => document.getElementById('wizLogo')?.click()} style={{ border: `2px dashed ${fd.logo ? primary : '#cbd5e1'}`, borderRadius: 12, padding: fd.logo ? 16 : 32, textAlign: 'center', cursor: 'pointer', background: fd.logo ? primary + '08' : '#fafbff' }}>
                  {fd.logo ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                      <img src={fd.logo} alt="Logo" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
                      <span style={{ fontSize: 13, color: primary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}><i className="fa-solid fa-check" aria-hidden="true" />Logo hochgeladen – klicken zum Ändern</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 26, marginBottom: 8, color: '#94a3b8' }}><i className="fa-solid fa-image" aria-hidden="true" /></div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>Logo hochladen</div>
                      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>PNG, JPG, SVG – oder später im Editor</div>
                    </>
                  )}
                </div>
                <input id="wizLogo" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
              </Panel>

              <Panel>
                <SectionTitle sub="Optional – werden automatisch sinnvoll auf der Seite platziert (Hero, Über uns, Galerie …)">Eigene Bilder ({fd.userImages?.length || 0}/20)</SectionTitle>
                <div onClick={() => (fd.userImages?.length || 0) < 20 && document.getElementById('wizImgs')?.click()} style={{ border: '2px dashed #cbd5e1', borderRadius: 12, padding: 24, textAlign: 'center', cursor: (fd.userImages?.length || 0) < 20 ? 'pointer' : 'not-allowed', background: '#fafbff', marginBottom: 12 }}>
                  <div style={{ fontSize: 24, marginBottom: 6, color: '#94a3b8' }}><i className="fa-solid fa-camera" aria-hidden="true" /></div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#475569' }}>Bilder hochladen (max. 20)</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Nur WebP, JPG oder PNG</div>
                </div>
                <input id="wizImgs" type="file" accept="image/webp,image/jpeg,image/png" multiple style={{ display: 'none' }} onChange={handleUserImages} />
                {!!(fd.userImages?.length) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    {fd.userImages.map((im, i) => (
                      <div key={i} style={{ border: '1px solid #e5e5e5', borderRadius: 10, padding: 8, position: 'relative' }}>
                        <img src={im.data} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6, marginBottom: 6 }} />
                        <button onClick={() => removeUserImage(i)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(220,38,38,0.9)', color: '#fff', cursor: 'pointer', fontSize: 12, lineHeight: 1 }}>×</button>
                        <input value={im.desc} onChange={e => updUserImageDesc(i, e.target.value)} placeholder="Beschreibung (z. B. Team, Ladenlokal …)" style={{ width: '100%', border: '1px solid #e5e5e5', borderRadius: 6, padding: '6px 8px', fontSize: 11, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                      </div>
                    ))}
                  </div>
                )}
                {!!(fd.userImages?.length) && (
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', background: fd.imgLicense ? primary + '0a' : '#fff7ed', border: `1px solid ${fd.imgLicense ? primary + '55' : '#fed7aa'}`, borderRadius: 10, padding: 12 }}>
                    <input type="checkbox" checked={!!fd.imgLicense} onChange={e => upd('imgLicense', e.target.checked)} style={{ marginTop: 2, accentColor: primary, width: 16, height: 16, flexShrink: 0 }} />
                    <span style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.5 }}>Ich bestätige, dass ich die <strong>Nutzungsrechte/Lizenzen</strong> für alle hochgeladenen Bilder besitze und sie auf meiner Website verwenden darf. Die Bilder werden ausschließlich zur Erstellung dieser Website genutzt und nach Fertigstellung &amp; Download vom Server gelöscht.</span>
                  </label>
                )}
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10, lineHeight: 1.5 }}>Zusätzlich erzeugt der Generator bei Bedarf weiterhin passende KI-Bilder.</div>
              </Panel>
            </>
          )}

          {/* STEP 4 – BRANCHEN-DETAILS (dynamisch) */}
          {step === 4 && (
            <>
              <StepHead n={4} title={brancheFelder.titel} sub={brancheFelder.sub} />
              <Panel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, padding: '10px 14px', background: primary + '0d', borderRadius: 10 }}>
                  <i className={`fa-solid ${branche.icon}`} style={{ fontSize: 17, color: primary }} aria-hidden="true" />
                  <span style={{ fontSize: 13, color: '#475569' }}>Speziell für <b>{branche.label}</b> – diese Angaben werden zu echten Sektionen auf deiner Website.</span>
                </div>
                {brancheFelder.felder.map(f => {
                  if (f.type === 'check') return <Check key={f.key} label={f.label} checked={!!fd.brancheDetails[f.key]} onChange={v => updDetail(f.key, v)} primary={primary} />
                  if (f.type === 'select') return <Select key={f.key} label={f.label} value={fd.brancheDetails[f.key]} onChange={v => updDetail(f.key, v)} options={f.options} primary={primary} />
                  return <Field key={f.key} label={f.label} value={fd.brancheDetails[f.key]} onChange={v => updDetail(f.key, v)} type={f.type} placeholder={f.placeholder} rows={4} primary={primary} />
                })}
              </Panel>
            </>
          )}

          {/* STEP 5 – STIL & MARKE & ZIELGRUPPE */}
          {step === 5 && (
            <>
              <StepHead n={5} title="Stil, Marke & Zielgruppe" sub="Bestimmt wie deine Texte klingen und wen sie ansprechen." />
              <Panel>
                <SectionTitle>Ansprache & Ton</SectionTitle>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  {[['sie','Sie-Form','Professionell'],['du','Du-Form','Nahbar, modern']].map(([id, l, s]) => (
                    <Card key={id} active={fd.anrede === id} onClick={() => upd('anrede', id)} primary={primary} style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{l}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{s}</div>
                    </Card>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 }}>
                  {TONE_PRESETS.map(t => (
                    <Card key={t.id} active={fd.tonPreset === t.id} onClick={() => upd('tonPreset', t.id)} primary={primary} style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><i className={`fa-solid ${t.icon}`} style={{ color: primary, fontSize: 12 }} aria-hidden="true" />{t.label}</div>
                      <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{t.sub}</div>
                    </Card>
                  ))}
                </div>
                <Field label="Eigener Ton (überschreibt Preset)" value={fd.tonCustom} onChange={v => upd('tonCustom', v)} placeholder="z.B. warmherzig wie ein Familienbetrieb, aber modern" primary={primary} />
                <SectionTitle sub="Wie sollen Handlungsaufforderungen klingen?">CTA-Stil</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 8 }}>
                  {CTA_STILE.map(c => (
                    <Card key={c.id} active={fd.ctaStil === c.id} onClick={() => upd('ctaStil', c.id)} primary={primary} style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</div>
                      <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{c.sub}</div>
                    </Card>
                  ))}
                </div>
              </Panel>

              <Panel>
                <SectionTitle sub="Wen sprichst du an?">Zielgruppe</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Field label="Altersgruppe" value={fd.altersgruppe} onChange={v => upd('altersgruppe', v)} placeholder="z.B. 25-55" primary={primary} />
                  <Select label="Geschlecht" value={fd.geschlecht} onChange={v => upd('geschlecht', v)} options={['Alle', 'Überwiegend weiblich', 'Überwiegend männlich']} primary={primary} />
                </div>
                <Field label="Schmerzpunkte der Zielgruppe" value={fd.schmerzpunkte} onChange={v => upd('schmerzpunkte', v)} type="textarea" rows={2} placeholder="Was nervt sie? Welches Problem haben sie?" primary={primary} />
                <Field label="Ziele & Wünsche der Zielgruppe" value={fd.ziele} onChange={v => upd('ziele', v)} type="textarea" rows={2} placeholder="Was wollen sie erreichen?" primary={primary} />
              </Panel>

              <Panel>
                <SectionTitle sub="Diese Werte verkörpern die Texte">Markenidentität</SectionTitle>
                <Field label="Markenwerte" value={fd.markenwerte} onChange={v => upd('markenwerte', v)} placeholder="z.B. Vertrauen, Qualität, Ehrlichkeit" primary={primary} />
                <Field label="Vertrauenssignale" value={fd.vertrauen} onChange={v => upd('vertrauen', v)} type="textarea" rows={2} placeholder="z.B. 500+ zufriedene Kunden, 15 Jahre Erfahrung" primary={primary} />
                <Field label="Verbotene Formulierungen" value={fd.verboten} onChange={v => upd('verboten', v)} type="textarea" rows={2} badge="Werden nie verwendet" placeholder="z.B. 'billig', 'günstig' – eine pro Zeile" primary={primary} />
              </Panel>
            </>
          )}

          {/* STEP 6 – DESIGN */}
          {step === 6 && (
            <>
              <StepHead n={6} title="Design & Schrift" sub="Farbe und Schrift werden auf alle Seiten angewendet." />
              <Panel>
                <SectionTitle>Hauptfarbe</SectionTitle>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {PRESET_COLORS.map(c => (
                    <div key={c} onClick={() => upd('farbe', c)} style={{ width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer', outline: fd.farbe === c ? `3px solid ${c}` : 'none', outlineOffset: 2, transition: 'all 0.15s', transform: fd.farbe === c ? 'scale(1.15)' : 'scale(1)' }} />
                  ))}
                  <input type="color" value={fd.farbe} onChange={e => upd('farbe', e.target.value)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px dashed #ccc', cursor: 'pointer', padding: 2 }} />
                </div>
                <div style={{ display: 'flex', gap: 2, borderRadius: 6, overflow: 'hidden', marginBottom: 22 }}>
                  {[50,100,200,300,400,500,600,700,800,900].map(s => <div key={s} style={{ flex: 1, height: 24, background: palette.primary[s] }} />)}
                </div>
                <SectionTitle sub="Wie hell oder dunkel soll der Look sein? Wird direkt beim Generieren angewendet.">Farbstimmung</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {STIMMUNGEN.map(s => (
                    <div key={s.id} onClick={() => upd('stilVariante', s.id)} style={{ border: `2px solid ${fd.stilVariante === s.id ? primary : '#e5e5e5'}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', background: '#fff' }}>
                      <div style={{ height: 54, background: s.bg(palette.primary) }} />
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 7 }}>{fd.stilVariante === s.id && <i className="fa-solid fa-check" style={{ color: primary, fontSize: 11 }} aria-hidden="true" />}{s.name}</div>
                        <div style={{ fontSize: 10.5, color: '#888' }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel>
                <SectionTitle sub={`Empfehlung für ${branche.label}: ${pair.label}`}>Schrift-Kombination</SectionTitle>
                <div style={{ fontSize: 11, color: '#64748b', background: '#f1f5f9', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>Alle Schriften sind kostenlose <strong>Google Fonts</strong> und dürfen frei (auch kommerziell) verwendet werden.</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
                  {FONT_PAIRS.map(p => {
                    const recommended = BRANCHEN_FONT[fd.branche] === p.id
                    return (
                      <div key={p.id} onClick={() => upd('fontPair', p.id)} style={{ border: `2px solid ${fd.fontPair === p.id ? primary : '#e5e5e5'}`, borderRadius: 12, padding: 18, cursor: 'pointer', background: fd.fontPair === p.id ? primary + '0a' : '#fff', transition: 'all 0.15s', position: 'relative' }}>
                        {recommended && <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, fontWeight: 700, background: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: 99 }}>EMPFOHLEN</div>}
                        <div style={{ fontFamily: `'${p.headline}',serif`, fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4, lineHeight: 1.1 }}>Überschrift</div>
                        <div style={{ fontFamily: `'${p.body}',sans-serif`, fontSize: 14, color: '#64748b', marginBottom: 12 }}>So sieht dein Fließtext aus. Klar und gut lesbar für deine Besucher.</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 10 }}>
                          <div><div style={{ fontSize: 13, fontWeight: 700 }}>{p.label}</div><div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>{p.headline} + {p.body}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>{p.sub}</div></div>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${fd.fontPair === p.id ? primary : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{fd.fontPair === p.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: primary }} />}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Panel>

              <Panel>
                <SectionTitle>Grundstil</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  {STILE.map(s => (
                    <div key={s.id} onClick={() => upd('stil', s.id)} style={{ border: `2px solid ${fd.stil === s.id ? primary : '#e5e5e5'}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}>
                      <div style={{ height: 44, background: s.bg }} />
                      <div style={{ padding: '8px 10px' }}><div style={{ fontWeight: 700, fontSize: 12 }}>{s.label}</div><div style={{ fontSize: 10, color: '#888' }}>{s.sub}</div></div>
                    </div>
                  ))}
                </div>
              </Panel>
            </>
          )}

          {/* STEP 7 – SEO */}
          {step === 7 && (
            <>
              <StepHead n={7} title="SEO-Keywords" sub="Damit Google deine Seite besser findet. (Optional, aber empfohlen)" />
              <Panel>
                <Field label="Primär-Keyword" value={fd.seoPrimaer} onChange={v => upd('seoPrimaer', v)} badge="H1, erste Absätze" placeholder={`z.B. ${branche.label} ${fd.stadt || 'Berlin'}`} primary={primary} hint="Das wichtigste Keyword – kommt in die Hauptüberschrift." />
                <Field label="Sekundär-Keywords" value={fd.seoSekundaer} onChange={v => upd('seoSekundaer', v)} placeholder="z.B. Beratung, Termin, Service – kommagetrennt" primary={primary} hint="Weitere relevante Begriffe für Zwischenüberschriften und Fließtext." />
              </Panel>
              <InfoBox primary={primary}>
                Keine Sorge wenn du dir unsicher bist – wir generieren sinnvolle Keywords automatisch aus deiner Branche und deinem Standort.
              </InfoBox>
            </>
          )}

          {/* STEP 8 – SEITEN & MENÜ */}
          {step === 8 && (
            <>
              <StepHead n={8} title="Seiten & Menü" sub={fd.paket === 'onepager' ? 'Dein Onepager läuft auf EINER Seite – kein Menü nötig.' : `Dein ${fd.paket === 'business' ? 'Business' : 'Multipage'}-Paket erlaubt bis zu ${MAX_SEITEN[fd.paket]} Unterseiten.`} />
              <Panel>
                {fd.paket === 'onepager' ? (
                  <div style={{ padding: '4px 2px' }}>
                    <div style={{ textAlign: 'center', marginBottom: 22 }}>
                      <div style={{ width: 54, height: 54, borderRadius: 14, background: primary + '14', color: primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}><i className="fa-solid fa-file" aria-hidden="true" /></div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: '#0f172a' }}>Alles auf einer Seite</div>
                      <p style={{ fontSize: 13.5, color: '#64748b', lineHeight: 1.6, maxWidth: 470, margin: '0 auto' }}>
                        Beim Onepager werden Leistungen, Über uns und Kontakt als Abschnitte <b>auf der Startseite</b> angelegt – genau das, was du gebucht hast.
                      </p>
                    </div>
                    <PaketWechsel fd={fd} primary={primary} waehlePaket={waehlePaket} />
                  </div>
                ) : (
                  <>
                    <MenuBuilder value={fd.menu} onChange={v => upd('menu', v)} primary={primary} maxPages={MAX_SEITEN[fd.paket] || 5} />
                    <div style={{ marginTop: 22, borderTop: '1px solid #eef2f6', paddingTop: 20 }}>
                      <PaketWechsel fd={fd} primary={primary} waehlePaket={waehlePaket} />
                    </div>
                  </>
                )}
              </Panel>

              {/* Rechtstexte: der Kunde entscheidet, ob es die Seiten gibt.
                  Text da → eigene Unterseite + Link im Fußbereich.
                  Feld leer/abgeschaltet → beides nicht vorhanden. */}
              <Panel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <i className="fa-solid fa-scale-balanced" style={{ color: primary, fontSize: 16 }} aria-hidden="true" />
                  <div style={{ fontWeight: 800, fontSize: 15.5, color: '#0f172a' }}>Impressum &amp; Datenschutz</div>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, marginBottom: 16 }}>
                  Wir erzeugen beides aus deinen Angaben. Jede eingeschaltete Seite wird als eigene Unterseite
                  angelegt und im Fußbereich verlinkt — ausgeschaltet gibt es weder Seite noch Link.
                  Ändern kannst du die Texte später jederzeit im Kundenkonto unter „Rechtstexte".
                </p>
                {[
                  ['textImpressum', 'Impressum', 'Für geschäftsmäßige Websites in Deutschland Pflicht.'],
                  ['textDatenschutz', 'Datenschutzerklärung', 'Nach DSGVO Pflicht, sobald Daten verarbeitet werden.'],
                ].map(([key, label, hinweis]) => {
                  const an = !!String(fd[key] || '').trim()
                  return (
                    <div key={key} style={{ border: `1.5px solid ${an ? primary + '55' : '#e5e5e5'}`, background: an ? primary + '08' : '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => rechtstextSchalten(key, !an)}
                          aria-pressed={an}
                          style={{ width: 46, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', background: an ? primary : '#cbd5e1', position: 'relative', flexShrink: 0, padding: 0 }}>
                          <span style={{ position: 'absolute', top: 3, left: an ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
                        </button>
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{label}</div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>{hinweis}</div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: an ? primary : '#94a3b8' }}>
                          {an ? 'wird angelegt' : 'wird nicht angelegt'}
                        </span>
                      </div>
                      {an && (
                        <textarea value={fd[key] || ''} onChange={e => { rechtAutoRef.current = false; upd(key, e.target.value) }}
                          style={{ width: '100%', minHeight: 170, marginTop: 12, padding: '13px 15px', fontSize: 12.5, lineHeight: 1.65,
                            fontFamily: 'ui-monospace,monospace', border: '1px solid #e5e5e5', borderRadius: 10, outline: 'none', resize: 'vertical', background: '#fff' }} />
                      )}
                    </div>
                  )
                })}
                <p style={{ fontSize: 12, color: '#78716c', lineHeight: 1.65, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px' }}>
                  <b>Wichtiger Hinweis:</b> Das sind Textvorlagen, keine Rechtsberatung. Wir übernehmen
                  <b> keine Haftung</b> für rechtliche Vollständigkeit — eine <b>anwaltliche Prüfung</b> vor der
                  Veröffentlichung ist zu empfehlen. Ein Cookie-Hinweis ist enthalten. In eckigen Klammern
                  markierte Stellen musst du noch ergänzen.
                </p>
              </Panel>
            </>
          )}

        </div>
      </div>

      {/* Footer-Navigation */}
      <div style={{ borderTop: '1px solid #e5e5e5', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', position: 'sticky', bottom: 0, flexShrink: 0 }}>
        <button onClick={back} disabled={step === 1} style={{ border: '2px solid #e5e5e5', background: '#fff', padding: '12px 24px', borderRadius: 99, fontWeight: 700, fontSize: 14, cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.4 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 9 }}><i className="fa-solid fa-arrow-left" aria-hidden="true" />Zurück</button>
        {step < TOTAL_STEPS ? (
          <button onClick={next} disabled={step === 3 && !!(fd.userImages?.length) && !fd.imgLicense} style={{ background: primary, color: '#fff', border: 'none', padding: '13px 30px', borderRadius: 99, fontWeight: 700, fontSize: 14, cursor: (step === 3 && !!(fd.userImages?.length) && !fd.imgLicense) ? 'not-allowed' : 'pointer', opacity: (step === 3 && !!(fd.userImages?.length) && !fd.imgLicense) ? 0.5 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 9 }}>Weiter<i className="fa-solid fa-arrow-right" aria-hidden="true" /></button>
        ) : (
          <button onClick={finish} style={{ background: primary, color: '#fff', border: 'none', padding: '13px 34px', borderRadius: 99, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 10 }}><i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />Website generieren<i className="fa-solid fa-arrow-right" aria-hidden="true" /></button>
        )}
      </div>
    </div>
    <Fuss />
    </>
  )
}

// ── Kleine Helfer-Komponenten (außerhalb) ──
function StepHead({ n, title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Schritt {n} von {TOTAL_STEPS}</p>
      <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8, color: '#0f172a' }}>{title}</h1>
      {sub && <p style={{ color: '#64748b', fontSize: 15 }}>{sub}</p>}
    </div>
  )
}

// Domainprüfung im Wizard – gleiche Logik wie der Checker auf der Startseite.
// Es kann immer nur EINE Domain gewählt werden (1 Domain pro Paket).
function DomainCheck({ fd, primary, upd, setzeDomain, setOffen }) {
  const [name, setName] = useState('')
  const [tlds, setTlds] = useState(['de', 'com', 'net', 'org'])
  const [tldOffen, setTldOffen] = useState(false)
  const [tldSuche, setTldSuche] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [daten, setDaten] = useState(null)
  const [fehler, setFehler] = useState('')
  const miete = fd.zahlungsart === 'mieten'
  const tldRef = useRef(null)
  const tldUmschalten = (t) => setTlds(v => v.includes(t) ? v.filter(x => x !== t) : [...v, t])
  const tldTreffer = ALLE_TLDS.filter(t => t.includes(tldSuche.trim().toLowerCase()))

  // Klick daneben oder Escape schließt die Endungs-Auswahl
  useEffect(() => {
    if (!tldOffen) { setTldSuche(''); return }
    const aussen = (e) => { if (tldRef.current && !tldRef.current.contains(e.target)) setTldOffen(false) }
    const esc = (e) => { if (e.key === 'Escape') setTldOffen(false) }
    document.addEventListener('mousedown', aussen)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', aussen); document.removeEventListener('keydown', esc) }
  }, [tldOffen])

  async function pruefen() {
    const n = (name || fd.firmenname || '').trim()
    if (!n) { setFehler('Bitte einen Wunschnamen eingeben.'); return }
    if (!tlds.length) { setFehler('Bitte mindestens eine Endung auswählen.'); setTldOffen(true); return }
    setLaedt(true); setFehler(''); setDaten(null)
    try {
      const res = await fetch('/api/domain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: n, tlds }) })
      const j = await res.json()
      if (j.error) setFehler(j.error); else setDaten(j)
    } catch { setFehler('Die Domainprüfung ist gerade nicht erreichbar. Du kannst die Domain auch später festlegen.') }
    setLaedt(false)
  }

  // Domain übernehmen → Wizard-Daten UND Warenkorb (klappt auf, damit der
  // Preis sofort sichtbar ist). Bei Miete ist die erste Domain inklusive.
  function waehlen(e) {
    upd('domain', e.domain)
    setzeDomain({
      id: 'domain-' + e.domain,
      titel: `Domain ${e.domain}`,
      unter: miete ? 'Im Mietpaket enthalten – läuft auf deinen Namen' : `Registrierung & Verwaltung · ${e.tld?.toUpperCase?.() || ''}`,
      preis: miete ? 0 : (e.preis || 0),
      gratis: miete,
      fest: true,
      art: 'jaehrlich',
      punkte: miete
        ? ['Domain inklusive (1 pro Paket)', 'SSL-Zertifikat inklusive', 'DNS-Verwaltung durch uns']
        : ['Läuft auf deinen Namen', 'SSL-Zertifikat inklusive', 'Jährliche Verlängerung'],
    })
    setOffen(true)
  }

  const frei = (daten?.ergebnisse || []).filter(e => e.frei)
  const belegt = (daten?.ergebnisse || []).filter(e => !e.frei)

  if (fd.domain) return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: `2px solid ${primary}`, background: primary + '0a', borderRadius: 12, padding: '14px 16px' }}>
        <i className="fa-solid fa-circle-check" style={{ color: '#1F9D55', fontSize: 18 }} aria-hidden="true" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{fd.domain}</div>
          <div style={{ fontSize: 11.5, color: '#64748b' }}>{miete ? 'Im Mietpaket inklusive – liegt im Warenkorb.' : 'Liegt im Warenkorb.'}</div>
        </div>
        <button onClick={() => { upd('domain', ''); setzeDomain(null); setDaten(null) }} style={{ border: '1px solid #e5e5e5', background: '#fff', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#64748b' }}>Ändern</button>
      </div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, position: 'relative' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', border: '2px solid #e5e5e5', borderRadius: 10, padding: '0 14px', background: '#fff' }}>
          <span style={{ color: '#94a3b8', fontSize: 13.5 }}>www.</span>
          <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && pruefen()} placeholder={fd.firmenname || 'deinefirma'} style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 4px', fontSize: 14, fontFamily: 'inherit', minWidth: 0 }} />
        </div>

        {/* Endungs-Auswahl wie auf der Startseite */}
        <div style={{ position: 'relative' }} ref={tldRef}>
          <button type="button" onClick={() => setTldOffen(v => !v)} style={{ height: '100%', border: '2px solid #e5e5e5', background: '#fff', borderRadius: 10, padding: '0 14px', fontSize: 13, fontWeight: 700, color: '#334155', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
            {tlds.length === 1 ? `.${tlds[0]}` : `${tlds.length} Endungen`}
            <i className="fa-solid fa-chevron-down" style={{ fontSize: 10, transform: tldOffen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} aria-hidden="true" />
          </button>
          {tldOffen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: 290, background: '#fff', border: '1px solid #e5e5e5', borderRadius: 12, boxShadow: '0 18px 44px rgba(15,23,42,.16)', zIndex: 60, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 13px', borderBottom: '1px solid #f1f5f9', fontSize: 11.5, fontWeight: 700, color: '#475569' }}>
                Endungen <span style={{ color: primary }}>{tlds.length} gewählt</span>
                <button type="button" onClick={() => setTlds([])} style={{ marginLeft: 'auto', border: 'none', background: '#f1f5f9', borderRadius: 99, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', color: '#64748b' }}>Alle abwählen</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderBottom: '1px solid #f1f5f9' }}>
                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 11, color: '#94a3b8' }} aria-hidden="true" />
                <input value={tldSuche} onChange={e => setTldSuche(e.target.value)} placeholder="Endung suchen … z. B. shop" style={{ flex: 1, border: 'none', outline: 'none', fontSize: 12.5, fontFamily: 'inherit' }} />
              </div>
              <div style={{ maxHeight: 230, overflowY: 'auto' }}>
                {tldTreffer.length === 0 && <p style={{ padding: '14px', fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>Keine Endung gefunden.</p>}
                {tldTreffer.map(t => (
                  <div key={t} onClick={() => tldUmschalten(t)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', cursor: 'pointer', borderBottom: '1px solid #fafbfc' }}>
                    <span style={{ width: 17, height: 17, borderRadius: 5, border: `2px solid ${tlds.includes(t) ? primary : '#cbd5e1'}`, background: tlds.includes(t) ? primary : '#fff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0 }}>{tlds.includes(t) && <i className="fa-solid fa-check" />}</span>
                    <b style={{ fontSize: 13 }}>.{t}</b>
                    <em style={{ marginLeft: 'auto', fontStyle: 'normal', fontSize: 11.5, color: '#94a3b8' }}>{eur(TLD_PREISE[t])} €/Jahr</em>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={pruefen} disabled={laedt} style={{ background: primary, color: '#fff', border: 'none', borderRadius: 10, padding: '0 22px', fontWeight: 700, fontSize: 13.5, cursor: laedt ? 'wait' : 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
          <i className={`fa-solid ${laedt ? 'fa-spinner fa-spin' : 'fa-magnifying-glass'}`} aria-hidden="true" />{laedt ? 'Prüfe…' : 'Prüfen'}
        </button>
      </div>

      {fehler && <div style={{ fontSize: 12.5, color: '#B4232A', background: '#FDECEC', border: '1px solid #F5C6C6', borderRadius: 8, padding: '9px 12px', marginBottom: 10 }}>{fehler}</div>}

      {daten && (
        <div style={{ display: 'grid', gap: 7, marginBottom: 10 }}>
          {frei.map(e => (
            <div key={e.domain} style={{ display: 'flex', alignItems: 'center', gap: 11, border: '1px solid #e5e5e5', borderRadius: 10, padding: '11px 14px' }}>
              <i className="fa-solid fa-circle-check" style={{ color: '#1F9D55' }} aria-hidden="true" />
              <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{e.domain}</span>
              <span style={{ fontSize: 12, color: miete ? '#1F9D55' : '#64748b', fontWeight: miete ? 700 : 500 }}>{miete ? 'inklusive' : e.preis ? `${eur(e.preis)} € / Jahr` : ''}</span>
              <button onClick={() => waehlen(e)} style={{ background: primary, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 15px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>In den Warenkorb</button>
            </div>
          ))}
          {belegt.map(e => (
            <div key={e.domain} style={{ display: 'flex', alignItems: 'center', gap: 11, border: '1px solid #f1f5f9', borderRadius: 10, padding: '11px 14px', opacity: .6 }}>
              <i className="fa-solid fa-circle-xmark" style={{ color: '#B4232A' }} aria-hidden="true" />
              <span style={{ flex: 1, fontSize: 13.5 }}>{e.domain}</span>
              <span style={{ fontSize: 11.5, color: '#94a3b8' }}>schon vergeben</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => upd('domainSpaeter', true)} style={{ border: '1px solid #e5e5e5', background: '#fff', borderRadius: 99, padding: '9px 16px', fontSize: 12.5, fontWeight: 700, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <i className="fa-solid fa-clock" aria-hidden="true" />Domain später wählen
        </button>
        {fd.domainSpaeter && <span style={{ fontSize: 11.5, color: '#1F9D55', fontWeight: 700 }}><i className="fa-solid fa-check" style={{ marginRight: 5 }} />Du kannst sie jederzeit im Editor festlegen.</span>}
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10, lineHeight: 1.55 }}>
        <i className="fa-solid fa-lock" style={{ marginRight: 6 }} aria-hidden="true" />
        {miete ? 'Eine Domain ist in deinem Mietpaket enthalten (1 Domain pro Paket).' : 'Beim Kauf bringst du Domain und Hosting selbst mit – du kannst sie hier trotzdem direkt mitbestellen.'}
      </div>
    </div>
  )
}

// Paket wechseln / upgraden – zeigt IMMER alle drei Pakete mit echtem Preis,
// damit klar ist, was der Wechsel kostet. Warenkorb klappt danach auf.
function PaketWechsel({ fd, primary, waehlePaket }) {
  const miete = fd.zahlungsart === 'mieten'
  const liste = miete ? MIETE : KAUF
  return (
    <div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>Brauchst du mehr Seiten?</div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>Paket wechseln – dein Warenkorb aktualisiert sich sofort und zeigt dir den neuen Preis.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 10 }}>
        {liste.map(p => {
          const size = GROESSE_MAP[p.id]
          const aktiv = fd.paket === size
          return (
            <div key={p.id} onClick={() => !aktiv && waehlePaket(fd.zahlungsart, p.id, true)} style={{ border: `2px solid ${aktiv ? primary : '#e5e5e5'}`, background: aktiv ? primary + '0a' : '#fff', borderRadius: 12, padding: '13px 14px', cursor: aktiv ? 'default' : 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <i className={`fa-solid ${PAKET_ICON[size]}`} style={{ color: primary, fontSize: 12 }} aria-hidden="true" />
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{p.name}</span>
                {aktiv && <span style={{ fontSize: 9.5, fontWeight: 800, background: primary, color: '#fff', padding: '2px 7px', borderRadius: 99 }}>AKTUELL</span>}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>{eur(p.preis)} <span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>€{miete ? ' /Monat' : ' einmalig'}</span></div>
              <div style={{ fontSize: 11.5, color: '#64748b' }}>{UMFANG_NAME[size]} · {UMFANG_KURZ[size]}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Panel({ children }) {
  return <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 16, padding: 24, marginBottom: 16 }}>{children}</div>
}

function Feat({ children, primary, bold }) {
  return <div style={{ fontSize: 13, color: bold ? '#0f172a' : '#555', fontWeight: bold ? 700 : 400, padding: '3px 0', display: 'flex', alignItems: 'center', gap: 9 }}><i className="fa-solid fa-check" style={{ color: primary, fontSize: 11 }} aria-hidden="true" />{children}</div>
}

function InfoBox({ children, primary }) {
  return <div style={{ background: primary + '0d', border: `1px solid ${primary}33`, borderRadius: 14, padding: 16, fontSize: 13, color: '#475569', lineHeight: 1.6, display: 'flex', gap: 11, alignItems: 'flex-start' }}>
    <i className="fa-solid fa-circle-info" style={{ color: primary, marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
    <span>{children}</span>
  </div>
}
