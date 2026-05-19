# Deploy Ngay Lập Tức

## Chỉ cần 1 lệnh:

```bash
./deploy-cloudflare.sh
```

Script sẽ tự động:
1. ✅ Login Cloudflare (mở browser)
2. ✅ Tạo D1 database
3. ✅ Tạo tables và thêm data mẫu
4. ✅ Build frontend
5. ✅ Deploy lên Cloudflare Pages

**Thời gian**: ~2-3 phút

---

## Sau khi deploy xong

Website sẽ có tại: **https://shopvia.pages.dev**

### Đăng nhập:
- **Admin**: `admin` / `admin123`
- **Demo**: `demo` / `demo`

---

## Nếu gặp lỗi

### Lỗi: "permission denied"
```bash
chmod +x deploy-cloudflare.sh
./deploy-cloudflare.sh
```

### Lỗi: "wrangler not found"
```bash
npm install
./deploy-cloudflare.sh
```

### Lỗi: "database already exists"
Không sao, script sẽ tự động dùng database cũ.

---

## Update code sau này

```bash
# Sửa code → Build → Deploy
npm run build
npx wrangler pages deploy dist --project-name=shopvia
```

Hoặc chạy lại script:
```bash
./deploy-cloudflare.sh
```
