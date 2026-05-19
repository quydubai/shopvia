import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Heart, Trash2, ShoppingCart, Loader2 } from 'lucide-react'
import { api, formatVND } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }

    // Load favorites from localStorage
    const saved = JSON.parse(localStorage.getItem(`fav_${user.id}`) || '[]')
    setFavorites(saved)

    // Fetch all products to match favorites
    api.getProducts('limit=100').then((d) => {
      const favProducts = d.products.filter((p) => saved.includes(p.id))
      setProducts(favProducts)
    }).finally(() => setLoading(false))
  }, [user, authLoading])

  const removeFav = (productId) => {
    const updated = favorites.filter((id) => id !== productId)
    setFavorites(updated)
    setProducts((prev) => prev.filter((p) => p.id !== productId))
    localStorage.setItem(`fav_${user.id}`, JSON.stringify(updated))
  }

  const clearAll = () => {
    setFavorites([])
    setProducts([])
    localStorage.setItem(`fav_${user.id}`, '[]')
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={32} /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-[var(--accent)] transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-[24px] font-bold text-heading flex items-center gap-2"><Heart size={22} style={{ color: 'var(--accent)' }} /> Yêu thích</h1>
            <p className="text-[13px] text-muted">{products.length} sản phẩm đã lưu</p>
          </div>
        </div>
        {products.length > 0 && (
          <button onClick={clearAll} className="text-[12px] text-red-400 hover:text-red-300 flex items-center gap-1"><Trash2 size={12} /> Xóa tất cả</button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="card p-10 text-center">
          <Heart size={48} className="text-muted mx-auto mb-4" />
          <h2 className="text-[18px] font-semibold text-heading mb-2">Chưa có sản phẩm yêu thích</h2>
          <p className="text-[14px] text-muted mb-6">Nhấn vào biểu tượng trái tim trên trang sản phẩm để thêm vào danh sách yêu thích.</p>
          <Link to="/" className="inline-flex items-center gap-2 btn-primary px-6 py-2.5 rounded-xl text-[14px]">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((p) => (
            <div key={p.id} className="card p-4 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] text-muted px-2 py-0.5 rounded font-medium" style={{ background: 'var(--bg-elevated)' }}>{p.parent_group}</span>
                  <h3 className="text-[14px] font-semibold text-heading mt-2 truncate">{p.name}</h3>
                  {p.description && <p className="text-[12px] text-muted mt-1 truncate">{p.description}</p>}
                </div>
                <button onClick={() => removeFav(p.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/20 shrink-0 ml-2" title="Bỏ yêu thích">
                  <Heart size={16} fill="currentColor" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                <div>
                  <div className="text-[15px] font-bold" style={{ color: 'var(--accent)' }}>{formatVND(p.price)}</div>
                  <span className={`text-[11px] font-medium ${p.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {p.stock > 0 ? `Còn ${p.stock}` : 'Hết hàng'}
                  </span>
                </div>
                <Link to={`/category/${p.category_slug}`} className="flex items-center gap-1.5 btn-primary px-4 py-2 rounded-xl text-[13px]">
                  <ShoppingCart size={14} /> Mua ngay
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
