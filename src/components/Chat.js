'use client'
import { useState } from 'react'
import { D, CI, TELEFON, TELEFON_LINK, EMAIL } from '@/components/Kopf'

const THEMEN = [
  ['circle-question', 'Was kostet es?', 'Miete ab 19,90 € im Monat inkl. MwSt. mit Domain, oder Kauf ab 89,00 € einmalig. Die Erstellung ist immer kostenlos — du zahlst erst am Ende.'],
  ['globe', 'Miete oder Kauf?', 'Mieten: alles läuft bei uns, Domain und E-Mail inklusive, 12 Monate Laufzeit. Kaufen: Einmalzahlung, du bekommst den Quellcode als ZIP und betreibst ihn selbst.'],
  ['clock', 'Wie lange dauert es?', 'Etwa 10 Minuten für die Angaben, 2 Minuten für die Erstellung. Für die Feinarbeit im Editor plan eine halbe Stunde ein.'],
  ['pen-to-square', 'Kosten Änderungen?', 'Nein, nie. Du änderst Texte, Bilder und Farben selbst im Editor — so oft du willst, bei Miete und Kauf.'],
  ['file-zipper', 'Gehört mir die Website?', 'Ja. Du bekommst den kompletten Quellcode als ZIP und kannst ihn bei jedem Anbieter betreiben.'],
]

