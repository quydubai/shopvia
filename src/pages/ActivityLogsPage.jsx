import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, LogIn, ShoppingCart, CreditCard, Plus, Minus, UserPlus, RotateCcw, Activity } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const actionConfig = {
  login:              { label: 'Đăng nhập',         icon: LogIn,        color: 'text-blue-400',   bg: 'bg-blue-900/20' },
  register:           { label: 'Đăng ký',           icon: UserPlus,     color: 'text-green-400',  bg: 'bg-green-900/20' },
  purchase:           { label: 'Mua hàng',           icon: ShoppingCart, color: 'text-[#eb542a]',  bg: 'bg-[#eb542a]/10' },
  recharge_request:   { label: 'Yêu cầu nạp tiền',  icon: CreditCard,   color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
  recharge_approved:  { label: 'Nạp tiền thành công', icon: Plus,        color: 'text-green-400',  bg: 'bg-green-900/20' },
  admin_balance:      { label: 'Admin điều chỉnh số dư', icon: Minus,   color: 'text-purple-400', bg: 'bg-purple-900/20' },
  refund:             { label: 'Hoàn tiền',          icon: RotateCcw,    color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
}

const defaultAction = { label: 'Hoạt động', icon: Activity, color: 'text-body', bg: 'bg-[var(--bg-elevated)]' }

export default function ActivityLogsPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    api.getLogs().then((d) => setLogs(d.logs)).finally(() => setLoading(false))
  }, [user, authLoading])

  const filtered = filter ? logs.filter((l) => l.action === filter) : logs
  const filters = [
    { key: '', label: 'Tất cả' },
    { key: 'login', label: 'Đăng nhập' },
    { key: 'purchase', label: 'Mua hàng' },
    { key: 'recharge_approved', label: 'Đã nạp' },
  ]

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={32} /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-[var(--accent)] transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}><ArrowLeft size={18} /></Link>
        <div>
          <h1 className="text-[24px] font-bold text-heading">Nhật ký hoạt động</h1>
          <p className="text-[13px] text-muted">Ghi lại toàn bộ hoạt động: đăng nhập, mua hàng, nạp tiền, cộng/trừ số dư</p>
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

      {/* Timeline */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-[14px] text-muted">Chưa có hoạt động nào.</div>
        )}
        {filtered.map((log) => {
          const config = actionConfig[log.action] || defaultAction
          const Icon = config.icon
          return (
            <div key={log.id} className="card px-4 py-3 flex items-center gap-4 transition-colors">
              <div className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                <Icon size={16} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[13px] font-semibold ${config.color}`}>{config.label}</span>
                </div>
                <p className="text-[12px] text-body truncate">{log.detail}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[12px] text-muted">{new Date(log.created_at).toLocaleDateString('vi')}</div>
                <div className="text-[11px] text-muted">{new Date(log.created_at).toLocaleTimeString('vi')}</div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length > 0 && (
        <div className="text-center text-[12px] text-muted mt-4">Hiển thị {filtered.length} hoạt động</div>
      )}
    </div>
  )
}
