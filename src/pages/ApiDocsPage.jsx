import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Copy, CheckCircle, Lock, Globe } from 'lucide-react'

const API_BASE = 'https://huynhquymedia.net/api'

const sections = [
  {
    title: 'Xác thực (Auth)',
    icon: Lock,
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/register',
        desc: 'Đăng ký tài khoản mới',
        auth: false,
        body: { username: 'string (min 3)', email: 'string', password: 'string (min 4)' },
        response: { token: 'string', user: { id: 1, username: 'string', email: 'string', balance: 0, role: 'user' } },
      },
      {
        method: 'POST',
        path: '/api/auth/login',
        desc: 'Đăng nhập',
        auth: false,
        body: { username: 'string', password: 'string' },
        response: { token: 'string', user: { id: 1, username: 'string', email: 'string', balance: 500000, role: 'user' } },
      },
      {
        method: 'GET',
        path: '/api/auth/me',
        desc: 'Lấy thông tin user hiện tại',
        auth: true,
        body: null,
        response: { user: { id: 1, username: 'string', email: 'string', balance: 500000, role: 'user', status: 'active' } },
      },
      {
        method: 'PUT',
        path: '/api/auth/profile',
        desc: 'Cập nhật thông tin cá nhân / đổi mật khẩu',
        auth: true,
        body: { email: 'string (optional)', currentPassword: 'string (required if changing pw)', newPassword: 'string (optional)' },
        response: { user: { id: 1, username: 'string', email: 'string', balance: 500000, role: 'user' } },
      },
    ],
  },
  {
    title: 'Sản phẩm (Products)',
    icon: Globe,
    endpoints: [
      {
        method: 'GET',
        path: '/api/products',
        desc: 'Danh sách sản phẩm (có phân trang)',
        auth: false,
        params: { category: 'slug danh mục (optional)', search: 'tìm theo tên (optional)', page: 'number (default 1)', limit: 'number (default 20)' },
        response: { products: ['...'], total: 100, page: 1, pages: 5 },
      },
      {
        method: 'GET',
        path: '/api/products/:slug',
        desc: 'Chi tiết sản phẩm theo slug',
        auth: false,
        body: null,
        response: { product: { id: 1, name: 'string', slug: 'string', description: 'string', price: 25000, stock: 150, category_name: 'string' } },
      },
      {
        method: 'GET',
        path: '/api/products/categories/all',
        desc: 'Tất cả danh mục (grouped theo parent_group)',
        auth: false,
        body: null,
        response: { categories: ['...'], grouped: { 'CLONE': ['...'], 'TÀI KHOẢN': ['...'] } },
      },
      {
        method: 'GET',
        path: '/api/products/by-category/:slug',
        desc: 'Sản phẩm theo danh mục',
        auth: false,
        body: null,
        response: { category: { id: 1, name: 'string', slug: 'string', parent_group: 'string' }, products: ['...'] },
      },
    ],
  },
  {
    title: 'Đơn hàng (Orders)',
    icon: Globe,
    endpoints: [
      {
        method: 'POST',
        path: '/api/orders/buy',
        desc: 'Mua sản phẩm — tự động trừ tiền và giao data',
        auth: true,
        body: { product_id: 'number', quantity: 'number (default 1)' },
        response: { message: 'Mua hàng thành công!', order_id: 1, data: 'account1@email.com|pass123', balance: 475000 },
      },
      {
        method: 'GET',
        path: '/api/orders',
        desc: 'Lịch sử đơn hàng của user',
        auth: true,
        params: { page: 'number', limit: 'number' },
        response: { orders: ['...'], total: 10, page: 1, pages: 1 },
      },
      {
        method: 'GET',
        path: '/api/orders/:id',
        desc: 'Chi tiết đơn hàng (bao gồm data đã nhận)',
        auth: true,
        body: null,
        response: { order: { id: 1, product_name: 'string', quantity: 1, total_price: 25000, data_received: 'string', status: 'completed', created_at: 'datetime' } },
      },
    ],
  },
]

