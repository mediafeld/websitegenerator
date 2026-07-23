'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, supabaseBereit, fehlerText } from '@/lib/supabaseClient'
import { Kopf, D, BASIS_CSS } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'

export default function LoginSeite() {
  const router = useRouter()
  const [modus, setModus] = useState('login')   // login | registrieren | reset
  const [email, setEmail] = useState('')
  const [passwort, setPasswort] = useState('')
  const [firma, setFirma] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState('')
  const [hinweis, setHinweis] = useState('')

  // Wohin nach dem Anmelden? (?next=/design-auswahl)
  const ziel = () => {
    if (typeof window === 'undefined') return '/dashboard'
    const n = new URLSearchParams(window.location.search).get('next')
    return n && n.startsWith('/') ? n : '/dashboard'
  }

  // Schon eingeloggt? Dann direkt ins Dashboard.
  useEffect(() => {
    if (!supabaseBereit) return
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) router.replace(ziel())
    })
  }, [router])

  async function absenden() {
    setFehler(''); setHinweis('')
    if (!email.trim()) return setFehler('Bitte E-Mail eingeben.')
    if (modus !== 'reset' && passwort.length < 6) return setFehler('Das Passwort muss mindestens 6 Zeichen haben.')

    setLaedt(true)
    try {
      if (modus === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: passwort })
        if (error) throw error
        router.replace(ziel())

      } else if (modus === 'registrieren') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: passwort,
          options: { data: { firma: firma.trim() } },
        })
        if (error) throw error
        if (data?.session) router.replace(ziel())
        else setHinweis('Fast fertig! Wir haben dir eine Bestätigungs-Mail geschickt. Bitte den Link darin anklicken.')

      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/login`,
        })
        if (error) throw error
        setHinweis('Wir haben dir eine E-Mail zum Zurücksetzen des Passworts geschickt.')
      }
    } catch (e) {
      setFehler(fehlerText(e))
    }
    setLaedt(false)
  }

  if (!supabaseBereit) {
    return (
      <Rahmen>
        <h1 style={S.h1}>Login noch nicht eingerichtet</h1>
        <p style={S.p}>
          Die Verbindung zur Datenbank fehlt. Bitte bei Vercel die Variablen{' '}
          <code>NEXT_PUBLIC_SUPABASE_URL</code> und <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> eintragen
          und neu bereitstellen.
        </p>
      </Rahmen>
    )
  }

  const titel = modus === 'login' ? 'Anmelden' : modus === 'registrieren' ? 'Konto erstellen' : 'Passwort zurücksetzen'

  return (
    <Rahmen>
      <h1 style={S.h1}>{titel}</h1>
      <p style={S.p}>
        {modus === 'login' && 'Melde dich an, um deine Websites zu verwalten.'}
        {modus === 'registrieren' && 'Erstelle ein Konto – danach findest du alle deine Websites wieder.'}
        {modus === 'reset' && 'Wir schicken dir einen Link per E-Mail.'}
      </p>

      {modus === 'registrieren' && (
        <Feld label="Firma (optional)" value={firma} onChange={setFirma} placeholder="z. B. Müller Sanitär" />
      )}

      <Feld label="E-Mail" type="email" value={email} onChange={setEmail} placeholder="name@firma.de" />

      {modus !== 'reset' && (
        <Feld label="Passwort" type="password" value={passwort} onChange={setPasswort}
              placeholder="mindestens 6 Zeichen" onEnter={absenden} />
      )}

      {fehler && <div style={S.fehler}>{fehler}</div>}
      {hinweis && <div style={S.hinweis}>{hinweis}</div>}

      <button onClick={absenden} disabled={laedt} style={{ ...S.btn, opacity: laedt ? 0.6 : 1 }}>
        {laedt ? 'Bitte warten…' : titel}
      </button>

      <div style={S.links}>
        {modus === 'login' && (
          <>
            <button style={S.link} onClick={() => { setModus('registrieren'); setFehler(''); setHinweis('') }}>Noch kein Konto? Registrieren</button>
            <button style={S.link} onClick={() => { setModus('reset'); setFehler(''); setHinweis('') }}>Passwort vergessen?</button>
          </>
        )}
        {modus !== 'login' && (
          <button style={S.link} onClick={() => { setModus('login'); setFehler(''); setHinweis('') }}>← Zurück zum Anmelden</button>
        )}
      </div>
    </Rahmen>
  )
}

function Rahmen({ children }) {
  return (
    <div style={{ background: D.paper, minHeight: '100vh', fontFamily: '"Inter Tight",system-ui,sans-serif', color: D.dunkel, display: 'flex', flexDirection: 'column' }}>
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=Inter+Tight:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + '@media(max-width:860px){.wrap>div{grid-template-columns:1fr !important}.nutzen{display:none}}' }} />
      <Kopf />
      <section style={{ flex: 1, padding: '52px 0 70px' }}>
        <div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 44, alignItems: 'start', maxWidth: 980 }}>
          <div className="nutzen">
            <a href="/" className="link-u" style={{ fontSize: 13, color: D.grau, display: 'inline-block', marginBottom: 20 }}>← Zurück zur Startseite</a>
            <h2 className="display" style={{ fontSize: 'clamp(25px,3.4vw,34px)', marginBottom: 14 }}>
              Dein Konto — <span className="leicht" style={{ color: D.grau }}>alles an einem Ort.</span>
            </h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 26 }}>
              {[
                ['Websites wiederfinden', 'Deine Entwürfe bleiben gespeichert – auch nach dem Schließen des Browsers.'],
                ['Weiterarbeiten, wo du warst', 'Jede Änderung im Editor wird automatisch gesichert.'],
                ['Domain und Rechnungen', 'Verträge, Rechnungen und Kündigung an einer Stelle.'],
              ].map(([t, u]) => (
                <li key={t} style={{ display: 'flex', gap: 11 }}>
                  <span aria-hidden="true" style={{ color: D.blau, fontWeight: 800, marginTop: 1 }}>✓</span>
                  <span>
                    <strong style={{ fontSize: 14.5, display: 'block', marginBottom: 2 }}>{t}</strong>
                    <span style={{ fontSize: 13.5, color: D.grau, lineHeight: 1.6 }}>{u}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="karte" style={{ padding: '16px 18px', fontSize: 13.5, color: D.grau, lineHeight: 1.65 }}>
              Noch nichts erstellt? Du kannst den Wizard auch ohne Konto ausprobieren —
              angemeldet sein musst du erst beim Erzeugen der Website.
              <div style={{ marginTop: 12 }}><a href="/start" className="btnleer" style={{ display: 'inline-block' }}>Wizard ansehen</a></div>
            </div>
          </div>

          <div className="karte" style={{ padding: 30 }}>{children}</div>
        </div>
      </section>
      <Fuss />
    </div>
  )
}

function Feld({ label, value, onChange, type = 'text', placeholder, onEnter }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>{label}</label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter && onEnter()}
        style={{ width: '100%', padding: '12px 14px', fontSize: 14, border: '2px solid #e2e8f0', borderRadius: 10, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
      />
    </div>
  )
}

const S = {
  h1: { fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 6 },
  p: { fontSize: 13, color: '#64748b', marginBottom: 22, lineHeight: 1.5 },
  btn: { width: '100%', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 },
  fehler: { background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 9, padding: '10px 12px', fontSize: 12.5, marginBottom: 12, lineHeight: 1.5 },
  hinweis: { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: 9, padding: '10px 12px', fontSize: 12.5, marginBottom: 12, lineHeight: 1.5 },
  links: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, alignItems: 'center' },
  link: { background: 'none', border: 'none', color: '#1d4ed8', fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', padding: 2 },
}
