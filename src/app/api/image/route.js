// KI-Bildgenerierung über OpenAI DALL-E 3 + WebP-Umwandlung

export async function POST(request) {
  try {
    const { prompt, size } = await request.json()
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

    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1,
        size: imgSize,
        quality: 'standard',
      }),
    })

    const data = await res.json()
    if (data.error) {
      return Response.json({ error: data.error.message || 'Bildgenerierung fehlgeschlagen' }, { status: 500 })
    }

    // Antwort kann b64_json ODER eine URL sein – beides unterstützen
    const item = data.data?.[0] || {}
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
