import { useState, useEffect } from 'react'
import { getPackageStatus } from '../../services/api'
import { Card, Badge, PageHeader, Spinner, StatCard } from '../../components/common/UI'
import { Package, Calendar, CheckCircle, AlertTriangle } from 'lucide-react'

export default function PackagePage() {
  const [pkg, setPkg] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPackageStatus()
      .then(r => setPkg(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const pct = pkg?.plan?.duration ? Math.max(0, Math.min(100, (pkg.daysLeft / pkg.plan.duration) * 100)) : 0
  const urgent = pkg?.daysLeft <= 7
  const barColor = pkg?.daysLeft === 0 ? 'var(--red)' : urgent ? 'var(--yellow)' : 'var(--green)'

  return (
    <div className="fade-in">
      <PageHeader title="Subscription Package" subtitle="Your current plan and usage" />

      {!pkg?.plan ? (
        <Card style={{ maxWidth: '480px', textAlign: 'center', padding: '40px' }}>
          <Package size={48} style={{ color: 'var(--text3)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>No Active Plan</h2>
          <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Contact platform admin to assign a subscription plan.</p>
        </Card>
      ) : (
        <div style={{ maxWidth: '600px' }}>
          {/* Main plan card */}
          <Card style={{ marginBottom: '20px', background: pkg.isActive ? 'var(--card)' : 'var(--red-dim)', borderColor: pkg.isActive ? 'var(--border)' : 'var(--red)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Current Plan</p>
                <h2 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>{pkg.plan.name}</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Badge color={pkg.plan.planType === 'business' ? 'purple' : 'blue'}>{pkg.plan.planType}</Badge>
                  <Badge color={pkg.isActive ? 'green' : 'red'}>{pkg.isActive ? 'Active' : 'Expired'}</Badge>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent)' }}>{pkg.daysLeft}</p>
                <p style={{ fontSize: '13px', color: 'var(--text3)' }}>days remaining</p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>
                <span>Plan duration: {pkg.plan.durationLabel}</span>
                <span>{Math.round(pct)}% remaining</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg3)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '100px', transition: 'width 0.5s ease' }} />
              </div>
            </div>

            {/* Expiry */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: urgent ? 'var(--yellow)' : 'var(--text3)' }}>
              {urgent ? <AlertTriangle size={14} /> : <Calendar size={14} />}
              <span>
                {pkg.packageExpiresAt
                  ? `Expires: ${new Date(pkg.packageExpiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                  : 'No expiry date set'}
              </span>
            </div>
          </Card>

          {/* Features */}
          {pkg.plan.features?.length > 0 && (
            <Card>
              <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-display)', marginBottom: '14px' }}>Plan Features</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pkg.plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <CheckCircle size={15} color="var(--green)" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Warning */}
          {urgent && pkg.daysLeft > 0 && (
            <Card style={{ marginTop: '16px', background: 'var(--yellow-dim)', borderColor: 'var(--yellow)30' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <AlertTriangle size={18} color="var(--yellow)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--yellow)', marginBottom: '4px' }}>Plan expiring soon!</p>
                  <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Your plan expires in {pkg.daysLeft} day(s). Contact platform admin to renew and avoid service interruption.</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
