// KI-Bildgenerierung über OpenAI DALL-E 3 + WebP-Umwandlung

import { nutzerAusToken, supabaseAdmin } from '@/lib/supabaseServer'

// Nutzung serverseitig festhalten (Tabelle "nutzung", siehe migration_v26.sql).
// Scheitert still, wenn Migration/Schlüssel fehlen – Generierung läuft weiter.
async function nutzungFesthalten(accessToken, art) {
  try {
    const nutzer = await nutzerAusToken(accessToken)
    const db = supabaseAdmin()
    await db.from('nutzung').insert({ user_id: nutzer?.id || null, art, menge: 1 })
  } catch (e) { console.log('[nutzung] übersprungen:', e?.message) }
}

export async function POST(request) {
  try {
    const { prompt, size, accessToken } = await request.json()
    if (!prompt) return Response.json({ error: 'Kein Prompt angegeben' }, { status: 400 })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return Response.json({ error: 'Bildgenerierung ist nicht konfiguriert.' }, { status: 500 })

    const sizeMap = {
      square: '1024x1024',
      landscape: '1792x1024',
      portrait: '1024x1792',
    }
    const imgSize = sizeMap[size] || '1024x1024'

    const fullPrompt = `Professional high-quality photograph for a business website. ${prompt}. Clean, modern, well-lit, photorealistic, no text, no watermarks, no logos.`

    // Modell-Kette: zuerst modernes Modell, dann Rückfall – je nach Zugang des API-Keys
    const sizeGpt = { square: '1024x1024', landscape: '1536x1024', portrait: '1024x1536' }
    const attempts = [
      { model: 'gpt-image-1', prompt: fullPrompt, n: 1, size: sizeGpt[size] || '1024x1024', quality: 'medium' },
      { model: 'dall-e-3', prompt: fullPrompt, n: 1, size: imgSize, quality: 'standard' },
      { model: 'dall-e-2', prompt: fullPrompt, n: 1, size: '1024x1024' },
    ]

    let item = null, lastError = 'Bildgenerierung fehlgeschlagen'
    for (const body of attempts) {
      try {
        const res = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (data.error) {
          lastError = data.error.message || lastError
          // Bei Modell-/Zugriffsfehler nächstes Modell versuchen, sonst abbrechen
          if (/model|exist|access|not have|permission|unsupported|unknown|verif/i.test(lastError)) continue
          return Response.json({ error: lastError }, { status: 500 })
        }
        if (data.data?.[0]) { item = data.data[0]; break }
      } catch (e) { lastError = e.message }
    }
    if (!item) return Response.json({ error: lastError }, { status: 500 })

    let pngBuffer
    if (item.b64_json) {
      pngBuffer = Buffer.from(item.b64_json, 'base64')
    } else if (item.url) {
      const imgRes = await fetch(item.url)
      pngBuffer = Buffer.from(await imgRes.arrayBuffer())
    } else {
      return Response.json({ error: 'Kein Bild erhalten' }, { status: 500 })
    }

    // PNG -> WebP umwandeln (kleiner, schneller)
    try {
      const sharp = (await import('sharp')).default
      const webpBuffer = await sharp(pngBuffer)
        .webp({ quality: 82 })
        .toBuffer()
      const webpB64 = webpBuffer.toString('base64')
      await nutzungFesthalten(accessToken, 'ki-bild')
    return Response.json({ image: `data:image/webp;base64,${webpB64}`, format: 'webp' })
    } catch (sharpErr) {
      // Falls sharp nicht verfügbar: PNG zurückgeben
      console.error('WebP conversion failed, returning PNG:', sharpErr)
      return Response.json({ image: `data:image/png;base64,${pngBuffer.toString('base64')}`, format: 'png' })
    }
  } catch (error) {
    console.error('Image error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
