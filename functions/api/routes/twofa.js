import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'

export const twofaRoutes = new Hono()

// Apply auth middleware to all routes
twofaRoutes.use('/*', authMiddleware())

// GET /api/2fa/keys - Lấy danh sách 2FA keys của user
twofaRoutes.get('/keys', async (c) => {
  const user = c.get('user')
  
  // Auto-cleanup: Xóa keys cũ hơn 7 ngày
  await c.env.DB.prepare(
    "DELETE FROM user_2fa_keys WHERE user_id = ? AND created_at < datetime('now', '-7 days')"
  ).bind(user.id).run()
  
  // Lấy danh sách còn lại
  const keys = await c.env.DB.prepare(
    'SELECT id, name, secret, created_at FROM user_2fa_keys WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(user.id).all()
  
  return c.json({ keys: keys.results || [] })
})

// POST /api/2fa/keys - Thêm 2FA key mới
twofaRoutes.post('/keys', async (c) => {
  const user = c.get('user')
  const { name, secret } = await c.req.json()
  
  if (!secret || secret.length < 6) {
    return c.json({ error: 'Secret key không hợp lệ.' }, 400)
  }
  
  const cleanSecret = secret.replace(/\s/g, '').toUpperCase()
  const cleanName = (name || 'Facebook').trim()
  
  const result = await c.env.DB.prepare(
    'INSERT INTO user_2fa_keys (user_id, name, secret) VALUES (?, ?, ?)'
  ).bind(user.id, cleanName, cleanSecret).run()
  
  const newKey = await c.env.DB.prepare(
    'SELECT id, name, secret, created_at FROM user_2fa_keys WHERE id = ?'
  ).bind(result.meta.last_row_id).first()
  
  return c.json({ key: newKey })
})

// DELETE /api/2fa/keys/:id - Xóa 2FA key
twofaRoutes.delete('/keys/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  
  // Đảm bảo chỉ xóa key của chính user đó
  const result = await c.env.DB.prepare(
    'DELETE FROM user_2fa_keys WHERE id = ? AND user_id = ?'
  ).bind(id, user.id).run()
  
  if (result.meta.changes === 0) {
    return c.json({ error: 'Không tìm thấy key.' }, 404)
  }
  
  return c.json({ message: 'Đã xóa key.' })
})
