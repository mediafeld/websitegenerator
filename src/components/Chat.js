'use client'
import { useState } from 'react'
import { D, TELEFON, TELEFON_LINK, EMAIL } from '@/components/Kopf'

// Chatfenster unten rechts. Noch ohne Inhalte – verweist auf Telefon, E-Mail und Hilfe.
export function Chat() {
  const [offen, setOffen] = useState(false)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .chatknopf{position:fixed;right:22px;bottom:22px;z-index:200;width:58px;height:58px;border-radius:50%;
          background:linear-gradient(96deg,${D.magenta},${D.lila});color:#fff;border:none;cursor:pointer;font-size:21px;
          box-shadow:0 10px 30px rgba(29,78,216,.42);transition:transform .2s cubic-bezier(.2,.7,.3,1),background .18s}
        .chatknopf:hover{transform:translateY(-3px) scale(1.05);background:${D.blauHell}}
        .chatpunkt{position:absolute;top:-2px;right:-2px;width:15px;height:15px;border-radius:50%;
          background:#22C55E;border:2.5px solid #fff}
        .chatfenster{position:fixed;right:22px;bottom:92px;z-index:200;width:340px;max-width:calc(100vw - 44px);
          background:${D.dunkel2};border:1px solid ${D.linie};border-radius:18px;overflow:hidden;
          box-shadow:0 22px 60px rgba(10,24,36,.24);animation:chatauf .22s cubic-bezier(.2,.7,.3,1)}
        @keyframes chatauf{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
        .chatkopf{background:linear-gradient(96deg,#2A0C55,#0E2A3C);color:#fff;padding:17px 18px;display:flex;align-items:center;gap:12px}
        .chatzeile{display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid ${D.linie};
          font-size:14px;font-weight:600;color:${D.text};transition:background .14s,padding-left .14s}
        .chatzeile:hover{background:${D.blauZart};color:${D.magenta};padding-left:20px}
        .chatzeile i{width:17px;text-align:center;color:${D.blau};font-size:14px}
        .chatfeld{width:100%;border:2px solid ${D.linie};border-radius:10px;padding:11px 13px;font-size:14px;
          outline:none;resize:none;transition:border-color .16s;background:${D.karte};color:${D.text}}
        .chatfeld:focus{border-color:${D.blau}}
        @media(max-width:520px){.chatfenster{right:12px;left:12px;width:auto;bottom:86px}.chatknopf{right:14px;bottom:14px}}
      ` }} />

      {offen && (
        <div className="chatfenster" role="dialog" aria-label="Hilfe und Kontakt">
          <div className="chatkopf">
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(96deg,'+D.magenta+','+D.lila+')', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fa-solid fa-headset" aria-hidden="true" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800 }}>Wir helfen gern</div>
              <div style={{ fontSize: 12, color: D.textMatt }}>Mo. – Fr., 9 – 18 Uhr</div>
            </div>
            <button onClick={() => setOffen(false)} aria-label="Schließen"
              style={{ background: 'none', border: 'none', color: D.textMatt, cursor: 'pointer', fontSize: 17, padding: 4 }}>
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>

          <a className="chatzeile" href={TELEFON_LINK}>
            <i className="fa-solid fa-phone" aria-hidden="true" />
            <span style={{ flex: 1 }}>Anrufen<span style={{ display: 'block', fontSize: 12, fontWeight: 400, color: D.grauHell }}>{TELEFON}</span></span>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: 11, color: D.grauHell }} aria-hidden="true" />
          </a>
          <a className="chatzeile" href={`mailto:${EMAIL}`}>
            <i className="fa-solid fa-envelope" aria-hidden="true" />
            <span style={{ flex: 1 }}>E-Mail schreiben<span style={{ display: 'block', fontSize: 12, fontWeight: 400, color: D.grauHell }}>Antwort meist am nächsten Werktag</span></span>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: 11, color: D.grauHell }} aria-hidden="true" />
          </a>
          <a className="chatzeile" href="/hilfe">
            <i className="fa-solid fa-circle-question" aria-hidden="true" />
            <span style={{ flex: 1 }}>Hilfe &amp; FAQ<span style={{ display: 'block', fontSize: 12, fontWeight: 400, color: D.grauHell }}>Kosten, Ablauf, Domain, Technik</span></span>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: 11, color: D.grauHell }} aria-hidden="true" />
          </a>

          <div style={{ padding: 16 }}>
            <textarea className="chatfeld" rows={3} placeholder="Frage hier eintippen …" disabled />
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 10 }}>
              <button className="btnfest" disabled style={{ opacity: .5, cursor: 'not-allowed', flex: 1 }}>
                <i className="fa-solid fa-paper-plane" style={{ marginRight: 7 }} aria-hidden="true" />Senden
              </button>
            </div>
            <p style={{ fontSize: 11.5, color: D.grauHell, marginTop: 10, lineHeight: 1.55 }}>
              Der Chat wird gerade eingerichtet. Bis dahin erreichst du uns telefonisch oder per E-Mail.
            </p>
          </div>
        </div>
      )}

      <button className="chatknopf" onClick={() => setOffen(o => !o)} aria-label={offen ? 'Hilfe schließen' : 'Hilfe öffnen'} aria-expanded={offen}>
        <i className={`fa-solid fa-${offen ? 'xmark' : 'comment-dots'}`} aria-hidden="true" />
        {!offen && <span className="chatpunkt" aria-hidden="true" />}
      </button>
    </>
  )
}
