import Anthropic from '@anthropic-ai/sdk'
import { generateCIPalette } from '@/lib/colorSystem'
import { getBranche, getBranchenFelder } from '@/lib/branchen'

export async function POST(request) {
  try {
    const { formData } = await request.json()
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const branche = getBranche(formData.branche)
    const brancheLabel = formData.branche === 'andere' && formData.brancheCustom ? formData.brancheCustom : branche.label
    const palette = generateCIPalette(formData.farbe || '#1d4ed8')
    const seiten = formData.seiten || ['Startseite', 'Kontakt']
    const navLinks = seiten.map(s => ({ label: s, href: pageFile(s) }))

    const bFelder = getBranchenFelder(formData.branche)
    const details = formData.brancheDetails || {}
    const detailText = bFelder.felder.map(f => {
      const v = details[f.key]
      if (!v) return null
      if (f.type === 'check') return v ? `${f.label}: Ja` : null
      return `${f.label}: ${v}`
    }).filter(Boolean).join('\n')

    const anrede = formData.anrede === 'du' ? 'Du-Form (locker, persoenlich)' : 'Sie-Form (professionell, hoeflich)'
    const ton = formData.tonCustom || formData.tonPreset || 'professionell'

    // Stil-Variante → bevorzugte Block-Varianten
    const stilMap = {
      'dark-elite': { hero: 'hero-gradient', services: 'services-cards', about: 'about-stats', header: 'header-gradient' },
      'clean-pro': { hero: 'hero-split', services: 'services-icons', about: 'about-split', header: 'header-light' },
      'bold-center': { hero: 'hero-center', services: 'services-list', about: 'about-stats', header: 'header-gradient' },
    }
    const stil = stilMap[formData.stilVariante] || stilMap['dark-elite']

    // Gewähltes Layout (Block-Reihenfolge der Startseite)
    const layoutBlocks = formData.layoutBlocks || [
      { type: 'hero-full', variant: stil.hero },
      { type: 'services', variant: stil.services },
      { type: 'about', variant: stil.about },
      { type: 'testimonials', variant: 'testi-cards' },
      { type: 'cta', variant: 'cta-gradient' },
      { type: 'contact', variant: 'contact-split' },
    ]
    const layoutBeschreibung = layoutBlocks.map(b => `${b.type} (Variante ${b.variant})`).join(' -> ')

    const prompt = `Du bist ein erstklassiger Webdesigner und Werbetexter. Erstelle den kompletten Inhalt fuer eine Website.

UNTERNEHMEN
Firma: ${formData.firmenname || 'Muster GmbH'}
Branche: ${brancheLabel}
Gegruendet: ${formData.gegruendet || 'k.A.'} | Mitarbeiter: ${formData.mitarbeiter || 'k.A.'}
Beschreibung: ${formData.beschreibung || 'Professionelle Dienstleistungen'}
Leistungen: ${formData.leistungen || 'k.A.'}
USPs: ${formData.usps || 'k.A.'}
Auszeichnungen: ${formData.auszeichnungen || 'k.A.'}
Referenzen: ${formData.referenzen || 'k.A.'}

KONTAKT
Telefon: ${formData.telefon || '+49 30 1234567'}
E-Mail: ${formData.email || 'info@beispiel.de'}
Adresse: ${formData.adresse || 'Musterstr. 1, 10115 Berlin'}
Oeffnungszeiten: ${formData.oeffnung || 'Mo-Fr: 9-18 Uhr'}

BRANCHEN-DETAILS (${brancheLabel})
${detailText || 'Keine besonderen Angaben'}

TON and STIL
Anrede: ${anrede}
Tonalitaet: ${ton}
CTA-Stil: ${formData.ctaStil || 'direkt'}
${formData.verboten ? `VERBOTENE Woerter (NIEMALS verwenden): ${formData.verboten}` : ''}

ZIELGRUPPE
${formData.altersgruppe ? `Alter: ${formData.altersgruppe}` : ''}
${formData.schmerzpunkte ? `Probleme: ${formData.schmerzpunkte}` : ''}
${formData.ziele ? `Ziele: ${formData.ziele}` : ''}

MARKE
${formData.markenwerte ? `Werte: ${formData.markenwerte}` : ''}
${formData.vertrauen ? `Vertrauenssignale: ${formData.vertrauen}` : ''}

SEO
${formData.seoPrimaer ? `Primaer-Keyword (in H1 + erste Absaetze): ${formData.seoPrimaer}` : ''}
${formData.seoSekundaer ? `Sekundaer-Keywords: ${formData.seoSekundaer}` : ''}

SEITEN: ${seiten.join(', ')}

VERFUEGBARE BLOECKE:
- hero-full (hero-gradient, hero-split, hero-center) NUR Startseite
- header-slim (header-gradient, header-light) Unterseiten
- services (services-cards, services-list, services-icons)
- about (about-split, about-stats)
- team (team-cards)
- testimonials (testi-cards)
- stats (stats-bar)
- cta (cta-gradient)
- gallery (gallery-grid)
- faq (faq-accordion)
- contact (contact-split)
- menu (menu-cards) NUR bei Restaurant/Cafe - Speisekarte mit Kategorien und Preisen

WICHTIG bei Restaurant: Fuege auf der Startseite ODER einer Speisekarte-Seite einen "menu" Block ein.
Format menu-Block content: {"tag":"Speisekarte","title":"...","kategorien":[{"name":"Vorspeisen","items":[{"name":"...","desc":"...","preis":"9,90 EUR"}]},{"name":"Hauptgerichte","items":[...]}]}

REGELN:
1. STARTSEITE: Verwende GENAU diese Block-Reihenfolge und Varianten: ${layoutBeschreibung}
2. UNTERSEITEN: header-slim (Variante "${stil.header}") + thematisch passende Bloecke (NIE hero-full!)
3. Halte dich strikt an die vorgegebene Startseiten-Struktur
4. ALLE Texte: echt, ${anrede}, Ton "${ton}", branchenspezifisch
5. Nutze die Branchen-Details fuer konkrete Inhalte
6. ${formData.seoPrimaer ? `Baue "${formData.seoPrimaer}" in die Startseiten-H1 ein` : 'Waehle sinnvolle Ueberschriften'}

Gib NUR valides JSON zurueck (kein Markdown). Fuer JEDE Seite einen Eintrag:
{
  "Startseite": { "blocks": [
    {"type":"hero-full","variant":"hero-gradient","content":{"tag":"...","headline":"...","subline":"...","cta1":"...","cta2":"...","stats":[{"num":"15+","label":"Jahre"},{"num":"500+","label":"Kunden"},{"num":"100%","label":"Zufrieden"}]}},
    {"type":"services","variant":"services-cards","content":{"tag":"...","title":"...","subtitle":"...","items":[{"icon":"zap","title":"...","text":"..."},{"icon":"target","title":"...","text":"..."},{"icon":"handshake","title":"...","text":"..."}]}},
    {"type":"about","variant":"about-stats","content":{"tag":"Ueber uns","title":"...","text1":"...","text2":"...","stats":[{"num":"...","label":"..."},{"num":"...","label":"..."},{"num":"...","label":"..."},{"num":"...","label":"..."}]}},
    {"type":"testimonials","variant":"testi-cards","content":{"title":"...","items":[{"quote":"...","name":"...","role":"..."},{"quote":"...","name":"...","role":"..."},{"quote":"...","name":"...","role":"..."}]}},
    {"type":"cta","variant":"cta-gradient","content":{"title":"...","subtitle":"...","cta1":"...","telefon":"${formData.telefon || ''}"}},
    {"type":"contact","variant":"contact-split","content":{"tag":"Kontakt","title":"...","subtitle":"...","adresse":"${formData.adresse || ''}","telefon":"${formData.telefon || ''}","email":"${formData.email || ''}","oeffnung":"${formData.oeffnung || ''}"}}
  ]}
  ${seiten.filter(s => s !== 'Startseite').map(s => `,"${s}":{"blocks":[...]}`).join('')}
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    })

    let jsonText = message.content[0]?.text || ''
    jsonText = jsonText.replace(/^```json\n?/i, '').replace(/^```\n?/i, '').replace(/\n?```$/i, '').trim()

    let pageData
    try { pageData = JSON.parse(jsonText) }
    catch (e) { return Response.json({ error: 'Verarbeitungsfehler: ' + e.message }, { status: 500 }) }

    const globalContent = {
      firmenname: formData.firmenname || 'Muster GmbH',
      telefon: formData.telefon || '+49 30 1234567',
      email: formData.email || 'info@beispiel.de',
      adresse: formData.adresse || 'Musterstr. 1, 10115 Berlin',
      beschreibung: formData.beschreibung || '',
      oeffnung: formData.oeffnung || 'Mo-Fr: 9-18 Uhr',
      navLinks,
      logo: formData.logo || null,
    }

    const pages = {}
    Object.entries(pageData).forEach(([seite, data]) => {
      pages[seite] = [
        { type: 'nav', variant: 'nav-modern', content: { ...globalContent } },
        ...(data.blocks || []),
        { type: 'footer', variant: 'footer-modern', content: { ...globalContent, footerDesc: formData.beschreibung } },
      ]
    })

    return Response.json({ pages, palette, font: formData.font || 'Inter Tight' })
  } catch (error) {
    console.error('Generate error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

function pageFile(seite) {
  if (seite === 'Startseite') return 'index.html'
  const map = { 'Ueber uns': 'ueber-uns.html', 'Über uns': 'ueber-uns.html', 'Leistungen': 'leistungen.html', 'Kontakt': 'kontakt.html', 'Team': 'team.html', 'Portfolio': 'portfolio.html', 'Galerie': 'galerie.html', 'Preise': 'preise.html', 'Blog': 'blog.html' }
  return map[seite] || seite.toLowerCase().replace(/\s+/g, '-').replace(/ü/g,'ue').replace(/ä/g,'ae').replace(/ö/g,'oe') + '.html'
}
