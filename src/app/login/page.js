'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, supabaseBereit, fehlerText } from '@/lib/supabaseClient'
import { lokalenStandUebernehmen } from '@/lib/projekte'
import { D, CI, BASIS_CSS, TELEFON, TELEFON_LINK, EMAIL } from '@/components/Kopf'

export default function LoginSeite() {
  const router = useRouter()
  const [modus, setModus] = useState('login')
  const [email, setEmail] = useState('')
  const [passwort, setPasswort] = useState('')
  const [firma, setFirma] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  const [hinweis, setHinweis] = useState('')

  const ziel = () => {
    if (typeof window === 'undefined') return '/dashboard'
    const n = new URLSearchParams(window.location.search).get('next')
    return n && n.startsWith('/') ? n : '/dashboard'
  }

  useEffect(() => {
    if (!supabaseBereit) return
    supabase.auth.getSession().then(({ data }) => { if (data?.session) router.replace(ziel()) })
  }, [router])

  async function absenden() {
    setFehler(''); setHinweis('')
    if (!email.trim()) return setFehler('Bitte E-Mail-Adresse eingeben.')
    if (modus !== 'reset' && passwort.length < 8) return setFehler('Das Passwort muss mindestens 8 Zeichen haben.')
    setLaedt(true)
    try {
      if (modus === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: passwort })
        if (error) throw error
        // Vor dem Weiterleiten: lokal gebauten Zwischenstand ans Konto heften
        const uebernommen = await lokalenStandUebernehmen()
        router.replace(uebernommen ? `/editor?projekt=${uebernommen}` : ziel())
      } else if (modus === 'registrieren') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password: passwort,
          options: { data: { firma: firma.trim() }, emailRedirectTo: `${window.location.origin}/dashboard` },
        })
        if (error) throw error
        if (data?.session) router.replace(ziel())
        else setHinweis('Fast fertig. Wir haben dir eine Bestätigungs-Mail geschickt — bitte den Link darin anklicken. Schau auch im Spam-Ordner.')
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/passwort-neu`,
        })
        if (error) throw error
        setHinweis('Wir haben dir eine E-Mail geschickt. Über den Link darin kannst du ein neues Passwort setzen. Der Link ist eine Stunde gültig.')
      }
    } catch (e) { setFehler(fehlerText(e)) }
    setLaedt(false)
  }

  const titel = modus === 'login' ? 'Anmeldung' : modus === 'registrieren' ? 'Konto erstellen' : 'Passwort zurücksetzen'
  const unter = modus === 'login' ? 'zu Ihrem Kundenbereich' : modus === 'registrieren' ? 'kostenlos und in einer Minute' : 'Wir senden Ihnen einen Link'

  return (
    <div style={{ minHeight: '100vh', background: D.hellgrau, color: D.text, fontFamily: '"InterTight",system-ui,sans-serif', display: 'flex', flexDirection: 'column' }}>
      <link href="/schrift/schrift.css" rel="stylesheet" />
      <link href="/fa/css/all.min.css" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + `
        .lfeld{width:100%;padding:14px 16px 14px 44px;font-size:15px;border:2px solid ${D.linie};border-radius:11px;outline:none;transition:border-color .16s,box-shadow .16s;background:#fff;color:${D.text}}
        .lfeld:focus{border-color:${D.blau};box-shadow:0 0 0 4px ${D.blau}18}
        .lwrap{position:relative}
        .lwrap i{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:${D.grauHell};font-size:14px;pointer-events:none;transition:color .16s}
        .lwrap:focus-within i{color:${D.blau}}
        .lknopf{width:100%;background:${CI.blau};color:#fff;border:none;border-radius:9px;padding:15px;font-size:15.5px;font-weight:800;cursor:pointer;transition:background .16s,transform .16s,box-shadow .16s}
        .lknopf:hover{background:${CI.blauDunkel};transform:translateY(-2px);box-shadow:0 10px 26px rgba(29,78,216,.3)}
        .lknopf:disabled{opacity:.6;cursor:wait;transform:none}
        .llink{background:none;border:none;color:${D.blau};font-size:13.5px;font-weight:600;cursor:pointer;padding:3px}
        .llink:hover{text-decoration:underline}
      ` }} />

      {/* Schmale Kopfzeile */}
      <div style={{ background: D.dunkel, color: D.textMattDunkel, fontSize: 12.5 }}>
        <div className="wrap" style={{ height: 40, display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/" style={{ fontWeight: 600 }}><i className="fa-solid fa-arrow-left" style={{ marginRight: 8 }} aria-hidden="true" />Zurück zur Website</a>
          <div style={{ flex: 1 }} />
          <a href={TELEFON_LINK} className="link-u"><i className="fa-solid fa-phone" style={{ marginRight: 7 }} aria-hidden="true" />{TELEFON}</a>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '44px 22px' }}>
        <div style={{ width: '100%', maxWidth: 430 }}>
          <div style={{ background: '#fff', border: `1px solid ${D.linie}`, borderRadius: 18, padding: '38px 36px', boxShadow: '0 16px 46px rgba(16,26,51,.09)' }}>
            {/* Logo */}
            <div style={{ textAlign: 'center', marginBottom: 26 }}>
              <a href="/" style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-.045em' }}>
                websitegenerator<span style={{ color: CI.blau }}>24</span>
              </a>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 20, letterSpacing: '-.035em' }}>{titel}</h1>
              <p style={{ fontSize: 14, color: D.textMatt, marginTop: 5 }}>{unter}</p>
            </div>

            {modus === 'registrieren' && (
              <div className="lwrap" style={{ marginBottom: 13 }}>
                <i className="fa-solid fa-building" aria-hidden="true" />
                <input className="lfeld" placeholder="Firma (optional)" value={firma} onChange={e => setFirma(e.target.value)} />
              </div>
            )}

            <div className="lwrap" style={{ marginBottom: 13 }}>
              <i className="fa-solid fa-envelope" aria-hidden="true" />
              <input className="lfeld" type="email" placeholder="E-Mail-Adresse" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && absenden()} autoComplete="email" />
            </div>

            {modus !== 'reset' && (
              <div className="lwrap" style={{ marginBottom: 13 }}>
                <i className="fa-solid fa-lock" aria-hidden="true" />
                <input className="lfeld" type="password" placeholder="Passwort" value={passwort} onChange={e => setPasswort(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && absenden()} autoComplete={modus === 'login' ? 'current-password' : 'new-password'} />
              </div>
            )}

            {fehler && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, marginBottom: 14, lineHeight: 1.55 }}>
                <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 8 }} aria-hidden="true" />{fehler}
              </div>
            )}
            {hinweis && (
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, marginBottom: 14, lineHeight: 1.55 }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: 8 }} aria-hidden="true" />{hinweis}
              </div>
            )}

            <button className="lknopf" onClick={absenden} disabled={laedt} style={{ marginTop: 6 }}>
              {laedt ? 'Bitte warten…' : modus === 'login' ? 'Jetzt anmelden' : modus === 'registrieren' ? 'Konto erstellen' : 'Link senden'}
            </button>

            {modus === 'login' && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button className="llink" onClick={() => { setModus('reset'); setFehler(''); setHinweis('') }}>Passwort vergessen?</button>
                <p style={{ fontSize: 12.5, color: D.grauHell, marginTop: 3 }}>Wir senden Ihnen einen Link zum Zurücksetzen.</p>
              </div>
            )}

            <div style={{ borderTop: `1px solid ${D.linie}`, marginTop: 22, paddingTop: 20, textAlign: 'center' }}>
              {modus === 'login' ? (
                <>
                  <p style={{ fontSize: 13.5, color: D.textMatt, marginBottom: 8 }}>Neu hier?</p>
                  <button className="llink" style={{ fontSize: 14.5, fontWeight: 700 }} onClick={() => { setModus('registrieren'); setFehler(''); setHinweis('') }}>
                    Kostenlos Konto erstellen
                  </button>
                </>
              ) : (
                <button className="llink" onClick={() => { setModus('login'); setFehler(''); setHinweis('') }}>
                  <i className="fa-solid fa-arrow-left" style={{ marginRight: 7 }} aria-hidden="true" />Zurück zur Anmeldung
                </button>
              )}
            </div>
          </div>

          {/* Hilfe darunter */}
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: D.textMatt, lineHeight: 1.8 }}>
            Probleme beim Anmelden?{' '}
            <a className="link-u" href={`mailto:${EMAIL}`} style={{ color: CI.blau, fontWeight: 600 }}>{EMAIL}</a>
            <br />
            <a className="link-u" href="/hilfe">Hilfe &amp; FAQ</a> · <a className="link-u" href="/datenschutz">Datenschutz</a> · <a className="link-u" href="/impressum">Impressum</a>
          </div>
        </div>
      </div>
    </div>
  )
}
