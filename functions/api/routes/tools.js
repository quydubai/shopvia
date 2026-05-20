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
    // Method 1: Try to fetch profile page HTML
    const profileUrl = /^\d+$/.test(uid) 
      ? `https://www.facebook.com/profile.php?id=${uid}`
      : `https://www.facebook.com/${uid}`
    
    const response = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    })
    
    const html = await response.text()
    
    // Check for indicators that account is live
    const isLive = 
      html.includes('"profile_id"') ||
      html.includes('profilePicLarge') ||
      html.includes('og:title') ||
      (response.status === 200 && !html.includes('Content Not Found') && !html.includes('This content isn'))
    
    // Check for indicators that account is die/invalid
    const isDie = 
      html.includes('Content Not Found') ||
      html.includes('This content isn') ||
      html.includes('Page Not Found') ||
      html.includes('Sorry, this page') ||
      response.status === 404
    
    if (isDie) {
      return { input: raw, uid, status: 'die', avatar: null }
    }
    
    if (isLive) {
      // Try to extract avatar from HTML
      let avatar = null
      const avatarMatch = html.match(/"profilePicLarge":\{"uri":"([^"]+)"/)
      if (avatarMatch) {
        avatar = avatarMatch[1].replace(/\\u0025/g, '%').replace(/\\/g, '')
      }
      return { input: raw, uid, status: 'live', avatar }
    }
    
    // If uncertain, mark as error
    return { input: raw, uid, status: 'error', avatar: null }
  } catch (err) {
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
