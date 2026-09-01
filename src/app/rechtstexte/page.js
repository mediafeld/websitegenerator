'use client'
import { useState, useEffect } from 'react'
import { KontoLayout } from '@/components/KontoLayout'
import { D } from '@/components/Kopf'
import { supabase, supabaseBereit, fehlerText } from '@/lib/supabaseClient'
import { aktuellerNutzer } from '@/lib/projekte'
import { rechtsSeitenSync } from '@/lib/rechtsseiten'
import { ausProfil, impressumText, datenschutzText } from '@/lib/rechtstexteVorlagen'

// Die Vorlagen liegen zentral in lib/rechtstexteVorlagen.js — damit der
// Baukasten (Erstkonfiguration) und das Kundenkonto denselben Text erzeugen.
const impressumErzeugen = (p) => impressumText(ausProfil(p))
const datenschutzErzeugen = (p) => datenschutzText(ausProfil(p))

// Speichert den Text im Konto UND trägt ihn als Unterseite in alle eigenen
// Websites ein (Footer verlinkt bereits auf impressum.html/datenschutz.html).
async function inWebsitesUebernehmen(userId, texte) {
  const { data: projekte, error } = await supabase
    .from('projekte').select('id,pages').eq('user_id', userId)
  if (error) return { anzahl: 0, fehler: fehlerText(error) }
  let anzahl = 0
  for (const p of projekte || []) {
    if (!p?.pages || !Object.keys(p.pages).length) continue
    const neu = rechtsSeitenSync(p.pages, texte)
    if (neu === p.pages) continue
    const { data, error: schreibFehler } = await supabase
      .from('projekte').update({ pages: neu }).eq('id', p.id).select('id')
    if (schreibFehler) return { anzahl, fehler: fehlerText(schreibFehler) }
    if (data?.length) anzahl++
  }
  return { anzahl, fehler: '' }
}

function RechtstextKarte({ art, titel, erzeugen }) {
  const [profil, setProfil] = useState(null)
  const [text, setText] = useState('')
  const [status, setStatus] = useState('')
  const [fehler, setFehler] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    if (!supabaseBereit) return
    aktuellerNutzer().then(async (u) => {
      if (!u) return
      const { data: p } = await supabase.from('profile').select('*').eq('id', u.id).maybeSingle()
      setProfil(p || {})
      if (p?.[`text_${art}`]) setText(p[`text_${art}`])
    })
  }, [])

  function neuErzeugen() {
    setText(erzeugen(profil))
  }

  async function speichern() {
    const u = await aktuellerNutzer()
    if (!u) { setFehler('Bitte zuerst einloggen.'); return }
    setStatus('speichert'); setFehler(''); setInfo('')

    const { error } = await supabase.from('profile').upsert({ id: u.id, [`text_${art}`]: text })
    if (error) {
      setFehler(/text_(impressum|datenschutz)/.test(error.message || '')
        ? 'Der Datenbank fehlt noch die Spalte für die Rechtstexte (migration_v40 ausführen).'
        : fehlerText(error))
      setStatus(''); return
    }
    // Gegenprobe: wirklich angekommen?
    const { data: p } = await supabase.from('profile')
      .select('text_impressum,text_datenschutz').eq('id', u.id).maybeSingle()
    if (!p || (p[`text_${art}`] || '') !== text) {
      setFehler('Der Text konnte nicht gespeichert werden. Bitte beim Support melden.')
      setStatus(''); return
    }

    // …und direkt in die Websites eintragen (beide Texte, damit Impressum und
    // Datenschutz immer zusammen aktuell sind)
    const { anzahl, fehler: uebernahmeFehler } = await inWebsitesUebernehmen(u.id, p)
    const wort = anzahl === 1 ? 'Website' : 'Websites'
    setStatus('gespeichert')
    if (uebernahmeFehler) {
      setFehler(`Gespeichert — aber die Übernahme in die Website hat nicht geklappt: ${uebernahmeFehler}`)
    } else if (!text.trim()) {
      // Leerer Text = Seite soll weg
      setInfo(anzahl === 0
        ? 'Der Text ist entfernt. Auf deinen Websites gibt es dazu keine Unterseite und keinen Link im Fußbereich.'
        : `Der Text ist entfernt — die Unterseite und der Link im Fußbereich sind auf ${anzahl} ${wort} verschwunden.`)
    } else {
      setInfo(anzahl === 0
        ? 'Gespeichert. Sobald eine Website erzeugt ist, erscheint die Seite dort automatisch — verlinkt im Fußbereich.'
        : `Gespeichert und in ${anzahl} ${wort} übernommen — als Unterseite, verlinkt im Fußbereich.`)
    }
    setTimeout(() => setStatus(''), 3000)
  }

  return (
    <div className="kkarte" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 6 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>{titel}</h2>
          <p className="unter" style={{ marginBottom: 0 }}>
            Selbst schreiben oder aus deinen Konto-Angaben erzeugen lassen. Steht hier ein Text, bekommt deine
            Website eine eigene Unterseite dafür und einen Link im Fußbereich — ist das Feld leer, gibt es beides nicht.
          </p>
        </div>
        <button className="btnleer" onClick={neuErzeugen}>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 7 }} aria-hidden="true" />Aus meinen Daten erzeugen
        </button>
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Hier eigenen Text einfügen — oder rechts oben erzeugen lassen."
        style={{ width: '100%', minHeight: 260, marginTop: 14, padding: '16px 18px', fontSize: 13.5, lineHeight: 1.7, fontFamily: 'ui-monospace,monospace',
          border: `2px solid ${D.linie}`, borderRadius: 12, outline: 'none', resize: 'vertical', color: D.text }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
        {/* Leerer Text ist erlaubt und BEDEUTET ETWAS: die Seite verschwindet
            wieder — samt Link im Fußbereich. Deshalb kein disabled mehr. */}
        <button className="btnfest" onClick={speichern} disabled={status === 'speichert'}>
          <i className={`fa-solid ${status === 'speichert' ? 'fa-spinner fa-spin' : text.trim() ? 'fa-floppy-disk' : 'fa-trash'}`} style={{ marginRight: 7 }} aria-hidden="true" />
          {status === 'speichert' ? 'Speichert …' : text.trim() ? 'Speichern & in Website übernehmen' : 'Leeren — Seite von der Website entfernen'}
        </button>
        {status === 'gespeichert' && !fehler && (
          <span style={{ fontSize: 13, color: '#1F9D55', fontWeight: 700 }}>
            <i className="fa-solid fa-circle-check" style={{ marginRight: 6 }} aria-hidden="true" />Gespeichert
          </span>
        )}
        {/* Fehler IMMER direkt am Knopf — oben sieht man ihn bei langem Text nicht */}
        {fehler && (
          <span style={{ fontSize: 13, color: '#B91C1C', fontWeight: 600, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '9px 14px', lineHeight: 1.5 }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: 7 }} aria-hidden="true" />{fehler}
          </span>
        )}
      </div>
      {info && !fehler && (
        <div style={{ marginTop: 11, fontSize: 13, color: D.hellText, background: D.hellGrund, borderRadius: 10, padding: '10px 14px', lineHeight: 1.6 }}>
          <i className="fa-solid fa-circle-info" style={{ marginRight: 8, color: D.blau }} aria-hidden="true" />{info}
        </div>
      )}
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
