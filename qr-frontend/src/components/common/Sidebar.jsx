import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, Package, FileText, Menu, QrCode,
  ShoppingBag, Wallet, BarChart2, Settings, LogOut, ChevronRight,
  Building2, CreditCard, Megaphone, Globe, UserCog, Utensils,
  ChefHat, Receipt, Box
} from 'lucide-react'

const platformNav = [
  { label: 'Dashboard',     path: '/platform',                icon: <LayoutDashboard size={18} /> },
  { label: 'Restaurants',   path: '/platform/restaurants',    icon: <Building2 size={18} /> },
  { label: 'Subscriptions', path: '/platform/subscriptions',  icon: <CreditCard size={18} /> },
  { label: 'CMS',           path: '/platform/cms',            icon: <Globe size={18} /> },
  { label: 'Sub Admins',    path: '/platform/admins',         icon: <UserCog size={18} /> },
  { label: 'Bulk Mail',     path: '/platform/mail',           icon: <Megaphone size={18} /> },
]

const restaurantNav = [
  { label: 'Dashboard',   path: '/dashboard',           icon: <LayoutDashboard size={18} /> },
  { label: 'Menu',        path: '/dashboard/menu',      icon: <Utensils size={18} /> },
  { label: 'Tables & QR', path: '/dashboard/tables',   icon: <QrCode size={18} /> },
  { label: 'Orders',      path: '/dashboard/orders',    icon: <ShoppingBag size={18} /> },
  { label: 'Employees',   path: '/dashboard/employees', icon: <Users size={18} /> },
  { label: 'Inventory',   path: '/dashboard/inventory', icon: <Box size={18} /> },
  { label: 'Cashier',     path: '/dashboard/cashier',   icon: <Receipt size={18} /> },
  { label: 'Package',     path: '/dashboard/package',   icon: <Package size={18} /> },
  { label: 'KYC',         path: '/dashboard/kyc',       icon: <FileText size={18} /> },
]

const kitchenNav = [
  { label: 'Kitchen',  path: '/kitchen',  icon: <ChefHat size={18} /> },
]

const cashierNav = [
  { label: 'Cashier',  path: '/cashier',  icon: <Receipt size={18} /> },
]

export default function Sidebar() {
  const { user, role, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const nav = role === 'platform' ? platformNav
    : role === 'restaurant' ? restaurantNav
    : role === 'kitchen' ? kitchenNav
    : cashierNav

  const handleLogout = () => { logout(); navigate('/login') }
  const isActive = (path) => path === '/platform' || path === '/dashboard' ? location.pathname === path : location.pathname.startsWith(path)

  return (
    <aside style={{
      width: collapsed ? '64px' : '220px', minHeight: '100vh',
      background: 'var(--bg2)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', transition: 'width 0.2s',
      flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 0' : '20px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border)', justifyContent: collapsed ? 'center' : 'space-between' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={18} color="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '16px' }}>Mero QR</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '4px', display: 'flex', transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
              {(user?.name || user?.username || 'U')[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || user?.username}</p>
              <p style={{ fontSize: '11px', color: 'var(--text3)', textTransform: 'capitalize' }}>{role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {nav.map(item => (
          <Link key={item.path} to={item.path} title={collapsed ? item.label : ''} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: collapsed ? '10px' : '9px 12px', borderRadius: '8px', fontSize: '14px',
            color: isActive(item.path) ? 'var(--accent)' : 'var(--text2)',
            background: isActive(item.path) ? 'var(--accent-dim)' : 'transparent',
            transition: 'all 0.15s', justifyContent: collapsed ? 'center' : 'flex-start',
            textDecoration: 'none',
          }}
            onMouseEnter={e => { if (!isActive(item.path)) e.currentTarget.style.background = 'var(--bg3)' }}
            onMouseLeave={e => { if (!isActive(item.path)) e.currentTarget.style.background = 'transparent' }}>
            {item.icon}
            {!collapsed && <span style={{ fontWeight: isActive(item.path) ? 600 : 400 }}>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: collapsed ? '10px' : '9px 12px', borderRadius: '8px',
          color: 'var(--text3)', background: 'none', border: 'none',
          width: '100%', fontSize: '14px', cursor: 'pointer',
          justifyContent: collapsed ? 'center' : 'flex-start', transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text3)'; e.currentTarget.style.background = 'none' }}>
          <LogOut size={18} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  )
}
