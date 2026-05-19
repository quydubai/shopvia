import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, Heart, User, Phone, Send, Wallet, LogOut, UserCircle, Shield, Sun, Moon, Search, Package, Layers } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

function Dropdown({ label, children, isMobile }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!isMobile) {
      const handleOut = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false)
      }
      document.addEventListener('mousedown', handleOut)
      return () => document.removeEventListener('mousedown', handleOut)
    }
  }, [isMobile])

  if (isMobile) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between py-3 px-4 text-heading hover:text-[var(--accent)] transition-colors"
        >
          {label}
          <ChevronDown size={16} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && <div style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-secondary)' }}>{children}</div>}
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        className="flex items-center gap-1 py-2 transition-colors text-[15px] font-medium text-heading hover:text-[var(--accent)]"
        style={open ? { color: 'var(--accent)' } : {}}
        onClick={() => setOpen(!open)}
      >
        {label}
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 pt-2 z-50">
          <div className="card min-w-[280px] py-2 max-h-[70vh] overflow-y-auto shadow-elevated">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleOut = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOut)
    return () => document.removeEventListener('mousedown', handleOut)
  }, [])

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/login')
  }

  const formatBalance = (n) =>
    new Intl.NumberFormat('vi-VN').format(n) + 'đ'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--accent)] to-[#ff7849] flex items-center justify-center">
          <UserCircle size={16} className="text-white" />
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-[13px] font-medium leading-tight text-heading">{user.username}</div>
          <div className="text-[11px] font-bold leading-tight flex items-center gap-1" style={{ color: 'var(--accent)' }}>
            <Wallet size={10} /> {formatBalance(user.balance)}
          </div>
        </div>
        <ChevronDown size={14} className="text-body" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 card shadow-elevated z-50 py-1 overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
            <div className="text-[14px] font-semibold text-heading">{user.username}</div>
            <div className="text-[12px] text-body">{user.email}</div>
            <div className="text-[13px] font-bold mt-1.5 flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              <Wallet size={12} /> Số dư: {formatBalance(user.balance)}
            </div>
          </div>
          <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-body hover:text-heading transition-colors" style={{ ':hover': { background: 'var(--accent-soft)' } }}>
            <UserCircle size={16} /> Thông tin tài khoản
          </Link>
          <Link to="/orders" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-body hover:text-heading transition-colors">
            <Wallet size={16} /> Đơn hàng của tôi
          </Link>
          <Link to="/recharge" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-body hover:text-heading transition-colors">
            <Wallet size={16} /> Nạp tiền
          </Link>
          <div style={{ borderTop: '1px solid var(--border-secondary)', marginTop: 4, paddingTop: 4 }}>
            <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-red-400 hover:text-red-300 transition-colors">
              <LogOut size={16} /> Đăng Xuất
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuCategories, setMenuCategories] = useState([])
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    api.getCategories()
      .then((data) => {
        const grouped = data.grouped || {}
        const cats = Object.entries(grouped).map(([name, items]) => ({
          name,
          items: items.map(c => ({ name: c.name, slug: c.slug }))
        }))
        setMenuCategories(cats)
      })
      .catch(() => {})
  }, [])

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
  ]

  const dropdownItemClass = "block px-4 py-2.5 text-[14px] text-body hover:text-heading transition-colors"
  const mobileItemClass = "block px-6 py-2.5 text-[13px] text-body hover:text-heading transition-colors"

  return (
    <>
      {/* Top bar */}
      <div className="hidden lg:block text-[13px]" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-secondary)' }}>
        <div className="max-w-7xl mx-auto px-6 py-1.5 flex items-center justify-between text-muted">
          <span>HuynhQuyMedia — Nền tảng quản lý và phân phối tài nguyên số</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[var(--accent)] transition-colors flex items-center gap-1">
              <Phone size={12} /> 0834724567
            </a>
            <a href="#" className="hover:text-[var(--accent)] transition-colors flex items-center gap-1">
              <Send size={12} /> @quydubai
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg-secondary) 85%, transparent)', borderBottom: '1px solid var(--border-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-[64px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#ff7849] flex items-center justify-center font-bold text-white text-[13px] shadow-lg group-hover:shadow-[var(--accent)]/30 transition-shadow">
              HQM
            </div>
            <div>
              <span className="font-bold text-[18px] text-heading">HuynhQuyMedia</span>
              <span className="text-[12px] ml-1 font-semibold" style={{ color: 'var(--accent)' }}>.COM</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-3 whitespace-nowrap">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-[13px] font-medium py-2 transition-colors text-heading hover:text-[var(--accent)]"
                style={pathname === l.to ? { color: 'var(--accent)' } : {}}
              >
                {l.label}
              </Link>
            ))}

            <Dropdown label="Sản phẩm">
              {menuCategories.map((cat, ci) => {
                const colors = ['text-orange-400', 'text-blue-400', 'text-purple-400', 'text-green-400', 'text-cyan-400', 'text-pink-400', 'text-yellow-400']
                const dotColors = ['bg-orange-400', 'bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-cyan-400', 'bg-pink-400', 'bg-yellow-400']
                return (
                  <div key={cat.name}>
                    <div className="flex items-center gap-2 px-4 py-2" style={{ background: 'var(--bg-elevated)' }}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[ci % dotColors.length]}`} />
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${colors[ci % colors.length]}`}>{cat.name}</span>
                      <span className="text-[10px] text-muted">({cat.items.length})</span>
                    </div>
                    {cat.items.map((item) => (
                      <Link key={item.slug} to={`/category/${item.slug}`} className="flex items-center gap-2 px-4 py-2 text-[13px] text-body hover:text-heading hover:bg-[var(--bg-hover)] transition-colors">
                        <Package size={12} className="text-muted" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )
              })}
            </Dropdown>

            <Dropdown label="Nạp tiền">
              <Link to="/recharge/bank" className={dropdownItemClass}>Ngân hàng</Link>
              <Link to="/recharge/crypto" className={dropdownItemClass}>Crypto</Link>
            </Dropdown>

            <Dropdown label="Lịch sử">
              <Link to="/orders" className={dropdownItemClass}>Lịch sử đơn hàng</Link>
              <Link to="/logs" className={dropdownItemClass}>Nhật ký hoạt động</Link>
              <Link to="/transactions" className={dropdownItemClass}>Biến động số dư</Link>
            </Dropdown>

            <Link to="/checklive" className="text-[13px] font-medium text-heading hover:text-[var(--accent)] transition-colors py-2">Check Live</Link>
            <Link to="/get2fa" className="text-[13px] font-medium text-heading hover:text-[var(--accent)] transition-colors py-2">Get 2FA</Link>
            <Link to="/blogs" className="text-[13px] font-medium text-heading hover:text-[var(--accent)] transition-colors py-2">Blogs</Link>
            <Link to="/api-docs" className="text-[13px] font-medium text-heading hover:text-[var(--accent)] transition-colors py-2">API</Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all text-body hover:text-heading"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}
              title={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
            >
              {theme === 'dark' ? <><Sun size={14} /> <span className="hidden sm:inline">Sáng</span></> : <><Moon size={14} /> <span className="hidden sm:inline">Tối</span></>}
            </button>

            <Link to="/favorites" className="w-9 h-9 rounded-xl flex items-center justify-center text-body hover:text-[var(--accent)] transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
              <Heart size={16} />
            </Link>

            {user?.role === 'admin' && (
              <Link to="/admin" className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-all" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}>
                <Shield size={14} /> Admin
              </Link>
            )}

            {user ? (
              <UserMenu />
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 btn-primary px-4 py-2 text-[14px] rounded-xl shadow-lg"
              >
                <User size={16} />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            )}

            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center text-heading rounded-xl"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden max-h-[80vh] overflow-y-auto" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-primary)' }}>
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                className="block py-3 px-4 text-heading hover:text-[var(--accent)] transition-colors" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                {l.label}
              </Link>
            ))}
            <Dropdown label="Sản phẩm" isMobile>
              {menuCategories.map((cat, ci) => {
                const colors = ['text-orange-400', 'text-blue-400', 'text-purple-400', 'text-green-400', 'text-cyan-400', 'text-pink-400', 'text-yellow-400']
                const dotColors = ['bg-orange-400', 'bg-blue-400', 'bg-purple-400', 'bg-green-400', 'bg-cyan-400', 'bg-pink-400', 'bg-yellow-400']
                return (
                  <div key={cat.name}>
                    <div className="flex items-center gap-2 px-6 py-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[ci % dotColors.length]}`} />
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${colors[ci % colors.length]}`}>{cat.name}</span>
                    </div>
                    {cat.items.map((item) => (
                      <Link key={item.slug} to={`/category/${item.slug}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-8 py-2.5 text-[13px] text-body hover:text-heading transition-colors">
                        <Package size={12} className="text-muted" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )
              })}
            </Dropdown>
            <Dropdown label="Nạp tiền" isMobile>
              <Link to="/recharge/bank" onClick={() => setMobileOpen(false)} className={mobileItemClass}>Ngân hàng</Link>
              <Link to="/recharge/crypto" onClick={() => setMobileOpen(false)} className={mobileItemClass}>Crypto</Link>
            </Dropdown>
            <Dropdown label="Lịch sử" isMobile>
              <Link to="/orders" onClick={() => setMobileOpen(false)} className={mobileItemClass}>Lịch sử đơn hàng</Link>
              <Link to="/logs" onClick={() => setMobileOpen(false)} className={mobileItemClass}>Nhật ký hoạt động</Link>
              <Link to="/transactions" onClick={() => setMobileOpen(false)} className={mobileItemClass}>Biến động số dư</Link>
            </Dropdown>
            <Link to="/checklive" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-heading hover:text-[var(--accent)]" style={{ borderTop: '1px solid var(--border-secondary)' }}>Check Live</Link>
            <Link to="/get2fa" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-heading hover:text-[var(--accent)]" style={{ borderTop: '1px solid var(--border-secondary)' }}>Get 2FA</Link>
            <Link to="/blogs" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-heading hover:text-[var(--accent)]" style={{ borderTop: '1px solid var(--border-secondary)' }}>Blogs</Link>
            <Link to="/api-docs" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-heading hover:text-[var(--accent)]" style={{ borderTop: '1px solid var(--border-secondary)' }}>API Docs</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-3 px-4 font-semibold" style={{ color: 'var(--accent)', borderTop: '1px solid var(--border-secondary)' }}>
                <Shield size={16} /> Quản trị Admin
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  )
}
