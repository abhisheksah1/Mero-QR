import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getTables, createTable, regenerateQR } from '../../services/api'

export default function TablesPage() {
  const { user } = useAuth()
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [tableNum, setTableNum] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [viewQR, setViewQR] = useState(null)
  const [copied, setCopied] = useState('')

  const restaurantId = user?._id || user?.id

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await getTables()
      setTables(res.data.data || [])
    } catch (e) {
      alert('Failed to load tables')
    } finally { setLoading(false) }
  }

  const getTestUrl = (table) => {
    // Build the menu URL with both required params
    return `http://localhost:3000/order?table=${table.qrToken}&restaurant=${restaurantId}`
  }

  const create = async (e) => {
    e.preventDefault()
    if (!tableNum.trim()) return
    setCreating(true)
    try {
      await createTable({ tableNumber: tableNum.trim() })
      setTableNum('')
      setShowForm(false)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create table')
    } finally { setCreating(false) }
  }

  const regen = async (id) => {
    if (!confirm('Regenerate QR? The old QR will stop working.')) return
    try {
      await regenerateQR(id)
      load()
      if (viewQR?._id === id) {
        const updated = tables.find(t => t._id === id)
        setViewQR(updated)
      }
    } catch { alert('Failed to regenerate') }
  }

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  const downloadQR = (qrCode, tableNumber) => {
    const a = document.createElement('a')
    a.download = `table-${tableNumber}-qr.png`
    a.href = qrCode
    a.click()
  }

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .tbl-card:hover { border-color: #4361ee !important; box-shadow: 0 4px 20px rgba(67,97,238,.1) !important; }
        .copy-btn:hover { background: #4361ee !important; color: #fff !important; }
        .action-btn:hover { background: #f0f4ff !important; color: #4361ee !important; border-color: #4361ee !important; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform:rotate(360deg) } }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Tables & QR Codes</h1>
          <p style={styles.subtitle}>{tables.length} tables · Customers scan QR to order</p>
        </div>
        <button onClick={() => setShowForm(true)} style={styles.addBtn}>
          + Add Table
        </button>
      </div>

      {/* HOW TO TEST BOX */}
      <div style={styles.testBox}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '28px', flexShrink: 0 }}>🧪</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
              How to Test QR Ordering on Localhost
            </div>
            <div style={{ fontSize: '13px', color: '#3b82f6', lineHeight: 1.6 }}>
              <strong>Option 1:</strong> Click the <span style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>🔗 Test in Browser</span> button on any table below — opens the menu directly in a new tab.<br />
              <strong>Option 2:</strong> Copy the URL and open it in any browser or mobile browser on the same WiFi network.<br />
              <strong>Option 3:</strong> Print or display the QR code — scan with phone camera when on same WiFi.
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant ID info */}
      <div style={styles.idBox}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Your Restaurant ID (needed for manual URL testing)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <code style={{ fontSize: '13px', fontFamily: 'monospace', color: '#1a1f2e', fontWeight: 600, background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>
            {restaurantId || 'Login again to get ID'}
          </code>
          <button onClick={() => copyUrl(restaurantId, 'restoId')} className="copy-btn"
            style={{ ...styles.smallBtn, background: copied === 'restoId' ? '#22c55e' : '#fff', color: copied === 'restoId' ? '#fff' : '#64748b' }}>
            {copied === 'restoId' ? '✓ Copied' : 'Copy ID'}
          </button>
        </div>
      </div>

      {/* Table Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#4361ee', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        </div>
      ) : tables.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>🪑</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a1f2e', marginBottom: '6px' }}>No tables yet</div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>Create your first table to generate a QR code</div>
          <button onClick={() => setShowForm(true)} style={styles.addBtn}>+ Create First Table</button>
        </div>
      ) : (
        <div style={styles.grid}>
          {tables.map((table, i) => {
            const testUrl = getTestUrl(table)
            return (
              <div key={table._id} className="tbl-card"
                style={{ ...styles.card, animationDelay: `${i * 0.06}s` }}>

                {/* Card header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#1a1f2e' }}>Table {table.tableNumber}</div>
                    <div style={styles.activeBadge}>● Active</div>
                  </div>
                  <div style={{ fontSize: '32px' }}>🪑</div>
                </div>

                {/* QR Code preview */}
                {table.qrCode ? (
                  <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'inline-block', padding: '10px', background: '#fff', borderRadius: '12px', border: '2px solid #f1f5f9', cursor: 'pointer' }}
                      onClick={() => setViewQR(table)}>
                      <img src={table.qrCode} alt={`QR Table ${table.tableNumber}`}
                        style={{ width: '110px', height: '110px', display: 'block' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Tap QR to view full size</div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontSize: '13px' }}>No QR yet</div>
                )}

                {/* Test URL */}
                <div style={styles.urlBox}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Menu URL</div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.5 }}>
                    {testUrl}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  {/* Primary: Test in browser */}
                  <a href={testUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '10px', background: '#4361ee', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}>
                    🔗 Test in Browser (New Tab)
                  </a>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Copy URL */}
                    <button className="copy-btn" onClick={() => copyUrl(testUrl, table._id)}
                      style={{ ...styles.actionBtn, flex: 1, background: copied === table._id ? '#22c55e' : '#fff', color: copied === table._id ? '#fff' : '#64748b', borderColor: copied === table._id ? '#22c55e' : '#e2e8f0' }}>
                      {copied === table._id ? '✓ Copied!' : '📋 Copy URL'}
                    </button>

                    {/* Download QR */}
                    {table.qrCode && (
                      <button className="action-btn" onClick={() => downloadQR(table.qrCode, table.tableNumber)}
                        style={styles.actionBtn}>
                        💾 Save QR
                      </button>
                    )}

                    {/* Regen */}
                    <button className="action-btn" onClick={() => regen(table._id)}
                      style={styles.actionBtn}>
                      🔄
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Table Modal */}
      {showForm && (
        <div style={styles.overlay} onClick={() => setShowForm(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1f2e' }}>Create New Table</h3>
              <button onClick={() => setShowForm(false)} style={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={create} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={styles.label}>Table Number / Name</label>
                <input value={tableNum} onChange={e => setTableNum(e.target.value)}
                  placeholder="e.g. T1, T2, VIP-1, Rooftop-3"
                  autoFocus required
                  style={styles.input} />
              </div>
              <div style={styles.hint}>
                💡 A QR code will be automatically generated. The URL will be:<br />
                <code style={{ fontSize: '11px', color: '#4361ee', wordBreak: 'break-all' }}>
                  http://localhost:3000/order?table=[token]&restaurant={restaurantId}
                </code>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={creating} style={styles.submitBtn}>
                  {creating ? 'Creating...' : 'Create Table + Generate QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Full View Modal */}
      {viewQR && (
        <div style={styles.overlay} onClick={() => setViewQR(null)}>
          <div style={{ ...styles.modal, maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1a1f2e' }}>Table {viewQR.tableNumber} — QR Code</h3>
              <button onClick={() => setViewQR(null)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              {/* Big QR */}
              <div style={{ display: 'inline-block', padding: '16px', background: '#fff', borderRadius: '16px', border: '2px solid #f1f5f9', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0,0,0,.08)' }}>
                <img src={viewQR.qrCode} alt="QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
              </div>

              {/* URL */}
              <div style={{ ...styles.urlBox, marginBottom: '16px', textAlign: 'left' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Menu URL</div>
                <div style={{ fontSize: '11px', color: '#4361ee', fontFamily: 'monospace', wordBreak: 'break-all', fontWeight: 500 }}>
                  {getTestUrl(viewQR)}
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', lineHeight: 1.6 }}>
                Customer scans this QR → sees menu → places order → kitchen gets notified in real time
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href={getTestUrl(viewQR)} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', padding: '11px', background: '#4361ee', color: '#fff', borderRadius: '10px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>
                  🔗 Test in Browser
                </a>
                <button onClick={() => downloadQR(viewQR.qrCode, viewQR.tableNumber)}
                  style={{ padding: '11px', background: '#fff', color: '#475569', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  💾 Download QR Code (PNG)
                </button>
                <button onClick={() => { copyUrl(getTestUrl(viewQR), 'modal'); }}
                  style={{ padding: '11px', background: '#f8fafc', color: '#475569', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {copied === 'modal' ? '✓ URL Copied!' : '📋 Copy URL'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", padding: '0', display: 'flex', flexDirection: 'column', gap: '20px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' },
  title: { fontSize: '22px', fontWeight: 800, color: '#1a1f2e', letterSpacing: '-.4px', marginBottom: '2px' },
  subtitle: { fontSize: '13px', color: '#64748b' },
  addBtn: { padding: '10px 20px', background: '#4361ee', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  testBox: { background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: '14px', padding: '16px 20px' },
  idBox: { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px' },
  smallBtn: { padding: '4px 12px', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .18s' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '16px' },
  card: { background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '18px', boxShadow: '0 1px 4px rgba(0,0,0,.05)', transition: 'all .2s', animation: 'fadeUp .35s ease both' },
  activeBadge: { fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: '3px' },
  urlBox: { background: '#f8fafc', borderRadius: '8px', padding: '10px 12px', border: '1px solid #f1f5f9' },
  actionBtn: { padding: '8px 12px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '9px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .18s', flex: 1 },
  empty: { textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1.5px solid #e2e8f0' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto', animation: 'fadeUp .2s ease' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #f1f5f9' },
  closeBtn: { width: '30px', height: '30px', background: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', color: '#1a1f2e', background: '#fff' },
  hint: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 14px', fontSize: '12.5px', color: '#3b82f6', lineHeight: 1.6 },
  cancelBtn: { padding: '9px 18px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#64748b' },
  submitBtn: { padding: '9px 20px', background: '#4361ee', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
}
