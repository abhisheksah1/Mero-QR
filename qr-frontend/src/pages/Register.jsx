import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { restaurantRegister } from '../services/api'
import { Field, Btn, Alert, FormGrid } from '../components/common/UI'
import { QrCode, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return setError('Passwords do not match')
    setError(''); setLoading(true)
    try {
      await restaurantRegister({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      toast.success('Registered! Check your email for welcome message.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px' }}>
      <div style={{ position: 'fixed', bottom: '-200px', left: '-200px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,43,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '480px', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '52px', height: '52px', background: 'var(--accent)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <QrCode size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>Register Restaurant</h1>
          <p style={{ color: 'var(--text3)', fontSize: '13px' }}>Create your restaurant account on Mero QR</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px' }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && <Alert type="error" message={error} />}

            <Field label="Restaurant Name" name="name" value={form.name} onChange={handle} placeholder="The Spice House" required />
            <FormGrid>
              <Field label="Email" name="email" type="email" value={form.email} onChange={handle} placeholder="info@restaurant.com" required />
              <Field label="Phone" name="phone" value={form.phone} onChange={handle} placeholder="98XXXXXXXX" required />
            </FormGrid>
            <FormGrid>
              <Field label="Password" name="password" type="password" value={form.password} onChange={handle} placeholder="Min 6 characters" required />
              <Field label="Confirm Password" name="confirm" type="password" value={form.confirm} onChange={handle} placeholder="Repeat password" required />
            </FormGrid>

            <div style={{ background: 'var(--yellow-dim)', border: '1px solid var(--yellow)30', borderRadius: '8px', padding: '12px', fontSize: '13px', color: 'var(--yellow)' }}>
              ⚠️ After registration, complete KYC verification to access all features.
            </div>

            <Btn type="submit" fullWidth loading={loading} size="lg">Create Account</Btn>

            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text3)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
