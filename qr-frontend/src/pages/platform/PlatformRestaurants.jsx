import { useState, useEffect } from 'react'
import { getAllRestaurants, updateKYC, toggleRestaurantStatus, resetRestaurantPassword, assignPlan, getPlans } from '../../services/api'
import { Card, Btn, Badge, PageHeader, Modal, Field, Select, FormActions, Table, Spinner, Alert } from '../../components/common/UI'
import { CheckCircle, XCircle, ToggleLeft, ToggleRight, Key, Package, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PlatformRestaurants() {
  const [restaurants, setRestaurants] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState('') // 'kyc' | 'reset' | 'plan' | 'view'
  const [newPass, setNewPass] = useState('')
  const [planId, setPlanId] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const [rRes, pRes] = await Promise.allSettled([getAllRestaurants(), getPlans()])
      if (rRes.status === 'fulfilled') setRestaurants(rRes.value.data.data || [])
      if (pRes.status === 'fulfilled') setPlans(pRes.value.data.data || [])
    } finally { setLoading(false) }
  }

  const open = (r, m) => { setSelected(r); setModal(m) }
  const close = () => { setModal(''); setSelected(null); setNewPass(''); setPlanId('') }

  const approveKYC = async (status, reason = '') => {
    setSaving(true)
    try {
      await updateKYC(selected._id, { status, rejectionReason: reason })
      toast.success(`KYC ${status}!`)
      close(); load()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const toggleStatus = async (r) => {
    try {
      await toggleRestaurantStatus(r._id)
      toast.success(r.isActive ? 'Restaurant deactivated' : 'Restaurant activated')
      load()
    } catch { toast.error('Failed') }
  }

  const resetPass = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await resetRestaurantPassword(selected._id, { newPassword: newPass })
      toast.success('Password reset!')
      close()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const assignPackage = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await assignPlan({ restaurantId: selected._id, planId })
      toast.success('Plan assigned!')
      close(); load()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <PageHeader title="Restaurants" subtitle={`${restaurants.length} registered restaurants`} />

      <div style={{ marginBottom: '16px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name or email..." style={{ maxWidth: '320px' }} />
      </div>

      <Card style={{ padding: 0 }}>
        <Table
          headers={['Restaurant', 'Email', 'KYC', 'Status', 'Package Expires', 'Actions']}
          empty="No restaurants yet"
          rows={filtered.map(r => [
            <div>
              <p style={{ fontWeight: 500, fontSize: '14px' }}>{r.name}</p>
              <p style={{ fontSize: '11px', color: 'var(--text3)' }}>{r.phone}</p>
            </div>,
            <span style={{ fontSize: '13px', color: 'var(--text3)' }}>{r.email}</span>,
            <Badge color={r.isKYCVerified ? 'green' : 'yellow'}>{r.isKYCVerified ? 'Verified' : 'Pending'}</Badge>,
            <Badge color={r.isActive ? 'green' : 'red'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>,
            <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
              {r.packageExpiresAt ? new Date(r.packageExpiresAt).toLocaleDateString() : 'No plan'}
            </span>,
            <div style={{ display: 'flex', gap: '4px' }}>
              {!r.isKYCVerified && (
                <Btn size="sm" variant="ghost" icon={<CheckCircle size={13} />} onClick={() => open(r, 'kyc')}>KYC</Btn>
              )}
              <Btn size="sm" variant="ghost" icon={<Package size={13} />} onClick={() => open(r, 'plan')}>Plan</Btn>
              <Btn size="sm" variant="ghost" icon={<Key size={13} />} onClick={() => open(r, 'reset')}>Reset</Btn>
              <Btn size="sm" variant={r.isActive ? 'danger' : 'success'} icon={r.isActive ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                onClick={() => toggleStatus(r)}>
                {r.isActive ? 'Off' : 'On'}
              </Btn>
            </div>
          ])}
        />
      </Card>

      {/* KYC Modal */}
      <Modal open={modal === 'kyc'} onClose={close} title={`Review KYC — ${selected?.name}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Alert type="info" message={`Restaurant: ${selected?.name} (${selected?.email})`} />
          <p style={{ fontSize: '14px', color: 'var(--text3)' }}>Review and approve or reject KYC verification for this restaurant.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Btn fullWidth variant="success" loading={saving} icon={<CheckCircle size={15} />} onClick={() => approveKYC('approved')}>
              Approve KYC
            </Btn>
            <Btn fullWidth variant="danger" loading={saving} icon={<XCircle size={15} />}
              onClick={() => {
                const reason = prompt('Rejection reason (optional):') || ''
                approveKYC('rejected', reason)
              }}>
              Reject KYC
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={modal === 'reset'} onClose={close} title={`Reset Password — ${selected?.name}`}>
        <form onSubmit={resetPass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Alert type="warning" message="This will immediately change the restaurant admin's password." />
          <Field label="New Password" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required placeholder="Temporary password" />
          <FormActions>
            <Btn variant="ghost" onClick={close}>Cancel</Btn>
            <Btn type="submit" loading={saving} variant="danger">Reset Password</Btn>
          </FormActions>
        </form>
      </Modal>

      {/* Assign Plan Modal */}
      <Modal open={modal === 'plan'} onClose={close} title={`Assign Plan — ${selected?.name}`}>
        <form onSubmit={assignPackage} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select
            label="Select Plan"
            value={planId}
            onChange={e => setPlanId(e.target.value)}
            options={plans.map(p => ({ value: p._id, label: `${p.name} — Rs.${p.price} (${p.durationLabel})` }))}
            required
          />
          <FormActions>
            <Btn variant="ghost" onClick={close}>Cancel</Btn>
            <Btn type="submit" loading={saving} icon={<Package size={15} />}>Assign Plan</Btn>
          </FormActions>
        </form>
      </Modal>
    </div>
  )
}