export function Chat() {
  const [offen, setOffen] = useState(false)
  const [thema, setThema] = useState(null)
  const [text, setText] = useState('')

  function senden() {
    const betreff = encodeURIComponent('Frage über den Chat')
    window.location.href = `mailto:${EMAIL}?subject=${betreff}&body=${encodeURIComponent(text)}`
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .chatknopf{position:fixed;right:24px;bottom:24px;z-index:200;height:56px;border-radius:99px;padding:0 22px 0 18px;
          background:${CI.blau};color:#fff;border:none;cursor:pointer;font-size:15px;font-weight:700;display:flex;
          align-items:center;gap:11px;box-shadow:0 14px 34px rgba(27,147,210,.44);transition:all .22s}
        .chatknopf:hover{background:${CI.blauDunkel};transform:translateY(-3px);box-shadow:0 18px 40px rgba(27,147,210,.52)}
        .chatpunkt{width:9px;height:9px;border-radius:50%;background:#22C55E;box-shadow:0 0 0 3px rgba(34,197,94,.3);animation:blinken 2.4s ease-in-out infinite}
        @keyframes blinken{0%,100%{opacity:1}50%{opacity:.4}}
        .chatfenster{position:fixed;right:24px;bottom:92px;z-index:200;width:392px;max-width:calc(100vw - 32px);
          max-height:calc(100vh - 130px);display:flex;flex-direction:column;background:#fff;border-radius:18px;overflow:hidden;
          box-shadow:0 30px 80px rgba(10,24,35,.36);animation:chatauf .26s cubic-bezier(.2,.7,.3,1)}
        @keyframes chatauf{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}
        .chatkopf{position:relative;overflow:hidden;color:#fff;padding:20px 20px 22px;
          background:linear-gradient(118deg,${CI.petrol},#0D2A3D 52%,#123B52);background-size:200% 200%;
          animation:grundlauf 20s ease-in-out infinite}
        .chatkopf:before{content:'';position:absolute;inset:0;background:radial-gradient(320px 160px at 84% 0%,rgba(63,200,245,.3),transparent 62%)}
        .chatkopf>*{position:relative;z-index:1}
        .chatrolle{flex:1;overflow-y:auto;padding:6px 0}
        .chatzeile{display:flex;align-items:flex-start;gap:13px;padding:14px 20px;border-bottom:1px solid ${CI.linie};
          font-size:14.5px;font-weight:600;color:${CI.text};transition:all .16s;width:100%;text-align:left;background:none;border-left:none;border-right:none;border-top:none;cursor:pointer}
        .chatzeile:hover{background:#EAF4FB;padding-left:25px}
        .chatzeile i.vor{width:19px;text-align:center;color:${CI.blau};font-size:15px;margin-top:2px;flex-shrink:0}
        .chatantwort{padding:2px 20px 18px;font-size:14px;line-height:1.72;color:${CI.textMatt};background:#F7FAFC;border-bottom:1px solid ${CI.linie}}
        .chatfeld{width:100%;border:1.5px solid ${CI.linie};border-radius:9px;padding:12px 14px;font-size:14.5px;
          outline:none;resize:none;transition:border-color .18s;color:${CI.text}}
        .chatfeld:focus{border-color:${CI.blau}}
        .chatfuss{padding:16px 20px;border-top:1px solid ${CI.linie};background:#fff}
        .chatschnell{display:flex;gap:9px;padding:14px 20px 4px;flex-wrap:wrap}
        .chatschnell a{font-size:12.5px;font-weight:700;color:${CI.blau};background:#EAF4FB;border:1px solid rgba(27,147,210,.28);
          border-radius:99px;padding:7px 13px;transition:all .18s}
        .chatschnell a:hover{background:${CI.blau};color:#fff}
        @media(max-width:560px){
          .chatfenster{right:10px;left:10px;width:auto;bottom:84px;max-height:calc(100vh - 108px)}
          .chatknopf{right:14px;bottom:14px;padding:0 18px 0 15px;font-size:14px}
        }
      ` }} />

      {offen && (
        <div className="chatfenster" role="dialog" aria-label="Hilfe und Kontakt">
          <div className="chatkopf">
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: CI.blau, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 17 }}>
                <i className="fa-solid fa-headset" aria-hidden="true" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.02em' }}>Wir helfen dir gern</div>
                <div style={{ fontSize: 12.5, color: '#9FB2C0', display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 }}>
                  <span className="chatpunkt" aria-hidden="true" />Mo. – Fr. 9 – 18 Uhr · meist unter 1 Std. Antwort
                </div>
              </div>
              <button onClick={() => setOffen(false)} aria-label="Schließen"
                style={{ background: 'rgba(255,255,255,.12)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 15, width: 32, height: 32, borderRadius: 8 }}>
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>
            <p style={{ fontSize: 13.5, color: '#C7D6E0', marginTop: 14, lineHeight: 1.6 }}>
              Häufige Fragen sofort beantwortet — oder ruf direkt an.
            </p>
          </div>

          <div className="chatschnell">
            <a href={TELEFON_LINK}><i className="fa-solid fa-phone" style={{ marginRight: 7 }} aria-hidden="true" />Anrufen</a>
            <a href={`mailto:${EMAIL}`}><i className="fa-solid fa-envelope" style={{ marginRight: 7 }} aria-hidden="true" />E-Mail</a>
            <a href="/hilfe"><i className="fa-solid fa-circle-question" style={{ marginRight: 7 }} aria-hidden="true" />Alle Fragen</a>
            <a href="/preise"><i className="fa-solid fa-tags" style={{ marginRight: 7 }} aria-hidden="true" />Preise</a>
          </div>

          <div className="chatrolle">
            {THEMEN.map(([ic, frage, antwort], i) => (
              <div key={frage}>
                <button className="chatzeile" onClick={() => setThema(thema === i ? null : i)} aria-expanded={thema === i}>
                  <i className={`fa-solid fa-${ic} vor`} aria-hidden="true" />
                  <span style={{ flex: 1 }}>{frage}</span>
                  <i className={`fa-solid fa-chevron-${thema === i ? 'up' : 'down'}`} style={{ fontSize: 11, color: CI.textZart, marginTop: 4 }} aria-hidden="true" />
                </button>
                {thema === i && <div className="chatantwort">{antwort}</div>}
              </div>
            ))}
          </div>

          <div className="chatfuss">
            <textarea className="chatfeld" rows={3} placeholder="Deine Frage — wir antworten per E-Mail …"
              value={text} onChange={e => setText(e.target.value)} />
            <button className="btnfest" onClick={senden} disabled={text.trim().length < 5}
              style={{ width: '100%', marginTop: 11, opacity: text.trim().length < 5 ? .5 : 1, cursor: text.trim().length < 5 ? 'not-allowed' : 'pointer' }}>
              <i className="fa-solid fa-paper-plane" style={{ marginRight: 9 }} aria-hidden="true" />Frage senden
            </button>
            <p style={{ fontSize: 11.5, color: CI.textZart, marginTop: 10, lineHeight: 1.55 }}>
              Wird über dein E-Mail-Programm gesendet. Es werden keine Daten gespeichert, bevor du absendest.
            </p>
          </div>
        </div>
      )}

      <button className="chatknopf" onClick={() => setOffen(o => !o)} aria-label={offen ? 'Hilfe schließen' : 'Hilfe öffnen'} aria-expanded={offen}>
        <i className={`fa-solid fa-${offen ? 'xmark' : 'comments'}`} style={{ fontSize: 18 }} aria-hidden="true" />
        {!offen && <>Fragen?<span className="chatpunkt" aria-hidden="true" /></>}
      </button>
    </>
  )
}
