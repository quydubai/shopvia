import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Calendar, Eye, ChevronRight } from 'lucide-react'
import { api } from '../lib/api'

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getBlogs().then((d) => setBlogs(d.blogs)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" style={{ color: 'var(--accent)' }} size={32} /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-[var(--accent)] transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-[24px] font-bold text-heading">Bài viết</h1>
          <p className="text-[13px] text-muted">Tin tức, hướng dẫn và thông báo mới nhất</p>
        </div>
      </div>

      {blogs.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-[14px] text-muted">Chưa có bài viết nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              to={`/blogs/${blog.slug}`}
              className="block card p-5 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-[17px] font-semibold text-heading group-hover:text-[var(--accent)] transition-colors mb-2 line-clamp-2">
                    {blog.title}
                  </h2>
                  <p className="text-[13px] text-muted line-clamp-2 mb-3">{blog.summary}</p>
                  <div className="flex items-center gap-4 text-[12px] text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(blog.created_at).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      {blog.views} lượt xem
                    </span>
                    <span style={{ color: 'var(--accent)' }}>@{blog.author}</span>
                  </div>
                </div>
                <div className="shrink-0 text-muted group-hover:text-[var(--accent)] transition-colors mt-2">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
