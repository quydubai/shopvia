import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Copy, Eye, X, ShieldAlert } from 'lucide-react'
import { api, formatVND } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    api.getOrders().then((d) => setOrders(d.orders)).finally(() => setLoading(false))
  }, [user, authLoading])

  const viewDetail = async (id) => {
    try { const d = await api.getOrder(id); setDetail(d.order) } catch {}
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={32} /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-[var(--accent)] transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}><ArrowLeft size={18} /></Link>
        <h1 className="text-[24px] font-bold text-heading">Lịch sử đơn hàng</h1>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="card p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-heading">Đơn hàng #{detail.id}</h3>
              <button onClick={() => setDetail(null)} className="text-muted hover:text-heading"><X size={18} /></button>
            </div>
            <div className="space-y-2 text-[13px] mb-4">
              <div className="flex justify-between"><span className="text-muted">Sản phẩm:</span><span className="text-heading">{detail.product_name}</span></div>
              <div className="flex justify-between"><span className="text-muted">Số lượng:</span><span className="text-heading">{detail.quantity}</span></div>
              <div className="flex justify-between"><span className="text-muted">Tổng tiền:</span><span className="font-bold" style={{ color: 'var(--accent)' }}>{formatVND(detail.total_price)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Thời gian:</span><span className="text-heading">{new Date(detail.created_at).toLocaleString('vi')}</span></div>
            </div>
            {detail.data_received && (
              <div className="rounded-lg p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-muted font-bold uppercase">Dữ liệu:</span>
                  <button onClick={() => navigator.clipboard.writeText(detail.data_received)} className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--accent)' }}><Copy size={10} /> Copy</button>
                </div>
                <pre className="text-[12px] text-green-400 font-mono whitespace-pre-wrap break-all">{detail.data_received}</pre>
              </div>
            )}
            <div className="flex items-start gap-2 p-3 rounded-xl mt-4 bg-yellow-900/10 border border-yellow-800/20">
              <ShieldAlert size={14} className="text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-yellow-400/90 leading-relaxed">
                Sản phẩm chỉ được sử dụng cho mục đích hợp pháp. HuynhQuyMedia.Net không chịu trách nhiệm nếu bạn sử dụng sai mục đích. Mọi hậu quả phát sinh do người mua tự chịu.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-muted" style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-elevated)' }}>
                <th className="px-4 py-2.5 text-left font-medium">#</th>
                <th className="px-4 py-2.5 text-left font-medium">Sản phẩm</th>
                <th className="px-4 py-2.5 text-left font-medium">SL</th>
                <th className="px-4 py-2.5 text-left font-medium">Tổng tiền</th>
                <th className="px-4 py-2.5 text-left font-medium">TT</th>
                <th className="px-4 py-2.5 text-left font-medium">Thời gian</th>
                <th className="px-4 py-2.5 text-right font-medium">Xem</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[var(--bg-hover)]" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                  <td className="px-4 py-2.5 text-muted">{o.id}</td>
                  <td className="px-4 py-2.5 text-heading">{o.product_name}</td>
                  <td className="px-4 py-2.5 text-body">{o.quantity}</td>
                  <td className="px-4 py-2.5 font-bold" style={{ color: 'var(--accent)' }}>{formatVND(o.total_price)}</td>
                  <td className="px-4 py-2.5"><span className={`text-[11px] px-2 py-0.5 rounded font-bold ${o.status === 'completed' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>{o.status}</span></td>
                  <td className="px-4 py-2.5 text-muted">{new Date(o.created_at).toLocaleString('vi')}</td>
                  <td className="px-4 py-2.5 text-right"><button onClick={() => viewDetail(o.id)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-900/20"><Eye size={14} /></button></td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-muted">Chưa có đơn hàng nào.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
