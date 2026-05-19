import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { api, formatVND } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const typeConfig = {
  recharge:    { label: 'Nạp tiền',    color: 'text-green-400',  bg: 'bg-green-900/20', icon: TrendingUp },
  purchase:    { label: 'Mua hàng',    color: 'text-red-400',    bg: 'bg-red-900/20',   icon: TrendingDown },
  refund:      { label: 'Hoàn tiền',   color: 'text-yellow-400', bg: 'bg-yellow-900/20', icon: TrendingUp },
  admin_add:   { label: 'Cộng tiền',   color: 'text-green-400',  bg: 'bg-green-900/20', icon: TrendingUp },
  admin_sub:   { label: 'Trừ tiền',    color: 'text-red-400',    bg: 'bg-red-900/20',   icon: TrendingDown },
}

const defaultType = { label: 'Giao dịch', color: 'text-body', bg: 'bg-[var(--bg-elevated)]', icon: Wallet }

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    api.getTransactions().then((d) => setTransactions(d.transactions)).finally(() => setLoading(false))
  }, [user, authLoading])

  const filtered = filter ? transactions.filter((t) => t.type === filter) : transactions

  const totalIn = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const totalOut = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)

  const filters = [
    { key: '', label: 'Tất cả' },
    { key: 'purchase', label: 'Mua hàng' },
    { key: 'recharge', label: 'Nạp tiền' },
    { key: 'refund', label: 'Hoàn tiền' },
  ]

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={32} /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-[var(--accent)] transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}><ArrowLeft size={18} /></Link>
        <div>
          <h1 className="text-[24px] font-bold text-heading">Biến động số dư</h1>
          <p className="text-[13px] text-muted">Lịch sử cộng trừ tiền trong tài khoản</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-[12px] text-muted mb-1 flex items-center gap-1"><Wallet size={12} /> Số dư hiện tại</div>
          <div className="text-[18px] font-bold" style={{ color: 'var(--accent)' }}>{formatVND(user?.balance || 0)}</div>
        </div>
        <div className="card p-4">
          <div className="text-[12px] text-muted mb-1 flex items-center gap-1"><TrendingUp size={12} className="text-green-400" /> Tổng tiền vào</div>
          <div className="text-[18px] font-bold text-green-400">+{formatVND(totalIn)}</div>
        </div>
        <div className="card p-4">
          <div className="text-[12px] text-muted mb-1 flex items-center gap-1"><TrendingDown size={12} className="text-red-400" /> Tổng tiền ra</div>
          <div className="text-[18px] font-bold text-red-400">-{formatVND(totalOut)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{ background: filter === f.key ? 'var(--accent)' : 'var(--bg-elevated)', color: filter === f.key ? '#fff' : 'var(--text-secondary)', border: `1px solid ${filter === f.key ? 'var(--accent)' : 'var(--border-primary)'}` }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[14px] text-muted">Chưa có giao dịch nào.</div>
        ) : (
          <div>
            {filtered.map((t) => {
              const config = typeConfig[t.type] || defaultType
              const Icon = config.icon
              const isPositive = t.amount >= 0
              return (
                <div key={t.id} className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                  <div className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={16} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-semibold ${config.color}`}>{config.label}</span>
                    </div>
                    <p className="text-[12px] text-muted truncate">{t.note}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-[14px] font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? '+' : ''}{formatVND(t.amount)}
                    </div>
                    <div className="text-[11px] text-muted">Còn {formatVND(t.balance_after)}</div>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <div className="text-[11px] text-muted">{new Date(t.created_at).toLocaleDateString('vi')}</div>
                    <div className="text-[10px] text-muted">{new Date(t.created_at).toLocaleTimeString('vi')}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="text-center text-[12px] text-muted mt-4">Hiển thị {filtered.length} giao dịch</div>
      )}
    </div>
  )
}
