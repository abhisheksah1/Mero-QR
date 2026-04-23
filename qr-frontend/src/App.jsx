import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// Layout
import Layout from './components/common/Layout'

// Auth pages
import Login from './pages/Login'
import Register from './pages/Register'
import { ForgotPassword, ResetPassword, ChangePassword } from './pages/AuthPages'

// Restaurant pages
import Dashboard from './pages/restaurant/Dashboard'
import MenuPage from './pages/restaurant/MenuPage'
import TablesPage from './pages/restaurant/TablesPage'
import OrdersPage from './pages/restaurant/OrdersPage'
import EmployeesPage from './pages/restaurant/EmployeesPage'
import KYCPage from './pages/restaurant/KYCPage'
import PackagePage from './pages/restaurant/PackagePage'
import CashierPage from './pages/restaurant/CashierPage'
import InventoryPage from './pages/restaurant/InventoryPage'

// Employee pages
import KitchenDashboard from './pages/employee/KitchenDashboard'

// Platform pages
import PlatformDashboard from './pages/platform/PlatformDashboard'
import PlatformRestaurants from './pages/platform/PlatformRestaurants'
import PlatformSubscriptions from './pages/platform/PlatformSubscriptions'
import { CMSPage, SubAdminPage, BulkMailPage } from './pages/platform/PlatformOthers'

// Customer page
import CustomerOrder from './pages/CustomerOrder'

// ── Route Guards
function RequireAuth({ children, roles }) {
  const { user, role, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(role)) return <Navigate to="/login" replace />
  return children
}

function RedirectIfLoggedIn({ children }) {
  const { user, role, loading } = useAuth()
  if (loading) return null
  if (user) {
    if (role === 'platform') return <Navigate to="/platform" replace />
    if (role === 'restaurant') return <Navigate to="/dashboard" replace />
    if (role === 'kitchen') return <Navigate to="/kitchen" replace />
    if (role === 'cashier') return <Navigate to="/cashier" replace />
  }
  return children
}

// Cashier reuses CashierPage
function CashierDashboard() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <CashierPage />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: '14px' },
            success: { iconTheme: { primary: 'var(--green)', secondary: '#fff' } },
            error:   { iconTheme: { primary: 'var(--red)', secondary: '#fff' } },
          }}
        />

        <Routes>
          {/* Public */}
          <Route path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />
          <Route path="/register" element={<RedirectIfLoggedIn><Register /></RedirectIfLoggedIn>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Customer QR Order page */}
          <Route path="/order" element={<CustomerOrder />} />

          {/* Restaurant Admin */}
          <Route path="/dashboard" element={<RequireAuth roles={['restaurant']}><Layout /></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="tables" element={<TablesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="kyc" element={<KYCPage />} />
            <Route path="package" element={<PackagePage />} />
            <Route path="cashier" element={<CashierPage />} />
            <Route path="inventory" element={<InventoryPage />} />
          </Route>

          {/* Platform Admin */}
          <Route path="/platform" element={<RequireAuth roles={['platform']}><Layout /></RequireAuth>}>
            <Route index element={<PlatformDashboard />} />
            <Route path="restaurants" element={<PlatformRestaurants />} />
            <Route path="subscriptions" element={<PlatformSubscriptions />} />
            <Route path="cms" element={<CMSPage />} />
            <Route path="admins" element={<SubAdminPage />} />
            <Route path="mail" element={<BulkMailPage />} />
          </Route>

          {/* Kitchen Employee */}
          <Route path="/kitchen" element={<RequireAuth roles={['kitchen']}><KitchenDashboard /></RequireAuth>} />

          {/* Cashier Employee */}
          <Route path="/cashier" element={<RequireAuth roles={['cashier']}><CashierDashboard /></RequireAuth>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
