'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateCIPalette } from '@/lib/colorSystem'
import { LAYOUTS, BRANCHEN_LAYOUT, getLayout } from '@/lib/layouts'

// Farbstimmung (nur Optik, keine Layout-Änderung)
const STIMMUNGEN = [
  { id: 'dark-elite', name: 'Dunkel & edel', desc: 'Dunkle Hero-Bereiche, edle Kontraste', bg: (p) => `linear-gradient(135deg,${p[900]},${p[700]})` },
  { id: 'clean-pro', name: 'Hell & klar', desc: 'Helle Flächen, viel Weißraum', bg: (p) => `linear-gradient(135deg,${p[50]},${p[200]})` },
  { id: 'bold-center', name: 'Kräftig & zentriert', desc: 'Große zentrierte Aussagen', bg: (p) => `linear-gradient(160deg,#fff,${p[100]})` },
]

// Wireframe-Zone -> Mini-Darstellung
function WireZone({ kind, p }) {
  const base = { borderRadius: 4, marginBottom: 4 }
  if (kind === 'hero') return <div style={{ ...base, height: 34, background: p[600], display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 6, gap: 3 }}>
    <div style={{ width: '60%', height: 5, background: 'rgba(255,255,255,0.9)', borderRadius: 2 }} />
    <div style={{ width: '40%', height: 4, background: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
  </div>
  if (kind === 'cards3') return <div style={{ ...base, display: 'flex', gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ flex: 1, height: 22, background: p[100], borderRadius: 3, border: `1px solid ${p[200]}` }} />)}</div>
  if (kind === 'split') return <div style={{ ...base, display: 'flex', gap: 4 }}><div style={{ flex: 1, height: 24, background: p[200], borderRadius: 3 }} /><div style={{ flex: 1, height: 24, background: p[100], borderRadius: 3 }} /></div>
  if (kind === 'quotes') return <div style={{ ...base, display: 'flex', gap: 4 }}>{[0,1].map(i => <div key={i} style={{ flex: 1, height: 18, background: p[50], borderRadius: 3, border: `1px solid ${p[200]}` }} />)}</div>
  if (kind === 'cta') return <div style={{ ...base, height: 16, background: p[500], borderRadius: 3 }} />
  if (kind === 'contact') return <div style={{ ...base, height: 20, background: p[100], borderRadius: 3, border: `1px dashed ${p[300]}` }} />
  if (kind === 'stats') return <div style={{ ...base, display: 'flex', gap: 4, justifyContent: 'space-around', height: 14 }}>{[0,1,2,3].map(i => <div key={i} style={{ flex: 1, background: p[300], borderRadius: 2 }} />)}</div>
  if (kind === 'team') return <div style={{ ...base, display: 'flex', gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ flex: 1, height: 24, background: p[100], borderRadius: 3, display: 'flex', justifyContent: 'center', paddingTop: 3 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: p[300] }} /></div>)}</div>
  if (kind === 'gallery') return <div style={{ ...base, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3 }}>{[0,1,2,3,4,5].map(i => <div key={i} style={{ height: 12, background: p[200], borderRadius: 2 }} />)}</div>
  if (kind === 'menu') return <div style={{ ...base, padding: 4, background: p[50], borderRadius: 3 }}>{[0,1,2].map(i => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><div style={{ width: '50%', height: 4, background: p[300], borderRadius: 2 }} /><div style={{ width: '15%', height: 4, background: p[400], borderRadius: 2 }} /></div>)}</div>
  if (kind === 'faq') return <div style={{ ...base }}>{[0,1].map(i => <div key={i} style={{ height: 9, background: p[100], borderRadius: 2, marginBottom: 3, border: `1px solid ${p[200]}` }} />)}</div>
  return null
}

