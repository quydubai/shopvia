import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Loader2, Plus, Pencil, Trash2, X } from 'lucide-react'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', parent_group: '', sort_order: 0 })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => { setLoading(true); api.admin.getCategories().then((d) => setCategories(d.categories)).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const openNew = () => { setForm({ name: '', slug: '', parent_group: '', sort_order: 0 }); setModal('new'); setError('') }
  const openEdit = (c) => { setForm({ name: c.name, slug: c.slug, parent_group: c.parent_group, sort_order: c.sort_order }); setModal(c); setError('') }

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      if (modal === 'new') await api.admin.createCategory(form)
      else await api.admin.updateCategory(modal.id, form)
      setModal(null); load()
    } catch (err) { setError(err.message) }
    setSaving(false)
  }

  const handleDelete = async (c) => {
    if (!confirm(`Xóa danh mục "${c.name}"?`)) return
    try { await api.admin.deleteCategory(c.id); load() } catch (err) { alert(err.message) }
  }

  const groups = [...new Set(categories.map((c) => c.parent_group).filter(Boolean))]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-bold text-heading">Quản lý danh mục</h1>
        <button onClick={openNew} className="flex items-center gap-1.5 btn-primary px-4 py-2 rounded-xl text-[13px]"><Plus size={16} /> Thêm danh mục</button>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] font-bold text-heading">{modal === 'new' ? 'Thêm danh mục' : 'Sửa danh mục'}</h3>
              <button onClick={() => setModal(null)} className="text-muted hover:text-heading"><X size={20} /></button>
            </div>
            {error && <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 mb-4 text-[13px] text-red-400">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] text-muted mb-1">Nhóm</label>
                <input list="groups" value={form.parent_group} onChange={(e) => setForm({ ...form, parent_group: e.target.value })} placeholder="VD: CLONE, TÀI KHOẢN..." className="w-full input-theme rounded-lg px-3 py-2 text-[13px]" />
                <datalist id="groups">{groups.map((g) => <option key={g} value={g} />)}</datalist>
              </div>
              <div>
                <label className="block text-[12px] text-muted mb-1">Tên danh mục *</label>
                <input value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value, slug: modal === 'new' ? autoSlug(e.target.value) : form.slug }) }} className="w-full input-theme rounded-lg px-3 py-2 text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] text-muted mb-1">Slug *</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full input-theme rounded-lg px-3 py-2 text-[13px]" />
              </div>
              <div>
                <label className="block text-[12px] text-muted mb-1">Thứ tự</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="w-full input-theme rounded-lg px-3 py-2 text-[13px]" />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModal(null)} className="px-4 py-2 rounded-lg text-[13px] text-body" style={{ border: '1px solid var(--border-primary)' }}>Hủy</button>
                <button type="submit" disabled={saving} className="btn-primary px-6 py-2 rounded-lg text-[13px] disabled:opacity-60">{saving ? 'Lưu...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={28} /></div> : (
        <div className="card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-muted" style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-elevated)' }}>
                <th className="px-4 py-2.5 text-left font-medium">ID</th>
                <th className="px-4 py-2.5 text-left font-medium">Nhóm</th>
                <th className="px-4 py-2.5 text-left font-medium">Tên</th>
                <th className="px-4 py-2.5 text-left font-medium">Slug</th>
                <th className="px-4 py-2.5 text-left font-medium">STT</th>
                <th className="px-4 py-2.5 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-[var(--bg-hover)]" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                  <td className="px-4 py-2.5 text-muted">{c.id}</td>
                  <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--accent)' }}>{c.parent_group}</td>
                  <td className="px-4 py-2.5 text-heading">{c.name}</td>
                  <td className="px-4 py-2.5 text-muted font-mono">{c.slug}</td>
                  <td className="px-4 py-2.5 text-body">{c.sort_order}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-900/20"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(c)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/20"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
