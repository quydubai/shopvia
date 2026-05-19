import { Router } from 'express'
import db from '../db.js'

const router = Router()

// GET /api/products — list products with optional category filter
router.get('/', (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query
  const offset = (page - 1) * limit
  let query = `SELECT p.*, c.name as category_name, c.slug as category_slug, c.parent_group
    FROM products p JOIN categories c ON p.category_id = c.id WHERE p.status = 'active'`
  const params = []

  if (category) {
    query += ' AND c.slug = ?'
    params.push(category)
  }
  if (search) {
    query += ' AND p.name LIKE ?'
    params.push(`%${search}%`)
  }

  const countQ = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM')
  const total = db.prepare(countQ).get(...params).total

  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?'
  params.push(Number(limit), Number(offset))

  const products = db.prepare(query).all(...params).map(p => {
    const realStock = (p.data_content || '').split('\n').filter(l => l.trim()).length
    delete p.data_content
    return { ...p, stock: realStock }
  })

  res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) })
})

// GET /api/products/:slug
router.get('/:slug', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name, c.slug as category_slug, c.parent_group
    FROM products p JOIN categories c ON p.category_id = c.id WHERE p.slug = ?
  `).get(req.params.slug)

  if (!product) return res.status(404).json({ error: 'Sản phẩm không tồn tại.' })
  product.stock = (product.data_content || '').split('\n').filter(l => l.trim()).length
  delete product.data_content
  res.json({ product })
})

// GET /api/categories
router.get('/categories/all', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY parent_group, sort_order').all()
  // Group by parent_group
  const grouped = {}
  categories.forEach(c => {
    if (!grouped[c.parent_group]) grouped[c.parent_group] = []
    grouped[c.parent_group].push(c)
  })
  res.json({ categories, grouped })
})

// GET /api/products/by-category/:slug
router.get('/by-category/:slug', (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE slug = ?').get(req.params.slug)
  if (!category) return res.status(404).json({ error: 'Danh mục không tồn tại.' })

  const products = db.prepare(`
    SELECT p.id, p.name, p.slug, p.description, p.price, p.stock, p.data_content, p.min_buy, p.max_buy, p.sold, p.status
    FROM products p WHERE p.category_id = ? AND p.status = 'active' ORDER BY p.created_at DESC
  `).all(category.id).map(p => {
    const realStock = (p.data_content || '').split('\n').filter(l => l.trim()).length
    delete p.data_content
    return { ...p, stock: realStock }
  })

  res.json({ category, products })
})

export default router
