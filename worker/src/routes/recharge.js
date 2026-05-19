import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'

export const rechargeRoutes = new Hono()

rechargeRoutes.get('/info', async (c) => {
  const [bankRow, cryptoRow, minRow] = await Promise.all([
    c.env.DB.prepare("SELECT value FROM settings WHERE key = 'bank_info'").first(),
    c.env.DB.prepare("SELECT value FROM settings WHERE key = 'crypto_address'").first(),
    c.env.DB.prepare("SELECT value FROM settings WHERE key = 'min_recharge'").first(),
  ])
  return c.json({
    bank: bankRow ? JSON.parse(bankRow.value) : null,
    crypto: cryptoRow ? JSON.parse(cryptoRow.value) : null,
    min_recharge: minRow ? Number(minRow.value) : 10000
  })
})

rechargeRoutes.post('/request', authMiddleware(), async (c) => {
  const { method, amount } = await c.req.json()
  const user = c.get('user')

  if (!method || !['bank', 'crypto'].includes(method)) return c.json({ error: 'Phương thức nạp tiền không hợp lệ.' }, 400)

  const minRow = await c.env.DB.prepare("SELECT value FROM settings WHERE key = 'min_recharge'").first()
  const minRecharge = Number(minRow?.value || 10000)
  if (!amount || Number(amount) < minRecharge) return c.json({ error: `Số tiền nạp tối thiểu là ${minRecharge.toLocaleString()}đ.` }, 400)

  const result = await c.env.DB.prepare(
    'INSERT INTO recharge_requests (user_id, method, amount) VALUES (?,?,?)'
  ).bind(user.id, method, Number(amount)).run()

  await c.env.DB.prepare(
    'INSERT INTO activity_logs (user_id, action, detail) VALUES (?,?,?)'
  ).bind(user.id, 'recharge_request', `Yêu cầu nạp ${Number(amount).toLocaleString()}đ qua ${method}`).run()

  return c.json({ message: 'Yêu cầu nạp tiền đã được gửi. Vui lòng chờ admin xác nhận.', id: result.meta.last_row_id })
})

rechargeRoutes.get('/history', authMiddleware(), async (c) => {
  const user = c.get('user')
  const rows = await c.env.DB.prepare(
    'SELECT * FROM recharge_requests WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(user.id).all()
  return c.json({ requests: rows.results })
})
