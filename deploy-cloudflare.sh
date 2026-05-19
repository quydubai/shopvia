#!/bin/bash
# Script tự động deploy lên Cloudflare Pages + D1

set -e  # Exit on error

echo "🚀 Bắt đầu deploy lên Cloudflare Pages..."
echo ""

# Bước 1: Login Cloudflare (nếu chưa)
echo "📝 Bước 1: Kiểm tra login Cloudflare..."
if ! npx wrangler whoami &>/dev/null; then
    echo "⚠️  Chưa login. Đang mở browser để login..."
    npx wrangler login
else
    echo "✅ Đã login Cloudflare"
fi
echo ""

# Bước 2: Tạo D1 database (nếu chưa có)
echo "📝 Bước 2: Tạo D1 database..."
DB_OUTPUT=$(npx wrangler d1 create shopvia-db 2>&1 || true)

if echo "$DB_OUTPUT" | grep -q "already exists"; then
    echo "✅ Database shopvia-db đã tồn tại"
    # Lấy database_id từ list
    DB_ID=$(npx wrangler d1 list | grep shopvia-db | awk '{print $2}')
else
    # Parse database_id từ output
    DB_ID=$(echo "$DB_OUTPUT" | grep "database_id" | cut -d'"' -f2)
    echo "✅ Đã tạo database: $DB_ID"
fi

# Cập nhật wrangler.toml với database_id
if [ ! -z "$DB_ID" ]; then
    echo "📝 Cập nhật wrangler.toml với database_id..."
    sed -i.bak "s/database_id = \".*\"/database_id = \"$DB_ID\"/" wrangler.toml
    rm wrangler.toml.bak
    echo "✅ Đã cập nhật wrangler.toml"
fi
echo ""

# Bước 3: Init database schema
echo "📝 Bước 3: Khởi tạo database schema..."
npx wrangler d1 execute shopvia-db --remote --file=schema.sql
echo "✅ Đã tạo tables"
echo ""

# Bước 4: Seed data
echo "📝 Bước 4: Thêm dữ liệu mẫu..."
npx wrangler d1 execute shopvia-db --remote --file=seed.sql
echo "✅ Đã thêm data mẫu (admin/demo users, categories, products)"
echo ""

# Bước 5: Build frontend
echo "📝 Bước 5: Build frontend..."
npm run build
echo "✅ Build thành công"
echo ""

# Bước 6: Deploy lên Cloudflare Pages
echo "📝 Bước 6: Deploy lên Cloudflare Pages..."
npx wrangler pages deploy dist --project-name=shopvia
echo ""

echo "🎉 Deploy thành công!"
echo ""
echo "📌 Tài khoản đăng nhập:"
echo "   - Admin: admin / admin123"
echo "   - Demo:  demo / demo"
echo ""
echo "🌐 Website sẽ có tại: https://shopvia.pages.dev"
echo "   (hoặc URL custom nếu bạn đã cấu hình)"
