import { createClient } from '@supabase/supabase-js'

// Für serverseitige Routen: prüft ein vom Client mitgeschicktes Zugriffstoken
// und gibt den zugehörigen Nutzer zurück (oder null). Nutzt bewusst nur den
// öffentlichen anon-Key — die Prüfung selbst passiert bei Supabase, nicht hier.
export async function nutzerAusToken(token) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || !token) return null
  const client = createClient(url, key)
  const { data, error } = await client.auth.getUser(token)
  if (error) return null
  return data?.user || null
}

// Admin-Client mit Service-Role-Key — nur serverseitig, umgeht den Zeilenschutz.
// Nötig, damit der Stripe-Webhook (kein eingeloggter Nutzer) Rechnungen/Status
// in die Datenbank schreiben kann. SUPABASE_SERVICE_ROLE_KEY muss in Vercel
// gesetzt sein (Supabase-Dashboard → Project Settings → API → service_role).
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_SERVICE_ROLE_KEY fehlt in den Umgebungsvariablen.')
  return createClient(url, key, { auth: { persistSession: false } })
}
