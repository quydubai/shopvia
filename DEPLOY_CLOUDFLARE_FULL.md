# Deploy toàn bộ lên Cloudflare Pages + D1

Hướng dẫn deploy cả frontend + backend lên Cloudflare (100% serverless, miễn phí).

---

## Bước 1: Cài đặt Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

---

## Bước 2: Tạo D1 Database

```bash
# Tạo database
wrangler d1 create shopvia-db
```

Wrangler sẽ trả về `database_id`. **Copy ID này**.

Mở file `wrangler.toml` và thay:
```toml
database_id = "YOUR_DATABASE_ID_HERE"
```
thành ID vừa copy.

---

## Bước 3: Khởi tạo Database Schema

```bash
# Tạo bảng
wrangler d1 execute shopvia-db --remote --file=schema.sql

# Thêm dữ liệu mẫu
wrangler d1 execute shopvia-db --remote --file=seed.sql
```

✅ Database đã sẵn sàng với:
- 2 users (admin/demo)
- 19 categories
- 6 products mẫu
- Settings

---

## Bước 4: Copy routes từ worker/ sang functions/

Do code đã có sẵn trong `worker/src/routes/`, copy sang `functions/api/routes/`:

```bash
# Tạo thư mục
mkdir -p functions/api/routes

# Copy tất cả routes
cp worker/src/routes/*.js functions/api/routes/
cp worker/src/middleware/auth.js functions/api/
cp worker/src/lib/password.js functions/api/lib/
```

---

## Bước 5: Sửa import paths trong functions/api/[[path]].js

Mở `functions/api/[[path]].js` và sửa:

```javascript
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
// ... các routes khác
```

---

## Bước 6: Cài dependencies

```bash
npm install hono jose bcryptjs
```

---

## Bước 7: Build Frontend

```bash
npm run build
```

---

## Bước 8: Deploy lên Cloudflare Pages

```bash
npx wrangler pages deploy dist --project-name=shopvia
```

Wrangler sẽ:
1. Upload frontend (dist/)
2. Deploy Pages Functions (functions/)
3. Bind D1 database
4. Trả về URL: `https://shopvia.pages.dev`

---

## Bước 9: Cấu hình Environment Variables (Production)

```bash
# Set JWT secret
wrangler pages secret put JWT_SECRET
# Nhập: your-super-secret-random-string
```

---

## Bước 10: Test

1. Mở `https://shopvia.pages.dev`
2. Đăng nhập:
   - Username: `admin`
   - Password: `admin123`

✅ Hoàn tất!

---

## Cấu trúc sau khi deploy

```
https://shopvia.pages.dev/          → Frontend (React)
https://shopvia.pages.dev/api/*     → Backend API (Hono + D1)
```

Tất cả chạy trên Cloudflare Edge, không cần server riêng!

---

## Dev Local với D1

```bash
# Terminal 1: Wrangler dev (backend + D1 local)
npx wrangler pages dev dist --d1=DB=shopvia-db

# Terminal 2: Vite dev (frontend)
npm run dev:client
```

---

## Chi phí

- **Cloudflare Pages**: Miễn phí (500 builds/tháng)
- **Cloudflare D1**: Miễn phí (5GB storage, 5M reads/day)
- **Cloudflare Functions**: Miễn phí (100k requests/day)

**Tổng: $0/tháng** cho traffic nhỏ-trung bình!

---

## Giới hạn D1 Free Tier

- 5GB storage
- 5 million reads/day
- 100k writes/day

Đủ cho hầu hết website nhỏ-trung.

---

## Troubleshooting

### Lỗi: "DB is not defined"

Kiểm tra `wrangler.toml` có đúng `database_id` chưa.

### Lỗi: "Module not found"

Chạy `npm install` trong thư mục gốc.

### Database trống sau deploy

Chạy lại:
```bash
wrangler d1 execute shopvia-db --remote --file=seed.sql
```

---

## Update Code

Sau khi sửa code:

```bash
# Build lại
npm run build

# Deploy lại
npx wrangler pages deploy dist --project-name=shopvia
```

Cloudflare tự động deploy trong ~30 giây.
