'use client'
import { useEffect, useRef, useState } from 'react'

// Blendet Elemente beim Scrollen ein — und wieder aus, wenn sie den Bildschirm verlassen
// (in beide Richtungen: fliegt rein beim Runter-, wieder raus beim Hochscrollen).
// art: 'hoch' (Standard, von unten) | 'pop' (skaliert auf) | 'links' | 'rechts'
export function Reveal({ children, verzug = 0, style, className = '', art = 'hoch' }) {
  const ref = useRef(null)
  const [an, setAn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setAn(true); return }
    const beob = new IntersectionObserver(([e]) => {
      setAn(e.isIntersecting)
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' })
    beob.observe(el)
    return () => beob.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal reveal-${art} ${an ? 'an' : ''} ${className}`}
      style={{ transitionDelay: an ? `${verzug}ms` : '0ms', ...style }}>
      {children}
    </div>
  )
}

// Zählt eine Zahl hoch, sobald sie sichtbar wird
export function Zaehler({ bis, dauer = 1400, suffix = '', style }) {
  const ref = useRef(null)
  const [wert, setWert] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setWert(bis); return }
    const beob = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      beob.disconnect()
      const leise = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      if (leise) { setWert(bis); return }
      const start = performance.now()
      const schritt = (jetzt) => {
        const p = Math.min(1, (jetzt - start) / dauer)
        setWert(Math.round(bis * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(schritt)
      }
      requestAnimationFrame(schritt)
    }, { threshold: 0.4 })
    beob.observe(el)
    return () => beob.disconnect()
  }, [bis, dauer])

  return <span ref={ref} style={style}>{wert}{suffix}</span>
}

// Hero-Slider mit Auto-Wechsel und Punkten
export function Slider({ folien, dauer = 6500 }) {
  const [i, setI] = useState(0)
  const [pause, setPause] = useState(false)

  useEffect(() => {
    if (pause || folien.length < 2) return
    const leise = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (leise) return
    const t = setTimeout(() => setI(v => (v + 1) % folien.length), dauer)
    return () => clearTimeout(t)
  }, [i, pause, folien.length, dauer])

  return (
    <div onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)} style={{ width: '100%' }}>
      <div style={{ position: 'relative', width: '100%' }}>
        {folien.map((f, k) => (
          <div key={k} aria-hidden={k !== i}
            style={{
              opacity: k === i ? 1 : 0,
              transform: k === i ? 'none' : 'translateY(14px)',
              transition: 'opacity .55s cubic-bezier(.2,.7,.3,1), transform .55s cubic-bezier(.2,.7,.3,1)',
              position: k === i ? 'relative' : 'absolute',
              inset: k === i ? 'auto' : 0,
              pointerEvents: k === i ? 'auto' : 'none',
              width: '100%',
            }}>
            {f}
          </div>
        ))}
      </div>
      {folien.length > 1 && (
        <div style={{ display: 'flex', gap: 9, justifyContent: 'center', marginTop: 26 }}>
          {folien.map((_, k) => (
            <button key={k} onClick={() => setI(k)} aria-label={`Folie ${k + 1}`}
              style={{
                width: k === i ? 28 : 9, height: 9, borderRadius: 99, border: 'none', cursor: 'pointer',
                background: k === i ? '#1B93D2' : 'rgba(255,255,255,.25)',
                transition: 'all .3s cubic-bezier(.2,.7,.3,1)',
              }} />
          ))}
        </div>
      )}
    </div>
  )
}

// Umschalter — ein echter Schalter statt zwei nebeneinanderstehender Kästen (z. B. Mieten/Kaufen)
export function Umschalter({ wert, setWert, aLabel = 'Website mieten', bLabel = 'Website kaufen', aWert = 'mieten', bWert = 'kaufen' }) {
  const istA = wert === aWert
  return (
    <div className="umschalter">
      <button type="button" className={istA ? 'an' : ''} onClick={() => setWert(aWert)}>{aLabel}</button>
      <span className="uschalt" onClick={() => setWert(istA ? bWert : aWert)} role="switch" aria-checked={!istA} tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setWert(istA ? bWert : aWert) } }}>
        <span className="ukugel" style={{ transform: istA ? 'translateX(0)' : 'translateX(20px)' }} />
      </span>
      <button type="button" className={!istA ? 'an' : ''} onClick={() => setWert(bWert)}>{bLabel}</button>
    </div>
  )
}

// Einleitungs-Textblock für Unterseiten: Eyebrow + Überschrift + CTA links,
// zwei Fließtext-Spalten daneben — als sanfter Einstieg vor dem eigentlichen Inhalt.
export function Einleitung({ eyebrow, titel, titelFett, cta, spalte1, spalte2 }) {
  return (
    <Reveal>
      <div className="einleitung">
        <span className="eink-punkt" aria-hidden="true" />
        <div className="eink-kopf">
          <p className="eyebrow" style={{ marginBottom: 12 }}>{eyebrow}</p>
          <h2 className="t3" style={{ fontSize: 27, fontWeight: 300, marginBottom: 18, lineHeight: 1.28 }}>
            {titel} {titelFett && <b className="vschrift">{titelFett}</b>}
          </h2>
          {cta && <a href={cta.href} className="btnblau" style={{ fontSize: 14 }}>
            <i className="fa-solid fa-calculator" aria-hidden="true" />{cta.text}
          </a>}
        </div>
        <p className="lauf">{spalte1}</p>
        <p className="lauf">{spalte2}</p>
      </div>
    </Reveal>
  )
}
