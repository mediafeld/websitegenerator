'use client'
import { useState, useEffect, useCallback } from 'react'
import { KontoLayout } from '@/components/KontoLayout'
import { D } from '@/components/Kopf'
import { supabase, supabaseBereit, fehlerText } from '@/lib/supabaseClient'

export default function Domains() {
  const [projekte, setProjekte] = useState([])
  const [fehler, setFehler] = useState('')

  const laden = useCallback(async () => {
    if (!supabaseBereit) return
    const { data, error } = await supabase.from('projekte')
      .select('id,name,firma,domain,zahlungsart,status')
      .order('geaendert_am', { ascending: false })
    if (error) setFehler(fehlerText(error))
    else setProjekte(data || [])
  }, [])
  useEffect(() => { laden() }, [laden])

  const mitDomain = projekte.filter(p => p.domain)
  const ohneDomain = projekte.filter(p => !p.domain && p.zahlungsart === 'mieten')

  return (
    <KontoLayout aktiv="domains" titel="Registrierte Domains"
      unter="Alle Domains, die über uns registriert sind. Du bist Inhaber — wir übernehmen die technische Verwaltung."
      kinder={
        <>
          {fehler && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '15px 18px', marginBottom: 18, fontSize: 14, color: '#B91C1C' }}>{fehler}</div>}

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2>Deine Domains</h2>
            {mitDomain.length === 0 ? (
              <>
                <p className="unter">Noch keine Domain registriert.</p>
                <div style={{ background: D.hellGrund, borderRadius: 12, padding: '28px 24px', textAlign: 'center' }}>
                  <i className="fa-solid fa-globe" style={{ fontSize: 26, color: D.hellGrau, marginBottom: 12, display: 'block' }} aria-hidden="true" />
                  <p style={{ fontSize: 14.5, color: D.hellGrau, marginBottom: 0, lineHeight: 1.65, maxWidth: 460, margin: '0 auto' }}>
                    {ohneDomain.length
                      ? 'Unten kannst du für deine gemietete Website direkt eine Domain dazubuchen.'
                      : 'Domains gibt es zu jedem Mietpaket dazu — beim Website-Kauf nutzt du deine eigene Domain.'}
                  </p>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                {mitDomain.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: D.hellKarte, border: `1px solid ${D.hellLinie}`, borderRadius: 12, padding: '14px 16px', flexWrap: 'wrap' }}>
                    <i className="fa-solid fa-globe" style={{ color: D.magenta, fontSize: 16 }} aria-hidden="true" />
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{p.domain}</div>
                      <div style={{ fontSize: 12, color: D.hellGrau }}>gehört zu „{p.name || p.firma || 'Website'}"</div>
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, borderRadius: 99, padding: '4px 12px', color: p.status === 'online' ? '#15803D' : '#92400E', background: p.status === 'online' ? '#F0FDF4' : '#FFFBEB', border: `1px solid ${p.status === 'online' ? '#BBF7D0' : '#FDE68A'}` }}>
                      {p.status === 'online' ? 'Aktiv' : 'Wird eingerichtet'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {ohneDomain.length > 0 && <DomainDazubuchen projekte={ohneDomain} onFertig={laden} />}

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2>Wie die Registrierung abläuft</h2>
            <p className="unter">Damit du weißt, was nach der Bestellung passiert — und wie lange es dauert.</p>
            <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16, counterReset: 'schritt' }}>
              {[
                ['Bestellung', 'Du wählst dein Paket und die Domain. Erst danach wird registriert.', 'sofort'],
                ['Antrag bei der Registrierungsstelle', 'Bei .de-Domains geht der Antrag an die DENIC, bei .com und anderen an die jeweilige Stelle.', 'wenige Minuten'],
                ['Bestätigung', 'In der Regel ist die Domain innerhalb von Minuten aktiv. In Einzelfällen — etwa bei Rückfragen der Registrierungsstelle oder bei Namen mit Sonderzeichen — kann es bis zu 24 Stunden dauern.', 'meist Minuten, selten bis 24 Std.'],
                ['E-Mail-Bestätigung nötig?', 'Bei .com, .net, .org und anderen ICANN-Endungen musst du deine E-Mail-Adresse einmal per Klick bestätigen. Ohne diese Bestätigung wird die Domain nach einigen Tagen stillgelegt. Bei .de ist das nicht nötig.', 'einmaliger Klick'],
                ['Website geht online', 'Sobald die Domain aktiv ist, verbinden wir sie mit deiner Website und richten das SSL-Zertifikat ein.', 'automatisch'],
              ].map(([t, u, z], i) => (
                <li key={t} style={{ display: 'flex', gap: 14 }}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, background: D.blau, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13.5, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ flex: 1 }}>
                    <strong style={{ fontSize: 15, display: 'block', marginBottom: 3 }}>{t}</strong>
                    <span style={{ fontSize: 14, color: D.hellGrau, lineHeight: 1.7 }}>{u}</span>
                    <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11.5, fontWeight: 700, color: D.magenta, background: D.blauZart, borderRadius: 99, padding: '3px 10px' }}>{z}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="kkarte">
            <h2>Wichtig zu wissen</h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {[
                ['user-check', 'Du bist Domaininhaber', 'Die Domain läuft auf deinen Namen, nicht auf unseren. Du kannst sie jederzeit zu einem anderen Anbieter mitnehmen.'],
                ['triangle-exclamation', 'Namensrechte prüfen', 'Achte darauf, dass der Domainname keine fremden Marken- oder Namensrechte verletzt. Als Inhaber haftest du dafür.'],
                ['rotate', 'Automatische Verlängerung', 'Domains verlängern sich jährlich automatisch, solange dein Vertrag läuft. Bei Kündigung kannst du sie übertragen oder freigeben lassen.'],
                ['ban', 'Kein Widerrufsrecht', 'Domains werden individuell für dich registriert und können nicht zurückgegeben werden.'],
              ].map(([ic, t, u]) => (
                <li key={t} style={{ display: 'flex', gap: 13 }}>
                  <i className={`fa-solid fa-${ic}`} style={{ color: D.magenta, fontSize: 15, marginTop: 3, width: 18, textAlign: 'center' }} aria-hidden="true" />
                  <span><strong style={{ fontSize: 14.5, display: 'block', marginBottom: 2 }}>{t}</strong>
                    <span style={{ fontSize: 14, color: D.hellGrau, lineHeight: 1.7 }}>{u}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </>
      } />
  )
}

