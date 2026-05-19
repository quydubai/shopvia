import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Key, Copy, Check, RefreshCw, Trash2, Plus, Clock, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ── TOTP implementation (no external deps) ──
function base32Decode(str) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  str = str.replace(/[\s=-]+/g, '').toUpperCase()
  let bits = ''
  for (const c of str) {
    const val = alphabet.indexOf(c)
    if (val === -1) continue
    bits += val.toString(2).padStart(5, '0')
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8))
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2)
  }
  return bytes
}

async function hmacSHA1(keyBytes, msgBytes) {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, msgBytes)
  return new Uint8Array(sig)
}

async function generateTOTP(secret, period = 30, digits = 6) {
  const keyBytes = base32Decode(secret)
  const epoch = Math.floor(Date.now() / 1000)
  const counter = Math.floor(epoch / period)

  const msgBytes = new Uint8Array(8)
  let tmp = counter
  for (let i = 7; i >= 0; i--) {
    msgBytes[i] = tmp & 0xff
    tmp = Math.floor(tmp / 256)
  }

  const hash = await hmacSHA1(keyBytes, msgBytes)
  const offset = hash[hash.length - 1] & 0x0f
  const binary = ((hash[offset] & 0x7f) << 24) | ((hash[offset + 1] & 0xff) << 16) | ((hash[offset + 2] & 0xff) << 8) | (hash[offset + 3] & 0xff)
  const otp = (binary % Math.pow(10, digits)).toString().padStart(digits, '0')

  const remaining = period - (epoch % period)
  return { otp, remaining, period }
}

// ── Saved keys management ──
function getSavedKeys() {
  try { return JSON.parse(localStorage.getItem('hqm_2fa_keys') || '[]') } catch { return [] }
}
function saveKeys(keys) {
  localStorage.setItem('hqm_2fa_keys', JSON.stringify(keys))
}

// ── Single 2FA Card ──
function TOTPCard({ item, onRemove }) {
  const [otp, setOtp] = useState('------')
  const [remaining, setRemaining] = useState(30)
  const [copied, setCopied] = useState(false)
  const intervalRef = useRef(null)

  const refresh = useCallback(async () => {
    try {
      const result = await generateTOTP(item.secret)
      setOtp(result.otp)
      setRemaining(result.remaining)
    } catch {
      setOtp('LỖI')
    }
  }, [item.secret])

  useEffect(() => {
    refresh()
    intervalRef.current = setInterval(refresh, 1000)
    return () => clearInterval(intervalRef.current)
  }, [refresh])

  const copyOtp = () => {
    navigator.clipboard.writeText(otp)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const progress = (remaining / 30) * 100

  return (
    <div className="card p-4 shadow-elevated">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-border)' }}>
            <Shield size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-heading">{item.name || 'Không tên'}</div>
            <div className="text-[11px] text-muted font-mono">{item.secret.slice(0, 8)}****</div>
          </div>
        </div>
        <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg text-muted hover:text-red-400 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>

      {/* OTP Display */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={copyOtp} className="flex items-center gap-3 flex-1 rounded-xl px-4 py-3 transition-all hover:opacity-80" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
          <span className="text-[28px] font-bold tracking-[6px] font-mono text-heading">{otp}</span>
          <span className="shrink-0" style={{ color: copied ? '#22c55e' : 'var(--accent)' }}>
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </span>
        </button>
      </div>

      {/* Timer */}
      <div className="mt-3 flex items-center gap-2">
        <Clock size={12} className={remaining <= 5 ? 'text-red-400' : 'text-muted'} />
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, background: remaining <= 5 ? '#ef4444' : remaining <= 10 ? '#f59e0b' : 'var(--accent)' }} />
        </div>
        <span className={`text-[12px] font-bold font-mono ${remaining <= 5 ? 'text-red-400' : remaining <= 10 ? 'text-yellow-400' : 'text-muted'}`}>
          {remaining}s
        </span>
      </div>
    </div>
  )
}

