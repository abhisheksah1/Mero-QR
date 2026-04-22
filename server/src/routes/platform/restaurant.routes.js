const router = require('express').Router();
const ctrl = require('../../controllers/platform/restaurant.controller');
const verifyToken = require('../../middleware/verifyToken');
const requireRole = require('../../middleware/requireRole');

router.use(verifyToken, requireRole('platform'));

router.get('/', ctrl.getAllRestaurants);
router.patch('/:restaurantId/kyc', ctrl.updateKYCStatus);
router.patch('/:restaurantId/reset-password', ctrl.resetRestaurantPassword);
router.patch('/:restaurantId/toggle-status', ctrl.toggleRestaurantStatus);

module.exports = router;