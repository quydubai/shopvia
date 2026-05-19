import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Search, MessageCircle, CreditCard, ShoppingCart, Shield, RefreshCcw, HelpCircle } from 'lucide-react'

const faqData = [
  {
    category: 'Tài khoản & Đăng ký',
    icon: Shield,
    items: [
      {
        q: 'Làm sao để đăng ký tài khoản?',
        a: 'Bạn chỉ cần nhấn nút "Đăng Ký" ở góc trên bên phải, nhập username, email và mật khẩu. Tài khoản sẽ được kích hoạt ngay sau khi đăng ký thành công.'
      },
      {
        q: 'Tôi quên mật khẩu, phải làm sao?',
        a: 'Nhấn vào "Quên mật khẩu" tại trang đăng nhập, nhập email đã đăng ký. Hệ thống sẽ gửi link đặt lại mật khẩu qua email cho bạn.'
      },
      {
        q: 'Tôi có thể đổi mật khẩu không?',
        a: 'Có, sau khi đăng nhập bạn vào trang "Hồ sơ" để thay đổi mật khẩu bất cứ lúc nào.'
      },
      {
        q: 'Tài khoản bị khóa phải làm sao?',
        a: 'Nếu tài khoản bị khóa, vui lòng liên hệ admin qua Telegram @quydubai để được hỗ trợ mở khóa.'
      },
    ],
  },
  {
    category: 'Nạp tiền',
    icon: CreditCard,
    items: [
      {
        q: 'Hệ thống hỗ trợ những phương thức nạp tiền nào?',
        a: 'Hiện tại hệ thống hỗ trợ nạp tiền qua chuyển khoản ngân hàng (MB Bank) và tiền điện tử (USDT TRC20). Bạn vào mục "Nạp tiền" để xem thông tin chi tiết.'
      },
      {
        q: 'Nạp tiền mất bao lâu để được duyệt?',
        a: 'Thông thường yêu cầu nạp tiền sẽ được duyệt trong vòng 5-15 phút trong giờ hành chính. Ngoài giờ có thể lâu hơn, tối đa 24 giờ.'
      },
      {
        q: 'Số tiền nạp tối thiểu là bao nhiêu?',
        a: 'Số tiền nạp tối thiểu là 10.000 VNĐ. Bạn có thể kiểm tra thông tin cập nhật tại trang nạp tiền.'
      },
      {
        q: 'Tôi đã chuyển tiền nhưng chưa được cộng số dư?',
        a: 'Vui lòng kiểm tra lại nội dung chuyển khoản đã đúng cú pháp "NAP [username]" chưa. Nếu đã đúng mà vẫn chưa được duyệt, hãy liên hệ Telegram @quydubai kèm ảnh chụp giao dịch.'
      },
    ],
  },
  {
    category: 'Mua hàng & Đơn hàng',
    icon: ShoppingCart,
    items: [
      {
        q: 'Cách mua sản phẩm trên hệ thống?',
        a: 'Chọn danh mục sản phẩm → Chọn sản phẩm cần mua → Nhập số lượng → Nhấn "Mua". Hệ thống sẽ tự động trừ số dư và giao sản phẩm cho bạn ngay lập tức.'
      },
      {
        q: 'Sản phẩm được giao như thế nào?',
        a: 'Sau khi mua thành công, sản phẩm (tài khoản, mã key...) sẽ hiển thị ngay trên trang "Đơn hàng". Bạn có thể sao chép hoặc tải về dưới dạng file text.'
      },
      {
        q: 'Tôi có thể mua nhiều sản phẩm cùng lúc không?',
        a: 'Có, bạn có thể nhập số lượng muốn mua (trong giới hạn min-max của sản phẩm). Hệ thống sẽ giao đủ số lượng tài khoản cho bạn.'
      },
      {
        q: 'Sản phẩm hết hàng thì sao?',
        a: 'Khi sản phẩm hết hàng, nút mua sẽ bị vô hiệu hóa. Bạn có thể quay lại sau hoặc liên hệ admin để hỏi thời gian restock.'
      },
    ],
  },
  {
    category: 'Hoàn tiền & Bảo hành',
    icon: RefreshCcw,
    items: [
      {
        q: 'Chính sách hoàn tiền như thế nào?',
        a: 'Chúng tôi cam kết hoàn tiền 100% nếu sản phẩm không đúng mô tả hoặc không sử dụng được. Yêu cầu hoàn tiền phải được gửi trong vòng 24 giờ sau khi mua.'
      },
      {
        q: 'Làm sao để yêu cầu hoàn tiền?',
        a: 'Liên hệ admin qua Telegram @quydubai, cung cấp mã đơn hàng và lý do hoàn tiền. Admin sẽ xử lý trong vòng 24 giờ.'
      },
      {
        q: 'Sản phẩm mua rồi có được đổi không?',
        a: 'Do tính chất sản phẩm số, chúng tôi không hỗ trợ đổi sản phẩm. Tuy nhiên nếu sản phẩm lỗi, bạn sẽ được hoàn tiền hoặc thay thế tương đương.'
      },
    ],
  },
  {
    category: 'Công cụ & Tính năng',
    icon: HelpCircle,
    items: [
      {
        q: 'Check Live Facebook là gì?',
        a: 'Đây là công cụ kiểm tra trạng thái tài khoản Facebook (còn hoạt động hay đã bị khóa). Bạn nhập danh sách UID và hệ thống sẽ kiểm tra tự động.'
      },
      {
        q: 'Get 2FA hoạt động như thế nào?',
        a: 'Công cụ Get 2FA giúp bạn tạo mã xác thực 2 bước (TOTP) từ secret key. Nhập secret key và hệ thống sẽ tạo mã 6 số tự động làm mới mỗi 30 giây.'
      },
      {
        q: 'Tôi cần đăng nhập để sử dụng công cụ không?',
        a: 'Có, các công cụ Check Live và Get 2FA yêu cầu đăng nhập để sử dụng. Đây là để đảm bảo bảo mật và tránh lạm dụng hệ thống.'
      },
    ],
  },
  {
    category: 'Liên hệ & Hỗ trợ',
    icon: MessageCircle,
    items: [
      {
        q: 'Làm sao để liên hệ hỗ trợ?',
        a: 'Bạn có thể liên hệ qua Telegram @quydubai hoặc gọi hotline 0834724567. Đội ngũ hỗ trợ hoạt động 24/7.'
      },
      {
        q: 'Thời gian phản hồi hỗ trợ mất bao lâu?',
        a: 'Thông thường chúng tôi phản hồi trong vòng 5-30 phút qua Telegram. Trong giờ cao điểm có thể lâu hơn nhưng không quá 2 giờ.'
      },
      {
        q: 'Tôi có thể góp ý hoặc báo lỗi ở đâu?',
        a: 'Mọi góp ý, phản hồi hoặc báo lỗi đều có thể gửi qua Telegram @quydubai. Chúng tôi luôn lắng nghe và cải thiện dịch vụ.'
      },
    ],
  },
]