const methodColors = {
  GET: 'bg-green-900/40 text-green-400 border-green-800/50',
  POST: 'bg-blue-900/40 text-blue-400 border-blue-800/50',
  PUT: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/50',
  DELETE: 'bg-red-900/40 text-red-400 border-red-800/50',
}

function EndpointCard({ ep }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyPath = () => {
    navigator.clipboard.writeText(API_BASE.replace('/api', '') + ep.path)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="overflow-hidden" style={{ border: '1px solid var(--border-secondary)', borderRadius: '10px' }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors text-left">
        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded border ${methodColors[ep.method]}`}>{ep.method}</span>
        <code className="text-[13px] text-body font-mono flex-1">{ep.path}</code>
        <div className="flex items-center gap-2">
          {ep.auth === 'admin' && <span className="text-[10px] bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded font-bold">ADMIN</span>}
          {ep.auth === true && <span className="text-[10px] bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded font-bold">AUTH</span>}
          {ep.auth === false && <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded font-bold">PUBLIC</span>}
          <ChevronDown size={14} className={`text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="px-4 py-4 space-y-4" style={{ borderTop: '1px solid var(--border-secondary)', background: 'var(--bg-elevated)' }}>
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-body">{ep.desc}</p>
            <button onClick={copyPath} className="flex items-center gap-1 text-[11px] hover:underline shrink-0" style={{ color: 'var(--accent)' }}>
              {copied ? <><CheckCircle size={10} /> Copied!</> : <><Copy size={10} /> Copy URL</>}
            </button>
          </div>

          {ep.auth && (
            <div className="rounded-lg p-3" style={{ background: 'var(--bg-secondary)' }}>
              <p className="text-[11px] text-muted font-bold uppercase mb-1">Header yêu cầu:</p>
              <code className="text-[12px] text-yellow-400 font-mono">Authorization: Bearer {'<token>'}</code>
              {ep.auth === 'admin' && <p className="text-[11px] text-purple-400 mt-1">* Yêu cầu role = admin</p>}
            </div>
          )}

          {ep.params && (
            <div>
              <p className="text-[11px] text-muted font-bold uppercase mb-2">Query Parameters:</p>
              <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                {Object.entries(ep.params).map(([key, val]) => (
                  <div key={key} className="flex" style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                    <div className="px-3 py-2 w-32 shrink-0"><code className="text-[12px] font-mono" style={{ color: 'var(--accent)' }}>{key}</code></div>
                    <div className="px-3 py-2 text-[12px] text-body">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ep.body && (
            <div>
              <p className="text-[11px] text-muted font-bold uppercase mb-2">Request Body (JSON):</p>
              <pre className="rounded-lg p-3 text-[12px] text-body font-mono overflow-x-auto" style={{ background: 'var(--bg-secondary)' }}>{JSON.stringify(ep.body, null, 2)}</pre>
            </div>
          )}

          {ep.response && (
            <div>
              <p className="text-[11px] text-muted font-bold uppercase mb-2">Response (200 OK):</p>
              <pre className="rounded-lg p-3 text-[12px] text-green-400 font-mono overflow-x-auto" style={{ background: 'var(--bg-secondary)' }}>{JSON.stringify(ep.response, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ApiDocsPage() {
  const totalEndpoints = sections.reduce((sum, s) => sum + s.endpoints.length, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-[var(--accent)] transition-colors" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-[24px] font-bold text-heading">Tài liệu API</h1>
          <p className="text-[13px] text-muted">{totalEndpoints} endpoints — RESTful JSON API</p>
        </div>
      </div>

      {/* Endpoint sections */}
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center gap-2 mb-4">
              <section.icon size={18} style={{ color: 'var(--accent)' }} />
              <h2 className="text-[18px] font-bold text-heading">{section.title}</h2>
              <span className="text-[11px] text-muted px-2 py-0.5 rounded ml-2" style={{ background: 'var(--bg-elevated)' }}>{section.endpoints.length} endpoints</span>
            </div>
            <div className="space-y-2">
              {section.endpoints.map((ep) => (
                <EndpointCard key={ep.method + ep.path} ep={ep} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
