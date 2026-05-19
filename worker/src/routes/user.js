import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'

export const userRoutes = new Hono()
userRoutes.use('*', authMiddleware())

userRoutes.get('/transactions', async (c) => {
  const { page = '1', limit = '20' } = c.req.query()
  const pageNum = Number(page)
  const limitNum = Number(limit)
  const offset = (pageNum - 1) * limitNum
  const user = c.get('user')

  const countResult = await c.env.DB.prepare('SELECT COUNT(*) as total FROM transactions WHERE user_id = ?').bind(user.id).first()
  const rows = await c.env.DB.prepare(
    'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).bind(user.id, limitNum, offset).all()

  return c.json({ transactions: rows.results, total: countResult.total, page: pageNum, pages: Math.ceil(countResult.total / limitNum) })
})

userRoutes.get('/logs', async (c) => {
  const user = c.get('user')
  const rows = await c.env.DB.prepare(
    'SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100'
  ).bind(user.id).all()
  return c.json({ logs: rows.results })
})
