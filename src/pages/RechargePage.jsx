import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Wallet, AlertCircle, CheckCircle, Loader2, Copy, Clock, ArrowRight, Check } from 'lucide-react'
import { api, formatVND } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function RechargePage() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [method, setMethod] = useState('bank')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: chọn số tiền, 2: QR + gửi yêu cầu, 3: chờ duyệt
  const [submitting, setSubmitting] = useState(false)
  const [requestId, setRequestId] = useState(null)
  const [requestStatus, setRequestStatus] = useState('pending')
  const [copied, setCopied] = useState('')
  const pollRef = useRef(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    api.getRechargeInfo().then(setInfo).finally(() => setLoading(false))
  }, [user, authLoading])

  // Polling kiểm tra trạng thái khi ở step 3
  useEffect(() => {
    if (step === 3 && requestId) {
      pollRef.current = setInterval(async () => {
        try {
          const data = await api.getRechargeHistory()
          const req = data.requests?.find((r) => r.id === requestId)
          if (req && req.status !== 'pending') {
            setRequestStatus(req.status)
            clearInterval(pollRef.current)
            if (req.status === 'approved' && refreshUser) refreshUser()
          }
        } catch {}
      }, 5000)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [step, requestId])

  const handleNext = () => {
    setError('')
    const min = info?.min_recharge || 10000
    if (!amount || Number(amount) < min) {
      return setError(`Số tiền nạp tối thiểu là ${formatVND(min)}`)
    }
    setStep(2)
  }

  const handleSubmit = async () => {
    setError(''); setSubmitting(true)
    try {
      const res = await api.requestRecharge({ method, amount: Number(amount) })
      setRequestId(res.id)
      setRequestStatus('pending')
      setStep(3)
    } catch (err) { setError(err.message) }
    setSubmitting(false)
  }

  const handleReset = () => {
    setStep(1); setAmount(''); setRequestId(null); setRequestStatus('pending'); setError('')
    if (pollRef.current) clearInterval(pollRef.current)
  }

  const copyText = (text) => {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    setCopied(text)
    setTimeout(() => setCopied(''), 2000)
  }

  const noteContent = info?.bank?.note_format?.replace('[username]', user?.username || '') || `NAP ${user?.username || ''}`

  // QR VietQR URL
  const qrUrl = info?.bank ? `https://img.vietqr.io/image/${info.bank.bank_name}-${info.bank.account_number}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(noteContent)}&accountName=${encodeURIComponent(info.bank.account_holder || '')}` : null

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={32} /></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-body hover:text-heading transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-[24px] font-bold text-heading">Nạp tiền</h1>
          <p className="text-[13px] text-muted">Chuyển khoản ngân hàng hoặc Crypto</p>
        </div>
      </div>

      {/* Số dư */}
      {user && (
        <div className="card p-4 mb-6 flex items-center gap-3">
          <Wallet size={20} style={{ color: 'var(--accent)' }} />
          <span className="text-[14px] text-body">Số dư hiện tại:</span>
          <span className="text-[18px] font-bold" style={{ color: 'var(--accent)' }}>{formatVND(user.balance)}</span>
        </div>
      )}

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: 'Chọn số tiền' },
          { n: 2, label: 'Chuyển khoản' },
          { n: 3, label: 'Xác nhận' },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0 transition-colors ${
              step >= s.n ? 'text-white' : 'text-muted'
            }`} style={{ background: step >= s.n ? 'var(--accent)' : 'var(--bg-elevated)', border: `1px solid ${step >= s.n ? 'var(--accent)' : 'var(--border-primary)'}` }}>
              {step > s.n ? <Check size={14} /> : s.n}
            </div>
            <span className={`text-[12px] font-medium hidden sm:block ${step >= s.n ? 'text-heading' : 'text-muted'}`}>{s.label}</span>
            {i < 2 && <div className="flex-1 h-[2px] rounded mx-1" style={{ background: step > s.n ? 'var(--accent)' : 'var(--border-primary)' }} />}
          </div>
        ))}
      </div>

      {/* STEP 1: Chọn số tiền */}
      {step === 1 && (
        <div className="card p-6 shadow-elevated">
          <h2 className="text-[16px] font-semibold text-heading mb-4">Chọn phương thức & số tiền</h2>

          <div className="flex gap-3 mb-6">
            <button onClick={() => setMethod('bank')} className="flex-1 p-4 rounded-xl border text-center transition-all" style={{ borderColor: method === 'bank' ? 'var(--accent)' : 'var(--border-primary)', background: method === 'bank' ? 'var(--accent-soft)' : 'transparent' }}>
              <CreditCard size={24} className="mx-auto mb-2" style={{ color: method === 'bank' ? 'var(--accent)' : 'var(--text-muted)' }} />
              <span className="text-[13px] font-medium" style={{ color: method === 'bank' ? 'var(--accent)' : 'var(--text-secondary)' }}>Ngân hàng</span>
            </button>
            <button onClick={() => setMethod('crypto')} className="flex-1 p-4 rounded-xl border text-center transition-all" style={{ borderColor: method === 'crypto' ? 'var(--accent)' : 'var(--border-primary)', background: method === 'crypto' ? 'var(--accent-soft)' : 'transparent' }}>
              <Wallet size={24} className="mx-auto mb-2" style={{ color: method === 'crypto' ? 'var(--accent)' : 'var(--text-muted)' }} />
              <span className="text-[13px] font-medium" style={{ color: method === 'crypto' ? 'var(--accent)' : 'var(--text-secondary)' }}>Crypto</span>
            </button>
          </div>

          <label className="block text-[13px] text-body mb-2 font-medium">Số tiền nạp (VNĐ)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setError('') }}
            placeholder={`Tối thiểu ${formatVND(info?.min_recharge || 10000)}`}
            className="w-full input-theme px-4 py-3 text-[14px] rounded-xl mb-4"
          />

          <div className="flex gap-2 mb-6 flex-wrap">
            {[50000, 100000, 200000, 500000, 1000000].map((v) => (
              <button key={v} type="button" onClick={() => { setAmount(String(v)); setError('') }}
                className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
                style={{
                  background: Number(amount) === v ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: Number(amount) === v ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${Number(amount) === v ? 'var(--accent)' : 'var(--border-primary)'}`,
                }}
              >
                {formatVND(v)}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-900/15 border border-red-800/30 rounded-xl p-3 mb-4 text-[13px] text-red-400 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button onClick={handleNext} disabled={!amount} className="w-full btn-primary py-3 rounded-xl text-[15px] flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
            Tiếp tục <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* STEP 2: Hiện QR + thông tin CK */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code */}
          <div className="card p-6 shadow-elevated text-center">
            <h2 className="text-[16px] font-semibold text-heading mb-2">
              {method === 'bank' ? 'Quét mã QR để chuyển khoản' : 'Thông tin Crypto'}
            </h2>
            <p className="text-[13px] text-muted mb-4">Số tiền: <strong className="text-heading">{formatVND(Number(amount))}</strong></p>

            {method === 'bank' && qrUrl && (
              <div className="rounded-xl overflow-hidden inline-block p-3 mb-4" style={{ background: '#fff' }}>
                <img src={qrUrl} alt="QR Bank" className="w-[220px] h-[220px] object-contain" onError={(e) => { e.target.style.display = 'none' }} />
              </div>
            )}

            {method === 'crypto' && info?.crypto && (
              <div className="p-4 rounded-xl text-left space-y-3" style={{ background: 'var(--bg-elevated)' }}>
                {[['Network', info.crypto.network], ['Địa chỉ', info.crypto.address], ['Tỷ giá', info.crypto.rate]].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <div><div className="text-[11px] text-muted">{label}</div><div className="text-[13px] text-heading font-medium break-all">{val}</div></div>
                    <button onClick={() => copyText(val)} className="shrink-0 p-1.5 rounded-lg transition-colors" style={{ color: copied === val ? '#22c55e' : 'var(--accent)' }}>
                      {copied === val ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Thông tin chuyển khoản + nút xác nhận */}
          <div className="card p-6 shadow-elevated">
            <h2 className="text-[16px] font-semibold text-heading mb-4">Thông tin chuyển khoản</h2>

            {method === 'bank' && info?.bank && (
              <div className="space-y-3 mb-6">
                {[
                  ['Ngân hàng', info.bank.bank_name],
                  ['Số tài khoản', info.bank.account_number],
                  ['Chủ tài khoản', info.bank.account_holder],
                  ['Số tiền', formatVND(Number(amount))],
                  ['Nội dung CK', noteContent],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl px-3 py-2.5" style={{ background: 'var(--bg-elevated)' }}>
                    <div>
                      <div className="text-[11px] text-muted">{label}</div>
                      <div className="text-[14px] text-heading font-medium">{val}</div>
                    </div>
                    <button onClick={() => copyText(val)} className="shrink-0 p-1.5 rounded-lg transition-colors" style={{ color: copied === val ? '#22c55e' : 'var(--accent)' }}>
                      {copied === val ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-900/15 border border-red-800/30 rounded-xl p-3 mb-4 text-[13px] text-red-400 flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={submitting} className="w-full btn-primary py-3 rounded-xl text-[15px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg mb-3">
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Đang gửi...</>
              ) : (
                <><CheckCircle size={16} /> Đã chuyển khoản, gửi yêu cầu</>
              )}
            </button>

            <button onClick={() => setStep(1)} className="w-full py-2.5 rounded-xl text-[13px] text-body hover:text-heading transition-colors" style={{ border: '1px solid var(--border-primary)' }}>
              ← Quay lại
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Trạng thái chờ duyệt */}
      {step === 3 && (
        <div className="card p-8 shadow-elevated text-center max-w-lg mx-auto">
          {requestStatus === 'pending' && (
            <>
              <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: 'var(--accent-soft)', border: '3px solid var(--accent-border)' }}>
                <Clock size={32} style={{ color: 'var(--accent)' }} className="animate-pulse" />
              </div>
              <h2 className="text-[20px] font-bold text-heading mb-2">Đang chờ duyệt</h2>
              <p className="text-[14px] text-body mb-2">
                Yêu cầu nạp <strong style={{ color: 'var(--accent)' }}>{formatVND(Number(amount))}</strong> đã được gửi thành công.
              </p>
              <p className="text-[13px] text-muted mb-6">
                Admin sẽ xác nhận trong vòng 5-30 phút. Trang sẽ tự động cập nhật khi hoàn tất.
              </p>
              <div className="flex items-center justify-center gap-2 text-[13px] text-muted mb-6">
                <Loader2 size={14} className="animate-spin" /> Đang kiểm tra trạng thái...
              </div>
              <button onClick={handleReset} className="px-6 py-2.5 rounded-xl text-[14px] text-body hover:text-heading font-medium transition-colors" style={{ border: '1px solid var(--border-primary)' }}>
                Nạp thêm
              </button>
            </>
          )}

          {requestStatus === 'approved' && (
            <>
              <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center bg-green-900/20 border-[3px] border-green-500/30">
                <CheckCircle size={36} className="text-green-400" />
              </div>
              <h2 className="text-[20px] font-bold text-heading mb-2">Nạp tiền thành công!</h2>
              <p className="text-[14px] text-body mb-2">
                Đã cộng <strong className="text-green-400">{formatVND(Number(amount))}</strong> vào tài khoản.
              </p>
              <p className="text-[14px] text-body mb-6">
                Số dư mới: <strong style={{ color: 'var(--accent)' }}>{formatVND(user?.balance || 0)}</strong>
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={handleReset} className="btn-primary px-6 py-2.5 rounded-xl text-[14px]">
                  Nạp thêm
                </button>
                <Link to="/" className="px-6 py-2.5 rounded-xl text-[14px] text-body hover:text-heading font-medium transition-colors" style={{ border: '1px solid var(--border-primary)' }}>
                  Về trang chủ
                </Link>
              </div>
            </>
          )}

          {requestStatus === 'rejected' && (
            <>
              <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center bg-red-900/20 border-[3px] border-red-500/30">
                <AlertCircle size={36} className="text-red-400" />
              </div>
              <h2 className="text-[20px] font-bold text-heading mb-2">Yêu cầu bị từ chối</h2>
              <p className="text-[14px] text-body mb-6">
                Yêu cầu nạp tiền đã bị từ chối. Vui lòng liên hệ admin qua Telegram nếu cần hỗ trợ.
              </p>
              <button onClick={handleReset} className="btn-primary px-6 py-2.5 rounded-xl text-[14px]">
                Thử lại
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
