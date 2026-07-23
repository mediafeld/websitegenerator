import { checkDomains, toDomainLabel, inwxEnv, STANDARD_TLDS } from '@/lib/inwx'

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

    const gewuenscht = Array.isArray(tlds) && tlds.length ? tlds : STANDARD_TLDS
    const ergebnisse = await checkDomains(label, gewuenscht)

    return Response.json({
      label,
      testmodus: inwxEnv() === 'ote',
      ergebnisse,
    })
  } catch (error) {
    console.error('Domain-Check Fehler:', error?.message)
    return Response.json({ error: error?.message || 'Domainprüfung nicht möglich.' }, { status: 500 })
  }
}
