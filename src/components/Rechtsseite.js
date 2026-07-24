'use client'
import { Kopf, D, BASIS_CSS } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'

// Gemeinsames Gerüst für Impressum / Datenschutz / AGB
export function Rechtsseite({ titel, stand, kinder }) {
  return (
    <div style={{ background: D.paper, color: D.dunkel, fontFamily: '"Inter Tight",system-ui,sans-serif', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + `
        .rtext{font-size:15px;line-height:1.8;color:#41506B}
        .rtext h2{font-family:'Inter Tight',sans-serif;font-weight:800;font-size:20px;letter-spacing:-.02em;color:${D.dunkel};margin:32px 0 10px}
        .rtext h3{font-weight:700;font-size:15.5px;color:${D.dunkel};margin:22px 0 6px}
        .rtext p{margin-bottom:12px}
        .rtext ul{margin:0 0 14px 20px}
        .rtext li{margin-bottom:6px}
        .rtext a{color:${D.blau};text-decoration:underline}
        .luecke{background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:2px 7px;font-weight:700;color:#92400E;font-size:13.5px}
      ` }} />
      <Kopf aktiv="Hilfe" />

      <section style={{ background: D.dunkel, color: '#fff', padding: '48px 0 44px' }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <a href="/" className="link-u" style={{ fontSize: 13, color: '#8496AE', display: 'inline-block', marginBottom: 16 }}>← Zurück zur Startseite</a>
          <h1 className="display" style={{ fontSize: 'clamp(28px,4.4vw,44px)' }}>{titel}</h1>
          {stand && <p style={{ fontSize: 13, color: '#8496AE', marginTop: 10 }}>Stand: {stand}</p>}
        </div>
      </section>

      <section style={{ padding: '40px 0 76px' }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="karte rtext" style={{ padding: '30px 30px 36px' }}>{kinder}</div>
          <p style={{ fontSize: 12.5, color: D.grauHell, marginTop: 16, lineHeight: 1.6 }}>
            Gelb markierte Stellen musst du noch ausfüllen. Diese Texte sind Vorlagen und keine Rechtsberatung –
            lass sie vor dem Start prüfen.
          </p>
        </div>
      </section>

      <Fuss />
    </div>
  )
}

export const L = ({ children }) => <span className="luecke">{children}</span>
