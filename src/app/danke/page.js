'use client'
// ── Danke-Seite nach dem Bezahlen ──────────────────────────────────────────
// Kauf: sofortiger ZIP-Download der fertigen Website.
// Miete: Info, dass wir Domain/Hosting übernehmen, + Weg ins Konto.
import { Suspense, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { projektLaden } from '@/lib/projekte'
import { websiteAlsZip } from '@/lib/exportZip'
import { Kopf, BASIS_CSS, D } from '@/components/Kopf'
import { Brotkrumen } from '@/components/Brotkrumen'
import { useWarenkorb } from '@/lib/warenkorb'

function DankeInhalt() {
  const router = useRouter()
  const [modus, setModus] = useState('kaufen')
  const [projektId, setProjektId] = useState(null)
  const [projekt, setProjekt] = useState(null)
  const [laedt, setLaedt] = useState(false)
  const [meldung, setMeldung] = useState('')
  const { setzePaket } = useWarenkorb()

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setModus(p.get('modus') === 'mieten' ? 'mieten' : 'kaufen')
    const id = p.get('projekt')
    // Bezahltes Paket aus dem Warenkorb nehmen — sonst steht es dort weiter,
    // obwohl die Website längst gekauft/gebucht ist.
    try { setzePaket(null) } catch {}
    if (id) {
      setProjektId(id)
      projektLaden(id).then(pr => {
        setProjekt(pr)
        // Die Datenbank ist die Wahrheit — nicht der Adresszeilen-Parameter.
        if (pr?.zahlungsart === 'mieten' || pr?.zahlungsart === 'kaufen') setModus(pr.zahlungsart)
      })
    }
  }, [])

  async function herunterladen() {
    setLaedt(true); setMeldung('')
    let voll = projekt
    if (!voll && projektId) voll = await projektLaden(projektId)
    if (!voll) { setMeldung('Bitte kurz einloggen – dann startet der Download im Kundenkonto.'); setLaedt(false); return }
    const r = await websiteAlsZip(voll)
    if (r?.error) setMeldung(r.error)
    setLaedt(false)
  }

  const kauf = modus === 'kaufen'
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: BASIS_CSS }} />
      <Kopf />
      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '0 14px' }}>
        <Brotkrumen pfad={[['Start', '/'], ['Kasse'], ['Danke']]} />
      </div>
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '50px 18px', fontFamily: '"Inter Tight",sans-serif' }}>
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#1F9D5514', border: '2px solid #1F9D55', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
            <i className="fa-solid fa-check" style={{ fontSize: 34, color: '#1F9D55' }} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,38px)', fontWeight: 300, letterSpacing: '-0.02em', color: '#0f172a', margin: '0 0 10px' }}>Vielen Dank – <b style={{ fontWeight: 800 }}>Zahlung eingegangen!</b></h1>
          {kauf ? (
            <>
              <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, marginBottom: 26 }}>
                Deine Website gehört jetzt dir. Lade sie als ZIP herunter – darin liegen alle Seiten als fertige HTML-Dateien, das Kontaktformular-Skript und eine kurze Anleitung fürs Hochladen bei deinem Hoster.
              </p>
              <button onClick={herunterladen} disabled={laedt} style={{ background: '#1F9D55', color: '#fff', border: 'none', borderRadius: 12, padding: '16px 34px', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', opacity: laedt ? .7 : 1 }}>
                <i className={`fa-solid fa-${laedt ? 'spinner fa-spin' : 'file-zipper'}`} style={{ marginRight: 9 }} aria-hidden="true" />{laedt ? 'Wird gepackt…' : 'Website als ZIP herunterladen'}
              </button>
              <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 12 }}>Der Download steht dir jederzeit auch im Kundenkonto zur Verfügung.</div>
            </>
          ) : (
            <>
              <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, marginBottom: 26 }}>
                Wir kümmern uns jetzt um <b>Domain, Hosting und SSL</b> und melden uns, sobald deine Website online ist. Bis dahin (und danach) kannst du sie jederzeit weiter bearbeiten.
              </p>
              <button onClick={() => router.push('/dashboard')} style={{ background: D?.blau || '#1d4ed8', color: '#fff', border: 'none', borderRadius: 12, padding: '16px 34px', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                <i className="fa-solid fa-arrow-right" style={{ marginRight: 9 }} aria-hidden="true" />Zum Kundenkonto
              </button>
            </>
          )}
          {meldung && <div style={{ marginTop: 14, fontSize: 13, color: '#b45309' }}>{meldung}</div>}
          <div style={{ marginTop: 30, fontSize: 13, color: '#94a3b8' }}>
            Eine Bestätigung ist unterwegs an deine E-Mail-Adresse. Fragen? <a href="/kontakt" style={{ color: D?.blau || '#1d4ed8', fontWeight: 700 }}>Wir helfen sofort.</a>
          </div>
        </div>
      </div>
    </>
  )
}

export default function DankeSeite() {
  return <Suspense fallback={null}><DankeInhalt /></Suspense>
}
