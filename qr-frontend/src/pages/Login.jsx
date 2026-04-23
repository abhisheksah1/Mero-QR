import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { platformLogin, restaurantLogin, employeeLogin } from '../services/api'
import { Field, Btn, Alert, Select } from '../components/common/UI'
import { QrCode } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('restaurant') // 'platform' | 'restaurant' | 'employee'
  const [form, setForm] = useState({ email: '', password: '', username: '', restaurantId: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      let res, userData, role, redirect

      if (tab === 'platform') {
        res = await platformLogin({ email: form.email, password: form.password })
        userData = res.data.data.admin
        role = 'platform'
        redirect = '/platform'
      } else if (tab === 'restaurant') {
        res = await restaurantLogin({ email: form.email, password: form.password })
        userData = res.data.data.restaurant
        role = 'restaurant'
        redirect = '/dashboard'
      } else {
        res = await employeeLogin({ username: form.username, password: form.password, restaurantId: form.restaurantId })
        userData = { username: form.username, ...res.data.data }
        role = res.data.data.role // 'kitchen' or 'cashier'
        redirect = role === 'kitchen' ? '/kitchen' : '/cashier'
        if (res.data.data.mustChangePassword) {
          login(res.data.data.token, userData, role)
          navigate('/change-password')
          return
        }
      }

      login(res.data.data.token, userData, role)
      toast.success('Welcome back!')
      navigate(redirect)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'employee', label: 'Employee' },
    { id: 'platform', label: 'Platform' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px' }}>
      {/* BG decoration */}
      <div style={{ position: 'fixed', top: '-200px', right: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,43,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.4s ease' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--accent)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <QrCode size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '28px', fontFamily: 'var(--font-display)', marginBottom: '6px' }}>Mero QR</h1>
          <p style={{ color: 'var(--text3)', fontSize: '14px' }}>Smart Restaurant Ordering System</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px' }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: '8px', padding: '4px', marginBottom: '24px', gap: '2px' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setError('') }} style={{
                flex: 1, padding: '7px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                background: tab === t.id ? 'var(--card)' : 'transparent',
                color: tab === t.id ? 'var(--text)' : 'var(--text3)',
                boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
              }}>{t.label}</button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && <Alert type="error" message={error} />}

            {tab !== 'employee' ? (
              <>
                <Field label="Email" name="email" type="email" value={form.email} onChange={handle} placeholder="admin@example.com" required />
                <Field label="Password" name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required />
              </>
            ) : (
              <>
                <Field label="Restaurant ID" name="restaurantId" value={form.restaurantId} onChange={handle} placeholder="Enter your restaurant ID" required hint="Get this from your restaurant admin" />
                <Field label="Username" name="username" value={form.username} onChange={handle} placeholder="kitchen01" required />
                <Field label="Password" name="password" type="password" value={form.password} onChange={handle} placeholder="••••••••" required />
              </>
            )}

            <Btn type="submit" fullWidth loading={loading} size="lg">Sign In</Btn>

            {tab === 'restaurant' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/register" style={{ fontSize: '13px', color: 'var(--accent)' }}>Create account</Link>
                <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--text3)' }}>Forgot password?</Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
