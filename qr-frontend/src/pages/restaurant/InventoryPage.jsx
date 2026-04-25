import { useState, useEffect } from 'react'
import api from '../../services/api'
import { Card, Btn, Field, Modal, Badge, PageHeader, FormGrid, FormActions, Table, Empty, Spinner } from '../../components/common/UI'
import { Plus, AlertTriangle, Box } from 'lucide-react'
import toast from 'react-hot-toast'

export default function InventoryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ itemName: '', unit: 'pcs', quantity: 0, lowStockAt: 5 })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await api.get('/restaurant/inventory')
      setItems(res.data.data || [])
    } catch { toast.error('Failed to load inventory') }
    finally { setLoading(false) }
  }

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/restaurant/inventory', form)
      toast.success('Inventory item added!')
      setModal(false); setForm({ itemName: '', unit: 'pcs', quantity: 0, lowStockAt: 5 })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const updateQty = async (id, qty) => {
    try {
      await api.patch(`/restaurant/inventory/${id}`, { quantity: qty })
      toast.success('Updated!')
      load()
    } catch { toast.error('Failed') }
  }

  const lowStock = items.filter(i => i.quantity <= i.lowStockAt)

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <PageHeader
        title="Inventory"
        subtitle={`${items.length} items · ${lowStock.length} low stock`}
        action={<Btn onClick={() => setModal(true)} icon={<Plus size={15} />}>Add Item</Btn>}
      />

      {lowStock.length > 0 && (
        <Card style={{ marginBottom: '20px', background: 'var(--yellow-dim)', borderColor: 'var(--yellow)30' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <AlertTriangle size={18} color="var(--yellow)" />
            <div>
              <p style={{ fontWeight: 600, color: 'var(--yellow)' }}>Low Stock Alert</p>
              <p style={{ fontSize: '13px', color: 'var(--text3)' }}>
                {lowStock.map(i => i.itemName).join(', ')} {lowStock.length === 1 ? 'is' : 'are'} running low
              </p>
            </div>
          </div>
        </Card>
      )}

      {items.length === 0
        ? <Empty icon="📦" title="No inventory items" desc="Track your ingredients and stock levels." action={<Btn onClick={() => setModal(true)}>Add Item</Btn>} />
        : (
          <Card style={{ padding: 0 }}>
            <Table
              headers={['Item', 'Unit', 'Quantity', 'Low Stock At', 'Status', 'Actions']}
              empty="No inventory items"
              rows={items.map(item => [
                <span style={{ fontWeight: 500 }}>{item.itemName}</span>,
                <span style={{ color: 'var(--text3)' }}>{item.unit}</span>,
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{item.quantity}</span>,
                <span style={{ color: 'var(--text3)' }}>{item.lowStockAt}</span>,
                <Badge color={item.quantity <= 0 ? 'red' : item.quantity <= item.lowStockAt ? 'yellow' : 'green'}>
                  {item.quantity <= 0 ? 'Out of stock' : item.quantity <= item.lowStockAt ? 'Low stock' : 'In stock'}
                </Badge>,
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button onClick={() => updateQty(item._id, Math.max(0, item.quantity - 1))}
                    style={{ width: '26px', height: '26px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg3)', color: 'var(--text)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <button onClick={() => updateQty(item._id, item.quantity + 1)}
                    style={{ width: '26px', height: '26px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg3)', color: 'var(--text)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              ])}
            />
          </Card>
        )
      }

      <Modal open={modal} onClose={() => setModal(false)} title="Add Inventory Item">
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Item Name" name="itemName" value={form.itemName} onChange={handle} placeholder="e.g. Paneer, Rice, Oil" required />
          <FormGrid>
            <Field label="Unit" name="unit" value={form.unit} onChange={handle} placeholder="pcs / kg / L" />
            <Field label="Initial Quantity" name="quantity" type="number" value={form.quantity} onChange={handle} />
          </FormGrid>
          <Field label="Low Stock Alert At" name="lowStockAt" type="number" value={form.lowStockAt} onChange={handle} hint="You'll be alerted when quantity drops to this level" />
          <FormActions>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn type="submit" loading={saving}>Add Item</Btn>
          </FormActions>
        </form>
      </Modal>
    </div>
  )
}
