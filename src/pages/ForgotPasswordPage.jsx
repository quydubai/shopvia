import { useState, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, Loader2, CheckCircle, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react'
import { api } from '../lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaCode, setCaptchaCode] = useState('')
  const canvasRef = useRef(null)

  const generateCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
    let code = ''
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)]
    setCaptchaCode(code)
    setCaptchaInput('')
    return code
  }, [])

  const drawCaptcha = useCallback((code) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width = 150
    const h = canvas.height = 48
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, ${30 + Math.random() * 30}%)`
      ctx.beginPath()
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2, 0, Math.PI * 2)
      ctx.fill()
    }
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `hsl(${Math.random() * 360}, 40%, 40%)`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(Math.random() * w, Math.random() * h)
      ctx.lineTo(Math.random() * w, Math.random() * h)
      ctx.stroke()
    }
    const fonts = ['italic bold', 'bold', 'italic']
    for (let i = 0; i < code.length; i++) {
      const font = fonts[Math.floor(Math.random() * fonts.length)]
      const size = 20 + Math.floor(Math.random() * 8)
      ctx.font = `${font} ${size}px monospace`
      ctx.fillStyle = `hsl(${Math.random() * 60 + 10}, 90%, 65%)`
      ctx.save()
      ctx.translate(15 + i * 25, 28 + Math.random() * 10 - 5)
      ctx.rotate((Math.random() - 0.5) * 0.5)
      ctx.fillText(code[i], 0, 0)
      ctx.restore()
    }
  }, [])

  useEffect(() => {
    const code = generateCaptcha()
    setTimeout(() => drawCaptcha(code), 50)
  }, [])

  const refreshCaptcha = () => {
    const code = generateCaptcha()
    setTimeout(() => drawCaptcha(code), 50)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email.trim()) return setError('Vui lòng nhập email.')
    if (captchaInput.toLowerCase() !== captchaCode.toLowerCase()) {
      setError('Mã xác nhận không chính xác.')
      refreshCaptcha()
      return
    }

    setLoading(true)
    try {
      const data = await api.forgotPassword({ email })
      setSuccess(data.message)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[450px] card p-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/login" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-[var(--accent)] transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-[22px] font-bold text-heading">Quên mật khẩu</h2>
            <p className="text-[13px] text-muted">Nhập email để nhận link đặt lại mật khẩu</p>
          </div>
        </div>

        {success && (
          <div className="bg-green-900/20 border border-green-800/50 rounded-[10px] p-4 mb-5 flex items-start gap-2">
            <CheckCircle size={18} className="text-green-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[14px] text-green-400 font-medium">{success}</p>
              <p className="text-[12px] text-green-400/70 mt-1">Kiểm tra cả thư mục Spam nếu không thấy email.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800/50 rounded-[10px] p-3 mb-5 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span className="text-[13px] text-red-400">{error}</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[13px] text-body mb-2 font-medium">Email đăng ký</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Nhập email tài khoản của bạn"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  className="w-full input-theme rounded-xl pl-10 pr-4 py-3 text-[14px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] text-body mb-2 font-medium">Mã xác nhận</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><ShieldCheck size={18} /></div>
                  <input type="text" placeholder="Nhập mã bên cạnh" value={captchaInput} onChange={(e) => { setCaptchaInput(e.target.value); setError('') }} className="w-full input-theme pl-10 pr-4 py-3 text-[14px] rounded-xl" autoComplete="off" maxLength={5} />
                </div>
                <canvas ref={canvasRef} className="rounded-xl cursor-pointer shrink-0" style={{ border: '1px solid var(--border-primary)', height: 48, width: 150 }} onClick={refreshCaptcha} title="Click để đổi mã" />
                <button type="button" onClick={refreshCaptcha} className="p-3 rounded-xl text-muted hover:text-heading transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }} title="Đổi mã mới"><RefreshCw size={18} /></button>
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
                  Đang gửi...
                </>
              ) : (
                'Gửi link đặt lại mật khẩu'
              )}
            </button>
          </form>
        )}

        {success && (
          <Link
            to="/login"
            className="block w-full text-center btn-primary py-3 rounded-xl text-[15px]"
          >
            Quay lại đăng nhập
          </Link>
        )}

        <p className="text-center text-[13px] text-muted mt-5">
          Nhớ mật khẩu?{' '}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}
