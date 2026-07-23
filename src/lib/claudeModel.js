// Zentrale Stelle für das verwendete Claude-Modell.
// Modell-Kette: Wird ein Modell abgeschaltet, nimmt der Code automatisch das nächste.
// Dadurch bricht die Generierung nicht mehr ab, wenn Anthropic ein Modell ablöst.

export const MODEL_CHAIN = [
  'claude-sonnet-5',              // aktuell, bestes Preis/Leistung für Texte
  'claude-sonnet-4-6',           // Rückfall 1
  'claude-haiku-4-5-20251001',   // Rückfall 2 (schnell, günstig)
]

// Holt den reinen Text aus der Antwort.
// WICHTIG: Neuere Modelle liefern zuerst einen "thinking"-Block.
// Deshalb nie content[0].text nehmen, sondern ALLE Text-Blöcke zusammenfügen.
export function extractText(message) {
  const blocks = message?.content
  if (!Array.isArray(blocks)) return ''
  return blocks
    .filter(b => b?.type === 'text' && typeof b.text === 'string')
    .map(b => b.text)
    .join('')
    .trim()
}

// Ruft die Claude-API auf.
// - probiert bei Modell-Fehlern das nächste Modell
// - schaltet das "Nachdenken" ab (spart Zeit und Tokens); falls ein Modell
//   diesen Parameter nicht kennt, wird ohne ihn erneut versucht
export async function createMessage(client, params) {
  let lastError = null

  for (const model of MODEL_CHAIN) {
    for (const withThinkingOff of [true, false]) {
      const body = { ...params, model }
      if (withThinkingOff) body.thinking = { type: 'disabled' }

      try {
        return await client.messages.create(body)
      } catch (error) {
        lastError = error
        const status = error?.status || error?.statusCode
        const text = `${status || ''} ${error?.message || ''}`

        // Parameter "thinking" nicht unterstützt -> gleiches Modell ohne ihn probieren
        if (withThinkingOff && /thinking/i.test(text)) continue

        // Modell nicht gefunden / kein Zugriff -> nächstes Modell probieren
        if (status === 404 || /not_found|does not exist|unknown model|permission|unsupported/i.test(text)) break

        throw error
      }
    }
  }

  throw lastError || new Error('Kein verfügbares KI-Modell gefunden.')
}
