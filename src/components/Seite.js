'use client'
import { Kopf, D, BASIS_CSS } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'
import { Chat } from '@/components/Chat'

export const FONT_LINK = '/schrift/schrift.css'

// Gemeinsames Gerüst für alle Unterseiten
export function Seite({ eyebrow, titel, titelLeicht, einleitung, children, css = '' }) {
  return (
    <div style={{ background: D.paper, color: D.dunkel, fontFamily: '"Inter Tight",system-ui,sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <link href="/schrift/schrift.css" rel="stylesheet" />
      <link href="/fa/css/all.min.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + css }} />
      <Kopf />

      <section style={{ background: D.dunkel, color: '#fff', padding: '54px 0 50px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: `radial-gradient(760px 340px at 18% -20%, ${D.blau}3D, transparent 68%)` }} />
        <div className="wrap" style={{ position: 'relative', maxWidth: 860 }}>
          <a href="/" className="link-u" style={{ fontSize: 13, color: '#8496AE', display: 'inline-block', marginBottom: 18 }}>← Zurück zur Startseite</a>
          {eyebrow && <p className="eyebrow" style={{ color: D.blauHell, marginBottom: 14 }}>{eyebrow}</p>}
          <h1 className="display" style={{ fontSize: 'clamp(30px,5vw,50px)', marginBottom: 16 }}>
            {titel} {titelLeicht && <span style={{ fontWeight: 300, color: '#8DA2C2' }}>{titelLeicht}</span>}
          </h1>
          {einleitung && <p style={{ fontSize: 16.5, color: '#B7C4D9', maxWidth: 640, lineHeight: 1.68 }}>{einleitung}</p>}
        </div>
      </section>

      <div style={{ flex: 1 }}>{children}</div>
      <Fuss />
      <Chat />
    </div>
  )
}

// Abschluss-Aufruf für Unterseiten
export function Abschluss({ titel = 'Schauen kostet nichts.', text = 'Geh die Fragen durch und sieh dir das Ergebnis an. Bezahlt wird erst, wenn dir die Website gefällt.' }) {
  return (
    <section style={{ padding: '20px 0 76px' }}>
      <div className="wrap">
        <div style={{ background: `linear-gradient(140deg,${D.dunkel},${D.blau})`, borderRadius: 18, padding: '48px 34px', textAlign: 'center' }}>
          <h2 className="display" style={{ fontSize: 'clamp(24px,3.4vw,34px)', color: '#fff', marginBottom: 12 }}>{titel}</h2>
          <p style={{ fontSize: 15.5, color: '#D3DEF8', maxWidth: 480, margin: '0 auto 26px', lineHeight: 1.65 }}>{text}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/start" className="btnhell">Website erstellen</a>
            <a href="/preise" style={{ border: '1px solid rgba(255,255,255,.35)', color: '#fff', borderRadius: 10, padding: '13px 24px', fontSize: 14.5, fontWeight: 700 }}>Preise ansehen</a>
          </div>
        </div>
      </div>
    </section>
  )
}
