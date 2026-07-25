import Stripe from 'stripe'

// Serverseitiger Stripe-Client. STRIPE_SECRET_KEY muss in Vercel gesetzt sein
// (Production + Preview) — nie im Code oder Chat.
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY fehlt in den Umgebungsvariablen.')
  return new Stripe(key, { apiVersion: '2024-06-20' })
}
