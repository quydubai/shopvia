# Khởi tạo D1 Database với Data Thực

## Bước 1: Lấy Database ID

1. Vào https://dash.cloudflare.com
2. **Workers & Pages** → **D1**
3. Click vào database **shopvia-db**
4. **Copy Database ID** (dạng: `abc123-xyz-...`)

## Bước 2: Cập nhật wrangler.toml

Mở file `wrangler.toml` và thay:

```toml
database_id = "YOUR_DATABASE_ID_HERE"
```

thành:

```toml
database_id = "abc123-xyz-..."  # ID vừa copy
```

## Bước 3: Chạy script init

```bash
./init-d1.sh
```

Script sẽ:
- ✅ Tạo tables (schema.sql)
- ✅ Import toàn bộ data từ SQLite hiện tại (d1_backup.sql)

**Data được import:**
- 4 users (admin, demo, quydubai, quydubai1)
- 20 categories
- Tất cả products
- Tất cả orders
- Tất cả transactions
- Settings, blogs, etc.

## Bước 4: Bind D1 vào Cloudflare Pages

1. Vào https://dash.cloudflare.com → **Pages** → **shopvia**
2. **Settings** → **Functions**
3. **D1 database bindings** → **Add binding**:
   - Variable name: `DB`
   - D1 database: `shopvia-db`
4. **Save**

## Bước 5: Redeploy

Vào **Deployments** → Click **Retry deployment**

---

## Xong! 🎉

Website sẽ chạy với data thực từ SQLite cũ.

Đăng nhập bằng tài khoản:
- **quydubai** / (mật khẩu của bạn)
- **admin** / admin123
- **demo** / demo
