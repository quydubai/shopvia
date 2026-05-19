import { Phone, Send, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-primary)' }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#ff7849] flex items-center justify-center font-bold text-white text-[13px]">
                HQM
              </div>
              <div>
                <span className="font-bold text-heading text-[18px]">HuynhQuyMedia</span>
                <span className="text-[12px] ml-1 font-semibold" style={{ color: 'var(--accent)' }}>.COM</span>
              </div>
            </div>
            <p className="text-[13px] text-body leading-relaxed">
              Nền tảng hỗ trợ quản lý và phân phối tài nguyên số trên môi trường trực tuyến.
              Hệ thống được xây dựng nhằm phục vụ nhu cầu cá nhân trong việc quản lý dữ liệu,
              tối ưu hiệu suất hiển thị và tự động hóa các hoạt động kỹ thuật số.
            </p>
          </div>

          <div>
            <h3 className="text-heading font-semibold text-[16px] mb-4">Liên hệ</h3>
            <div className="space-y-3">
              <a href="#" className="flex items-center gap-3 text-[14px] text-body hover:text-[var(--accent)] transition-colors">
                <Send size={16} style={{ color: 'var(--accent)' }} /> @quydubai
              </a>
              <a href="#" className="flex items-center gap-3 text-[14px] text-body hover:text-[var(--accent)] transition-colors">
                <Phone size={16} style={{ color: 'var(--accent)' }} /> 0834724567
              </a>
              <div className="flex items-center gap-3 text-[14px] text-body">
                <MapPin size={16} style={{ color: 'var(--accent)' }} /> Việt Nam
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-heading font-semibold text-[16px] mb-4">Liên kết</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Chính sách', to: '/policy' },
                { label: 'Câu hỏi thường gặp', to: '/faq' },
                { label: 'Blogs', to: '/blogs' },
                { label: 'Tài liệu API', to: '/api-docs' },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="block text-[14px] text-body hover:text-[var(--accent)] transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid var(--border-secondary)' }}>
          <p className="text-[13px] text-muted">
            © {new Date().getFullYear()} HuynhQuyMedia.Net — Nền tảng quản lý và phân phối tài nguyên số.
          </p>
        </div>
      </div>
    </footer>
  )
}
