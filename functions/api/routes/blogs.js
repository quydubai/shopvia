import { Hono } from 'hono'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

export const blogRoutes = new Hono()

// Admin routes — đặt TRƯỚC /:slug
blogRoutes.get('/admin/all', authMiddleware(), adminMiddleware(), async (c) => {
  const rows = await c.env.DB.prepare(
    `SELECT b.*, u.username as author FROM blogs b JOIN users u ON b.author_id = u.id ORDER BY b.created_at DESC`
  ).all()
  return c.json({ blogs: rows.results })
})

blogRoutes.post('/admin', authMiddleware(), adminMiddleware(), async (c) => {
  const { title, slug, thumbnail, summary, content, status } = await c.req.json()
  const user = c.get('user')
  if (!title || !slug || !content) return c.json({ error: 'Vui lòng điền tiêu đề, slug và nội dung.' }, 400)
  const exists = await c.env.DB.prepare('SELECT id FROM blogs WHERE slug = ?').bind(slug).first()
  if (exists) return c.json({ error: 'Slug đã tồn tại.' }, 400)
  const result = await c.env.DB.prepare(
    'INSERT INTO blogs (title, slug, thumbnail, summary, content, author_id, status) VALUES (?,?,?,?,?,?,?)'
  ).bind(title, slug, thumbnail || '', summary || '', content, user.id, status || 'published').run()
  return c.json({ message: 'Tạo bài viết thành công.', id: result.meta.last_row_id })
})

blogRoutes.put('/admin/:id', authMiddleware(), adminMiddleware(), async (c) => {
  const { title, slug, thumbnail, summary, content, status } = await c.req.json()
  const blog = await c.env.DB.prepare('SELECT * FROM blogs WHERE id = ?').bind(c.req.param('id')).first()
  if (!blog) return c.json({ error: 'Bài viết không tồn tại.' }, 404)
  if (slug && slug !== blog.slug) {
    const exists = await c.env.DB.prepare('SELECT id FROM blogs WHERE slug = ? AND id != ?').bind(slug, blog.id).first()
    if (exists) return c.json({ error: 'Slug đã tồn tại.' }, 400)
  }
  await c.env.DB.prepare(
    `UPDATE blogs SET title=?, slug=?, thumbnail=?, summary=?, content=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
  ).bind(title || blog.title, slug || blog.slug, thumbnail !== undefined ? thumbnail : blog.thumbnail, summary !== undefined ? summary : blog.summary, content || blog.content, status || blog.status, blog.id).run()
  return c.json({ message: 'Cập nhật bài viết thành công.' })
})

blogRoutes.delete('/admin/:id', authMiddleware(), adminMiddleware(), async (c) => {
  const blog = await c.env.DB.prepare('SELECT id FROM blogs WHERE id = ?').bind(c.req.param('id')).first()
  if (!blog) return c.json({ error: 'Bài viết không tồn tại.' }, 404)
  await c.env.DB.prepare('DELETE FROM blogs WHERE id = ?').bind(blog.id).run()
  return c.json({ message: 'Xóa bài viết thành công.' })
})

// Public routes
blogRoutes.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '10')
  const offset = (page - 1) * limit

  const countResult = await c.env.DB.prepare("SELECT COUNT(*) as count FROM blogs WHERE status = 'published'").first()
  const rows = await c.env.DB.prepare(
    `SELECT b.id, b.title, b.slug, b.thumbnail, b.summary, b.views, b.created_at, b.updated_at, u.username as author
     FROM blogs b JOIN users u ON b.author_id = u.id
     WHERE b.status = 'published' ORDER BY b.created_at DESC LIMIT ? OFFSET ?`
  ).bind(limit, offset).all()

  return c.json({ blogs: rows.results, total: countResult.count, page, totalPages: Math.ceil(countResult.count / limit) })
})

blogRoutes.get('/:slug', async (c) => {
  const blog = await c.env.DB.prepare(
    `SELECT b.*, u.username as author FROM blogs b JOIN users u ON b.author_id = u.id WHERE b.slug = ? AND b.status = 'published'`
  ).bind(c.req.param('slug')).first()
  if (!blog) return c.json({ error: 'Bài viết không tồn tại.' }, 404)
  c.env.DB.prepare('UPDATE blogs SET views = views + 1 WHERE id = ?').bind(blog.id).run()
  return c.json({ blog: { ...blog, views: blog.views + 1 } })
})
