import jwt from 'jsonwebtoken'
import db from '../db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'huynhquymedia_secret_key_change_in_production'

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Chưa đăng nhập' })

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    const user = db.prepare('SELECT id, username, email, balance, role, status FROM users WHERE id = ?').get(decoded.id)
    if (!user) return res.status(401).json({ error: 'Tài khoản không tồn tại' })
    if (user.status === 'banned') return res.status(403).json({ error: 'Tài khoản đã bị khóa' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Token không hợp lệ' })
  }
}

export function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Không có quyền truy cập' })
  }
  next()
}

export { JWT_SECRET }
