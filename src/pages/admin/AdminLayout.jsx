import { useState } from 'react'
import { Link, useLocation, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Users, Package, ShoppingCart, Wallet, Settings, CreditCard, FileText, PenLine, Menu, X, ArrowLeft } from 'lucide-react'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Người dùng' },
  { to: '/admin/categories', icon: FileText, label: 'Danh mục' },
  { to: '/admin/products', icon: Package, label: 'Sản phẩm' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Đơn hàng' },
  { to: '/admin/recharges', icon: CreditCard, label: 'Nạp tiền' },
  { to: '/admin/transactions', icon: Wallet, label: 'Giao dịch' },
  { to: '/admin/blogs', icon: PenLine, label: 'Bài viết' },
  { to: '/admin/settings', icon: Settings, label: 'Cài đặt' },
]

export default function AdminLayout() {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()
  const [sideOpen, setSideOpen] = useState(false)

  if (loading) return null
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />

  return (
    <div className="flex min-h-[calc(100vh-120px)]">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-[60px] left-0 z-40 h-[calc(100vh-60px)] w-56 transform transition-transform lg:translate-x-0 ${sideOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)' }}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <Link to="/" className="flex items-center gap-2 text-[13px] text-muted hover:text-[var(--accent)] transition-colors">
            <ArrowLeft size={14} /> Về trang chủ
          </Link>
          <button className="lg:hidden text-heading" onClick={() => setSideOpen(false)}><X size={18} /></button>
        </div>
        <nav className="p-2">
          {navItems.map((item) => {
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to) && pathname !== '/admin'
            const isExact = item.end && pathname === item.to
            const highlight = isExact || (!item.end && active)
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSideOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors mb-0.5 ${
                  highlight ? 'text-[var(--accent)]' : 'text-body hover:text-heading'
                }`}
                style={highlight ? { background: 'var(--accent-soft)' } : {}}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Overlay */}
      {sideOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSideOpen(false)} />}

      {/* Content */}
      <div className="flex-1 lg:ml-0">
        <div className="lg:hidden p-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <button onClick={() => setSideOpen(true)} className="flex items-center gap-2 text-[13px] text-body hover:text-heading transition-colors">
            <Menu size={16} /> Admin Menu
          </button>
        </div>
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
