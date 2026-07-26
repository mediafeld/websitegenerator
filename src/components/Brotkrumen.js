'use client'

// Kleine Orientierungshilfe: "Wo bin ich gerade?"
// Nutzung:  <Brotkrumen pfad={[['Start','/'], ['Konto','/dashboard'], ['Meine Daten']]} />
// Der letzte Eintrag ist immer die aktuelle Seite (ohne Link).

export function Brotkrumen({ pfad = [], hell = false }) {
  if (!pfad.length) return null
  const farbe = hell ? 'rgba(255,255,255,.65)' : '#8A99A6'
  const aktivFarbe = hell ? '#fff' : '#0A1824'
  return (
    <nav aria-label="Brotkrumen" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 7, fontSize: 12.5, color: farbe, padding: '10px 0' }}>
      <i className="fa-solid fa-location-dot" style={{ fontSize: 11, opacity: .7 }} aria-hidden="true" />
      {pfad.map(([label, href], i) => {
        const letzter = i === pfad.length - 1
        return (
          <span key={label + i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            {i > 0 && <i className="fa-solid fa-chevron-right" style={{ fontSize: 8.5, opacity: .5 }} aria-hidden="true" />}
            {letzter || !href
              ? <b style={{ color: aktivFarbe, fontWeight: 700 }}>{label}</b>
              : <a href={href} style={{ color: farbe, textDecoration: 'none' }} onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>{label}</a>}
          </span>
        )
      })}
    </nav>
  )
}
