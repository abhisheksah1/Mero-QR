import { useState, useEffect } from 'react'
import { getOrders, processPayment, getTransactions } from '../../services/api'
import { Card, Btn, Badge, PageHeader, Modal, Select, FormActions, Spinner, Table, Empty } from '../../components/common/UI'
import { CreditCard, DollarSign, Receipt, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CashierPage() {
  const [unpaid, setUnpaid] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [payModal, setPayModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [payMethod, setPayMethod] = useState('cash')
  const [paying, setPaying] = useState(false)
  const [tab, setTab] = useState('orders')

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const [ordersRes, txRes] = await Promise.allSettled([
        getOrders('ready'), getTransactions()
      ])
      if (ordersRes.status === 'fulfilled') setUnpaid((ordersRes.value.data.data || []).filter(o => !o.isPaid))
      if (txRes.status === 'fulfilled') setTransactions(txRes.value.data.data || [])
    } finally { setLoading(false) }
  }

  const openPay = (order) => { setSelectedOrder(order); setPayModal(true) }

  const pay = async () => {
    setPaying(true)
    try {
      const res = await processPayment({ orderId: selectedOrder._id, paymentMethod: payMethod })
      toast.success(`Payment processed! Receipt: ${res.data.data.receiptNo}`)
      setPayModal(false); setSelectedOrder(null)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed') }
    finally { setPaying(false) }
  }

  const todayRevenue = transactions
    .filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString())
    .reduce((s, t) => s + (t.amount || 0), 0)

  if (loading) return <Spinner />

  return (
    <div className="fade-in">
      <PageHeader title="Cashier" subtitle="Process payments and view transactions" />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>Pending Bills</p>
          <p style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--yellow)' }}>{unpaid.length}</p>
        </Card>
        <Card>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>Today's Revenue</p>
          <p style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--green)' }}>Rs. {todayRevenue.toLocaleString()}</p>
        </Card>
        <Card>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>Total Transactions</p>
          <p style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent)' }}>{transactions.length}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--bg3)', borderRadius: '8px', padding: '4px', width: 'fit-content', marginBottom: '20px' }}>
        {[{ id: 'orders', label: `Pending Bills (${unpaid.length})` }, { id: 'tx', label: 'Transactions' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '7px 16px', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            background: tab === t.id ? 'var(--card)' : 'transparent',
            color: tab === t.id ? 'var(--text)' : 'var(--text3)',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'orders' ? (
        unpaid.length === 0
          ? <Empty icon="✅" title="No pending bills" desc="All tables are settled." />
          : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {unpaid.map(order => (
                <Card key={order._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)' }}>Table {order.table?.tableNumber || '?'}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text3)' }}>{new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <Badge color="yellow">Unpaid</Badge>
                  </div>

                  <div style={{ background: 'var(--bg3)', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '3px 0' }}>
                        <span>{item.quantity}× {item.name}</span>
                        <span>Rs. {item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Total</span>
                      <span style={{ color: 'var(--accent)' }}>Rs. {order.totalAmount}</span>
                    </div>
                  </div>

                  <Btn fullWidth icon={<CreditCard size={15} />} onClick={() => openPay(order)}>
                    Collect Payment
                  </Btn>
                </Card>
              ))}
            </div>
          )
      ) : (
        <Card style={{ padding: 0 }}>
          <Table
            headers={['Receipt No', 'Amount', 'Method', 'Order', 'Time']}
            empty="No transactions yet"
            rows={transactions.map(t => [
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: 'var(--accent)' }}>{t.receiptNo}</span>,
              <span style={{ fontWeight: 600, color: 'var(--green)' }}>Rs. {t.amount}</span>,
              <Badge color={t.paymentMethod === 'cash' ? 'green' : t.paymentMethod === 'card' ? 'blue' : 'purple'}>{t.paymentMethod}</Badge>,
              <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{t.order?._id?.slice(-6)}</span>,
              <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{new Date(t.createdAt).toLocaleString()}</span>,
            ])}
          />
        </Card>
      )}

      {/* Payment Modal */}
      <Modal open={payModal} onClose={() => setPayModal(false)} title="Process Payment" width="380px">
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--bg3)', borderRadius: '10px', padding: '16px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '8px' }}>Table {selectedOrder.table?.tableNumber}</p>
              {selectedOrder.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '4px 0' }}>
                  <span>{item.quantity}× {item.name}</span>
                  <span>Rs. {item.price * item.quantity}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px' }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>Rs. {selectedOrder.totalAmount}</span>
              </div>
            </div>

            <Select
              label="Payment Method"
              value={payMethod}
              onChange={e => setPayMethod(e.target.value)}
              options={[
                { value: 'cash', label: '💵 Cash' },
                { value: 'card', label: '💳 Card' },
                { value: 'online', label: '📱 Online / QR Pay' },
              ]}
            />

            <FormActions>
              <Btn variant="ghost" onClick={() => setPayModal(false)}>Cancel</Btn>
              <Btn loading={paying} icon={<CheckCircle size={15} />} onClick={pay}>Confirm Payment</Btn>
            </FormActions>
          </div>
        )}
      </Modal>
    </div>
  )
}
