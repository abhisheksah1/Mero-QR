const router = require('express').Router();
const ctrl = require('../../controllers/restaurant/table.controller');
const verifyToken = require('../../middleware/verifyToken');
const requireRole = require('../../middleware/requireRole');
const requireKYC = require('../../middleware/requireKYC');
const requireActivePackage = require('../../middleware/requireActivePackage');

router.use(verifyToken, requireRole('restaurant'), requireKYC, requireActivePackage);

router.post('/',                          ctrl.createTable);
router.get('/',                           ctrl.getTables);
router.patch('/:tableId/regenerate-qr',   ctrl.regenerateQR);

module.exports = router;