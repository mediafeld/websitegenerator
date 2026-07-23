'use client'
import { supabase, supabaseBereit } from '@/lib/supabaseClient'

// Ist jemand angemeldet? Gibt den Nutzer oder null zurück.
export async function aktuellerNutzer() {
  if (!supabaseBereit) return null
  const { data } = await supabase.auth.getSession()
  return data?.session?.user || null
}

// Neues Projekt anlegen. Gibt die neue ID zurück.
export async function projektAnlegen({ name, firma, branche, form_data, pages, palette, font }) {
  const user = await aktuellerNutzer()
  if (!user) return null

  const { data, error } = await supabase
    .from('projekte')
    .insert({
      user_id: user.id,
      name: name || firma || 'Neue Website',
      firma: firma || null,
      branche: branche || null,
      status: 'entwurf',
      form_data: form_data || null,
      pages: pages || null,
      palette: palette || null,
      font: font || null,
    })
    .select('id')
    .single()

  if (error) { console.warn('Projekt anlegen fehlgeschlagen:', error.message); return null }
  return data?.id || null
}

// Bestehendes Projekt aktualisieren.
export async function projektSpeichern(id, felder) {
  if (!id) return false
  const user = await aktuellerNutzer()
  if (!user) return false

  const { error } = await supabase
    .from('projekte')
    .update(felder)
    .eq('id', id)

  if (error) { console.warn('Speichern fehlgeschlagen:', error.message); return false }
  return true
}

// Projekt laden.
export async function projektLaden(id) {
  if (!id) return null
  const user = await aktuellerNutzer()
  if (!user) return null

  const { data, error } = await supabase
    .from('projekte')
    .select('*')
    .eq('id', id)
    .single()

  if (error) { console.warn('Laden fehlgeschlagen:', error.message); return null }
  return data
}

// Projekt-ID aus der Adresse lesen (?projekt=...)
export function projektIdAusUrl() {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('projekt')
}
