# Check Live Facebook - Giới hạn kỹ thuật

## Vấn đề hiện tại

Tính năng Check Live Facebook đang gặp hạn chế do:

1. **Facebook Graph API yêu cầu Access Token**
   - Graph API không còn cho phép query public data mà không có token
   - Error: "An access token is required to request this resource"

2. **HTML Scraping bị block**
   - Facebook phát hiện và block requests từ Cloudflare Workers
   - Cần User-Agent và cookies hợp lệ

## Giải pháp khả thi

### Option 1: Sử dụng Facebook App Access Token
```javascript
// Cần tạo Facebook App và lấy App ID + App Secret
const accessToken = `${APP_ID}|${APP_SECRET}`
const url = `https://graph.facebook.com/${uid}?access_token=${accessToken}`
```

**Ưu điểm**: Chính thống, ổn định
**Nhược điểm**: Cần đăng ký Facebook App, có rate limit

### Option 2: Proxy qua server khác
- Deploy một proxy server riêng (không phải Cloudflare)
- Server này sẽ scrape Facebook và trả kết quả về

**Ưu điểm**: Linh hoạt
**Nhược điểm**: Cần maintain thêm server, có thể bị Facebook block IP

### Option 3: Sử dụng dịch vụ bên thứ 3
- Dùng API của các service check live có sẵn
- Ví dụ: checkuid.com, getuid.info, etc.

**Ưu điểm**: Đơn giản, không cần maintain
**Nhược điểm**: Phụ thuộc bên thứ 3, có thể mất phí

## Khuyến nghị

**Nên dùng Option 1** - Facebook App Access Token:

1. Tạo Facebook App tại https://developers.facebook.com
2. Lấy App ID và App Secret
3. Thêm vào Cloudflare Pages environment variables:
   ```
   FB_APP_ID=your_app_id
   FB_APP_SECRET=your_app_secret
   ```
4. Update code trong `functions/api/routes/tools.js`

## Code mẫu với Access Token

```javascript
async function checkAccount(raw) {
  const uid = extractUID(raw)
  const accessToken = `${c.env.FB_APP_ID}|${c.env.FB_APP_SECRET}`
  
  try {
    const res = await fetch(
      `https://graph.facebook.com/${uid}?fields=id,name&access_token=${accessToken}`
    )
    const data = await res.json()
    
    if (data.error) {
      return { input: raw, uid, status: 'die', avatar: null }
    }
    
    if (data.id) {
      // Get avatar
      const avatarRes = await fetch(
        `https://graph.facebook.com/${uid}/picture?type=large&redirect=false&access_token=${accessToken}`
      )
      const avatarData = await avatarRes.json()
      const avatar = avatarData.data?.url && !avatarData.data.is_silhouette 
        ? avatarData.data.url 
        : null
      
      return { input: raw, uid, status: 'live', avatar }
    }
    
    return { input: raw, uid, status: 'die', avatar: null }
  } catch {
    return { input: raw, uid, status: 'error', avatar: null }
  }
}
```

## Tạm thời

Hiện tại tính năng Check Live sẽ trả về "error" cho hầu hết các trường hợp do Facebook block requests từ Cloudflare Workers.

Để sử dụng được tính năng này, cần implement một trong các giải pháp trên.