function FAQItem({ item }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderBottom: '1px solid var(--border-secondary)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--bg-hover)] transition-colors"
      >
        <span className="text-[14px] font-medium text-heading pr-4">{item.q}</span>
        <ChevronDown
          size={18}
          className="shrink-0 text-muted transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-[13px] text-body leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filtered = searchTerm.trim()
    ? faqData.map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.a.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      })).filter((cat) => cat.items.length > 0)
    : faqData

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted hover:text-[var(--accent)] transition-colors"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)' }}
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-[24px] font-bold text-heading">Câu hỏi thường gặp</h1>
          <p className="text-[13px] text-muted mt-0.5">Tìm câu trả lời nhanh cho những thắc mắc phổ biến</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm câu hỏi..."
          className="w-full input-theme rounded-xl pl-11 pr-4 py-3 text-[14px]"
        />
      </div>

      {/* FAQ Categories */}
      <div className="space-y-6">
        {filtered.map((cat) => (
          <div key={cat.category} className="card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-elevated)' }}>
              <cat.icon size={20} style={{ color: 'var(--accent)' }} />
              <h2 className="text-[15px] font-semibold text-heading">{cat.category}</h2>
              <span className="text-[11px] text-muted ml-auto">{cat.items.length} câu hỏi</span>
            </div>
            <div>
              {cat.items.map((item, i) => (
                <FAQItem key={i} item={item} />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="card p-10 text-center">
            <HelpCircle size={40} className="mx-auto mb-3 text-muted" />
            <p className="text-[15px] text-heading font-medium mb-1">Không tìm thấy kết quả</p>
            <p className="text-[13px] text-muted">Thử tìm với từ khóa khác hoặc liên hệ hỗ trợ qua Telegram @quydubai</p>
          </div>
        )}
      </div>

      {/* Contact CTA */}
      <div className="card p-6 mt-8 text-center">
        <h3 className="text-[16px] font-semibold text-heading mb-2">Chưa tìm thấy câu trả lời?</h3>
        <p className="text-[13px] text-body mb-4">Liên hệ đội ngũ hỗ trợ, chúng tôi luôn sẵn sàng giúp bạn.</p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://t.me/quydubai"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary px-5 py-2.5 rounded-xl text-[13px] inline-flex items-center gap-2"
          >
            <MessageCircle size={16} /> Chat Telegram
          </a>
          <a
            href="tel:0834724567"
            className="px-5 py-2.5 rounded-xl text-[13px] text-body hover:text-heading transition-colors inline-flex items-center gap-2"
            style={{ border: '1px solid var(--border-primary)' }}
          >
            Gọi 0834724567
          </a>
        </div>
      </div>
    </div>
  )
}
