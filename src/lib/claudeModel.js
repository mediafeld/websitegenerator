// Zentrale Stelle für das verwendete Claude-Modell.
// Modell-Kette: Wird ein Modell abgeschaltet, nimmt der Code automatisch das nächste.
// Dadurch bricht die Generierung nicht mehr ab, wenn Anthropic ein Modell ablöst.

export const MODEL_CHAIN = [
  'claude-sonnet-5',              // aktuell, bestes Preis/Leistung für Texte
  'claude-sonnet-4-6',           // Rückfall 1
  'claude-haiku-4-5-20251001',   // Rückfall 2 (schnell, günstig)
]

// Ruft die Claude-API auf und probiert bei Modell-Fehlern das nächste Modell.
export async function createMessage(client, params) {
  let lastError = null

  for (const model of MODEL_CHAIN) {
    try {
      return await client.messages.create({ ...params, model })
    } catch (error) {
      lastError = error
      const status = error?.status || error?.statusCode
      const text = `${status || ''} ${error?.message || ''}`
      // Nur bei "Modell nicht gefunden / kein Zugriff" weiterprobieren
      const modelProblem = status === 404 || /not_found|does not exist|unknown model|permission|access|unsupported/i.test(text)
      if (modelProblem) continue
      throw error
    }
  }

  throw lastError || new Error('Kein verfügbares KI-Modell gefunden.')
}
