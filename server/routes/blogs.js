import { Router } from 'express'
import db from '../db.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = Router()

// GET /api/blogs — public list
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit

  const total = db.prepare("SELECT COUNT(*) as count FROM blogs WHERE status = 'published'").get().count
  const blogs = db.prepare(`
    SELECT b.id, b.title, b.slug, b.thumbnail, b.summary, b.views, b.created_at, b.updated_at,
           u.username as author
    FROM blogs b
    JOIN users u ON b.author_id = u.id
    WHERE b.status = 'published'
    ORDER BY b.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset)

  res.json({ blogs, total, page, totalPages: Math.ceil(total / limit) })
})

// GET /api/blogs/:slug — public detail
router.get('/:slug', (req, res) => {
  const blog = db.prepare(`
    SELECT b.*, u.username as author
    FROM blogs b
    JOIN users u ON b.author_id = u.id
    WHERE b.slug = ? AND b.status = 'published'
  `).get(req.params.slug)

  if (!blog) return res.status(404).json({ error: 'Bài viết không tồn tại.' })

  // Increment views
  db.prepare('UPDATE blogs SET views = views + 1 WHERE id = ?').run(blog.id)
  blog.views += 1

  res.json({ blog })
})

// ── Admin routes ──

// GET /api/blogs/admin/all — admin list (includes drafts)
router.get('/admin/all', authMiddleware, adminMiddleware, (req, res) => {
  const blogs = db.prepare(`
    SELECT b.*, u.username as author
    FROM blogs b
    JOIN users u ON b.author_id = u.id
    ORDER BY b.created_at DESC
  `).all()

  res.json({ blogs })
})

// POST /api/blogs/admin — create
router.post('/admin', authMiddleware, adminMiddleware, (req, res) => {
  const { title, slug, thumbnail, summary, content, status } = req.body

  if (!title || !slug || !content) return res.status(400).json({ error: 'Vui lòng điền tiêu đề, slug và nội dung.' })

  const exists = db.prepare('SELECT id FROM blogs WHERE slug = ?').get(slug)
  if (exists) return res.status(400).json({ error: 'Slug đã tồn tại.' })

  const result = db.prepare('INSERT INTO blogs (title, slug, thumbnail, summary, content, author_id, status) VALUES (?,?,?,?,?,?,?)').run(
    title, slug, thumbnail || '', summary || '', content, req.user.id, status || 'published'
  )

  res.json({ message: 'Tạo bài viết thành công.', id: result.lastInsertRowid })
})

// PUT /api/blogs/admin/:id — update
router.put('/admin/:id', authMiddleware, adminMiddleware, (req, res) => {
  const { title, slug, thumbnail, summary, content, status } = req.body
  const blog = db.prepare('SELECT * FROM blogs WHERE id = ?').get(req.params.id)
  if (!blog) return res.status(404).json({ error: 'Bài viết không tồn tại.' })

  if (slug && slug !== blog.slug) {
    const exists = db.prepare('SELECT id FROM blogs WHERE slug = ? AND id != ?').get(slug, blog.id)
    if (exists) return res.status(400).json({ error: 'Slug đã tồn tại.' })
  }

  db.prepare(`UPDATE blogs SET title=?, slug=?, thumbnail=?, summary=?, content=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(
    title || blog.title,
    slug || blog.slug,
    thumbnail !== undefined ? thumbnail : blog.thumbnail,
    summary !== undefined ? summary : blog.summary,
    content || blog.content,
    status || blog.status,
    blog.id
  )

  res.json({ message: 'Cập nhật bài viết thành công.' })
})

// DELETE /api/blogs/admin/:id — delete
router.delete('/admin/:id', authMiddleware, adminMiddleware, (req, res) => {
  const blog = db.prepare('SELECT id FROM blogs WHERE id = ?').get(req.params.id)
  if (!blog) return res.status(404).json({ error: 'Bài viết không tồn tại.' })

  db.prepare('DELETE FROM blogs WHERE id = ?').run(blog.id)
  res.json({ message: 'Xóa bài viết thành công.' })
})

export default router
