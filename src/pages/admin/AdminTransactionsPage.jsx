import { useState, useEffect } from 'react'
import { api, formatVND } from '../../lib/api'
import { Loader2 } from 'lucide-react'

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.admin.getTransactions().then((d) => setTransactions(d.transactions)).finally(() => setLoading(false))
  }, [])

  const typeLabels = { recharge: 'Nạp tiền', purchase: 'Mua hàng', refund: 'Hoàn tiền', admin_add: 'Admin cộng', admin_sub: 'Admin trừ' }
  const typeColors = { recharge: 'text-green-400', purchase: 'text-red-400', refund: 'text-yellow-400', admin_add: 'text-blue-400', admin_sub: 'text-purple-400' }

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={28} /></div>

  return (
    <div>
      <h1 className="text-[22px] font-bold text-heading mb-6">Lịch sử giao dịch</h1>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-muted" style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-elevated)' }}>
                <th className="px-4 py-2.5 text-left font-medium">#</th>
                <th className="px-4 py-2.5 text-left font-medium">User</th>
                <th className="px-4 py-2.5 text-left font-medium">Loại</th>
                <th className="px-4 py-2.5 text-left font-medium">Số tiền</th>
                <th className="px-4 py-2.5 text-left font-medium">Số dư sau</th>
                <th className="px-4 py-2.5 text-left font-medium">Ghi chú</th>
                <th className="px-4 py-2.5 text-left font-medium">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-[var(--bg-hover)]" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                  <td className="px-4 py-2.5 text-muted">{t.id}</td>
                  <td className="px-4 py-2.5 text-heading">{t.username}</td>
                  <td className="px-4 py-2.5"><span className={`font-medium ${typeColors[t.type]}`}>{typeLabels[t.type]}</span></td>
                  <td className={`px-4 py-2.5 font-bold ${t.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>{t.amount >= 0 ? '+' : ''}{formatVND(t.amount)}</td>
                  <td className="px-4 py-2.5 text-body">{formatVND(t.balance_after)}</td>
                  <td className="px-4 py-2.5 text-muted max-w-[200px] truncate">{t.note}</td>
                  <td className="px-4 py-2.5 text-muted">{new Date(t.created_at).toLocaleString('vi')}</td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan="7" className="px-4 py-6 text-center text-muted">Chưa có giao dịch.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
