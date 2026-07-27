import { istAdmin } from '@/lib/adminAuth'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { renderPage } from '@/lib/blockRenderer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Rendert die generierte Website eines Kunden exakt wie live – als
// HTML-Antwort zum direkten Ansehen im Admin (neuer Tab).
export async function GET(req) {
  if (!istAdmin(req)) return new Response('Kein Zugriff.', { status: 401 })
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const seiteWunsch = url.searchParams.get('seite')
    if (!id) return new Response('id fehlt.', { status: 400 })
    const db = supabaseAdmin()
    const { data: p, error } = await db.from('projekte').select('*').eq('id', id).maybeSingle()
    if (error || !p) return new Response('Projekt nicht gefunden.', { status: 404 })
    const pages = p.pages || {}
    const seiten = Object.keys(pages)
    if (!seiten.length) return new Response('Dieses Projekt hat noch keine generierten Seiten.', { status: 200 })
    const seite = seiten.includes(seiteWunsch) ? seiteWunsch : seiten[0]
    const leiste = `<div style="position:fixed;bottom:0;left:0;right:0;z-index:2147483000;background:#0f172a;color:#fff;font:600 12px sans-serif;padding:8px 14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
      <span style="opacity:.7">ADMIN-VORSCHAU · ${String(p.firma || p.name || '').replace(/</g, '&lt;')}</span>
      ${seiten.map(s => `<a href="?id=${id}&seite=${encodeURIComponent(s)}" style="color:${s === seite ? '#4ade80' : '#93c5fd'};text-decoration:none;">${s.replace(/</g, '&lt;')}</a>`).join('')}
    </div>`
    const seoDaten = p.form_data?.seo || {}
    const html = renderPage({
      blocks: pages[seite], palette: p.palette, font: p.font || 'Inter Tight',
      fontHeadline: p.form_data?.fontHeadline || p.font || 'Inter Tight',
      title: `ADMIN – ${seite}`, forEditor: false,
      seo: { titel: seoDaten.seiten?.[seite]?.titel ? `ADMIN – ${seoDaten.seiten[seite].titel}` : '', beschreibung: seoDaten.seiten?.[seite]?.beschreibung || '', favicon: seoDaten.global?.favicon || '' },
    }).replace('</body>', leiste + '</body>')
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' } })
  } catch (e) {
    return new Response(`Vorschau fehlgeschlagen (${e?.message || e}).`, { status: 500 })
  }
}
