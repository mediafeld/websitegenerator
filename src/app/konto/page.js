'use client'
import { useState, useEffect } from 'react'
import { supabase, supabaseBereit, fehlerText } from '@/lib/supabaseClient'
import { KontoLayout } from '@/components/KontoLayout'
import { D } from '@/components/Kopf'

const LEER = { zusatz: '', anrede: '', vorname: '', nachname: '', firma: '', rechtsform: '', strasse: '', plz: '', ort: '', land: 'Deutschland', telefon: '', ust_id: '', steuernummer: '', rechnung_mail: '' }

export default function Konto() {
  const [nutzer, setNutzer] = useState(null)
  const [f, setF] = useState(LEER)
  const [status, setStatus] = useState('')
  const [fehler, setFehler] = useState('')
  const upd = (k, v) => setF(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (!supabaseBereit) return
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data?.session) return
      setNutzer(data.session.user)
      const { data: p } = await supabase.from('profile').select('*').eq('id', data.session.user.id).maybeSingle()
      if (p) setF({ ...LEER, ...Object.fromEntries(Object.entries(p).filter(([k]) => k in LEER)) })
    })
  }, [])

  async function speichern() {
    if (!nutzer) return
    setStatus('speichert'); setFehler('')
    const { error } = await supabase.from('profile').upsert({ id: nutzer.id, ...f })
    if (error) { setFehler(fehlerText(error)); setStatus(''); return }
    // Gegenprobe: wirklich in der Datenbank angekommen? Sonst meldet die Seite
    // faelschlich Erfolg, obwohl still nichts geschrieben wurde.
    const { data: p, error: leseFehler } = await supabase
      .from('profile').select('*').eq('id', nutzer.id).maybeSingle()
    if (leseFehler) { setFehler(fehlerText(leseFehler)); setStatus(''); return }
    if (!p) {
      setFehler('Die Angaben konnten nicht gespeichert werden. Bitte melde dich beim Support.')
      setStatus(''); return
    }
    setF({ ...LEER, ...Object.fromEntries(Object.entries(p).filter(([k]) => k in LEER)) })
    setStatus('gespeichert'); setTimeout(() => setStatus(''), 2600)
  }

  const vollstaendig = f.nachname && f.strasse && f.plz && f.ort

  return (
    <KontoLayout aktiv="konto" titel="Meine Daten"
      unter="Diese Angaben erscheinen auf deinen Rechnungen und in den erzeugten Rechtstexten. Ohne vollständige Anschrift können wir keine Rechnung ausstellen."
      kinder={
        <>
          {!vollstaendig && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '15px 18px', marginBottom: 18, fontSize: 14, color: '#92400E', lineHeight: 1.6 }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 9 }} aria-hidden="true" />
              Bitte ergänze mindestens Nachname, Straße, PLZ und Ort.
            </div>
          )}
          {fehler && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '15px 18px', marginBottom: 18, fontSize: 14, color: '#B91C1C' }}>{fehler}</div>
          )}

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2><i className="fa-solid fa-user" style={{ color: '#1D4ED8', marginRight: 10, fontSize: 17 }} aria-hidden="true" />Person &amp; Firma</h2>
            <p className="unter">Wie soll auf Rechnungen angesprochen werden?</p>
            <div className="zeile" style={{ gridTemplateColumns: '140px 1fr 1fr' }}>
              <div><label className="beschr">Anrede</label>
                <select className="feld" value={f.anrede} onChange={e => upd('anrede', e.target.value)}>
                  <option value="">—</option><option>Frau</option><option>Herr</option><option>Divers</option>
                </select></div>
              <div><label className="beschr">Vorname</label><input className="feld" value={f.vorname} onChange={e => upd('vorname', e.target.value)} /></div>
              <div><label className="beschr">Nachname *</label><input className="feld" value={f.nachname} onChange={e => upd('nachname', e.target.value)} /></div>
            </div>
            <div className="zeile" style={{ gridTemplateColumns: '1fr 260px' }}>
              <div><label className="beschr">Geschäftsbezeichnung / Firma</label><input className="feld" value={f.firma} onChange={e => upd('firma', e.target.value)} placeholder="falls vorhanden" /></div>
              <div><label className="beschr">Rechtsform</label>
                <select className="feld" value={f.rechtsform} onChange={e => upd('rechtsform', e.target.value)}>
                  <option value="">—</option>
                  {['Gewerbetreibender / Freiberufler (kein Registereintrag)','Einzelunternehmen','e.K. – eingetragener Kaufmann','GbR – Gesellschaft bürgerlichen Rechts','UG (haftungsbeschränkt)','GmbH','GmbH & Co. KG','OHG','KG','AG','eG – eingetragene Genossenschaft','e.V. – eingetragener Verein','Privatperson'].map(t => <option key={t}>{t}</option>)}
                </select></div>
            </div>
          </div>

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2><i className="fa-solid fa-location-dot" style={{ color: '#1D4ED8', marginRight: 10, fontSize: 17 }} aria-hidden="true" />Rechnungsadresse</h2>
            <p className="unter">Kein Postfach — im Impressum ist eine ladungsfähige Anschrift Pflicht.</p>
            <div className="zeile" style={{ gridTemplateColumns: '1fr 240px' }}>
              <div><label className="beschr">Straße und Hausnummer *</label><input className="feld" value={f.strasse} onChange={e => upd('strasse', e.target.value)} /></div>
              <div><label className="beschr">Adresszusatz</label><input className="feld" value={f.zusatz || ''} onChange={e => upd('zusatz', e.target.value)} placeholder="falls vorhanden" /></div>
            </div>
            <div className="zeile" style={{ gridTemplateColumns: '160px 1fr 1fr' }}>
              <div><label className="beschr">PLZ *</label><input className="feld" value={f.plz} onChange={e => upd('plz', e.target.value)} /></div>
              <div><label className="beschr">Ort *</label><input className="feld" value={f.ort} onChange={e => upd('ort', e.target.value)} /></div>
              <div><label className="beschr">Land</label><input className="feld" value={f.land} onChange={e => upd('land', e.target.value)} /></div>
            </div>
            <div className="zeile" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div><label className="beschr">Telefon</label><input className="feld" value={f.telefon} onChange={e => upd('telefon', e.target.value)} placeholder="für Rückfragen und Impressum" /></div>
              <div><label className="beschr">Rechnungs-E-Mail</label><input className="feld" value={f.rechnung_mail} onChange={e => upd('rechnung_mail', e.target.value)} placeholder={nutzer?.email || 'wie Anmeldung'} /></div>
            </div>
          </div>

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2><i className="fa-solid fa-receipt" style={{ color: '#1D4ED8', marginRight: 10, fontSize: 17 }} aria-hidden="true" />Steuerangaben</h2>
            <p className="unter">Nur bei gewerblicher Nutzung. Die USt-IdNr. erscheint auf der Rechnung und im Impressum.</p>
            <div className="zeile" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div><label className="beschr">USt-IdNr.</label><input className="feld" value={f.ust_id} onChange={e => upd('ust_id', e.target.value)} placeholder="DE123456789" /></div>
              <div><label className="beschr">Steuernummer</label><input className="feld" value={f.steuernummer} onChange={e => upd('steuernummer', e.target.value)} /></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <button className="btnfest" onClick={speichern} style={{ padding: '13px 26px', fontSize: 14.5 }}>
              <i className="fa-solid fa-floppy-disk" style={{ marginRight: 8 }} aria-hidden="true" />
              {status === 'speichert' ? 'Speichert…' : 'Daten speichern'}
            </button>
            {status === 'gespeichert' && <span style={{ fontSize: 14, color: '#15803D', fontWeight: 700 }}><i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} aria-hidden="true" />Gespeichert</span>}
            {/* Fehler NEBEN dem Knopf: oben am Seitenanfang sieht man ihn beim
                Speichern nicht, weil das Formular lang ist. */}
            {fehler && (
              <span style={{ fontSize: 13.5, color: '#B91C1C', fontWeight: 600, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '9px 14px', lineHeight: 1.5 }}>
                <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 7 }} aria-hidden="true" />{fehler}
              </span>
            )}
          </div>

          <div className="kkarte">
            <h2><i className="fa-solid fa-trash" style={{ color: '#DC2626', marginRight: 10, fontSize: 16 }} aria-hidden="true" />Konto löschen</h2>
            <p style={{ fontSize: 14.5, color: D.hellGrau, lineHeight: 1.75, marginBottom: 16 }}>
              Mit dem Konto werden auch deine Websites gelöscht. Lade sie vorher herunter.
              Rechnungsdaten müssen wir gesetzlich zehn Jahre aufbewahren. Wir bestätigen die Löschung schriftlich.
            </p>
            <a href="/kontakt" className="btnleer">Löschung anfragen</a>
          </div>
        </>
      } />
  )
}
