'use client'
import { useState } from 'react'
import { Seite } from '@/components/Seite'
import { D, TELEFON, TELEFON_LINK, EMAIL } from '@/components/Kopf'
import { FRAGEN, GRUPPEN_REIHE } from '@/lib/fragen'

export default function Hilfe() {
  const [suche, setSuche] = useState('')
  const gefiltert = FRAGEN.filter(q =>
    !suche.trim() || (q.f + q.a).toLowerCase().includes(suche.toLowerCase())
  )

  return (
    <Seite
      eyebrow="Hilfe & Support"
      titel="Antworten"
      titelLeicht="auf die häufigsten Fragen."
      einleitung="Kosten, Ablauf, Technik, Recht. Ist deine Frage nicht dabei, ruf an oder schreib — wir antworten in der Regel am nächsten Werktag."
      css={`
        .frage summary{cursor:pointer;list-style:none}
        .frage summary::-webkit-details-marker{display:none}
        .frage{transition:border-color .16s,box-shadow .16s}
        .frage:hover{border-color:${D.blau};box-shadow:0 6px 20px rgba(10,24,36,.07)}
        .frage[open]{border-color:${D.blau}}
        .frage[open] .plus{transform:rotate(45deg)}
        .plus{transition:transform .2s;display:inline-block}
        .suchfeld{width:100%;max-width:420px;padding:12px 16px;font-size:14.5px;border:2px solid ${D.linie};border-radius:11px;outline:none;transition:border-color .16s}
        .suchfeld:focus{border-color:${D.blau}}
      `}
    >
      <section style={{ padding: '46px 0 20px' }}>
        <div className="wrap" style={{ maxWidth: 840 }}>
          <input className="suchfeld" placeholder="In der Hilfe suchen …" value={suche} onChange={e => setSuche(e.target.value)} style={{ marginBottom: 34 }} />

          {GRUPPEN_REIHE.map(g => {
            const liste = gefiltert.filter(q => q.g === g)
            if (!liste.length) return null
            return (
              <div key={g} style={{ marginBottom: 34 }}>
                <p className="eyebrow" style={{ color: D.blau, marginBottom: 14 }}>{g}</p>
                {liste.map(q => (
                  <details key={q.f} className="karte frage" style={{ padding: '15px 18px', marginBottom: 9 }}>
                    <summary style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15.5, fontWeight: 700 }}>
                      <span style={{ flex: 1 }}>{q.f}</span>
                      <span className="plus" aria-hidden="true" style={{ color: D.blau, fontSize: 19, fontWeight: 700, lineHeight: 1 }}>+</span>
                    </summary>
                    <p style={{ fontSize: 14.5, color: D.grau, lineHeight: 1.78, marginTop: 12 }}>{q.a}</p>
                  </details>
                ))}
              </div>
            )
          })}

          {gefiltert.length === 0 && (
            <div className="karte" style={{ padding: 24, fontSize: 14.5, color: D.grau, lineHeight: 1.7 }}>
              Zu „{suche}" haben wir keine Antwort gefunden. Frag uns direkt — telefonisch oder per E-Mail.
            </div>
          )}

          <div className="karte" style={{ padding: '26px 26px', marginTop: 10, marginBottom: 60, borderColor: D.blau, borderWidth: 2 }}>
            <h2 className="display" style={{ fontSize: 20, marginBottom: 10 }}>Frage nicht beantwortet?</h2>
            <p style={{ fontSize: 14.5, color: D.grau, lineHeight: 1.7, marginBottom: 16 }}>
              Ruf an — Mo. bis Fr. von 9 bis 18 Uhr geht jemand ans Telefon.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href={TELEFON_LINK} className="btnfest">{TELEFON}</a>
              <a href={`mailto:${EMAIL}`} className="btnleer">E-Mail schreiben</a>
              <a href="/kontakt" className="btnleer">Kontaktformular</a>
            </div>
          </div>
        </div>
      </section>
    </Seite>
  )
}
