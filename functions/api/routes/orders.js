import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth.js'

export const orderRoutes = new Hono()
orderRoutes.use('*', authMiddleware())

// POST /api/orders/buy
orderRoutes.post('/buy', async (c) => {
  const { product_id, quantity = 1 } = await c.req.json()
  const user = c.get('user')
  const qty = Number(quantity)

  const product = await c.env.DB.prepare(
    "SELECT * FROM products WHERE id = ? AND status = 'active'"
  ).bind(product_id).first()
  if (!product) return c.json({ error: 'Sản phẩm không tồn tại.' }, 404)
  if (qty < product.min_buy) return c.json({ error: `Mua tối thiểu ${product.min_buy} sản phẩm.` }, 400)
  if (qty > product.max_buy) return c.json({ error: `Mua tối đa ${product.max_buy} sản phẩm.` }, 400)

  const dataLines = (product.data_content || '').split('\n').filter(l => l.trim())
  if (dataLines.length < qty) return c.json({ error: `Chỉ còn ${dataLines.length} sản phẩm trong kho.` }, 400)

  const totalPrice = product.price * qty
  const freshUser = await c.env.DB.prepare('SELECT balance FROM users WHERE id = ?').bind(user.id).first()
  if (freshUser.balance < totalPrice) {
    return c.json({ error: `Số dư không đủ. Cần ${totalPrice.toLocaleString()}đ, hiện có ${freshUser.balance.toLocaleString()}đ.` }, 400)
  }

  const deliveredData = dataLines.slice(0, qty).join('\n')
  const remainingData = dataLines.slice(qty).join('\n')
  const newStock = remainingData.split('\n').filter(l => l.trim()).length
  const newBalance = freshUser.balance - totalPrice

  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(newBalance, user.id),
    c.env.DB.prepare('UPDATE products SET stock = ?, sold = sold + ?, data_content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(newStock, qty, remainingData, product.id),
  ])

  const orderResult = await c.env.DB.prepare(
    'INSERT INTO orders (user_id, product_id, quantity, total_price, data_received) VALUES (?,?,?,?,?)'
  ).bind(user.id, product.id, qty, totalPrice, deliveredData).run()

  await c.env.DB.batch([
    c.env.DB.prepare('INSERT INTO transactions (user_id, type, amount, balance_after, note) VALUES (?,?,?,?,?)').bind(user.id, 'purchase', -totalPrice, newBalance, `Mua ${qty}x ${product.name}`),
    c.env.DB.prepare('INSERT INTO activity_logs (user_id, action, detail) VALUES (?,?,?)').bind(user.id, 'purchase', `Mua ${qty}x ${product.name} - ${totalPrice.toLocaleString()}đ`),
  ])

  return c.json({ message: 'Mua hàng thành công!', order_id: orderResult.meta.last_row_id, data: deliveredData, balance: newBalance })
})

// GET /api/orders
orderRoutes.get('/', async (c) => {
  const { page = '1', limit = '20' } = c.req.query()
  const pageNum = Number(page)
  const limitNum = Number(limit)
  const offset = (pageNum - 1) * limitNum
  const user = c.get('user')

  // Auto-cleanup: Xóa data_received của đơn hàng cũ hơn 7 ngày
  await c.env.DB.prepare(
    "UPDATE orders SET data_received = '' WHERE user_id = ? AND data_received != '' AND created_at < datetime('now', '-7 days')"
  ).bind(user.id).run()

  const countResult = await c.env.DB.prepare('SELECT COUNT(*) as total FROM orders WHERE user_id = ?').bind(user.id).first()
  const rows = await c.env.DB.prepare(
    `SELECT o.*, p.name as product_name, p.slug as product_slug
     FROM orders o JOIN products p ON o.product_id = p.id
     WHERE o.user_id = ? ORDER BY o.created_at DESC LIMIT ? OFFSET ?`
  ).bind(user.id, limitNum, offset).all()

  return c.json({ orders: rows.results, total: countResult.total, page: pageNum, pages: Math.ceil(countResult.total / limitNum) })
})

// GET /api/orders/:id
orderRoutes.get('/:id', async (c) => {
  const user = c.get('user')
  const order = await c.env.DB.prepare(
    `SELECT o.*, p.name as product_name, p.slug as product_slug
     FROM orders o JOIN products p ON o.product_id = p.id
     WHERE o.id = ? AND o.user_id = ?`
  ).bind(c.req.param('id'), user.id).first()

  if (!order) return c.json({ error: 'Đơn hàng không tồn tại.' }, 404)
  return c.json({ order })
})
