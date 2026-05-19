import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRoutes } from './routes/auth.js'
import { productRoutes } from './routes/products.js'
import { orderRoutes } from './routes/orders.js'
import { rechargeRoutes } from './routes/recharge.js'
import { adminRoutes } from './routes/admin.js'
import { userRoutes } from './routes/user.js'
import { blogRoutes } from './routes/blogs.js'
import { toolsRoutes } from './routes/tools.js'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.route('/api/auth', authRoutes)
app.route('/api/products', productRoutes)
app.route('/api/orders', orderRoutes)
app.route('/api/recharge', rechargeRoutes)
app.route('/api/admin', adminRoutes)
app.route('/api/user', userRoutes)
app.route('/api/blogs', blogRoutes)
app.route('/api/tools', toolsRoutes)

app.get('/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }))
app.notFound((c) => c.json({ error: 'Not found' }, 404))
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Lỗi server. Vui lòng thử lại.' }, 500)
})

export default app
