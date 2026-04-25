import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getPublicMenu, placeOrder } from '../services/api'
import api from '../services/api'

const PAYMENT_METHODS = [
  { id: 'cash',   label: 'Cash',        emoji: '💵', desc: 'Pay at the counter' },
  { id: 'card',   label: 'Card / ATM',  emoji: '💳', desc: 'Debit or credit card' },
  { id: 'online', label: 'Online / QR', emoji: '📱', desc: 'eSewa, Khalti, IME Pay' },
]
const STATUS_STEPS = ['pending', 'preparing', 'ready', 'served']
const STATUS_INFO = {
  pending:   { label:'Order Received', emoji:'📋', color:'#eab308', bg:'#fefce8', desc:'Waiting to be confirmed by kitchen.' },
  preparing: { label:'Being Prepared', emoji:'👨‍🍳', color:'#8b5cf6', bg:'#f5f3ff', desc:'Our kitchen is preparing your order!' },
  ready:     { label:'Ready to Serve', emoji:'🔔', color:'#f97316', bg:'#fff7ed', desc:'Your order is ready! Staff will serve you shortly.' },
  served:    { label:'Served',         emoji:'✅', color:'#22c55e', bg:'#f0fdf4', desc:'Enjoy your meal! Thank you.' },
  cancelled: { label:'Cancelled',      emoji:'❌', color:'#ef4444', bg:'#fef2f2', desc:'This order has been cancelled.' },
}

