'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateCIPalette } from '@/lib/colorSystem'
import { BRANCHEN, getBranche, getBranchenFelder } from '@/lib/branchen'
import { FONTS, FONT_PAIRS, BRANCHEN_FONT, allGoogleFontsParam } from '@/lib/fonts'
import MenuBuilder from '@/components/MenuBuilder'
import { aktuellerNutzer } from '@/lib/projekte'

// ── Konstanten ──────────────────────────────────────────────
const PRESET_COLORS = ['#111827','#1e3a5f','#1d4ed8','#0891b2','#0f766e','#16a34a','#ca8a04','#c2410c','#dc2626','#e11d48','#9333ea','#7c3aed']

const TONE_PRESETS = [
  { id: 'professionell', label: 'Professionell', sub: 'Seriös, kompetent', emoji: '👔' },
  { id: 'serioes', label: 'Seriös wie eine Bank', sub: 'Förmlich, präzise', emoji: '🏛️' },
  { id: 'herzlich', label: 'Locker & herzlich', sub: 'Nahbar, sympathisch', emoji: '😊' },
  { id: 'jugendlich', label: 'Jugendlich & modern', sub: 'Dynamisch, frisch', emoji: '🚀' },
  { id: 'premium', label: 'Exklusiv & Premium', sub: 'Hochwertig, elegant', emoji: '✨' },
  { id: 'technisch', label: 'Technisch & präzise', sub: 'Faktenbasiert', emoji: '🔧' },
  { id: 'empathisch', label: 'Empathisch & fürsorglich', sub: 'Verständnisvoll', emoji: '💙' },
  { id: 'kreativ', label: 'Mutig & kreativ', sub: 'Außergewöhnlich', emoji: '🎨' },
  { id: 'bodenstaendig', label: 'Bodenständig & ehrlich', sub: 'Direkt, verlässlich', emoji: '🤝' },
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
    <div onClick={() => onChange(!checked)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `2px solid ${checked ? primary : '#e5e5e5'}`, borderRadius: 10, cursor: 'pointer', marginBottom: 8, background: checked ? primary + '0d' : '#fff', transition: 'all 0.15s' }}>
      <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${checked ? primary : '#ccc'}`, background: checked ? primary : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, flexShrink: 0 }}>{checked ? '✓' : ''}</div>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{label}</span>
    </div>
  )
}

function Card({ active, onClick, children, primary, style = {} }) {
  return (
    <div onClick={onClick} style={{ border: `2px solid ${active ? primary : '#e5e5e5'}`, borderRadius: 12, padding: 14, cursor: 'pointer', background: active ? primary + '0d' : '#fff', transition: 'all 0.15s', ...style }}>
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
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [fd, setFd] = useState({
    paket: 'multipage', preis: 149,
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
  useEffect(() => { aktuellerNutzer().then(setNutzer).catch(() => {}) }, [])
  // Wunschdomain aus der Startseite übernehmen
  useEffect(() => {
    try {
      const d = sessionStorage.getItem('wg24_domain')
      if (d) setFd(prev => (prev.domain ? prev : { ...prev, domain: d }))
    } catch {}
  }, [])

  const upd = (k, v) => setFd(prev => ({ ...prev, [k]: v }))
  const updDetail = (k, v) => setFd(prev => ({ ...prev, brancheDetails: { ...prev.brancheDetails, [k]: v } }))

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '"Inter Tight",sans-serif', background: '#f8fafc' }}>
      {/* Google Fonts laden für Vorschau */}
      <link href={`https://fonts.googleapis.com/css2?${allGoogleFontsParam()}&display=swap`} rel="stylesheet" />

      {/* Topbar */}
      <div style={{ height: 56, borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between', background: '#fff', flexShrink: 0, position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 15, letterSpacing: -0.5, color: 'inherit', textDecoration: 'none' }}>websitegenerator24<span style={{ color: '#aaa', fontWeight: 400 }}>.de</span></a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {fd.domain && (
            <span title="Gewählte Domain" style={{ fontSize: 12.5, fontWeight: 700, color: '#15803D', background: '#EBF8F0', border: '1px solid #A7E3BC', borderRadius: 99, padding: '5px 12px' }}>
              {fd.domain}
            </span>
          )}
          <span style={{ fontWeight: 700, fontSize: 14, color: primary }}>{fd.preis} € <span style={{ fontWeight: 500, fontSize: 11, color: '#8493AC' }}>inkl. MwSt.</span></span>
          <button onClick={() => router.push(nutzer ? '/dashboard' : '/login')} style={{ border: '1px solid #e5e5e5', background: '#fff', borderRadius: 8, padding: '7px 13px', fontSize: 12, fontWeight: 700, color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}>
            {nutzer ? 'Meine Websites' : 'Anmelden'}
          </button>
        </div>
      </div>

      {/* Steps */}
      <div style={{ borderBottom: '1px solid #e5e5e5', background: '#fff', padding: '0 24px', display: 'flex', gap: 0, alignItems: 'center', overflowX: 'auto', flexShrink: 0 }}>
        {['Paket','Branche','Unternehmen','Details','Stil & Marke','Design','SEO','Seiten'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {i > 0 && <div style={{ width: 16, height: 1, background: '#e5e5e5', margin: '0 4px' }} />}
            <div onClick={() => i + 1 < step && setStep(i + 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 0', cursor: i + 1 < step ? 'pointer' : 'default' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: step > i + 1 ? '#22c55e' : step === i + 1 ? primary : '#e5e5e5', color: step >= i + 1 ? '#fff' : '#999', transition: 'all 0.2s' }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: step === i + 1 ? '#111' : '#999', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px 100px' }}>

          {/* STEP 1 – PAKET */}
          {step === 1 && (
            <>
              <StepHead n={1} title="Welches Paket passt zu dir?" sub="Einmalig bezahlen – kein Abo. Premium-Design & alle Editor-Funktionen in jedem Paket." />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, marginBottom: 24 }}>
                {[
                  { id: 'onepager', name: 'Onepager', price: 89, icon: '📄', seiten: '1 Seite', bilder: '6 KI-Bilder' },
                  { id: 'multipage', name: 'Multipage', price: 149, icon: '🗂️', seiten: 'Bis 5 Unterseiten', bilder: '8 KI-Bilder', pop: true },
                  { id: 'business', name: 'Business', price: 199, icon: '🏢', seiten: 'Bis 8 Unterseiten', bilder: '12 KI-Bilder' },
                ].map(p => (
                  <div key={p.id} onClick={() => { upd('paket', p.id); upd('preis', p.price) }} style={{ border: `2px solid ${fd.paket === p.id ? primary : '#e5e5e5'}`, borderRadius: 16, padding: 24, cursor: 'pointer', background: fd.paket === p.id ? primary + '0a' : '#fff', position: 'relative', transition: 'all 0.15s' }}>
                    {p.pop && <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: primary, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>★ Beliebteste</div>}
                    <div style={{ fontSize: 26, marginBottom: 10 }}>{p.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 2 }}>{p.price} <span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>€</span></div>
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 16 }}>inkl. MwSt. · einmalig</div>
                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
                      <Feat primary={primary} bold>{p.seiten}</Feat>
                      <Feat primary={primary} bold>{p.bilder}</Feat>
                      <Feat primary={primary}>Premium-Design</Feat>
                      <Feat primary={primary}>Live-Editor (Drag & Drop)</Feat>
                      <Feat primary={primary}>Alle Branchen-Elemente</Feat>
                      <Feat primary={primary}>Eigene Bilder & Logo</Feat>
                      <Feat primary={primary}>SEO-optimiert</Feat>
                      <Feat primary={primary}>ZIP-Download (HTML/CSS)</Feat>
                    </div>
                  </div>
                ))}
              </div>
              <InfoBox primary={primary}>
                <b>In jedem Paket enthalten:</b> Das komplette Premium-Design, der vollständige Live-Editor mit Drag & Drop, alle branchenspezifischen Elemente und KI-Texte. Die Pakete unterscheiden sich nur in der <b>Anzahl der Seiten</b> und der <b>Anzahl inkludierter KI-Bilder</b>.
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
                    <div style={{ fontSize: 26, marginBottom: 6 }}>{b.emoji}</div>
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
                  {[['b2c','👤 B2C – Privatkunden'],['b2b','🏢 B2B – Geschäftskunden'],['beide','👥 Beide']].map(([id, l]) => (
                    <Card key={id} active={fd.geschaeftsmodell === id} onClick={() => upd('geschaeftsmodell', id)} primary={primary} style={{ padding: '12px 14px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{l}</span>
                    </Card>
                  ))}
                </div>
                <SectionTitle>Einzugsgebiet</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
                  {[['lokal','📍 Lokal'],['regional','🗺️ Regional'],['national','🇩🇪 National'],['international','🌍 International']].map(([id, l]) => (
                    <Card key={id} active={fd.einzugsgebiet === id} onClick={() => upd('einzugsgebiet', id)} primary={primary} style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{l}</span>
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
                <SectionTitle sub="Wird für Impressum, Kontakt und später für die Veröffentlichung verwendet">Wunsch-Domain</SectionTitle>
                <Field label="Domain" value={fd.domain || ''} onChange={v => upd('domain', v)} placeholder="z. B. mueller-sanitaer.de" primary={primary}
                  hint="Auf der Startseite geprüft und übernommen. Du kannst sie hier ändern oder später festlegen." />
              </Panel>

              <Panel>
                <SectionTitle sub="Erscheint im Header, Footer und während der Generierung">Logo</SectionTitle>
                <div onClick={() => document.getElementById('wizLogo')?.click()} style={{ border: `2px dashed ${fd.logo ? primary : '#cbd5e1'}`, borderRadius: 12, padding: fd.logo ? 16 : 32, textAlign: 'center', cursor: 'pointer', background: fd.logo ? primary + '08' : '#fafbff' }}>
                  {fd.logo ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                      <img src={fd.logo} alt="Logo" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
                      <span style={{ fontSize: 13, color: primary, fontWeight: 600 }}>✓ Logo hochgeladen – klicken zum Ändern</span>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
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
                  <div style={{ fontSize: 26, marginBottom: 6 }}>📷</div>
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
                  <span style={{ fontSize: 22 }}>{branche.emoji}</span>
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
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t.emoji} {t.label}</div>
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
                <div style={{ display: 'flex', gap: 2, borderRadius: 6, overflow: 'hidden' }}>
                  {[50,100,200,300,400,500,600,700,800,900].map(s => <div key={s} style={{ flex: 1, height: 24, background: palette.primary[s] }} />)}
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
              <StepHead n={8} title="Seiten & Menü" sub="Lege deine Seiten an und ordne sie per Drag & Drop. Das Menü erscheint auf allen Seiten gleich." />
              <Panel>
                <MenuBuilder value={fd.menu} onChange={v => upd('menu', v)} primary={primary} maxPages={fd.paket === 'business' ? 8 : fd.paket === 'onepager' ? 1 : 5} />
              </Panel>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, color: '#92400e' }}>⚖️ Impressum, Datenschutz & Cookie-Banner</div>
                <p style={{ fontSize: 12, color: '#78716c', lineHeight: 1.6 }}>
                  Werden automatisch generiert und sind inklusive. <b>Wichtiger Hinweis:</b> Wir übernehmen <b>keine Haftung</b> für die rechtliche Vollständigkeit. Eine <b>anwaltliche Prüfung</b> sollte vor Veröffentlichung immer erfolgen. Eine automatische Cookie-Erklärung ist enthalten. Auf Wunsch beraten wir dich gerne.
                </p>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Footer-Navigation */}
      <div style={{ borderTop: '1px solid #e5e5e5', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', position: 'sticky', bottom: 0, flexShrink: 0 }}>
        <button onClick={back} disabled={step === 1} style={{ border: '2px solid #e5e5e5', background: '#fff', padding: '11px 22px', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.4 : 1, fontFamily: 'inherit' }}>← Zurück</button>
        {step < TOTAL_STEPS ? (
          <button onClick={next} disabled={step === 3 && !!(fd.userImages?.length) && !fd.imgLicense} style={{ background: primary, color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: (step === 3 && !!(fd.userImages?.length) && !fd.imgLicense) ? 'not-allowed' : 'pointer', opacity: (step === 3 && !!(fd.userImages?.length) && !fd.imgLicense) ? 0.5 : 1, fontFamily: 'inherit' }}>Weiter →</button>
        ) : (
          <button onClick={finish} style={{ background: primary, color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>✨ Website generieren →</button>
        )}
      </div>
    </div>
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

function Panel({ children }) {
  return <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 16, padding: 24, marginBottom: 16 }}>{children}</div>
}

function Feat({ children, primary, bold }) {
  return <div style={{ fontSize: 13, color: bold ? '#0f172a' : '#555', fontWeight: bold ? 700 : 400, padding: '3px 0', display: 'flex', gap: 8 }}><span style={{ color: primary }}>✓</span>{children}</div>
}

function InfoBox({ children, primary }) {
  return <div style={{ background: primary + '0d', border: `1px solid ${primary}33`, borderRadius: 12, padding: 16, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{children}</div>
}
