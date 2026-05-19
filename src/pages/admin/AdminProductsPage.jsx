import { useState, useEffect } from 'react'
import { api, formatVND } from '../../lib/api'
import { Search, Loader2, Plus, Pencil, Trash2, X } from 'lucide-react'

function ProductModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState(product || {
    category_id: '', name: '', slug: '', description: '', price: 0, stock: 0, data_content: '', min_buy: 1, max_buy: 100, status: 'active'
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      if (product) { await api.admin.updateProduct(product.id, form) }
      else { await api.admin.createProduct(form) }
      onSave()
    } catch (err) { setError(err.message) }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold text-heading">{product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h3>
          <button onClick={onClose} className="text-muted hover:text-heading"><X size={20} /></button>
        </div>
        {error && <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 mb-4 text-[13px] text-red-400">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-muted mb-1">Danh mục *</label>
              <select value={form.category_id} onChange={(e) => update('category_id', Number(e.target.value))} className="w-full input-theme rounded-lg px-3 py-2 text-[13px]">
                <option value="">Chọn danh mục</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.parent_group} — {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] text-muted mb-1">Trạng thái</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value)} className="w-full input-theme rounded-lg px-3 py-2 text-[13px]">
                <option value="active">Hiển thị</option>
                <option value="hidden">Ẩn</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[12px] text-muted mb-1">Tên sản phẩm *</label>
            <input value={form.name} onChange={(e) => { update('name', e.target.value); if (!product) update('slug', autoSlug(e.target.value)) }} className="w-full input-theme rounded-lg px-3 py-2 text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] text-muted mb-1">Slug *</label>
            <input value={form.slug} onChange={(e) => update('slug', e.target.value)} className="w-full input-theme rounded-lg px-3 py-2 text-[13px]" />
          </div>
          <div>
            <label className="block text-[12px] text-muted mb-1">Mô tả</label>
            <input value={form.description} onChange={(e) => update('description', e.target.value)} className="w-full input-theme rounded-lg px-3 py-2 text-[13px]" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-[12px] text-muted mb-1">Giá (VNĐ)</label>
              <input type="number" value={form.price} onChange={(e) => update('price', Number(e.target.value))} className="w-full input-theme rounded-lg px-3 py-2 text-[13px]" />
            </div>
            <div>
              <label className="block text-[12px] text-muted mb-1">Tồn kho</label>
              <input type="number" value={(form.data_content || '').split('\n').filter(l => l.trim()).length} readOnly className="w-full input-theme rounded-lg px-3 py-2 text-[13px] opacity-70 cursor-not-allowed" title="Tự tính từ số dòng dữ liệu" />
            </div>
            <div>
              <label className="block text-[12px] text-muted mb-1">Min mua</label>
              <input type="number" value={form.min_buy} onChange={(e) => update('min_buy', Number(e.target.value))} className="w-full input-theme rounded-lg px-3 py-2 text-[13px]" />
            </div>
            <div>
              <label className="block text-[12px] text-muted mb-1">Max mua</label>
              <input type="number" value={form.max_buy} onChange={(e) => update('max_buy', Number(e.target.value))} className="w-full input-theme rounded-lg px-3 py-2 text-[13px]" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[12px] text-muted">Dữ liệu sản phẩm (mỗi dòng = 1 sản phẩm)</label>
              <span className="text-[12px] font-bold" style={{ color: 'var(--accent)' }}>{(form.data_content || '').split('\n').filter(l => l.trim()).length} dòng = tồn kho</span>
            </div>
            <textarea value={form.data_content} onChange={(e) => update('data_content', e.target.value)} rows={6} className="w-full input-theme rounded-lg px-3 py-2 text-[13px] font-mono resize-y" placeholder="account1@email.com|pass123&#10;account2@email.com|pass456" />
            <p className="text-[11px] text-muted mt-1">Tồn kho tự động tính bằng số dòng dữ liệu (bỏ qua dòng trống). Khi khách mua, dữ liệu sẽ được giao từ trên xuống.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] text-body hover:bg-[var(--bg-hover)]" style={{ border: '1px solid var(--border-primary)' }}>Hủy</button>
            <button type="submit" disabled={saving} className="btn-primary px-6 py-2 rounded-lg text-[13px] disabled:opacity-60">
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'new' | product

  const load = () => {
    setLoading(true)
    Promise.all([api.admin.getProducts(`search=${search}`), api.admin.getCategories()])
      .then(([p, c]) => { setProducts(p.products); setCategories(c.categories) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (p) => {
    if (!confirm(`Xóa sản phẩm "${p.name}"?`)) return
    try { await api.admin.deleteProduct(p.id); load() } catch (err) { alert(err.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-bold text-heading">Quản lý sản phẩm</h1>
        <button onClick={() => setModal('new')} className="flex items-center gap-1.5 btn-primary px-4 py-2 rounded-xl text-[13px]">
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); load() }} className="flex gap-2 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm sản phẩm..." className="w-full input-theme rounded-xl pl-9 pr-4 py-2 text-[13px]" />
        </div>
        <button type="submit" className="btn-primary px-4 py-2 rounded-xl text-[13px]">Tìm</button>
      </form>

      {modal && (
        <ProductModal
          product={modal !== 'new' ? modal : null}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }}
        />
      )}

      {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={28} /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-muted" style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-elevated)' }}>
                  <th className="px-4 py-2.5 text-left font-medium">ID</th>
                  <th className="px-4 py-2.5 text-left font-medium">Tên</th>
                  <th className="px-4 py-2.5 text-left font-medium">Danh mục</th>
                  <th className="px-4 py-2.5 text-left font-medium">Giá</th>
                  <th className="px-4 py-2.5 text-left font-medium">Kho</th>
                  <th className="px-4 py-2.5 text-left font-medium">Đã bán</th>
                  <th className="px-4 py-2.5 text-left font-medium">TT</th>
                  <th className="px-4 py-2.5 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--bg-hover)]" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                    <td className="px-4 py-2.5 text-muted">{p.id}</td>
                    <td className="px-4 py-2.5 text-heading font-medium">{p.name}</td>
                    <td className="px-4 py-2.5 text-body">{p.category_name}</td>
                    <td className="px-4 py-2.5 font-bold" style={{ color: 'var(--accent)' }}>{formatVND(p.price)}</td>
                    <td className="px-4 py-2.5 text-body">{p.stock}</td>
                    <td className="px-4 py-2.5 text-body">{p.sold}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${p.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setModal(p)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-900/20"><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/20"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
