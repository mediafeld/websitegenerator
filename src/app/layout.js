import './globals.css'
import { WarenkorbProvider } from '@/lib/warenkorb'
import { WarenkorbPanel } from '@/components/Warenkorb'

export const metadata = {
  title: 'websitegenerator24.de – Deine Website in Minuten',
  description: 'Erstelle professionelle Websites automatisch. Wähle Branche, Design und Inhalte – fertig.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>
        <WarenkorbProvider>
          {children}
          <WarenkorbPanel />
        </WarenkorbProvider>
      </body>
    </html>
  )
}
