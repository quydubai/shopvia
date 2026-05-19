import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Package, AlertCircle, CheckCircle, Loader2, Copy, Heart, ShieldAlert, Minus, Plus, Tag, BarChart3, Layers } from 'lucide-react'
import { api, formatVND } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function CategoryPage() {
  const { slug } = useParams()
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [buyingId, setBuyingId] = useState(null)
  const [quantities, setQuantities] = useState({})
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [confirmProduct, setConfirmProduct] = useState(null)
  const [favs, setFavs] = useState(() => user ? JSON.parse(localStorage.getItem(`fav_${user.id}`) || '[]') : [])

  const toggleFav = (id) => {
    if (!user) return navigate('/login')
    const updated = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id]
    setFavs(updated)
    localStorage.setItem(`fav_${user.id}`, JSON.stringify(updated))
  }

  useEffect(() => {
    setLoading(true)
    api.getProductsByCategory(slug)
      .then((data) => { setCategory(data.category); setProducts(data.products) })
      .catch(() => setError('Không tìm thấy danh mục.'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleBuyClick = (product) => {
    if (!user) return navigate('/login')
    if (product.stock <= 0) return setError('Sản phẩm đã hết hàng.')
    const qty = quantities[product.id] || 1
    if (qty > product.stock) return setError(`Chỉ còn ${product.stock} sản phẩm.`)
    setError('')
    setConfirmProduct({ ...product, qty })
  }

  const handleConfirmBuy = async () => {
    if (!confirmProduct) return
    const { qty } = confirmProduct
    setBuyingId(confirmProduct.id)
    setConfirmProduct(null)
    setResult(null)
    try {
      const data = await api.buyProduct({ product_id: confirmProduct.id, quantity: qty })
      setResult({ productName: confirmProduct.name, ...data })
      await refreshUser()
      setProducts((prev) => prev.map((p) => p.id === confirmProduct.id ? { ...p, stock: p.stock - qty, sold: p.sold + qty } : p))
    } catch (err) {
      setError(err.message)
    }
    setBuyingId(null)
  }

  const copyData = () => {
    if (result?.data) { navigator.clipboard.writeText(result.data); }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={32} /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <div className="flex items-center gap-2 text-[13px] text-muted mb-6">
        <Link to="/" className="hover:text-[var(--accent)] transition-colors">Trang chủ</Link>
        <span>/</span>
        {category && <><span className="text-body">{category.parent_group}</span><span>/</span></>}
        <span style={{ color: 'var(--accent)' }}>{category?.name || slug}</span>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-[var(--accent)] transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-[24px] font-bold text-heading">{category?.name || slug}</h1>
          {category?.parent_group && <p className="text-[13px] text-muted">{category.parent_group}</p>}
        </div>
      </div>

      {/* Confirm purchase modal */}
      {confirmProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setConfirmProduct(null)}>
          <div className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={20} style={{ color: 'var(--accent)' }} />
              <h3 className="text-[18px] font-bold text-heading">Xác nhận đơn hàng</h3>
            </div>
            <div className="rounded-xl p-4 mb-4 space-y-2" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted">Sản phẩm:</span>
                <span className="text-heading font-medium">{confirmProduct.name}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted">Đơn giá:</span>
                <span className="font-bold" style={{ color: 'var(--accent)' }}>{formatVND(confirmProduct.price)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted">Số lượng:</span>
                <span className="text-heading font-medium">{confirmProduct.qty}</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between text-[14px]" style={{ borderColor: 'var(--border-primary)' }}>
                <span className="text-heading font-semibold">Tổng thanh toán:</span>
                <span className="font-bold text-red-400">{formatVND(confirmProduct.price * confirmProduct.qty)}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-muted">Số dư hiện tại:</span>
                <span className="font-medium" style={{ color: 'var(--accent)' }}>{formatVND(user?.balance || 0)}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-muted">Số dư sau mua:</span>
                <span className="font-medium text-body">{formatVND((user?.balance || 0) - confirmProduct.price * confirmProduct.qty)}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl mb-4 bg-yellow-900/10 border border-yellow-800/20">
              <ShieldAlert size={14} className="text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-yellow-400/90 leading-relaxed">
                Bằng việc xác nhận, bạn đồng ý với điều khoản sử dụng và từ chối trách nhiệm của HuynhQuyMedia.Net.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmProduct(null)} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-body hover:bg-[var(--bg-hover)] transition-colors" style={{ border: '1px solid var(--border-primary)' }}>Hủy</button>
              <button onClick={handleConfirmBuy} className="flex-1 btn-primary py-2.5 rounded-xl text-[13px] font-semibold">Xác nhận mua</button>
            </div>
          </div>
        </div>
      )}

      {/* Purchase result modal */}
      {result && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setResult(null)}>
          <div className="card p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-green-400" />
              <h3 className="text-[18px] font-bold text-heading">Mua hàng thành công!</h3>
            </div>
            <p className="text-[14px] text-body mb-3">Đơn hàng #{result.order_id} — {result.productName}</p>
            <p className="text-[13px] text-muted mb-2">Số dư còn lại: <span style={{ color: 'var(--accent)' }} className="font-bold">{formatVND(result.balance)}</span></p>
            <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-muted font-bold uppercase">Dữ liệu nhận được:</span>
                <button onClick={copyData} className="flex items-center gap-1 text-[12px] hover:underline" style={{ color: 'var(--accent)' }}><Copy size={12} /> Copy</button>
              </div>
              <pre className="text-[13px] text-green-400 whitespace-pre-wrap break-all font-mono">{result.data || 'Không có dữ liệu'}</pre>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl mb-4 bg-yellow-900/10 border border-yellow-800/20">
              <ShieldAlert size={14} className="text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-yellow-400/90 leading-relaxed">
                Lưu ý: Sản phẩm chỉ được sử dụng cho mục đích hợp pháp. HuynhQuyMedia.Net không chịu trách nhiệm nếu bạn sử dụng sai mục đích.
              </p>
            </div>
            <button onClick={() => setResult(null)} className="w-full btn-primary py-2.5 rounded-xl font-semibold">Đóng</button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-3 mb-5 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <span className="text-[13px] text-red-400">{error}</span>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-soft)' }}>
            <Layers size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <div className="text-[11px] text-muted uppercase font-medium">Sản phẩm</div>
            <div className="text-[16px] font-bold text-heading">{products.length}</div>
          </div>
        </div>
        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-900/20">
            <Package size={16} className="text-green-400" />
          </div>
          <div>
            <div className="text-[11px] text-muted uppercase font-medium">Còn hàng</div>
            <div className="text-[16px] font-bold text-green-400">{products.filter(p => p.stock > 0).length}</div>
          </div>
        </div>
        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-900/20">
            <BarChart3 size={16} className="text-blue-400" />
          </div>
          <div>
            <div className="text-[11px] text-muted uppercase font-medium">Tổng kho</div>
            <div className="text-[16px] font-bold text-blue-400">{products.reduce((s, p) => s + p.stock, 0)}</div>
          </div>
        </div>
        <div className="card p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-900/20">
            <Tag size={16} className="text-purple-400" />
          </div>
          <div>
            <div className="text-[11px] text-muted uppercase font-medium">Giá từ</div>
            <div className="text-[16px] font-bold text-purple-400">{products.length > 0 ? formatVND(Math.min(...products.map(p => p.price))) : '—'}</div>
          </div>
        </div>
      </div>

      {/* Balance bar */}
      <div className="card p-3 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle size={14} style={{ color: 'var(--accent)' }} />
          <span className="text-[13px] text-body">
            {user ? <>Số dư: <strong style={{ color: 'var(--accent)' }}>{formatVND(user.balance)}</strong></> : 'Vui lòng đăng nhập để mua hàng'}
          </span>
        </div>
        {!user && <Link to="/login" className="btn-primary px-4 py-1.5 rounded-lg text-[12px] font-semibold">Đăng nhập</Link>}
      </div>

      {/* Product list */}
      {products.length === 0 ? (
        <div className="card p-12 text-center">
          <Package size={40} className="mx-auto mb-3 text-muted" />
          <p className="text-[15px] text-muted">Chưa có sản phẩm trong danh mục này.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p, i) => {
            const qty = quantities[p.id] || 1
            const total = p.price * qty
            return (
              <div key={p.id} className="card overflow-hidden group hover:shadow-lg transition-all duration-200">
                <div className="flex flex-col sm:flex-row">
                  {/* Left: Info */}
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>#{i + 1}</span>
                          <h3 className="text-[15px] font-semibold text-heading leading-tight">{p.name}</h3>
                        </div>
                        {p.description && <p className="text-[12px] text-muted mt-1 leading-relaxed">{p.description}</p>}
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <div className="text-[18px] font-bold" style={{ color: 'var(--accent)' }}>{formatVND(p.price)}</div>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            p.stock > 10 ? 'bg-green-900/20 text-green-400' : p.stock > 0 ? 'bg-yellow-900/20 text-yellow-400' : 'bg-red-900/20 text-red-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${p.stock > 10 ? 'bg-green-400' : p.stock > 0 ? 'bg-yellow-400' : 'bg-red-400'}`} />
                            {p.stock > 0 ? `Còn ${p.stock} sản phẩm` : 'Hết hàng'}
                          </span>
                          {p.sold > 0 && <span className="text-[11px] text-muted">Đã bán: {p.sold}</span>}
                        </div>
                      </div>
                      <button onClick={() => toggleFav(p.id)} className={`p-2 rounded-lg transition-all ${favs.includes(p.id) ? 'text-red-400 bg-red-900/10' : 'text-muted hover:text-red-400 hover:bg-red-900/10'}`} title={favs.includes(p.id) ? 'Bỏ yêu thích' : 'Thêm yêu thích'}>
                        <Heart size={16} fill={favs.includes(p.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 p-4 sm:p-5 sm:pl-0 sm:min-w-[280px]" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                    {p.stock > 0 ? (
                      <>
                        <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-primary)' }}>
                          <button
                            onClick={() => setQuantities({ ...quantities, [p.id]: Math.max(p.min_buy || 1, qty - 1) })}
                            className="w-9 h-9 flex items-center justify-center text-muted hover:text-heading hover:bg-[var(--bg-hover)] transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            min={p.min_buy}
                            max={Math.min(p.max_buy, p.stock)}
                            value={qty}
                            onChange={(e) => {
                              const v = Math.max(p.min_buy || 1, Math.min(Math.min(p.max_buy, p.stock), Number(e.target.value) || 1))
                              setQuantities({ ...quantities, [p.id]: v })
                            }}
                            className="w-12 h-9 text-center text-[13px] font-bold text-heading bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() => setQuantities({ ...quantities, [p.id]: Math.min(Math.min(p.max_buy, p.stock), qty + 1) })}
                            className="w-9 h-9 flex items-center justify-center text-muted hover:text-heading hover:bg-[var(--bg-hover)] transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="flex-1">
                          <button
                            onClick={() => handleBuyClick(p)}
                            disabled={buyingId === p.id}
                            className="w-full btn-primary py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
                          >
                            {buyingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
                            {buyingId === p.id ? 'Đang mua...' : `Mua — ${formatVND(total)}`}
                          </button>
                          <div className="text-[10px] text-muted text-center mt-1">Min: {p.min_buy || 1} — Max: {p.max_buy}</div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1">
                        <button disabled className="w-full py-2.5 rounded-xl text-[13px] font-semibold opacity-40 cursor-not-allowed flex items-center justify-center gap-2" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-primary)' }}>
                          <ShoppingCart size={14} /> Hết hàng
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Từ chối trách nhiệm */}
      <div className="card mt-6 overflow-hidden">
        <div className="px-5 py-3 flex items-center gap-2" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-primary)' }}>
          <ShieldAlert size={16} className="text-yellow-400" />
          <span className="text-[14px] font-semibold text-heading">Từ chối trách nhiệm</span>
        </div>
        <div className="px-5 py-4 space-y-3 text-[13px] text-body leading-relaxed">
          <p>
            <strong className="text-heading">1. Mục đích sử dụng hợp pháp:</strong> Tất cả sản phẩm/tài khoản được cung cấp trên hệ thống chỉ nhằm phục vụ các mục đích hợp pháp như: quản lý nội dung, quảng cáo, nghiên cứu, học tập và phát triển cá nhân. Người dùng cam kết không sử dụng sản phẩm vào bất kỳ mục đích vi phạm pháp luật nào.
          </p>
          <p>
            <strong className="text-heading">2. Không chịu trách nhiệm khi sử dụng sai mục đích:</strong> HuynhQuyMedia.Net <strong className="text-red-400">không chịu trách nhiệm</strong> đối với bất kỳ hành vi nào của người mua sau khi nhận sản phẩm, bao gồm nhưng không giới hạn: lừa đảo, spam, quấy rối, xâm phạm quyền riêng tư, vi phạm điều khoản dịch vụ của bên thứ ba hoặc bất kỳ hoạt động bất hợp pháp nào khác.
          </p>
          <p>
            <strong className="text-heading">3. Trách nhiệm thuộc về người sử dụng:</strong> Người mua hoàn toàn chịu trách nhiệm trước pháp luật về cách thức sử dụng sản phẩm/tài khoản đã mua. Mọi hậu quả phát sinh từ việc sử dụng sai mục đích đều do người mua tự chịu.
          </p>
          <p>
            <strong className="text-heading">4. Không hoàn tiền khi vi phạm:</strong> Trong trường hợp phát hiện người dùng sử dụng sản phẩm để thực hiện các hành vi vi phạm, chúng tôi có quyền khóa tài khoản và từ chối hoàn tiền mà không cần thông báo trước.
          </p>
          <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-yellow-900/10 border border-yellow-800/20">
            <AlertCircle size={14} className="text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-[12px] text-yellow-400/90">
              Bằng việc thực hiện mua hàng, bạn đồng ý rằng đã đọc, hiểu và chấp nhận toàn bộ điều khoản từ chối trách nhiệm nêu trên.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
