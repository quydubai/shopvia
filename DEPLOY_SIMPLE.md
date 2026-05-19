# Hướng dẫn Deploy đơn giản

## Kiến trúc
- **Frontend**: Cloudflare Pages (React/Vite)
- **Backend**: Railway / Render (Express + SQLite)

---

## Bước 1: Deploy Backend lên Railway

### 1.1. Tạo tài khoản Railway
- Truy cập https://railway.app
- Đăng nhập bằng GitHub

### 1.2. Deploy từ GitHub
1. Push code lên GitHub repository
2. Vào Railway Dashboard → **New Project** → **Deploy from GitHub repo**
3. Chọn repository `2048`
4. Railway tự động detect và deploy

### 1.3. Cấu hình Environment Variables (nếu cần)
- `PORT`: Railway tự động set
- `JWT_SECRET`: Thêm secret mạnh hơn (Settings → Variables)

### 1.4. Lấy URL backend
- Sau khi deploy xong, Railway sẽ cho URL dạng: `https://your-app.up.railway.app`
- Copy URL này để dùng cho frontend

---

## Bước 2: Deploy Frontend lên Cloudflare Pages

### 2.1. Build frontend
```bash
npm run build
```

### 2.2. Deploy lên Cloudflare Pages

**Cách 1: Qua Dashboard (đơn giản nhất)**
1. Vào https://dash.cloudflare.com → Pages
2. **Create a project** → **Upload assets**
3. Upload thư mục `dist/`
4. Đặt tên project: `clone99-platform`

**Cách 2: Qua Wrangler CLI**
```bash
npx wrangler pages deploy dist --project-name=clone99-platform
```

### 2.3. Cấu hình Environment Variable
1. Vào Cloudflare Pages → Settings → Environment variables
2. Thêm biến:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-app.up.railway.app/api` (URL Railway từ bước 1.4)
3. **Redeploy** để áp dụng

---

## Bước 3: Chạy Dev Local

```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001

---

## Tài khoản mặc định

| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | admin |
| demo     | demo      | user  |

---

## Lưu ý

### Railway Free Tier
- 500 giờ/tháng miễn phí
- Database SQLite lưu trong container (mất data khi redeploy)
- **Khuyến nghị**: Dùng Railway PostgreSQL hoặc Turso (SQLite cloud) cho production

### Cloudflare Pages
- Miễn phí unlimited requests
- Build time: 20 phút/build
- 500 builds/tháng

### Nâng cấp Database (Production)
Nếu muốn database persistent, thay SQLite bằng:
1. **Railway PostgreSQL** (built-in)
2. **Turso** (SQLite edge, miễn phí 9GB)
3. **PlanetScale** (MySQL serverless)

---

## Alternative: Deploy Backend lên Render

### Render.com (miễn phí)
1. Vào https://render.com → New → Web Service
2. Connect GitHub repo
3. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
4. Deploy → Copy URL
5. Dùng URL này cho `VITE_API_URL` trong Cloudflare Pages

**Lưu ý Render Free Tier**: Service sleep sau 15 phút không dùng, request đầu tiên sẽ chậm ~30s.

---

## Troubleshooting

### CORS Error
Nếu frontend gọi API bị CORS, kiểm tra `server/index.js`:
```js
app.use(cors({
  origin: ['https://your-pages.pages.dev', 'http://localhost:5173'],
  credentials: true
}))
```

### Database bị reset
Railway/Render free tier không persistent. Dùng:
- Railway PostgreSQL (add từ dashboard)
- Hoặc mount volume (Render paid plan)
