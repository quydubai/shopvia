import { useState, useEffect } from 'react'
import { api, formatVND } from '../../lib/api'
import { Users, Package, ShoppingCart, Wallet, CreditCard, TrendingUp, Loader2, Archive } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.admin.getStats().then(setStats).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={28} /></div>
  if (!stats) return <div className="text-muted text-center py-10">Không thể tải dữ liệu.</div>

  const cards = [
    { label: 'Tổng người dùng', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
    { label: 'Tổng sản phẩm', value: stats.totalProducts, icon: Package, color: 'text-green-400' },
    { label: 'Tổng kho', value: stats.totalStock, icon: Archive, color: 'text-cyan-400' },
    { label: 'Tổng đơn hàng', value: stats.totalOrders, icon: ShoppingCart, color: 'text-purple-400' },
    { label: 'Tổng doanh thu', value: formatVND(stats.totalRevenue), icon: Wallet, cls: 'accent' },
    { label: 'Đơn hôm nay', value: stats.todayOrders, icon: TrendingUp, color: 'text-yellow-400' },
    { label: 'Nạp tiền chờ duyệt', value: stats.pendingRecharges, icon: CreditCard, color: 'text-red-400' },
  ]

  return (
    <div>
      <h1 className="text-[22px] font-bold text-heading mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <c.icon size={18} className={c.color} style={c.cls === 'accent' ? { color: 'var(--accent)' } : {}} />
              <span className="text-[12px] text-muted font-medium">{c.label}</span>
            </div>
            <div className="text-[20px] font-bold text-heading">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <h2 className="text-[14px] font-semibold text-heading">Đơn hàng gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-muted" style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-elevated)' }}>
                <th className="px-4 py-2.5 text-left font-medium">#</th>
                <th className="px-4 py-2.5 text-left font-medium">Người mua</th>
                <th className="px-4 py-2.5 text-left font-medium">Sản phẩm</th>
                <th className="px-4 py-2.5 text-left font-medium">SL</th>
                <th className="px-4 py-2.5 text-left font-medium">Tổng tiền</th>
                <th className="px-4 py-2.5 text-left font-medium">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[var(--bg-hover)]" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                  <td className="px-4 py-2.5 text-muted">{o.id}</td>
                  <td className="px-4 py-2.5 text-heading">{o.username}</td>
                  <td className="px-4 py-2.5 text-body">{o.product_name}</td>
                  <td className="px-4 py-2.5 text-body">{o.quantity}</td>
                  <td className="px-4 py-2.5 font-bold" style={{ color: 'var(--accent)' }}>{formatVND(o.total_price)}</td>
                  <td className="px-4 py-2.5 text-muted">{new Date(o.created_at).toLocaleString('vi')}</td>
                </tr>
              ))}
              {stats.recentOrders.length === 0 && (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-muted">Chưa có đơn hàng.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
