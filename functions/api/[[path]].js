// Cloudflare Pages Functions - API Router
// Catch-all route cho /api/*

import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';

// Import routes
import { authRoutes } from './routes/auth.js';
import { productRoutes } from './routes/products.js';
import { orderRoutes } from './routes/orders.js';
import { rechargeRoutes } from './routes/recharge.js';
import { userRoutes } from './routes/user.js';
import { blogRoutes } from './routes/blogs.js';
import { toolsRoutes } from './routes/tools.js';
import { adminRoutes } from './routes/admin.js';

const app = new Hono();

// Mount routes
app.route('/auth', authRoutes);
app.route('/products', productRoutes);
app.route('/orders', orderRoutes);
app.route('/recharge', rechargeRoutes);
app.route('/user', userRoutes);
app.route('/blogs', blogRoutes);
app.route('/tools', toolsRoutes);
app.route('/admin', adminRoutes);

// Health check
app.get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }));

// 404
app.notFound((c) => c.json({ error: 'Not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Lỗi server. Vui lòng thử lại.' }, 500);
});

export const onRequest = handle(app);
