import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react'
import { api } from '../lib/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[450px] card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <h2 className="text-[20px] font-bold text-heading mb-2">Link không hợp lệ</h2>
          <p className="text-[14px] text-muted mb-6">Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</p>
          <Link to="/forgot-password" className="inline-block btn-primary px-6 py-2.5 rounded-xl text-[14px]">
            Yêu cầu link mới
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!password) return setError('Vui lòng nhập mật khẩu mới.')
    if (password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự.')
    if (password !== confirmPassword) return setError('Xác nhận mật khẩu không khớp.')

    setLoading(true)
    try {
      const data = await api.resetPassword({ token, password })
      setSuccess(data.message)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[450px] card p-8">

        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-900/20 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={28} className="text-green-400" />
            </div>
            <h2 className="text-[20px] font-bold text-heading mb-2">Thành công!</h2>
            <p className="text-[14px] text-muted mb-6">{success}</p>
            <Link
              to="/login"
              className="inline-block btn-primary px-8 py-3 rounded-xl text-[15px]"
            >
              Đăng nhập ngay
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: 'var(--accent-soft)' }}>
                <ShieldCheck size={22} style={{ color: 'var(--accent)' }} />
              </div>
              <h2 className="text-[22px] font-bold text-heading">Đặt lại mật khẩu</h2>
              <p className="text-[13px] text-muted mt-1">Nhập mật khẩu mới cho tài khoản của bạn</p>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-3 mb-5 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <span className="text-[13px] text-red-400">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[13px] text-body mb-2 font-medium">Mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    className="w-full input-theme rounded-xl pl-10 pr-10 py-3 text-[14px]"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body transition-colors">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[13px] text-body mb-2 font-medium">Xác nhận mật khẩu</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                    className="w-full input-theme rounded-xl pl-10 pr-4 py-3 text-[14px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-60 disabled:cursor-wait py-3 rounded-xl text-[15px] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Đặt lại mật khẩu'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
