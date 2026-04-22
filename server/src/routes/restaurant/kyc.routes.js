const router = require('express').Router();
const ctrl = require('../../controllers/restaurant/kyc.controller');
const verifyToken = require('../../middleware/verifyToken');
const requireRole = require('../../middleware/requireRole');

router.use(verifyToken, requireRole('restaurant'));

router.post('/submit', ctrl.submitKYC);
router.get('/status',  ctrl.getKYCStatus);

module.exports = router;