// ── Main Page ──
export default function Get2FAPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading, navigate])

  const [keys, setKeys] = useState(getSavedKeys)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSecret, setNewSecret] = useState('')
  const [quickSecret, setQuickSecret] = useState('')
  const [quickOtp, setQuickOtp] = useState(null)
  const [quickRemaining, setQuickRemaining] = useState(30)
  const [quickCopied, setQuickCopied] = useState(false)
  const [error, setError] = useState('')
  const quickIntervalRef = useRef(null)

  // Quick check — nhập secret, get mã ngay
  const handleQuickCheck = async () => {
    const s = quickSecret.replace(/\s/g, '').toUpperCase()
    if (!s || s.length < 6) return setError('Secret key không hợp lệ.')
    setError('')
    try {
      const result = await generateTOTP(s)
      setQuickOtp(result.otp)
      setQuickRemaining(result.remaining)
      if (quickIntervalRef.current) clearInterval(quickIntervalRef.current)
      quickIntervalRef.current = setInterval(async () => {
        try {
          const r = await generateTOTP(s)
          setQuickOtp(r.otp)
          setQuickRemaining(r.remaining)
        } catch {}
      }, 1000)
    } catch {
      setError('Secret key không hợp lệ. Vui lòng kiểm tra lại.')
    }
  }

  useEffect(() => {
    return () => { if (quickIntervalRef.current) clearInterval(quickIntervalRef.current) }
  }, [])

  // Save key
  const handleAddKey = () => {
    const s = newSecret.replace(/\s/g, '').toUpperCase()
    if (!s || s.length < 6) return setError('Secret key không hợp lệ.')
    setError('')
    const newKey = { id: Date.now(), name: newName.trim() || 'Facebook', secret: s }
    const updated = [...keys, newKey]
    setKeys(updated)
    saveKeys(updated)
    setNewName(''); setNewSecret(''); setShowAdd(false)
  }

  const handleRemoveKey = (id) => {
    const updated = keys.filter(k => k.id !== id)
    setKeys(updated)
    saveKeys(updated)
  }

  const quickProgress = (quickRemaining / 30) * 100

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-body hover:text-heading transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-[24px] font-bold text-heading">Get mã 2FA</h1>
          <p className="text-[13px] text-muted">Tạo mã xác thực 2 lớp (TOTP) từ secret key</p>
        </div>
      </div>

      {/* Quick Check */}
      <div className="card p-6 shadow-elevated mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Key size={16} style={{ color: 'var(--accent)' }} />
          <h2 className="text-[15px] font-semibold text-heading">Lấy mã nhanh</h2>
        </div>
        <p className="text-[12px] text-muted mb-4">Nhập secret key (base32) để lấy mã 2FA ngay lập tức</p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={quickSecret}
            onChange={(e) => { setQuickSecret(e.target.value); setError('') }}
            placeholder="Nhập secret key (ví dụ: JBSWY3DPEHPK3PXP)"
            className="flex-1 input-theme px-4 py-2.5 text-[13px] rounded-xl font-mono"
          />
          <button onClick={handleQuickCheck} className="btn-primary px-5 py-2.5 rounded-xl text-[13px] flex items-center gap-1.5 shrink-0 shadow-lg">
            <RefreshCw size={14} /> Lấy mã
          </button>
        </div>

        {error && (
          <div className="bg-red-900/15 border border-red-800/30 rounded-xl p-3 mb-4 text-[13px] text-red-400">
            {error}
          </div>
        )}

        {quickOtp && (
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[32px] font-bold tracking-[8px] font-mono text-heading">{quickOtp}</span>
              <button onClick={() => { navigator.clipboard.writeText(quickOtp); setQuickCopied(true); setTimeout(() => setQuickCopied(false), 1500) }}
                className="p-2 rounded-lg transition-colors" style={{ color: quickCopied ? '#22c55e' : 'var(--accent)' }}>
                {quickCopied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={12} className={quickRemaining <= 5 ? 'text-red-400' : 'text-muted'} />
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-base)' }}>
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${quickProgress}%`, background: quickRemaining <= 5 ? '#ef4444' : quickRemaining <= 10 ? '#f59e0b' : 'var(--accent)' }} />
              </div>
              <span className={`text-[12px] font-bold font-mono ${quickRemaining <= 5 ? 'text-red-400' : quickRemaining <= 10 ? 'text-yellow-400' : 'text-muted'}`}>
                {quickRemaining}s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Saved Keys */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[16px] font-semibold text-heading">Khóa đã lưu</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', color: 'var(--accent)' }}>
          <Plus size={14} /> Thêm khóa
        </button>
      </div>

      {/* Add key form */}
      {showAdd && (
        <div className="card p-5 shadow-elevated mb-4">
          <div className="space-y-3">
            <div>
              <label className="block text-[12px] text-body mb-1 font-medium">Tên (tuỳ chọn)</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ví dụ: Facebook, Gmail..." className="w-full input-theme px-3 py-2 text-[13px] rounded-lg" />
            </div>
            <div>
              <label className="block text-[12px] text-body mb-1 font-medium">Secret Key *</label>
              <input type="text" value={newSecret} onChange={(e) => setNewSecret(e.target.value)} placeholder="Nhập secret key base32" className="w-full input-theme px-3 py-2 text-[13px] rounded-lg font-mono" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddKey} className="btn-primary px-4 py-2 rounded-lg text-[13px]">Lưu</button>
              <button onClick={() => { setShowAdd(false); setNewName(''); setNewSecret('') }} className="px-4 py-2 rounded-lg text-[13px] text-body" style={{ border: '1px solid var(--border-primary)' }}>Huỷ</button>
            </div>
          </div>
        </div>
      )}

      {/* Keys list */}
      {keys.length > 0 ? (
        <div className="space-y-3">
          {keys.map(k => <TOTPCard key={k.id} item={k} onRemove={handleRemoveKey} />)}
        </div>
      ) : (
        <div className="card p-8 text-center shadow-elevated">
          <Key size={32} className="mx-auto mb-3 text-muted" />
          <p className="text-[14px] text-muted">Chưa có khóa nào được lưu</p>
          <p className="text-[12px] text-muted mt-1">Bấm "Thêm khóa" để lưu secret key và tự động sinh mã 2FA</p>
        </div>
      )}
    </div>
  )
}
