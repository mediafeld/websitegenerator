'use client'
import { KontoLayout } from '@/components/KontoLayout'
import { D } from '@/components/Kopf'

export default function Domains() {
  return (
    <KontoLayout aktiv="domains" titel="Registrierte Domains"
      unter="Alle Domains, die über uns registriert sind. Du bist Inhaber — wir übernehmen die technische Verwaltung."
      kinder={
        <>
          <div className="kkarte" style={{ marginBottom: 16 }}>
            <h2>Deine Domains</h2>
            <p className="unter">Noch keine Domain registriert.</p>
            <div style={{ background: D.paper, borderRadius: 12, padding: '28px 24px', textAlign: 'center' }}>
              <i className="fa-solid fa-globe" style={{ fontSize: 26, color: D.grauHell, marginBottom: 12, display: 'block' }} aria-hidden="true" />
              <p style={{ fontSize: 14.5, color: D.grau, marginBottom: 16, lineHeight: 1.65, maxWidth: 420, margin: '0 auto 16px' }}>
                Prüf zuerst, ob dein Wunschname frei ist. Die Registrierung erfolgt beim Abschluss eines Mietpakets.
              </p>
              <a href="/#domain" className="btnfest"><i className="fa-solid fa-magnifying-glass" style={{ marginRight: 7 }} aria-hidden="true" />Domain prüfen</a>
            </div>
          </div>

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
                    <span style={{ fontSize: 14, color: D.grau, lineHeight: 1.7 }}>{u}</span>
                    <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11.5, fontWeight: 700, color: D.blau, background: D.blauZart, borderRadius: 99, padding: '3px 10px' }}>{z}</span>
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
                  <i className={`fa-solid fa-${ic}`} style={{ color: D.blau, fontSize: 15, marginTop: 3, width: 18, textAlign: 'center' }} aria-hidden="true" />
                  <span><strong style={{ fontSize: 14.5, display: 'block', marginBottom: 2 }}>{t}</strong>
                    <span style={{ fontSize: 14, color: D.grau, lineHeight: 1.7 }}>{u}</span></span>
                </li>
              ))}
            </ul>
          </div>
        </>
      } />
  )
}
