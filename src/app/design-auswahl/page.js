'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateCIPalette } from '@/lib/colorSystem'

const STILE = [
  {
    id: 'dark-elite',
    name: 'Dark Elite',
    sub: 'Premium & modern',
    desc: 'Dunkle Hero-Bereiche, edle Kontraste, viel Wirkung. Wie Linear oder Vercel.',
    heroVariant: 'hero-gradient',
    serviceVariant: 'services-cards',
    aboutVariant: 'about-stats',
    preview: (p) => `linear-gradient(135deg,${p[900]},${p[700]})`,
  },
  {
    id: 'clean-pro',
    name: 'Clean Pro',
    sub: 'Hell & professionell',
    desc: 'Helle Flächen, Split-Layouts, klare Struktur. Wie Stripe oder Notion.',
    heroVariant: 'hero-split',
    serviceVariant: 'services-icons',
    aboutVariant: 'about-split',
    preview: (p) => `linear-gradient(135deg,${p[50]},${p[200]})`,
  },
  {
    id: 'bold-center',
    name: 'Bold Center',
    sub: 'Zentriert & kräftig',
    desc: 'Große zentrierte Headlines, klare Botschaft. Wie Framer-Templates.',
    heroVariant: 'hero-center',
    serviceVariant: 'services-list',
    aboutVariant: 'about-stats',
    preview: (p) => `linear-gradient(160deg,#ffffff,${p[100]})`,
  },
]

export default function DesignAuswahlPage() {
  const router = useRouter()
  const [formData, setFormData] = useState(null)
  const [palette, setPalette] = useState(null)
  const [selected, setSelected] = useState('dark-elite')

  useEffect(() => {
    const f = sessionStorage.getItem('wg24_formData')
    if (!f) { router.push('/'); return }
    const fd = JSON.parse(f)
    setFormData(fd)
    setPalette(generateCIPalette(fd.farbe || '#1d4ed8'))
  }, [])

  function weiter() {
    const fd = { ...formData, stilVariante: selected }
    sessionStorage.setItem('wg24_formData', JSON.stringify(fd))
    router.push('/generating')
  }

  const primary = palette?.primary?.[500] || '#1d4ed8'
  const p = palette?.primary || {}

  if (!formData || !palette) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #f0f0f0', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '"Inter Tight",sans-serif' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #e5e5e5', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: -0.5 }}>websitegenerator24<span style={{ color: '#aaa', fontWeight: 400 }}>.de</span></span>
        <button onClick={weiter} style={{ background: primary, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>✨ Mit "{STILE.find(s => s.id === selected)?.name}" generieren →</button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5, marginBottom: 10 }}>Wähle deinen Design-Stil</h1>
          <p style={{ color: '#64748b', fontSize: 16 }}>Drei Looks mit deiner Farbe. Du kannst danach alles im Editor weiter anpassen.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {STILE.map(s => (
            <div key={s.id} onClick={() => setSelected(s.id)} style={{ border: `3px solid ${selected === s.id ? primary : '#e5e5e5'}`, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', background: '#fff', transform: selected === s.id ? 'translateY(-4px)' : 'none', boxShadow: selected === s.id ? `0 12px 32px ${primary}22` : '0 2px 8px rgba(0,0,0,0.04)' }}>
              {/* Mini-Mockup */}
              <div style={{ height: 200, background: s.preview(p), position: 'relative', overflow: 'hidden', padding: 20 }}>
                {/* simulierte Nav */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div style={{ width: 50, height: 8, borderRadius: 4, background: s.id === 'dark-elite' ? 'rgba(255,255,255,0.9)' : p[700] }} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1,2,3].map(i => <div key={i} style={{ width: 20, height: 5, borderRadius: 3, background: s.id === 'dark-elite' ? 'rgba(255,255,255,0.4)' : p[400] }} />)}
                  </div>
                </div>
                {/* simulierte Headline */}
                <div style={{ textAlign: s.id === 'bold-center' ? 'center' : 'left' }}>
                  <div style={{ width: s.id === 'bold-center' ? '80%' : '70%', height: 14, borderRadius: 4, background: s.id === 'dark-elite' ? 'rgba(255,255,255,0.95)' : p[800], margin: s.id === 'bold-center' ? '0 auto 8px' : '0 0 8px' }} />
                  <div style={{ width: s.id === 'bold-center' ? '60%' : '50%', height: 14, borderRadius: 4, background: s.id === 'dark-elite' ? 'rgba(255,255,255,0.7)' : p[600], margin: s.id === 'bold-center' ? '0 auto 16px' : '0 0 16px' }} />
                  <div style={{ display: 'flex', gap: 8, justifyContent: s.id === 'bold-center' ? 'center' : 'flex-start' }}>
                    <div style={{ width: 60, height: 22, borderRadius: 6, background: s.id === 'dark-elite' ? '#fff' : p[500] }} />
                    <div style={{ width: 60, height: 22, borderRadius: 6, border: `2px solid ${s.id === 'dark-elite' ? 'rgba(255,255,255,0.5)' : p[300]}` }} />
                  </div>
                </div>
                {/* simulierte Cards für split */}
                {s.id === 'clean-pro' && (
                  <div style={{ position: 'absolute', right: 20, top: 60, width: 90, height: 110, borderRadius: 10, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }} />
                )}
              </div>
              {/* Info */}
              <div style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: primary, fontWeight: 600 }}>{s.sub}</div>
                  </div>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${selected === s.id ? primary : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selected === s.id && <div style={{ width: 12, height: 12, borderRadius: '50%', background: primary }} />}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 }}>
          <button onClick={() => router.push('/')} style={{ border: '2px solid #e5e5e5', background: '#fff', padding: '11px 22px', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← Zurück zum Wizard</button>
          <button onClick={weiter} style={{ background: primary, color: '#fff', border: 'none', padding: '13px 32px', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>✨ Website generieren →</button>
        </div>
      </div>
    </div>
  )
}
