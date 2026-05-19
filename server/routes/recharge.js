import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// GET /api/recharge/info — get bank/crypto info
router.get('/info', (req, res) => {
  const bankInfo = db.prepare("SELECT value FROM settings WHERE key = 'bank_info'").get()
  const cryptoInfo = db.prepare("SELECT value FROM settings WHERE key = 'crypto_address'").get()
  const minRecharge = db.prepare("SELECT value FROM settings WHERE key = 'min_recharge'").get()

  res.json({
    bank: bankInfo ? JSON.parse(bankInfo.value) : null,
    crypto: cryptoInfo ? JSON.parse(cryptoInfo.value) : null,
    min_recharge: minRecharge ? Number(minRecharge.value) : 10000
  })
})

// POST /api/recharge/request — create recharge request
router.post('/request', authMiddleware, (req, res) => {
  const { method, amount } = req.body

  if (!method || !['bank', 'crypto'].includes(method)) {
    return res.status(400).json({ error: 'Phương thức nạp tiền không hợp lệ.' })
  }

  const minRecharge = Number(db.prepare("SELECT value FROM settings WHERE key = 'min_recharge'").get()?.value || 10000)
  if (!amount || amount < minRecharge) {
    return res.status(400).json({ error: `Số tiền nạp tối thiểu là ${minRecharge.toLocaleString()}đ.` })
  }

  const result = db.prepare('INSERT INTO recharge_requests (user_id, method, amount) VALUES (?,?,?)').run(req.user.id, method, amount)
  db.prepare('INSERT INTO activity_logs (user_id, action, detail) VALUES (?,?,?)').run(req.user.id, 'recharge_request', `Yêu cầu nạp ${amount.toLocaleString()}đ qua ${method}`)

  res.json({ message: 'Yêu cầu nạp tiền đã được gửi. Vui lòng chờ admin xác nhận.', id: result.lastInsertRowid })
})

// GET /api/recharge/history — user recharge history
router.get('/history', authMiddleware, (req, res) => {
  const requests = db.prepare('SELECT * FROM recharge_requests WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id)
  res.json({ requests })
})

export default router
