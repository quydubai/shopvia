import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Calendar, Eye, User } from 'lucide-react'
import { api } from '../lib/api'

function renderMarkdown(text) {
  if (!text) return ''
  return text
    .replace(/## (.+)/g, '<h2 class="text-[18px] font-bold text-heading mt-6 mb-3">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-heading">$1</strong>')
    .replace(/\n/g, '<br/>')
}

export default function BlogDetailPage() {
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getBlog(slug)
      .then((d) => setBlog(d.blog))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={32} /></div>

  if (error || !blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/blogs" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-[var(--accent)] transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-[24px] font-bold text-heading">Bài viết</h1>
        </div>
        <div className="card p-10 text-center">
          <p className="text-[14px] text-muted">{error || 'Bài viết không tồn tại.'}</p>
          <Link to="/blogs" className="inline-block mt-4 text-[14px] font-semibold hover:underline" style={{ color: 'var(--accent)' }}>← Quay lại danh sách</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/blogs" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-[var(--accent)] transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold text-heading leading-tight">{blog.title}</h1>
          <div className="flex items-center gap-4 mt-1 text-[12px] text-muted">
            <span className="flex items-center gap-1"><User size={12} /> {blog.author}</span>
            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(blog.created_at).toLocaleDateString('vi-VN')}</span>
            <span className="flex items-center gap-1"><Eye size={12} /> {blog.views} lượt xem</span>
          </div>
        </div>
      </div>

      <div className="card p-6 lg:p-8">
        {blog.summary && (
          <p className="text-[14px] text-body italic pl-4 mb-6" style={{ borderLeft: '4px solid var(--accent)' }}>{blog.summary}</p>
        )}
        <div
          className="text-[14px] text-body leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content) }}
        />
      </div>

      <div className="mt-6 text-center">
        <Link to="/blogs" className="text-[13px] font-semibold hover:underline" style={{ color: 'var(--accent)' }}>← Quay lại danh sách bài viết</Link>
      </div>
    </div>
  )
}
