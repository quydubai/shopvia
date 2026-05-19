const API_BASE = 'http://localhost:3001/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('hqm_token')
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra')
  return data
}

export const api = {
  // Auth
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

  // Products
  getProducts: (params = '') => request(`/products?${params}`),
  getProduct: (slug) => request(`/products/${slug}`),
  getCategories: () => request('/products/categories/all'),
  getProductsByCategory: (slug) => request(`/products/by-category/${slug}`),

  // Orders
  buyProduct: (body) => request('/orders/buy', { method: 'POST', body: JSON.stringify(body) }),
  getOrders: (params = '') => request(`/orders?${params}`),
  getOrder: (id) => request(`/orders/${id}`),

  // Recharge
  getRechargeInfo: () => request('/recharge/info'),
  requestRecharge: (body) => request('/recharge/request', { method: 'POST', body: JSON.stringify(body) }),
  getRechargeHistory: () => request('/recharge/history'),

  // Blogs
  getBlogs: (params = '') => request(`/blogs?${params}`),
  getBlog: (slug) => request(`/blogs/${slug}`),

  // User
  getTransactions: (params = '') => request(`/user/transactions?${params}`),
  getLogs: () => request('/user/logs'),

  // Admin
  admin: {
    getStats: () => request('/admin/stats'),
    getUsers: (params = '') => request(`/admin/users?${params}`),
    updateBalance: (id, body) => request(`/admin/users/${id}/balance`, { method: 'PUT', body: JSON.stringify(body) }),
    updateUserStatus: (id, body) => request(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
    updateUserRole: (id, body) => request(`/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify(body) }),
    getCategories: () => request('/admin/categories'),
    createCategory: (body) => request('/admin/categories', { method: 'POST', body: JSON.stringify(body) }),
    updateCategory: (id, body) => request(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),
    getProducts: (params = '') => request(`/admin/products?${params}`),
    createProduct: (body) => request('/admin/products', { method: 'POST', body: JSON.stringify(body) }),
    updateProduct: (id, body) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
    getOrders: (params = '') => request(`/admin/orders?${params}`),
    refundOrder: (id) => request(`/admin/orders/${id}/refund`, { method: 'PUT' }),
    getRecharges: (params = '') => request(`/admin/recharges?${params}`),
    approveRecharge: (id) => request(`/admin/recharges/${id}/approve`, { method: 'PUT' }),
    rejectRecharge: (id, body) => request(`/admin/recharges/${id}/reject`, { method: 'PUT', body: JSON.stringify(body) }),
    getTransactions: (params = '') => request(`/admin/transactions?${params}`),
    getSettings: () => request('/admin/settings'),
    updateSettings: (body) => request('/admin/settings', { method: 'PUT', body: JSON.stringify(body) }),
    getLogs: (params = '') => request(`/admin/logs?${params}`),
    getBlogs: () => request('/blogs/admin/all'),
    createBlog: (body) => request('/blogs/admin', { method: 'POST', body: JSON.stringify(body) }),
    updateBlog: (id, body) => request(`/blogs/admin/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteBlog: (id) => request(`/blogs/admin/${id}`, { method: 'DELETE' }),
  },
}

export const formatVND = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ'
