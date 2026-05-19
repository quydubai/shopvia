import { SignJWT, jwtVerify } from 'jose'

function getSecret(env) {
  const secret = env.JWT_SECRET || 'huynhquymedia_secret_key_change_in_production'
  return new TextEncoder().encode(secret)
}

export async function generateToken(user, env) {
  return new SignJWT({ id: user.id, username: user.username, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret(env))
}

export async function verifyToken(token, env) {
  const { payload } = await jwtVerify(token, getSecret(env))
  return payload
}

export function authMiddleware() {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) return c.json({ error: 'Chưa đăng nhập' }, 401)

    const token = authHeader.replace('Bearer ', '')
    try {
      const payload = await verifyToken(token, c.env)
      const user = await c.env.DB.prepare(
        'SELECT id, username, email, balance, role, status FROM users WHERE id = ?'
      ).bind(payload.id).first()

      if (!user) return c.json({ error: 'Tài khoản không tồn tại' }, 401)
      if (user.status === 'banned') return c.json({ error: 'Tài khoản đã bị khóa' }, 403)

      c.set('user', user)
      await next()
    } catch {
      return c.json({ error: 'Token không hợp lệ' }, 401)
    }
  }
}

export function adminMiddleware() {
  return async (c, next) => {
    const user = c.get('user')
    if (!user || user.role !== 'admin') {
      return c.json({ error: 'Không có quyền truy cập' }, 403)
    }
    await next()
  }
}
