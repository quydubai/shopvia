import { Hono } from 'hono'

export const productRoutes = new Hono()

function calcStock(dataContent) {
  return (dataContent || '').split('\n').filter(l => l.trim()).length
}

// GET /api/products/categories/all  — phải đặt TRƯỚC /:slug
productRoutes.get('/categories/all', async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT * FROM categories ORDER BY parent_group, sort_order'
  ).all()
  const categories = rows.results
  const grouped = {}
  categories.forEach(cat => {
    if (!grouped[cat.parent_group]) grouped[cat.parent_group] = []
    grouped[cat.parent_group].push(cat)
  })
  return c.json({ categories, grouped })
})

// GET /api/products/by-category/:slug  — phải đặt TRƯỚC /:slug
productRoutes.get('/by-category/:slug', async (c) => {
  const category = await c.env.DB.prepare(
    'SELECT * FROM categories WHERE slug = ?'
  ).bind(c.req.param('slug')).first()
  if (!category) return c.json({ error: 'Danh mục không tồn tại.' }, 404)

  const rows = await c.env.DB.prepare(
    `SELECT id, name, slug, description, price, data_content, min_buy, max_buy, sold, status
     FROM products WHERE category_id = ? AND status = 'active' ORDER BY created_at DESC`
  ).bind(category.id).all()

  const products = rows.results.map(p => {
    const stock = calcStock(p.data_content)
    const { data_content, ...rest } = p
    return { ...rest, stock }
  })
  return c.json({ category, products })
})

// GET /api/products
productRoutes.get('/', async (c) => {
  const { category, search, page = '1', limit = '20' } = c.req.query()
  const pageNum = Number(page)
  const limitNum = Number(limit)
  const offset = (pageNum - 1) * limitNum

  let baseQ = `FROM products p JOIN categories c ON p.category_id = c.id WHERE p.status = 'active'`
  const params = []
  if (category) { baseQ += ' AND c.slug = ?'; params.push(category) }
  if (search) { baseQ += ' AND p.name LIKE ?'; params.push(`%${search}%`) }

  const countResult = await c.env.DB.prepare(`SELECT COUNT(*) as total ${baseQ}`).bind(...params).first()
  const rows = await c.env.DB.prepare(
    `SELECT p.id, p.name, p.slug, p.description, p.price, p.data_content, p.min_buy, p.max_buy, p.sold, p.status, p.created_at,
            c.name as category_name, c.slug as category_slug, c.parent_group
     ${baseQ} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, limitNum, offset).all()

  const products = rows.results.map(p => {
    const stock = calcStock(p.data_content)
    const { data_content, ...rest } = p
    return { ...rest, stock }
  })
  return c.json({ products, total: countResult.total, page: pageNum, pages: Math.ceil(countResult.total / limitNum) })
})

// GET /api/products/:slug
productRoutes.get('/:slug', async (c) => {
  const product = await c.env.DB.prepare(
    `SELECT p.*, c.name as category_name, c.slug as category_slug, c.parent_group
     FROM products p JOIN categories c ON p.category_id = c.id WHERE p.slug = ?`
  ).bind(c.req.param('slug')).first()

  if (!product) return c.json({ error: 'Sản phẩm không tồn tại.' }, 404)
  const stock = calcStock(product.data_content)
  const { data_content, ...rest } = product
  return c.json({ product: { ...rest, stock } })
})
