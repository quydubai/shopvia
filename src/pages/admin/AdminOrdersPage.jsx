import { useState, useEffect } from 'react'
import { api, formatVND } from '../../lib/api'
import { Loader2, RotateCcw } from 'lucide-react'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const load = () => { setLoading(true); api.admin.getOrders(filter ? `status=${filter}` : '').then((d) => setOrders(d.orders)).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [filter])

  const handleRefund = async (o) => {
    if (!confirm(`Hoàn tiền đơn #${o.id} (${formatVND(o.total_price)}) cho ${o.username}?`)) return
    try { await api.admin.refundOrder(o.id); load(); alert('Hoàn tiền thành công!') } catch (err) { alert(err.message) }
  }

  return (
    <div>
      <h1 className="text-[22px] font-bold text-heading mb-6">Quản lý đơn hàng</h1>
      <div className="flex gap-2 mb-5">
        {['', 'completed', 'refunded', 'cancelled'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{ background: filter === s ? 'var(--accent)' : 'var(--bg-elevated)', color: filter === s ? '#fff' : 'var(--text-secondary)', border: `1px solid ${filter === s ? 'var(--accent)' : 'var(--border-primary)'}` }}>
            {s === '' ? 'Tất cả' : s === 'completed' ? 'Hoàn thành' : s === 'refunded' ? 'Đã hoàn' : 'Đã hủy'}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={28} /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-muted" style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-elevated)' }}>
                  <th className="px-4 py-2.5 text-left font-medium">#</th>
                  <th className="px-4 py-2.5 text-left font-medium">Người mua</th>
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
                    <td className="px-4 py-2.5 text-heading">{o.username}</td>
                    <td className="px-4 py-2.5 text-body">{o.product_name}</td>
                    <td className="px-4 py-2.5 text-body">{o.quantity}</td>
                    <td className="px-4 py-2.5 font-bold" style={{ color: 'var(--accent)' }}>{formatVND(o.total_price)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                        o.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                        o.status === 'refunded' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'
                      }`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted">{new Date(o.created_at).toLocaleString('vi')}</td>
                    <td className="px-4 py-2.5 text-right">
                      {o.status === 'completed' && (
                        <button onClick={() => handleRefund(o)} title="Hoàn tiền" className="p-1.5 rounded-lg text-yellow-400 hover:bg-yellow-900/20"><RotateCcw size={14} /></button>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan="8" className="px-4 py-6 text-center text-muted">Không có đơn hàng.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
