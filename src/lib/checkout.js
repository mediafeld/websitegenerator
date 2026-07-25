import { supabase, supabaseBereit } from '@/lib/supabaseClient'

// Startet eine Stripe-Checkout-Session und leitet dorthin weiter.
// Gibt bei Fehlern eine lesbare Meldung zurück, statt nur zu crashen.
export async function starteCheckout({ paketId, modus, projektId, domain }) {
  if (!supabaseBereit) return { error: 'Zahlungen sind gerade nicht verfügbar.' }

  const { data } = await supabase.auth.getSession()
  const accessToken = data?.session?.access_token
  if (!accessToken) return { error: 'Bitte zuerst einloggen.' }

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paketId, modus, projektId, domain, accessToken }),
    })
    const j = await res.json()
    if (j.error) return { error: j.error }
    if (j.url) { window.location.href = j.url; return {} }
    return { error: 'Unerwartete Antwort vom Server.' }
  } catch {
    return { error: 'Verbindung fehlgeschlagen. Bitte nochmal versuchen.' }
  }
}
