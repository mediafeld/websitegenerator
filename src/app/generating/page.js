'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateCIPalette } from '@/lib/colorSystem'
import { aktuellerNutzer, projektAnlegenOderAktualisieren } from '@/lib/projekte'
import { Kopf, BASIS_CSS } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'

const FACTS = [
  { icon: 'bolt', text: 'Schnelle Websites laden in unter 2 Sekunden – das verbessert dein Google-Ranking deutlich.' },
  { icon: 'mobile-screen', text: 'Über 60% aller Besucher kommen vom Smartphone. Deine Website ist vollständig responsive.' },
  { icon: 'palette', text: 'Konsistente Farben steigern die Markenwiedererkennung um bis zu 80%.' },
  { icon: 'pen-nib', text: 'Klare Überschriften halten Besucher 3x länger auf der Seite.' },
  { icon: 'magnifying-glass', text: 'Eine gute Struktur hilft Google, deine Seite besser zu verstehen und zu ranken.' },
  { icon: 'comment', text: 'Kundenstimmen erhöhen das Vertrauen und die Conversion-Rate erheblich.' },
  { icon: 'rocket', text: 'Ein klarer Call-to-Action kann deine Anfragen verdoppeln.' },
  { icon: 'image', text: 'Optimierte Bilder machen deine Seite schneller und professioneller.' },
]

const STEPS = ['Branche wird analysiert', 'Passende Sektionen werden gewählt', 'Texte werden geschrieben', 'Layout wird zusammengestellt', 'Unterseiten werden erstellt', 'Letzte Details']

