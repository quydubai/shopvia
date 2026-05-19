import { Router } from 'express'
import db from '../db.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware, adminMiddleware)

// ── Dashboard Stats ──
router.get('/stats', (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c
  const totalProducts = db.prepare('SELECT COUNT(*) as c FROM products').get().c
  const allProducts = db.prepare("SELECT data_content FROM products WHERE status = 'active'").all()
  const totalStock = allProducts.reduce((sum, p) => sum + (p.data_content || '').split('\n').filter(l => l.trim()).length, 0)
  const totalOrders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_price),0) as c FROM orders WHERE status = 'completed'").get().c
  const pendingRecharges = db.prepare("SELECT COUNT(*) as c FROM recharge_requests WHERE status = 'pending'").get().c
  const todayOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE date(created_at) = date('now')").get().c
  const todayRevenue = db.prepare("SELECT COALESCE(SUM(total_price),0) as c FROM orders WHERE date(created_at) = date('now') AND status = 'completed'").get().c
  const recentOrders = db.prepare(`
    SELECT o.*, u.username, p.name as product_name
    FROM orders o JOIN users u ON o.user_id = u.id JOIN products p ON o.product_id = p.id
    ORDER BY o.created_at DESC LIMIT 10
  `).all()

  res.json({ totalUsers, totalProducts, totalStock, totalOrders, totalRevenue, pendingRecharges, todayOrders, todayRevenue, recentOrders })
})

// ── Users ──
router.get('/users', (req, res) => {
  const { search, page = 1, limit = 20 } = req.query
  const offset = (page - 1) * limit
  let q = 'SELECT id, username, email, balance, role, status, created_at FROM users WHERE 1=1'
  const params = []
  if (search) { q += ' AND (username LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }
  const total = db.prepare(q.replace('SELECT id, username, email, balance, role, status, created_at', 'SELECT COUNT(*) as total')).get(...params).total
  q += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(Number(limit), Number(offset))
  const users = db.prepare(q).all(...params)
  res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) })
})

router.put('/users/:id/balance', (req, res) => {
  const { amount, type, note } = req.body
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: 'User không tồn tại.' })

  const newBalance = type === 'add' ? user.balance + Number(amount) : user.balance - Number(amount)
  if (newBalance < 0) return res.status(400).json({ error: 'Số dư không thể âm.' })

  db.prepare('UPDATE users SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newBalance, user.id)
  db.prepare('INSERT INTO transactions (user_id, type, amount, balance_after, note) VALUES (?,?,?,?,?)').run(
    user.id, type === 'add' ? 'admin_add' : 'admin_sub', type === 'add' ? amount : -amount, newBalance, note || `Admin ${type} ${amount}đ`
  )
  db.prepare('INSERT INTO activity_logs (user_id, action, detail) VALUES (?,?,?)').run(user.id, 'admin_balance', `Admin ${type} ${amount}đ. Note: ${note}`)

  res.json({ message: 'Cập nhật số dư thành công.', balance: newBalance })
})

router.put('/users/:id/status', (req, res) => {
  const { status } = req.body
  db.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id)
  res.json({ message: `Đã ${status === 'banned' ? 'khóa' : 'mở khóa'} tài khoản.` })
})

router.put('/users/:id/role', (req, res) => {
  const { role } = req.body
  db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(role, req.params.id)
  res.json({ message: `Đã cập nhật quyền.` })
})

// ── Categories ──
router.get('/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY parent_group, sort_order').all()
  res.json({ categories })
})

router.post('/categories', (req, res) => {
  const { name, slug, parent_group, sort_order } = req.body
  if (!name || !slug) return res.status(400).json({ error: 'Tên và slug là bắt buộc.' })
  const exists = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug)
  if (exists) return res.status(400).json({ error: 'Slug đã tồn tại.' })
  const result = db.prepare('INSERT INTO categories (name, slug, parent_group, sort_order) VALUES (?,?,?,?)').run(name, slug, parent_group || '', sort_order || 0)
  res.json({ message: 'Tạo danh mục thành công.', id: result.lastInsertRowid })
})

router.put('/categories/:id', (req, res) => {
  const { name, slug, parent_group, sort_order } = req.body
  db.prepare('UPDATE categories SET name=?, slug=?, parent_group=?, sort_order=? WHERE id=?').run(name, slug, parent_group || '', sort_order || 0, req.params.id)
  res.json({ message: 'Cập nhật danh mục thành công.' })
})

