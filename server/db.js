import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const db = new Database(path.join(__dirname, 'clone99.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ── Schema ──
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    balance REAL DEFAULT 0,
    role TEXT DEFAULT 'user' CHECK(role IN ('user','admin')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active','banned')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    parent_group TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    price REAL NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    data_content TEXT DEFAULT '',
    status TEXT DEFAULT 'active' CHECK(status IN ('active','hidden')),
    min_buy INTEGER DEFAULT 1,
    max_buy INTEGER DEFAULT 100,
    sold INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price REAL NOT NULL,
    data_received TEXT DEFAULT '',
    status TEXT DEFAULT 'completed' CHECK(status IN ('pending','completed','cancelled','refunded')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('recharge','purchase','refund','admin_add','admin_sub')),
    amount REAL NOT NULL,
    balance_after REAL NOT NULL,
    note TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS recharge_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    method TEXT NOT NULL CHECK(method IN ('bank','crypto')),
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
    proof TEXT DEFAULT '',
    note TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    detail TEXT DEFAULT '',
    ip TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    thumbnail TEXT DEFAULT '',
    summary TEXT DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    author_id INTEGER NOT NULL,
    status TEXT DEFAULT 'published' CHECK(status IN ('published','draft')),
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`)

// ── Seed admin + demo data ──
const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin')
if (!adminExists) {
  const adminPw = bcrypt.hashSync('admin123', 10)
  const demoPw = bcrypt.hashSync('demo', 10)

  db.prepare('INSERT INTO users (username, email, password, balance, role) VALUES (?,?,?,?,?)').run('admin', 'admin@clone99.com', adminPw, 10000000, 'admin')
  db.prepare('INSERT INTO users (username, email, password, balance, role) VALUES (?,?,?,?,?)').run('demo', 'demo@clone99.com', demoPw, 500000, 'user')

  // Seed categories
  const cats = [
    ['CLONE NGOẠI', 'clone-ngoai', 'CLONE'],
    ['CLONE VIỆT', 'clone-viet', 'CLONE'],
    ['INSTAGRAM NEW CỔ', 'instagram-new-co', 'MẠNG XÃ HỘI'],
    ['CLONE TIKTOK VIỆT', 'clone-tiktok-viet', 'MẠNG XÃ HỘI'],
    ['CLONE TIKTOK NGOẠI', 'clone-tiktok-ngoai', 'MẠNG XÃ HỘI'],
    ['VIA NGOẠI', 'via-ngoai', 'TÀI KHOẢN'],
    ['VIA VIỆT', 'via-viet', 'TÀI KHOẢN'],
    ['VIA BRAZIL', 'via-brazil', 'TÀI KHOẢN'],
    ['VIA UNITED STATES', 'via-us', 'TÀI KHOẢN'],
    ['BM50$', 'bm50', 'BM'],
    ['BM3 NGÂM', 'bm3-ngam', 'BM'],
    ['CHAT GPT', 'chat-gpt', 'TK DIGITAL'],
    ['CLAUDE', 'claude', 'TK DIGITAL'],
    ['CANVA', 'canva', 'TK DIGITAL'],
    ['NETFLIX', 'netflix', 'TK DIGITAL'],
    ['NORD VPN', 'nord-vpn', 'FAKE IP'],
    ['EXPRESS VPN', 'express-vpn', 'FAKE IP'],
    ['GMAIL', 'gmail', 'MAIL'],
    ['HOTMAIL - OUTLOOK', 'hotmail-outlook', 'MAIL'],
  ]

  const insertCat = db.prepare('INSERT INTO categories (name, slug, parent_group, sort_order) VALUES (?,?,?,?)')
  cats.forEach(([name, slug, group], i) => insertCat.run(name, slug, group, i))

  // Seed products
  const insertProd = db.prepare('INSERT INTO products (category_id, name, slug, description, price, stock, data_content) VALUES (?,?,?,?,?,?,?)')

  const sampleData = 'account1@email.com|pass123\naccount2@email.com|pass456\naccount3@email.com|pass789'
  const products = [
    [1, 'Clone Ngoại XMDT 2024', 'clone-ngoai-xmdt-2024', 'Clone ngoại đã xác minh danh tính, checkpoint sạch', 25000, 150, sampleData],
    [1, 'Clone Ngoại Cổ 2015-2020', 'clone-ngoai-co-2015', 'Clone ngoại tạo từ 2015-2020, bạn bè 1000+', 45000, 80, sampleData],
    [2, 'Clone Việt XMDT New', 'clone-viet-xmdt-new', 'Clone Việt xác minh danh tính, mới tạo', 15000, 200, sampleData],
    [2, 'Clone Việt Cổ 2018', 'clone-viet-co-2018', 'Clone Việt cổ, hoạt động từ 2018', 35000, 50, sampleData],
    [3, 'Instagram New 2024', 'ig-new-2024', 'Tài khoản Instagram mới tạo 2024', 8000, 300, sampleData],
    [4, 'TikTok Việt Follow 1K+', 'tiktok-viet-1k', 'TikTok Việt có 1000+ followers', 20000, 100, sampleData],
    [6, 'Via Ngoại Limit 250$', 'via-ngoai-250', 'Via ngoại limit 250$ sẵn TKQC', 55000, 60, sampleData],
    [7, 'Via Việt New', 'via-viet-new', 'Via Việt mới tạo, sạch', 12000, 180, sampleData],
    [10, 'BM50$ Đã Verify', 'bm50-verify', 'Business Manager 50$ đã verify', 120000, 30, sampleData],
    [12, 'ChatGPT Plus 1 Tháng', 'chatgpt-plus-1m', 'Tài khoản ChatGPT Plus còn 30 ngày', 95000, 45, sampleData],
    [13, 'Claude Pro 1 Tháng', 'claude-pro-1m', 'Tài khoản Claude Pro subscription', 110000, 25, sampleData],
    [14, 'Canva Pro Vĩnh Viễn', 'canva-pro-vinh-vien', 'Canva Pro lifetime, team invite', 35000, 200, sampleData],
    [15, 'Netflix Premium 1 Tháng', 'netflix-1m', 'Netflix Premium 4K, 1 tháng', 29000, 100, sampleData],
    [16, 'NordVPN 1 Năm', 'nordvpn-1y', 'NordVPN premium 1 năm', 45000, 80, sampleData],
    [18, 'Gmail Aged 2020', 'gmail-aged-2020', 'Gmail tạo từ 2020, POP/IMAP bật', 5000, 500, sampleData],
  ]

  products.forEach((p) => insertProd.run(...p))

  // Seed settings
  const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?,?)')
  insertSetting.run('site_name', 'HuynhQuyMedia.COM')
  insertSetting.run('bank_info', JSON.stringify({
    bank_name: 'MB Bank',
    account_number: '0834724567',
    account_holder: 'HUYNHQUYMEDIA',
    note_format: 'NAP [username]'
  }))
  insertSetting.run('crypto_address', JSON.stringify({
    network: 'TRC20 (USDT)',
    address: 'TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    rate: '1 USDT = 25,000 VND'
  }))
  insertSetting.run('min_recharge', '10000')
  insertSetting.run('telegram', '@quydubai')
  insertSetting.run('phone', '0834724567')
  insertSetting.run('smtp', JSON.stringify({
    host: 'smtp.gmail.com',
    port: 587,
    user: '',
    pass: '',
    from_name: 'HuynhQuyMedia'
  }))

  // Seed blogs
  const insertBlog = db.prepare('INSERT INTO blogs (title, slug, summary, content, author_id) VALUES (?,?,?,?,?)')
  insertBlog.run(
    'Hướng dẫn mua hàng trên HuynhQuyMedia',
    'huong-dan-mua-hang',
    'Bài viết hướng dẫn chi tiết cách đăng ký, nạp tiền và mua sản phẩm trên hệ thống.',
    '## Bước 1: Đăng ký tài khoản\nTruy cập trang đăng ký và điền đầy đủ thông tin.\n\n## Bước 2: Nạp tiền\nVào mục **Nạp tiền**, chọn phương thức thanh toán và chuyển khoản theo hướng dẫn.\n\n## Bước 3: Mua hàng\nChọn sản phẩm cần mua, nhập số lượng và xác nhận đơn hàng.\n\n## Bước 4: Nhận sản phẩm\nSau khi thanh toán thành công, sản phẩm sẽ hiển thị trong mục **Đơn hàng**.',
    1
  )
  insertBlog.run(
    'Cách bảo mật tài khoản hiệu quả',
    'bao-mat-tai-khoan',
    'Những lưu ý quan trọng giúp bạn bảo vệ tài khoản an toàn trước các rủi ro.',
    '## Sử dụng mật khẩu mạnh\nMật khẩu nên có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.\n\n## Không chia sẻ thông tin đăng nhập\nTuyệt đối không cung cấp mật khẩu cho bất kỳ ai.\n\n## Đổi mật khẩu định kỳ\nNên thay đổi mật khẩu ít nhất 3 tháng một lần.\n\n## Kiểm tra lịch sử hoạt động\nThường xuyên kiểm tra nhật ký hoạt động để phát hiện truy cập bất thường.',
    1
  )
  insertBlog.run(
    'Chính sách hoàn tiền và hỗ trợ',
    'chinh-sach-hoan-tien',
    'Tìm hiểu về chính sách hoàn tiền, đổi trả và cách liên hệ hỗ trợ.',
    '## Chính sách hoàn tiền\nChúng tôi cam kết hoàn tiền 100% nếu sản phẩm không đúng mô tả hoặc không sử dụng được.\n\n## Thời gian xử lý\nYêu cầu hoàn tiền sẽ được xử lý trong vòng **24 giờ** kể từ khi tiếp nhận.\n\n## Liên hệ hỗ trợ\n- Telegram: @quydubai\n- Hotline: 0834724567\n\nĐội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn 24/7.',
    1
  )

  console.log('✅ Database seeded successfully')
}

export default db
