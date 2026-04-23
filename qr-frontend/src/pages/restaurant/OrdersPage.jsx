import { useState, useEffect, useRef } from 'react'
import { getOrders, updateOrderStatus } from '../../services/api'
import { Card, Btn, Badge, PageHeader, Spinner, Select } from '../../components/common/UI'
import { RefreshCw, Clock, ChefHat, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import io from 'socket.io-client'
import { useAuth } from '../../context/AuthContext'

const STATUS_FLOW = ['pending', 'preparing', 'ready', 'served']
const statusColor = s => ({ pending:'yellow', preparing:'blue', ready:'orange', served:'green', cancelled:'red' }[s] || 'default')
const statusIcon = s => ({ pending: <Clock size={14} />, preparing: <ChefHat size={14} />, ready: <CheckCircle size={14} />, served: <CheckCircle size={14} />, cancelled: <XCircle size={14} /> }[s])

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const socketRef = useRef(null)

  useEffect(() => {
    load()
    setupSocket()
    return () => socketRef.current?.disconnect()
  }, [])

  const setupSocket = () => {
    const socket = io('http://localhost:5000', { auth: { token: localStorage.getItem('token') } })
    socketRef.current = socket
    socket.emit('join:restaurant', user?._id || user?.id)
    socket.on('order:new', (order) => {
      toast.success(`New order from Table ${order.table?.tableNumber || '?'}! 🔔`, { duration: 5000 })
      setOrders(prev => [order, ...prev])
    })
    socket.on('order:updated', (updated) => {
      setOrders(prev => prev.map(o => o._id === updated._id ? updated : o))
    })
  }

  const load = async () => {
    try {
      const res = await getOrders(filter || undefined)
      setOrders(res.data.data || [])
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }

  useEffect(() => { setLoading(true); load() }, [filter])

  const nextStatus = async (order) => {
    const idx = STATUS_FLOW.indexOf(order.status)
    if (idx === -1 || idx === STATUS_FLOW.length - 1) return
    const next = STATUS_FLOW[idx + 1]
    try {
      await updateOrderStatus(order._id, { status: next })
      toast.success(`Order marked as ${next}`)
      load()
    } catch { toast.error('Failed to update') }
  }

  const cancel = async (id) => {
    if (!confirm('Cancel this order?')) return
    try { await updateOrderStatus(id, { status: 'cancelled' }); toast.success('Cancelled'); load() }
    catch { toast.error('Failed') }
  }

  const filtered = orders.filter(o => !filter || o.status === filter)

  const counts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc }, {})

  return (
    <div className="fade-in">
      <PageHeader
        title="Orders"
        subtitle="Real-time order management"
        action={<Btn variant="ghost" icon={<RefreshCw size={15} />} onClick={load}>Refresh</Btn>}
      />

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[{ value: '', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'preparing', label: 'Preparing' }, { value: 'ready', label: 'Ready' }, { value: 'served', label: 'Served' }, { value: 'cancelled', label: 'Cancelled' }].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} style={{
            padding: '6px 14px', borderRadius: '100px', border: '1.5px solid', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
            borderColor: filter === f.value ? 'var(--accent)' : 'var(--border)',
            background: filter === f.value ? 'var(--accent-dim)' : 'transparent',
            color: filter === f.value ? 'var(--accent)' : 'var(--text3)',
            fontWeight: filter === f.value ? 600 : 400,
          }}>
            {f.label} {f.value && counts[f.value] ? `(${counts[f.value]})` : ''}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0
        ? <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text3)' }}>No orders {filter ? `with status "${filter}"` : 'yet'}</div>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filtered.map(order => (
              <Card key={order._id}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)' }}>Table {order.table?.tableNumber || '?'}</h3>
                      <Badge color={statusColor(order.status)}>
                        {statusIcon(order.status)} {order.status}
                      </Badge>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text3)' }}>{new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>Rs. {order.totalAmount}</p>
                    <Badge color={order.isPaid ? 'green' : 'default'}>{order.isPaid ? 'Paid' : 'Unpaid'}</Badge>
                  </div>
                </div>

                {/* Items */}
                <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '3px 0' }}>
                      <span>{item.quantity}× {item.name}</span>
                      <span style={{ color: 'var(--text3)' }}>Rs. {item.price * item.quantity}</span>
                    </div>
                  ))}
                  {order.note && <p style={{ fontSize: '12px', color: 'var(--yellow)', marginTop: '6px', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>📝 {order.note}</p>}
                </div>

                {/* Actions */}
                {order.status !== 'served' && order.status !== 'cancelled' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Btn size="sm" fullWidth onClick={() => nextStatus(order)}>
                      → Mark {STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]}
                    </Btn>
                    <Btn size="sm" variant="danger" onClick={() => cancel(order._id)}>Cancel</Btn>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )
      }
    </div>
  )
}
