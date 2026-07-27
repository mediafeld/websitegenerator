'use client'
import { useState, useEffect } from 'react'
import { KontoLayout } from '@/components/KontoLayout'
import { D } from '@/components/Kopf'
import { supabase, supabaseBereit } from '@/lib/supabaseClient'
import { aktuellerNutzer } from '@/lib/projekte'

function impressumErzeugen(p) {
  if (!p?.nachname || !p?.strasse || !p?.plz || !p?.ort) {
    return '[ Bitte zuerst unter „Meine Daten" Name und Anschrift vervollständigen, dann hier neu erzeugen. ]'
  }
  const name = [p.anrede === 'sie' ? '' : '', p.vorname, p.nachname].filter(Boolean).join(' ')
  const zeilen = [
    p.firma || name,
    p.firma ? `Inhaber: ${name}` : null,
    p.zusatz || null,
    `${p.strasse}`,
    `${p.plz} ${p.ort}${p.land && p.land !== 'Deutschland' ? ', ' + p.land : ''}`,
    '',
    'Kontakt:',
    p.telefon ? `Telefon: ${p.telefon}` : null,
    `E-Mail: ${p.rechnung_mail || '[ E-Mail-Adresse ergänzen ]'}`,
    '',
    p.ust_id ? `Umsatzsteuer-ID gemäß § 27 a Umsatzsteuergesetz: ${p.ust_id}` : null,
    p.steuernummer && !p.ust_id ? `Steuernummer: ${p.steuernummer}` : null,
    '',
    'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:',
    name,
    '(Anschrift wie oben)',
    '',
    'Streitschlichtung:',
    'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:',
    'https://ec.europa.eu/consumers/odr/',
    'Zur Teilnahme an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind wir nicht verpflichtet und nicht bereit.',
  ].filter(l => l !== null).join('\n')
  return zeilen
}

function datenschutzErzeugen(p) {
  const verantwortlich = p?.firma || [p?.vorname, p?.nachname].filter(Boolean).join(' ') || '[ Name/Firma ergänzen ]'
  return [
    '1. Verantwortlicher',
    `${verantwortlich}, ${p?.strasse || '[ Straße ]'}, ${p?.plz || '[ PLZ ]'} ${p?.ort || '[ Ort ]'}`,
    `E-Mail: ${p?.rechnung_mail || '[ E-Mail ]'}`,
    '',
    '2. Hosting',
    'Diese Website wird bei einem Hosting-Anbieter in Deutschland/der EU betrieben. Beim Aufruf werden automatisch',
    'Server-Logdaten (u. a. IP-Adresse, Datum, Uhrzeit, aufgerufene Seite) verarbeitet, um den Betrieb sicherzustellen',
    '(Art. 6 Abs. 1 lit. f DSGVO).',
    '',
    '3. Kontaktformular',
    'Wenn du uns über das Kontaktformular schreibst, verarbeiten wir deine Angaben zur Bearbeitung der Anfrage',
    '(Art. 6 Abs. 1 lit. b DSGVO). Die Daten werden gelöscht, sobald die Anfrage abschließend bearbeitet ist und',
    'keine gesetzlichen Aufbewahrungspflichten entgegenstehen.',
    '',
    '4. Schriftarten',
    'Schriftarten werden lokal auf unserem Server ausgeliefert. Es findet keine Verbindung zu Google Fonts oder',
    'anderen externen Font-Anbietern statt.',
    '',
    '5. Cookies',
    'Diese Website verwendet nur technisch notwendige Cookies. Cookies für Statistik oder Werbung werden nicht',
    'ohne vorherige Einwilligung gesetzt.',
    '',
    '6. Kartendienst (OpenStreetMap)',
    'Sofern auf dieser Website eine Anfahrtskarte eingebunden ist, wird sie erst nach deinem ausdrücklichen Klick',
    'geladen (Zwei-Klick-Lösung). Erst dann werden Daten (u. a. deine IP-Adresse) an die OpenStreetMap Foundation',
    'übertragen (Art. 6 Abs. 1 lit. a DSGVO). Ohne Klick findet keine Übertragung statt.',
    '',
    '7. Deine Rechte',
    'Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit',
    'und Widerspruch. Wende dich dazu an die oben genannte E-Mail-Adresse. Außerdem besteht ein Beschwerderecht',
    'bei der zuständigen Datenschutz-Aufsichtsbehörde.',
  ].join('\n')
}

