import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Turnstile from '../components/Turnstile'

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const { user, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.username.trim()) return setError('Vui lòng nhập tên đăng nhập.')
    if (!form.password.trim()) return setError('Vui lòng nhập mật khẩu.')
    if (!turnstileToken) return setError('Vui lòng xác nhận captcha.')

    setLoading(true)
    const result = await login(form.username, form.password)
    setLoading(false)

    if (!result.success) {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[900px] grid grid-cols-1 lg:grid-cols-2 gap-0 card overflow-hidden shadow-elevated">
        {/* Left — Login form */}
        <div className="p-8 lg:p-10">
          <h2 className="text-[24px] font-bold text-heading mb-2">Đăng Nhập</h2>
          <p className="text-[14px] text-body mb-6">Vui lòng nhập thông tin đăng nhập</p>

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
                <input
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  value={form.username}
                  onChange={(e) => { setForm({ ...form, username: e.target.value }); setError('') }}
                  className="w-full input-theme pl-10 pr-4 py-3 text-[14px] rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] text-body mb-2 font-medium">Mật khẩu</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Lock size={18} /></div>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setError('') }}
                  className="w-full input-theme pl-10 pr-10 py-3 text-[14px] rounded-xl"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <Turnstile onVerify={(token) => setTurnstileToken(token)} onExpire={() => setTurnstileToken('')} />
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-[13px] hover:underline" style={{ color: 'var(--accent)' }}>
                Quên mật khẩu?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-60 disabled:cursor-wait py-3 rounded-xl text-[16px] flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng Nhập'
              )}
            </button>
          </form>

          <p className="text-center text-[14px] text-body mt-6">
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
              Đăng Ký Ngay
            </Link>
          </p>
        </div>

        {/* Right — Info panel */}
        <div className="bg-gradient-to-br from-[var(--accent)] to-[#c43e1a] p-8 lg:p-10 flex flex-col justify-center text-white">
          <div className="mb-6">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center font-bold text-[20px] mb-4">
              HQM
            </div>
            <h3 className="text-[22px] font-bold mb-3">HuynhQuyMedia.Net</h3>
          </div>
          <p className="text-[14px] leading-relaxed opacity-90">
            Nền tảng hỗ trợ quản lý và phân phối tài nguyên số trên môi trường trực tuyến.
            Hệ thống được xây dựng nhằm phục vụ nhu cầu cá nhân trong việc quản lý dữ liệu,
            tối ưu hiệu suất hiển thị và tự động hóa các hoạt động kỹ thuật số một cách hiệu quả.
          </p>
          <p className="text-[12px] mt-4 opacity-70">
            HuynhQuyMedia không đại diện cho bất kỳ tổ chức, thương hiệu hoặc nền tảng mạng xã hội nào.
            Cam kết tuân thủ đầy đủ quy định pháp luật trong quá trình hoạt động.
          </p>
        </div>
      </div>
    </div>
  )
}