router.delete('/categories/:id', (req, res) => {
  const products = db.prepare('SELECT COUNT(*) as c FROM products WHERE category_id = ?').get(req.params.id).c
  if (products > 0) return res.status(400).json({ error: `Không thể xóa. Còn ${products} sản phẩm trong danh mục.` })
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id)
  res.json({ message: 'Đã xóa danh mục.' })
})

// ── Products ──
router.get('/products', (req, res) => {
  const { search, category_id, page = 1, limit = 20 } = req.query
  const offset = (page - 1) * limit
  let q = `SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE 1=1`
  const params = []
  if (search) { q += ' AND p.name LIKE ?'; params.push(`%${search}%`) }
  if (category_id) { q += ' AND p.category_id = ?'; params.push(Number(category_id)) }
  const total = db.prepare(q.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM')).get(...params).total
  q += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
  params.push(Number(limit), Number(offset))
  const products = db.prepare(q).all(...params).map(p => ({
    ...p,
    stock: (p.data_content || '').split('\n').filter(l => l.trim()).length
  }))
  res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) })
})

router.post('/products', (req, res) => {
  const { category_id, name, slug, description, price, data_content, min_buy, max_buy } = req.body
  if (!name || !slug || !category_id) return res.status(400).json({ error: 'Tên, slug, danh mục là bắt buộc.' })
  const exists = db.prepare('SELECT id FROM products WHERE slug = ?').get(slug)
  if (exists) return res.status(400).json({ error: 'Slug đã tồn tại.' })
  const dataStr = data_content || ''
  const realStock = dataStr.split('\n').filter(l => l.trim()).length
  const result = db.prepare('INSERT INTO products (category_id, name, slug, description, price, stock, data_content, min_buy, max_buy) VALUES (?,?,?,?,?,?,?,?,?)').run(
    category_id, name, slug, description || '', price || 0, realStock, dataStr, min_buy || 1, max_buy || 100
  )
  res.json({ message: 'Tạo sản phẩm thành công.', id: result.lastInsertRowid, stock: realStock })
})

router.put('/products/:id', (req, res) => {
  const { category_id, name, slug, description, price, data_content, min_buy, max_buy, status } = req.body
  const dataStr = data_content || ''
  const realStock = dataStr.split('\n').filter(l => l.trim()).length
  db.prepare(`UPDATE products SET category_id=?, name=?, slug=?, description=?, price=?, stock=?, data_content=?, min_buy=?, max_buy=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(
    category_id, name, slug, description || '', price || 0, realStock, dataStr, min_buy || 1, max_buy || 100, status || 'active', req.params.id
  )
  res.json({ message: 'Cập nhật sản phẩm thành công.', stock: realStock })
})

router.delete('/products/:id', (req, res) => {
  const orders = db.prepare('SELECT COUNT(*) as c FROM orders WHERE product_id = ?').get(req.params.id).c
  if (orders > 0) {
    db.prepare("UPDATE products SET status = 'hidden' WHERE id = ?").run(req.params.id)
    return res.json({ message: 'Sản phẩm đã được ẩn (có đơn hàng liên quan).' })
  }
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id)
  res.json({ message: 'Đã xóa sản phẩm.' })
})

// ── Orders ──
router.get('/orders', (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const offset = (page - 1) * limit
  let q = `SELECT o.*, u.username, p.name as product_name FROM orders o JOIN users u ON o.user_id = u.id JOIN products p ON o.product_id = p.id WHERE 1=1`
  const params = []
  if (status) { q += ' AND o.status = ?'; params.push(status) }
  const total = db.prepare(q.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM')).get(...params).total
  q += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?'
  params.push(Number(limit), Number(offset))
  const orders = db.prepare(q).all(...params)
  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) })
})

router.put('/orders/:id/refund', (req, res) => {
  const order = db.prepare('SELECT o.*, u.balance FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?').get(req.params.id)
  if (!order) return res.status(404).json({ error: 'Đơn hàng không tồn tại.' })
  if (order.status === 'refunded') return res.status(400).json({ error: 'Đơn hàng đã được hoàn tiền.' })

  const newBalance = order.balance + order.total_price
  db.transaction(() => {
    db.prepare("UPDATE orders SET status = 'refunded' WHERE id = ?").run(order.id)
    db.prepare('UPDATE users SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newBalance, order.user_id)
    db.prepare('INSERT INTO transactions (user_id, type, amount, balance_after, note) VALUES (?,?,?,?,?)').run(
      order.user_id, 'refund', order.total_price, newBalance, `Hoàn tiền đơn #${order.id}`
    )
  })()
  res.json({ message: 'Hoàn tiền thành công.' })
})

