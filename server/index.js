import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import rechargeRoutes from './routes/recharge.js'
import adminRoutes from './routes/admin.js'
import userRoutes from './routes/user.js'
import blogRoutes from './routes/blogs.js'
import toolsRoutes from './routes/tools.js'

// Init DB (runs migrations + seed)
import './db.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))

// ── API Routes ──
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/recharge', rechargeRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/user', userRoutes)
app.use('/api/blogs', blogRoutes)
app.use('/api/tools', toolsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Lỗi server. Vui lòng thử lại.' })
})

app.listen(PORT, () => {
  console.log(`🚀 HuynhQuyMedia API server running on http://localhost:${PORT}`)
})
