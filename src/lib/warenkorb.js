'use client'
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'

const SCHLUESSEL = 'wg24_warenkorb'
const WarenkorbContext = createContext(null)

// Ein Artikel: { id, titel, unter, preis, art: 'einmalig' | 'monatlich', menge }
export function WarenkorbProvider({ children }) {
  const [artikel, setArtikel] = useState([])
  const [offen, setOffen] = useState(false)
  const [geladen, setGeladen] = useState(false)

  // Beim ersten Laden aus dem Browser-Speicher holen
  useEffect(() => {
    try {
      const roh = localStorage.getItem(SCHLUESSEL)
      if (roh) setArtikel(JSON.parse(roh))
    } catch {}
    setGeladen(true)
  }, [])

  // Bei jeder Änderung sichern — bleibt seitenübergreifend erhalten
  useEffect(() => {
    if (!geladen) return
    try { localStorage.setItem(SCHLUESSEL, JSON.stringify(artikel)) } catch {}
  }, [artikel, geladen])

  const hinzufuegen = useCallback((neu) => {
    setArtikel(v => {
      const bestehend = v.find(a => a.id === neu.id)
      if (bestehend) return v.map(a => a.id === neu.id ? { ...a, menge: a.menge + (neu.menge || 1) } : a)
      return [...v, { menge: 1, ...neu }]
    })
    setOffen(true)
  }, [])

  const entfernen = useCallback((id) => setArtikel(v => v.filter(a => a.id !== id)), [])
  const mengeAendern = useCallback((id, delta) => {
    setArtikel(v => v.map(a => a.id === id ? { ...a, menge: Math.max(1, a.menge + delta) } : a).filter(a => a.menge > 0))
  }, [])
  const leeren = useCallback(() => setArtikel([]), [])

  const anzahl = useMemo(() => artikel.reduce((s, a) => s + a.menge, 0), [artikel])
  const zwischensumme = useMemo(() => artikel.reduce((s, a) => s + a.preis * a.menge, 0), [artikel])
  const mwst = zwischensumme * 0.19
  const gesamt = zwischensumme + mwst

  const wert = { artikel, offen, setOffen, hinzufuegen, entfernen, mengeAendern, leeren, anzahl, zwischensumme, mwst, gesamt }
  return <WarenkorbContext.Provider value={wert}>{children}</WarenkorbContext.Provider>
}

export function useWarenkorb() {
  const ctx = useContext(WarenkorbContext)
  // Fällt außerhalb des Providers auf einen leeren, funktionslosen Warenkorb zurück
  // (z. B. falls eine Seite den Provider noch nicht eingebunden hat) — bricht dadurch nie.
  if (!ctx) {
    return { artikel: [], offen: false, setOffen: () => {}, hinzufuegen: () => {}, entfernen: () => {}, mengeAendern: () => {}, leeren: () => {}, anzahl: 0, zwischensumme: 0, mwst: 0, gesamt: 0 }
  }
  return ctx
}
