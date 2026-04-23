import { useState, useEffect } from 'react'
import { getMenu, createCategory, createMenuItem, updateMenuItem, deleteMenuItem } from '../../services/api'
import { Card, Btn, Field, Select, Modal, Badge, PageHeader, FormGrid, FormActions, Empty, Spinner, Table } from '../../components/common/UI'
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MenuPage() {
  const [menu, setMenu] = useState([])
  const [loading, setLoading] = useState(true)
  const [catModal, setCatModal] = useState(false)
  const [itemModal, setItemModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [catForm, setCatForm] = useState({ name: '', sortOrder: 0 })
  const [itemForm, setItemForm] = useState({ category: '', name: '', description: '', price: '', taxPercent: 0, isAvailable: true })
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState({})

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await getMenu()
      setMenu(res.data.data || [])
      // Expand all by default
      const exp = {}
      res.data.data?.forEach(c => exp[c._id] = true)
      setExpanded(exp)
    } catch (err) {
      toast.error('Failed to load menu')
    } finally { setLoading(false) }
  }

  const handleCat = e => setCatForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const handleItem = e => setItemForm(p => ({ ...p, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const saveCat = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await createCategory(catForm)
      toast.success('Category created!')
      setCatModal(false); setCatForm({ name: '', sortOrder: 0 })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const saveItem = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editItem) {
        await updateMenuItem(editItem._id, itemForm)
        toast.success('Item updated!')
      } else {
        await createMenuItem(itemForm)
        toast.success('Item added!')
      }
      setItemModal(false); setEditItem(null)
      setItemForm({ category: '', name: '', description: '', price: '', taxPercent: 0, isAvailable: true })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const delItem = async (id) => {
    if (!confirm('Delete this item?')) return
    try { await deleteMenuItem(id); toast.success('Deleted!'); load() }
    catch { toast.error('Failed to delete') }
  }

  const openEdit = (item) => {
    setEditItem(item)
    setItemForm({ category: item.category, name: item.name, description: item.description || '', price: item.price, taxPercent: item.taxPercent || 0, isAvailable: item.isAvailable })
    setItemModal(true)
  }

  const catOptions = menu.map(c => ({ value: c._id, label: c.name }))
  const totalItems = menu.reduce((s, c) => s + c.items.length, 0)

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <PageHeader
        title="Menu Management"
        subtitle={`${menu.length} categories · ${totalItems} items`}
        action={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Btn onClick={() => setCatModal(true)} variant="secondary" icon={<Plus size={15} />}>Add Category</Btn>
            <Btn onClick={() => setItemModal(true)} icon={<Plus size={15} />}>Add Item</Btn>
          </div>
        }
      />

      {menu.length === 0
        ? <Empty icon="🍽️" title="No menu yet" desc="Start by creating a category, then add items." action={<Btn onClick={() => setCatModal(true)}>Create Category</Btn>} />
        : menu.map(cat => (
          <Card key={cat._id} style={{ marginBottom: '16px', padding: 0, overflow: 'hidden' }}>
            {/* Category Header */}
            <div onClick={() => setExpanded(p => ({ ...p, [cat._id]: !p[cat._id] }))}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', background: 'var(--bg3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {expanded[cat._id] ? <ChevronDown size={16} color="var(--text3)" /> : <ChevronRight size={16} color="var(--text3)" />}
                <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-display)' }}>{cat.name}</h3>
                <Badge color="default">{cat.items.length} items</Badge>
              </div>
              <Btn size="sm" variant="ghost" icon={<Plus size={13} />}
                onClick={e => { e.stopPropagation(); setItemForm(p => ({ ...p, category: cat._id })); setItemModal(true) }}>
                Add Item
              </Btn>
            </div>

            {/* Items */}
            {expanded[cat._id] && (
              <div style={{ padding: '0 0 8px 0' }}>
                {cat.items.length === 0
                  ? <p style={{ padding: '20px', color: 'var(--text3)', fontSize: '14px', textAlign: 'center' }}>No items in this category</p>
                  : cat.items.map(item => (
                    <div key={item._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.name}</span>
                          <Badge color={item.isAvailable ? 'green' : 'red'}>{item.isAvailable ? 'Available' : 'Unavailable'}</Badge>
                        </div>
                        {item.description && <p style={{ fontSize: '12px', color: 'var(--text3)' }}>{item.description}</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>Rs. {item.price}</span>
                        {item.taxPercent > 0 && <span style={{ fontSize: '12px', color: 'var(--text3)' }}>+{item.taxPercent}% tax</span>}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <Btn size="sm" variant="ghost" icon={<Edit2 size={13} />} onClick={() => openEdit(item)} />
                          <Btn size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={() => delItem(item._id)} />
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </Card>
        ))
      }

      {/* Category Modal */}
      <Modal open={catModal} onClose={() => setCatModal(false)} title="Add Category">
        <form onSubmit={saveCat} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Category Name" name="name" value={catForm.name} onChange={handleCat} placeholder="e.g. Starters" required />
          <Field label="Sort Order" name="sortOrder" type="number" value={catForm.sortOrder} onChange={handleCat} placeholder="0" />
          <FormActions>
            <Btn variant="ghost" onClick={() => setCatModal(false)}>Cancel</Btn>
            <Btn type="submit" loading={saving}>Create Category</Btn>
          </FormActions>
        </form>
      </Modal>

      {/* Item Modal */}
      <Modal open={itemModal} onClose={() => { setItemModal(false); setEditItem(null) }} title={editItem ? 'Edit Menu Item' : 'Add Menu Item'}>
        <form onSubmit={saveItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select label="Category" name="category" value={itemForm.category} onChange={handleItem} options={catOptions} required />
          <Field label="Item Name" name="name" value={itemForm.name} onChange={handleItem} placeholder="Paneer Tikka" required />
          <Field label="Description" name="description" value={itemForm.description} onChange={handleItem} placeholder="Optional description" />
          <FormGrid>
            <Field label="Price (Rs.)" name="price" type="number" value={itemForm.price} onChange={handleItem} placeholder="250" required />
            <Field label="Tax (%)" name="taxPercent" type="number" value={itemForm.taxPercent} onChange={handleItem} placeholder="5" />
          </FormGrid>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" name="isAvailable" checked={itemForm.isAvailable} onChange={handleItem} style={{ width: 'auto' }} />
            Available for ordering
          </label>
          <FormActions>
            <Btn variant="ghost" onClick={() => { setItemModal(false); setEditItem(null) }}>Cancel</Btn>
            <Btn type="submit" loading={saving}>{editItem ? 'Update' : 'Add Item'}</Btn>
          </FormActions>
        </form>
      </Modal>
    </div>
  )
}
