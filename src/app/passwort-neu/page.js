'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, supabaseBereit, fehlerText } from '@/lib/supabaseClient'
import { D, BASIS_CSS, EMAIL } from '@/components/Kopf'

export default function PasswortNeu() {
  const router = useRouter()
  const [bereit, setBereit] = useState(false)
  const [passwort, setPasswort] = useState('')
  const [wieder, setWieder] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  const [fertig, setFertig] = useState(false)

  // Supabase legt beim Klick auf den Link eine Sitzung an ("recovery")
  useEffect(() => {
    if (!supabaseBereit) return
    supabase.auth.getSession().then(({ data }) => setBereit(!!data?.session))
    const { data: sub } = supabase.auth.onAuthStateChange((ev, session) => { if (session) setBereit(true) })
    return () => sub?.subscription?.unsubscribe?.()
  }, [])

  async function speichern() {
    setFehler('')
    if (passwort.length < 8) return setFehler('Das Passwort muss mindestens 8 Zeichen haben.')
    if (passwort !== wieder) return setFehler('Die beiden Passwörter stimmen nicht überein.')
    setLaedt(true)
    const { error } = await supabase.auth.updateUser({ password: passwort })
    if (error) setFehler(fehlerText(error))
    else { setFertig(true); setTimeout(() => router.replace('/dashboard'), 2200) }
    setLaedt(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: D.hellgrau, color: D.text, fontFamily: '"Inter Tight",system-ui,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 22 }}>
      <link href="/schrift/schrift.css" rel="stylesheet" />
      <link href="/fa/css/all.min.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + `
        .lfeld{width:100%;padding:14px 16px 14px 44px;font-size:15px;border:2px solid ${D.linie};border-radius:11px;outline:none;background:${D.dunkel2};color:${D.text};transition:border-color .16s}
        .lfeld:focus{border-color:${D.blau}}
        .lwrap{position:relative;margin-bottom:13px}
        .lwrap i{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:${D.grauHell};font-size:14px}
      ` }} />
      <div style={{ width: '100%', maxWidth: 430, background: '#fff', border: `1px solid ${D.linie}`, borderRadius: 18, padding: '38px 36px', boxShadow: '0 14px 44px rgba(10,24,36,.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <a href="/" className="display" style={{ fontSize: 20 }}>websitegenerator<span style={{ color: D.akzent }}>24</span></a>
          <h1 className="display" style={{ fontSize: 23, marginTop: 18 }}>Neues Passwort</h1>
        </div>

        {fertig ? (
          <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', borderRadius: 10, padding: '14px 16px', fontSize: 14, lineHeight: 1.6, textAlign: 'center' }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} aria-hidden="true" />
            Passwort geändert. Du wirst weitergeleitet…
          </div>
        ) : !bereit ? (
          <div style={{ fontSize: 14, color: D.grau, lineHeight: 1.7, textAlign: 'center' }}>
            <p style={{ marginBottom: 14 }}>
              Dieser Link ist ungültig oder abgelaufen. Links zum Zurücksetzen gelten eine Stunde.
            </p>
            <a href="/login" className="btnfest">Neuen Link anfordern</a>
          </div>
        ) : (
          <>
            <div className="lwrap"><i className="fa-solid fa-lock" aria-hidden="true" />
              <input className="lfeld" type="password" placeholder="Neues Passwort" value={passwort} onChange={e => setPasswort(e.target.value)} autoComplete="new-password" />
            </div>
            <div className="lwrap"><i className="fa-solid fa-lock" aria-hidden="true" />
              <input className="lfeld" type="password" placeholder="Passwort wiederholen" value={wieder} onChange={e => setWieder(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && speichern()} autoComplete="new-password" />
            </div>
            {fehler && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, marginBottom: 14 }}>{fehler}</div>}
            <button className="btnfest" onClick={speichern} disabled={laedt} style={{ width: '100%', padding: 15, fontSize: 15.5 }}>
              {laedt ? 'Speichert…' : 'Passwort speichern'}
            </button>
          </>
        )}

        <p style={{ fontSize: 12.5, color: D.grauHell, marginTop: 20, textAlign: 'center', lineHeight: 1.7 }}>
          Probleme? <a className="link-u" href={`mailto:${EMAIL}`} style={{ color: D.akzent }}>{EMAIL}</a>
        </p>
      </div>
    </div>
  )
}