// ── Domain nachträglich zu einer gemieteten Website dazubuchen ─────────────
function DomainDazubuchen({ projekte, onFertig }) {
  const [projektId, setProjektId] = useState(projekte[0]?.id || '')
  const [name, setName] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [ergebnisse, setErgebnisse] = useState(null)
  const [meldung, setMeldung] = useState(null) // {art:'ok'|'fehler', text}
  const [bucht, setBucht] = useState('')

  useEffect(() => { setProjektId(p => projekte.some(x => x.id === p) ? p : (projekte[0]?.id || '')) }, [projekte])

  async function pruefen() {
    const n = name.trim()
    if (!n) return
    setLaedt(true); setErgebnisse(null); setMeldung(null)
    try {
      // Eingabe „meine-firma.de" → Name + gezielte Endung; sonst Standard-Endungen
      const teile = n.replace(/^https?:\/\//, '').split('.')
      const label = teile[0]
      const tld = teile.length > 1 ? [teile.slice(1).join('.')] : ['de', 'com', 'net', 'org']
      const res = await fetch('/api/domain', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: label, tlds: tld }) })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      setErgebnisse(d.ergebnisse || [])
    } catch (e) { setMeldung({ art: 'fehler', text: e.message }) }
    setLaedt(false)
  }

  async function buchen(domain) {
    setBucht(domain); setMeldung(null)
    try {
      const tk = (await supabase.auth.getSession())?.data?.session?.access_token
      const res = await fetch('/api/domain-wunsch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessToken: tk, projektId, domain }) })
      const d = await res.json()
      if (d.error) throw new Error(d.error)
      setMeldung({ art: 'ok', text: `${d.domain} ist vorgemerkt! Wir registrieren die Domain und verbinden sie mit deiner Website — du bekommst eine Nachricht, sobald alles läuft.` })
      setErgebnisse(null); setName('')
      onFertig?.()
    } catch (e) { setMeldung({ art: 'fehler', text: e.message }) }
    setBucht('')
  }

  return (
    <div className="kkarte" style={{ marginBottom: 16 }}>
      <h2><i className="fa-solid fa-plus" style={{ color: D.magenta, marginRight: 9, fontSize: 15 }} aria-hidden="true" />Domain dazubuchen</h2>
      <p className="unter">Für deine gemietete Website ohne eigene Domain. Die Registrierung übernehmen wir — im Mietpaket enthalten.</p>
      {projekte.length > 1 && (
        <select value={projektId} onChange={e => setProjektId(e.target.value)}
          style={{ width: '100%', border: `1.5px solid ${D.linie}`, borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 10, background: '#fff' }}>
          {projekte.map(p => <option key={p.id} value={p.id}>{p.name || p.firma || 'Website'}</option>)}
        </select>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') pruefen() }}
          placeholder="meine-firma.de oder nur meine-firma"
          style={{ flex: 1, minWidth: 220, border: `1.5px solid ${D.linie}`, borderRadius: 10, padding: '11px 13px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
        <button className="btnfest" onClick={pruefen} disabled={laedt} style={{ padding: '11px 20px' }}>
          {laedt ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 7 }} aria-hidden="true" />Prüfe …</> : <><i className="fa-solid fa-magnifying-glass" style={{ marginRight: 7 }} aria-hidden="true" />Prüfen</>}
        </button>
      </div>
      {meldung && (
        <div style={{ marginTop: 12, borderRadius: 10, padding: '12px 15px', fontSize: 13.5, lineHeight: 1.6, background: meldung.art === 'ok' ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${meldung.art === 'ok' ? '#BBF7D0' : '#FECACA'}`, color: meldung.art === 'ok' ? '#15803D' : '#B91C1C' }}>
          {meldung.text}
        </div>
      )}
      {ergebnisse && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 12 }}>
          {ergebnisse.map(e => (
            <div key={e.domain} style={{ display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${D.hellLinie}`, borderRadius: 10, padding: '10px 14px', flexWrap: 'wrap' }}>
              <span style={{ flex: 1, minWidth: 160, fontSize: 14.5, fontWeight: 700 }}>{e.domain}</span>
              {e.frei ? (
                <>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#15803D' }}><i className="fa-solid fa-circle-check" style={{ marginRight: 5 }} aria-hidden="true" />frei</span>
                  <button className="btnblau" disabled={!!bucht} onClick={() => buchen(e.domain)} style={{ padding: '8px 15px', fontSize: 13 }}>
                    {bucht === e.domain ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }} aria-hidden="true" />Bucht …</> : 'Diese Domain nehmen'}
                  </button>
                </>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 700, color: '#B91C1C' }}><i className="fa-solid fa-circle-xmark" style={{ marginRight: 5 }} aria-hidden="true" />vergeben</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
