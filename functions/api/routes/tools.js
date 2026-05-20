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

async function checkAccount(raw, env) {
  const uid = extractUID(raw)
  
  // Use Facebook App Access Token if available
  const accessToken = env?.FB_APP_ID && env?.FB_APP_SECRET 
    ? `${env.FB_APP_ID}|${env.FB_APP_SECRET}`
    : null
  
  try {
    // Method 1: Try Graph API with access token
    if (accessToken) {
      const infoUrl = `https://graph.facebook.com/${uid}?fields=id,name&access_token=${accessToken}`
      const infoRes = await fetch(infoUrl)
      const infoData = await infoRes.json()
      
      // Check for errors
      if (infoData.error) {
        const errorCode = infoData.error.code
        const errorMsg = infoData.error.message || ''
        
        // Specific error codes for die/invalid accounts
        if (errorCode === 803 || errorCode === 100 || 
            errorMsg.includes('User ID') || 
            errorMsg.includes('does not exist')) {
          return { input: raw, uid, status: 'die', avatar: null }
        }
        
        // Other errors
        return { input: raw, uid, status: 'error', avatar: null }
      }
      
      // Account is live
      if (infoData.id) {
        // Get avatar
        const avatarUrl = `https://graph.facebook.com/${uid}/picture?type=large&redirect=false&access_token=${accessToken}`
        const avatarRes = await fetch(avatarUrl)
        const avatarData = await avatarRes.json()
        const avatar = avatarData.data?.url && !avatarData.data.is_silhouette 
          ? avatarData.data.url 
          : null
        
        return { input: raw, uid, status: 'live', avatar }
      }
    }
    
    // Fallback: Try without token (will likely fail but worth trying)
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
    
    // Check for die indicators
    const isDie = 
      html.includes('Content Not Found') ||
      html.includes('This content isn') ||
      html.includes('Page Not Found') ||
      html.includes('Sorry, this page') ||
      response.status === 404
    
    if (isDie) {
      return { input: raw, uid, status: 'die', avatar: null }
    }
    
    // Check for live indicators
    const isLive = 
      html.includes('"profile_id"') ||
      html.includes('profilePicLarge') ||
      html.includes('og:title')
    
    if (isLive) {
      return { input: raw, uid, status: 'live', avatar: null }
    }
    
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

  // Check if Facebook App credentials are configured
  const hasAppToken = c.env?.FB_APP_ID && c.env?.FB_APP_SECRET
  
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
    },
    note: hasAppToken ? null : 'Cần cấu hình FB_APP_ID và FB_APP_SECRET để check chính xác hơn.'
  })
})