function RechtstextKarte({ art, titel, erzeugen }) {
  const [profil, setProfil] = useState(null)
  const [text, setText] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!supabaseBereit) return
    aktuellerNutzer().then(async (u) => {
      if (!u) return
      const { data: p } = await supabase.from('profile').select('*').eq('id', u.id).maybeSingle()
      setProfil(p || {})
      const { data: rt } = await supabase.from('profile').select(`text_${art}`).eq('id', u.id).maybeSingle()
      if (rt?.[`text_${art}`]) setText(rt[`text_${art}`])
    })
  }, [])

  function neuErzeugen() {
    setText(erzeugen(profil))
  }

  async function speichern() {
    const u = await aktuellerNutzer()
    if (!u) return
    setStatus('speichert')
    const { error } = await supabase.from('profile').upsert({ id: u.id, [`text_${art}`]: text })
    setStatus(error ? 'fehler' : 'gespeichert')
    setTimeout(() => setStatus(''), 2500)
  }

  return (
    <div className="kkarte" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 6 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>{titel}</h2>
          <p className="unter" style={{ marginBottom: 0 }}>Selbst schreiben oder aus deinen Konto-Angaben erzeugen lassen — beides jederzeit änderbar.</p>
        </div>
        <button className="btnleer" onClick={neuErzeugen}>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 7 }} aria-hidden="true" />Aus meinen Daten erzeugen
        </button>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Hier eigenen Text einfügen — oder rechts oben erzeugen lassen."
        style={{ width: '100%', minHeight: 260, marginTop: 14, padding: '16px 18px', fontSize: 13.5, lineHeight: 1.7, fontFamily: 'ui-monospace,monospace',
          border: `2px solid ${D.linie}`, borderRadius: 12, outline: 'none', resize: 'vertical', color: D.text }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
        <button className="btnfest" onClick={speichern} disabled={!text.trim()}>
          <i className="fa-solid fa-floppy-disk" style={{ marginRight: 7 }} aria-hidden="true" />Speichern
        </button>
        {status === 'speichert' && <span style={{ fontSize: 13, color: D.hellGrau }}>Speichert …</span>}
        {status === 'gespeichert' && <span style={{ fontSize: 13, color: '#15803D', fontWeight: 700 }}><i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} aria-hidden="true" />Gespeichert</span>}
        {status === 'fehler' && <span style={{ fontSize: 13, color: '#DC2626' }}>Fehler beim Speichern — bitte nochmal versuchen.</span>}
      </div>
    </div>
  )
}

