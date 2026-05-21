import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Copy, Eye, X, ShieldAlert, Download, Info } from 'lucide-react'
import { api, formatVND } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function downloadTxt(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

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

  const handleDownload = (order) => {
    const filename = `donhang_${order.id}_${order.product_name?.replace(/\s+/g, '_') || 'data'}.txt`
    downloadTxt(filename, order.data_received)
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={32} /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-[var(--accent)] transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}><ArrowLeft size={18} /></Link>
        <h1 className="text-[24px] font-bold text-heading">Lịch sử đơn hàng</h1>
      </div>

      {/* Thông báo tự xóa sau 7 ngày */}
      <div className="rounded-xl p-3 mb-6 flex items-start gap-2" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
        <Info size={14} className="text-yellow-500 shrink-0 mt-0.5" />
        <div className="text-[12px] text-yellow-300/90 leading-relaxed">
          <strong className="text-yellow-400">Lưu ý:</strong> Dữ liệu tài khoản đã mua sẽ tự động xóa sau <strong>7 ngày</strong>. Vui lòng tải xuống file TXT để đảm bảo không mất dữ liệu.
        </div>
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
            {detail.data_received ? (
              <>
                <div className="rounded-lg p-3" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-muted font-bold uppercase">Dữ liệu:</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { const ta = document.createElement('textarea'); ta.value = detail.data_received; ta.style.position = 'fixed'; ta.style.left = '-9999px'; document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }} className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--accent)' }}><Copy size={10} /> Copy</button>
                      <button onClick={() => handleDownload(detail)} className="flex items-center gap-1 text-[11px] text-green-400"><Download size={10} /> Tải TXT</button>
                    </div>
                  </div>
                  <pre className="text-[12px] text-green-400 font-mono whitespace-pre-wrap break-all">{detail.data_received}</pre>
                </div>
                {/* Lưu ý tải xuống */}
                <div className="flex items-start gap-2 p-3 rounded-xl mt-3 bg-yellow-900/10 border border-yellow-800/20">
                  <Download size={13} className="text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-yellow-400/90 leading-relaxed">
                    Hãy tải xuống file TXT để lưu trữ. Dữ liệu sẽ tự động xóa sau <strong>7 ngày</strong> kể từ khi mua.
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-lg p-4 text-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
                <p className="text-[12px] text-muted">Dữ liệu đã hết hạn hoặc không có dữ liệu.</p>
              </div>
            )}
            <div className="flex items-start gap-2 p-3 rounded-xl mt-3 bg-yellow-900/10 border border-yellow-800/20">
              <ShieldAlert size={14} className="text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-yellow-400/90 leading-relaxed">
                Sản phẩm chỉ được sử dụng cho mục đích hợp pháp. HuynhQuyMedia.Net không chịu trách nhiệm nếu bạn sử dụng sai mục đích.
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
                <th className="px-4 py-2.5 text-right font-medium">Thao tác</th>
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
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => viewDetail(o.id)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-900/20" title="Xem chi tiết"><Eye size={14} /></button>
                    </div>
                  </td>
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
