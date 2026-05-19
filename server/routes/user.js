import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

// GET /api/user/transactions
router.get('/transactions', (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const offset = (page - 1) * limit
  const total = db.prepare('SELECT COUNT(*) as total FROM transactions WHERE user_id = ?').get(req.user.id).total
  const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(req.user.id, Number(limit), Number(offset))
  res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) })
})

// GET /api/user/logs
router.get('/logs', (req, res) => {
  const logs = db.prepare('SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100').all(req.user.id)
  res.json({ logs })
})

export default router
