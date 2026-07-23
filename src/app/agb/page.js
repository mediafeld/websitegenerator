'use client'
import { Rechtsseite, L } from '@/components/Rechtsseite'

export default function AGB() {
  return (
    <Rechtsseite titel="Allgemeine Geschäftsbedingungen" stand="Juli 2026" kinder={<>
      <h2>1. Anbieter und Geltungsbereich</h2>
      <p>
        Anbieter ist <L>Vor- und Nachname</L> — mediafeld, <L>Anschrift</L>, Berlin
        (im Folgenden „wir"). Diese Bedingungen gelten für alle Leistungen von
        websitegenerator24.de gegenüber Verbrauchern und Unternehmern.
      </p>

      <h2>2. Leistungen</h2>
      <p>
        Wir stellen einen Online-Dienst bereit, mit dem Nutzerinnen und Nutzer aus eigenen Angaben
        automatisiert eine Website erstellen, bearbeiten und herunterladen können. Zusätzlich
        bieten wir auf Wunsch Domainregistrierung, Hosting und E-Mail an.
      </p>
      <p>
        Die Erstellung erfolgt teilweise automatisiert mit Hilfe künstlicher Intelligenz.
        Wir schulden ein funktionsfähiges Ergebnis nach dem beschriebenen Leistungsumfang,
        jedoch keinen bestimmten wirtschaftlichen Erfolg, keine Platzierung bei Suchmaschinen
        und keine Rechtssicherheit der Inhalte.
      </p>

      <h2>3. Vertragsschluss</h2>
      <p>
        Der Vertrag kommt zustande, wenn du im Bestellvorgang die Zahlung bestätigst und wir
        die Bestellung annehmen. Vorher kannst du das Ergebnis unverbindlich ansehen.
      </p>

      <h2>4. Preise und Zahlung</h2>
      <p>
        Es gelten die zum Zeitpunkt der Bestellung auf der <a href="/preise">Preisseite</a>
        angegebenen Preise. Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer.
        Kaufpreise sind einmalig und sofort fällig. Mietentgelte sind monatlich oder jährlich im
        Voraus fällig.
      </p>

      <h2>5. Laufzeit und Kündigung bei Miete</h2>
      <p>
        Mietverträge haben eine Mindestlaufzeit von zwölf Monaten. Danach verlängern sie sich
        auf unbestimmte Zeit und sind mit einer Frist von einem Monat kündbar. Die Kündigung ist
        über den Kontobereich, den Kündigungsknopf auf der Website oder per E-Mail möglich und
        bedarf keiner Begründung.
      </p>
      <p>
        Nach Vertragsende stellen wir die Website offline. Die Dateien kannst du bis dahin
        herunterladen; eine registrierte Domain kann auf deinen Wunsch zu einem anderen Anbieter
        übertragen werden.
      </p>

      <h2>6. Zahlungsverzug</h2>
      <p>
        Bleibt eine Zahlung aus, erinnern wir zweimal. Danach können wir die Website vorübergehend
        offline nehmen und den Vertrag nach angemessener Frist beenden.
      </p>

      <h2 id="widerruf">7. Widerrufsrecht für Verbraucher</h2>
      <p>
        Verbraucher haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag
        zu widerrufen. Die Widerrufsfrist beginnt mit dem Tag des Vertragsabschlusses.
        Zur Ausübung genügt eine eindeutige Erklärung an
        <a href="mailto:info@mediafeld.de"> info@mediafeld.de</a>.
      </p>
      <h3>Vorzeitiges Erlöschen</h3>
      <p>
        Bei digitalen Inhalten erlischt das Widerrufsrecht, wenn du ausdrücklich zustimmst, dass
        wir vor Ende der Widerrufsfrist mit der Ausführung beginnen, und du bestätigst, dass du
        dadurch dein Widerrufsrecht verlierst. Diese Zustimmung fragen wir im Bestellvorgang ab.
      </p>
      <p>
        Für <strong>Domains</strong> besteht kein Widerrufsrecht, da sie nach deinen
        Vorgaben individuell registriert werden und nicht zurückgegeben werden können.
      </p>

      <h2>8. Pflichten der Nutzerinnen und Nutzer</h2>
      <p>Du sicherst zu, dass</p>
      <ul>
        <li>deine Angaben richtig und vollständig sind,</li>
        <li>du an hochgeladenen Bildern, Logos und Texten die nötigen Rechte besitzt,</li>
        <li>die Inhalte deiner Website nicht gegen Rechte Dritter oder geltendes Recht verstoßen,</li>
        <li>du selbst für Impressum, Datenschutzerklärung und Pflichtangaben deiner Website verantwortlich bist.</li>
      </ul>
      <p>
        Wir dürfen Inhalte sperren, wenn wir Kenntnis von einem Rechtsverstoß erlangen.
        Du stellst uns von Ansprüchen Dritter frei, die auf deinen Inhalten beruhen.
      </p>

      <h2>9. Nutzungsrechte</h2>
      <p>
        An der für dich erstellten Website erhältst du mit vollständiger Zahlung ein einfaches,
        zeitlich und räumlich unbeschränktes Nutzungsrecht. Du darfst sie bearbeiten, umziehen und
        weiterverwenden. Am Generator, am Editor und an der Software selbst erwirbst du keine Rechte.
      </p>

      <h2>10. Verfügbarkeit</h2>
      <p>
        Wir bemühen uns um einen durchgehenden Betrieb, schulden aber keine bestimmte
        Verfügbarkeit. Wartungsfenster kündigen wir an, soweit möglich.
      </p>

      <h2>11. Haftung</h2>
      <p>
        Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von
        Leben, Körper und Gesundheit. Bei leichter Fahrlässigkeit haften wir nur bei Verletzung
        wesentlicher Vertragspflichten und begrenzt auf den vorhersehbaren, typischen Schaden.
        Eine Haftung für entgangenen Gewinn oder Datenverlust ist ausgeschlossen, soweit
        gesetzlich zulässig. Wir leisten keine Rechtsberatung.
      </p>

      <h2>12. Schlussbestimmungen</h2>
      <p>
        Es gilt deutsches Recht. Ist eine Bestimmung unwirksam, bleibt der übrige Vertrag wirksam.
        Gegenüber Unternehmern ist Gerichtsstand Berlin.
      </p>
    </>} />
  )
}
