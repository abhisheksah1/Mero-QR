const router = require('express').Router();
const ctrl = require('../../controllers/restaurant/cashier.controller');
const verifyToken = require('../../middleware/verifyToken');
const requireRole = require('../../middleware/requireRole');

router.use(verifyToken, requireRole('cashier', 'restaurant'));

router.post('/pay',           ctrl.processPayment);
router.get('/transactions',   ctrl.getTransactions);

module.exports = router;