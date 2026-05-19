import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, ChevronRight, Star, TrendingUp, Zap, Loader2, ShieldAlert, Package, Layers, ArrowRight, Box, Headphones, Clock, MessageCircle, Send } from 'lucide-react'
import { api, formatVND } from '../lib/api'

export default function HomePage() {
  const [categories, setCategories] = useState({})
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getCategories(), api.getProducts('limit=8')])
      .then(([catData, prodData]) => {
        setCategories(catData.grouped || {})
        setProducts(prodData.products || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={32} /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[var(--accent)] via-[#e04520] to-[#ff7849] rounded-2xl p-8 lg:p-12 mb-10 relative overflow-hidden shadow-elevated">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <h1 className="text-[28px] lg:text-[38px] font-bold text-white mb-3 leading-tight">Chào mừng đến với<br/>HuynhQuyMedia.Net</h1>
          <p className="text-white/80 text-[16px] max-w-xl mb-6 leading-relaxed">Nền tảng hỗ trợ quản lý và phân phối tài nguyên số trên môi trường trực tuyến.</p>
          <div className="flex flex-wrap gap-3">
            <span className="bg-white/15 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 border border-white/10"><Zap size={14} /> Tự động hóa</span>
            <span className="bg-white/15 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 border border-white/10"><TrendingUp size={14} /> Tối ưu hiệu suất</span>
            <span className="bg-white/15 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl text-[13px] font-medium flex items-center gap-2 border border-white/10"><Star size={14} /> Uy tín</span>
          </div>
        </div>
      </div>

      {/* Hỗ trợ nhanh */}
      <div className="card overflow-hidden mb-10">
        <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-2">
            <Headphones size={18} style={{ color: 'var(--accent)' }} />
            <h2 className="text-[15px] font-bold text-heading">Hỗ trợ nhanh</h2>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-900/20 border border-green-800/30">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] font-bold text-green-400">Online</span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-elevated)' }}>
            <Clock size={14} style={{ color: 'var(--accent)' }} />
            <span className="text-[13px] text-body">Khung giờ hỗ trợ: <strong className="text-heading">8:00 — 22:00</strong> hàng ngày</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Admin 1 */}
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-secondary)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#ff7849] flex items-center justify-center text-white font-bold text-[13px]">Q</div>
                <div>
                  <div className="text-[14px] font-semibold text-heading">Huỳnh Ngọc Quý</div>
                  <div className="text-[11px] text-muted">Admin</div>
                </div>
              </div>
              <div className="space-y-2">
                <a href="https://zalo.me/0834724567" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-body hover:text-heading transition-all hover:-translate-y-0.5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)' }}>
                  <MessageCircle size={14} className="text-blue-400" />
                  <span className="flex-1">Zalo: <strong>0834724567</strong></span>
                  <ArrowRight size={12} className="text-muted" />
                </a>
                <a href="https://t.me/quydubai" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-body hover:text-heading transition-all hover:-translate-y-0.5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)' }}>
                  <Send size={14} className="text-cyan-400" />
                  <span className="flex-1">Telegram: <strong>@quydubai</strong></span>
                  <ArrowRight size={12} className="text-muted" />
                </a>
              </div>
            </div>
            {/* Admin 2 */}
            <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-secondary)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-[13px]">Đ</div>
                <div>
                  <div className="text-[14px] font-semibold text-heading">Nguyễn Văn Đôn</div>
                  <div className="text-[11px] text-muted">Admin</div>
                </div>
              </div>
              <div className="space-y-2">
                <a href="https://zalo.me/0776666847" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-body hover:text-heading transition-all hover:-translate-y-0.5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)' }}>
                  <MessageCircle size={14} className="text-blue-400" />
                  <span className="flex-1">Zalo: <strong>0776666847</strong></span>
                  <ArrowRight size={12} className="text-muted" />
                </a>
                <a href="https://t.me/nguyenvandon68" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-body hover:text-heading transition-all hover:-translate-y-0.5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-secondary)' }}>
                  <Send size={14} className="text-cyan-400" />
                  <span className="flex-1">Telegram: <strong>@nguyenvandon68</strong></span>
                  <ArrowRight size={12} className="text-muted" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured products */}
      {products.length > 0 && (
        <div className="mb-10">
          <h2 className="text-[20px] font-bold text-heading flex items-center gap-2 mb-5">
            <ShoppingBag size={20} style={{ color: 'var(--accent)' }} /> Sản phẩm nổi bật
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <Link key={p.id} to={`/category/${p.category_slug}`} className="card p-4 hover:-translate-y-1 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[11px] text-muted px-2 py-0.5 rounded-md font-medium" style={{ background: 'var(--bg-elevated)' }}>{p.parent_group}</span>
                  {p.stock > 0 && <span className="text-[10px] text-green-400 bg-green-900/20 px-2 py-0.5 rounded-md font-bold">Còn hàng</span>}
                </div>
                <h3 className="text-[14px] font-semibold text-heading group-hover:text-[var(--accent)] transition-colors mb-2 truncate">{p.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold" style={{ color: 'var(--accent)' }}>{formatVND(p.price)}</span>
                  <ChevronRight size={14} className="text-muted group-hover:text-[var(--accent)] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All categories */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-soft)' }}>
              <Layers size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-heading">Danh mục sản phẩm</h2>
              <p className="text-[12px] text-muted">{Object.values(categories).flat().length} danh mục • {Object.keys(categories).length} nhóm</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(categories).map(([group, cats], gi) => {
            const groupColors = [
              { bg: 'from-orange-500/10 to-red-500/10', border: 'border-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-400' },
              { bg: 'from-blue-500/10 to-cyan-500/10', border: 'border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
              { bg: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-500/20', text: 'text-purple-400', dot: 'bg-purple-400' },
              { bg: 'from-green-500/10 to-emerald-500/10', border: 'border-green-500/20', text: 'text-green-400', dot: 'bg-green-400' },
              { bg: 'from-yellow-500/10 to-amber-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-400' },
            ]
            const gc = groupColors[gi % groupColors.length]
            return (
              <div key={group}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full ${gc.dot}`} />
                  <h3 className={`text-[14px] font-bold uppercase tracking-wider ${gc.text}`}>{group}</h3>
                  <span className="text-[11px] text-muted">({cats.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cats.map((c) => (
                    <Link
                      key={c.slug}
                      to={`/category/${c.slug}`}
                      className={`card group relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${gc.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      <div className="relative p-4 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${gc.bg} ${gc.border} border`}>
                          <Package size={18} className={gc.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[14px] font-semibold text-heading group-hover:text-[var(--accent)] transition-colors truncate">{c.name}</h4>
                          <p className="text-[11px] text-muted mt-0.5">{group}</p>
                        </div>
                        <ArrowRight size={16} className="text-muted group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Từ chối trách nhiệm */}
      <div className="mt-10 card overflow-hidden">
        <div className="px-5 py-3 flex items-center gap-2" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-primary)' }}>
          <ShieldAlert size={16} className="text-yellow-400" />
          <span className="text-[14px] font-semibold text-heading">Tuyên bố từ chối trách nhiệm</span>
        </div>
        <div className="px-5 py-4 space-y-3 text-[13px] text-body leading-relaxed">
          <p>
            <strong className="text-heading">Mục đích sử dụng:</strong> Tất cả sản phẩm và tài khoản trên HuynhQuyMedia.Net chỉ được cung cấp nhằm phục vụ các mục đích hợp pháp bao gồm: quản lý nội dung, chạy quảng cáo, nghiên cứu thị trường, học tập và phát triển cá nhân.
          </p>
          <p>
            <strong className="text-heading">Từ chối trách nhiệm:</strong> HuynhQuyMedia.Net <strong className="text-red-400">hoàn toàn không chịu trách nhiệm</strong> đối với bất kỳ hành vi sử dụng sai mục đích nào của người mua sau khi nhận sản phẩm, bao gồm nhưng không giới hạn: lừa đảo, spam, quấy rối, xâm phạm quyền riêng tư, vi phạm điều khoản dịch vụ của bên thứ ba hoặc bất kỳ hoạt động trái pháp luật nào khác.
          </p>
          <p>
            <strong className="text-heading">Trách nhiệm người dùng:</strong> Người mua hoàn toàn chịu trách nhiệm trước pháp luật về cách thức sử dụng sản phẩm/tài khoản đã mua. Mọi hậu quả phát sinh từ việc sử dụng sai mục đích đều do người mua tự chịu trách nhiệm.
          </p>
          <div className="flex items-start gap-2 mt-2 p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
            <ShieldAlert size={14} className="text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-[12px] font-medium text-heading">
              Bằng việc sử dụng dịch vụ và thực hiện mua hàng, bạn xác nhận đã đọc, hiểu và đồng ý với toàn bộ điều khoản từ chối trách nhiệm nêu trên.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
