import { useState, useEffect } from 'react'
import { submitKYC, getKYCStatus } from '../../services/api'
import { Card, Btn, Field, Select, Badge, PageHeader, FormActions, Spinner, Alert } from '../../components/common/UI'
import { ShieldCheck, ShieldX, Clock, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

export default function KYCPage() {
  const [kyc, setKyc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ ownerName: '', idType: '', idNumber: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await getKYCStatus()
      setKyc(res.data.data)
    } catch { }
    finally { setLoading(false) }
  }

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await submitKYC(form)
      toast.success('KYC submitted for review!')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  if (loading) return <Spinner />

  const statusInfo = {
    pending:  { color: 'yellow', icon: <Clock size={40} />,       title: 'KYC Under Review',   desc: 'Your documents are being reviewed by our team. This usually takes 1-2 business days.' },
    approved: { color: 'green',  icon: <ShieldCheck size={40} />, title: 'KYC Verified ✅',     desc: 'Your identity has been verified. You have full access to all features.' },
    rejected: { color: 'red',    icon: <ShieldX size={40} />,     title: 'KYC Rejected',        desc: kyc?.rejectionReason || 'Your KYC was rejected. Please resubmit with correct documents.' },
  }

  return (
    <div className="fade-in">
      <PageHeader title="KYC Verification" subtitle="Verify your identity to unlock all features" />

      {kyc && kyc.status !== 'rejected' ? (
        <Card style={{ maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
          <div style={{ color: `var(--${statusInfo[kyc.status].color})`, marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            {statusInfo[kyc.status].icon}
          </div>
          <Badge color={statusInfo[kyc.status].color} style={{ marginBottom: '12px' }}>{kyc.status.toUpperCase()}</Badge>
          <h2 style={{ fontSize: '20px', fontFamily: 'var(--font-display)', marginBottom: '8px', marginTop: '8px' }}>{statusInfo[kyc.status].title}</h2>
          <p style={{ color: 'var(--text3)', fontSize: '14px', marginBottom: '20px' }}>{statusInfo[kyc.status].desc}</p>

          {/* KYC Details */}
          <div style={{ background: 'var(--bg3)', borderRadius: '10px', padding: '16px', textAlign: 'left' }}>
            <Row label="Owner Name" value={kyc.ownerName} />
            <Row label="ID Type" value={kyc.idType?.replace('_', ' ')} />
            <Row label="ID Number" value={kyc.idNumber} />
            <Row label="Submitted" value={new Date(kyc.createdAt).toLocaleDateString()} />
          </div>
        </Card>
      ) : (
        <Card style={{ maxWidth: '500px' }}>
          {!kyc && (
            <Alert type="warning" message="Complete KYC verification to access all restaurant features." />
          )}
          {kyc?.status === 'rejected' && (
            <Alert type="error" message={`Rejected: ${kyc.rejectionReason || 'Please resubmit with correct info.'}`} />
          )}

          <div style={{ marginBottom: '24px', marginTop: kyc ? '16px' : '0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
              <Upload size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)' }}>Submit KYC Documents</h3>
              <p style={{ fontSize: '13px', color: 'var(--text3)' }}>Fill in your identity details below</p>
            </div>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field
              label="Owner / Manager Name"
              name="ownerName"
              value={form.ownerName}
              onChange={handle}
              placeholder="Full legal name"
              required
            />
            <Select
              label="ID Type"
              name="idType"
              value={form.idType}
              onChange={handle}
              options={[
                { value: 'national_id', label: '🪪 National ID / Citizenship' },
                { value: 'passport', label: '📘 Passport' },
                { value: 'driving_license', label: '🚗 Driving License' },
              ]}
              required
            />
            <Field
              label="ID Number"
              name="idNumber"
              value={form.idNumber}
              onChange={handle}
              placeholder="Enter your ID number"
              required
            />

            <div style={{ padding: '12px', background: 'var(--bg3)', borderRadius: '8px', fontSize: '13px', color: 'var(--text3)', lineHeight: 1.6 }}>
              <p style={{ fontWeight: 600, color: 'var(--text2)', marginBottom: '4px' }}>What happens next?</p>
              <p>1. Submit your KYC details</p>
              <p>2. Platform admin reviews within 1-2 days</p>
              <p>3. You receive email notification</p>
              <p>4. Full access unlocked on approval</p>
            </div>

            <Btn type="submit" loading={saving} fullWidth icon={<ShieldCheck size={15} />}>
              {kyc?.status === 'rejected' ? 'Resubmit KYC' : 'Submit for Verification'}
            </Btn>
          </form>
        </Card>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' }}>
      <span style={{ color: 'var(--text3)' }}>{label}</span>
      <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{value}</span>
    </div>
  )
}
