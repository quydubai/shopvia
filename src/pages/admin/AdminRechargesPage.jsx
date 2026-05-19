import { useState, useEffect } from 'react'
import { api, formatVND } from '../../lib/api'
import { Loader2, Check, X } from 'lucide-react'

export default function AdminRechargesPage() {
  const [recharges, setRecharges] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  const load = () => { setLoading(true); api.admin.getRecharges(filter ? `status=${filter}` : '').then((d) => setRecharges(d.recharges)).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [filter])

  const handleApprove = async (r) => {
    if (!confirm(`Duyệt nạp ${formatVND(r.amount)} cho ${r.username}?`)) return
    try { await api.admin.approveRecharge(r.id); load(); alert('Đã duyệt!') } catch (err) { alert(err.message) }
  }

  const handleReject = async (r) => {
    const note = prompt('Lý do từ chối:')
    if (note === null) return
    try { await api.admin.rejectRecharge(r.id, { note }); load() } catch (err) { alert(err.message) }
  }

  return (
    <div>
      <h1 className="text-[22px] font-bold text-heading mb-6">Quản lý nạp tiền</h1>
      <div className="flex gap-2 mb-5">
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{ background: filter === s ? 'var(--accent)' : 'var(--bg-elevated)', color: filter === s ? '#fff' : 'var(--text-secondary)', border: `1px solid ${filter === s ? 'var(--accent)' : 'var(--border-primary)'}` }}>
            {s === 'pending' ? 'Chờ duyệt' : s === 'approved' ? 'Đã duyệt' : s === 'rejected' ? 'Đã từ chối' : 'Tất cả'}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-10"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={28} /></div> : (
        <div className="card overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-muted" style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-elevated)' }}>
                <th className="px-4 py-2.5 text-left font-medium">#</th>
                <th className="px-4 py-2.5 text-left font-medium">User</th>
                <th className="px-4 py-2.5 text-left font-medium">Phương thức</th>
                <th className="px-4 py-2.5 text-left font-medium">Số tiền</th>
                <th className="px-4 py-2.5 text-left font-medium">TT</th>
                <th className="px-4 py-2.5 text-left font-medium">Thời gian</th>
                <th className="px-4 py-2.5 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {recharges.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--bg-hover)]" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                  <td className="px-4 py-2.5 text-muted">{r.id}</td>
                  <td className="px-4 py-2.5 text-heading">{r.username}</td>
                  <td className="px-4 py-2.5 text-body uppercase">{r.method}</td>
                  <td className="px-4 py-2.5 font-bold" style={{ color: 'var(--accent)' }}>{formatVND(r.amount)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${
                      r.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                      r.status === 'approved' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-2.5 text-muted">{new Date(r.created_at).toLocaleString('vi')}</td>
                  <td className="px-4 py-2.5 text-right">
                    {r.status === 'pending' && (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleApprove(r)} className="p-1.5 rounded-lg text-green-400 hover:bg-green-900/20"><Check size={14} /></button>
                        <button onClick={() => handleReject(r)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/20"><X size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {recharges.length === 0 && <tr><td colSpan="7" className="px-4 py-6 text-center text-muted">Không có yêu cầu nạp tiền.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
