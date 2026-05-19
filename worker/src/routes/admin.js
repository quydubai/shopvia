import { Hono } from 'hono'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

export const adminRoutes = new Hono()
adminRoutes.use('*', authMiddleware(), adminMiddleware())

adminRoutes.get('/stats', async (c) => {
  const [usersRow, productsRow, ordersRow, revenueRow, pendingRow, todayOrdersRow, todayRevenueRow] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as c FROM users').first(),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM products').first(),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM orders').first(),
    c.env.DB.prepare("SELECT COALESCE(SUM(total_price),0) as c FROM orders WHERE status = 'completed'").first(),
    c.env.DB.prepare("SELECT COUNT(*) as c FROM recharge_requests WHERE status = 'pending'").first(),
    c.env.DB.prepare("SELECT COUNT(*) as c FROM orders WHERE date(created_at) = date('now')").first(),
    c.env.DB.prepare("SELECT COALESCE(SUM(total_price),0) as c FROM orders WHERE date(created_at) = date('now') AND status = 'completed'").first(),
  ])
  const allProducts = await c.env.DB.prepare("SELECT data_content FROM products WHERE status = 'active'").all()
  const totalStock = allProducts.results.reduce((sum, p) => sum + (p.data_content || '').split('\n').filter(l => l.trim()).length, 0)
  const recentOrders = await c.env.DB.prepare(
    `SELECT o.*, u.username, p.name as product_name FROM orders o JOIN users u ON o.user_id = u.id JOIN products p ON o.product_id = p.id ORDER BY o.created_at DESC LIMIT 10`
  ).all()
  return c.json({ totalUsers: usersRow.c, totalProducts: productsRow.c, totalStock, totalOrders: ordersRow.c, totalRevenue: revenueRow.c, pendingRecharges: pendingRow.c, todayOrders: todayOrdersRow.c, todayRevenue: todayRevenueRow.c, recentOrders: recentOrders.results })
})

