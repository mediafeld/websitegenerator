// Zuverlässige Domainprüfung ohne Fremdanbieter.
// Zwei unabhängige Quellen, konservativ ausgewertet:
//   1) DNS  – hat die Domain Nameserver oder eine SOA? Dann ist sie sicher vergeben.
//   2) RDAP – amtliche Abfrage bei der Registrierungsstelle (DENIC, Verisign, …).
// Findet EINE Quelle die Domain, gilt sie als vergeben. Nur wenn keine Quelle
// sie kennt, gilt sie als frei. Damit kann "frei" praktisch nicht falsch sein.

import dns from 'node:dns/promises'

// Amtliche RDAP-Adressen der Registrierungsstellen — von Hand geprüfte, besonders
// gebräuchliche Endungen. Für alle anderen Endungen wird die offizielle IANA-
// Bootstrap-Liste genutzt (siehe ladeBootstrap unten), damit trotzdem eine
// verlässliche amtliche Auskunft möglich ist, ohne jede Endung von Hand zu pflegen.
const RDAP = {
  de: 'https://rdap.denic.de/domain/',
  com: 'https://rdap.verisign.com/com/v1/domain/',
  net: 'https://rdap.verisign.com/net/v1/domain/',
  org: 'https://rdap.publicinterestregistry.org/rdap/domain/',
  info: 'https://rdap.identitydigital.services/rdap/domain/',
  shop: 'https://rdap.gmoregistry.net/rdap/domain/',
  online: 'https://rdap.radix.host/rdap/domain/',
  berlin: 'https://rdap.nic.berlin/v1/domain/',
}

// IANA-Bootstrap: amtliche, von der IANA selbst gepflegte Liste, welche
// Registrierungsstelle für welche Endung zuständig ist. Wird einmal geladen
// und danach für die Laufzeit des Servers zwischengespeichert.
let bootstrapCache = null
let bootstrapLaedt = null
async function ladeBootstrap() {
  if (bootstrapCache) return bootstrapCache
  if (bootstrapLaedt) return bootstrapLaedt
  bootstrapLaedt = (async () => {
    try {
      const stop = new AbortController()
      const uhr = setTimeout(() => stop.abort(), ZEITGRENZE)
      const res = await fetch('https://data.iana.org/rdap/dns.json', { signal: stop.signal })
      clearTimeout(uhr)
      const json = await res.json()
      const karte = {}
      for (const [tlds, urls] of json.services || []) {
        for (const t of tlds) if (urls?.[0]) karte[t.toLowerCase()] = urls[0].replace(/\/$/, '') + '/domain/'
      }
      bootstrapCache = karte
      return karte
    } catch {
      bootstrapCache = {}
      return {}
    }
  })()
  return bootstrapLaedt
}

const ZEITGRENZE = 5000

// Hat die Domain DNS-Einträge? (schnell, sehr verlässlich für "vergeben")
async function dnsBelegt(domain) {
  try {
    const ns = await dns.resolveNs(domain)
    if (ns && ns.length) return true
  } catch { /* weiter */ }
  try {
    const soa = await dns.resolveSoa(domain)
    if (soa) return true
  } catch { /* weiter */ }
  return false
}

// Amtliche Abfrage bei der Registrierungsstelle.
// true = vergeben, false = frei, null = keine Auskunft möglich
async function rdapBelegt(domain) {
  const tld = domain.split('.').pop()
  let basis = RDAP[tld]
  if (!basis) {
    const boot = await ladeBootstrap()
    basis = boot[tld]
  }
  if (!basis) return null

  const stop = new AbortController()
  const uhr = setTimeout(() => stop.abort(), ZEITGRENZE)
  try {
    const res = await fetch(basis + encodeURIComponent(domain), {
      signal: stop.signal,
      headers: { Accept: 'application/rdap+json' },
    })
    if (res.status === 200) return true
    if (res.status === 404) return false
    return null
  } catch {
    return null
  } finally {
    clearTimeout(uhr)
  }
}

// Prüft eine einzelne Domain.
// Ergebnis: { domain, tld, frei, quelle, sicher }
export async function pruefeDomain(domain) {
  const tld = domain.split('.').pop()
  const [imDns, imRdap] = await Promise.all([dnsBelegt(domain), rdapBelegt(domain)])

  // Konservativ: eine positive Fundstelle genügt für "vergeben"
  if (imDns) return { domain, tld, frei: false, quelle: 'DNS', sicher: true }
  if (imRdap === true) return { domain, tld, frei: false, quelle: 'Registry', sicher: true }
  if (imRdap === false) return { domain, tld, frei: true, quelle: 'Registry', sicher: true }

  // Keine Registry-Auskunft und kein DNS: wahrscheinlich frei, aber ohne amtliche Bestätigung
  return { domain, tld, frei: true, quelle: 'DNS', sicher: false }
}

export async function pruefeDomains(namen) {
  return Promise.all(namen.map(pruefeDomain))
}
