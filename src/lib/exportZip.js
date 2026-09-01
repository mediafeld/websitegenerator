'use client'
// ── Fertige Website als ZIP herunterladen (Kauf-Paket) ─────────────────────
// Rendert jede Seite exakt wie live (renderPage, forEditor:false) und packt
// alles zusammen mit einem einfachen Mail-Skript in eine ZIP-Datei.
// Seit v27: Schriften, Icons und Animations-Bibliotheken werden als DATEIEN
// mit eingepackt (assets/) – die fertige Website ruft KEINE Google-/CDN-Server
// mehr auf (Datenschutz / Google-Fonts-Abmahnungen). Dazu sitemap.xml,
// robots.txt und die SEO-Angaben aus dem Editor.
import JSZip from 'jszip'
import { renderPage } from './blockRenderer'
import { FONTS } from './fonts'

const mailPhp = (empfaenger) => `<?php
// Kontaktformular-Skript. Die Empfängeradresse steht bereits hier drin —
// sie stammt aus deinen Angaben im Baukasten. Zum Ändern einfach ersetzen:
$empfaenger = '${String(empfaenger || 'info@ihre-domain.de').replace(/'/g, '')}';
header('Content-Type: application/json');
// Honigtopf: Bots füllen das unsichtbare Feld aus -> still verwerfen
if (!empty($_POST['firma_hp'])) { echo json_encode(['ok' => true]); exit; }
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$telefon = trim($_POST['telefon'] ?? '');
$nachricht = trim($_POST['nachricht'] ?? '');
if (!$email || (!$nachricht && !$name)) { echo json_encode(['ok' => false]); exit; }
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { echo json_encode(['ok' => false]); exit; }
$betreff = 'Neue Anfrage über die Website' . ($name ? ' von ' . $name : '');
$text = "Name: $name\nE-Mail: $email\nTelefon: $telefon\n\n$nachricht";
$ok = mail($empfaenger, $betreff, $text, 'From: ' . $empfaenger . "\r\nReply-To: " . $email);
echo json_encode(['ok' => (bool)$ok]);
`

function dateiname(seite) {
  if (seite === 'Startseite' || seite === 'Start' || seite === 'index') return 'index.html'
  return seite.toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '.html'
}

function anleitung(mitAssets, domain) {
  return `IHRE WEBSITE — SO GEHT ES WEITER
================================

1. Alle Dateien und Ordner aus dieser ZIP in das Hauptverzeichnis Ihres
   Webspace laden (per FTP oder über den Datei-Manager Ihres Hosters).
   Wichtig: auch den Ordner "assets" mit hochladen!
2. index.html ist die Startseite.
3. Kontaktformular: Die Datei mail.php ist bereits auf Ihre E-Mail-Adresse
   eingestellt (aus Ihren Angaben im Baukasten). Zum Aendern die Zeile
   $empfaenger = '...' oben in mail.php anpassen.
   Wichtig: mail.php braucht PHP auf dem Hosting. Fehlt PHP, bietet das
   Formular dem Besucher automatisch an, die Nachricht per E-Mail-Programm
   zu senden - es geht also nie eine Anfrage verloren.
   (Der Webspace muss PHP unterstützen — das ist bei fast allen Hostern
   Standard. Falls Ihr Hosting KEIN PHP kann: Das Formular zeigt Besuchern
   dann automatisch Ihre E-Mail-Adresse zum direkten Anschreiben an.)
${mitAssets ? `4. Datenschutz: Schriften und Icons liegen als Dateien in "assets" bei —
   Ihre Website lädt NICHTS von Google- oder fremden Servern nach.
` : `4. Hinweis: Die Schriften konnten beim Erstellen der ZIP nicht mit
   heruntergeladen werden — die Website lädt sie von Google. Laden Sie die
   ZIP bei Gelegenheit einfach erneut herunter.
`}5. Für Google: sitemap.xml und robots.txt liegen bei.${domain ? '' : `
   In beiden Dateien steht "https://www.ihre-domain.de" als Platzhalter —
   ersetzen Sie ihn durch Ihre echte Adresse.`}
6. Fertig! Die Website läuft ohne weitere Technik, ohne Datenbank.

Erstellt mit websitegenerator24.de
`
}

async function ladeText(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error('Download fehlgeschlagen: ' + url)
  return r.text()
}
async function ladeBin(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error('Download fehlgeschlagen: ' + url)
  return r.arrayBuffer()
}

// Google-Fonts-CSS holen, alle Schriftdateien herunterladen und die URLs
// im CSS auf lokale Pfade umschreiben. Liefert true bei Erfolg.
async function fontsEinpacken(zip, font, fontHeadline) {
  const gewichte = (id) => FONTS.find(f => f.id === id)?.google || `${id.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900`
  let fam = `family=${gewichte(font)}`
  if (fontHeadline && fontHeadline !== font) fam += `&family=${gewichte(fontHeadline)}`
  let css = await ladeText(`https://fonts.googleapis.com/css2?${fam}&display=swap`)
  const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]))]
  let i = 0
  for (const u of urls) {
    const endung = (u.match(/\.(woff2|woff|ttf)(\?|$)/) || [])[1] || 'woff2'
    const name = `schrift-${i++}.${endung}`
    zip.file(`assets/fonts/${name}`, await ladeBin(u))
    css = css.split(u).join(`fonts/${name}`)
  }
  zip.file('assets/fonts.css', css)
  return true
}

