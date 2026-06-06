'use client'
import { useState } from 'react'

// Menü-Builder: Seiten anlegen, anordnen (Drag&Drop), verschachteln
// Wert: Array von { id, label, type, children: [] }

const VORLAGEN = [
  { label: 'Startseite', fix: true },
  { label: 'Leistungen' },
  { label: 'Über uns' },
  { label: 'Team' },
  { label: 'Portfolio' },
  { label: 'Galerie' },
  { label: 'Preise' },
  { label: 'Blog' },
  { label: 'Kontakt', fix: true },
]

export default function MenuBuilder({ value, onChange, primary, maxPages = 5 }) {
  const [dragId, setDragId] = useState(null)
  const [overId, setOverId] = useState(null)
  const [newName, setNewName] = useState('')

  const items = value || []
  const totalCount = countAll(items)

  function countAll(arr) {
    return arr.reduce((n, it) => n + 1 + (it.children?.length || 0), 0)
  }

  function addPage(label) {
    if (!label.trim()) return
    if (totalCount >= maxPages + 2) { alert(`Maximal ${maxPages} Unterseiten in deinem Paket.`); return }
    const id = 'p_' + Math.random().toString(36).slice(2, 8)
    // Vor Kontakt einfügen (Kontakt soll letztes bleiben)
    const next = [...items]
    const kontaktIdx = next.findIndex(i => i.label === 'Kontakt')
    const newItem = { id, label: label.trim(), children: [] }
    if (kontaktIdx >= 0) next.splice(kontaktIdx, 0, newItem)
    else next.push(newItem)
    onChange(next)
    setNewName('')
  }

  function removePage(id) {
    onChange(items.filter(i => i.id !== id).map(i => ({ ...i, children: (i.children || []).filter(c => c.id !== id) })))
  }

  function renamePage(id, label) {
    onChange(items.map(i => {
      if (i.id === id) return { ...i, label }
      return { ...i, children: (i.children || []).map(c => c.id === id ? { ...c, label } : c) }
    }))
  }

  function onDrop(targetId, asChild = false) {
    if (!dragId || dragId === targetId) { setDragId(null); setOverId(null); return }
    // Finde gezogenes Item
    let dragged = items.find(i => i.id === dragId)
    let fromTop = true
    if (!dragged) {
      // war ein Kind
      for (const it of items) {
        const c = (it.children || []).find(c => c.id === dragId)
        if (c) { dragged = c; fromTop = false; break }
      }
    }
    if (!dragged || dragged.fix) { setDragId(null); setOverId(null); return }

    // Entferne aus alter Position
    let next = items.filter(i => i.id !== dragId).map(i => ({ ...i, children: (i.children || []).filter(c => c.id !== dragId) }))

    if (asChild) {
      // Als Unterseite unter targetId einfügen
      next = next.map(i => i.id === targetId ? { ...i, children: [...(i.children || []), { ...dragged, children: [] }] } : i)
    } else {
      // Vor targetId auf oberster Ebene einfügen
      const idx = next.findIndex(i => i.id === targetId)
      if (idx >= 0) next.splice(idx, 0, { ...dragged })
      else next.push({ ...dragged })
    }
    onChange(next)
    setDragId(null); setOverId(null)
  }

  const usedLabels = items.flatMap(i => [i.label, ...(i.children || []).map(c => c.label)])

  return (
    <div>
      {/* Schnell-Vorlagen */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Seite hinzufügen</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {VORLAGEN.filter(v => !v.fix && !usedLabels.includes(v.label)).map(v => (
            <button key={v.label} onClick={() => addPage(v.label)} style={{ padding: '6px 12px', border: `1px solid ${primary}55`, borderRadius: 8, background: primary + '0d', color: primary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>+ {v.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPage(newName)} placeholder="Eigene Seite (z.B. Speisekarte)" style={{ flex: 1, border: '2px solid #e5e5e5', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
          <button onClick={() => addPage(newName)} style={{ background: primary, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>+ Anlegen</button>
        </div>
      </div>

      {/* Menü-Struktur */}
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Menü-Struktur ({totalCount} Seiten) – ziehen zum Sortieren</div>
      <div style={{ background: '#f8fafc', border: '1px solid #e5e5e5', borderRadius: 12, padding: 10 }}>
        {items.map((item) => (
          <div key={item.id}>
            {/* Hauptseite */}
            <div
              draggable={!item.fix}
              onDragStart={() => setDragId(item.id)}
              onDragOver={e => { e.preventDefault(); setOverId(item.id) }}
              onDrop={() => onDrop(item.id, false)}
              onDragEnd={() => { setDragId(null); setOverId(null) }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#fff', border: `2px solid ${overId === item.id ? primary : '#e5e5e5'}`, borderRadius: 9, marginBottom: 6, cursor: item.fix ? 'default' : 'grab', opacity: dragId === item.id ? 0.4 : 1 }}>
              {!item.fix && <span style={{ color: '#cbd5e1', fontSize: 16, cursor: 'grab' }}>⠿</span>}
              <input value={item.label} onChange={e => renamePage(item.id, e.target.value)} disabled={item.fix} style={{ flex: 1, border: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', outline: 'none', background: 'transparent', color: '#0f172a' }} />
              {item.fix && <span style={{ fontSize: 10, color: '#94a3b8', background: '#f1f5f9', padding: '3px 8px', borderRadius: 99 }}>fix</span>}
              {!item.fix && (
                <button onClick={() => removePage(item.id)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: 16, padding: 4 }} onMouseEnter={e => e.currentTarget.style.color = '#dc2626'} onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>✕</button>
              )}
            </div>
            {/* Drop-Zone für Unterseiten */}
            {dragId && dragId !== item.id && !item.fix && (
              <div onDragOver={e => { e.preventDefault(); setOverId('child_' + item.id) }} onDrop={() => onDrop(item.id, true)}
                style={{ marginLeft: 32, marginBottom: 6, padding: '6px 12px', border: `2px dashed ${overId === 'child_' + item.id ? primary : '#e2e8f0'}`, borderRadius: 8, fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                ↳ als Unterseite ablegen
              </div>
            )}
            {/* Bestehende Unterseiten */}
            {(item.children || []).map(child => (
              <div key={child.id} draggable onDragStart={() => setDragId(child.id)} onDragEnd={() => { setDragId(null); setOverId(null) }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fff', border: '2px solid #e5e5e5', borderRadius: 9, marginBottom: 6, marginLeft: 32, cursor: 'grab', opacity: dragId === child.id ? 0.4 : 1 }}>
                <span style={{ color: '#cbd5e1', fontSize: 14 }}>↳</span>
                <span style={{ color: '#cbd5e1', fontSize: 14, cursor: 'grab' }}>⠿</span>
                <input value={child.label} onChange={e => renamePage(child.id, e.target.value)} style={{ flex: 1, border: 'none', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', outline: 'none', background: 'transparent' }} />
                <button onClick={() => removePage(child.id)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: 15, padding: 4 }}>✕</button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>💡 Tipp: Seite auf eine andere ziehen → wird zur Unterseite (Dropdown im Menü). Dieses Menü erscheint identisch auf allen Seiten.</div>
    </div>
  )
}
