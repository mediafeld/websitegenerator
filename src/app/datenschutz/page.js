'use client'
import { Rechtsseite, L } from '@/components/Rechtsseite'

export default function Datenschutz() {
  return (
    <Rechtsseite titel="Datenschutzerklärung" stand="Juli 2026" kinder={<>
      <h2>1. Verantwortlicher</h2>
      <p>
        Erkan Terzoglou, websitegenerator24.de, Kolonnenstraße 8, 10827 Berlin.
        E-Mail: <a href="mailto:info@websitegenerator24.de">info@websitegenerator24.de</a>,
        Telefon: <a href="tel:+493057702366">+49 (0)30 57 70 23 66</a>.
      </p>

      <h2>2. Welche Daten wir verarbeiten</h2>
      <h3>Beim Besuch der Website</h3>
      <p>
        Beim Aufruf werden technisch notwendige Daten verarbeitet: IP-Adresse, Datum und Uhrzeit,
        aufgerufene Seite, Browsertyp und Betriebssystem. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f
        DSGVO (berechtigtes Interesse am sicheren Betrieb).
      </p>
      <h3>Bei Registrierung und Konto</h3>
      <p>
        Für ein Konto speichern wir E-Mail-Adresse und Passwort (verschlüsselt), optional den
        Firmennamen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
      </p>
      <h3>Bei der Erstellung einer Website</h3>
      <p>
        Wir verarbeiten die Angaben, die du im Wizard machst: Firmenname, Anschrift, Telefon,
        E-Mail, Öffnungszeiten, Leistungen, Branche sowie von dir hochgeladene Bilder und Logos.
        Diese Daten sind notwendig, um deine Website zu erzeugen. Rechtsgrundlage: Art. 6 Abs. 1
        lit. b DSGVO.
      </p>
      <h3>Bei Bezahlung</h3>
      <p>
        Für Käufe und Mietverträge verarbeiten wir Rechnungsdaten. Zahlungsdaten wie
        Kreditkartennummern erhalten wir nicht – diese werden ausschließlich beim
        Zahlungsdienstleister verarbeitet.
      </p>

      <h2>3. Eingesetzte Dienste und Empfänger</h2>
      <p>Zur Bereitstellung setzen wir folgende Auftragsverarbeiter ein:</p>
      <ul>
        <li><strong>Vercel Inc.</strong> (USA/EU) – Betrieb und Ausliefern der Website. Es können Daten in die USA übertragen werden; Grundlage sind Standardvertragsklauseln.</li>
        <li><strong>Supabase</strong> (Region Frankfurt, Deutschland) – Datenbank für Konten und Projekte.</li>
        <li><strong>Anthropic PBC</strong> (USA) – Erzeugen der Texte. Übermittelt werden die Angaben aus dem Wizard, keine Kontodaten. Grundlage: Standardvertragsklauseln.</li>
        <li><strong>OpenAI</strong> (USA) – Erzeugen der Bilder. Übermittelt wird die Bildbeschreibung. Grundlage: Standardvertragsklauseln.</li>
        <li><strong>INWX GmbH &amp; Co. KG</strong> (Berlin) – Domainprüfung und Domainregistrierung. Bei einer Registrierung werden die Inhaberdaten an die Registrierungsstelle (z. B. DENIC) übermittelt; das ist für die Domainvergabe erforderlich.</li>
        <li><strong>ALL-INKL.COM – Neue Medien Münnich</strong> (Deutschland) – Hosting der erstellten Kundenwebsites und E-Mail-Postfächer.</li>
      </ul>
      <p>
        Wir setzen <strong>Google Fonts lokal ein bzw. arbeiten daran</strong>; wo Schriften noch
        von externen Servern geladen werden, wird dabei die IP-Adresse übertragen.
        <L>Vor dem Start prüfen und diesen Absatz anpassen</L>
      </p>

      <h2>4. Hochgeladene Bilder</h2>
      <p>
        Bilder, die du hochlädst, verwenden wir ausschließlich zur Erstellung deiner Website.
        Nach Abschluss des Projekts und dem Download werden sie von unseren Servern gelöscht.
        Du bestätigst beim Hochladen, dass du die erforderlichen Nutzungsrechte besitzt.
      </p>

      <h2>5. Speicherdauer</h2>
      <p>
        Kontodaten speichern wir, solange dein Konto besteht. Projektdaten löschen wir, wenn du
        das Projekt oder dein Konto löschst. Rechnungsdaten bewahren wir gemäß den gesetzlichen
        Aufbewahrungsfristen (in der Regel zehn Jahre) auf.
      </p>

      <h2>6. Cookies und Zwischenspeicher</h2>
      <p>
        Wir setzen ausschließlich technisch notwendige Speichermechanismen ein: einen
        Anmelde-Token, damit du eingeloggt bleibst, sowie den Browser-Zwischenspeicher für
        deinen Website-Entwurf. Wir verwenden keine Werbe- oder Analyse-Cookies und binden keine
        Tracking-Dienste ein. Eine Einwilligung ist dafür nicht erforderlich (§ 25 Abs. 2 TDDDG).
      </p>

      <h2>7. Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17),
        Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch
        (Art. 21 DSGVO). Wende dich dafür an
        <a href="mailto:info@websitegenerator24.de"> info@websitegenerator24.de</a>.
      </p>
      <p>
        Außerdem kannst du dich bei einer Aufsichtsbehörde beschweren, für Berlin:
        Berliner Beauftragte für Datenschutz und Informationsfreiheit.
      </p>

      <h2>8. Änderungen</h2>
      <p>
        Wir passen diese Erklärung an, wenn sich unsere Leistungen oder die Rechtslage ändern.
        Es gilt die jeweils auf dieser Seite veröffentlichte Fassung.
      </p>
    </>} />
  )
}
