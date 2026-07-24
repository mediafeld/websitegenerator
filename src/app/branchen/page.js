'use client'
import { useState } from 'react'
import { Seite, Abschluss } from '@/components/Seite'
import { D } from '@/components/Kopf'
import { BRANCHEN_INFO, BILD } from '@/lib/branchenSeite'

export default function Branchen() {
  const [aktiv, setAktiv] = useState(BRANCHEN_INFO[0])

  return (
    <Seite
      eyebrow="Branchen"
      titel="Inhalte, die zur Branche passen."
      einleitung="Ein Restaurant braucht eine Speisekarte, eine Kanzlei Rechtsgebiete, ein Handwerksbetrieb den Notdienst. Wähle deine Branche und sieh, welche Bereiche du bekommst."
      css={`
        .chip{background:#fff;border:1px solid ${D.linie};border-radius:99px;padding:9px 15px;font-size:13px;font-weight:600;color:${D.grau};cursor:pointer;transition:all .16s}
        .chip:hover{border-color:${D.blau};color:${D.blau};transform:translateY(-1px)}
        .bkarte{overflow:hidden;transition:transform .2s,box-shadow .2s}
        .bkarte:hover{transform:translateY(-3px);box-shadow:0 14px 36px rgba(10,24,36,.1)}
        .bbild{transition:transform .5s cubic-bezier(.2,.7,.3,1)}
        .bkarte:hover .bbild{transform:scale(1.05)}
        @media(max-width:860px){.zweispalt{grid-template-columns:1fr !important}}
      `}
    >
      <section style={{ padding: '46px 0 20px' }}>
        <div className="wrap">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 26 }}>
            {BRANCHEN_INFO.map(b => (
              <button key={b.id} onClick={() => setAktiv(b)} className="chip"
                style={aktiv.id === b.id ? { background: D.blau, color: '#fff', borderColor: D.blau } : undefined}>
                {b.label}
              </button>
            ))}
          </div>

          <div className="karte zweispalt" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', overflow: 'hidden' }}>
            <div style={{ padding: '32px 30px' }}>
              <h2 className="display" style={{ fontSize: 24, marginBottom: 12 }}>{aktiv.label}</h2>
              <p style={{ fontSize: 15, color: D.grau, lineHeight: 1.72, marginBottom: 22 }}>{aktiv.text}</p>
              <p className="eyebrow" style={{ color: D.grauHell, marginBottom: 12 }}>Diese Bereiche bekommst du</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 26 }}>
                {aktiv.bereiche.map(t => (
                  <li key={t} style={{ display: 'flex', gap: 10, fontSize: 14.5, color: '#41506B' }}>
                    <span aria-hidden="true" style={{ color: D.blau, fontWeight: 800 }}>✓</span>{t}
                  </li>
                ))}
              </ul>
              <a href="/start" className="btnfest">Für {aktiv.label} starten</a>
            </div>
            <div style={{ minHeight: 340, overflow: 'hidden' }}>
              <div className="bbild" role="img" aria-label={`Beispielbild ${aktiv.label}`}
                style={{ width: '100%', height: '100%', minHeight: 340, background: `#E6EBF4 center/cover url(${BILD(aktiv.bild)})` }} />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '30px 0 10px' }}>
        <div className="wrap">
          <h2 className="display" style={{ fontSize: 26, marginBottom: 8 }}>Alle Branchen im Überblick</h2>
          <p style={{ fontSize: 15, color: D.grau, marginBottom: 24 }}>Klick auf eine Branche, um sie oben anzusehen.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 16 }}>
            {BRANCHEN_INFO.map(b => (
              <button key={b.id} onClick={() => { setAktiv(b); window.scrollTo({ top: 200, behavior: 'smooth' }) }}
                className="karte bkarte" style={{ padding: 0, textAlign: 'left', cursor: 'pointer', border: `1px solid ${D.linie}` }}>
                <div style={{ height: 128, overflow: 'hidden' }}>
                  <div className="bbild" style={{ width: '100%', height: 128, background: `#E6EBF4 center/cover url(${BILD(b.bild, 500)})` }} />
                </div>
                <div style={{ padding: '14px 16px 16px' }}>
                  <strong style={{ fontSize: 15, display: 'block', marginBottom: 4 }}>{b.label}</strong>
                  <span style={{ fontSize: 13, color: D.grau, lineHeight: 1.55 }}>{b.bereiche.length} Bereiche</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <Abschluss />
    </Seite>
  )
}
