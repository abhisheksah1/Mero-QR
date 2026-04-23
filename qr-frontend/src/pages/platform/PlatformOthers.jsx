import { useState, useEffect } from 'react'
import { getCMS, upsertCMS, createSubAdmin, sendBulkMail } from '../../services/api'
import { Card, Btn, Field, Select, Modal, Badge, PageHeader, FormGrid, FormActions, Empty, Spinner, Alert } from '../../components/common/UI'
import { Plus, Save, Send, UserPlus, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

// ── CMS Page
export function CMSPage() {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ key: '', title: '', content: '', type: 'page' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])
  const load = async () => {
    try { const r = await getCMS(); setContent(r.data.data || []) }
    catch { } finally { setLoading(false) }
  }

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const openEdit = (item) => {
    setForm({ key: item.key, title: item.title || '', content: item.content || '', type: item.type || 'page' })
    setModal(true)
  }

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await upsertCMS(form); toast.success('Content saved!'); setModal(false); load() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <PageHeader title="CMS Content" subtitle="Manage website pages and banners"
        action={<Btn onClick={() => { setForm({ key: '', title: '', content: '', type: 'page' }); setModal(true) }} icon={<Plus size={15} />}>Add Content</Btn>} />

      {content.length === 0
        ? <Empty icon="📝" title="No content yet" desc="Add pages, banners and FAQs." action={<Btn onClick={() => setModal(true)}>Add Content</Btn>} />
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {content.map(item => (
              <Card key={item._id} hover onClick={() => openEdit(item)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Badge color="blue">{item.type}</Badge>
                  <Badge color={item.isActive ? 'green' : 'red'}>{item.isActive ? 'Active' : 'Hidden'}</Badge>
                </div>
                <h3 style={{ fontSize: '15px', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>{item.title || item.key}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'monospace' }}>key: {item.key}</p>
                <p style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {item.content}
                </p>
              </Card>
            ))}
          </div>
        )
      }

      <Modal open={modal} onClose={() => setModal(false)} title="CMS Content">
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormGrid>
            <Field label="Key (unique)" name="key" value={form.key} onChange={handle} placeholder="homepage_hero" required />
            <Select label="Type" name="type" value={form.type} onChange={handle}
              options={[{ value: 'page', label: 'Page' }, { value: 'banner', label: 'Banner' }, { value: 'faq', label: 'FAQ' }, { value: 'feature', label: 'Feature' }]} />
          </FormGrid>
          <Field label="Title" name="title" value={form.title} onChange={handle} placeholder="Page title" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)' }}>Content</label>
            <textarea name="content" value={form.content} onChange={handle} placeholder="Page or banner content..." rows={5} style={{ resize: 'vertical' }} />
          </div>
          <FormActions>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn type="submit" loading={saving} icon={<Save size={15} />}>Save Content</Btn>
          </FormActions>
        </form>
      </Modal>
    </div>
  )
}

// ── Sub Admin Page
export function SubAdminPage() {
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', permissions: { viewRestaurants: true, manageSubscriptions: false, manageCMS: false, sendBulkMail: false, verifyKYC: true } })
  const [saving, setSaving] = useState(false)
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const handlePerm = e => setForm(p => ({ ...p, permissions: { ...p.permissions, [e.target.name]: e.target.checked } }))

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await createSubAdmin(form)
      toast.success('Sub admin created!')
      setModal(false)
      setForm({ name: '', email: '', password: '', permissions: { viewRestaurants: true, manageSubscriptions: false, manageCMS: false, sendBulkMail: false, verifyKYC: true } })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Sub Admins" subtitle="Create and manage platform sub-admins"
        action={<Btn onClick={() => setModal(true)} icon={<UserPlus size={15} />}>Add Sub Admin</Btn>} />

      <Alert type="info" message="Sub admins can only access features you grant them. Super admin has full access." />

      <Modal open={modal} onClose={() => setModal(false)} title="Create Sub Admin">
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Full Name" name="name" value={form.name} onChange={handle} required />
          <FormGrid>
            <Field label="Email" name="email" type="email" value={form.email} onChange={handle} required />
            <Field label="Password" name="password" type="password" value={form.password} onChange={handle} required />
          </FormGrid>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: '10px' }}>Permissions</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { name: 'viewRestaurants', label: '👁️ View Restaurants' },
                { name: 'verifyKYC', label: '✅ Verify KYC' },
                { name: 'manageSubscriptions', label: '💳 Manage Subscriptions' },
                { name: 'manageCMS', label: '📝 Manage CMS' },
                { name: 'sendBulkMail', label: '📧 Send Bulk Mail' },
              ].map(p => (
                <label key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', background: form.permissions[p.name] ? 'var(--accent-dim)' : 'var(--bg3)' }}>
                  <input type="checkbox" name={p.name} checked={form.permissions[p.name]} onChange={handlePerm} style={{ width: 'auto' }} />
                  {p.label}
                </label>
              ))}
            </div>
          </div>

          <FormActions>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn type="submit" loading={saving}>Create Sub Admin</Btn>
          </FormActions>
        </form>
      </Modal>
    </div>
  )
}

// ── Bulk Mail Page
export function BulkMailPage() {
  const [form, setForm] = useState({ subject: '', html: '', targets: 'all' })
  const [sending, setSending] = useState(false)
  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const send = async (e) => {
    e.preventDefault()
    if (!confirm(`Send mail to ${form.targets === 'all' ? 'ALL restaurants' : 'selected restaurants'}?`)) return
    setSending(true)
    try {
      const res = await sendBulkMail(form)
      toast.success(`Mail sent to ${res.data.data.sent} restaurants!`)
      setForm({ subject: '', html: '', targets: 'all' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send') }
    finally { setSending(false) }
  }

  return (
    <div className="fade-in">
      <PageHeader title="Bulk Mail" subtitle="Send notifications to all or selected restaurants" />

      <div style={{ maxWidth: '640px' }}>
        <Card>
          <form onSubmit={send} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Alert type="warning" message="This will send real emails to restaurant admins. Double check before sending." />

            <Select label="Send To" name="targets" value={form.targets} onChange={handle}
              options={[{ value: 'all', label: '📢 All Restaurants' }]} />

            <Field label="Subject" name="subject" value={form.subject} onChange={handle} placeholder="New feature announcement!" required />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text2)' }}>Message (HTML supported) <span style={{ color: 'var(--accent)' }}>*</span></label>
              <textarea name="html" value={form.html} onChange={handle} required rows={8}
                placeholder={"<h2>Hello!</h2>\n<p>We have a new feature...</p>"}
                style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }} />
            </div>

            {/* Preview */}
            {form.html && (
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>Preview:</p>
                <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', color: '#333', fontSize: '14px' }}
                  dangerouslySetInnerHTML={{ __html: form.html }} />
              </div>
            )}

            <Btn type="submit" loading={sending} icon={<Send size={15} />} size="lg">
              Send Bulk Mail
            </Btn>
          </form>
        </Card>
      </div>
    </div>
  )
}
