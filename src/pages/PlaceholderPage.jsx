import { Link } from 'react-router-dom'
import { ArrowLeft, Lock } from 'lucide-react'

export default function PlaceholderPage({ title }) {
  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-[var(--accent)] transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-[24px] font-bold text-heading">{title}</h1>
      </div>

      <div className="card p-10 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
          <Lock size={24} className="text-muted" />
        </div>
        <h2 className="text-[18px] font-semibold text-heading mb-2">Yêu cầu đăng nhập</h2>
        <p className="text-[14px] text-muted mb-6">Vui lòng đăng nhập để truy cập trang này.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 btn-primary px-6 py-2.5 rounded-xl text-[14px]"
        >
          Đăng Nhập
        </Link>
      </div>
    </div>
  )
}
