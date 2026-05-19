import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import db from '../db.js'
import { generateToken, authMiddleware } from '../middleware/auth.js'

const router = Router()

function getSmtpConfig() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'smtp'").get()
  return row ? JSON.parse(row.value) : null
}

async function sendResetEmail(toEmail, resetUrl, username) {
  const smtp = getSmtpConfig()
  if (!smtp || !smtp.user || !smtp.pass) {
    throw new Error('Chưa cấu hình SMTP. Vui lòng liên hệ admin.')
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: { user: smtp.user, pass: smtp.pass },
  })

  await transporter.sendMail({
    from: `"${smtp.from_name || 'HuynhQuyMedia'}" <${smtp.user}>`,
    to: toEmail,
    subject: 'Đặt lại mật khẩu - HuynhQuyMedia',
    html: `
      <div style="max-width:500px;margin:0 auto;font-family:Arial,sans-serif;background:#111;color:#fff;border-radius:10px;overflow:hidden">
        <div style="background:#eb542a;padding:20px 24px">
          <h2 style="margin:0;color:#fff">HuynhQuyMedia — Đặt lại mật khẩu</h2>
        </div>
        <div style="padding:24px">
          <p>Xin chào <strong>${username}</strong>,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Nhấn nút bên dưới để tạo mật khẩu mới:</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${resetUrl}" style="display:inline-block;background:#eb542a;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">Đặt lại mật khẩu</a>
          </div>
          <p style="color:#888;font-size:13px">Link có hiệu lực trong 30 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
          <hr style="border-color:#333;margin:20px 0"/>
          <p style="color:#666;font-size:12px">© HuynhQuyMedia.COM</p>
        </div>
      </div>
    `,
  })
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin.' })
  if (username.length < 3) return res.status(400).json({ error: 'Tên đăng nhập phải có ít nhất 3 ký tự.' })
  if (password.length < 4) return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 4 ký tự.' })
  if (!email.includes('@')) return res.status(400).json({ error: 'Email không hợp lệ.' })

  const exists = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email)
  if (exists) return res.status(400).json({ error: 'Tên đăng nhập hoặc email đã tồn tại.' })

  const hash = bcrypt.hashSync(password, 10)
  const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?,?,?)').run(username, email, hash)
  const user = db.prepare('SELECT id, username, email, balance, role FROM users WHERE id = ?').get(result.lastInsertRowid)

  db.prepare('INSERT INTO activity_logs (user_id, action, detail) VALUES (?,?,?)').run(user.id, 'register', 'Đăng ký tài khoản mới')

  const token = generateToken(user)
  res.json({ token, user })
})

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin.' })

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!user) return res.status(400).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' })
  if (user.status === 'banned') return res.status(403).json({ error: 'Tài khoản đã bị khóa.' })

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' })
  }

  db.prepare('INSERT INTO activity_logs (user_id, action, detail) VALUES (?,?,?)').run(user.id, 'login', 'Đăng nhập')

  const token = generateToken(user)
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, balance: user.balance, role: user.role }
  })
})

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user })
})

// PUT /api/auth/profile
router.put('/profile', authMiddleware, (req, res) => {
  const { email, currentPassword, newPassword } = req.body
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)

  if (email && email !== user.email) {
    const emailExists = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, user.id)
    if (emailExists) return res.status(400).json({ error: 'Email đã được sử dụng.' })
    db.prepare('UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(email, user.id)
  }

  if (newPassword) {
    if (!currentPassword) return res.status(400).json({ error: 'Vui lòng nhập mật khẩu hiện tại.' })
    if (!bcrypt.compareSync(currentPassword, user.password)) return res.status(400).json({ error: 'Mật khẩu hiện tại không đúng.' })
    const hash = bcrypt.hashSync(newPassword, 10)
    db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, user.id)
  }

  const updated = db.prepare('SELECT id, username, email, balance, role FROM users WHERE id = ?').get(user.id)
  res.json({ user: updated })
})

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Vui lòng nhập email.' })

  const user = db.prepare('SELECT id, username, email, status FROM users WHERE email = ?').get(email)
  if (!user) return res.status(400).json({ error: 'Không tìm thấy tài khoản với email này.' })
  if (user.status === 'banned') return res.status(403).json({ error: 'Tài khoản đã bị khóa.' })

  // Rate limit: 1 request per 2 minutes
  const recent = db.prepare("SELECT id FROM password_resets WHERE user_id = ? AND used = 0 AND expires_at > datetime('now') AND created_at > datetime('now', '-2 minutes')").get(user.id)
  if (recent) return res.status(429).json({ error: 'Vui lòng đợi 2 phút trước khi gửi lại.' })

  // Invalidate old tokens
  db.prepare('UPDATE password_resets SET used = 1 WHERE user_id = ? AND used = 0').run(user.id)

  // Generate token
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min

  db.prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?,?,?)').run(user.id, token, expiresAt)

  // Build reset URL (frontend)
  const origin = req.headers.origin || 'http://localhost:5173'
  const resetUrl = `${origin}/#/reset-password?token=${token}`

  try {
    await sendResetEmail(user.email, resetUrl, user.username)
    res.json({ message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.' })
  } catch (err) {
    console.error('Send reset email error:', err.message)
    res.status(500).json({ error: err.message || 'Không thể gửi email. Vui lòng thử lại sau.' })
  }
})

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  const { token, password } = req.body
  if (!token || !password) return res.status(400).json({ error: 'Thiếu thông tin.' })
  if (password.length < 6) return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' })

  const reset = db.prepare('SELECT * FROM password_resets WHERE token = ? AND used = 0').get(token)
  if (!reset) return res.status(400).json({ error: 'Link đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng.' })

  if (new Date(reset.expires_at) < new Date()) {
    db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(reset.id)
    return res.status(400).json({ error: 'Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.' })
  }

  const hash = bcrypt.hashSync(password, 10)
  db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, reset.user_id)
  db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?').run(reset.id)

  db.prepare('INSERT INTO activity_logs (user_id, action, detail) VALUES (?,?,?)').run(reset.user_id, 'reset_password', 'Đặt lại mật khẩu qua email')

  res.json({ message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.' })
})

export default router
