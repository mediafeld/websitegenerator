'use client'
import { useWarenkorb } from '@/lib/warenkorb'
import { starteCheckout } from '@/lib/checkout'
import { MIETE } from '@/lib/preise'

const MIETE_IDS = new Set(MIETE.map(m => m.id))

// Feste Farbwerte statt Import aus Kopf.js (vermeidet einen Ringimport,
// da Kopf.js selbst das Warenkorb-CSS mit einbindet).
const CI = { linie: '#E1E7EB', text: '#0A1824', textMatt: '#5A6B7A', textZart: '#8A99A6', blau: '#1B93D2', grau: '#F1F4F6' }

const eur = (n) => Number(n).toFixed(2).replace('.', ',')

// Knopf für die Kopfzeile — überall auf der Seite sichtbar
export function WarenkorbKnopf() {
  const { anzahl, setOffen } = useWarenkorb()
  return (
    <button className="wk-knopf" onClick={() => setOffen(true)} aria-label="Warenkorb öffnen">
      <i className="fa-solid fa-cart-shopping" aria-hidden="true" />
      {anzahl > 0 && <span className="wk-zahl">{anzahl}</span>}
    </button>
  )
}

// Ausklapp-Panel von rechts — auf jeder Seite verfügbar, merkt sich den Inhalt
export function WarenkorbPanel() {
  const { artikel, offen, setOffen, entfernen, mengeAendern, zwischensumme, mwst, gesamt, anzahl } = useWarenkorb()
  if (!offen) return null

  const anfrageLink = () => {
    const zeilen = artikel.map(a => `- ${a.menge}× ${a.titel} (${eur(a.preis)} € ${a.art === 'monatlich' ? '/Monat' : 'einmalig'})`).join('%0A')
    const text = encodeURIComponent(`Ich möchte folgende Leistungen bestellen:\n\n${artikel.map(a => `- ${a.menge}× ${a.titel} (${eur(a.preis)} € ${a.art === 'monatlich' ? '/Monat' : 'einmalig'})`).join('\n')}\n\nGesamt: ${eur(gesamt)} € inkl. MwSt.`)
    return `mailto:info@websitegenerator24.de?subject=${encodeURIComponent('Bestellung aus dem Warenkorb')}&body=${text}`
  }

  // Echte Stripe-Kasse: Hauptpaket wird bezahlt (Miete = Abo, Kauf = einmalig).
  // Stripe kann Abo + Einmalzahlung nicht mischen → Zusatzposten laufen separat.
  const zurKasse = async () => {
    const paket = artikel.find(a => String(a.id).startsWith('paket-'))
    if (!paket) { window.location.href = anfrageLink(); return }
    const pid = String(paket.id).replace('paket-', '')
    const modus = MIETE_IDS.has(pid) ? 'mieten' : 'kaufen'
    const { error } = await starteCheckout({ paketId: pid, modus })
    if (error) alert(error)
  }
  const hatPaket = artikel.some(a => String(a.id).startsWith('paket-'))

  return (
    <>
      <div className="wk-overlay" onClick={() => setOffen(false)} />
      <aside className="wk-panel" role="dialog" aria-label="Warenkorb">
        <div className="wk-kopf">
          <span><i className="fa-solid fa-cart-shopping" aria-hidden="true" /> Warenkorb {anzahl > 0 && `(${anzahl})`}</span>
          <button onClick={() => setOffen(false)} aria-label="Schließen"><i className="fa-solid fa-xmark" aria-hidden="true" /></button>
        </div>

        {artikel.length === 0 ? (
          <div className="wk-leer">
            <i className="fa-solid fa-cart-shopping" aria-hidden="true" />
            <p>Noch nichts im Warenkorb.</p>
            <span>Zusatzleistungen wie Postfächer, Domains oder Pakete kannst du dir hier sammeln.</span>
          </div>
        ) : (
          <>
            <div className="wk-liste">
              {artikel.map(a => (
                <div key={a.id} className="wk-artikel">
                  <div className="wk-artikel-info">
                    <b>{a.titel}</b>
                    {a.unter && <span>{a.unter}</span>}
                    <em>{a.art === 'monatlich' ? 'monatlich' : 'einmalig'}</em>
                  </div>
                  <div className="wk-artikel-steuer">
                    <div className="wk-menge">
                      <button onClick={() => mengeAendern(a.id, -1)} aria-label="Weniger">–</button>
                      <span>{a.menge}</span>
                      <button onClick={() => mengeAendern(a.id, 1)} aria-label="Mehr">+</button>
                    </div>
                    <b>{eur(a.preis * a.menge)} €</b>
                    <button className="wk-entfernen" onClick={() => entfernen(a.id)} aria-label="Entfernen"><i className="fa-solid fa-trash" aria-hidden="true" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="wk-summe">
              <div><span>Summe</span><span>{eur(zwischensumme)} €</span></div>
              <div><span>davon 19 % MwSt.</span><span>{eur(mwst)} €</span></div>
              <div className="wk-brutto"><span>Gesamt (inkl. MwSt.)</span><span>{eur(gesamt)} €</span></div>
            </div>

            {hatPaket ? (
              <button onClick={zurKasse} className="btnfest" style={{ width: '100%', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                <i className="fa-solid fa-lock" aria-hidden="true" />Sicher bezahlen
              </button>
            ) : (
              <a href={anfrageLink()} className="btnfest" style={{ width: '100%', justifyContent: 'center' }}>
                <i className="fa-solid fa-paper-plane" aria-hidden="true" />Anfrage mit diesen Positionen senden
              </a>
            )}
            <p className="wk-hinweis">Bezahlung sicher über Stripe. Miete (monatlich) und Kauf (einmalig) werden getrennt abgerechnet.</p>
          </>
        )}
      </aside>
    </>
  )
}

export const WARENKORB_CSS = `
.wk-knopf{position:relative;background:none;border:none;cursor:pointer;color:#fff;font-size:16px;padding:8px;display:flex;align-items:center}
.wk-zahl{position:absolute;top:0;right:0;background:#FF5722;color:#fff;font-size:10px;font-weight:800;min-width:16px;height:16px;
  border-radius:99px;display:flex;align-items:center;justify-content:center;padding:0 3px}
.wk-overlay{position:fixed;inset:0;background:rgba(10,24,36,.5);z-index:200;animation:wkoverlayein .2s ease}
@keyframes wkoverlayein{from{opacity:0}to{opacity:1}}
.wk-panel{position:fixed;top:0;right:0;bottom:0;width:400px;max-width:92vw;background:#fff;z-index:201;
  display:flex;flex-direction:column;box-shadow:-20px 0 60px rgba(0,0,0,.25);animation:wkpanelein .25s cubic-bezier(.2,.7,.3,1)}
@keyframes wkpanelein{from{transform:translateX(100%)}to{transform:translateX(0)}}
.wk-kopf{display:flex;align-items:center;justify-content:space-between;padding:20px 22px;border-bottom:1px solid ${CI.linie};
  font-size:16px;font-weight:700;color:${CI.text}}
.wk-kopf button{background:${CI.grau};border:none;width:32px;height:32px;border-radius:99px;cursor:pointer;color:${CI.textMatt}}
.wk-leer{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 30px;color:${CI.textZart}}
.wk-leer i{font-size:32px;margin-bottom:14px;opacity:.5}
.wk-leer p{font-size:15px;font-weight:700;color:${CI.textMatt};margin-bottom:6px}
.wk-leer span{font-size:13px;line-height:1.6}
.wk-liste{flex:1;overflow-y:auto;padding:10px 22px}
.wk-artikel{padding:16px 0;border-bottom:1px solid ${CI.linie}}
.wk-artikel-info{display:flex;flex-direction:column;gap:2px;margin-bottom:10px}
.wk-artikel-info b{font-size:14.5px;color:${CI.text}}
.wk-artikel-info span{font-size:12.5px;color:${CI.textMatt}}
.wk-artikel-info em{font-style:normal;font-size:11px;color:${CI.blau};font-weight:700;text-transform:uppercase;letter-spacing:.04em}
.wk-artikel-steuer{display:flex;align-items:center;gap:12px}
.wk-menge{display:flex;align-items:center;gap:0;border:1px solid ${CI.linie};border-radius:99px;overflow:hidden}
.wk-menge button{width:26px;height:26px;border:none;background:${CI.grau};cursor:pointer;font-size:14px;color:${CI.text}}
.wk-menge span{width:26px;text-align:center;font-size:13px;font-weight:700}
.wk-artikel-steuer b{margin-left:auto;font-size:14px;color:${CI.text}}
.wk-entfernen{background:none;border:none;color:#E23B3B;cursor:pointer;font-size:13px;padding:4px}
.wk-summe{padding:16px 22px;border-top:1px solid ${CI.linie};display:flex;flex-direction:column;gap:7px}
.wk-summe div{display:flex;justify-content:space-between;font-size:13.5px;color:${CI.textMatt}}
.wk-brutto{font-size:16px !important;font-weight:800;color:${CI.text} !important;padding-top:6px;border-top:1px solid ${CI.linie}}
.wk-panel .btnfest{margin:0 22px}
.wk-hinweis{font-size:11.5px;color:${CI.textZart};text-align:center;line-height:1.6;padding:12px 22px 22px}
@media(max-width:480px){.wk-panel{width:100vw;max-width:100vw}}
`
