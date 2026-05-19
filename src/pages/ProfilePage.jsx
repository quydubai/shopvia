import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, User, Mail, Shield, Wallet, Calendar, KeyRound, Save, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { api, formatVND } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // Email form
  const [email, setEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState(null)
  const [emailSaving, setEmailSaving] = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwMsg, setPwMsg] = useState(null)
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    setEmail(user.email || '')
  }, [user, authLoading])

  const handleUpdateEmail = async (e) => {
    e.preventDefault()
    setEmailMsg(null)
    if (!email.trim()) { setEmailMsg({ type: 'error', text: 'Vui lòng nhập email.' }); return }
    setEmailSaving(true)
    try {
      await api.updateProfile({ email })
      await refreshUser()
      setEmailMsg({ type: 'success', text: 'Cập nhật email thành công!' })
    } catch (err) {
      setEmailMsg({ type: 'error', text: err.message })
    }
    setEmailSaving(false)
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setPwMsg(null)
    if (!currentPassword || !newPassword) { setPwMsg({ type: 'error', text: 'Vui lòng nhập đầy đủ.' }); return }
    if (newPassword.length < 6) { setPwMsg({ type: 'error', text: 'Mật khẩu mới tối thiểu 6 ký tự.' }); return }
    if (newPassword !== confirmPassword) { setPwMsg({ type: 'error', text: 'Xác nhận mật khẩu không khớp.' }); return }
    setPwSaving(true)
    try {
      await api.updateProfile({ currentPassword, newPassword })
      await refreshUser()
      setPwMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message })
    }
    setPwSaving(false)
  }

  if (authLoading || !user) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={32} /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-[var(--accent)] transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-[24px] font-bold text-heading">Thông tin tài khoản</h1>
          <p className="text-[13px] text-muted">Quản lý thông tin cá nhân của bạn</p>
        </div>
      </div>

      {/* User info cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="card p-4">
          <div className="text-[12px] text-muted mb-1 flex items-center gap-1"><User size={12} /> Tài khoản</div>
          <div className="text-[15px] font-bold text-heading truncate">{user.username}</div>
        </div>
        <div className="card p-4">
          <div className="text-[12px] text-muted mb-1 flex items-center gap-1"><Mail size={12} /> Email</div>
          <div className="text-[15px] font-bold text-heading truncate">{user.email || '—'}</div>
        </div>
        <div className="card p-4">
          <div className="text-[12px] text-muted mb-1 flex items-center gap-1"><Wallet size={12} /> Số dư</div>
          <div className="text-[15px] font-bold" style={{ color: 'var(--accent)' }}>{formatVND(user.balance || 0)}</div>
        </div>
        <div className="card p-4">
          <div className="text-[12px] text-muted mb-1 flex items-center gap-1"><Shield size={12} /> Vai trò</div>
          <div className="text-[15px] font-bold text-heading capitalize">{user.role}</div>
        </div>
      </div>

      {/* Update Email */}
      <div className="card p-5 mb-5">
        <h2 className="text-[16px] font-semibold text-heading mb-4 flex items-center gap-2">
          <Mail size={18} style={{ color: 'var(--accent)' }} /> Cập nhật Email
        </h2>
        <form onSubmit={handleUpdateEmail}>
          <div className="mb-4">
            <label className="block text-[13px] text-body mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full input-theme rounded-lg px-4 py-2.5 text-[14px]"
              placeholder="Nhập email mới"
            />
          </div>

          {emailMsg && (
            <div className={`text-[13px] mb-3 flex items-center gap-1.5 ${emailMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {emailMsg.type === 'success' && <CheckCircle size={14} />}
              {emailMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={emailSaving}
            className="flex items-center gap-2 btn-primary disabled:opacity-50 px-5 py-2.5 rounded-lg text-[13px]"
          >
            {emailSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Lưu thay đổi
          </button>
        </form>
      </div>

      {/* Update Password */}
      <div className="card p-5">
        <h2 className="text-[16px] font-semibold text-heading mb-4 flex items-center gap-2">
          <KeyRound size={18} style={{ color: 'var(--accent)' }} /> Đổi mật khẩu
        </h2>
        <form onSubmit={handleUpdatePassword}>
          <div className="mb-4">
            <label className="block text-[13px] text-body mb-1.5">Mật khẩu hiện tại</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full input-theme rounded-lg px-4 py-2.5 pr-10 text-[14px]"
                placeholder="Nhập mật khẩu hiện tại"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[13px] text-body mb-1.5">Mật khẩu mới</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full input-theme rounded-lg px-4 py-2.5 pr-10 text-[14px]"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[13px] text-body mb-1.5">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full input-theme rounded-lg px-4 py-2.5 text-[14px]"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          {pwMsg && (
            <div className={`text-[13px] mb-3 flex items-center gap-1.5 ${pwMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
              {pwMsg.type === 'success' && <CheckCircle size={14} />}
              {pwMsg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={pwSaving}
            className="flex items-center gap-2 btn-primary disabled:opacity-50 px-5 py-2.5 rounded-lg text-[13px]"
          >
            {pwSaving ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
            Đổi mật khẩu
          </button>
        </form>
      </div>
    </div>
  )
}
