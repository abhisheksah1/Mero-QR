const router = require('express').Router();
const ctrl = require('../../controllers/restaurant/menu.controller');
const verifyToken = require('../../middleware/verifyToken');
const requireRole = require('../../middleware/requireRole');
const requireKYC = require('../../middleware/requireKYC');
const requireActivePackage = require('../../middleware/requireActivePackage');

// Public menu (for QR scan)
router.get('/public/:restaurantId', ctrl.getMenu);

router.use(verifyToken, requireRole('restaurant'), requireKYC, requireActivePackage);

router.post('/categories',       ctrl.createCategory);
router.post('/items',            ctrl.createMenuItem);
router.get('/',                  ctrl.getMenu);
router.patch('/items/:itemId',   ctrl.updateMenuItem);
router.delete('/items/:itemId',  ctrl.deleteMenuItem);

module.exports = router;