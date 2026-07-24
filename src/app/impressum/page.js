'use client'
import { Rechtsseite, L } from '@/components/Rechtsseite'

export default function Impressum() {
  return (
    <Rechtsseite titel="Impressum" stand="Juli 2026" kinder={<>
      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        Erkan Terzoglou<br />
        websitegenerator24.de<br />
        Kolonnenstraße 8<br />
        10827 Berlin<br />
        Deutschland
      </p>
      <p>Rechtsform: Gewerbetreibender / Freiberufler (kein Registereintrag)</p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <a href="tel:+493057702366">+49 (0)30 57 70 23 66</a><br />
        E-Mail: <a href="mailto:info@websitegenerator24.de">info@websitegenerator24.de</a>
      </p>

      <h2>Umsatzsteuer-Identifikationsnummer</h2>
      <p>Gemäß § 27 a Umsatzsteuergesetz: DE285640600</p>

      <h2>Verantwortlich für den Inhalt</h2>
      <p>Erkan Terzoglou, Anschrift wie oben</p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2>Haftung für Inhalte</h2>
      <p>
        Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen
        Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte
        fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
        rechtswidrige Tätigkeit hinweisen.
      </p>
      <p>
        Für Websites, die Nutzerinnen und Nutzer mit diesem Dienst erstellen, sind ausschließlich
        diese selbst verantwortlich – insbesondere für Texte, Bilder, Preisangaben, Impressum und
        Datenschutzerklärung der jeweiligen Website. Werden wir auf rechtswidrige Inhalte
        hingewiesen, entfernen wir diese unverzüglich. Hinweise bitte an
        <a href="mailto:info@websitegenerator24.de"> info@websitegenerator24.de</a>.
      </p>

      <h2>Haftung für Links</h2>
      <p>
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen
        Einfluss haben. Für diese fremden Inhalte kann keine Gewähr übernommen werden.
        Verantwortlich ist stets der jeweilige Anbieter der Seiten.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Die durch uns erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
        deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet.
      </p>
    </>} />
  )
}
