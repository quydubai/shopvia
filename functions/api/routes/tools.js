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

async function resolveUsernameToUid(username) {
  try {
    const response = await fetch(`https://www.facebook.com/${username}`, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    })
    
    const html = await response.text()
    
    // Try multiple patterns to extract UID
    const patterns = [
      /"userID":"(\d+)"/,
      /"profile_id":(\d+)/,
      /"entity_id":"(\d+)"/,
      /"actor_id":"(\d+)"/,
      /content="fb:\/\/profile\/(\d+)"/,
      /\/profile\.php\?id=(\d+)/,
    ]
    
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match && match[1] !== '0') {
        return match[1]
      }
    }
    
    return null
  } catch {
    return null
  }
}

async function checkAccount(raw, env) {
  let uid = extractUID(raw)
  
  try {
    // If UID is not numeric (it's a username), resolve it first
    if (!/^\d+$/.test(uid)) {
      const resolvedUid = await resolveUsernameToUid(uid)
      if (resolvedUid) {
        uid = resolvedUid
      } else {
        // Username could not be resolved = die
        return { input: raw, uid, status: 'die', avatar: null }
      }
    }
    
    // KEY METHOD: Check Facebook avatar redirect
    // - Live account: redirects to scontent.*.fbcdn.net/... (real avatar)
    // - Die account: redirects to static.xx.fbcdn.net/rsrc.php/... (default avatar GIF)
    
    const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=200`
    
    const response = await fetch(avatarUrl, {
      method: 'HEAD',
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    
    const location = response.headers.get('location') || ''
    
    // Default avatar pattern (account die)
    if (location.includes('static.xx.fbcdn.net/rsrc.php') || 
        location.includes('UlIqmHJn-SK.gif') ||
        location.includes('default') ||
        !location) {
      return { input: raw, uid, status: 'die', avatar: null }
    }
    
    // Real avatar pattern (account live)
    if (location.includes('scontent') && location.includes('fbcdn.net')) {
      return { input: raw, uid, status: 'live', avatar: location }
    }
    
    return { input: raw, uid, status: 'die', avatar: null }
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
    const batchResults = await Promise.all(
      list.slice(i, i + 5).map(acc => checkAccount(acc, c.env))
    )
    results.push(...batchResults)
  }

  return c.json({ 
    results, 
    summary: { 
      total: results.length, 
      live: results.filter(r => r.status === 'live').length, 
      die: results.filter(r => r.status === 'die').length 
    }
  })
})
