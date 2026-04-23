import { useState, useEffect } from 'react'
import { getPlans, createPlan } from '../../services/api'
import { Card, Btn, Field, Select, Modal, Badge, PageHeader, FormGrid, FormActions, Empty, Spinner } from '../../components/common/UI'
import { Plus, CheckCircle, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PlatformSubscriptions() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', planType: 'basic', duration: '', durationLabel: '', price: '', features: '' })

  useEffect(() => { load() }, [])

  const load = async () => {
    try { const r = await getPlans(); setPlans(r.data.data || []) }
    catch { toast.error('Failed') }
    finally { setLoading(false) }
  }

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const features = form.features.split('\n').filter(Boolean)
      await createPlan({ ...form, duration: Number(form.duration), price: Number(form.price), features })
      toast.success('Plan created!')
      setModal(false)
      setForm({ name: '', planType: 'basic', duration: '', durationLabel: '', price: '', features: '' })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  if (loading) return <Spinner />

  const basic = plans.filter(p => p.planType === 'basic')
  const business = plans.filter(p => p.planType === 'business')

  return (
    <div className="fade-in">
      <PageHeader
        title="Subscription Plans"
        subtitle={`${plans.length} plans configured`}
        action={<Btn onClick={() => setModal(true)} icon={<Plus size={15} />}>Create Plan</Btn>}
      />

      {plans.length === 0
        ? <Empty icon="💳" title="No plans yet" desc="Create subscription plans for restaurants." action={<Btn onClick={() => setModal(true)}>Create First Plan</Btn>} />
        : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {[{ label: 'Basic Plans', items: basic, color: 'blue' }, { label: 'Business Plans', items: business, color: 'purple' }].map(group => (
              <div key={group.label}>
                <h3 style={{ fontSize: '14px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>{group.label}</h3>
                {group.items.length === 0
                  ? <p style={{ color: 'var(--text3)', fontSize: '14px' }}>No {group.label.toLowerCase()} yet</p>
                  : group.items.map(plan => (
                    <Card key={plan._id} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>{plan.name}</h3>
                          <p style={{ fontSize: '12px', color: 'var(--text3)' }}>{plan.durationLabel} · {plan.duration} days</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent)' }}>Rs. {plan.price.toLocaleString()}</p>
                          <Badge color={group.color}>{plan.planType}</Badge>
                        </div>
                      </div>
                      {plan.features?.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {plan.features.map((f, i) => (
                            <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '13px', color: 'var(--text3)' }}>
                              <CheckCircle size={13} color="var(--green)" />
                              {f}
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))
                }
              </div>
            ))}
          </div>
        )
      }

      <Modal open={modal} onClose={() => setModal(false)} title="Create Subscription Plan">
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Plan Name" name="name" value={form.name} onChange={handle} placeholder="e.g. Basic Monthly" required />
          <FormGrid>
            <Select label="Plan Type" name="planType" value={form.planType} onChange={handle}
              options={[{ value: 'basic', label: 'Basic' }, { value: 'business', label: 'Business' }]} />
            <Field label="Price (Rs.)" name="price" type="number" value={form.price} onChange={handle} required />
          </FormGrid>
          <FormGrid>
            <Field label="Duration (days)" name="duration" type="number" value={form.duration} onChange={handle} placeholder="30, 90, 180, 365, 1460" required />
            <Field label="Duration Label" name="durationLabel" value={form.durationLabel} onChange={handle} placeholder="1 Month, 3 Months..." required />
          </FormGrid>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)' }}>Features (one per line)</label>
            <textarea name="features" value={form.features} onChange={handle} placeholder={"Menu Management\nQR Tables\nOrder Management"} rows={4} style={{ resize: 'vertical' }} />
          </div>
          <FormActions>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn type="submit" loading={saving} icon={<CreditCard size={15} />}>Create Plan</Btn>
          </FormActions>
        </form>
      </Modal>
    </div>
  )
}
