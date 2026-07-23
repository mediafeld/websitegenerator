// Verbindung zur INWX-Domain-API (JSON-RPC).
// INWX_ENV steuert, welches System benutzt wird:
//   'ote'  = Testsystem (nichts wird berechnet, nichts wird echt registriert)
//   'live' = Echtsystem
// Zugangsdaten kommen aus den Umgebungsvariablen INWX_USER / INWX_PASSWORD.

const ENDPOINTS = {
  ote: 'https://api.ote.domrobot.com/jsonrpc/',
  live: 'https://api.domrobot.com/jsonrpc/',
}

// Verkaufspreise pro Jahr (was DEIN Kunde zahlt) – hier anpassen.
// Einkaufspreise siehst du im INWX-Konto unter Domain -> Preisliste.
export const TLD_PREISE = {
  de: 14.90,
  com: 24.90,
  eu: 19.90,
  net: 24.90,
  org: 24.90,
  info: 24.90,
  shop: 29.90,
  online: 29.90,
}

// Endungen, die im Wizard geprüft werden (Reihenfolge = Anzeigereihenfolge)
export const STANDARD_TLDS = ['de', 'com', 'eu', 'net']

export function inwxEnv() {
  return process.env.INWX_ENV === 'live' ? 'live' : 'ote'
}

// Firmenname -> sauberer Domain-Name (Umlaute, Sonderzeichen, Leerzeichen)
export function toDomainLabel(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, '-und-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 63)
}

// Ein JSON-RPC-Aufruf. cookie wird für die Sitzung mitgegeben.
async function rpc(method, params = {}, cookie = '') {
  const url = ENDPOINTS[inwxEnv()]

  let res
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify({ method, params }),
    })
  } catch (e) {
    throw new Error(`INWX ist nicht erreichbar (${url}). Technisch: ${e?.message || 'Verbindungsfehler'}`)
  }

  const setCookies = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : [res.headers.get('set-cookie')].filter(Boolean)

  let data = null
  try { data = await res.json() } catch { /* kein JSON */ }

  return {
    ok: data?.code === 1000,
    code: data?.code,
    msg: data?.msg || data?.reason || 'Unbekannte Antwort von INWX',
    resData: data?.resData || null,
    cookie: (setCookies || []).map(c => String(c).split(';')[0]).join('; '),
  }
}

// Anmelden und Sitzungs-Cookie zurückgeben
export async function inwxLogin() {
  const user = process.env.INWX_USER
  const pass = process.env.INWX_PASSWORD
  if (!user || !pass) {
    throw new Error('INWX-Zugangsdaten fehlen. Bitte INWX_USER und INWX_PASSWORD bei Vercel eintragen.')
  }

  const out = await rpc('account.login', { user, pass, lang: 'de' })
  if (!out.ok) {
    if (out.code === 2200) {
      throw new Error('INWX-Zugangsdaten stimmen nicht. Prüfe INWX_USER und INWX_PASSWORD bei Vercel – der Benutzername ist das, womit du sich bei ote.inwx.de einloggst (E-Mail, Kundennummer oder Benutzername).')
    }
    throw new Error(`INWX-Anmeldung fehlgeschlagen (${out.code || '-'}): ${out.msg}`)
  }

  // Zwei-Faktor aktiv? Dann kann die Website sich nicht anmelden.
  const tfa = out.resData?.tfa
  if (tfa && tfa !== '0') {
    throw new Error('Für dieses INWX-Konto ist die Zwei-Faktor-Anmeldung aktiv. Für den API-Zugang bitte ein Konto ohne Zwei-Faktor verwenden.')
  }

  if (!out.cookie) throw new Error('INWX hat keine Sitzung zurückgegeben.')
  return out.cookie
}

// Verfügbarkeit prüfen. Gibt eine Liste zurück:
// [{ domain, tld, frei, status, preis }]
export async function checkDomains(label, tlds = STANDARD_TLDS) {
  const clean = toDomainLabel(label)
  if (!clean) return []

  const namen = tlds.map(t => `${clean}.${t}`)
  const cookie = await inwxLogin()
  const out = await rpc('domain.check', { domain: namen, wide: 1 }, cookie)

  if (!out.ok) throw new Error(`Domainprüfung fehlgeschlagen (${out.code || '-'}): ${out.msg}`)

  const liste = out.resData?.domain || []

  return namen.map(name => {
    const tld = name.split('.').pop()
    const treffer = liste.find(d => (d.domain || '').toLowerCase() === name) || {}
    // INWX liefert avail (1/0) und/oder status ('free'/'occupied')
    const status = String(treffer.status || '').toLowerCase()
    const frei = treffer.avail === 1 || treffer.avail === '1' || status === 'free' || status === 'available'

    return {
      domain: name,
      tld,
      frei: !!frei,
      status: status || (frei ? 'free' : 'unbekannt'),
      preis: TLD_PREISE[tld] ?? null,
    }
  })
}