export default function Rechtstexte() {
  return (
    <KontoLayout aktiv="rechtstexte" titel="Impressum & Datenschutz"
      unter="Für die Rechtstexte deiner eigenen Website. Aus deinen Angaben erzeugen wir Vorlagen, die du übernehmen kannst."
      kinder={
        <>
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, padding: '20px 22px', marginBottom: 18 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, color: '#92400E' }}>
              <i className="fa-solid fa-circle-info" style={{ marginRight: 9 }} aria-hidden="true" />Bitte lesen
            </h2>
            <p style={{ fontSize: 14, color: '#92400E', lineHeight: 1.75 }}>
              Wir erzeugen Textvorlagen aus deinen Angaben — das ist <strong>keine Rechtsberatung</strong> und
              wir übernehmen keine Haftung für die Richtigkeit oder Vollständigkeit. Für die Inhalte deiner
              Website bist du verantwortlich. Bei besonderen Anforderungen — Praxen, Kanzleien, Onlineverkauf,
              Newsletter, Elektrogeräte, Lebensmittel — lass die Texte anwaltlich prüfen oder nutze einen
              Rechtstexte-Dienst mit Aktualisierungsservice.
            </p>
          </div>

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2>Was für dein Impressum gebraucht wird</h2>
            <p className="unter">Diese Angaben ziehen wir aus „Meine Daten" und deinem Wizard. Fehlt etwas, wird es im Text markiert.</p>
            <div className="zeile" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {[
                ['Pflicht für alle', ['Vor- und Nachname', 'Vollständige Anschrift (kein Postfach)', 'Telefon oder Kontaktformular', 'E-Mail-Adresse', 'Rechtsform']],
                ['Je nach Fall', ['Geschäftsbezeichnung', 'USt-IdNr. bei Umsatzsteuerpflicht', 'Registergericht und -nummer', 'Kammer und Berufsbezeichnung bei reglementierten Berufen', 'Aufsichtsbehörde bei Erlaubnispflicht', 'Verantwortlicher nach § 18 MStV bei redaktionellen Inhalten']],
              ].map(([t, liste]) => (
                <div key={t} style={{ background: D.hellGrund, borderRadius: 12, padding: 20 }}>
                  <h3 style={{ fontSize: 15.5, fontWeight: 800, marginBottom: 12 }}>{t}</h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {liste.map(p => (
                      <li key={p} style={{ display: 'flex', gap: 9, fontSize: 13.8, color: D.hellGrau, lineHeight: 1.55 }}>
                        <i className="fa-solid fa-check" style={{ color: D.magenta, fontSize: 11, marginTop: 4 }} aria-hidden="true" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2>Fragen, die dein Impressum beeinflussen</h2>
            <p className="unter">Diese Punkte fragen wir vor dem Erzeugen ab — sie ändern den Text.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                'Richtest du dein Angebot an Verbraucher in der EU?',
                'Übst du eine reglementierte Tätigkeit aus (z. B. Arzt, Anwalt, Steuerberater, Handwerk mit Meisterpflicht)?',
                'Bietest du selbst Hosting oder Plattformdienste an?',
                'Hältst du journalistisch-redaktionelle Inhalte bereit (Blog, Magazin)?',
                'Bist du Hersteller oder Importeur von Elektrogeräten oder Verpackungen?',
                'Nimmst du an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teil?',
                'Verkaufst du online (dann braucht es zusätzlich AGB und Widerrufsbelehrung)?',
              ].map(q => (
                <li key={q} style={{ display: 'flex', gap: 11, fontSize: 14.2, color: D.hellText, lineHeight: 1.65 }}>
                  <i className="fa-solid fa-circle-question" style={{ color: D.magenta, fontSize: 14, marginTop: 3, flexShrink: 0 }} aria-hidden="true" />{q}
                </li>
              ))}
            </ul>
          </div>

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2>Datenschutzerklärung</h2>
            <p className="unter">Der Text richtet sich danach, was deine Website tatsächlich tut.</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['envelope', 'Kontaktformular', 'Welche Felder, wohin gehen die Daten, wie lange gespeichert.'],
                ['map-location-dot', 'Karte eingebunden', 'Karten laden Daten von Dritten — braucht eine Einwilligung.'],
                ['font', 'Schriften', 'Bei uns lokal ausgeliefert — dadurch keine Übertragung an Google.'],
                ['chart-simple', 'Statistik oder Werbung', 'Nur mit Cookie-Banner und Einwilligung. Standardmäßig nicht eingebaut.'],
                ['share-nodes', 'Social-Media-Verweise', 'Einfache Links sind unkritisch, eingebettete Inhalte nicht.'],
              ].map(([ic, t, u]) => (
                <li key={t} style={{ display: 'flex', gap: 12 }}>
                  <i className={`fa-solid fa-${ic}`} style={{ color: D.magenta, fontSize: 14, marginTop: 4, width: 18, textAlign: 'center' }} aria-hidden="true" />
                  <span><strong style={{ fontSize: 14.5 }}>{t}</strong>
                    <span style={{ fontSize: 14, color: D.hellGrau, lineHeight: 1.65, display: 'block' }}>{u}</span></span>
                </li>
              ))}
            </ul>
          </div>

          <RechtstextKarte art="impressum" titel="Impressum" erzeugen={impressumErzeugen} />
          <RechtstextKarte art="datenschutz" titel="Datenschutzerklärung" erzeugen={datenschutzErzeugen} />

          <div className="kkarte">
            <h2>Angaben fehlen?</h2>
            <p style={{ fontSize: 14.5, color: D.hellGrau, lineHeight: 1.75, marginBottom: 16 }}>
              Der Generator zieht Name, Anschrift, Kontakt und Steuerdaten aus „Meine Daten". Fehlt dort etwas,
              wird das im erzeugten Text als Platzhalter markiert.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="/konto" className="btnfest"><i className="fa-solid fa-address-card" style={{ marginRight: 7 }} aria-hidden="true" />Meine Daten vervollständigen</a>
              <a href="/kontakt" className="btnleer">Frage dazu stellen</a>
            </div>
          </div>
        </>
      } />
  )
}
