'use client'
import { useEffect, useRef, useState } from 'react'

// Blendet Elemente beim Scrollen ein (gestaffelt möglich)
export function Reveal({ children, verzug = 0, style, className = '' }) {
  const ref = useRef(null)
  const [an, setAn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setAn(true); return }
    const beob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setAn(true); beob.disconnect() }
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' })
    beob.observe(el)
    return () => beob.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${an ? 'an' : ''} ${className}`}
      style={{ transitionDelay: `${verzug}ms`, ...style }}>
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
    <div onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}>
      <div style={{ position: 'relative' }}>
        {folien.map((f, k) => (
          <div key={k} aria-hidden={k !== i}
            style={{
              opacity: k === i ? 1 : 0,
              transform: k === i ? 'none' : 'translateY(14px)',
              transition: 'opacity .55s cubic-bezier(.2,.7,.3,1), transform .55s cubic-bezier(.2,.7,.3,1)',
              position: k === i ? 'relative' : 'absolute',
              inset: k === i ? 'auto' : 0,
              pointerEvents: k === i ? 'auto' : 'none',
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
                width: k === i ? 26 : 8, height: 8, borderRadius: 2, border: 'none', cursor: 'pointer',
                background: k === i ? '#E1591F' : 'rgba(255,255,255,.22)',
                transition: 'all .3s cubic-bezier(.2,.7,.3,1)',
              }} />
          ))}
        </div>
      )}
    </div>
  )
}
