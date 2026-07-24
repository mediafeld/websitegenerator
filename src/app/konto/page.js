'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Kopf, D, BASIS_CSS, TELEFON, TELEFON_LINK } from '@/components/Kopf'
import { Fuss } from '@/components/Fuss'
import { FONT_LINK } from '@/components/Seite'
import { supabase, supabaseBereit, fehlerText } from '@/lib/supabaseClient'
import { KontoNav } from '@/components/KontoNav'

const LEER = { anrede: '', vorname: '', nachname: '', firma: '', rechtsform: '', strasse: '', plz: '', ort: '', land: 'Deutschland', telefon: '', ust_id: '', steuernummer: '', rechnung_mail: '' }

export default function Konto() {
  const router = useRouter()
  const [nutzer, setNutzer] = useState(null)
  const [f, setF] = useState(LEER)
  const [laedt, setLaedt] = useState(true)
  const [status, setStatus] = useState('')
  const [fehler, setFehler] = useState('')
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (!supabaseBereit) { setLaedt(false); return }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data?.session) { router.replace('/login?next=/konto'); return }
      setNutzer(data.session.user)
      const { data: p } = await supabase.from('profile').select('*').eq('id', data.session.user.id).maybeSingle()
      if (p) setF({ ...LEER, ...Object.fromEntries(Object.entries(p).filter(([k]) => k in LEER)) })
      setLaedt(false)
    })
  }, [router])

  async function speichern() {
    setStatus('speichert'); setFehler('')
    const { error } = await supabase.from('profile').upsert({ id: nutzer.id, ...f })
    if (error) { setFehler(fehlerText(error)); setStatus('') }
    else { setStatus('gespeichert'); setTimeout(() => setStatus(''), 2600) }
  }

  const vollstaendig = f.nachname && f.strasse && f.plz && f.ort

  if (laedt) return <Mitte>Lade…</Mitte>

  if (!nutzer) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter Tight",system-ui,sans-serif', padding: 24, textAlign: 'center' }}>
      <div>
        <p style={{ fontSize: 15, color: '#57657E', marginBottom: 16 }}>Bitte melde dich an, um diesen Bereich zu sehen.</p>
        <a href="/login" style={{ background: '#1D4ED8', color: '#fff', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 700 }}>Zur Anmeldung</a>
      </div>
    </div>
  )

  return (
    <div style={{ background: D.paper, color: D.dunkel, fontFamily: '"Inter Tight",system-ui,sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS + `
        .feld{width:100%;padding:11px 13px;font-size:14px;border:2px solid ${D.linie};border-radius:9px;outline:none;transition:border-color .16s;background:#fff}
        .feld:focus{border-color:${D.blau}}
        .beschr{display:block;font-size:11.5px;font-weight:700;color:${D.grau};margin-bottom:5px}
        .zeile{display:grid;gap:13px;margin-bottom:13px}
      ` }} />
      <Kopf />

      <section style={{ flex: 1, padding: '34px 0 70px' }}>
        <div className="wrap" style={{ maxWidth: 1000 }}>
          <h1 className="display" style={{ fontSize: 28, marginBottom: 6 }}>Meine Daten</h1>
          <p style={{ fontSize: 14, color: D.grau, marginBottom: 22 }}>
            Diese Angaben erscheinen auf deinen Rechnungen. Ohne vollständige Anschrift können wir keine Rechnung ausstellen.
          </p>

          <KontoNav aktiv="konto" />

          {!vollstaendig && (
            <div className="karte" style={{ padding: '14px 16px', marginBottom: 18, background: '#FFFBEB', borderColor: '#FDE68A', fontSize: 13.5, color: '#92400E', lineHeight: 1.6 }}>
              Bitte ergänze mindestens Nachname, Straße, PLZ und Ort — sonst kann keine Rechnung erstellt werden.
            </div>
          )}
          {fehler && <div className="karte" style={{ padding: '14px 16px', marginBottom: 18, background: '#FEF2F2', borderColor: '#FECACA', fontSize: 13.5, color: '#B91C1C' }}>{fehler}</div>}

          <div className="karte" style={{ padding: 26, marginBottom: 16 }}>
            <h2 className="display" style={{ fontSize: 18, marginBottom: 16 }}>Person &amp; Firma</h2>
            <div className="zeile" style={{ gridTemplateColumns: '120px 1fr 1fr' }}>
              <div><label className="beschr">Anrede</label>
                <select className="feld" value={f.anrede} onChange={e => upd('anrede', e.target.value)}>
                  <option value="">—</option><option>Frau</option><option>Herr</option><option>Divers</option>
                </select>
              </div>
              <div><label className="beschr">Vorname</label><input className="feld" value={f.vorname} onChange={e => upd('vorname', e.target.value)} /></div>
              <div><label className="beschr">Nachname *</label><input className="feld" value={f.nachname} onChange={e => upd('nachname', e.target.value)} /></div>
            </div>
            <div className="zeile" style={{ gridTemplateColumns: '1fr 220px' }}>
              <div><label className="beschr">Firma</label><input className="feld" value={f.firma} onChange={e => upd('firma', e.target.value)} placeholder="falls gewerblich" /></div>
              <div><label className="beschr">Rechtsform</label>
                <select className="feld" value={f.rechtsform} onChange={e => upd('rechtsform', e.target.value)}>
                  <option value="">—</option>{['Einzelunternehmen', 'Freiberuflich', 'GbR', 'UG (haftungsbeschränkt)', 'GmbH', 'GmbH & Co. KG', 'AG', 'e.V.', 'Privatperson'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="karte" style={{ padding: 26, marginBottom: 16 }}>
            <h2 className="display" style={{ fontSize: 18, marginBottom: 16 }}>Rechnungsadresse</h2>
            <div className="zeile" style={{ gridTemplateColumns: '1fr' }}>
              <div><label className="beschr">Straße und Hausnummer *</label><input className="feld" value={f.strasse} onChange={e => upd('strasse', e.target.value)} /></div>
            </div>
            <div className="zeile" style={{ gridTemplateColumns: '140px 1fr 1fr' }}>
              <div><label className="beschr">PLZ *</label><input className="feld" value={f.plz} onChange={e => upd('plz', e.target.value)} /></div>
              <div><label className="beschr">Ort *</label><input className="feld" value={f.ort} onChange={e => upd('ort', e.target.value)} /></div>
              <div><label className="beschr">Land</label><input className="feld" value={f.land} onChange={e => upd('land', e.target.value)} /></div>
            </div>
            <div className="zeile" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div><label className="beschr">Telefon</label><input className="feld" value={f.telefon} onChange={e => upd('telefon', e.target.value)} placeholder="für Rückfragen" /></div>
              <div><label className="beschr">Rechnungs-E-Mail</label><input className="feld" value={f.rechnung_mail} onChange={e => upd('rechnung_mail', e.target.value)} placeholder={nutzer?.email || ''} /></div>
            </div>
          </div>

          <div className="karte" style={{ padding: 26, marginBottom: 16 }}>
            <h2 className="display" style={{ fontSize: 18, marginBottom: 6 }}>Steuerangaben</h2>
            <p style={{ fontSize: 13, color: D.grau, marginBottom: 16, lineHeight: 1.6 }}>
              Nur bei gewerblicher Nutzung nötig. Die USt-IdNr. erscheint dann auf der Rechnung.
            </p>
            <div className="zeile" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div><label className="beschr">USt-IdNr.</label><input className="feld" value={f.ust_id} onChange={e => upd('ust_id', e.target.value)} placeholder="DE123456789" /></div>
              <div><label className="beschr">Steuernummer</label><input className="feld" value={f.steuernummer} onChange={e => upd('steuernummer', e.target.value)} /></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btnfest" onClick={speichern} style={{ padding: '12px 24px' }}>
              {status === 'speichert' ? 'Speichert…' : 'Daten speichern'}
            </button>
            {status === 'gespeichert' && <span style={{ fontSize: 13.5, color: D.gruen, fontWeight: 700 }}>✓ Gespeichert</span>}
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 12.5, color: D.grauHell }}>Angemeldet als {nutzer?.email}</span>
          </div>

          <div className="karte" style={{ padding: 22, marginTop: 26 }}>
            <h2 className="display" style={{ fontSize: 17, marginBottom: 8 }}>Konto löschen</h2>
            <p style={{ fontSize: 13.5, color: D.grau, lineHeight: 1.7, marginBottom: 14 }}>
              Mit dem Konto werden auch deine Websites gelöscht. Lade sie vorher herunter, wenn du sie behalten willst.
              Rechnungsdaten müssen wir gesetzlich zehn Jahre aufbewahren. Zum Löschen ruf an
              (<a className="link-u" href={TELEFON_LINK} style={{ color: D.blau }}>{TELEFON}</a>) oder schreib uns — wir bestätigen die Löschung schriftlich.
            </p>
            <a href="/kontakt" className="btnleer">Löschung anfragen</a>
          </div>
        </div>
      </section>
      <Fuss />
    </div>
  )
}

function Mitte({ children }) {
  return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter Tight",sans-serif', color: '#57657E', fontSize: 14 }}>{children}</div>
}
