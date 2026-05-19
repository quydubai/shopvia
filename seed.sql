-- Seed data cho D1
-- Chạy: wrangler d1 execute shopvia-db --remote --file=seed.sql

-- Users (password: admin123 và demo)
INSERT OR IGNORE INTO users (username, email, password, balance, role) VALUES
  ('admin','admin@shopvia.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',10000000,'admin'),
  ('demo','demo@shopvia.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',500000,'user');

-- Categories
INSERT OR IGNORE INTO categories (name, slug, parent_group, sort_order) VALUES
  ('CLONE NGOAI','clone-ngoai','CLONE',0),
  ('CLONE VIET','clone-viet','CLONE',1),
  ('INSTAGRAM NEW CO','instagram-new-co','MANG XA HOI',2),
  ('CLONE TIKTOK VIET','clone-tiktok-viet','MANG XA HOI',3),
  ('CLONE TIKTOK NGOAI','clone-tiktok-ngoai','MANG XA HOI',4),
  ('VIA NGOAI','via-ngoai','TAI KHOAN',5),
  ('VIA VIET','via-viet','TAI KHOAN',6),
  ('VIA BRAZIL','via-brazil','TAI KHOAN',7),
  ('VIA UNITED STATES','via-us','TAI KHOAN',8),
  ('BM50','bm50','BM',9),
  ('BM3 NGAM','bm3-ngam','BM',10),
  ('CHAT GPT','chat-gpt','TK DIGITAL',11),
  ('CLAUDE','claude','TK DIGITAL',12),
  ('CANVA','canva','TK DIGITAL',13),
  ('NETFLIX','netflix','TK DIGITAL',14),
  ('NORD VPN','nord-vpn','FAKE IP',15),
  ('EXPRESS VPN','express-vpn','FAKE IP',16),
  ('GMAIL','gmail','MAIL',17),
  ('HOTMAIL - OUTLOOK','hotmail-outlook','MAIL',18);

-- Products
INSERT OR IGNORE INTO products (category_id,name,slug,description,price,stock,data_content,min_buy,max_buy) VALUES
  (1,'Clone Ngoai XMDT 2024','clone-ngoai-xmdt-2024','Clone ngoai da xac minh danh tinh',25000,3,'acc1@email.com|pass123
acc2@email.com|pass456
acc3@email.com|pass789',1,100),
  (2,'Clone Viet XMDT New','clone-viet-xmdt-new','Clone Viet xac minh danh tinh',15000,3,'acc1@email.com|pass123
acc2@email.com|pass456
acc3@email.com|pass789',1,100),
  (6,'Via Ngoai Limit 250','via-ngoai-250','Via ngoai limit 250 san TKQC',55000,3,'acc1@email.com|pass123
acc2@email.com|pass456
acc3@email.com|pass789',1,100),
  (12,'ChatGPT Plus 1 Thang','chatgpt-plus-1m','Tai khoan ChatGPT Plus con 30 ngay',95000,3,'acc1@email.com|pass123
acc2@email.com|pass456
acc3@email.com|pass789',1,100),
  (14,'Canva Pro Vinh Vien','canva-pro-vinh-vien','Canva Pro lifetime',35000,3,'acc1@email.com|pass123
acc2@email.com|pass456
acc3@email.com|pass789',1,100),
  (18,'Gmail Aged 2020','gmail-aged-2020','Gmail tao tu 2020',5000,3,'acc1@email.com|pass123
acc2@email.com|pass456
acc3@email.com|pass789',1,100);

-- Settings
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('site_name','ShopVia.COM'),
  ('bank_info','{"bank_name":"MB Bank","account_number":"0834724567","account_holder":"SHOPVIA","note_format":"NAP [username]"}'),
  ('crypto_address','{"network":"TRC20 (USDT)","address":"TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","rate":"1 USDT = 25,000 VND"}'),
  ('min_recharge','10000'),
  ('telegram','@quydubai'),
  ('phone','0834724567'),
  ('smtp','{"host":"smtp.gmail.com","port":587,"user":"","pass":"","from_name":"ShopVia"}');

-- Blogs
INSERT OR IGNORE INTO blogs (title,slug,summary,content,author_id) VALUES
  ('Huong dan mua hang','huong-dan-mua-hang','Huong dan chi tiet cach mua san pham.','## Buoc 1: Dang ky
Truy cap trang dang ky.

## Buoc 2: Nap tien
Vao muc Nap tien.

## Buoc 3: Mua hang
Chon san pham va xac nhan.',1);
