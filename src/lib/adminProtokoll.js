// Admin-Protokoll: hält fest, was im Admin passiert (Tabelle admin_protokoll,
// siehe migration_v26.sql). Scheitert still, wenn die Migration fehlt.
import { supabaseAdmin } from './supabaseServer'

export async function protokolliere(aktion, detail) {
  try {
    await supabaseAdmin().from('admin_protokoll').insert({ aktion, detail: detail || null })
  } catch (e) { console.log('[admin-protokoll] übersprungen:', e?.message) }
}
