import Anthropic from '@anthropic-ai/sdk'
import { generateCIPalette } from '@/lib/colorSystem'
import { getBranche, getBranchenFelder } from '@/lib/branchen'
import { getStockImages } from '@/lib/stockImages'
import { createMessage, extractText } from '@/lib/claudeModel'
import { FONT_PAIRS } from '@/lib/fonts'

import { nutzerAusToken, supabaseAdmin } from '@/lib/supabaseServer'
import { rechtsSeitenSync } from '@/lib/rechtsseiten'

async function nutzungFesthalten(accessToken, art) {
  try {
    const nutzer = await nutzerAusToken(accessToken)
    const db = supabaseAdmin()
    await db.from('nutzung').insert({ user_id: nutzer?.id || null, art, menge: 1 })
  } catch (e) { console.log('[nutzung] übersprungen:', e?.message) }
}

export async function POST(request) {
  try {
    const { formData, accessToken } = await request.json()
    nutzungFesthalten(accessToken, 'ki-text').catch(() => {})
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

    // Adresse aus den einzelnen Wizard-Feldern zusammensetzen (frueher wurde
    // ein nie existierendes formData.adresse gelesen -> Platzhalter-Adresse!)
    const adresse = formData.adresse || [
      formData.strasse,
      [formData.plz, formData.stadt].filter(Boolean).join(' '),
      formData.land && formData.land !== 'Deutschland' ? formData.land : null,
    ].filter(Boolean).join(', ')

    // Schrift-Paar aus dem Wizard uebernehmen (frueher immer 'Inter Tight')
    const fontPaar = FONT_PAIRS.find(p => p.id === formData.fontPair) || null
    const font = formData.font || fontPaar?.body || 'Inter Tight'
    const fontHeadline = formData.fontHeadline || fontPaar?.headline || font

    // Echte Zahlen fuer Statistiken vorbereiten
    const jahr = new Date().getFullYear()
    const gegruendetJahr = parseInt(String(formData.gegruendet || '').replace(/\D/g, '').slice(0, 4), 10)
    const jahreAktiv = gegruendetJahr && gegruendetJahr > 1800 && gegruendetJahr <= jahr ? jahr - gegruendetJahr : null

    const geschaeftsmodell = { b2c: 'Privatkunden (B2C)', b2b: 'Geschaeftskunden (B2B)', beides: 'Privat- und Geschaeftskunden' }[formData.geschaeftsmodell] || formData.geschaeftsmodell || ''
    const einzugsgebiet = { lokal: 'lokal (Stadt und Umgebung)', regional: 'regional', national: 'deutschlandweit', international: 'international' }[formData.einzugsgebiet] || formData.einzugsgebiet || ''

    // Stil-Variante → bevorzugte Block-Varianten
    const stilMap = {
      'dark-elite': { hero: 'h-geist', services: 'services-cards', about: 'about-stats', header: 'header-gradient' },
      'clean-pro': { hero: 'h-bild-rechts', services: 'services-icons', about: 'about-split', header: 'header-light' },
      'bold-center': { hero: 'h-mitte', services: 'services-list', about: 'about-stats', header: 'header-gradient' },
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
Gegruendet: ${formData.gegruendet || 'k.A.'}${jahreAktiv ? ` (das sind ${jahreAktiv} Jahre Erfahrung - Stand ${jahr})` : ''} | Mitarbeiter: ${formData.mitarbeiter || 'k.A.'}
Beschreibung: ${formData.beschreibung || 'Professionelle Dienstleistungen'}
Leistungen: ${formData.leistungen || 'k.A.'}
USPs: ${formData.usps || 'k.A.'}
${formData.geschichte ? `Geschichte & Meilensteine (MUSS auf der Ueber-uns-Seite bzw. im Ueber-uns-Bereich erzaehlt werden, schoen umformuliert): ${formData.geschichte}` : ''}
Auszeichnungen: ${formData.auszeichnungen || 'k.A.'}
Referenzen: ${formData.referenzen || 'k.A.'}
${formData.website ? `Bisherige Website: ${formData.website}` : ''}
${geschaeftsmodell ? `Kundenkreis: ${geschaeftsmodell}` : ''}
${formData.interaktion && formData.interaktion !== 'gemischt' ? `Kundenkontakt: ${formData.interaktion}` : ''}
${einzugsgebiet ? `Einzugsgebiet: ${einzugsgebiet}${formData.staedte ? ` - wichtige Orte: ${formData.staedte} (diese Orte NATUERLICH in Texte einbauen, gut fuer lokale Auffindbarkeit)` : ''}` : ''}

KONTAKT
Telefon: ${formData.telefon || 'k.A.'}
E-Mail: ${formData.email || 'k.A.'}
Adresse: ${adresse || 'k.A.'}
Oeffnungszeiten: ${formData.oeffnung || 'k.A.'}
WICHTIG: Verwende NUR diese echten Kontaktdaten. NIEMALS Adressen, Telefonnummern oder E-Mails erfinden - fehlende Angaben einfach weglassen.

BRANCHEN-DETAILS (${brancheLabel})
${detailText || 'Keine besonderen Angaben'}

TON and STIL
Anrede: ${anrede} - KONSEQUENT in JEDEM Textfeld, auch in Buttons, FAQ-Antworten und Kundenstimmen.
Tonalitaet: ${ton}
${formData.satzlaenge && formData.satzlaenge !== 'gemischt' ? `Satzlaenge: bevorzugt ${formData.satzlaenge === 'kurz' ? 'kurze, knackige Saetze' : 'ausfuehrlichere, fliessende Saetze'}` : ''}
${formData.tiefe && formData.tiefe !== 'ausgewogen' ? `Inhaltstiefe: ${formData.tiefe === 'einfach' ? 'einfach und laienverstaendlich, keine Fachbegriffe' : 'fachlich fundiert, Fachbegriffe erlaubt'}` : ''}
CTA-Stil: ${formData.ctaStil || 'direkt'}
${formData.verboten ? `VERBOTENE Woerter (NIEMALS verwenden): ${formData.verboten}` : ''}

ZIELGRUPPE (Texte gezielt auf diese Menschen zuschneiden)
${formData.altersgruppe ? `Alter: ${formData.altersgruppe}` : ''}
${formData.geschlecht && formData.geschlecht !== 'Alle' ? `Ueberwiegend: ${formData.geschlecht}` : ''}
${formData.bildung ? `Bildungsniveau: ${formData.bildung}` : ''}
${formData.einkommen ? `Einkommen: ${formData.einkommen}` : ''}
${formData.entscheidung && formData.entscheidung !== 'gemischt' ? `Kaufentscheidung: ${formData.entscheidung === 'rational' ? 'eher rational (Fakten, Zahlen, Nutzen betonen)' : 'eher emotional (Gefuehl, Vertrauen, Geschichten betonen)'}` : ''}
${formData.schmerzpunkte ? `Probleme der Zielgruppe (Texte muessen diese aufgreifen und loesen): ${formData.schmerzpunkte}` : ''}
${formData.ziele ? `Ziele der Zielgruppe: ${formData.ziele}` : ''}

MARKE
${formData.markenwerte ? `Werte: ${formData.markenwerte}` : ''}
${formData.vertrauen ? `Vertrauenssignale (prominent einbauen): ${formData.vertrauen}` : ''}
${formData.abgrenzung ? `Abgrenzung vom Wettbewerb (diesen Unterschied klar herausstellen): ${formData.abgrenzung}` : ''}

ECHTE ZAHLEN (fuer stats/highlights/Zahlen-Elemente):
${jahreAktiv ? `- ${jahreAktiv}+ Jahre Erfahrung (aus Gruendungsjahr ${gegruendetJahr})` : ''}
${formData.mitarbeiter ? `- ${formData.mitarbeiter} Mitarbeiter` : ''}
${formData.auszeichnungen ? `- Auszeichnungen: ${formData.auszeichnungen}` : ''}
${formData.referenzen ? `- Referenzen: ${formData.referenzen}` : ''}
REGEL: Statistiken NUR aus diesen echten Angaben ableiten. NIEMALS Zahlen erfinden (kein "500+ Kunden", wenn nichts dazu bekannt ist!). Wenn zu wenige echte Zahlen da sind, stattdessen qualitative Aussagen verwenden ("Meisterbetrieb", "Festpreisgarantie", "100% Handarbeit" nur falls belegt) oder das Zahlen-Element kuerzer halten.

SEO
${formData.seoPrimaer ? `Primaer-Keyword (in Startseiten-H1 + erste Absaetze + mindestens eine Zwischenueberschrift): ${formData.seoPrimaer}` : ''}
${formData.seoSekundaer ? `Sekundaer-Keywords (natuerlich ueber Unterseiten-Ueberschriften und Texte verteilen, KEIN Keyword-Stopfen): ${formData.seoSekundaer}` : ''}

SEITEN: ${seiten.join(', ')}

VERFUEGBARE BLOECKE (Premium-Bausteine bevorzugt verwenden!):
PREMIUM (schoen, animiert - diese ZUERST waehlen):
- media (media-links, media-rechts, media-zickzack, media-gross, media-overlap)
  -> Bild + Text nebeneinander. content: {"tag","title","text","cta","image","punkte":["..."]}
  -> media-zickzack zusaetzlich: {"eintraege":[{"title","text"},{...},{...}]}
- text (text-zentriert, text-zwei, text-zitat, text-akzent, text-highlights)
  -> Reine Textbereiche. content: {"tag","title","text"} | text-zitat: {"zitat","autor"}
  -> text-highlights zusaetzlich: {"highlights":[{"num":"15+","label":"Jahre Erfahrung"}]}
- features (feat-karten, feat-liste-gross, feat-dunkel, feat-split-bild)
  -> content: {"tag","title","items":[{"icon","title","text"}]}
- galerie (gal-masonry, gal-raster, gal-breit) -> {"tag","title","images":["","","","","",""]}
- stimmen (stimmen-gross, stimmen-einzeln)
  -> {"tag","title","items":[{"text","name","rolle"}]} | stimmen-einzeln: {"zitat","name","rolle"}
- cta-plus (ctap-mesh, ctap-band, ctap-karte) -> {"title","text","cta1","cta2"}
- kontakt-plus (kontaktp-split) -> {"tag","title","text","adresse","telefon","email","oeffnung","cta"}
- banner (banner-info, banner-laufband) -> {"text","icon"} | laufband: {"punkte":["...","..."]}
- video (video-breit) -> {"tag","title","videoUrl"}
- trenner (trenner-linie, trenner-akzent, trenner-luft) -> {}
HERO (NUR Startseite): hero-full mit diesen Varianten:
  h-mitte (zentriert, mit Foto-Hintergrund), h-bild-rechts (Text links, Bild rechts), h-bild-links,
  h-foto-unten (Vollbild-Foto), h-wort (riesiges Wort), h-wort-split, h-magazin, h-panel (Werte-Karten),
  h-liste (Haekchenliste), h-bewertung, h-formular (Anfrage-Formular), h-farbhaelfte, h-geist (dunkel, dramatisch),
  h-minimal, h-collage, h-karten-drei, h-mitte-bild
  -> content: {"tag","headline","subline","cta1","cta2","stats":[...]}
KLASSISCH (nur wenn kein Premium-Baustein passt):
- header-slim (header-gradient, header-light) Unterseiten
- services (services-cards, services-list, services-icons)
- about (about-split, about-stats)
- team (team-cards)
- stats (stats-bar)
- faq (faq-accordion)
- menu (menu-cards) NUR bei Restaurant/Cafe - Speisekarte mit Kategorien und Preisen

TEXTMENGE: Jeder Text muss ECHT und AUSFORMULIERT sein. "text"-Felder in media/text-Bloecken
bekommen 3-5 vollstaendige Saetze, keine Stichworte. Lieber zu viel Inhalt als eine leer wirkende Seite.

WICHTIG bei Restaurant: Fuege auf der Startseite ODER einer Speisekarte-Seite einen "menu" Block ein.

ICONS: Bei "services" ist jedes "icon" ein gueltiger Font-Awesome-6-Solid-Name OHNE "fa-" Prefix (z.B. "bolt","bullseye","handshake","shield-halved","clock","phone","star","heart","screwdriver-wrench","scale-balanced","stethoscope","scissors","dumbbell","house","chart-line","users","gem","leaf","truck","wrench","graduation-cap","utensils","car","camera","palette","lightbulb","rocket","lock","gift","calendar-days"). NIEMALS Emojis. Waehle pro Leistung ein thematisch passendes Icon.
Format menu-Block content: {"tag":"Speisekarte","title":"...","kategorien":[{"name":"Vorspeisen","items":[{"name":"...","desc":"...","preis":"9,90 EUR"}]},{"name":"Hauptgerichte","items":[...]}]}
FAQ: Jeder "faq"-Block braucht 4-5 ECHTE, branchenspezifische Fragen mit ausfuehrlichen Antworten (2-3 Saetze, ${anrede}). Niemals leer lassen. Format: {"title":"Haeufige Fragen","items":[{"q":"...","a":"..."},{"q":"...","a":"..."}]}

REGELN:
1. STARTSEITE: Verwende GENAU diese Block-Reihenfolge und Varianten: ${layoutBeschreibung}
2. UNTERSEITEN: Jede Unterseite beginnt mit header-slim (Variante "${stil.header}") und bekommt DANACH zur Seite passende, UNTERSCHIEDLICHE Bloecke:
   - "Leistungen"/"Angebot": features + media + faq + cta-plus
   - "Ueber uns": media + text + team + stimmen
   - "Team": team + text
   - "Galerie": galerie + cta-plus
   - "Preise": features + faq + cta-plus
   - "Kontakt": kontakt-plus + faq
   - "Portfolio": galerie + stimmen
   WICHTIG: Jede Seite MUSS andere Bloecke haben - niemals zwei identische Seiten! Variiere auch die Varianten.
3. Halte dich strikt an die vorgegebene Startseiten-Struktur
4. ALLE Texte: echt, KONSEQUENT in der ${anrede}, Ton "${ton}", branchenspezifisch
5. Nutze die Branchen-Details fuer konkrete Inhalte
6. ${formData.seoPrimaer ? `Baue "${formData.seoPrimaer}" in die Startseiten-H1 ein` : 'Waehle sinnvolle Ueberschriften'}
7. ${formData.geschichte ? 'Die GESCHICHTE des Unternehmens (siehe oben) MUSS vorkommen - auf der Ueber-uns-Seite ausfuehrlich, sonst im Ueber-uns-Bereich der Startseite.' : 'Erzaehle im Ueber-uns-Bereich etwas Konkretes aus den Angaben, keine Floskeln.'}
8. Zahlen-Elemente (stats/highlights) NUR mit den ECHTEN ZAHLEN von oben fuellen.

Gib NUR valides JSON zurueck (kein Markdown). Fuer JEDE Seite einen Eintrag:
{
  "Startseite": { "blocks": [
    {"type":"hero-full","variant":"h-mitte","content":{"tag":"...","headline":"...","subline":"...","cta1":"...","cta2":"...","stats":[{"num":"ECHTE ZAHL laut Angaben","label":"..."},{"num":"...","label":"..."},{"num":"...","label":"..."}]}},
    {"type":"services","variant":"services-cards","content":{"tag":"...","title":"...","subtitle":"...","items":[{"icon":"bolt","title":"...","text":"..."},{"icon":"bullseye","title":"...","text":"..."},{"icon":"handshake","title":"...","text":"..."}]}},
    {"type":"about","variant":"about-stats","content":{"tag":"Ueber uns","title":"...","text1":"...","text2":"...","stats":[{"num":"...","label":"..."},{"num":"...","label":"..."},{"num":"...","label":"..."},{"num":"...","label":"..."}]}},
    {"type":"testimonials","variant":"testi-cards","content":{"title":"...","items":[{"quote":"...","name":"...","role":"..."},{"quote":"...","name":"...","role":"..."},{"quote":"...","name":"...","role":"..."}]}},
    {"type":"cta","variant":"cta-gradient","content":{"title":"...","subtitle":"...","cta1":"...","telefon":"${formData.telefon || ''}"}},
    {"type":"contact","variant":"contact-split","content":{"tag":"Kontakt","title":"...","subtitle":"...","adresse":"${adresse || ''}","telefon":"${formData.telefon || ''}","email":"${formData.email || ''}","oeffnung":"${formData.oeffnung || ''}"}}
  ]}
  ${seiten.filter(s => s !== 'Startseite').map(s => `,"${s}":{"blocks":[...]}`).join('')}
}`

    const message = await createMessage(client, {
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    })

    let jsonText = extractText(message)
    jsonText = jsonText.replace(/^```json\n?/i, '').replace(/^```\n?/i, '').replace(/\n?```$/i, '').trim()

    if (!jsonText) {
      return Response.json({ error: 'Die KI hat keinen Text geliefert. Bitte nochmal versuchen.' }, { status: 500 })
    }

    let pageData
    try { pageData = JSON.parse(jsonText) }
    catch (e) {
      // Antwort war vermutlich abgeschnitten -> retten, was vollständig ist
      const repaired = repairJson(jsonText)
      if (repaired) {
        pageData = repaired
      } else if (message?.stop_reason === 'max_tokens') {
        return Response.json({ error: 'Die Antwort war zu lang und wurde abgeschnitten. Bitte mit weniger Unterseiten erneut versuchen.' }, { status: 500 })
      } else {
        return Response.json({ error: 'Verarbeitungsfehler: ' + e.message }, { status: 500 })
      }
    }

    // NUR echte Angaben uebernehmen – fehlt etwas, greifen die neutralen
    // Baustein-Standards statt einer erfundenen Berliner Platzhalter-Adresse.
    const globalContent = { navLinks }
    if (formData.firmenname) globalContent.firmenname = formData.firmenname
    if (formData.telefon) globalContent.telefon = formData.telefon
    if (formData.email) globalContent.email = formData.email
    if (adresse) globalContent.adresse = adresse
    if (formData.beschreibung) globalContent.beschreibung = formData.beschreibung
    if (formData.oeffnung) globalContent.oeffnung = formData.oeffnung
    if (formData.logo) globalContent.logo = formData.logo

    const pages = {}
    const stock = getStockImages(formData.branche)
    let galleryIdx = 0
    // Blöcke, für die die KI KEINEN echten Text geliefert hat, werden
    // VERWORFEN – sonst erscheinen die neutralen Beispieltexte der Bausteine
    // auf einer echten Kundenseite (und wirken wie falscher Inhalt).
    const LEER_ERLAUBT = new Set(['trenner'])
    const hatText = (v) => typeof v === 'string' ? v.trim().length > 1
      : Array.isArray(v) ? v.some(hatText)
      : (v && typeof v === 'object') ? Object.values(v).some(hatText)
      : false
    Object.entries(pageData).forEach(([seite, data]) => {
      const blocks = (data.blocks || []).filter(b => {
        if (LEER_ERLAUBT.has(b.type)) return true
        const ok = b.content && typeof b.content === 'object' && Object.values(b.content).some(hatText)
        if (!ok) console.log(`[generate] Block ohne Inhalt verworfen: ${seite}/${b.type}`)
        return ok
      }).map(b => {
        const c = { ...(b.content || {}) }
        // Hero: Bild ja – aber NICHT mehr pauschal abdunkeln.
        // Frueher bekam JEDE Hero-Variante dasselbe dunkle Foto-Overlay,
        // dadurch sahen alle generierten Seiten oben gleich aus. Jetzt bekommen
        // nur die dafuer gebauten Varianten einen Vollflaechen-Hintergrund,
        // helle/geteilte Heros behalten ihr eigenes Erscheinungsbild.
        if (b.type === 'hero-full') {
          const dunkleVollflaeche = ['h-foto-unten', 'h-mitte', 'h-geist'].includes(b.variant)
          if (!c.heroImg) c.heroImg = stock.hero
          if (dunkleVollflaeche && !c.bgImg) { c.bgImg = stock.hero; c.bgOverlay = 'rgba(15,23,42,0.62)' }
        }
        // Premium-Bausteine mit Bild versorgen
        if (b.type === 'media' && !c.image) c.image = stock.about
        if (b.type === 'features' && b.variant === 'feat-split-bild' && !c.image) c.image = stock.about
        if (b.type === 'galerie') {
          c.images = (c.images && c.images.length ? c.images : [0,1,2,3,4,5]).map((im, i) => (typeof im === 'string' && im) ? im : stock.gallery[i % stock.gallery.length])
        }
        if (b.type === 'header-slim' && !c.bgImg) { c.bgImg = stock.about; c.bgOverlay = 'rgba(15,23,42,0.6)' }
        if (b.type === 'about' && !c.aboutImg) c.aboutImg = stock.about
        if (b.type === 'gallery') {
          c.images = (c.images && c.images.length ? c.images : [0,1,2,3,4,5]).map((im, i) => (typeof im === 'string' && im) ? im : stock.gallery[i % stock.gallery.length])
        }
        if (b.type === 'team' && Array.isArray(c.members)) {
          c.members = c.members.map((m, i) => ({ ...m, img: m.img || stock.gallery[i % stock.gallery.length] }))
        }
        if (b.type === 'faq') {
          const valid = Array.isArray(c.items) ? c.items.filter(it => (it && ((it.q || '').trim() || (it.a || '').trim()))) : []
          if (valid.length < 3) {
            const fn = formData.firmenname || 'unser Team'
            const ort = formData.stadt || formData.ort || 'unserer Region'
            const tel = formData.telefon || 'telefonisch'
            const du = formData.anrede === 'du'
            c.items = du ? [
              { q: 'Wie kann ich einen Termin vereinbaren?', a: `Am einfachsten erreichst du uns ${formData.telefon ? `unter ${tel}` : 'telefonisch'} oder über das Kontaktformular. Wir melden uns schnellstmöglich bei dir zurück.` },
              { q: `Welche Leistungen bietet ${fn} an?`, a: 'Einen Überblick über unser komplettes Angebot findest du im Bereich Leistungen. Bei individuellen Fragen beraten wir dich gerne persönlich.' },
              { q: 'Wo finde ich euch?', a: `Du findest uns in ${ort}${adresse ? ` (${adresse})` : ''}. Die genaue Anfahrt siehst du im Kontaktbereich.` },
              { q: 'Was kostet ein Erstgespräch?', a: 'Ein erstes Kennenlernen ist unverbindlich. Die genauen Kosten richten sich nach deinem Anliegen – sprich uns einfach an.' },
            ] : [
              { q: 'Wie kann ich einen Termin vereinbaren?', a: `Am einfachsten erreichen Sie uns ${formData.telefon ? `unter ${tel}` : 'telefonisch'} oder über das Kontaktformular. Wir melden uns schnellstmöglich bei Ihnen zurück.` },
              { q: `Welche Leistungen bietet ${fn} an?`, a: 'Einen Überblick über unser komplettes Angebot finden Sie im Bereich Leistungen. Bei individuellen Fragen beraten wir Sie gerne persönlich.' },
              { q: 'Wo finde ich Sie?', a: `Sie finden uns in ${ort}${adresse ? ` (${adresse})` : ''}. Die genaue Anfahrt sehen Sie im Kontaktbereich.` },
              { q: 'Was kostet ein Erstgespräch?', a: 'Ein erstes Kennenlernen ist unverbindlich. Die genauen Kosten richten sich nach Ihrem individuellen Anliegen – sprechen Sie uns einfach an.' },
            ]
          } else { c.items = valid }
          if (!c.title) c.title = 'Häufige Fragen'
        }
        return { ...b, content: c }
      })
      // ONEPAGER: alles liegt auf EINER Seite — die Navigation muss deshalb
      // zu den Abschnitten springen statt auf Unterseiten zu verweisen, die es
      // gar nicht gibt (sonst landet „Kontakt" auf einem 404).
      const einseiter = seiten.length <= 1
      const ANKER_ZU_BLOCK = {
        leistungen: ['services', 'leistungen'], about: ['about'], team: ['team'],
        galerie: ['gallery', 'galerie'], preise: ['pricing', 'preise'],
        speisekarte: ['menu'], kontakt: ['contact', 'kontakt'], faq: ['faq', 'fragen'],
      }
      const ANKER_LABEL = {
        leistungen: 'Leistungen', about: 'Über uns', team: 'Team', galerie: 'Galerie',
        preise: 'Preise', speisekarte: 'Speisekarte', kontakt: 'Kontakt', faq: 'Fragen',
      }
      let seitenNav = navLinks
      if (einseiter) {
        const vorhanden = Object.entries(ANKER_ZU_BLOCK)
          .filter(([, typen]) => blocks.some(b => typen.includes(b.type)))
          .map(([anker]) => ({ label: ANKER_LABEL[anker], href: `#${anker}` }))
        seitenNav = [{ label: 'Start', href: '#' }, ...vorhanden]
      }
      // Der Kontakt-Knopf in der Navigation: beim Onepager Sprungmarke,
      // ohne Kontaktabschnitt gar nicht erst anzeigen.
      const hatKontakt = blocks.some(b => b.type === 'contact' || b.type === 'kontakt')
      const navCtaHref = einseiter ? (hatKontakt ? '#kontakt' : '') : 'kontakt.html'

      pages[seite] = [
        { type: 'nav', variant: 'nav-modern', content: { ...globalContent, navLinks: seitenNav, navCtaHref } },
        ...blocks,
        { type: 'footer', variant: 'footer-modern', content: { ...globalContent, navLinks: seitenNav, footerDesc: formData.beschreibung } },
      ]
    })

    // ── Impressum & Datenschutz als echte Unterseiten ───────────────────────
    // Vollständig dynamisch: nur was der Kunde angelegt hat, wird zur Seite —
    // und nur dann steht der Link im Fußbereich. Vorrang haben die Texte aus
    // dem Baukasten, sonst die aus dem Kundenkonto („Rechtstexte").
    try {
      let rechtstexte = { text_impressum: '', text_datenschutz: '' }
      const nutzer = await nutzerAusToken(accessToken)
      if (nutzer) {
        const { data: profil } = await supabaseAdmin()
          .from('profile').select('text_impressum,text_datenschutz').eq('id', nutzer.id).maybeSingle()
        if (profil) rechtstexte = { ...rechtstexte, ...profil }
      }
      if (formData.textImpressum !== undefined) rechtstexte.text_impressum = formData.textImpressum
      if (formData.textDatenschutz !== undefined) rechtstexte.text_datenschutz = formData.textDatenschutz
      const mitRecht = rechtsSeitenSync(pages, rechtstexte)
      for (const k of Object.keys(mitRecht)) pages[k] = mitRecht[k]
    } catch (e) {
      console.warn('Rechtsseiten übersprungen:', e?.message)
    }

    return Response.json({ pages, palette, font, fontHeadline })
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

// Rettet abgeschnittenes JSON: schneidet an der letzten vollstaendigen Stelle ab
// und schliesst offene Klammern in der richtigen Reihenfolge.
// Ein Durchlauf (schnell auch bei sehr langen Antworten).
function repairJson(text) {
  const stack = []
  const points = []
  let inStr = false, esc = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (esc) { esc = false; continue }
    if (c === '\\') { esc = true; continue }
    if (c === '"') { inStr = !inStr; continue }
    if (inStr) continue

    if (c === '{' || c === '[') stack.push(c)
    else if (c === '}' || c === ']') {
      stack.pop()
      // moeglicher Schnittpunkt: hier endet ein vollstaendiges Element
      points.push({ end: i + 1, open: stack.join('') })
    }
  }

  // von hinten nach vorne versuchen (max. 400 Versuche)
  const tries = Math.min(points.length, 400)
  for (let k = 0; k < tries; k++) {
    const p = points[points.length - 1 - k]
    if (p.end < 30) break
    let candidate = text.slice(0, p.end).replace(/,\s*$/, '')
    let close = ''
    for (let j = p.open.length - 1; j >= 0; j--) close += p.open[j] === '{' ? '}' : ']'
    try {
      const parsed = JSON.parse(candidate + close)
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length) return parsed
    } catch { /* naechster Schnittpunkt */ }
  }
  return null
}
