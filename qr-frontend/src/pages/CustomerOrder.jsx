import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPublicMenu, placeOrder } from '../services/api'

export default function CustomerOrder() {
  const [params] = useSearchParams()
  const qrToken = params.get('table')
  const restaurantId = params.get('restaurant')

  const [menu, setMenu] = useState([])
  const [restaurantName, setRestaurantName] = useState('Restaurant')
  const [cart, setCart] = useState([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const [ordered, setOrdered] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!restaurantId || !qrToken) { setLoading(false); return }
    getPublicMenu(restaurantId)
      .then(r => {
        const data = r.data.data || []
        setMenu(data)
        if (data.length > 0) setActiveCategory(data[0]._id)
      })
      .catch(() => setError('Failed to load menu. Please scan the QR again.'))
      .finally(() => setLoading(false))
  }, [restaurantId, qrToken])

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(c => c.menuItem === item._id)
      if (ex) return prev.map(c => c.menuItem === item._id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { menuItem: item._id, name: item.name, price: item.price, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => {
      const ex = prev.find(c => c.menuItem === id)
      if (ex?.quantity <= 1) return prev.filter(c => c.menuItem !== id)
      return prev.map(c => c.menuItem === id ? { ...c, quantity: c.quantity - 1 } : c)
    })
  }

  const getQty = (id) => cart.find(c => c.menuItem === id)?.quantity || 0
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0)

  const filteredMenu = menu.map(cat => ({
    ...cat,
    items: (cat.items || []).filter(i => i.isAvailable && i.name.toLowerCase().includes(search.toLowerCase()))
  })).filter(cat => cat.items.length > 0)

  const submitOrder = async () => {
    if (cart.length === 0) return
    setOrdering(true)
    try {
      await placeOrder({ qrToken, items: cart, note })
      setOrdered(true)
      setCart([])
      setCartOpen(false)
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed. Please try again.')
    } finally { setOrdering(false) }
  }

  // ── Invalid QR
  if (!qrToken || !restaurantId) return (
    <Screen>
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1f2e', marginBottom: '8px' }}>Invalid QR Code</h2>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Please scan the table QR code to view the menu and place orders.</p>
      </div>
    </Screen>
  )

  // ── Loading
  if (loading) return (
    <Screen>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#4361ee', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading menu...</p>
      </div>
    </Screen>
  )

  // ── Error
  if (error) return (
    <Screen>
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1f2e', marginBottom: '8px' }}>Oops!</h2>
        <p style={{ color: '#64748b', fontSize: '14px' }}>{error}</p>
      </div>
    </Screen>
  )

  // ── Order Success
  if (ordered) return (
    <Screen>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '24px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '20px', animation: 'popIn .4s ease' }}>
          ✅
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#1a1f2e', marginBottom: '8px', letterSpacing: '-.5px' }}>Order Placed!</h1>
        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '28px', lineHeight: 1.6 }}>
          Your order has been sent to the kitchen.<br />We'll serve you shortly! 🍽️
        </p>
        <div style={{ background: '#f0fdf4', border: '1px solid rgba(34,197,94,.2)', borderRadius: '14px', padding: '16px 24px', marginBottom: '24px', fontSize: '14px', color: '#16a34a', fontWeight: 500 }}>
          ✓ Kitchen has been notified
        </div>
        <button onClick={() => { setOrdered(false); setNote('') }}
          style={{ padding: '12px 28px', background: '#4361ee', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Order More Items
        </button>
      </div>
    </Screen>
  )

  // ── Main Menu Page
  return (
    <Screen>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
        <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: '#4361ee', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📲</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1a1f2e' }}>Mero QR Menu</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Scan & Order</div>
            </div>
          </div>
          {totalItems > 0 && (
            <button onClick={() => setCartOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', background: '#4361ee', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(67,97,238,.35)', position: 'relative' }}>
              🛒 {totalItems} item{totalItems > 1 ? 's' : ''}
              <span style={{ background: '#fff', color: '#4361ee', borderRadius: '20px', padding: '1px 8px', fontSize: '12px', fontWeight: 700 }}>Rs. {total.toLocaleString()}</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div style={{ padding: '10px 16px 12px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search menu items..."
            style={{ width: '100%', padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13.5px', outline: 'none', fontFamily: 'inherit', background: '#f8fafc', color: '#1a1f2e' }} />
        </div>

        {/* Category Tabs */}
        {!search && (
          <div style={{ display: 'flex', gap: '6px', padding: '0 16px 12px', overflowX: 'auto' }}>
            {menu.map(cat => (
              <button key={cat._id} onClick={() => {
                setActiveCategory(cat._id)
                document.getElementById(`cat-${cat._id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
                style={{ padding: '6px 14px', borderRadius: '20px', border: '1.5px solid', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .18s', fontFamily: 'inherit',
                  borderColor: activeCategory === cat._id ? '#4361ee' : '#e2e8f0',
                  background: activeCategory === cat._id ? '#4361ee' : '#fff',
                  color: activeCategory === cat._id ? '#fff' : '#64748b',
                }}>
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu items */}
      <div style={{ padding: '16px', paddingBottom: totalItems > 0 ? '100px' : '16px' }}>
        {filteredMenu.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94a3b8' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
            <p style={{ fontSize: '15px' }}>{search ? `No items found for "${search}"` : 'Menu is not available right now'}</p>
          </div>
        ) : filteredMenu.map(category => (
          <div key={category._id} id={`cat-${category._id}`} style={{ marginBottom: '28px' }}>
            {/* Category header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#1a1f2e', letterSpacing: '-.3px' }}>{category.name}</h2>
              <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{category.items.length} items</span>
            </div>

            {/* Items grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {category.items.map(item => {
                const qty = getQty(item._id)
                return (
                  <div key={item._id}
                    style={{ background: '#fff', border: `1.5px solid ${qty > 0 ? '#4361ee30' : '#f1f5f9'}`, borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all .18s', boxShadow: qty > 0 ? '0 0 0 3px rgba(67,97,238,.08)' : 'none' }}>
                    {/* Emoji */}
                    <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#f0f2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', flexShrink: 0 }}>
                      {foodEmoji(item.name)}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1f2e', marginBottom: '2px' }}>{item.name}</div>
                      {item.description && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#4361ee' }}>Rs. {item.price}</span>
                        {item.taxPercent > 0 && <span style={{ fontSize: '10px', color: '#94a3b8' }}>+{item.taxPercent}% tax</span>}
                      </div>
                    </div>
                    {/* Add/Remove */}
                    <div style={{ flexShrink: 0 }}>
                      {qty === 0 ? (
                        <button onClick={() => addToCart(item)}
                          style={{ width: '36px', height: '36px', background: '#4361ee', border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 300, boxShadow: '0 4px 12px rgba(67,97,238,.3)' }}>
                          +
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => removeFromCart(item._id)}
                            style={{ width: '32px', height: '32px', background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRadius: '8px', color: '#1a1f2e', cursor: 'pointer', fontSize: '18px', fontWeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            −
                          </button>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#4361ee', minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                          <button onClick={() => addToCart(item)}
                            style={{ width: '32px', height: '32px', background: '#4361ee', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '18px', fontWeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating cart button */}
      {totalItems > 0 && !cartOpen && (
        <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 200, width: 'calc(100% - 32px)', maxWidth: '500px' }}>
          <button onClick={() => setCartOpen(true)}
            style={{ width: '100%', padding: '14px 20px', background: '#4361ee', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(67,97,238,.4)' }}>
            <span>🛒 {totalItems} item{totalItems > 1 ? 's' : ''}</span>
            <span>View Cart · Rs. {total.toLocaleString()}</span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
          {/* Overlay */}
          <div onClick={() => setCartOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }} />
          {/* Drawer */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '88vh', overflowY: 'auto', animation: 'slideUp .3s ease' }}>
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: '40px', height: '4px', background: '#e2e8f0', borderRadius: '2px' }} />
            </div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1a1f2e' }}>Your Order</h2>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{totalItems} item{totalItems > 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => setCartOpen(false)}
                style={{ width: '32px', height: '32px', background: '#f1f5f9', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Cart items */}
              {cart.map(item => (
                <div key={item.menuItem} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px' }}>
                  <div style={{ width: '44px', height: '44px', background: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                    {foodEmoji(item.name)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1f2e' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Rs. {item.price} × {item.quantity}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => removeFromCart(item.menuItem)}
                      style={{ width: '28px', height: '28px', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      −
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#4361ee', minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => addToCart({ _id: item.menuItem, name: item.name, price: item.price })}
                      style={{ width: '28px', height: '28px', background: '#4361ee', border: 'none', borderRadius: '7px', cursor: 'pointer', color: '#fff', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      +
                    </button>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1f2e', minWidth: '70px', textAlign: 'right' }}>
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}

              {/* Note */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>Special Instructions (optional)</label>
                <textarea value={note} onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Less spicy, no onions, extra sauce..."
                  rows={2}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '13.5px', fontFamily: 'inherit', outline: 'none', resize: 'none', color: '#1a1f2e', background: '#f8fafc' }} />
              </div>

              {/* Bill summary */}
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                  <span>Subtotal ({totalItems} items)</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#1a1f2e', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                  <span>Total</span>
                  <span style={{ color: '#4361ee' }}>Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Place order */}
              <button onClick={submitOrder} disabled={ordering}
                style={{ width: '100%', padding: '15px', background: ordering ? '#94a3b8' : '#4361ee', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: ordering ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: ordering ? 'none' : '0 8px 24px rgba(67,97,238,.35)', marginBottom: '8px', transition: 'all .2s' }}>
                {ordering ? (
                  <><div style={{ width: '18px', height: '18px', border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} /> Placing Order...</>
                ) : (
                  <>✓ Place Order · Rs. {total.toLocaleString()}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #f8fafc; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes popIn { from { transform: scale(0.5); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
        input::placeholder { color: #94a3b8; }
        textarea::placeholder { color: #94a3b8; }
      `}</style>
    </Screen>
  )
}

function Screen({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', maxWidth: '600px', margin: '0 auto', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", position: 'relative' }}>
      {children}
    </div>
  )
}

function foodEmoji(n = '') {
  const l = n.toLowerCase()
  if (l.includes('burger')) return '🍔'
  if (l.includes('pizza')) return '🍕'
  if (l.includes('momo') || l.includes('dumpling')) return '🥟'
  if (l.includes('coffee') || l.includes('tea') || l.includes('chai')) return '☕'
  if (l.includes('fries') || l.includes('chips')) return '🍟'
  if (l.includes('chicken')) return '🍗'
  if (l.includes('rice') || l.includes('dal') || l.includes('curry')) return '🍛'
  if (l.includes('noodle') || l.includes('pasta') || l.includes('chowmein')) return '🍜'
  if (l.includes('cake') || l.includes('dessert') || l.includes('sweet')) return '🍰'
  if (l.includes('juice') || l.includes('drink') || l.includes('lassi')) return '🥤'
  if (l.includes('soup')) return '🍲'
  if (l.includes('sandwich') || l.includes('wrap')) return '🥙'
  if (l.includes('paneer')) return '🧀'
  if (l.includes('fish') || l.includes('seafood')) return '🐟'
  if (l.includes('egg')) return '🍳'
  if (l.includes('salad')) return '🥗'
  return '🍽️'
}