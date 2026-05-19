import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// POST /api/orders/buy — purchase product
router.post('/buy', authMiddleware, (req, res) => {
  const { product_id, quantity = 1 } = req.body
  const userId = req.user.id

  const product = db.prepare('SELECT * FROM products WHERE id = ? AND status = ?').get(product_id, 'active')
  if (!product) return res.status(404).json({ error: 'Sản phẩm không tồn tại.' })
  if (quantity < product.min_buy) return res.status(400).json({ error: `Mua tối thiểu ${product.min_buy} sản phẩm.` })
  if (quantity > product.max_buy) return res.status(400).json({ error: `Mua tối đa ${product.max_buy} sản phẩm.` })

  // Calculate real stock from data_content lines
  const dataLines = (product.data_content || '').split('\n').filter(l => l.trim())
  const realStock = dataLines.length
  if (realStock < quantity) return res.status(400).json({ error: `Chỉ còn ${realStock} sản phẩm trong kho.` })

  const totalPrice = product.price * quantity
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  if (user.balance < totalPrice) {
    return res.status(400).json({ error: `Số dư không đủ. Cần ${totalPrice.toLocaleString()}đ, hiện có ${user.balance.toLocaleString()}đ.` })
  }

  // Process: split data_content lines for delivery
  const deliveredData = dataLines.slice(0, quantity).join('\n')
  const remainingData = dataLines.slice(quantity).join('\n')

  // Transaction
  const trx = db.transaction(() => {
    // Deduct balance
    db.prepare('UPDATE users SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(totalPrice, userId)
    // Update stock and data
    const newStock = remainingData.split('\n').filter(l => l.trim()).length
    db.prepare('UPDATE products SET stock = ?, sold = sold + ?, data_content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStock, quantity, remainingData, product.id)
    // Create order
    const order = db.prepare('INSERT INTO orders (user_id, product_id, quantity, total_price, data_received) VALUES (?,?,?,?,?)').run(userId, product.id, quantity, totalPrice, deliveredData)
    // Log transaction
    const newBalance = user.balance - totalPrice
    db.prepare('INSERT INTO transactions (user_id, type, amount, balance_after, note) VALUES (?,?,?,?,?)').run(userId, 'purchase', -totalPrice, newBalance, `Mua ${quantity}x ${product.name}`)
    // Activity log
    db.prepare('INSERT INTO activity_logs (user_id, action, detail) VALUES (?,?,?)').run(userId, 'purchase', `Mua ${quantity}x ${product.name} - ${totalPrice.toLocaleString()}đ`)

    return { orderId: order.lastInsertRowid, deliveredData, newBalance }
  })

  const result = trx()
  res.json({
    message: 'Mua hàng thành công!',
    order_id: result.orderId,
    data: result.deliveredData,
    balance: result.newBalance
  })
})

// GET /api/orders — user order history
router.get('/', authMiddleware, (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const offset = (page - 1) * limit

  const total = db.prepare('SELECT COUNT(*) as total FROM orders WHERE user_id = ?').get(req.user.id).total
  const orders = db.prepare(`
    SELECT o.*, p.name as product_name, p.slug as product_slug
    FROM orders o JOIN products p ON o.product_id = p.id
    WHERE o.user_id = ? ORDER BY o.created_at DESC LIMIT ? OFFSET ?
  `).all(req.user.id, Number(limit), Number(offset))

  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) })
})

// GET /api/orders/:id — order detail
router.get('/:id', authMiddleware, (req, res) => {
  const order = db.prepare(`
    SELECT o.*, p.name as product_name, p.slug as product_slug
    FROM orders o JOIN products p ON o.product_id = p.id
    WHERE o.id = ? AND o.user_id = ?
  `).get(req.params.id, req.user.id)

  if (!order) return res.status(404).json({ error: 'Đơn hàng không tồn tại.' })
  res.json({ order })
})

export default router
