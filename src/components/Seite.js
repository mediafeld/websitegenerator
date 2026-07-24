'use client'
import { Kopf, D, BASIS_CSS, CI } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'
import { Chat } from '@/components/Chat'

export const FONT_LINK = '/schrift/schrift.css'

// Gemeinsames Gerüst für alle Unterseiten
export function Seite({ eyebrow, titel, titelLeicht, einleitung, children, css = '' }) {
  return (
    <div style={{ background: '#fff', color: CI.text, fontFamily: '"InterTight",system-ui,sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <link href="/schrift/schrift.css" rel="stylesheet" />
      <link href="/fa/css/all.min.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + css }} />
      <Kopf />

      <section className="band band-foto dunkelzone" style={{ padding: '62px 0 66px', backgroundImage: "url(/bilder/hero-buero.webp)" }}>
        <div className="wrap" style={{ position: 'relative', maxWidth: 860 }}>
          <a href="/" className="link-u" style={{ fontSize: 13, color: '#9FB2C0', display: 'inline-block', marginBottom: 18 }}>← Zurück zur Startseite</a>
          {eyebrow && <p className="eyebrow" style={{ color: '#6FC3EF', marginBottom: 14 }}>{eyebrow}</p>}
          <h1 className="t1" style={{ color: '#fff', marginBottom: 18 }}>
            {titel} {titelLeicht && <b>{titelLeicht}</b>}
          </h1>
          {einleitung && <p style={{ fontSize: 16.5, color: '#C7D6E0', maxWidth: 660, lineHeight: 1.74 }}>{einleitung}</p>}
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
        <div style={{ background: CI.petrol, borderRadius: 18, padding: '48px 34px', textAlign: 'center' }}>
          <h2 className="display" style={{ fontSize: 'clamp(28px,4vw,44px)', color: '#fff', marginBottom: 14 }}>{titel}</h2>
          <p style={{ fontSize: 15.5, color: '#9FB2C0', maxWidth: 480, margin: '0 auto 26px', lineHeight: 1.65 }}>{text}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/start" className="btnhell">Website erstellen</a>
            <a href="/preise" style={{ border: '1px solid rgba(255,255,255,.35)', color: '#fff', borderRadius: 10, padding: '13px 24px', fontSize: 14.5, fontWeight: 700 }}>Preise ansehen</a>
          </div>
        </div>
      </div>
    </section>
  )
}