// Font Awesome lokal: CSS holen, auf woff2 reduzieren, Icon-Schriften laden.
async function fontawesomeEinpacken(zip) {
  const basis = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2'
  let css = await ladeText(`${basis}/css/all.min.css`)
  // Nur die woff2-Quellen behalten (jeder moderne Browser kann woff2)
  css = css.replace(/src:url\([^;}]+(;|\})/g, (seg, ende) => {
    const m = seg.match(/url\((\.\.\/webfonts\/[^)]+\.woff2)\)\s*format\("woff2"\)/)
    return m ? `src:url(${m[1]}) format("woff2")${ende}` : seg
  })
  const dateien = [...new Set([...css.matchAll(/\.\.\/webfonts\/([^)"' ]+\.woff2)/g)].map(m => m[1]))]
  for (const f of dateien) zip.file(`assets/webfonts/${f}`, await ladeBin(`${basis}/webfonts/${f}`))
  css = css.split('../webfonts/').join('webfonts/')
  zip.file('assets/fontawesome.css', css)
  return true
}

// Animations-Bibliotheken (AOS + CountUp) lokal beilegen.
async function animEinpacken(zip) {
  zip.file('assets/aos.css', await ladeText('https://unpkg.com/aos@2.3.1/dist/aos.css'))
  zip.file('assets/aos.js', await ladeText('https://unpkg.com/aos@2.3.1/dist/aos.js'))
  zip.file('assets/countup.js', await ladeText('https://cdnjs.cloudflare.com/ajax/libs/countup.js/2.6.2/countUp.umd.js'))
  return true
}

function sitemapXml(seiten, basisUrl) {
  const heute = new Date().toISOString().slice(0, 10)
  const eintraege = seiten.map(s => `  <url><loc>${basisUrl}/${dateiname(s) === 'index.html' ? '' : dateiname(s)}</loc><lastmod>${heute}</lastmod></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${eintraege}\n</urlset>\n`
}

export async function websiteAlsZip(projekt) {
  const pages = projekt.pages || {}
  const seiten = Object.keys(pages)
  if (!seiten.length) return { error: 'Dieses Projekt hat noch keine generierten Seiten.' }
  const zip = new JSZip()

  const font = projekt.font || 'Inter Tight'
  const fontHeadline = projekt.form_data?.fontHeadline || projekt.font || 'Inter Tight'
  const seoDaten = projekt.form_data?.seo || {}
  const domain = (projekt.domain || '').trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
  const basisUrl = domain ? `https://${domain}` : 'https://www.ihre-domain.de'
  const gemietet = projekt.zahlungsart === 'mieten'
  const kontaktMail = (projekt.form_data?.email || '').trim()
  const kontaktTel = (projekt.form_data?.telefon || '').trim()
  const appBasis = (typeof window !== 'undefined' && window.location?.origin)
    ? window.location.origin
    : 'https://www.websitegenerator24.de'

  // Schriften/Icons/Skripte als Dateien beilegen – bei Netzproblemen
  // greifen automatisch wieder die CDN-Links (Website bleibt funktionsfähig).
  let assetsLokal = false
  try {
    await fontsEinpacken(zip, font, fontHeadline)
    await fontawesomeEinpacken(zip)
    await animEinpacken(zip)
    assetsLokal = true
  } catch (e) { console.warn('Lokale Schriften übersprungen:', e?.message) }

  seiten.forEach(seite => {
    const seiteSeo = seoDaten.seiten?.[seite] || {}
    const html = renderPage({
      blocks: pages[seite],
      seiten, seite,
      palette: projekt.palette,
      font, fontHeadline,
      title: `${projekt.firma || projekt.name || 'Website'} – ${seite}`,
      forEditor: false,
      assetsLokal,
      seo: {
        titel: seiteSeo.titel || '',
        beschreibung: seiteSeo.beschreibung || '',
        ogBild: seoDaten.global?.ogBild || '',
        favicon: seoDaten.global?.favicon || '',
        url: domain ? `${basisUrl}/${dateiname(seite) === 'index.html' ? '' : dateiname(seite)}` : '',
      },
      // Kontaktformular: bei Miete über unseren Server (Kunde muss nichts
      // einrichten), beim Kauf über mail.php auf dem eigenen Hosting.
      // `basis` ist die Adresse DIESER Anwendung – nicht fest verdrahtet,
      // sonst zeigt sie auf eine Domain, die noch gar nicht läuft.
      formular: gemietet
        ? { art: 'server', projekt: projekt.id || '', basis: appBasis, email: kontaktMail, telefon: kontaktTel }
        : { art: 'php', email: kontaktMail, telefon: kontaktTel },
    })
    zip.file(dateiname(seite), html)
  })
  if (!gemietet) zip.file('mail.php', mailPhp(kontaktMail))
  zip.file('sitemap.xml', sitemapXml(seiten, basisUrl))
  zip.file('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${basisUrl}/sitemap.xml\n`)
  zip.file('ANLEITUNG.txt', anleitung(assetsLokal, domain))
  const blob = await zip.generateAsync({ type: 'blob' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${(projekt.firma || projekt.name || 'website').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-website.zip`
  document.body.appendChild(a)
  a.click()
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 800)
  return {}
}
