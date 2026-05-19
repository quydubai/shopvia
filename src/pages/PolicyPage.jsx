import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, CreditCard, RefreshCcw, Lock, FileText, AlertTriangle } from 'lucide-react'

const sections = [
  {
    icon: FileText,
    title: 'Điều khoản sử dụng',
    content: [
      'Bằng việc truy cập và sử dụng dịch vụ tại HuynhQuyMedia.Net, bạn đồng ý tuân thủ toàn bộ các điều khoản được nêu tại đây.',
      'Mỗi người dùng chỉ được đăng ký và sử dụng một tài khoản duy nhất. Việc tạo nhiều tài khoản có thể dẫn đến khóa tất cả tài khoản liên quan.',
      'Người dùng có trách nhiệm bảo mật thông tin đăng nhập. Chúng tôi không chịu trách nhiệm cho mọi thiệt hại phát sinh do chia sẻ hoặc để lộ thông tin tài khoản.',
      'Nghiêm cấm sử dụng dịch vụ cho các mục đích bất hợp pháp, gian lận, hoặc vi phạm pháp luật Việt Nam.',
    ],
  },
  {
    icon: ShoppingCartIcon,
    title: 'Chính sách mua hàng',
    content: [
      'Tất cả sản phẩm trên hệ thống là tài nguyên số (tài khoản, mã key, dữ liệu...) được giao tự động ngay sau khi thanh toán thành công.',
      'Trước khi mua, vui lòng đọc kỹ mô tả sản phẩm. Mỗi sản phẩm có giới hạn mua tối thiểu và tối đa được hiển thị rõ ràng.',
      'Sau khi mua, sản phẩm sẽ hiển thị trong mục "Đơn hàng" trên tài khoản của bạn. Bạn có thể sao chép hoặc tải về dưới dạng file text.',
      'Giá cả có thể thay đổi mà không cần báo trước. Giá áp dụng là giá tại thời điểm đặt hàng.',
    ],
  },
  {
    icon: CreditCard,
    title: 'Chính sách nạp tiền',
    content: [
      'Hệ thống hỗ trợ nạp tiền qua chuyển khoản ngân hàng (MB Bank) và tiền điện tử (USDT TRC20).',
      'Khi chuyển khoản ngân hàng, vui lòng ghi đúng nội dung "NAP [username]" để được xử lý tự động. Sai cú pháp có thể làm chậm quá trình duyệt.',
      'Số tiền nạp tối thiểu là 10.000 VNĐ. Yêu cầu nạp tiền thường được duyệt trong vòng 5-15 phút trong giờ hành chính.',
      'Số dư trong tài khoản không có thời hạn sử dụng và không thể rút ra tiền mặt hoặc chuyển sang tài khoản khác.',
    ],
  },
  {
    icon: RefreshCcw,
    title: 'Chính sách hoàn tiền',
    content: [
      'Chúng tôi cam kết hoàn tiền 100% trong các trường hợp: sản phẩm không đúng mô tả, sản phẩm không sử dụng được, hoặc hệ thống giao thiếu số lượng.',
      'Yêu cầu hoàn tiền phải được gửi trong vòng 24 giờ kể từ thời điểm mua hàng. Sau thời gian này, yêu cầu có thể bị từ chối.',
      'Để yêu cầu hoàn tiền, liên hệ admin qua Telegram @quydubai kèm mã đơn hàng và lý do cụ thể.',
      'Tiền hoàn sẽ được cộng lại vào số dư tài khoản trong vòng 24 giờ sau khi yêu cầu được chấp nhận.',
      'Không hoàn tiền trong các trường hợp: mua nhầm sản phẩm do lỗi người dùng, tài khoản đã sử dụng hoặc thay đổi thông tin, vi phạm điều khoản sử dụng.',
    ],
  },
  {
    icon: Lock,
    title: 'Chính sách bảo mật',
    content: [
      'Chúng tôi cam kết bảo mật tuyệt đối thông tin cá nhân của người dùng bao gồm: email, mật khẩu, lịch sử giao dịch.',
      'Mật khẩu được mã hóa một chiều (bcrypt hash). Ngay cả quản trị viên cũng không thể xem mật khẩu gốc của bạn.',
      'Chúng tôi không chia sẻ, bán hoặc cung cấp thông tin người dùng cho bất kỳ bên thứ ba nào.',
      'Người dùng nên sử dụng mật khẩu mạnh (tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số) và thay đổi định kỳ.',
      'Phiên đăng nhập sử dụng JWT token với thời hạn giới hạn để đảm bảo an toàn.',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Từ chối trách nhiệm khi sử dụng sai mục đích',
    content: [
      'Tất cả sản phẩm và tài khoản trên HuynhQuyMedia.Net chỉ được cung cấp nhằm phục vụ các mục đích hợp pháp: quản lý nội dung, chạy quảng cáo, nghiên cứu thị trường, học tập và phát triển cá nhân.',
      'HuynhQuyMedia.Net HOÀN TOÀN KHÔNG CHỊU TRÁCH NHIỆM đối với bất kỳ hành vi sử dụng sai mục đích nào của người mua sau khi nhận sản phẩm, bao gồm nhưng không giới hạn: lừa đảo, spam, quấy rối, xâm phạm quyền riêng tư, vi phạm điều khoản dịch vụ của bên thứ ba (Facebook, Google, TikTok...) hoặc bất kỳ hoạt động trái pháp luật nào khác.',
      'Người mua hoàn toàn chịu trách nhiệm trước pháp luật về cách thức sử dụng sản phẩm/tài khoản đã mua. Mọi hậu quả pháp lý, thiệt hại hoặc tranh chấp phát sinh từ việc sử dụng sai mục đích đều do người mua tự chịu trách nhiệm.',
      'Trong trường hợp phát hiện người dùng sử dụng sản phẩm để thực hiện các hành vi vi phạm pháp luật, chúng tôi có quyền: khóa tài khoản vĩnh viễn, từ chối hoàn tiền, và phối hợp với cơ quan chức năng nếu được yêu cầu.',
      'Sản phẩm trên hệ thống được cung cấp "nguyên trạng" (as-is). Chúng tôi không đảm bảo sản phẩm sẽ hoạt động vĩnh viễn sau khi giao.',
      'Bằng việc thực hiện mua hàng, bạn xác nhận đã đọc, hiểu và đồng ý với toàn bộ điều khoản từ chối trách nhiệm nêu trên.',
      'Chúng tôi có quyền thay đổi, cập nhật chính sách mà không cần thông báo trước. Phiên bản hiện tại luôn có hiệu lực.',
    ],
  },
]

function ShoppingCartIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  )
}