export default function DesignAuswahlPage() {
  const router = useRouter()
  const [formData, setFormData] = useState(null)
  const [palette, setPalette] = useState(null)
  const [layout, setLayout] = useState('classic')
  const [stimmung, setStimmung] = useState('dark-elite')

  useEffect(() => {
    const f = sessionStorage.getItem('wg24_formData')
    if (!f) { router.push('/start'); return }
    const fd = JSON.parse(f)
    setFormData(fd)
    setPalette(generateCIPalette(fd.farbe || '#1d4ed8'))
    // Branchen-Empfehlung vorwählen
    if (fd.branche && BRANCHEN_LAYOUT[fd.branche]) setLayout(BRANCHEN_LAYOUT[fd.branche])
  }, [])

  function weiter() {
    const fd = { ...formData, stilVariante: stimmung, layout: layout, layoutBlocks: getLayout(layout).blocks }
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

  const recoLayout = BRANCHEN_LAYOUT[formData.branche]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '"Inter Tight",sans-serif' }}>
      <div style={{ borderBottom: '1px solid #e5e5e5', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
        <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: -0.5 }}>websitegenerator24<span style={{ color: '#aaa', fontWeight: 400 }}>.de</span></span>
        <button onClick={weiter} style={{ background: primary, color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Website generieren →</button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5, marginBottom: 8 }}>Wähle dein Layout</h1>
          <p style={{ color: '#64748b', fontSize: 16 }}>Die Anordnung deiner Startseite. Alles lässt sich danach im Editor frei anpassen.</p>
        </div>

        {/* LAYOUT-VORLAGEN */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 44 }}>
          {LAYOUTS.map(l => {
            const active = layout === l.id
            const reco = recoLayout === l.id
            return (
              <div key={l.id} onClick={() => setLayout(l.id)} style={{ border: `3px solid ${active ? primary : '#e5e5e5'}`, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', background: '#fff', transition: 'all 0.2s', transform: active ? 'translateY(-3px)' : 'none', boxShadow: active ? `0 12px 28px ${primary}22` : '0 2px 8px rgba(0,0,0,0.04)', position: 'relative' }}>
                {reco && <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, fontSize: 9, fontWeight: 700, background: '#22c55e', color: '#fff', padding: '3px 8px', borderRadius: 99 }}>EMPFOHLEN</div>}
                {/* Wireframe-Vorschau */}
                <div style={{ background: '#f1f5f9', padding: 14, minHeight: 180 }}>
                  <div style={{ background: '#fff', borderRadius: 6, padding: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    {/* Mini-Nav */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <div style={{ width: 24, height: 5, background: p[700], borderRadius: 2 }} />
                      <div style={{ display: 'flex', gap: 3 }}>{[0,1,2].map(i => <div key={i} style={{ width: 10, height: 3, background: p[300], borderRadius: 2 }} />)}</div>
                    </div>
                    {l.wire.map((z, i) => <WireZone key={i} kind={z} p={p} />)}
                  </div>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{l.name}</div>
                      <div style={{ fontSize: 12, color: primary, fontWeight: 600 }}>{l.sub}</div>
                    </div>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${active ? primary : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{active && <div style={{ width: 11, height: 11, borderRadius: '50%', background: primary }} />}</div>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.5 }}>{l.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* FARBSTIMMUNG */}
        <div style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Farbstimmung</h2>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Wie hell oder dunkel soll der Look sein?</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 40 }}>
          {STIMMUNGEN.map(s => {
            const active = stimmung === s.id
            return (
              <div key={s.id} onClick={() => setStimmung(s.id)} style={{ border: `3px solid ${active ? primary : '#e5e5e5'}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer', background: '#fff' }}>
                <div style={{ height: 70, background: s.bg(p) }} />
                <div style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{s.desc}</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${active ? primary : '#ccc'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{active && <div style={{ width: 10, height: 10, borderRadius: '50%', background: primary }} />}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => router.push('/start')} style={{ border: '2px solid #e5e5e5', background: '#fff', padding: '11px 22px', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← Zurück</button>
          <button onClick={weiter} style={{ background: primary, color: '#fff', border: 'none', padding: '13px 32px', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>Website generieren →</button>
        </div>
      </div>
    </div>
  )
}
