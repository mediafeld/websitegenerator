import Anthropic from '@anthropic-ai/sdk'
import { createMessage } from '@/lib/claudeModel'

export async function POST(request) {
  try {
    const { message, formData } = await request.json()
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const msg = await createMessage(client, {
      max_tokens: 500,
      system: `Du bist ein freundlicher Support-Helfer für einen Website-Editor. Hilf dem Nutzer kurz und konkret. Firma: ${formData?.firmenname || 'unbekannt'}. Antworte auf Deutsch, maximal 3 Sätze. Erwähne niemals Claude, KI-Modelle, Figma oder technische Details.`,
      messages: [{ role: 'user', content: message }],
    })

    return Response.json({ reply: msg.content[0]?.text || 'Wie kann ich helfen?' })
  } catch (error) {
    return Response.json({ reply: 'Entschuldigung, gerade nicht erreichbar. Versuch es gleich nochmal.' })
  }
}
