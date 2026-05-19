import { useState, useEffect } from 'react'
import { api, formatVND } from '../../lib/api'
import { Search, Loader2, Ban, CheckCircle, Plus, Minus, Shield } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const load = () => {
    setLoading(true)
    api.admin.getUsers(`search=${search}`).then((d) => setUsers(d.users)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e) => { e.preventDefault(); load() }

  const handleBalance = async (userId, type) => {
    const amount = prompt(`Nhập số tiền muốn ${type === 'add' ? 'cộng' : 'trừ'}:`)
    if (!amount || isNaN(amount)) return
    const note = prompt('Ghi chú (tùy chọn):') || ''
    try {
      await api.admin.updateBalance(userId, { amount: Number(amount), type, note })
      load()
      alert('Cập nhật thành công!')
    } catch (err) { alert(err.message) }
  }

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'banned' : 'active'
    if (!confirm(`${newStatus === 'banned' ? 'Khóa' : 'Mở khóa'} tài khoản ${user.username}?`)) return
    try { await api.admin.updateUserStatus(user.id, { status: newStatus }); load() } catch (err) { alert(err.message) }
  }

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    if (!confirm(`Đổi quyền ${user.username} thành ${newRole}?`)) return
    try { await api.admin.updateUserRole(user.id, { role: newRole }); load() } catch (err) { alert(err.message) }
  }

  return (
    <div>
      <h1 className="text-[22px] font-bold text-heading mb-6">Quản lý người dùng</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm user..." className="w-full input-theme rounded-xl pl-9 pr-4 py-2 text-[13px]" />
        </div>
        <button type="submit" className="btn-primary px-4 py-2 rounded-xl text-[13px]">Tìm</button>
      </form>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={28} /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-muted" style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-elevated)' }}>
                  <th className="px-4 py-2.5 text-left font-medium">ID</th>
                  <th className="px-4 py-2.5 text-left font-medium">Username</th>
                  <th className="px-4 py-2.5 text-left font-medium">Email</th>
                  <th className="px-4 py-2.5 text-left font-medium">Số dư</th>
                  <th className="px-4 py-2.5 text-left font-medium">Quyền</th>
                  <th className="px-4 py-2.5 text-left font-medium">Trạng thái</th>
                  <th className="px-4 py-2.5 text-left font-medium">Ngày tạo</th>
                  <th className="px-4 py-2.5 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[var(--bg-hover)]" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                    <td className="px-4 py-2.5 text-muted">{u.id}</td>
                    <td className="px-4 py-2.5 text-heading font-medium">{u.username}</td>
                    <td className="px-4 py-2.5 text-body">{u.email}</td>
                    <td className="px-4 py-2.5 font-bold" style={{ color: 'var(--accent)' }}>{formatVND(u.balance)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${u.role === 'admin' ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-bold ${u.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{u.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted">{new Date(u.created_at).toLocaleDateString('vi')}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleBalance(u.id, 'add')} title="Cộng tiền" className="p-1.5 rounded-lg text-green-400 hover:bg-green-900/20"><Plus size={14} /></button>
                        <button onClick={() => handleBalance(u.id, 'sub')} title="Trừ tiền" className="p-1.5 rounded-lg text-red-400 hover:bg-red-900/20"><Minus size={14} /></button>
                        <button onClick={() => handleToggleRole(u)} title="Đổi quyền" className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-900/20"><Shield size={14} /></button>
                        <button onClick={() => handleToggleStatus(u)} title={u.status === 'active' ? 'Khóa' : 'Mở khóa'} className="p-1.5 rounded-lg text-yellow-400 hover:bg-yellow-900/20">
                          {u.status === 'active' ? <Ban size={14} /> : <CheckCircle size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
