import { useState } from 'react'
import { Loader2, X, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react'

// ── Button
export const Btn = ({ children, onClick, type='button', variant='primary', size='md', loading, disabled, fullWidth, icon }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', border: 'none', borderRadius: '8px', fontFamily: 'var(--font-body)',
    fontWeight: 500, cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1, transition: 'all 0.2s',
    width: fullWidth ? '100%' : 'auto',
  }
  const sizes = { sm: { padding: '6px 14px', fontSize: '13px' }, md: { padding: '10px 20px', fontSize: '14px' }, lg: { padding: '13px 28px', fontSize: '15px' } }
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff' },
    secondary: { background: 'var(--bg3)', color: 'var(--text)', border: '1.5px solid var(--border)' },
    danger: { background: 'var(--red)', color: '#fff' },
    success: { background: 'var(--green)', color: '#fff' },
    ghost: { background: 'transparent', color: 'var(--text2)', border: '1.5px solid var(--border)' },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{ ...base, ...sizes[size], ...variants[variant] }}
      onMouseEnter={e => { if (!disabled && !loading) e.target.style.opacity = '0.85' }}
      onMouseLeave={e => { if (!disabled && !loading) e.target.style.opacity = '1' }}>
      {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : icon}
      {children}
    </button>
  )
}

// ── Input Field
export const Field = ({ label, name, type='text', value, onChange, placeholder, required, error, hint }) => {
  const [show, setShow] = useState(false)
  const isPass = type === 'password'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)' }}>{label}{required && <span style={{ color: 'var(--accent)' }}> *</span>}</label>}
      <div style={{ position: 'relative' }}>
        <input
          type={isPass ? (show ? 'text' : 'password') : type}
          name={name} value={value} onChange={onChange}
          placeholder={placeholder} required={required}
          style={{ borderColor: error ? 'var(--red)' : undefined, paddingRight: isPass ? '40px' : undefined }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(!show)}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 0 }}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span style={{ fontSize: '12px', color: 'var(--red)' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{hint}</span>}
    </div>
  )
}

// ── Select
export const Select = ({ label, name, value, onChange, options, required }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {label && <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)' }}>{label}{required && <span style={{ color: 'var(--accent)' }}> *</span>}</label>}
    <select name={name} value={value} onChange={onChange} required={required}>
      <option value="">Select {label}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
)

// ── Card
export const Card = ({ children, style, onClick, hover }) => (
  <div onClick={onClick} style={{
    background: 'var(--card)', border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '20px', transition: 'all 0.2s',
    cursor: onClick || hover ? 'pointer' : 'default', ...style
  }}
    onMouseEnter={e => { if (onClick || hover) { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.transform = 'translateY(-2px)' } }}
    onMouseLeave={e => { if (onClick || hover) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' } }}>
    {children}
  </div>
)

// ── Modal
export const Modal = ({ open, onClose, title, children, width = '480px' }) => {
  if (!open) return null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '4px' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  )
}

// ── Badge
export const Badge = ({ children, color = 'default' }) => {
  const colors = {
    default: { bg: 'var(--bg3)', color: 'var(--text2)' },
    green:   { bg: 'var(--green-dim)', color: 'var(--green)' },
    red:     { bg: 'var(--red-dim)', color: 'var(--red)' },
    yellow:  { bg: 'var(--yellow-dim)', color: 'var(--yellow)' },
    blue:    { bg: 'var(--blue-dim)', color: 'var(--blue)' },
    orange:  { bg: 'var(--accent-dim)', color: 'var(--accent)' },
    purple:  { bg: 'var(--purple-dim)', color: 'var(--purple)' },
  }
  const c = colors[color] || colors.default
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 500, background: c.bg, color: c.color }}>
      {children}
    </span>
  )
}

// ── Stat Card
export const StatCard = ({ label, value, icon, color = 'orange', sub }) => (
  <Card>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '8px' }}>{label}</p>
        <p style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{value}</p>
        {sub && <p style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '4px' }}>{sub}</p>}
      </div>
      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `var(--${color}-dim, var(--accent-dim))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: `var(--${color}, var(--accent))`, flexShrink: 0 }}>
        {icon}
      </div>
    </div>
  </Card>
)

// ── Spinner
export const Spinner = ({ size = 32 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
    <Loader2 size={size} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
  </div>
)

// ── Empty State
export const Empty = ({ icon, title, desc, action }) => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>{icon || '📭'}</div>
    <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--text2)' }}>{title || 'Nothing here yet'}</h3>
    {desc && <p style={{ fontSize: '14px', color: 'var(--text3)', marginBottom: '16px' }}>{desc}</p>}
    {action}
  </div>
)

// ── Alert
export const Alert = ({ type = 'info', message }) => {
  const styles = {
    info:    { bg: 'var(--blue-dim)',   color: 'var(--blue)',   icon: '💡' },
    success: { bg: 'var(--green-dim)',  color: 'var(--green)',  icon: '✅' },
    warning: { bg: 'var(--yellow-dim)', color: 'var(--yellow)', icon: '⚠️' },
    error:   { bg: 'var(--red-dim)',    color: 'var(--red)',    icon: '❌' },
  }
  const s = styles[type]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: 'var(--radius-sm)', background: s.bg, color: s.color, fontSize: '14px', border: `1px solid ${s.color}30` }}>
      <span>{s.icon}</span>
      <span>{message}</span>
    </div>
  )
}

// ── Table
export const Table = ({ headers, rows, empty }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          {headers.map((h, i) => (
            <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={headers.length} style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>{empty || 'No data'}</td></tr>
          : rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {row.map((cell, j) => <td key={j} style={{ padding: '12px 14px', color: 'var(--text)' }}>{cell}</td>)}
            </tr>
          ))}
      </tbody>
    </table>
  </div>
)

// ── Page Header
export const PageHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
    <div>
      <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: '14px', color: 'var(--text3)' }}>{subtitle}</p>}
    </div>
    {action}
  </div>
)

// ── Form Group
export const FormGrid = ({ children, cols = 2 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px' }}>
    {children}
  </div>
)

export const FormActions = ({ children }) => (
  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
    {children}
  </div>
)

// ── Divider
export const Divider = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    {label && <span style={{ fontSize: '12px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>{label}</span>}
    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
  </div>
)
