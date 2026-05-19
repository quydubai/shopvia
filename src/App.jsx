import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CategoryPage from './pages/CategoryPage'
import RechargePage from './pages/RechargePage'
import OrdersPage from './pages/OrdersPage'
import PlaceholderPage from './pages/PlaceholderPage'
import ApiDocsPage from './pages/ApiDocsPage'
import ActivityLogsPage from './pages/ActivityLogsPage'
import TransactionsPage from './pages/TransactionsPage'
import FavoritesPage from './pages/FavoritesPage'
import ProfilePage from './pages/ProfilePage'
import BlogsPage from './pages/BlogsPage'
import BlogDetailPage from './pages/BlogDetailPage'
import CheckLivePage from './pages/CheckLivePage'
import Get2FAPage from './pages/Get2FAPage'
import FAQPage from './pages/FAQPage'
import PolicyPage from './pages/PolicyPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AdminLayout from './pages/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminRechargesPage from './pages/admin/AdminRechargesPage'
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminBlogsPage from './pages/admin/AdminBlogsPage'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/recharge" element={<RechargePage />} />
          <Route path="/recharge/:method" element={<RechargePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/logs" element={<ActivityLogsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:slug" element={<BlogDetailPage />} />
          <Route path="/api-docs" element={<ApiDocsPage />} />
          <Route path="/checklive" element={<CheckLivePage />} />
          <Route path="/get2fa" element={<Get2FAPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/policy" element={<PolicyPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<PlaceholderPage title="Liên hệ" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="recharges" element={<AdminRechargesPage />} />
            <Route path="transactions" element={<AdminTransactionsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="blogs" element={<AdminBlogsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
