// Cloudflare Worker - API Handler
import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Import routes
import { authRoutes } from './api/routes/auth.js';
import { productRoutes } from './api/routes/products.js';
import { orderRoutes } from './api/routes/orders.js';
import { rechargeRoutes } from './api/routes/recharge.js';
import { userRoutes } from './api/routes/user.js';
import { blogRoutes } from './api/routes/blogs.js';
import { toolsRoutes } from './api/routes/tools.js';
import { adminRoutes } from './api/routes/admin.js';

const app = new Hono();

// CORS
app.use('/*', cors());

// Mount API routes
app.route('/api/auth', authRoutes);
app.route('/api/products', productRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/recharge', rechargeRoutes);
app.route('/api/user', userRoutes);
app.route('/api/blogs', blogRoutes);
app.route('/api/tools', toolsRoutes);
app.route('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// 404
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Lỗi server. Vui lòng thử lại.' }, 500);
});

export default app;
