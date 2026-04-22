import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// Auto-attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Platform Auth
export const platformLogin = d => api.post('/platform/auth/login', d)

// ── Platform Restaurants
export const getAllRestaurants = () => api.get('/platform/restaurants')
export const toggleRestaurantStatus = id => api.patch(`/platform/restaurants/${id}/toggle-status`)
export const resetRestaurantPassword = (id, d) => api.patch(`/platform/restaurants/${id}/reset-password`, d)
export const updateKYC = (id, d) => api.patch(`/platform/restaurants/${id}/kyc`, d)

// ── Platform Subscriptions
export const getPlans = () => api.get('/platform/subscriptions/plans')
export const createPlan = d => api.post('/platform/subscriptions/plans', d)
export const assignPlan = d => api.post('/platform/subscriptions/assign', d)

// ── Platform CMS
export const getCMS = () => api.get('/platform/cms')
export const upsertCMS = d => api.post('/platform/cms', d)

// ── Platform Sub Admin
export const createSubAdmin = d => api.post('/platform/admins/create', d)
export const sendBulkMail = d => api.post('/platform/admins/bulk-mail', d)

// ── Restaurant Auth
export const restaurantRegister = d => api.post('/restaurant/auth/register', d)
export const restaurantLogin = d => api.post('/restaurant/auth/login', d)
export const forgotPassword = d => api.post('/restaurant/auth/forgot-password', d)
export const resetPassword = d => api.post('/restaurant/auth/reset-password', d)

// ── KYC
export const submitKYC = d => api.post('/restaurant/kyc/submit', d)
export const getKYCStatus = () => api.get('/restaurant/kyc/status')

// ── Package
export const getPackageStatus = () => api.get('/restaurant/package/status')

// ── Menu
export const getMenu = () => api.get('/restaurant/menu')
export const getPublicMenu = id => api.get(`/restaurant/menu/public/${id}`)
export const createCategory = d => api.post('/restaurant/menu/categories', d)
export const createMenuItem = d => api.post('/restaurant/menu/items', d)
export const updateMenuItem = (id, d) => api.patch(`/restaurant/menu/items/${id}`, d)
export const deleteMenuItem = id => api.delete(`/restaurant/menu/items/${id}`)

// ── Tables
export const getTables = () => api.get('/restaurant/tables')
export const createTable = d => api.post('/restaurant/tables', d)
export const regenerateQR = id => api.patch(`/restaurant/tables/${id}/regenerate-qr`)

// ── Employees
export const getEmployees = () => api.get('/restaurant/employees')
export const createEmployee = d => api.post('/restaurant/employees', d)
export const employeeLogin = d => api.post('/restaurant/employees/login', d)
export const resetEmployeePassword = id => api.patch(`/restaurant/employees/${id}/reset-password`)
export const changeEmployeePassword = d => api.patch('/restaurant/employees/change-password', d)

// ── Orders
export const placeOrder = d => api.post('/restaurant/orders/place', d)
export const getOrders = (status) => api.get('/restaurant/orders' + (status ? `?status=${status}` : ''))
export const updateOrderStatus = (id, d) => api.patch(`/restaurant/orders/${id}/status`, d)

// ── Cashier
export const processPayment = d => api.post('/restaurant/cashier/pay', d)
export const getTransactions = () => api.get('/restaurant/cashier/transactions')

export default api