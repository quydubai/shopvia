// Cloudflare Worker - API Handler
import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Import routes
import { authRoutes } from './_api/routes/auth.js';
import { productRoutes } from './_api/routes/products.js';
import { orderRoutes } from './_api/routes/orders.js';
import { rechargeRoutes } from './_api/routes/recharge.js';
import { userRoutes } from './_api/routes/user.js';
import { blogRoutes } from './_api/routes/blogs.js';
import { toolsRoutes } from './_api/routes/tools.js';
import { adminRoutes } from './_api/routes/admin.js';

const app = new Hono();

// CORS - allow all origins and methods
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

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

export default {
  async fetch(request, env, ctx) {
    // Only handle /api/* routes
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return app.fetch(request, env, ctx);
    }
    // Pass through to static assets
    return env.ASSETS.fetch(request);
  }
};
