'use client'
import { useRef, useEffect, useState } from 'react'

// Schlanker WYSIWYG-Editor ohne externe Bibliothek — Fett/Kursiv/Unterstrichen,
// Listen, Links, plus HTML einfügen und HTML kopieren für alle, die lieber
// fertigen Code aus einem anderen Programm übernehmen.
export function WysiwygEditor({ value, onChange, platzhalter = 'Text eingeben …' }) {
  const ref = useRef(null)
  const [htmlOffen, setHtmlOffen] = useState(false)
  const [htmlEntwurf, setHtmlEntwurf] = useState('')
  const [kopiert, setKopiert] = useState(false)
  const letzterWert = useRef(value)

  // Von außen gesetzten Wert übernehmen (z. B. „Aus meinen Daten erzeugen"),
  // ohne den Cursor beim normalen Tippen zu stören
  useEffect(() => {
    if (value !== letzterWert.current && ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || ''
      letzterWert.current = value
    }
  }, [value])

  function melden() {
    const html = ref.current?.innerHTML || ''
    letzterWert.current = html
    onChange(html)
  }

  function befehl(name, arg) {
    ref.current?.focus()
    document.execCommand(name, false, arg)
    melden()
  }

  function linkSetzen() {
    const url = prompt('Link-Adresse (https://…)')
    if (url) befehl('createLink', url)
  }

  async function htmlKopieren() {
    try {
      await navigator.clipboard.writeText(ref.current?.innerHTML || '')
      setKopiert(true)
      setTimeout(() => setKopiert(false), 1800)
    } catch {}
  }

  function htmlEinfuegen() {
    if (ref.current) {
      ref.current.innerHTML = htmlEntwurf
      melden()
    }
    setHtmlOffen(false)
    setHtmlEntwurf('')
  }

  const knoepfe = [
    ['bold', 'bold', 'Fett'], ['italic', 'italic', 'Kursiv'], ['underline', 'underline', 'Unterstrichen'],
    ['insertUnorderedList', 'list-ul', 'Aufzählung'], ['insertOrderedList', 'list-ol', 'Nummerierte Liste'],
  ]

  return (
    <div className="wysiwyg">
      <div className="wysiwyg-leiste">
        {knoepfe.map(([cmd, icon, titel]) => (
          <button key={cmd} type="button" title={titel} onClick={() => befehl(cmd)}>
            <i className={`fa-solid fa-${icon}`} aria-hidden="true" />
          </button>
        ))}
        <button type="button" title="Link einfügen" onClick={linkSetzen}><i className="fa-solid fa-link" aria-hidden="true" /></button>
        <span className="wysiwyg-trenner" />
        <button type="button" className="wysiwyg-textknopf" onClick={() => { setHtmlEntwurf(ref.current?.innerHTML || ''); setHtmlOffen(true) }}>
          <i className="fa-solid fa-code" aria-hidden="true" />HTML einfügen
        </button>
        <button type="button" className="wysiwyg-textknopf" onClick={htmlKopieren}>
          <i className={`fa-solid ${kopiert ? 'fa-check' : 'fa-copy'}`} aria-hidden="true" />{kopiert ? 'Kopiert' : 'HTML kopieren'}
        </button>
      </div>

      {htmlOffen ? (
        <div className="wysiwyg-html">
          <textarea value={htmlEntwurf} onChange={e => setHtmlEntwurf(e.target.value)} placeholder="<p>Eigenes HTML einfügen …</p>" autoFocus />
          <div className="wysiwyg-html-knoepfe">
            <button type="button" className="btnfest" onClick={htmlEinfuegen}>Übernehmen</button>
            <button type="button" className="btnleer" onClick={() => setHtmlOffen(false)}>Abbrechen</button>
          </div>
        </div>
      ) : (
        <div ref={ref} className="wysiwyg-flaeche" contentEditable suppressContentEditableWarning
          onInput={melden} onBlur={melden} data-platzhalter={platzhalter} />
      )}
    </div>
  )
}

export const WYSIWYG_CSS = `
.wysiwyg{border:2px solid #E1E7EB;border-radius:12px;overflow:hidden}
.wysiwyg-leiste{display:flex;align-items:center;gap:2px;flex-wrap:wrap;padding:8px;background:#F1F4F6;border-bottom:1px solid #E1E7EB}
.wysiwyg-leiste button{width:32px;height:32px;border-radius:7px;border:none;background:transparent;color:#0A1824;
  cursor:pointer;font-size:13px;transition:background .15s}
.wysiwyg-leiste button:hover{background:#E1E7EB}
.wysiwyg-trenner{width:1px;height:20px;background:#E1E7EB;margin:0 4px}
.wysiwyg-textknopf{width:auto !important;padding:0 10px;display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600}
.wysiwyg-flaeche{min-height:240px;max-height:480px;overflow-y:auto;padding:16px 18px;font-size:14.5px;line-height:1.7;color:#0A1824;outline:none}
.wysiwyg-flaeche:empty:before{content:attr(data-platzhalter);color:#8A99A6}
.wysiwyg-flaeche p{margin:0 0 10px}
.wysiwyg-flaeche ul,.wysiwyg-flaeche ol{margin:0 0 10px;padding-left:22px}
.wysiwyg-flaeche a{color:#1B93D2;text-decoration:underline}
.wysiwyg-html{padding:14px}
.wysiwyg-html textarea{width:100%;min-height:220px;padding:14px;font-family:ui-monospace,monospace;font-size:13px;
  border:1.5px solid #E1E7EB;border-radius:10px;outline:none;resize:vertical}
.wysiwyg-html-knoepfe{display:flex;gap:10px;margin-top:12px}
`
