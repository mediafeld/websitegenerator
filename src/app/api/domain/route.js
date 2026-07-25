import { pruefeDomains } from '@/lib/domainpruefung'
import { toDomainLabel } from '@/lib/inwx'
import { TLD_PREISE, STANDARD_TLDS } from '@/lib/preise'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { name, tlds } = await request.json()

    if (!name || !String(name).trim()) {
      return Response.json({ error: 'Bitte einen Namen eingeben.' }, { status: 400 })
    }

    const label = toDomainLabel(name)
    if (!label || label.length < 3) {
      return Response.json({ error: 'Der Name ist zu kurz für eine Domain (mindestens 3 Zeichen).' }, { status: 400 })
    }

    const gewuenscht = (Array.isArray(tlds) && tlds.length ? tlds : STANDARD_TLDS).slice(0, 20)
    const namen = gewuenscht.map(t => `${label}.${t}`)

    const geprueft = await pruefeDomains(namen)

    const ergebnisse = geprueft.map(e => ({
      ...e,
      preis: TLD_PREISE[e.tld] ?? null,
    }))

    return Response.json({ label, ergebnisse })
  } catch (error) {
    console.error('Domain-Check Fehler:', error?.message)
    return Response.json({
      error: 'Die Domainprüfung ist gerade nicht erreichbar. Du kannst trotzdem starten und die Domain später festlegen.',
      technisch: error?.message || 'unbekannt',
    }, { status: 500 })
  }
}