export default function PolicyPage() {
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
          <h1 className="text-[24px] font-bold text-heading">Chính sách & Điều khoản</h1>
          <p className="text-[13px] text-muted mt-0.5">Cập nhật lần cuối: Tháng 5, 2026</p>
        </div>
      </div>

      {/* Intro */}
      <div className="card p-5 mb-6">
        <div className="flex items-start gap-3">
          <Shield size={22} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
          <div>
            <h2 className="text-[15px] font-semibold text-heading mb-1">Cam kết của HuynhQuyMedia</h2>
            <p className="text-[13px] text-body leading-relaxed">
              Chúng tôi cam kết cung cấp dịch vụ minh bạch, uy tín và bảo vệ quyền lợi tối đa cho người dùng.
              Vui lòng đọc kỹ các chính sách dưới đây trước khi sử dụng dịch vụ. Nếu có thắc mắc, hãy liên hệ
              Telegram <strong>@quydubai</strong> hoặc hotline <strong>0834724567</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {sections.map((section, idx) => (
          <div key={idx} className="card overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-elevated)' }}>
              <section.icon size={20} style={{ color: 'var(--accent)' }} />
              <h2 className="text-[15px] font-semibold text-heading">{section.title}</h2>
            </div>
            <div className="px-5 py-4 space-y-3">
              {section.content.map((text, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                    {i + 1}
                  </span>
                  <p className="text-[13px] text-body leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="card p-6 mt-8 text-center">
        <h3 className="text-[16px] font-semibold text-heading mb-2">Cần hỗ trợ thêm?</h3>
        <p className="text-[13px] text-body mb-4">Nếu bạn có câu hỏi về chính sách, đừng ngần ngại liên hệ với chúng tôi.</p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://t.me/quydubai"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary px-5 py-2.5 rounded-xl text-[13px] inline-flex items-center gap-2"
          >
            <Shield size={16} /> Liên hệ Telegram
          </a>
          <Link
            to="/faq"
            className="px-5 py-2.5 rounded-xl text-[13px] text-body hover:text-heading transition-colors inline-flex items-center gap-2"
            style={{ border: '1px solid var(--border-primary)' }}
          >
            Xem FAQ
          </Link>
        </div>
      </div>
    </div>
  )
}
