import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, CheckCircle, XCircle, AlertTriangle, Loader2, Copy, Download, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API_BASE = 'http://localhost:3001/api'

export default function CheckLivePage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading, navigate])

  const [input, setInput] = useState('')
  const [results, setResults] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, live, die

  const handleCheck = async () => {
    if (!input.trim()) return setError('Vui lòng nhập UID hoặc link Facebook.')
    setError(''); setLoading(true); setResults(null); setSummary(null)

    try {
      const res = await fetch(`${API_BASE}/tools/checklive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accounts: input }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResults(data.results)
      setSummary(data.summary)
    } catch (err) {
      setError(err.message || 'Lỗi khi kiểm tra.')
    }
    setLoading(false)
  }

  const filtered = results ? (filter === 'all' ? results : results.filter(r => r.status === filter)) : []

  const exportResults = (status) => {
    const items = results?.filter(r => status === 'all' ? true : r.status === status) || []
    const text = items.map(r => r.uid).join('\n')
    navigator.clipboard.writeText(text)
  }

  const downloadResults = (status) => {
    const items = results?.filter(r => status === 'all' ? true : r.status === status) || []
    const text = items.map(r => r.uid).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `facebook_${status}_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-body hover:text-heading transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-[24px] font-bold text-heading">Check Live Facebook</h1>
          <p className="text-[13px] text-muted">Kiểm tra tài khoản Facebook còn sống hay đã die</p>
        </div>
      </div>

      {/* Input area */}
      <div className="card p-6 shadow-elevated mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Search size={16} style={{ color: 'var(--accent)' }} />
          <label className="text-[14px] text-heading font-semibold">Nhập UID hoặc Link Facebook</label>
        </div>
        <p className="text-[12px] text-muted mb-3">Mỗi dòng 1 UID hoặc link. Tối đa 50 tài khoản mỗi lần.</p>

        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setError('') }}
          placeholder={`Ví dụ:\n100001234567890\nhttps://facebook.com/profile.php?id=100001234567890\nhttps://facebook.com/username`}
          rows={6}
          className="w-full input-theme px-4 py-3 text-[13px] rounded-xl mb-4 resize-y"
          style={{ fontFamily: 'monospace' }}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={handleCheck}
            disabled={loading || !input.trim()}
            className="btn-primary px-6 py-2.5 rounded-xl text-[14px] flex items-center gap-2 disabled:opacity-50 shadow-lg"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Đang kiểm tra...</>
            ) : (
              <><Search size={16} /> Kiểm tra</>
            )}
          </button>

          {input.trim() && (
            <button onClick={() => { setInput(''); setResults(null); setSummary(null) }}
              className="px-4 py-2.5 rounded-xl text-[13px] text-body hover:text-heading transition-colors flex items-center gap-1.5"
              style={{ border: '1px solid var(--border-primary)' }}>
              <Trash2 size={14} /> Xóa
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-900/15 border border-red-800/30 rounded-xl p-3 mt-4 text-[13px] text-red-400 flex items-center gap-2">
            <AlertTriangle size={14} /> {error}
          </div>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card p-4 text-center">
            <div className="text-[24px] font-bold text-heading">{summary.total}</div>
            <div className="text-[12px] text-muted font-medium">Tổng</div>
          </div>
          <div className="card p-4 text-center" style={{ borderColor: 'rgba(34,197,94,0.3)' }}>
            <div className="text-[24px] font-bold text-green-400">{summary.live}</div>
            <div className="text-[12px] text-green-400/70 font-medium">Live</div>
          </div>
          <div className="card p-4 text-center" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
            <div className="text-[24px] font-bold text-red-400">{summary.die}</div>
            <div className="text-[12px] text-red-400/70 font-medium">Die</div>
          </div>
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div className="card shadow-elevated overflow-hidden">
          {/* Filter + Actions */}
          <div className="flex items-center justify-between p-4 flex-wrap gap-3" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
            <div className="flex gap-2">
              {[
                { key: 'all', label: `Tất cả (${results.length})` },
                { key: 'live', label: `Live (${summary?.live || 0})` },
                { key: 'die', label: `Die (${summary?.die || 0})` },
              ].map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                  style={{
                    background: filter === f.key ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: filter === f.key ? '#fff' : 'var(--text-secondary)',
                    border: `1px solid ${filter === f.key ? 'var(--accent)' : 'var(--border-primary)'}`,
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => exportResults(filter)} className="px-3 py-1.5 rounded-lg text-[12px] text-body hover:text-heading flex items-center gap-1 transition-colors" style={{ border: '1px solid var(--border-primary)' }}>
                <Copy size={12} /> Copy UID
              </button>
              <button onClick={() => downloadResults(filter)} className="px-3 py-1.5 rounded-lg text-[12px] text-body hover:text-heading flex items-center gap-1 transition-colors" style={{ border: '1px solid var(--border-primary)' }}>
                <Download size={12} /> Tải file
              </button>
            </div>
          </div>

          {/* List */}
          <div className="divide-y" style={{ borderColor: 'var(--border-secondary)' }}>
            {filtered.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
                  {r.avatar ? (
                    <img src={r.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[12px] text-muted font-bold">FB</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-heading font-medium truncate">{r.uid}</div>
                  <a href={`https://facebook.com/${r.uid}`} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] text-muted hover:text-[var(--accent)] transition-colors truncate block">
                    facebook.com/{r.uid}
                  </a>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  {r.status === 'live' && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-bold text-green-400 bg-green-900/20 border border-green-500/20">
                      <CheckCircle size={12} /> LIVE
                    </span>
                  )}
                  {r.status === 'die' && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-bold text-red-400 bg-red-900/20 border border-red-500/20">
                      <XCircle size={12} /> DIE
                    </span>
                  )}
                  {r.status === 'error' && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-bold text-yellow-400 bg-yellow-900/20 border border-yellow-500/20">
                      <AlertTriangle size={12} /> LỖI
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted text-[14px]">Không có kết quả phù hợp.</div>
          )}
        </div>
      )}
    </div>
  )
}
