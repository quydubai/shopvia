# Database Setup

## Khôi phục Database từ Backup

### Cách 1: Tự động (khi chạy server lần đầu)
Server sẽ tự động tạo database và seed data mẫu khi chạy lần đầu.

```bash
npm run dev:server
```

### Cách 2: Restore từ file SQL backup
Nếu muốn restore database từ backup:

```bash
# Xóa database cũ (nếu có)
rm server/clone99.db server/clone99.db-shm server/clone99.db-wal

# Restore từ backup
sqlite3 server/clone99.db < database_backup.sql
```

---

## Tài khoản mặc định

Sau khi restore database, bạn có thể đăng nhập bằng:

| Username | Password  | Role  | Balance      |
|----------|-----------|-------|--------------|
| admin    | admin123  | admin | 10,000,000đ  |
| demo     | demo      | user  | 500,000đ     |

---

## Schema Database

### Tables
- **users** - Tài khoản người dùng
- **categories** - Danh mục sản phẩm (19 categories)
- **products** - Sản phẩm (15 products mẫu)
- **orders** - Đơn hàng
- **transactions** - Lịch sử giao dịch
- **recharge_requests** - Yêu cầu nạp tiền
- **activity_logs** - Nhật ký hoạt động
- **blogs** - Bài viết (3 blogs mẫu)
- **password_resets** - Token reset password
- **settings** - Cấu hình hệ thống

### Sample Data
- 2 users (admin + demo)
- 19 categories (Clone, Via, BM, Digital accounts, VPN, Mail)
- 15 products với data mẫu
- 3 blog posts
- Settings (bank info, crypto, SMTP, etc.)

---

## Sửa đổi Database

### Thêm user mới
```sql
INSERT INTO users (username, email, password, balance, role) 
VALUES ('newuser', 'user@example.com', '$2a$10$...', 0, 'user');
```

### Thêm sản phẩm mới
```sql
INSERT INTO products (category_id, name, slug, description, price, stock, data_content) 
VALUES (1, 'Product Name', 'product-slug', 'Description', 10000, 10, 'acc1|pass1
acc2|pass2');
```

### Cập nhật settings
```sql
UPDATE settings SET value = '{"bank_name":"VCB","account_number":"123456"}' 
WHERE key = 'bank_info';
```

---

## Backup Database

Để tạo backup mới:

```bash
sqlite3 server/clone99.db .dump > database_backup_$(date +%Y%m%d).sql
```

---

## Production Database

Khi deploy lên Railway/Render, SQLite sẽ bị reset mỗi khi redeploy.

**Khuyến nghị cho Production:**
1. **Railway PostgreSQL** - Thêm PostgreSQL database từ Railway dashboard
2. **Turso** - SQLite edge database (miễn phí 9GB)
3. **PlanetScale** - MySQL serverless

Cần migrate schema từ SQLite sang PostgreSQL/MySQL nếu dùng các option trên.