// ── Users ──
adminRoutes.get('/users', async (c) => {
  const { search, page = '1', limit = '20' } = c.req.query()
  const pageNum = Number(page), limitNum = Number(limit), offset = (pageNum - 1) * limitNum
  let baseQ = 'FROM users WHERE 1=1'
  const params = []
  if (search) { baseQ += ' AND (username LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }
  const countResult = await c.env.DB.prepare(`SELECT COUNT(*) as total ${baseQ}`).bind(...params).first()
  const rows = await c.env.DB.prepare(`SELECT id, username, email, balance, role, status, created_at ${baseQ} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, limitNum, offset).all()
  return c.json({ users: rows.results, total: countResult.total, page: pageNum, pages: Math.ceil(countResult.total / limitNum) })
})

adminRoutes.put('/users/:id/balance', async (c) => {
  const { amount, type, note } = await c.req.json()
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(c.req.param('id')).first()
  if (!user) return c.json({ error: 'User không tồn tại.' }, 404)
  const newBalance = type === 'add' ? user.balance + Number(amount) : user.balance - Number(amount)
  if (newBalance < 0) return c.json({ error: 'Số dư không thể âm.' }, 400)
  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(newBalance, user.id),
    c.env.DB.prepare('INSERT INTO transactions (user_id, type, amount, balance_after, note) VALUES (?,?,?,?,?)').bind(user.id, type === 'add' ? 'admin_add' : 'admin_sub', type === 'add' ? Number(amount) : -Number(amount), newBalance, note || `Admin ${type} ${amount}đ`),
    c.env.DB.prepare('INSERT INTO activity_logs (user_id, action, detail) VALUES (?,?,?)').bind(user.id, 'admin_balance', `Admin ${type} ${amount}đ. Note: ${note}`),
  ])
  return c.json({ message: 'Cập nhật số dư thành công.', balance: newBalance })
})

adminRoutes.put('/users/:id/status', async (c) => {
  const { status } = await c.req.json()
  await c.env.DB.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(status, c.req.param('id')).run()
  return c.json({ message: `Đã ${status === 'banned' ? 'khóa' : 'mở khóa'} tài khoản.` })
})

adminRoutes.put('/users/:id/role', async (c) => {
  const { role } = await c.req.json()
  await c.env.DB.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(role, c.req.param('id')).run()
  return c.json({ message: 'Đã cập nhật quyền.' })
})

// ── Categories ──
adminRoutes.get('/categories', async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM categories ORDER BY parent_group, sort_order').all()
  return c.json({ categories: rows.results })
})

adminRoutes.post('/categories', async (c) => {
  const { name, slug, parent_group, sort_order } = await c.req.json()
  if (!name || !slug) return c.json({ error: 'Tên và slug là bắt buộc.' }, 400)
  const exists = await c.env.DB.prepare('SELECT id FROM categories WHERE slug = ?').bind(slug).first()
  if (exists) return c.json({ error: 'Slug đã tồn tại.' }, 400)
  const result = await c.env.DB.prepare('INSERT INTO categories (name, slug, parent_group, sort_order) VALUES (?,?,?,?)').bind(name, slug, parent_group || '', sort_order || 0).run()
  return c.json({ message: 'Tạo danh mục thành công.', id: result.meta.last_row_id })
})

adminRoutes.put('/categories/:id', async (c) => {
  const { name, slug, parent_group, sort_order } = await c.req.json()
  await c.env.DB.prepare('UPDATE categories SET name=?, slug=?, parent_group=?, sort_order=? WHERE id=?').bind(name, slug, parent_group || '', sort_order || 0, c.req.param('id')).run()
  return c.json({ message: 'Cập nhật danh mục thành công.' })
})

adminRoutes.delete('/categories/:id', async (c) => {
  const countRow = await c.env.DB.prepare('SELECT COUNT(*) as c FROM products WHERE category_id = ?').bind(c.req.param('id')).first()
  if (countRow.c > 0) return c.json({ error: `Không thể xóa. Còn ${countRow.c} sản phẩm trong danh mục.` }, 400)
  await c.env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ message: 'Đã xóa danh mục.' })
})

// ── Products ──
adminRoutes.get('/products', async (c) => {
  const { search, category_id, page = '1', limit = '20' } = c.req.query()
  const pageNum = Number(page), limitNum = Number(limit), offset = (pageNum - 1) * limitNum
  let baseQ = 'FROM products p JOIN categories c ON p.category_id = c.id WHERE 1=1'
  const params = []
  if (search) { baseQ += ' AND p.name LIKE ?'; params.push(`%${search}%`) }
  if (category_id) { baseQ += ' AND p.category_id = ?'; params.push(Number(category_id)) }
  const countResult = await c.env.DB.prepare(`SELECT COUNT(*) as total ${baseQ}`).bind(...params).first()
  const rows = await c.env.DB.prepare(`SELECT p.*, c.name as category_name ${baseQ} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`).bind(...params, limitNum, offset).all()
  const products = rows.results.map(p => ({ ...p, stock: (p.data_content || '').split('\n').filter(l => l.trim()).length }))
  return c.json({ products, total: countResult.total, page: pageNum, pages: Math.ceil(countResult.total / limitNum) })
})

adminRoutes.post('/products', async (c) => {
  const { category_id, name, slug, description, price, data_content, min_buy, max_buy } = await c.req.json()
  if (!name || !slug || !category_id) return c.json({ error: 'Tên, slug, danh mục là bắt buộc.' }, 400)
  const exists = await c.env.DB.prepare('SELECT id FROM products WHERE slug = ?').bind(slug).first()
  if (exists) return c.json({ error: 'Slug đã tồn tại.' }, 400)
  const dataStr = data_content || ''
  const realStock = dataStr.split('\n').filter(l => l.trim()).length
  const result = await c.env.DB.prepare('INSERT INTO products (category_id, name, slug, description, price, stock, data_content, min_buy, max_buy) VALUES (?,?,?,?,?,?,?,?,?)').bind(category_id, name, slug, description || '', price || 0, realStock, dataStr, min_buy || 1, max_buy || 100).run()
  return c.json({ message: 'Tạo sản phẩm thành công.', id: result.meta.last_row_id, stock: realStock })
})

adminRoutes.put('/products/:id', async (c) => {
  const { category_id, name, slug, description, price, data_content, min_buy, max_buy, status } = await c.req.json()
  const dataStr = data_content || ''
  const realStock = dataStr.split('\n').filter(l => l.trim()).length
  await c.env.DB.prepare(`UPDATE products SET category_id=?, name=?, slug=?, description=?, price=?, stock=?, data_content=?, min_buy=?, max_buy=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(category_id, name, slug, description || '', price || 0, realStock, dataStr, min_buy || 1, max_buy || 100, status || 'active', c.req.param('id')).run()
  return c.json({ message: 'Cập nhật sản phẩm thành công.', stock: realStock })
})

adminRoutes.delete('/products/:id', async (c) => {
  const countRow = await c.env.DB.prepare('SELECT COUNT(*) as c FROM orders WHERE product_id = ?').bind(c.req.param('id')).first()
  if (countRow.c > 0) {
    await c.env.DB.prepare("UPDATE products SET status = 'hidden' WHERE id = ?").bind(c.req.param('id')).run()
    return c.json({ message: 'Sản phẩm đã được ẩn (có đơn hàng liên quan).' })
  }
  await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(c.req.param('id')).run()
  return c.json({ message: 'Đã xóa sản phẩm.' })
})

// ── Orders ──
adminRoutes.get('/orders', async (c) => {
  const { status, page = '1', limit = '20' } = c.req.query()
  const pageNum = Number(page), limitNum = Number(limit), offset = (pageNum - 1) * limitNum
  let baseQ = 'FROM orders o JOIN users u ON o.user_id = u.id JOIN products p ON o.product_id = p.id WHERE 1=1'
  const params = []
  if (status) { baseQ += ' AND o.status = ?'; params.push(status) }
  const countResult = await c.env.DB.prepare(`SELECT COUNT(*) as total ${baseQ}`).bind(...params).first()
  const rows = await c.env.DB.prepare(`SELECT o.*, u.username, p.name as product_name ${baseQ} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`).bind(...params, limitNum, offset).all()
  return c.json({ orders: rows.results, total: countResult.total, page: pageNum, pages: Math.ceil(countResult.total / limitNum) })
})

adminRoutes.put('/orders/:id/refund', async (c) => {
  const order = await c.env.DB.prepare('SELECT o.*, u.balance FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?').bind(c.req.param('id')).first()
  if (!order) return c.json({ error: 'Đơn hàng không tồn tại.' }, 404)
  if (order.status === 'refunded') return c.json({ error: 'Đơn hàng đã được hoàn tiền.' }, 400)
  const newBalance = order.balance + order.total_price
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE orders SET status = 'refunded' WHERE id = ?").bind(order.id),
    c.env.DB.prepare('UPDATE users SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(newBalance, order.user_id),
    c.env.DB.prepare('INSERT INTO transactions (user_id, type, amount, balance_after, note) VALUES (?,?,?,?,?)').bind(order.user_id, 'refund', order.total_price, newBalance, `Hoàn tiền đơn #${order.id}`),
  ])
  return c.json({ message: 'Hoàn tiền thành công.' })
})

// ── Recharges ──
adminRoutes.get('/recharges', async (c) => {
  const { status, page = '1', limit = '20' } = c.req.query()
  const pageNum = Number(page), limitNum = Number(limit), offset = (pageNum - 1) * limitNum
  let baseQ = 'FROM recharge_requests r JOIN users u ON r.user_id = u.id WHERE 1=1'
  const params = []
  if (status) { baseQ += ' AND r.status = ?'; params.push(status) }
  const countResult = await c.env.DB.prepare(`SELECT COUNT(*) as total ${baseQ}`).bind(...params).first()
  const rows = await c.env.DB.prepare(`SELECT r.*, u.username ${baseQ} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`).bind(...params, limitNum, offset).all()
  return c.json({ recharges: rows.results, total: countResult.total, page: pageNum, pages: Math.ceil(countResult.total / limitNum) })
})

adminRoutes.put('/recharges/:id/approve', async (c) => {
  const recharge = await c.env.DB.prepare('SELECT r.*, u.balance FROM recharge_requests r JOIN users u ON r.user_id = u.id WHERE r.id = ?').bind(c.req.param('id')).first()
  if (!recharge) return c.json({ error: 'Yêu cầu không tồn tại.' }, 404)
  if (recharge.status !== 'pending') return c.json({ error: 'Yêu cầu đã được xử lý.' }, 400)
  const newBalance = recharge.balance + recharge.amount
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE recharge_requests SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(recharge.id),
    c.env.DB.prepare('UPDATE users SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(newBalance, recharge.user_id),
    c.env.DB.prepare('INSERT INTO transactions (user_id, type, amount, balance_after, note) VALUES (?,?,?,?,?)').bind(recharge.user_id, 'recharge', recharge.amount, newBalance, `Nạp tiền qua ${recharge.method} - #${recharge.id}`),
    c.env.DB.prepare('INSERT INTO activity_logs (user_id, action, detail) VALUES (?,?,?)').bind(recharge.user_id, 'recharge_approved', `Nạp ${recharge.amount.toLocaleString()}đ đã được duyệt`),
  ])
  return c.json({ message: 'Đã duyệt yêu cầu nạp tiền.' })
})

