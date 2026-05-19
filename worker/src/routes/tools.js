import { Hono } from 'hono'

export const toolsRoutes = new Hono()

function extractUID(input) {
  input = input.trim()
  if (/^\d+$/.test(input)) return input
  const patterns = [/facebook\.com\/profile\.php\?id=(\d+)/, /facebook\.com\/(\d+)/, /fb\.com\/(\d+)/]
  for (const p of patterns) { const m = input.match(p); if (m) return m[1] }
  const u = input.match(/facebook\.com\/([a-zA-Z0-9.]+)/)
  return u ? u[1] : input
}

async function checkAccount(raw) {
  const uid = extractUID(raw)
  try {
    const graphRes = await fetch(`https://graph.facebook.com/${uid}/picture?redirect=false`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const graphData = await graphRes.json()
    if (graphData.data?.url) return { input: raw, uid, status: 'live', avatar: graphData.data.is_silhouette ? null : graphData.data.url }

    const idRes = await fetch(`https://graph.facebook.com/${uid}`, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const idData = await idRes.json()
    if (idData.id || idData.name) return { input: raw, uid, status: 'live', avatar: null }
    if (idData.error?.message?.includes('Unsupported get request')) return { input: raw, uid, status: 'live', avatar: null }

    return { input: raw, uid, status: 'die', avatar: null }
  } catch {
    return { input: raw, uid, status: 'error', avatar: null }
  }
}

toolsRoutes.post('/checklive', async (c) => {
  const { accounts } = await c.req.json()
  if (!accounts) return c.json({ error: 'Vui lòng nhập tài khoản cần kiểm tra.' }, 400)

  const list = Array.isArray(accounts) ? accounts : accounts.split('\n').map(s => s.trim()).filter(Boolean)
  if (list.length === 0) return c.json({ error: 'Danh sách trống.' }, 400)
  if (list.length > 50) return c.json({ error: 'Tối đa 50 tài khoản mỗi lần.' }, 400)

  const results = []
  for (let i = 0; i < list.length; i += 5) {
    const batchResults = await Promise.all(list.slice(i, i + 5).map(checkAccount))
    results.push(...batchResults)
  }

  return c.json({ results, summary: { total: results.length, live: results.filter(r => r.status === 'live').length, die: results.filter(r => r.status === 'die').length } })
})
