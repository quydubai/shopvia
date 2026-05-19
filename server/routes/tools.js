import { Router } from 'express'

const router = Router()

// Extract UID from various Facebook URL formats
function extractUID(input) {
  input = input.trim()
  // Pure number
  if (/^\d+$/.test(input)) return input
  // URL formats
  const patterns = [
    /facebook\.com\/profile\.php\?id=(\d+)/,
    /facebook\.com\/(\d+)/,
    /fb\.com\/(\d+)/,
  ]
  for (const p of patterns) {
    const m = input.match(p)
    if (m) return m[1]
  }
  // Username URL → extract username, will use graph
  const usernameMatch = input.match(/facebook\.com\/([a-zA-Z0-9.]+)/)
  if (usernameMatch) return usernameMatch[1]
  return input
}

// POST /api/tools/checklive — check single or multiple Facebook accounts
router.post('/checklive', async (req, res) => {
  const { accounts } = req.body // string or array of strings
  if (!accounts) return res.status(400).json({ error: 'Vui lòng nhập tài khoản cần kiểm tra.' })

  const list = Array.isArray(accounts) ? accounts : accounts.split('\n').map(s => s.trim()).filter(Boolean)
  if (list.length === 0) return res.status(400).json({ error: 'Danh sách trống.' })
  if (list.length > 50) return res.status(400).json({ error: 'Tối đa 50 tài khoản mỗi lần.' })

  const results = []

  // Check single account
  async function checkAccount(raw) {
    const uid = extractUID(raw)
    try {
      // Method 1: Graph API picture — nếu trả về data (kể cả silhouette) → account tồn tại
      const graphRes = await fetch(`https://graph.facebook.com/${uid}/picture?redirect=false`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      })
      const graphData = await graphRes.json()

      // Nếu có data.url → tài khoản tồn tại (live)
      if (graphData.data && graphData.data.url) {
        return {
          input: raw,
          uid,
          status: 'live',
          avatar: graphData.data.is_silhouette ? null : graphData.data.url,
        }
      }

      // Method 2: Graph API trực tiếp — kiểm tra ID có tồn tại
      const idRes = await fetch(`https://graph.facebook.com/${uid}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      })
      const idData = await idRes.json()

      // Nếu trả về id hoặc name → live
      if (idData.id || idData.name) {
        return { input: raw, uid, status: 'live', avatar: null }
      }

      // Nếu lỗi là "Unsupported get request" → UID tồn tại nhưng bị giới hạn → vẫn live
      if (idData.error && idData.error.message && idData.error.message.includes('Unsupported get request')) {
        return { input: raw, uid, status: 'live', avatar: null }
      }

      // Method 3: Check URL Facebook trực tiếp
      const fbRes = await fetch(`https://www.facebook.com/${uid}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'follow',
      })

      const fbText = await fbRes.text()

      // Nếu trang chứa nội dung profile → live
      if (fbRes.status === 200 && !fbText.includes('page_not_found') && !fbText.includes('This content isn') && !fbText.includes('không khả dụng')) {
        return { input: raw, uid, status: 'live', avatar: null }
      }

      return { input: raw, uid, status: 'die', avatar: null }
    } catch (err) {
      return { input: raw, uid, status: 'error', avatar: null }
    }
  }

  // Process in batches of 5 for speed
  for (let i = 0; i < list.length; i += 5) {
    const batch = list.slice(i, i + 5)
    const batchResults = await Promise.all(batch.map(checkAccount))
    results.push(...batchResults)
  }

  const live = results.filter(r => r.status === 'live').length
  const die = results.filter(r => r.status === 'die').length

  res.json({ results, summary: { total: results.length, live, die } })
})

export default router
