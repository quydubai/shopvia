import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Turnstile from '../components/Turnstile'

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const { user, register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const update = (key, val) => { setForm((f) => ({ ...f, [key]: val })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.username.trim()) return setError('Vui lòng nhập tên đăng nhập.')
    if (form.username.length < 3) return setError('Tên đăng nhập phải có ít nhất 3 ký tự.')
    if (!form.email.trim() || !form.email.includes('@')) return setError('Vui lòng nhập email hợp lệ.')
    if (form.password.length < 4) return setError('Mật khẩu phải có ít nhất 4 ký tự.')
    if (form.password !== form.confirm) return setError('Mật khẩu xác nhận không khớp.')
    if (!turnstileToken) return setError('Vui lòng xác nhận captcha.')

    setLoading(true)
    const result = await register(form.username, form.email, form.password)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[460px] card p-8 shadow-elevated">
        <h2 className="text-[24px] font-bold text-heading mb-2">Đăng Ký</h2>
        <p className="text-[14px] text-body mb-6">Tạo tài khoản mới</p>

        {error && (
          <div className="bg-red-900/15 border border-red-800/30 rounded-xl p-3 mb-5 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span className="text-[13px] text-red-400">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] text-body mb-2 font-medium">Tên đăng nhập</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><User size={18} /></div>
              <input type="text" placeholder="Nhập tên đăng nhập" value={form.username} onChange={(e) => update('username', e.target.value)} className="w-full input-theme pl-10 pr-4 py-3 text-[14px] rounded-xl" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] text-body mb-2 font-medium">Email</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Mail size={18} /></div>
              <input type="email" placeholder="Nhập email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full input-theme pl-10 pr-4 py-3 text-[14px] rounded-xl" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] text-body mb-2 font-medium">Mật khẩu</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Lock size={18} /></div>
              <input type={showPw ? 'text' : 'password'} placeholder="Nhập mật khẩu" value={form.password} onChange={(e) => update('password', e.target.value)} className="w-full input-theme pl-10 pr-10 py-3 text-[14px] rounded-xl" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body transition-colors">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[13px] text-body mb-2 font-medium">Nhập lại mật khẩu</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Lock size={18} /></div>
              <input type="password" placeholder="Xác nhận mật khẩu" value={form.confirm} onChange={(e) => update('confirm', e.target.value)} className="w-full input-theme pl-10 pr-4 py-3 text-[14px] rounded-xl" />
            </div>
          </div>

          <div>
            <Turnstile onVerify={(token) => setTurnstileToken(token)} onExpire={() => setTurnstileToken('')} />
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-60 disabled:cursor-wait py-3 rounded-xl text-[16px] flex items-center justify-center gap-2 shadow-lg">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang đăng ký...
              </>
            ) : (
              'Đăng Ký'
            )}
          </button>
        </form>

        <p className="text-center text-[14px] text-body mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>Đăng Nhập</Link>
        </p>
      </div>
    </div>
  )
}
