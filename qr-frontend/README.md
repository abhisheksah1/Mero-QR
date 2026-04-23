# Mero QR — Frontend Setup Guide

## Project Structure
```
qr-frontend/
├── src/
│   ├── App.jsx                        # All routes
│   ├── main.jsx                       # Entry point
│   ├── index.css                      # Global design system
│   ├── context/
│   │   └── AuthContext.jsx            # Auth state
│   ├── services/
│   │   └── api.js                     # All API calls
│   ├── components/common/
│   │   ├── UI.jsx                     # Reusable components
│   │   ├── Sidebar.jsx                # Navigation
│   │   └── Layout.jsx                 # Page layout
│   └── pages/
│       ├── Login.jsx                  # Platform + Restaurant + Employee login
│       ├── Register.jsx               # Restaurant registration
│       ├── AuthPages.jsx              # Forgot/Reset/Change password
│       ├── CustomerOrder.jsx          # Public QR ordering page
│       ├── restaurant/
│       │   ├── Dashboard.jsx
│       │   ├── MenuPage.jsx
│       │   ├── TablesPage.jsx
│       │   ├── OrdersPage.jsx
│       │   ├── EmployeesPage.jsx
│       │   ├── KYCPage.jsx
│       │   ├── PackagePage.jsx
│       │   ├── CashierPage.jsx
│       │   └── InventoryPage.jsx
│       ├── employee/
│       │   └── KitchenDashboard.jsx
│       └── platform/
│           ├── PlatformDashboard.jsx
│           ├── PlatformRestaurants.jsx
│           ├── PlatformSubscriptions.jsx
│           └── PlatformOthers.jsx     # CMS, SubAdmin, BulkMail
```

## Setup Steps

### 1. Create project
```bash
cd "D:\Projects\Mero QR"
mkdir client
cd client
```

### 2. Copy all src files into client/

### 3. Install dependencies
```bash
npm install
```

### 4. Start frontend
```bash
npm run dev
# Runs on http://localhost:3000
```

### 5. Make sure backend is running
```bash
cd ../server
npm run dev
# Runs on http://localhost:5000
```

## All URLs

| URL | Who Uses It |
|-----|-------------|
| http://localhost:3000/login | Everyone |
| http://localhost:3000/register | New restaurants |
| http://localhost:3000/dashboard | Restaurant admin |
| http://localhost:3000/platform | Platform admin |
| http://localhost:3000/kitchen | Kitchen employees |
| http://localhost:3000/cashier | Cashier employees |
| http://localhost:3000/order?table=TOKEN&restaurant=ID | Customers (QR scan) |

## Add inventory route to backend app.js
```js
app.use('/api/restaurant/inventory', require('./routes/restaurant/inventory.routes'))
```
