import './globals.css'

export const metadata = {
  title: 'websitegenerator24.de – Deine Website in Minuten',
  description: 'Erstelle professionelle Websites automatisch. Wähle Branche, Design und Inhalte – fertig.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
