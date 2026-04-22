const router = require('express').Router();
const ctrl = require('../../controllers/restaurant/package.controller');
const verifyToken = require('../../middleware/verifyToken');
const requireRole = require('../../middleware/requireRole');

router.use(verifyToken, requireRole('restaurant'));

router.get('/status', ctrl.getPackageStatus);

module.exports = router;