const router = require('express').Router();
const ctrl = require('../../controllers/restaurant/order.controller');
const verifyToken = require('../../middleware/verifyToken');
const requireRole = require('../../middleware/requireRole');

// Public: place order via QR (no auth)
router.post('/place', ctrl.placeOrder);

// Kitchen: update order status
router.patch('/:orderId/status',
  verifyToken,
  requireRole('kitchen', 'restaurant'),
  ctrl.updateOrderStatus
);

// View orders (restaurant admin or kitchen)
router.get('/',
  verifyToken,
  requireRole('restaurant', 'kitchen', 'cashier'),
  ctrl.getOrders
);

module.exports = router;