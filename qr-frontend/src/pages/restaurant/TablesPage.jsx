import { useState, useEffect } from 'react'
import { getTables, createTable, regenerateQR } from '../../services/api'
import { Card, Btn, Field, Modal, Badge, PageHeader, FormActions, Empty, Spinner } from '../../components/common/UI'
import { Plus, RefreshCw, Download, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TablesPage() {
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [tableNum, setTableNum] = useState('')
  const [saving, setSaving] = useState(false)
  const [qrView, setQrView] = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await getTables()
      setTables(res.data.data || [])
    } catch { toast.error('Failed to load tables') }
    finally { setLoading(false) }
  }

  const save = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await createTable({ tableNumber: tableNum })
      toast.success('Table created with QR code!')
      setModal(false); setTableNum('')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const regen = async (id) => {
    if (!confirm('Regenerate QR? Old QR code will stop working.')) return
    try {
      await regenerateQR(id)
      toast.success('QR regenerated!')
      load()
    } catch { toast.error('Failed') }
  }

  const downloadQR = (qrCode, tableNumber) => {
    const link = document.createElement('a')
    link.download = `table-${tableNumber}-qr.png`
    link.href = qrCode
    link.click()
  }

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <PageHeader
        title="Tables & QR Codes"
        subtitle={`${tables.length} tables configured`}
        action={<Btn onClick={() => setModal(true)} icon={<Plus size={15} />}>Add Table</Btn>}
      />

      {tables.length === 0
        ? <Empty icon="🪑" title="No tables yet" desc="Create tables to generate QR codes for customers." action={<Btn onClick={() => setModal(true)}>Create Table</Btn>} />
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {tables.map(table => (
              <Card key={table._id} style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '12px' }}>
                  <Badge color={table.isActive ? 'green' : 'red'}>{table.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>

                <div style={{ width: '48px', height: '48px', background: 'var(--accent-dim)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--accent)' }}>
                  <QrCode size={24} />
                </div>

                <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>Table {table.tableNumber}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '16px' }}>
                  ID: {table._id.slice(-6)}
                </p>

                {/* QR Preview */}
                {table.qrCode && (
                  <div style={{ margin: '0 auto 16px', padding: '10px', background: '#fff', borderRadius: '8px', width: 'fit-content', cursor: 'pointer' }}
                    onClick={() => setQrView(table)}>
                    <img src={table.qrCode} alt={`QR Table ${table.tableNumber}`} style={{ width: '120px', height: '120px', display: 'block' }} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <Btn size="sm" variant="ghost" icon={<RefreshCw size={13} />} onClick={() => regen(table._id)}>Regen</Btn>
                  {table.qrCode && (
                    <Btn size="sm" variant="secondary" icon={<Download size={13} />} onClick={() => downloadQR(table.qrCode, table.tableNumber)}>Save</Btn>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      }

      {/* Create Table Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Create New Table">
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field
            label="Table Number"
            value={tableNum}
            onChange={e => setTableNum(e.target.value)}
            placeholder="e.g. T1, T2, VIP-1"
            required
            hint="This will be displayed on the QR code"
          />
          <div style={{ padding: '12px', background: 'var(--accent-dim)', borderRadius: '8px', fontSize: '13px', color: 'var(--accent)' }}>
            💡 A unique QR code will be generated automatically for this table.
          </div>
          <FormActions>
            <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
            <Btn type="submit" loading={saving}>Create Table</Btn>
          </FormActions>
        </form>
      </Modal>

      {/* QR Full View Modal */}
      <Modal open={!!qrView} onClose={() => setQrView(null)} title={`Table ${qrView?.tableNumber} — QR Code`} width="360px">
        {qrView && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', display: 'inline-block', marginBottom: '16px' }}>
              <img src={qrView.qrCode} alt="QR Code" style={{ width: '200px', height: '200px' }} />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '16px' }}>
              Customer scans this QR to place orders from Table {qrView.tableNumber}
            </p>
            <Btn fullWidth icon={<Download size={15} />} onClick={() => downloadQR(qrView.qrCode, qrView.tableNumber)}>
              Download QR Code
            </Btn>
          </div>
        )}
      </Modal>
    </div>
  )
}
