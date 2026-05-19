# HuynhQuyMedia Clone99 Platform

Platform bán tài khoản digital (Clone Facebook, Gmail, Netflix, VPN, etc.)

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Express.js + SQLite (better-sqlite3)
- **Auth**: JWT + bcrypt

---

## Chạy Dev Local

```bash
# Cài dependencies
npm install

# Terminal 1: Backend (http://localhost:3001)
npm run dev:server

# Terminal 2: Frontend (http://localhost:5173)
npm run dev:client

# Hoặc chạy cả hai cùng lúc
npm run dev
```

### Tài khoản mặc định
- **Admin**: `admin` / `admin123`
- **User**: `demo` / `demo`

---

## Deploy Production

### Option 1: Cloudflare Pages + Railway (Khuyến nghị)

**Frontend → Cloudflare Pages** (miễn phí)
```bash
npm run build
npx wrangler pages deploy dist --project-name=clone99-platform
```

**Backend → Railway** (500h/tháng miễn phí)
1. Push code lên GitHub
2. Vào https://railway.app → New Project → Deploy from GitHub
3. Railway tự động detect và deploy
4. Copy URL backend (vd: `https://your-app.up.railway.app`)
5. Vào Cloudflare Pages → Settings → Environment variables
   - Add: `VITE_API_URL` = `https://your-app.up.railway.app/api`
6. Redeploy frontend

Chi tiết: Xem file `DEPLOY_SIMPLE.md`

### Option 2: Cloudflare Workers + D1 (Serverless)

Cần viết lại backend sang Hono framework. Xem file `DEPLOY.md` (đang phát triển).

---

## Cấu trúc Project

```
├── server/              # Express backend
│   ├── db.js           # SQLite database + schema
│   ├── index.js        # Server entry point
│   ├── middleware/     # Auth middleware
│   └── routes/         # API routes
├── src/                # React frontend
│   ├── components/     # UI components
│   ├── pages/          # Page components
│   ├── context/        # React context (Auth, Theme)
│   └── lib/            # API client
├── worker/             # Cloudflare Worker (WIP)
└── dist/               # Build output
```

---

## Features

### User
- ✅ Đăng ký / Đăng nhập
- ✅ Nạp tiền (Bank / Crypto)
- ✅ Mua sản phẩm
- ✅ Xem lịch sử đơn hàng
- ✅ Xem lịch sử giao dịch
- ✅ Đổi mật khẩu / Email
- ✅ Quên mật khẩu (Email reset)

### Admin
- ✅ Dashboard thống kê
- ✅ Quản lý users (cộng/trừ tiền, ban/unban)
- ✅ Quản lý categories
- ✅ Quản lý products (CRUD, stock management)
- ✅ Quản lý orders (refund)
- ✅ Duyệt yêu cầu nạp tiền
- ✅ Xem transactions & activity logs
- ✅ Quản lý blogs
- ✅ Cấu hình settings (bank info, SMTP, etc.)

### Tools
- ✅ Check Live Facebook (batch 50 accounts)

---

## Environment Variables

### Backend (Railway/Render)
```env
PORT=3001
JWT_SECRET=your-super-secret-key
ALLOWED_ORIGINS=http://localhost:5173,https://your-app.pages.dev
```

### Frontend (Cloudflare Pages)
```env
VITE_API_URL=https://your-backend.railway.app/api
```

---

## Database

SQLite với schema:
- `users` - Tài khoản người dùng
- `categories` - Danh mục sản phẩm
- `products` - Sản phẩm (data_content chứa accounts)
- `orders` - Đơn hàng
- `transactions` - Lịch sử giao dịch
- `recharge_requests` - Yêu cầu nạp tiền
- `activity_logs` - Nhật ký hoạt động
- `blogs` - Bài viết
- `password_resets` - Token reset password
- `settings` - Cấu hình hệ thống

---

## License

Private - All rights reserved
