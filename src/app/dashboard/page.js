'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, supabaseBereit, fehlerText } from '@/lib/supabaseClient'

const STATUS = {
  entwurf: { text: 'Entwurf', farbe: '#92400e', bg: '#fffbeb', rand: '#fde68a' },
  fertig:  { text: 'Fertig',  farbe: '#1e40af', bg: '#eff6ff', rand: '#bfdbfe' },
  online:  { text: 'Online',  farbe: '#15803d', bg: '#f0fdf4', rand: '#bbf7d0' },
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [projekte, setProjekte] = useState([])
  const [laedt, setLaedt] = useState(true)
  const [fehler, setFehler] = useState('')

  const laden = useCallback(async () => {
    const { data, error } = await supabase
      .from('projekte')
      .select('id,name,firma,branche,status,domain,geaendert_am')
      .order('geaendert_am', { ascending: false })
    if (error) setFehler(fehlerText(error))
    else setProjekte(data || [])
    setLaedt(false)
  }, [])

  useEffect(() => {
    if (!supabaseBereit) { setLaedt(false); return }
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) { router.replace('/login'); return }
      setUser(data.session.user)
      laden()
    })
  }, [router, laden])

  async function abmelden() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  async function loeschen(id, name) {
    if (!confirm(`„${name}" wirklich löschen? Das kann nicht rückgängig gemacht werden.`)) return
    const { error } = await supabase.from('projekte').delete().eq('id', id)
    if (error) setFehler(fehlerText(error))
    else setProjekte(p => p.filter(x => x.id !== id))
  }

  if (!supabaseBereit) {
    return <Mitte>Die Verbindung zur Datenbank fehlt. Bitte die Supabase-Variablen bei Vercel eintragen.</Mitte>
  }
  if (laedt) return <Mitte>Lade…</Mitte>

  return (
    <div style={{ minHeight: '100vh', background: '#fafbff', fontFamily: '"Inter Tight",system-ui,sans-serif' }}>
      {/* Kopfzeile */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8ecf3', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <strong style={{ fontSize: 15, color: '#0f172a' }}>websitegenerator<span style={{ color: '#1d4ed8' }}>24</span></strong>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{user?.email}</span>
        <button onClick={abmelden} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#475569' }}>Abmelden</button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Meine Websites</h1>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              {projekte.length === 0 ? 'Noch keine Website angelegt.' : `${projekte.length} ${projekte.length === 1 ? 'Website' : 'Websites'}`}
            </p>
          </div>
          <button onClick={() => router.push('/')} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            + Neue Website
          </button>
        </div>

        {fehler && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 10, padding: 14, fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>
            {fehler}
          </div>
        )}

        {projekte.length === 0 ? (
          <div style={{ background: '#fff', border: '2px dashed #d8e0ec', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 34, marginBottom: 12 }}>🌐</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#334155', marginBottom: 6 }}>Noch keine Website</div>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Leg deine erste Website an – dauert nur ein paar Minuten.</p>
            <button onClick={() => router.push('/')} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Jetzt starten
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {projekte.map(p => {
              const st = STATUS[p.status] || STATUS.entwurf
              return (
                <div key={p.id} style={{ background: '#fff', border: '1px solid #e8ecf3', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🌐</div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      {p.domain || 'noch keine Domain'}
                      {p.geaendert_am && ` · geändert ${new Date(p.geaendert_am).toLocaleDateString('de-DE')}`}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: st.farbe, background: st.bg, border: `1px solid ${st.rand}`, borderRadius: 99, padding: '4px 11px' }}>{st.text}</span>
                  <button onClick={() => router.push(`/editor?projekt=${p.id}`)} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Bearbeiten</button>
                  <button onClick={() => loeschen(p.id, p.name)} title="Löschen" style={{ background: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Löschen</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Mitte({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafbff', fontFamily: '"Inter Tight",system-ui,sans-serif', color: '#64748b', fontSize: 14, padding: 24, textAlign: 'center' }}>
      {children}
    </div>
  )
}
