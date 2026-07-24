'use client'
import { D } from '@/components/Kopf'

const PUNKTE = [
  ['dashboard', '/dashboard', 'Meine Websites'],
  ['konto', '/konto', 'Meine Daten'],
  ['abrechnungen', '/abrechnungen', 'Abrechnungen'],
  ['hilfe', '/hilfe', 'Hilfe'],
]

export function KontoNav({ aktiv }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22, borderBottom: `1px solid ${D.linie}`, paddingBottom: 2 }}>
      {PUNKTE.map(([id, href, t]) => {
        const an = aktiv === id
        return (
          <a key={id} href={href} style={{
            fontSize: 13.5, fontWeight: 700, padding: '10px 14px', borderRadius: '9px 9px 0 0',
            color: an ? D.blau : D.grau, background: an ? D.blauZart : 'transparent',
            borderBottom: `2px solid ${an ? D.blau : 'transparent'}`, transition: 'all .15s',
          }}>{t}</a>
        )
      })}
    </div>
  )
}