export default function CustomerOrder() {
  const [params] = useSearchParams()
  const qrToken      = params.get('table')
  const restaurantId = params.get('restaurant')

  const [menu, setMenu]                     = useState([])
  const [restaurantName, setRestaurantName] = useState('Restaurant')
  const [tableNumber, setTableNumber]       = useState('')
  const [cart, setCart]                     = useState([])
  const [note, setNote]                     = useState('')
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState('')
  const [screen, setScreen]                 = useState('menu')
  const [ordering, setOrdering]             = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [search, setSearch]                 = useState('')
  const [orderId, setOrderId]               = useState(null)
  const [orderData, setOrderData]           = useState(null)
  const [payMethod, setPayMethod]           = useState('cash')
  const [socket, setSocket]                 = useState(null)
  const [filterOption, setFilterOption]     = useState('all')
  const pollRef                             = useRef(null)
  const socketRef                           = useRef(null)

  // Load stored order from localStorage on mount
  useEffect(() => {
    if (!qrToken || !restaurantId) return
    const storedOrderId = localStorage.getItem(`order_${qrToken}`)
    if (storedOrderId) {
      setOrderId(storedOrderId)
      setScreen('tracking')
      fetchOrderData(storedOrderId)
    }
  }, [qrToken, restaurantId])

  // Fetch order data once
  const fetchOrderData = async (id) => {
    try {
      const r = await api.get('/restaurant/orders/track/' + id)
      setOrderData(r.data.data)
    } catch (err) {
      console.error('Failed to fetch order', err)
    }
  }

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!orderId) return

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/order/${orderId}`
    const ws = new WebSocket(wsUrl)
    socketRef.current = ws

    ws.onopen = () => console.log('WebSocket connected for order', orderId)
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'ORDER_STATUS_UPDATE') {
          setOrderData(prev => prev ? { ...prev, status: data.status, isPaid: data.isPaid } : prev)
        }
      } catch (e) { console.error('WS message error', e) }
    }
    ws.onerror = (err) => console.error('WebSocket error', err)
    ws.onclose = () => console.log('WebSocket disconnected')

    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close()
      }
    }
  }, [orderId])

  // Fallback polling if WebSocket not available
  useEffect(() => {
    if (screen === 'tracking' && orderId && !socketRef.current) {
      const poll = async () => {
        try {
          const r = await api.get('/restaurant/orders/track/' + orderId)
          setOrderData(r.data.data)
        } catch {}
      }
      poll()
      pollRef.current = setInterval(poll, 5000)
    }
    return () => clearInterval(pollRef.current)
  }, [screen, orderId])

  // Initial data fetch
  useEffect(() => {
    if (!restaurantId || !qrToken) { setLoading(false); return }
    getPublicMenu(restaurantId)
      .then(r => {
        const data = r.data.data || []
        setMenu(data)
        if (data.length > 0) setActiveCategory(data[0]._id)
      })
      .catch(() => setError('Failed to load menu. Please scan QR again.'))
      .finally(() => setLoading(false))
    api.get('/restaurant/tables/by-token/' + qrToken).catch(() => null)
      .then(r => { if (r?.data?.data?.tableNumber) setTableNumber(r.data.data.tableNumber) })
    api.get('/restaurant/public/' + restaurantId).catch(() => null)
      .then(r => { if (r?.data?.data?.name) setRestaurantName(r.data.data.name) })
  }, [restaurantId, qrToken])

  // Save order to localStorage when created
  useEffect(() => {
    if (orderId && qrToken) {
      localStorage.setItem(`order_${qrToken}`, orderId)
    }
  }, [orderId, qrToken])

  const addToCart = (item) => setCart(prev => {
    const ex = prev.find(c => c.menuItem === item._id)
    if (ex) return prev.map(c => c.menuItem === item._id ? { ...c, quantity: c.quantity + 1 } : c)
    return [...prev, { menuItem: item._id, name: item.name, price: item.price, quantity: 1, image: item.image }]
  })
  const removeFromCart = (id) => setCart(prev => {
    const ex = prev.find(c => c.menuItem === id)
    if (ex?.quantity <= 1) return prev.filter(c => c.menuItem !== id)
    return prev.map(c => c.menuItem === id ? { ...c, quantity: c.quantity - 1 } : c)
  })
  const getQty     = (id) => cart.find(c => c.menuItem === id)?.quantity || 0
  const subtotal   = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const tax        = Math.round(subtotal * 0.05)
  const grandTotal = subtotal + tax
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0)

  const filteredMenu = menu.map(cat => ({
    ...cat,
    items: (cat.items || []).filter(i => {
      const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filterOption === 'all' ? true :
                           filterOption === 'veg' ? i.isVegetarian === true :
                           filterOption === 'non-veg' ? i.isVegetarian === false : true
      return i.isAvailable && matchesSearch && matchesFilter
    })
  })).filter(cat => cat.items.length > 0)

  const submitOrder = async () => {
    if (!cart.length) return
    setOrdering(true)
    try {
      const res = await placeOrder({ qrToken, items: cart, note, paymentMethod: payMethod })
      setOrderId(res.data.data._id)
      setOrderData(res.data.data)
      setCart([]); setNote('')
      setScreen('tracking')
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed.')
    } finally { setOrdering(false) }
  }

  // Clear stored order on new order
  const startNewOrder = () => {
    if (qrToken) localStorage.removeItem(`order_${qrToken}`)
    setOrderId(null)
    setOrderData(null)
    setCart([])
    setNote('')
    setScreen('menu')
  }

  if (!qrToken || !restaurantId) return <Page><Center><Big>❌</Big><H2>Invalid QR Code</H2><Muted>Scan the table QR to order.</Muted></Center><Styles /></Page>
  if (loading) return <Page><Center><Spin /><Muted style={{marginTop:14}}>Loading menu...</Muted></Center><Styles /></Page>
  if (error)   return <Page><Center><Big>⚠️</Big><H2>Oops!</H2><Muted>{error}</Muted></Center><Styles /></Page>

  // MENU SCREEN
  if (screen === 'menu') return (
    <Page>
      <StickyHead>
        <div style={{padding:'13px 16px 0',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'10px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',flex:1,minWidth:0}}>
            <Logo />
            <div style={{minWidth:0}}>
              <div style={{fontSize:'15px',fontWeight:800,color:'#1a1f2e',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{restaurantName}</div>
              <div style={{fontSize:'11px',color:'#94a3b8'}}>{tableNumber?`Table ${tableNumber}`:'Scan & Order'}</div>
            </div>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button onClick={()=>setScreen('tracking')} style={{padding:'8px 12px',background:'#f1f5f9',border:'none',borderRadius:'10px',fontSize:'12px',fontWeight:600,cursor:'pointer'}}>📋 Orders</button>
            {totalItems > 0 && (
              <button onClick={()=>setScreen('cart')} style={{display:'flex',alignItems:'center',gap:'7px',padding:'8px 14px',background:'#4361ee',color:'#fff',border:'none',borderRadius:'10px',fontSize:'13px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(67,97,238,.35)',flexShrink:0}}>
                🛒 {totalItems} <span style={{background:'#fff',color:'#4361ee',borderRadius:'20px',padding:'1px 8px',fontSize:'12px',fontWeight:700}}>Rs.{subtotal.toLocaleString()}</span>
              </button>
            )}
          </div>
        </div>
        <div style={{padding:'10px 16px 0'}}>
          <div style={{display:'flex',gap:'8px'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search dishes..." style={{...IS, flex:1}} />
            <div style={{display:'flex',gap:'5px',background:'#f8fafc',border:'1.5px solid #e2e8f0',borderRadius:'10px',padding:'2px'}}>
              <FilterChip active={filterOption==='all'} onClick={()=>setFilterOption('all')}>All</FilterChip>
              <FilterChip active={filterOption==='veg'} onClick={()=>setFilterOption('veg')}>🌿 Veg</FilterChip>
              <FilterChip active={filterOption==='non-veg'} onClick={()=>setFilterOption('non-veg')}>🍗 Non-Veg</FilterChip>
            </div>
          </div>
        </div>
        {!search && filterOption === 'all' && menu.length > 0 && (
          <div style={{display:'flex',gap:'6px',padding:'10px 16px 12px',overflowX:'auto',scrollbarWidth:'none'}}>
            {menu.map(cat=>(
              <button key={cat._id} onClick={()=>{setActiveCategory(cat._id);document.getElementById('cat-'+cat._id)?.scrollIntoView({behavior:'smooth',block:'start'})}}
                style={{padding:'5px 13px',borderRadius:'20px',border:'1.5px solid',fontSize:'12px',fontWeight:600,cursor:'pointer',whiteSpace:'nowrap',fontFamily:'inherit',transition:'all .15s',
                  borderColor:activeCategory===cat._id?'#4361ee':'#e2e8f0',
                  background:activeCategory===cat._id?'#4361ee':'#fff',
                  color:activeCategory===cat._id?'#fff':'#64748b'}}>
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </StickyHead>

      <div style={{padding:'16px',paddingBottom:totalItems>0?'96px':'24px'}}>
        {filteredMenu.length===0?(
          <div style={{textAlign:'center',padding:'60px 24px',color:'#94a3b8'}}>
            <div style={{fontSize:'48px',marginBottom:'12px'}}>🍽️</div>
            <p>{search?`No items for "${search}"`:'Menu not available right now'}</p>
          </div>
        ):filteredMenu.map(cat=>(
          <div key={cat._id} id={'cat-'+cat._id} style={{marginBottom:'28px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px'}}>
              <h2 style={{fontSize:'16px',fontWeight:800,color:'#1a1f2e'}}>{cat.name}</h2>
              <div style={{flex:1,height:'1px',background:'#f1f5f9'}}/>
              <span style={{fontSize:'11px',color:'#94a3b8'}}>{cat.items.length} items</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              {cat.items.map(item=>{
                const qty=getQty(item._id)
                return (
                  <div key={item._id} style={{background:'#fff',border:`1.5px solid ${qty>0?'rgba(67,97,238,.3)':'#f1f5f9'}`,borderRadius:'14px',padding:'13px 14px',display:'flex',alignItems:'center',gap:'13px',boxShadow:qty>0?'0 0 0 3px rgba(67,97,238,.07)':'none',transition:'all .18s'}}>
                    <ItemImage src={item.image} name={item.name} />
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:'6px',flexWrap:'wrap'}}>
                        <div style={{fontSize:'14px',fontWeight:700,color:'#1a1f2e'}}>{item.name}</div>
                        {item.isVegetarian ? <span style={{fontSize:'10px',background:'#dcfce7',color:'#15803d',padding:'2px 6px',borderRadius:'20px'}}>🌱 Veg</span> : 
                                           <span style={{fontSize:'10px',background:'#fee2e2',color:'#b91c1c',padding:'2px 6px',borderRadius:'20px'}}>🍗 Non-Veg</span>}
                      </div>
                      {item.description&&<div style={{fontSize:'11.5px',color:'#94a3b8',marginTop:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.description}</div>}
                      <div style={{display:'flex',alignItems:'center',gap:'7px',marginTop:'4px'}}>
                        <span style={{fontSize:'15px',fontWeight:800,color:'#4361ee'}}>Rs.{item.price}</span>
                        {item.taxPercent>0&&<span style={{fontSize:'10px',color:'#94a3b8',background:'#f1f5f9',padding:'1px 5px',borderRadius:'4px'}}>+{item.taxPercent}%</span>}
                      </div>
                    </div>
                    {qty===0?(
                      <button onClick={()=>addToCart(item)} style={{width:'36px',height:'36px',background:'#4361ee',border:'none',borderRadius:'10px',color:'#fff',cursor:'pointer',fontSize:'22px',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 12px rgba(67,97,238,.3)',flexShrink:0}}>+</button>
                    ):(
                      <div style={{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
                        <QtyButton onClick={()=>removeFromCart(item._id)}>−</QtyButton>
                        <span style={{fontSize:'15px',fontWeight:800,color:'#4361ee',minWidth:'20px',textAlign:'center'}}>{qty}</span>
                        <QtyButton primary onClick={()=>addToCart(item)}>+</QtyButton>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {totalItems > 0 && (
        <div style={{position:'fixed',bottom:'16px',left:'50%',transform:'translateX(-50%)',zIndex:200,width:'calc(100% - 28px)',maxWidth:'540px'}}>
          <button onClick={()=>setScreen('cart')} style={{width:'100%',padding:'14px 20px',background:'#4361ee',color:'#fff',border:'none',borderRadius:'14px',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 8px 28px rgba(67,97,238,.45)'}}>
            <span>🛒 {totalItems} item{totalItems>1?'s':''}</span>
            <span style={{opacity:.85}}>View Cart · Rs.{subtotal.toLocaleString()} →</span>
          </button>
        </div>
      )}
      <Styles />
    </Page>
  )

  // CART SCREEN
  if (screen === 'cart') return (
    <Page>
      <TopBar onBack={()=>setScreen('menu')} title="Your Cart" sub={`${restaurantName}${tableNumber?' · Table '+tableNumber:''}`} />
      <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'12px',paddingBottom:'100px'}}>
        {cart.map(item=>(
          <div key={item.menuItem} style={{background:'#fff',borderRadius:'14px',padding:'13px 14px',display:'flex',alignItems:'center',gap:'12px',boxShadow:'0 1px 4px rgba(0,0,0,.05)'}}>
            <div style={{width:'44px',height:'44px',borderRadius:'10px',overflow:'hidden',background:'#f0f2f8',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {item.image ? <img src={item.image} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontSize:'22px'}}>{foodEmoji(item.name)}</span>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:'14px',fontWeight:600,color:'#1a1f2e'}}>{item.name}</div>
              <div style={{fontSize:'12px',color:'#94a3b8',marginTop:'2px'}}>Rs.{item.price} each</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',flexShrink:0}}>
              <QtyButton onClick={()=>removeFromCart(item.menuItem)}>−</QtyButton>
              <span style={{fontSize:'14px',fontWeight:800,color:'#4361ee',minWidth:'20px',textAlign:'center'}}>{item.quantity}</span>
              <QtyButton primary onClick={()=>addToCart({_id:item.menuItem,name:item.name,price:item.price,image:item.image})}>+</QtyButton>
            </div>
            <div style={{fontSize:'14px',fontWeight:700,color:'#1a1f2e',minWidth:'68px',textAlign:'right'}}>Rs.{(item.price*item.quantity).toLocaleString()}</div>
          </div>
        ))}

        <div style={{background:'#fff',borderRadius:'14px',padding:'14px',boxShadow:'0 1px 4px rgba(0,0,0,.05)'}}>
          <label style={{fontSize:'13px',fontWeight:600,color:'#475569',display:'block',marginBottom:'8px'}}>📝 Special Instructions</label>
          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Less spicy, no onions..." rows={2} style={{width:'100%',padding:'10px 13px',border:'1.5px solid #e2e8f0',borderRadius:'10px',fontSize:'13.5px',fontFamily:'inherit',outline:'none',resize:'none',color:'#1a1f2e',background:'#f8fafc'}} />
        </div>

        <div style={{background:'#fff',borderRadius:'14px',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,.05)'}}>
          <div style={{background:'#4361ee',padding:'13px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div style={{fontSize:'13px',fontWeight:700,color:'#fff'}}>{restaurantName}</div><div style={{fontSize:'11px',color:'rgba(255,255,255,.7)',marginTop:'1px'}}>{tableNumber?`Table ${tableNumber}`:'Dine In'} · {new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div></div>
            <span style={{fontSize:'24px'}}>🧾</span>
          </div>
          <div style={{padding:'13px 16px',display:'flex',flexDirection:'column',gap:'6px'}}>
            {cart.map(item=>(
              <div key={item.menuItem} style={{display:'flex',justifyContent:'space-between',fontSize:'13px'}}>
                <span style={{color:'#475569'}}>{item.name} × {item.quantity}</span>
                <span style={{fontWeight:600,color:'#1a1f2e'}}>Rs.{(item.price*item.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div style={{borderTop:'1px dashed #e2e8f0',marginTop:'4px',paddingTop:'8px',display:'flex',flexDirection:'column',gap:'5px'}}>
              <BillRow label="Subtotal" value={`Rs.${subtotal.toLocaleString()}`} />
              <BillRow label="VAT (5%)" value={`Rs.${tax.toLocaleString()}`} muted />
              <div className="total-row"><span>Total</span><span>Rs.{grandTotal.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
      <BottomBar>
        <button onClick={()=>setScreen('payment')} style={{...Btn.primary,width:'100%',padding:'14px',fontSize:'15px'}}>Proceed to Payment →</button>
      </BottomBar>
      <Styles />
    </Page>
  )

  // PAYMENT SCREEN
  if (screen === 'payment') return (
    <Page>
      <TopBar onBack={()=>setScreen('cart')} title="Payment Method" sub="Choose how you'd like to pay" />
      <div style={{padding:'20px 16px',display:'flex',flexDirection:'column',gap:'16px',paddingBottom:'100px'}}>
        <div style={{background:'#fff',borderRadius:'14px',padding:'14px 16px',boxShadow:'0 1px 4px rgba(0,0,0,.05)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><div style={{fontSize:'12px',color:'#94a3b8',marginBottom:'3px'}}>{restaurantName}{tableNumber?' · Table '+tableNumber:''}</div><div style={{fontSize:'13px',color:'#475569'}}>{totalItems} items</div></div>
          <div style={{textAlign:'right'}}><div style={{fontSize:'11px',color:'#94a3b8'}}>Total</div><div style={{fontSize:'20px',fontWeight:800,color:'#4361ee'}}>Rs.{grandTotal.toLocaleString()}</div></div>
        </div>
        <div><div style={{fontSize:'12px',fontWeight:700,color:'#64748b',marginBottom:'10px',textTransform:'uppercase',letterSpacing:'.07em'}}>Select Payment Type</div>
        {PAYMENT_METHODS.map(pm=>(
          <button key={pm.id} onClick={()=>setPayMethod(pm.id)} style={{display:'flex',alignItems:'center',gap:'14px',padding:'14px 16px',background:'#fff',border:`2px solid ${payMethod===pm.id?'#4361ee':'#e2e8f0'}`,borderRadius:'14px',cursor:'pointer',textAlign:'left',width:'100%',marginBottom:'10px'}}>
            <div style={{width:'48px',height:'48px',background:payMethod===pm.id?'#eff3ff':'#f8fafc',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>{pm.emoji}</div>
            <div style={{flex:1}}><div style={{fontSize:'15px',fontWeight:700,color:'#1a1f2e'}}>{pm.label}</div><div style={{fontSize:'12px',color:'#94a3b8'}}>{pm.desc}</div></div>
            <div style={{width:'22px',height:'22px',borderRadius:'50%',border:`2px solid ${payMethod===pm.id?'#4361ee':'#e2e8f0'}`,background:payMethod===pm.id?'#4361ee':'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {payMethod===pm.id&&<div style={{width:'8px',height:'8px',background:'#fff',borderRadius:'50%'}}/>}
            </div>
          </button>
        ))}
        </div>
        <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'12px',padding:'12px 14px',fontSize:'12.5px',color:'#3b82f6'}}>ℹ️ Your payment preference will be saved with your order for staff to track.</div>
      </div>
      <BottomBar>
        <button onClick={submitOrder} disabled={ordering} style={{...Btn.primary,width:'100%',padding:'14px',opacity:ordering?0.7:1}}>
          {ordering?<><Spin size={18} white/> Placing...</>:`✓ Place Order · Rs.${grandTotal.toLocaleString()} (${PAYMENT_METHODS.find(p=>p.id===payMethod)?.label})`}
        </button>
      </BottomBar>
      <Styles />
    </Page>
  )

  // TRACKING SCREEN
  if (screen === 'tracking') {
    const st = orderData?.status || (orderId ? 'pending' : 'no-order')
    const si = STATUS_INFO[st] || STATUS_INFO.pending
    const stepIdx = STATUS_STEPS.indexOf(st)
    const orderSubtotal = orderData?.totalAmount || subtotal
    const orderTax = Math.round(orderSubtotal*0.05)
    const orderGrand = orderSubtotal + orderTax

    if (!orderId) return (
      <Page>
        <TopBar onBack={()=>setScreen('menu')} title="My Orders" sub="No active order" />
        <Center><Big>📭</Big><H2>No active order</H2><button onClick={startNewOrder} style={{...Btn.primary,marginTop:'16px'}}>Browse Menu</button></Center>
        <Styles />
      </Page>
    )

    return (
      <Page bg="#f8fafc">
        <div style={{background:'#fff',borderBottom:'1px solid #f1f5f9',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}><Logo /><div><div style={{fontSize:'15px',fontWeight:800,color:'#1a1f2e'}}>Order Tracking</div><div style={{fontSize:'11px',color:'#94a3b8'}}>{restaurantName}{tableNumber?' · Table '+tableNumber:''}</div></div></div>
          <div><button onClick={()=>setScreen('bill')} style={{padding:'7px 14px',background:'#f1f5f9',border:'none',borderRadius:'9px',fontSize:'12.5px',fontWeight:600,cursor:'pointer'}}>View Bill</button>
          <button onClick={startNewOrder} style={{marginLeft:'8px',padding:'7px 12px',background:'#e2e8f0',border:'none',borderRadius:'9px',fontSize:'12px',cursor:'pointer'}}>New Order</button></div>
        </div>
        <div style={{padding:'20px 16px',display:'flex',flexDirection:'column',gap:'16px'}}>
          <div style={{background:si.bg,border:`1.5px solid ${si.color}30`,borderRadius:'16px',padding:'22px 20px',textAlign:'center'}}>
            <div style={{fontSize:'52px',marginBottom:'10px'}}>{si.emoji}</div>
            <div style={{fontSize:'20px',fontWeight:800,color:'#1a1f2e',marginBottom:'6px'}}>{si.label}</div>
            <div style={{fontSize:'13px',color:'#64748b',lineHeight:1.6}}>{si.desc}</div>
            {st!=='served'&&st!=='cancelled'&&(
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',marginTop:'12px',fontSize:'12px',color:'#94a3b8'}}>
                <div style={{width:'6px',height:'6px',background:si.color,borderRadius:'50%',animation:'pulse 1.5s infinite'}}/>
                Live updates via WebSocket
              </div>
            )}
          </div>
          <div style={{background:'#fff',borderRadius:'14px',padding:'16px',boxShadow:'0 1px 4px rgba(0,0,0,.05)'}}>
            <div style={{fontSize:'12px',fontWeight:700,color:'#475569',marginBottom:'16px',textTransform:'uppercase'}}>Progress</div>
            <div style={{display:'flex',alignItems:'flex-start'}}>
              {STATUS_STEPS.map((step,i)=>{
                const done=i<=stepIdx&&st!=='cancelled'
                const cur=i===stepIdx&&st!=='cancelled'
                const lbls=['Received','Preparing','Ready','Served']
                const emjs=['📋','👨‍🍳','🔔','✅']
                return(
                  <div key={step} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',position:'relative'}}>
                    {i<STATUS_STEPS.length-1&&<div style={{position:'absolute',top:'15px',left:'50%',width:'100%',height:'2px',background:i<stepIdx&&st!=='cancelled'?'#4361ee':'#e2e8f0',zIndex:0}}/>}
                    <div style={{width:'32px',height:'32px',borderRadius:'50%',background:done?'#4361ee':'#f1f5f9',border:`2px solid ${done?'#4361ee':'#e2e8f0'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',zIndex:1,boxShadow:cur?'0 0 0 4px rgba(67,97,238,.15)':'none'}}>
                      {done?(cur?emjs[i]:'✓'):emjs[i]}
                    </div>
                    <div style={{fontSize:'10px',fontWeight:cur?700:500,color:done?'#4361ee':'#94a3b8',marginTop:'5px'}}>{lbls[i]}</div>
                  </div>
                )
              })}
            </div>
          </div>
          <div style={{background:'#fff',borderRadius:'14px',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,.05)'}}>
            <div style={{background:'#1a1f2e',padding:'12px 16px',display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:'13px',fontWeight:700,color:'#fff'}}>Order Summary</span>
              <span style={{fontSize:'11px',color:'rgba(255,255,255,.45)',fontFamily:'monospace'}}>#{orderId?.slice(-8).toUpperCase()}</span>
            </div>
            <div style={{padding:'13px 16px',display:'flex',flexDirection:'column',gap:'7px'}}>
              {orderData?.items?.map((item,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'13.5px'}}>
                  <span>{item.name} <span style={{color:'#94a3b8'}}>× {item.quantity}</span></span>
                  <span style={{fontWeight:600}}>Rs.{(item.price*item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div style={{borderTop:'1px dashed #e2e8f0',paddingTop:'8px',marginTop:'2px'}}>
                <BillRow label="Subtotal" value={`Rs.${orderSubtotal.toLocaleString()}`} />
                <BillRow label="VAT (5%)" value={`Rs.${orderTax.toLocaleString()}`} muted />
                <div className="total-row"><span>Grand Total</span><span>Rs.{orderGrand.toLocaleString()}</span></div>
              </div>
              <div style={{marginTop:'4px',display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',background:'#f8fafc',borderRadius:'10px'}}>
                <span style={{fontSize:'20px'}}>{PAYMENT_METHODS.find(p=>p.id===(orderData?.paymentMethod||payMethod))?.emoji||'💵'}</span>
                <div style={{flex:1}}><div style={{fontSize:'11px',color:'#94a3b8'}}>Payment Method</div><div style={{fontSize:'13.5px',fontWeight:600}}>{PAYMENT_METHODS.find(p=>p.id===(orderData?.paymentMethod||payMethod))?.label||'Cash'}</div></div>
                <span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:orderData?.isPaid?'#f0fdf4':'#fefce8',color:orderData?.isPaid?'#16a34a':'#a16207'}}>
                  {orderData?.isPaid?'✓ Paid':'Pending'}
                </span>
              </div>
              {orderData?.note&&<div style={{padding:'8px 12px',background:'#fefce8',borderRadius:'8px',fontSize:'12.5px',color:'#a16207'}}>📝 {orderData.note}</div>}
            </div>
          </div>
        </div>
        <Styles />
      </Page>
    )
  }

  // BILL SCREEN
  if (screen === 'bill') {
    const od = orderData
    const bs = od?.totalAmount || subtotal
    const bt = Math.round(bs*0.05)
    const bg = bs+bt
    return (
      <Page bg="#f0f2f8">
        <div style={{background:'#fff',borderBottom:'1px solid #f1f5f9',padding:'14px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
          <BackBtn onClick={()=>setScreen('tracking')} />
          <div style={{flex:1}}><div style={{fontSize:'16px',fontWeight:800}}>Your Bill</div><div style={{fontSize:'11px',color:'#94a3b8'}}>Show to staff for payment</div></div>
          <button onClick={()=>window.print()} style={{padding:'7px 14px',background:'#4361ee',color:'#fff',border:'none',borderRadius:'9px',fontSize:'12.5px',cursor:'pointer'}}>🖨 Print</button>
        </div>
        <div style={{padding:'20px 16px',display:'flex',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:'16px',width:'100%',maxWidth:'340px',boxShadow:'0 4px 24px rgba(0,0,0,.1)',overflow:'hidden'}}>
            <div style={{background:'#4361ee',padding:'20px',textAlign:'center'}}>
              <div style={{fontSize:'28px',marginBottom:'6px'}}>📲</div>
              <div style={{fontSize:'18px',fontWeight:800,color:'#fff'}}>{restaurantName}</div>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,.7)'}}>{tableNumber?`Table ${tableNumber}`:'Dine In'} · {new Date().toLocaleString()}</div>
              {orderId&&<div style={{fontSize:'11px',color:'rgba(255,255,255,.5)',marginTop:'6px'}}>#{orderId.slice(-8).toUpperCase()}</div>}
            </div>
            <Tear />
            <div style={{padding:'14px 20px'}}>
              <div style={{fontSize:'11px',fontWeight:700,color:'#94a3b8',marginBottom:'10px'}}>Items Ordered</div>
              {(od?.items||cart).map((item,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'6px'}}>
                  <span>{item.name} ×{item.quantity}</span>
                  <span>Rs.{((item.price||0)*item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <Tear />
            <div style={{padding:'14px 20px'}}>
              <BillRow label="Subtotal" value={`Rs.${bs.toLocaleString()}`} />
              <BillRow label="VAT (5%)" value={`Rs.${bt.toLocaleString()}`} muted />
              <div className="total-row"><span>TOTAL</span><span>Rs.{bg.toLocaleString()}</span></div>
            </div>
            <div style={{padding:'12px 20px',background:'#f8fafc',display:'flex',alignItems:'center',gap:'10px'}}>
              <span style={{fontSize:'20px'}}>{PAYMENT_METHODS.find(p=>p.id===(od?.paymentMethod||payMethod))?.emoji}</span>
              <div style={{flex:1}}><div style={{fontSize:'11px',color:'#94a3b8'}}>Payment via</div><div style={{fontSize:'13.5px',fontWeight:700}}>{PAYMENT_METHODS.find(p=>p.id===(od?.paymentMethod||payMethod))?.label}</div></div>
              <span style={{padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:700,background:od?.isPaid?'#f0fdf4':'#fefce8',color:od?.isPaid?'#16a34a':'#a16207'}}>
                {od?.isPaid?'✓ PAID':'PENDING'}
              </span>
            </div>
            <div style={{padding:'14px 20px',textAlign:'center',background:'#1a1f2e'}}>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,.55)'}}>Thank you for dining with us! 🙏<br/><span style={{fontSize:'10px'}}>Powered by Mero QR</span></div>
            </div>
          </div>
        </div>
        <Styles />
      </Page>
    )
  }
  return null
}

// Small components
const Page = ({children,bg='#fff'}) => <div style={{minHeight:'100vh',background:bg,maxWidth:'600px',margin:'0 auto',fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",position:'relative'}}>{children}</div>
const Center = ({children}) => <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'70vh',padding:'24px',textAlign:'center'}}>{children}</div>
const StickyHead = ({children}) => <div style={{position:'sticky',top:0,zIndex:100,background:'#fff',borderBottom:'1px solid #f1f5f9',boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>{children}</div>
const TopBar = ({onBack,title,sub,right}) => (
  <div style={{background:'#fff',borderBottom:'1px solid #f1f5f9',padding:'14px 16px',display:'flex',alignItems:'center',gap:'12px',position:'sticky',top:0,zIndex:100}}>
    <BackBtn onClick={onBack} />
    <div style={{flex:1}}><div style={{fontSize:'16px',fontWeight:800,color:'#1a1f2e'}}>{title}</div><div style={{fontSize:'11px',color:'#94a3b8'}}>{sub}</div></div>
    {right}
  </div>
)
const BackBtn = ({onClick}) => <button onClick={onClick} style={{width:'34px',height:'34px',background:'#f1f5f9',border:'none',borderRadius:'10px',cursor:'pointer',fontSize:'16px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>←</button>
const BottomBar = ({children}) => <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'600px',background:'#fff',borderTop:'1px solid #f1f5f9',padding:'12px 16px',boxShadow:'0 -4px 20px rgba(0,0,0,.06)',zIndex:200}}>{children}</div>
const BillRow = ({label,value,muted}) => <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',marginBottom:'4px'}}><span style={{color:muted?'#94a3b8':'#64748b'}}>{label}</span><span style={{fontWeight:600,color:muted?'#94a3b8':'#1a1f2e'}}>{value}</span></div>
const Big = ({children}) => <div style={{fontSize:'52px',marginBottom:'16px'}}>{children}</div>
const H2 = ({children}) => <h2 style={{fontSize:'20px',fontWeight:700,color:'#1a1f2e',marginBottom:'8px'}}>{children}</h2>
const Muted = ({children,style}) => <p style={{color:'#64748b',fontSize:'14px',lineHeight:1.6,...style}}>{children}</p>
const Logo = () => <div style={{width:'38px',height:'38px',background:'#4361ee',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',flexShrink:0}}>📲</div>
const Spin = ({size=32,white=false}) => <div style={{width:`${size}px`,height:`${size}px`,border:`3px solid ${white?'rgba(255,255,255,.3)':'#e2e8f0'}`,borderTopColor:white?'#fff':'#4361ee',borderRadius:'50%',animation:'spin .8s linear infinite',display:'inline-block'}}/>
const Tear = () => (
  <div style={{display:'flex',alignItems:'center',padding:'0 -4px'}}>
    <div style={{width:'18px',height:'18px',borderRadius:'50%',background:'#f0f2f8',marginLeft:'-9px'}}/>
    <div style={{flex:1,borderTop:'2px dashed #e2e8f0',margin:'0 4px'}}/>
    <div style={{width:'18px',height:'18px',borderRadius:'50%',background:'#f0f2f8',marginRight:'-9px'}}/>
  </div>
)
const FilterChip = ({active,onClick,children}) => (
  <button onClick={onClick} style={{padding:'6px 12px',borderRadius:'8px',fontSize:'12px',fontWeight:600,background:active?'#4361ee':'transparent',color:active?'#fff':'#64748b',border:'none',cursor:'pointer',fontFamily:'inherit'}}>{children}</button>
)
const QtyButton = ({onClick,primary,children}) => (
  <button onClick={onClick} style={{width:'32px',height:'32px',background:primary?'#4361ee':'#f1f5f9',border:primary?'none':'1.5px solid #e2e8f0',borderRadius:'8px',cursor:'pointer',fontSize:'18px',display:'flex',alignItems:'center',justifyContent:'center',color:primary?'#fff':'#1a1f2e'}}>{children}</button>
)
const ItemImage = ({src,name}) => {
  if (!src) return <div style={{width:'50px',height:'50px',borderRadius:'12px',background:'#f0f2f8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',flexShrink:0}}>{foodEmoji(name)}</div>
  return <img src={src} alt={name} style={{width:'50px',height:'50px',borderRadius:'12px',objectFit:'cover',flexShrink:0}} />
}

const IS = {width:'100%',padding:'9px 14px',border:'1.5px solid #e2e8f0',borderRadius:'10px',fontSize:'13.5px',outline:'none',fontFamily:'inherit',background:'#f8fafc',color:'#1a1f2e'}
const Btn = {
  primary:{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',padding:'11px 20px',background:'#4361ee',color:'#fff',border:'none',borderRadius:'12px',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 6px 20px rgba(67,97,238,.35)'},
  outline:{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',padding:'11px 20px',background:'#fff',color:'#4361ee',border:'2px solid #4361ee',borderRadius:'12px',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'},
}
const Styles = () => <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:#f8fafc}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .total-row{display:flex;justify-content:space-between;font-size:16px;font-weight:800;color:#1a1f2e;border-top:2px solid #1a1f2e;padding-top:9px;margin-top:3px}
  .total-row span:last-child{color:#4361ee}
  @media print{.no-print{display:none!important}body{background:#fff}}
`}</style>

function foodEmoji(n=''){
  const l=n.toLowerCase()
  if(l.includes('burger'))return'🍔'
  if(l.includes('pizza'))return'🍕'
  if(l.includes('momo')||l.includes('dumpling'))return'🥟'
  if(l.includes('coffee')||l.includes('tea')||l.includes('chai'))return'☕'
  if(l.includes('fries')||l.includes('chips'))return'🍟'
  if(l.includes('chicken'))return'🍗'
  if(l.includes('rice')||l.includes('dal')||l.includes('curry'))return'🍛'
  if(l.includes('noodle')||l.includes('pasta')||l.includes('chowmein'))return'🍜'
  if(l.includes('cake')||l.includes('dessert')||l.includes('sweet'))return'🍰'
  if(l.includes('juice')||l.includes('drink')||l.includes('lassi'))return'🥤'
  if(l.includes('soup'))return'🍲'
  if(l.includes('sandwich')||l.includes('wrap'))return'🥙'
  if(l.includes('paneer'))return'🧀'
  if(l.includes('fish')||l.includes('seafood'))return'🐟'
  if(l.includes('egg'))return'🍳'
  if(l.includes('salad'))return'🥗'
  return'🍽️'
}