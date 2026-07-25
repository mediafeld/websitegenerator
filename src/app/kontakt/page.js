'use client'
import { useState } from 'react'
import { Seite } from '@/components/Seite'
import { Einleitung } from '@/components/Effekte'
import { D, TELEFON, TELEFON_LINK, EMAIL } from '@/components/Kopf'

export default function Kontakt() {
  const [f, setF] = useState({ name: '', firma: '', email: '', telefon: '', thema: 'Frage vor dem Start', text: '', ok: false })
  const [gesendet, setGesendet] = useState(false)
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }))

  const bereit = f.name.trim() && f.email.includes('@') && f.text.trim().length > 8 && f.ok

  function senden() {
    // Ohne Server-Versand: öffnet das E-Mail-Programm mit vorbereiteter Nachricht.
    const betreff = encodeURIComponent(`${f.thema} – ${f.firma || f.name}`)
    const koerper = encodeURIComponent(
      `Name: ${f.name}\nFirma: ${f.firma}\nE-Mail: ${f.email}\nTelefon: ${f.telefon}\nThema: ${f.thema}\n\n${f.text}\n`
    )
    window.location.href = `mailto:${EMAIL}?subject=${betreff}&body=${koerper}`
    setGesendet(true)
  }

  return (
    <Seite
      eyebrow="Kontakt"
      titel="Schreib uns."
      titelLeicht="Oder ruf einfach an."
      einleitung="Bei Fragen zum Ablauf, zu Preisen oder wenn etwas nicht funktioniert. Wir antworten in der Regel am nächsten Werktag."
      css={`
        .feld{width:100%;padding:12px 14px;font-size:14px;border:2px solid ${D.linie};border-radius:10px;outline:none;transition:border-color .16s;background:#fff}
        .feld:focus{border-color:${D.blau}}
        .beschr{display:block;font-size:12px;font-weight:700;color:${D.textMatt};margin-bottom:6px}
        @media(max-width:860px){.kontaktgrid{grid-template-columns:1fr !important}}
      `}
    >
      <section style={{ padding: '0' }}>
        <div className="wrap">
          <Einleitung
            eyebrow="Bevor du schreibst"
            titel="Die meisten Fragen"
            titelFett="klären sich vorab."
            cta={{ text: 'Häufige Fragen ansehen', href: '/hilfe' }}
            spalte1="Fragen zu Preisen, Laufzeiten und dem Unterschied zwischen Mieten und Kaufen beantworten wir ausführlich auf der Hilfe-Seite — meist schneller, als eine Antwort per E-Mail dauert."
            spalte2="Geht es um dein konkretes Projekt, eine technische Frage oder etwas, das nicht funktioniert: Das Formular unten oder ein Anruf erreicht uns direkt, wir melden uns in der Regel am nächsten Werktag."
          />
        </div>
      </section>

      <section style={{ padding: '20px 0 70px' }}>
        <div className="wrap kontaktgrid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 34, alignItems: 'start', maxWidth: 1500 }}>
          <div className="karte" style={{ padding: 30 }}>
            {gesendet ? (
              <>
                <h2 className="display" style={{ fontSize: 22, marginBottom: 10 }}>Dein E-Mail-Programm ist geöffnet.</h2>
                <p style={{ fontSize: 14.5, color: D.textMatt, lineHeight: 1.7, marginBottom: 18 }}>
                  Bitte die Nachricht dort noch absenden. Falls sich nichts geöffnet hat,
                  schreib direkt an <a className="link-u" href={`mailto:${EMAIL}`} style={{ color: D.blau, fontWeight: 600 }}>{EMAIL}</a>.
                </p>
                <button className="btnleer" onClick={() => setGesendet(false)}>Nachricht ändern</button>
              </>
            ) : (
              <>
                <h2 className="display" style={{ fontSize: 22, marginBottom: 18 }}>Nachricht schreiben</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label className="beschr">Name *</label><input className="feld" value={f.name} onChange={e => upd('name', e.target.value)} /></div>
                  <div><label className="beschr">Firma</label><input className="feld" value={f.firma} onChange={e => upd('firma', e.target.value)} /></div>
                  <div><label className="beschr">E-Mail *</label><input className="feld" type="email" value={f.email} onChange={e => upd('email', e.target.value)} /></div>
                  <div><label className="beschr">Telefon</label><input className="feld" value={f.telefon} onChange={e => upd('telefon', e.target.value)} /></div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label className="beschr">Worum geht es?</label>
                  <select className="feld" value={f.thema} onChange={e => upd('thema', e.target.value)}>
                    {['Frage vor dem Start', 'Frage zu Preisen', 'Domain & Hosting', 'Problem mit dem Editor', 'Rechnung & Abrechnung', 'Kündigung', 'Sonstiges'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label className="beschr">Nachricht *</label>
                  <textarea className="feld" rows={6} value={f.text} onChange={e => upd('text', e.target.value)} style={{ resize: 'vertical' }} />
                </div>
                <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', marginBottom: 18 }}>
                  <input type="checkbox" checked={f.ok} onChange={e => upd('ok', e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, accentColor: D.blau, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: D.textMatt, lineHeight: 1.6 }}>
                    Ich habe die <a className="link-u" href="/datenschutz" style={{ color: D.blau }}>Datenschutzerklärung</a> gelesen
                    und bin damit einverstanden, dass meine Angaben zur Bearbeitung meiner Anfrage verarbeitet werden. *
                  </span>
                </label>
                <button className="btnfest" onClick={senden} disabled={!bereit} style={{ width: '100%', padding: 13, opacity: bereit ? 1 : .5, cursor: bereit ? 'pointer' : 'not-allowed' }}>
                  Nachricht senden
                </button>
                <p style={{ fontSize: 11.5, color: D.grauHell, marginTop: 12, lineHeight: 1.6 }}>
                  Die Nachricht wird über dein E-Mail-Programm versendet. Es werden keine Daten
                  auf unseren Servern gespeichert, bevor du absendest.
                </p>
              </>
            )}
          </div>

          <div>
            <div className="karte" style={{ padding: 24, marginBottom: 16 }}>
              <h3 className="display" style={{ fontSize: 17, marginBottom: 14 }}>Direkt erreichbar</h3>
              <div style={{ fontSize: 14, color: D.textMatt, lineHeight: 2.1 }}>
                <a className="link-u" href={TELEFON_LINK} style={{ fontWeight: 700, color: D.dunkel }}>{TELEFON}</a><br />
                <a className="link-u" href={`mailto:${EMAIL}`}>{EMAIL}</a><br />
                Mo. – Fr., 9 – 18 Uhr<br />
                Berlin
              </div>
            </div>
            <div className="karte" style={{ padding: 24 }}>
              <h3 className="display" style={{ fontSize: 17, marginBottom: 10 }}>Vielleicht schneller</h3>
              <p style={{ fontSize: 13.8, color: D.textMatt, lineHeight: 1.7, marginBottom: 14 }}>
                Viele Fragen sind in der Hilfe schon beantwortet — Kosten, Ablauf, Eigentum, Kündigung.
              </p>
              <a href="/hilfe" className="btnleer">Zur Hilfe &amp; FAQ</a>
            </div>
          </div>
        </div>
      </section>
    </Seite>
  )
}
