import { Hono } from 'hono'
import { generateToken, verifyToken } from '../middleware/auth.js'
import { hashPassword, comparePassword } from '../lib/password.js'

export const authRoutes = new Hono()

// POST /api/auth/register
authRoutes.post('/register', async (c) => {
  const { username, email, password } = await c.req.json()

  if (!username || !email || !password) return c.json({ error: 'Vui lòng điền đầy đủ thông tin.' }, 400)
  if (username.length < 3) return c.json({ error: 'Tên đăng nhập phải có ít nhất 3 ký tự.' }, 400)
  if (password.length < 4) return c.json({ error: 'Mật khẩu phải có ít nhất 4 ký tự.' }, 400)
  if (!email.includes('@')) return c.json({ error: 'Email không hợp lệ.' }, 400)

  const exists = await c.env.DB.prepare(
    'SELECT id FROM users WHERE username = ? OR email = ?'
  ).bind(username, email).first()
  if (exists) return c.json({ error: 'Tên đăng nhập hoặc email đã tồn tại.' }, 400)

  const hash = await hashPassword(password)
  const result = await c.env.DB.prepare(
    'INSERT INTO users (username, email, password) VALUES (?,?,?)'
  ).bind(username, email, hash).run()

  const user = await c.env.DB.prepare(
    'SELECT id, username, email, balance, role FROM users WHERE id = ?'
  ).bind(result.meta.last_row_id).first()

  await c.env.DB.prepare(
    'INSERT INTO activity_logs (user_id, action, detail) VALUES (?,?,?)'
  ).bind(user.id, 'register', 'Đăng ký tài khoản mới').run()

  const token = await generateToken(user, c.env)
  return c.json({ token, user })
})

// POST /api/auth/login
authRoutes.post('/login', async (c) => {
  const { username, password } = await c.req.json()

  if (!username || !password) return c.json({ error: 'Vui lòng nhập đầy đủ thông tin.' }, 400)

  const user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE username = ?'
  ).bind(username).first()
  if (!user) return c.json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' }, 400)
  if (user.status === 'banned') return c.json({ error: 'Tài khoản đã bị khóa.' }, 403)

  const valid = await comparePassword(password, user.password)
  if (!valid) return c.json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' }, 400)

  await c.env.DB.prepare(
    'INSERT INTO activity_logs (user_id, action, detail) VALUES (?,?,?)'
  ).bind(user.id, 'login', 'Đăng nhập').run()

  const token = await generateToken(user, c.env)
  return c.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, balance: user.balance, role: user.role }
  })
})

// GET /api/auth/me
authRoutes.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Chưa đăng nhập' }, 401)
  try {
    const payload = await verifyToken(authHeader.replace('Bearer ', ''), c.env)
    const user = await c.env.DB.prepare(
      'SELECT id, username, email, balance, role, status FROM users WHERE id = ?'
    ).bind(payload.id).first()
    if (!user) return c.json({ error: 'Tài khoản không tồn tại' }, 401)
    return c.json({ user })
  } catch {
    return c.json({ error: 'Token không hợp lệ' }, 401)
  }
})

// PUT /api/auth/profile
authRoutes.put('/profile', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) return c.json({ error: 'Chưa đăng nhập' }, 401)
  let payload
  try {
    payload = await verifyToken(authHeader.replace('Bearer ', ''), c.env)
  } catch {
    return c.json({ error: 'Token không hợp lệ' }, 401)
  }

  const { email, currentPassword, newPassword } = await c.req.json()
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.id).first()
  if (!user) return c.json({ error: 'Tài khoản không tồn tại' }, 401)

  if (email && email !== user.email) {
    const emailExists = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ? AND id != ?'
    ).bind(email, user.id).first()
    if (emailExists) return c.json({ error: 'Email đã được sử dụng.' }, 400)
    await c.env.DB.prepare(
      'UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(email, user.id).run()
  }

  if (newPassword) {
    if (!currentPassword) return c.json({ error: 'Vui lòng nhập mật khẩu hiện tại.' }, 400)
    const valid = await comparePassword(currentPassword, user.password)
    if (!valid) return c.json({ error: 'Mật khẩu hiện tại không đúng.' }, 400)
    const hash = await hashPassword(newPassword)
    await c.env.DB.prepare(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(hash, user.id).run()
  }

  const updated = await c.env.DB.prepare(
    'SELECT id, username, email, balance, role FROM users WHERE id = ?'
  ).bind(user.id).first()
  return c.json({ user: updated })
})

// POST /api/auth/forgot-password
authRoutes.post('/forgot-password', async (c) => {
  const { email } = await c.req.json()
  if (!email) return c.json({ error: 'Vui lòng nhập email.' }, 400)

  const user = await c.env.DB.prepare(
    'SELECT id, username, email, status FROM users WHERE email = ?'
  ).bind(email).first()
  if (!user) return c.json({ error: 'Không tìm thấy tài khoản với email này.' }, 400)
  if (user.status === 'banned') return c.json({ error: 'Tài khoản đã bị khóa.' }, 403)

  const recent = await c.env.DB.prepare(
    "SELECT id FROM password_resets WHERE user_id = ? AND used = 0 AND expires_at > datetime('now') AND created_at > datetime('now', '-2 minutes')"
  ).bind(user.id).first()
  if (recent) return c.json({ error: 'Vui lòng đợi 2 phút trước khi gửi lại.' }, 429)

  await c.env.DB.prepare(
    'UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0'
  ).bind(user.id).run()

  const tokenBytes = new Uint8Array(32)
  crypto.getRandomValues(tokenBytes)
  const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('')
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

  await c.env.DB.prepare(
    'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?,?,?)'
  ).bind(user.id, token, expiresAt).run()

  const origin = c.req.header('origin') || 'https://your-domain.pages.dev'
  const resetUrl = `${origin}/#/reset-password?token=${token}`

  return c.json({ message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.', resetUrl })
})

// POST /api/auth/reset-password
authRoutes.post('/reset-password', async (c) => {
  const { token, password } = await c.req.json()
  if (!token || !password) return c.json({ error: 'Thiếu thông tin.' }, 400)
  if (password.length < 6) return c.json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' }, 400)

  const reset = await c.env.DB.prepare(
    'SELECT * FROM password_resets WHERE token = ? AND used = 0'
  ).bind(token).first()
  if (!reset) return c.json({ error: 'Link đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng.' }, 400)

  if (new Date(reset.expires_at) < new Date()) {
    await c.env.DB.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').bind(reset.id).run()
    return c.json({ error: 'Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.' }, 400)
  }

  const hash = await hashPassword(password)
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(hash, reset.user_id),
    c.env.DB.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').bind(reset.id),
    c.env.DB.prepare('INSERT INTO activity_logs (user_id, action, detail) VALUES (?,?,?)').bind(reset.user_id, 'reset_password', 'Đặt lại mật khẩu qua email'),
  ])

  return c.json({ message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.' })
})
