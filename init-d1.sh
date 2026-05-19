#!/bin/bash
# Script init D1 database với data từ SQLite hiện tại

set -e

echo "🗄️  Khởi tạo D1 Database với data thực..."
echo ""

# Kiểm tra database_id trong wrangler.toml
DB_ID=$(grep "database_id" wrangler.toml | cut -d'"' -f2)

if [ "$DB_ID" = "YOUR_DATABASE_ID_HERE" ]; then
    echo "❌ Lỗi: Chưa cập nhật database_id trong wrangler.toml"
    echo ""
    echo "Hướng dẫn:"
    echo "1. Vào https://dash.cloudflare.com"
    echo "2. Workers & Pages → D1 → shopvia-db"
    echo "3. Copy Database ID"
    echo "4. Mở wrangler.toml và thay YOUR_DATABASE_ID_HERE bằng ID đó"
    echo ""
    exit 1
fi

echo "✅ Database ID: $DB_ID"
echo ""

# Bước 1: Tạo schema
echo "📝 Bước 1: Tạo tables..."
npx wrangler d1 execute shopvia-db --remote --file=schema.sql
echo "✅ Tables đã được tạo"
echo ""

# Bước 2: Import data thực từ SQLite
echo "📝 Bước 2: Import data từ database hiện tại..."
npx wrangler d1 execute shopvia-db --remote --file=d1_backup.sql
echo "✅ Data đã được import"
echo ""

echo "🎉 Hoàn tất!"
echo ""
echo "📊 Database đã có:"
echo "   - $(grep -c "INSERT INTO users" d1_backup.sql) users"
echo "   - $(grep -c "INSERT INTO categories" d1_backup.sql) categories"
echo "   - $(grep -c "INSERT INTO products" d1_backup.sql) products"
echo "   - $(grep -c "INSERT INTO orders" d1_backup.sql) orders"
echo ""
echo "🌐 Bây giờ có thể deploy: npx wrangler pages deploy dist --project-name=shopvia"