export default function GeneratingPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [stepIdx, setStepIdx] = useState(0)
  const [factIdx, setFactIdx] = useState(0)
  const [error, setError] = useState(null)
  const [palette, setPalette] = useState(null)
  const [logo, setLogo] = useState(null)
  const [firmenname, setFirmenname] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const f = sessionStorage.getItem('wg24_formData')
    if (!f) { router.push('/start'); return }
    const fd = JSON.parse(f)
    const pal = generateCIPalette(fd.farbe || '#1d4ed8')
    setPalette(pal)
    setLogo(fd.logo || null)
    setFirmenname(fd.firmenname || '')
    generate(fd, pal)
  }, [])

  useEffect(() => {
    const iv = setInterval(() => setFactIdx(i => (i + 1) % FACTS.length), 4000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (done) return
    const iv = setInterval(() => setProgress(p => (p + Math.random() * 4 > 92 ? 92 : p + Math.random() * 4)), 600)
    const stepIv = setInterval(() => setStepIdx(i => Math.min(i + 1, STEPS.length - 1)), 3500)
    return () => { clearInterval(iv); clearInterval(stepIv) }
  }, [done])

  async function generate(formData, pal) {
    try {
      const { userImages, ...fdForApi } = formData
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ formData: fdForApi }) })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const pagesWithImgs = injectUserImages(data.pages, userImages)
      try {
        sessionStorage.setItem('wg24_pages', JSON.stringify(pagesWithImgs))
      } catch (quota) {
        // Zu viele/große Bilder für den Browser-Speicher → ohne eigene Bilder speichern
        sessionStorage.setItem('wg24_pages', JSON.stringify(data.pages))
        alert('Die hochgeladenen Bilder sind zusammen zu groß für den Zwischenspeicher. Die Seite wird ohne sie erstellt – du kannst sie im Editor einzeln einfügen.')
      }
      sessionStorage.setItem('wg24_formData', JSON.stringify(fdForApi))
      sessionStorage.setItem('wg24_palette', JSON.stringify(data.palette || pal))
      sessionStorage.setItem('wg24_font', data.font || 'Inter Tight')

      // Wenn angemeldet: Projekt in der Datenbank anlegen
      let projektId = null
      try {
        const nutzer = await aktuellerNutzer()
        if (nutzer) {
          projektId = await projektAnlegenOderAktualisieren({
            name: fdForApi.firmenname || 'Neue Website',
            firma: fdForApi.firmenname,
            branche: fdForApi.branche,
            form_data: fdForApi,
            pages: pagesWithImgs,
            palette: data.palette || pal,
            font: data.font || 'Inter Tight',
          })
        }
      } catch (e) {
        console.warn('Projekt konnte nicht gespeichert werden:', e?.message)
      }

      setDone(true); setProgress(100); setStepIdx(STEPS.length - 1)
      setTimeout(() => router.push(projektId ? `/editor?projekt=${projektId}` : '/editor'), 800)
    } catch (err) { setError(err.message) }
  }

  // Eigene Bilder sinnvoll in die generierten Seiten einbauen (Hero → Über uns → Bild → Galerie)
  function injectUserImages(pages, userImages) {
    const imgs = (userImages || []).map(u => u?.data).filter(Boolean)
    if (!imgs.length || !pages) return pages
    const next = JSON.parse(JSON.stringify(pages))
    let i = 0
    const take = () => (i < imgs.length ? imgs[i++] : null)
    for (const pg of Object.values(next)) { for (const b of pg) { if (i >= imgs.length) break
      const c = b.content || (b.content = {})
      if (b.type === 'hero-full') { const v = take(); if (v) { c.heroImg = v; c.bgImg = v } }
      else if (b.type === 'about') { const v = take(); if (v) c.aboutImg = v }
      else if (b.type === 'image') { const v = take(); if (v) c.image = v; const v2 = take(); if (v2) c.image2 = v2 }
    } }
    for (const pg of Object.values(next)) { for (const b of pg) { if (i >= imgs.length) break
      if (b.type === 'gallery') { const c = b.content || (b.content = {}); if (!Array.isArray(c.images)) c.images = ['', '', '', '', '', '']; for (let g = 0; g < c.images.length && i < imgs.length; g++) c.images[g] = take() }
    } }
    return next
  }

  const primary = palette?.primary?.[500] || '#3b82f6'
  const primaryLight = palette?.primary?.[100] || '#dbeafe'
  const primaryDark = palette?.primary?.[700] || '#1d4ed8'

  if (error) return (
    <>
    <style dangerouslySetInnerHTML={{ __html: BASIS_CSS }} />
    <Kopf />
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter Tight",sans-serif', padding: 24, background: '#fafbff' }}>
      <div style={{ fontSize: 48, marginBottom: 16, color: '#94a3b8' }}><i className="fa-solid fa-face-frown" /></div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Da ging etwas schief</h2>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 24, textAlign: 'center', maxWidth: 400 }}>{error}</p>
      <button onClick={() => router.push('/start')} style={{ background: primary, color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8 }}><i className="fa-solid fa-arrow-left" />Nochmal versuchen</button>
    </div>
    <Fuss />
    </>
  )

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: BASIS_CSS }} />
    <Kopf />
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter Tight",sans-serif', background: `linear-gradient(160deg, #ffffff 0%, ${primaryLight}55 50%, #ffffff 100%)`, position: 'relative', overflow: 'hidden' }}>
      {/* helle Orbs */}
      <div className="orb orb1" style={{ background: `${primary}22` }} />
      <div className="orb orb2" style={{ background: `${primary}18` }} />
      <div className="orb orb3" style={{ background: `${primaryDark}15` }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: 24, maxWidth: 580, width: '100%' }}>
        {/* Logo oder Spinner */}
        <div style={{ marginBottom: 40 }}>
          {logo ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img src={logo} alt="Logo" style={{ height: 80, width: 'auto', objectFit: 'contain', position: 'relative', zIndex: 2 }} />
              <div className="logo-ring" style={{ borderColor: `${primary}44`, borderTopColor: primary }} />
            </div>
          ) : (
            <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto' }}>
              <div className="ring ring1" style={{ borderTopColor: primary, borderRightColor: `${primary}66` }} />
              <div className="ring ring2" style={{ borderBottomColor: primaryDark, borderLeftColor: `${primaryDark}66` }} />
              <div className="ring ring3" style={{ borderTopColor: `${primary}99` }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, color: primary }}><span className="pulse-emoji"><i className="fa-solid fa-wand-magic-sparkles" /></span></div>
            </div>
          )}
        </div>

        <h1 style={{ fontSize: 38, fontWeight: 900, color: '#0f172a', letterSpacing: -1, marginBottom: 12 }}>
          {done ? 'Fertig!' : firmenname ? `${firmenname} entsteht` : 'Deine Website entsteht'}
        </h1>
        <p style={{ fontSize: 17, color: '#64748b', marginBottom: 44 }}>
          {done ? 'Wird geöffnet...' : 'Wir bauen gerade jede Seite – das dauert nur einen Moment'}
        </p>

        {/* Progress */}
        <div style={{ background: '#e2e8f0', borderRadius: 99, height: 8, marginBottom: 18, overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)' }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg, ${primary}, ${primaryDark})`, borderRadius: 99, width: `${progress}%`, transition: 'width 0.6s ease', boxShadow: `0 0 16px ${primary}88` }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 52, minHeight: 24 }}>
          <div className="mini-spinner" style={{ borderColor: '#cbd5e1', borderTopColor: primary }} />
          <span style={{ fontSize: 15, color: '#475569', fontWeight: 600 }}>{STEPS[stepIdx]}...</span>
          <span style={{ fontSize: 14, color: '#94a3b8' }}>{Math.round(progress)}%</span>
        </div>

        {/* Fact card */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', borderRadius: 18, padding: '26px 30px', minHeight: 120, display: 'flex', alignItems: 'center', gap: 18 }}>
          <div key={factIdx} className="fact-icon" style={{ fontSize: 40, flexShrink: 0, color: primary, width: 46, textAlign: 'center' }}><i className={`fa-solid fa-${FACTS[factIdx].icon}`} /></div>
          <div key={'t' + factIdx} className="fact-text" style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: primary, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Wusstest du schon?</div>
            <div style={{ fontSize: 15, color: '#334155', lineHeight: 1.6 }}>{FACTS[factIdx].text}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 22 }}>
          {FACTS.map((_, i) => (
            <div key={i} style={{ width: i === factIdx ? 22 : 6, height: 6, borderRadius: 99, background: i === factIdx ? primary : '#cbd5e1', transition: 'all 0.3s' }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes spinRev{to{transform:rotate(-360deg)}}
        @keyframes floatOrb{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-40px) scale(1.15)}}
        @keyframes pulseEmoji{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeInScale{from{opacity:0;transform:scale(0.7)}to{opacity:1;transform:scale(1)}}
        .orb{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none;}
        .orb1{width:450px;height:450px;top:-120px;left:-120px;animation:floatOrb 9s ease-in-out infinite;}
        .orb2{width:350px;height:350px;bottom:-100px;right:-100px;animation:floatOrb 11s ease-in-out infinite reverse;}
        .orb3{width:250px;height:250px;top:55%;left:62%;animation:floatOrb 7s ease-in-out infinite;}
        .ring{position:absolute;border-radius:50%;border:4px solid transparent;}
        .ring1{inset:0;animation:spin 1.2s linear infinite;}
        .ring2{inset:14px;animation:spinRev 1.6s linear infinite;}
        .ring3{inset:28px;animation:spin 2s linear infinite;}
        .logo-ring{position:absolute;inset:-20px;border:3px solid transparent;border-radius:50%;animation:spin 1.5s linear infinite;z-index:1;}
        .pulse-emoji{animation:pulseEmoji 1.5s ease-in-out infinite;display:inline-block;}
        .mini-spinner{width:15px;height:15px;border:2px solid;border-radius:50%;animation:spin 0.7s linear infinite;}
        .fact-icon{animation:fadeInScale 0.5s ease;}
        .fact-text{animation:fadeInUp 0.5s ease;}
      `}</style>
    </div>
    <Fuss />
    </>
  )
}
