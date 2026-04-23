import { useState, useEffect } from 'react'
import { getAllRestaurants, getPlans } from '../../services/api'
import { StatCard, Card, Badge, Spinner, PageHeader } from '../../components/common/UI'
import { Building2, CheckCircle, XCircle, CreditCard, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PlatformDashboard() {
  const [restaurants, setRestaurants] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([getAllRestaurants(), getPlans()])
      .then(([rRes, pRes]) => {
        if (rRes.status === 'fulfilled') setRestaurants(rRes.value.data.data || [])
        if (pRes.status === 'fulfilled') setPlans(pRes.value.data.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const verified = restaurants.filter(r => r.isKYCVerified)
  const active = restaurants.filter(r => r.isActive)

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <PageHeader title="Platform Overview" subtitle="Manage all restaurants and subscriptions" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard label="Total Restaurants" value={restaurants.length} icon={<Building2 size={20} />} color="orange" />
        <StatCard label="KYC Verified" value={verified.length} icon={<CheckCircle size={20} />} color="green" />
        <StatCard label="KYC Pending" value={restaurants.length - verified.length} icon={<XCircle size={20} />} color="yellow" />
        <StatCard label="Active Plans" value={plans.length} icon={<CreditCard size={20} />} color="blue" />
        <StatCard label="Active Restaurants" value={active.length} icon={<TrendingUp size={20} />} color="purple" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>
        {/* Recent Restaurants */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-display)' }}>Recent Restaurants</h3>
            <Link to="/platform/restaurants" style={{ fontSize: '13px', color: 'var(--accent)' }}>View all →</Link>
          </div>
          {restaurants.slice(0, 8).map(r => (
            <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>{r.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--text3)' }}>{r.email}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Badge color={r.isKYCVerified ? 'green' : 'yellow'}>{r.isKYCVerified ? 'Verified' : 'Pending'}</Badge>
                <Badge color={r.isActive ? 'green' : 'red'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>
          ))}
        </Card>

        {/* Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-display)' }}>Quick Actions</h3>
          {[
            { label: 'Review KYC Requests', to: '/platform/restaurants', icon: '🔍', color: 'var(--yellow)' },
            { label: 'Manage Plans', to: '/platform/subscriptions', icon: '📦', color: 'var(--blue)' },
            { label: 'Send Bulk Mail', to: '/platform/mail', icon: '📧', color: 'var(--accent)' },
            { label: 'Create Sub Admin', to: '/platform/admins', icon: '👤', color: 'var(--purple)' },
            { label: 'Edit CMS Content', to: '/platform/cms', icon: '📝', color: 'var(--green)' },
          ].map(item => (
            <Link key={item.to} to={item.to}>
              <Card hover style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: item.color }}>{item.label}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