// ── Recharge Requests ──
router.get('/recharges', (req, res) => {
  const { status, page = 1, limit = 20 } = req.query
  const offset = (page - 1) * limit
  let q = 'SELECT r.*, u.username FROM recharge_requests r JOIN users u ON r.user_id = u.id WHERE 1=1'
  const params = []
  if (status) { q += ' AND r.status = ?'; params.push(status) }
  const total = db.prepare(q.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM')).get(...params).total
  q += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?'
  params.push(Number(limit), Number(offset))
  const recharges = db.prepare(q).all(...params)
  res.json({ recharges, total, page: Number(page), pages: Math.ceil(total / limit) })
})

router.put('/recharges/:id/approve', (req, res) => {
  const recharge = db.prepare('SELECT r.*, u.balance FROM recharge_requests r JOIN users u ON r.user_id = u.id WHERE r.id = ?').get(req.params.id)
  if (!recharge) return res.status(404).json({ error: 'Yêu cầu không tồn tại.' })
  if (recharge.status !== 'pending') return res.status(400).json({ error: 'Yêu cầu đã được xử lý.' })

  const newBalance = recharge.balance + recharge.amount
  db.transaction(() => {
    db.prepare("UPDATE recharge_requests SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").run(recharge.id)
    db.prepare('UPDATE users SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newBalance, recharge.user_id)
    db.prepare('INSERT INTO transactions (user_id, type, amount, balance_after, note) VALUES (?,?,?,?,?)').run(
      recharge.user_id, 'recharge', recharge.amount, newBalance, `Nạp tiền qua ${recharge.method} - #${recharge.id}`
    )
    db.prepare('INSERT INTO activity_logs (user_id, action, detail) VALUES (?,?,?)').run(recharge.user_id, 'recharge_approved', `Nạp ${recharge.amount.toLocaleString()}đ đã được duyệt`)
  })()
  res.json({ message: 'Đã duyệt yêu cầu nạp tiền.' })
})

router.put('/recharges/:id/reject', (req, res) => {
  const { note } = req.body
  db.prepare("UPDATE recharge_requests SET status = 'rejected', note = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").run(note || '', req.params.id)
  res.json({ message: 'Đã từ chối yêu cầu nạp tiền.' })
})

// ── Transactions ──
router.get('/transactions', (req, res) => {
  const { user_id, page = 1, limit = 50 } = req.query
  const offset = (page - 1) * limit
  let q = 'SELECT t.*, u.username FROM transactions t JOIN users u ON t.user_id = u.id WHERE 1=1'
  const params = []
  if (user_id) { q += ' AND t.user_id = ?'; params.push(Number(user_id)) }
  const total = db.prepare(q.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM')).get(...params).total
  q += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?'
  params.push(Number(limit), Number(offset))
  const transactions = db.prepare(q).all(...params)
  res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) })
})

// ── Settings ──
router.get('/settings', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all()
  const settings = {}
  rows.forEach(r => { settings[r.key] = r.value })
  res.json({ settings })
})

router.put('/settings', (req, res) => {
  const entries = Object.entries(req.body)
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?,?)')
  entries.forEach(([key, value]) => stmt.run(key, typeof value === 'string' ? value : JSON.stringify(value)))
  res.json({ message: 'Cập nhật cài đặt thành công.' })
})

// ── Activity Logs ──
router.get('/logs', (req, res) => {
  const { user_id, page = 1, limit = 50 } = req.query
  const offset = (page - 1) * limit
  let q = 'SELECT l.*, u.username FROM activity_logs l JOIN users u ON l.user_id = u.id WHERE 1=1'
  const params = []
  if (user_id) { q += ' AND l.user_id = ?'; params.push(Number(user_id)) }
  q += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?'
  params.push(Number(limit), Number(offset))
  const logs = db.prepare(q).all(...params)
  res.json({ logs })
})

export default router
