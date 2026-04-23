import { useState, useEffect } from 'react'
import { getEmployees, createEmployee, resetEmployeePassword } from '../../services/api'
import { Card, Btn, Field, Select, Modal, Badge, PageHeader, FormGrid, FormActions, Table, Empty, Spinner, Alert } from '../../components/common/UI'
import { Plus, RefreshCw, ChefHat, Receipt, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function EmployeesPage() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ username: '', role: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await getEmployees()
      setEmployees(res.data.data || [])
    } catch { toast.error('Failed to load employees') }
    finally { setLoading(false) }
  }

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await createEmployee(form)
      toast.success(`Employee ${form.username} created! Default password: ${form.username}`)
      setModal(false); setForm({ username: '', role: '' })
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const resetPass = async (emp) => {
    if (!confirm(`Reset ${emp.username}'s password to their username?`)) return
    try {
      await resetEmployeePassword(emp._id)
      toast.success(`Password reset to: ${emp.username}`)
    } catch { toast.error('Failed to reset') }
  }

  const copy = (text) => { navigator.clipboard.writeText(text); toast.success('Copied!') }

  const kitchen = employees.filter(e => e.role === 'kitchen')
  const cashier = employees.filter(e => e.role === 'cashier')

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} total · ${kitchen.length} kitchen · ${cashier.length} cashier`}
        action={<Btn onClick={() => setModal(true)} icon={<Plus size={15} />}>Add Employee</Btn>}
      />

      {/* Restaurant ID for employee login */}
      <Card style={{ marginBottom: '24px', background: 'var(--accent-dim)', border: '1px solid var(--accent)30' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--accent)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Restaurant ID for Employee Login</p>
            <p style={{ fontSize: '15px', fontFamily: 'var(--font-display)', color: 'var(--text)' }}>{user?._id || user?.id}</p>
          </div>
          <Btn size="sm" variant="ghost" icon={<Copy size={13} />} onClick={() => copy(user?._id || user?.id)}>Copy ID</Btn>
        </div>
      </Card>

      {employees.length === 0
        ? <Empty icon="👥" title="No employees yet" desc="Add kitchen staff and cashiers." action={<Btn onClick={() => setModal(true)}>Add Employee</Btn>} />
        : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Kitchen */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <ChefHat size={18} color="var(--orange, var(--accent))" />
                <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-display)' }}>Kitchen Staff ({kitchen.length})</h3>
              </div>
              {kitchen.length === 0 ? <p style={{ color: 'var(--text3)', fontSize: '14px' }}>No kitchen staff</p>
                : kitchen.map(emp => <EmpRow key={emp._id} emp={emp} onReset={resetPass} onCopy={copy} />)
              }
            </Card>

            {/* Cashier */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Receipt size={18} color="var(--green)" />
                <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-display)' }}>Cashier Staff ({cashier.length})</h3>
              </div>
              {cashier.length === 0 ? <p style={{ color: 'var(--text3)', fontSize: '14px' }}>No cashier staff</p>
                : cashier.map(emp => <EmpRow key={emp._id} emp={emp} onReset={resetPass} onCopy={copy} />)
              }
            </Card>
          </div>
        )
      }

      {/* Add Employee Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Employee">
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Alert type="info" message="Default password will be the same as the username. Employee must change it on first login." />
          <Field label="Username" name="username" value={form.username} onChange={handle} placeholder="e.g. kitchen01" required hint="Lowercase, no spaces" />
          <Select label="Role" name="role" value={form.role} onChange={handle}
            options={[{ value: 'kitchen', label: '👨‍🍳 Kitchen' }, { value: 'cashier', label: '💰 Cashier' }]}
            required />
          <FormActions>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn type="submit" loading={saving}>Create Employee</Btn>
          </FormActions>
        </form>
      </Modal>
    </div>
  )
}

function EmpRow({ emp, onReset, onCopy }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '14px', color: 'var(--text2)' }}>
          {emp.username[0].toUpperCase()}
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 500 }}>{emp.username}</p>
          <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
            <Badge color={emp.isActive ? 'green' : 'red'}>{emp.isActive ? 'Active' : 'Inactive'}</Badge>
            {!emp.isPasswordChanged && <Badge color="yellow">Needs PW change</Badge>}
          </div>
        </div>
      </div>
      <Btn size="sm" variant="ghost" icon={<RefreshCw size={13} />} onClick={() => onReset(emp)}>Reset PW</Btn>
    </div>
  )
}
