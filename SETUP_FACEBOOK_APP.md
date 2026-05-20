# Hướng dẫn tạo Facebook App để Check Live hoạt động

## Bước 1: Tạo Facebook App

1. Truy cập: https://developers.facebook.com/apps
2. Click **"Create App"** (Tạo ứng dụng)
3. Chọn use case: **"Other"** → Click **Next**
4. Chọn app type: **"Business"** → Click **Next**
5. Điền thông tin:
   - **App name**: `ShopVia Check Live` (hoặc tên bất kỳ)
   - **App contact email**: Email của bạn
   - Click **Create app**

## Bước 2: Lấy App ID và App Secret

1. Sau khi tạo xong, bạn sẽ thấy **Dashboard**
2. Ở sidebar bên trái, click **Settings** → **Basic**
3. Bạn sẽ thấy:
   - **App ID**: Copy số này (ví dụ: `1234567890123456`)
   - **App Secret**: Click **Show** → Copy chuỗi này (ví dụ: `abc123def456...`)

## Bước 3: Thêm vào Cloudflare Pages

### Cách 1: Qua Dashboard (Khuyến nghị)

1. Vào: https://dash.cloudflare.com
2. **Pages** → **shopvia**
3. **Settings** → **Environment variables**
4. Click **Add variable** (2 lần):
   
   **Variable 1:**
   - Variable name: `FB_APP_ID`
   - Value: `1234567890123456` (App ID của bạn)
   - Environment: **Production** và **Preview**
   
   **Variable 2:**
   - Variable name: `FB_APP_SECRET`
   - Value: `abc123def456...` (App Secret của bạn)
   - Environment: **Production** và **Preview**

5. Click **Save**

### Cách 2: Qua wrangler.toml (Local dev)

Mở file `wrangler.toml` và uncomment + điền:

```toml
[vars]
JWT_SECRET = "huynhquymedia_secret_key_change_in_production"
FB_APP_ID = "1234567890123456"
FB_APP_SECRET = "abc123def456..."
```

**⚠️ LƯU Ý**: Không commit file này lên GitHub nếu có App Secret!

## Bước 4: Redeploy website

Sau khi thêm environment variables:

1. Vào **Cloudflare Pages** → **shopvia**
2. **Deployments** → Click vào deployment mới nhất
3. Click **Retry deployment** hoặc **Redeploy**

Hoặc deploy từ local:

```bash
npm run build
cp functions/_worker.js dist/_worker.js
cp -r functions/api dist/_api
sed -i '' 's|from '\''./api/|from '\''./_api/|g' dist/_worker.js
npx wrangler pages deploy dist --project-name=shopvia
```

## Bước 5: Test Check Live

1. Vào: https://shopvia.pages.dev
2. Login với: **quydubai** / **123456**
3. Vào menu **Check Live**
4. Nhập UID hoặc link Facebook để test:
   ```
   100000000000000
   https://facebook.com/zuck
   4
   ```

## Xong! 🎉

Check Live giờ sẽ hoạt động chính xác với Facebook Graph API.

---

## Troubleshooting

### Vẫn báo error?

1. Kiểm tra App ID và Secret đã đúng chưa
2. Kiểm tra đã redeploy chưa
3. Xem logs: `npx wrangler pages deployment tail --project-name=shopvia`

### Rate limit?

Facebook có giới hạn số requests/giờ. Nếu check quá nhiều:
- Đợi 1 giờ
- Hoặc nâng cấp Facebook App lên Business Verified

### App bị reject?

Không sao, App vẫn dùng được cho mục đích này. Facebook chỉ yêu cầu review nếu bạn muốn public app.