adminRoutes.put('/recharges/:id/reject', async (c) => {
  const { note } = await c.req.json()
  await c.env.DB.prepare("UPDATE recharge_requests SET status = 'rejected', note = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(note || '', c.req.param('id')).run()
  return c.json({ message: 'Đã từ chối yêu cầu nạp tiền.' })
})

// ── Transactions ──
adminRoutes.get('/transactions', async (c) => {
  const { user_id, page = '1', limit = '50' } = c.req.query()
  const pageNum = Number(page), limitNum = Number(limit), offset = (pageNum - 1) * limitNum
  let baseQ = 'FROM transactions t JOIN users u ON t.user_id = u.id WHERE 1=1'
  const params = []
  if (user_id) { baseQ += ' AND t.user_id = ?'; params.push(Number(user_id)) }
  const countResult = await c.env.DB.prepare(`SELECT COUNT(*) as total ${baseQ}`).bind(...params).first()
  const rows = await c.env.DB.prepare(`SELECT t.*, u.username ${baseQ} ORDER BY t.created_at DESC LIMIT ? OFFSET ?`).bind(...params, limitNum, offset).all()
  return c.json({ transactions: rows.results, total: countResult.total, page: pageNum, pages: Math.ceil(countResult.total / limitNum) })
})

// ── Settings ──
adminRoutes.get('/settings', async (c) => {
  const rows = await c.env.DB.prepare('SELECT * FROM settings').all()
  const settings = {}
  rows.results.forEach(r => { settings[r.key] = r.value })
  return c.json({ settings })
})

adminRoutes.put('/settings', async (c) => {
  const body = await c.req.json()
  const stmts = Object.entries(body).map(([key, value]) =>
    c.env.DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?,?)').bind(key, typeof value === 'string' ? value : JSON.stringify(value))
  )
  await c.env.DB.batch(stmts)
  return c.json({ message: 'Cập nhật cài đặt thành công.' })
})

// ── Logs ──
adminRoutes.get('/logs', async (c) => {
  const { user_id, page = '1', limit = '50' } = c.req.query()
  const pageNum = Number(page), limitNum = Number(limit), offset = (pageNum - 1) * limitNum
  let baseQ = 'FROM activity_logs l JOIN users u ON l.user_id = u.id WHERE 1=1'
  const params = []
  if (user_id) { baseQ += ' AND l.user_id = ?'; params.push(Number(user_id)) }
  const rows = await c.env.DB.prepare(`SELECT l.*, u.username ${baseQ} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`).bind(...params, limitNum, offset).all()
  return c.json({ logs: rows.results })
})
