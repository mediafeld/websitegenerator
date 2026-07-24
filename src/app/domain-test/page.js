'use client'
import { useState } from 'react'

export default function DomainTest() {
  const [name, setName] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [daten, setDaten] = useState(null)
  const [fehler, setFehler] = useState('')

  async function pruefen() {
    if (!name.trim()) return
    setLaedt(true); setFehler(''); setDaten(null)
    try {
      const res = await fetch('/api/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const json = await res.json()
      if (json.error) setFehler(json.error + (json.technisch ? ' — technisch: ' + json.technisch : ''))
      else setDaten(json)
    } catch (e) {
      setFehler('Verbindung fehlgeschlagen: ' + e.message)
    }
    setLaedt(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafbff', fontFamily: '"Roboto",system-ui,sans-serif', padding: 24 }}>
      <div style={{ maxWidth: 620, margin: '0 auto', paddingTop: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, color: '#0f172a' }}>Domain-Prüfung (Test)</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
          Firmenname eingeben – es wird geprüft, welche Domains noch frei sind.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pruefen()}
            placeholder="z. B. Müller Sanitär Berlin"
            style={{ flex: 1, padding: '13px 16px', fontSize: 15, border: '2px solid #e2e8f0', borderRadius: 10, outline: 'none', fontFamily: 'inherit' }}
          />
          <button
            onClick={pruefen}
            disabled={laedt}
            style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: laedt ? 'wait' : 'pointer', fontFamily: 'inherit', opacity: laedt ? 0.6 : 1 }}
          >
            {laedt ? 'Prüfe…' : 'Prüfen'}
          </button>
        </div>

        {fehler && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 10, padding: 14, fontSize: 13, lineHeight: 1.5, marginBottom: 20 }}>
            <strong>Fehler:</strong> {fehler}
          </div>
        )}

        {daten && (
          <>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', borderRadius: 10, padding: '10px 14px', fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>
              Geprüft über DNS und amtliche Registry-Abfrage (RDAP). Unabhängig von INWX – es wird nichts registriert.
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>
              Geprüfter Name: <strong style={{ color: '#475569' }}>{daten.label}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {daten.ergebnisse.map(e => (
                <div key={e.domain} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: `1px solid ${e.frei ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: 10, padding: '14px 16px' }}>
                  <span style={{ fontSize: 18 }}>{e.frei ? '✅' : '❌'}</span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{e.domain}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8', background: '#f1f5f9', borderRadius: 99, padding: '2px 9px', fontWeight: 600 }}>
                    Quelle: {e.quelle}{e.sicher ? '' : ' (ohne amtliche Auskunft)'}
                  </span>
                  {e.frei ? (
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>
                      {e.preis ? `${e.preis.toFixed(2).replace('.', ',')} € / Jahr` : 'frei'}
                    </span>
                  ) : (
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>vergeben</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
