'use client'
import { KontoLayout } from '@/components/KontoLayout'
import { D, EMAIL } from '@/components/Kopf'
import { useWarenkorb } from '@/lib/warenkorb'

export default function EmailBereich() {
  const { artikel, hinzufuegen } = useWarenkorb()
  const imWarenkorb = artikel.some(a => a.id === 'postfach-zusatz')

  return (
    <KontoLayout aktiv="email" titel="E-Mail-Postfächer"
      unter="Eigene E-Mail-Adressen unter deiner Domain — zum Beispiel kontakt@deine-firma.de."
      kinder={
        <>
          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2>Deine Postfächer</h2>
            <p className="unter">Noch keine Adresse eingerichtet. Postfächer sind ab dem Mietpaket Plus enthalten.</p>
            <div style={{ background: D.hellGrund, borderRadius: 12, padding: '28px 24px', textAlign: 'center' }}>
              <i className="fa-solid fa-envelope-open-text" style={{ fontSize: 26, color: D.hellGrau, marginBottom: 12, display: 'block' }} aria-hidden="true" />
              <p style={{ fontSize: 14.5, color: D.hellGrau, maxWidth: 440, margin: '0 auto 16px', lineHeight: 1.65 }}>
                Sobald deine Domain aktiv ist, kannst du hier Adressen anlegen und wieder löschen.
              </p>
              <a href="/preise#mieten" className="btnfest">Mietpakete vergleichen</a>
            </div>
          </div>

          <div className="kkarte" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: D.blauZart, color: D.blau, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
              <i className="fa-solid fa-envelope-circle-check" aria-hidden="true" />
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 15.5, fontWeight: 700 }}>Zusätzliches Postfach</div>
              <div style={{ fontSize: 13, color: D.hellGrau }}>1 weitere E-Mail-Adresse unter deiner Domain, unabhängig vom Paket-Kontingent</div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: D.blau }}>2,90 €<span style={{ fontSize: 12, fontWeight: 600, color: D.hellGrau }}>/Monat</span></div>
            <button className={imWarenkorb ? 'btnleer' : 'btnfest'} disabled={imWarenkorb}
              onClick={() => hinzufuegen({ id: 'postfach-zusatz', titel: 'Zusätzliches Postfach', unter: 'E-Mail-Adresse unter deiner Domain', preis: 2.90, art: 'monatlich' })}>
              {imWarenkorb ? <><i className="fa-solid fa-check" style={{ marginRight: 7 }} aria-hidden="true" />Im Warenkorb</> : <><i className="fa-solid fa-cart-plus" style={{ marginRight: 7 }} aria-hidden="true" />Hinzufügen</>}
            </button>
          </div>

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2>Weiterleitung oder echtes Postfach?</h2>
            <p className="unter">Zwei Wege, die sich deutlich unterscheiden.</p>
            <div className="zeile" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ background: D.hellGrund, borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
                  <i className="fa-solid fa-share" style={{ color: D.magenta, marginRight: 8 }} aria-hidden="true" />Weiterleitung
                </h3>
                <p style={{ fontSize: 14, color: D.hellGrau, lineHeight: 1.7, marginBottom: 10 }}>
                  Post an <code>kontakt@deine-firma.de</code> landet in deinem bestehenden Postfach,
                  etwa bei Gmail oder GMX. Kein zusätzliches Programm nötig.
                </p>
                <p style={{ fontSize: 12.5, color: D.hellGrau }}>Enthalten ab Paket Start</p>
              </div>
              <div style={{ background: D.hellGrund, borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
                  <i className="fa-solid fa-inbox" style={{ color: D.magenta, marginRight: 8 }} aria-hidden="true" />Echtes Postfach
                </h3>
                <p style={{ fontSize: 14, color: D.hellGrau, lineHeight: 1.7, marginBottom: 10 }}>
                  Ein eigenes Postfach mit Webmail im Browser, Spam-Filter und Speicherplatz.
                  Du kannst damit auch <strong>unter deiner Adresse antworten</strong>.
                </p>
                <p style={{ fontSize: 12.5, color: D.hellGrau }}>Enthalten ab Paket Plus · weitere 3,00 € inkl. MwSt. / Monat</p>
              </div>
            </div>
          </div>

          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2>IMAP oder POP3 — was nehmen?</h2>
            <p className="unter">Kurz erklärt, ohne Technikkauderwelsch.</p>
            <div className="zeile" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div style={{ border: `2px solid ${D.blau}`, borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>IMAP — empfohlen</h3>
                <p style={{ fontSize: 14, color: D.hellGrau, lineHeight: 1.7 }}>
                  Deine E-Mails bleiben auf dem Server. Handy, Rechner und Tablet zeigen immer
                  denselben Stand — was du auf dem Handy löschst, ist auch am Rechner weg.
                  Das willst du in fast allen Fällen.
                </p>
              </div>
              <div style={{ background: D.hellGrund, borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>POP3 — nur im Sonderfall</h3>
                <p style={{ fontSize: 14, color: D.hellGrau, lineHeight: 1.7 }}>
                  Die E-Mails werden auf ein Gerät heruntergeladen und dabei meist vom Server
                  gelöscht. Nur sinnvoll, wenn du ausschließlich an einem Rechner arbeitest.
                  Mit mehreren Geräten führt es zu Durcheinander.
                </p>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: '14px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, fontSize: 13.5, color: '#92400E', lineHeight: 1.65 }}>
              <i className="fa-solid fa-lightbulb" style={{ marginRight: 8 }} aria-hidden="true" />
              Die genauen Zugangsdaten (Servername, Ports, Verschlüsselung) bekommst du hier angezeigt,
              sobald ein Postfach eingerichtet ist. Du trägst sie einmal in Outlook, Thunderbird
              oder der Handy-App ein.
            </div>
          </div>

          <div className="kkarte">
            <h2>Worüber der E-Mail-Betrieb läuft</h2>
            <p style={{ fontSize: 14.5, color: D.hellGrau, lineHeight: 1.75 }}>
              Deine Postfächer liegen auf Servern in Deutschland bei unserem Hosting-Partner.
              Der Abruf erfolgt verschlüsselt (SSL/TLS). Wir lesen deine E-Mails nicht und
              verwenden sie nicht für andere Zwecke — Details stehen in der{' '}
              <a className="link-u" href="/datenschutz" style={{ color: D.magenta, fontWeight: 600 }}>Datenschutzerklärung</a>.
              Fragen zur Einrichtung? Schreib an <a className="link-u" href={`mailto:${EMAIL}`} style={{ color: D.magenta }}>{EMAIL}</a>.
            </p>
          </div>
        </>
      } />
  )
}
