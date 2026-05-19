import { useState, useEffect } from 'react'
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, X, Save } from 'lucide-react'
import { api } from '../../lib/api'

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ title: '', slug: '', summary: '', content: '', status: 'published' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    api.admin.getBlogs().then((d) => setBlogs(d.blogs)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm({ title: '', slug: '', summary: '', content: '', status: 'published' })
    setError('')
    setModal('create')
  }

  const openEdit = (blog) => {
    setForm({ title: blog.title, slug: blog.slug, summary: blog.summary, content: blog.content, status: blog.status })
    setError('')
    setModal(blog.id)
  }

  const handleTitleChange = (val) => {
    setForm((f) => ({
      ...f,
      title: val,
      slug: modal === 'create' ? slugify(val) : f.slug,
    }))
  }

  const handleSave = async () => {
    setError('')
    if (!form.title || !form.slug || !form.content) return setError('Vui lòng điền tiêu đề, slug và nội dung.')
    setSaving(true)
    try {
      if (modal === 'create') {
        await api.admin.createBlog(form)
      } else {
        await api.admin.updateBlog(modal, form)
      }
      setModal(null)
      load()
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Xác nhận xóa bài viết này?')) return
    try {
      await api.admin.deleteBlog(id)
      load()
    } catch {}
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={32} /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-bold text-heading">Quản lý bài viết</h1>
        <button onClick={openCreate} className="flex items-center gap-2 btn-primary px-4 py-2 rounded-xl text-[13px]">
          <Plus size={16} /> Tạo bài viết
        </button>
      </div>

      <div className="card overflow-hidden">
        {blogs.length === 0 ? (
          <div className="p-8 text-center text-[14px] text-muted">Chưa có bài viết nào.</div>
        ) : (
          <div>
            {blogs.map((blog) => (
              <div key={blog.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-heading truncate">{blog.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${blog.status === 'published' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                      {blog.status === 'published' ? 'Đã đăng' : 'Nháp'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted mt-1">
                    <span>/{blog.slug}</span>
                    <span>{blog.views} views</span>
                    <span>@{blog.author}</span>
                    <span>{new Date(blog.created_at).toLocaleDateString('vi')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(blog)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-[var(--accent)] transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(blog.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-red-400 transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="card w-full max-w-[700px] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <h2 className="text-[16px] font-bold text-heading">{modal === 'create' ? 'Tạo bài viết mới' : 'Chỉnh sửa bài viết'}</h2>
              <button onClick={() => setModal(null)} className="text-muted hover:text-heading"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[13px] text-body mb-1.5">Tiêu đề *</label>
                <input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className="w-full input-theme rounded-lg px-4 py-2.5 text-[14px]" placeholder="Nhập tiêu đề bài viết" />
              </div>
              <div>
                <label className="block text-[13px] text-body mb-1.5">Slug *</label>
                <input value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} className="w-full input-theme rounded-lg px-4 py-2.5 text-[14px]" placeholder="duong-dan-bai-viet" />
              </div>
              <div>
                <label className="block text-[13px] text-body mb-1.5">Tóm tắt</label>
                <input value={form.summary} onChange={(e) => setForm({...form, summary: e.target.value})} className="w-full input-theme rounded-lg px-4 py-2.5 text-[14px]" placeholder="Mô tả ngắn về bài viết" />
              </div>
              <div>
                <label className="block text-[13px] text-body mb-1.5">Nội dung * (hỗ trợ Markdown đơn giản)</label>
                <textarea value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} rows={12} className="w-full input-theme rounded-lg px-4 py-2.5 text-[14px] resize-y" placeholder="## Tiêu đề\nNội dung bài viết..." />
              </div>
              <div>
                <label className="block text-[13px] text-body mb-1.5">Trạng thái</label>
                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="input-theme rounded-lg px-4 py-2.5 text-[14px]">
                  <option value="published">Đã đăng</option>
                  <option value="draft">Nháp</option>
                </select>
              </div>

              {error && <p className="text-[13px] text-red-400">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg text-[13px] text-body hover:text-heading transition-colors" style={{ border: '1px solid var(--border-primary)' }}>Hủy</button>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 btn-primary disabled:opacity-50 px-5 py-2 rounded-lg text-[13px]">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {modal === 'create' ? 'Tạo' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
