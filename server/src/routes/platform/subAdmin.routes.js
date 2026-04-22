const router = require('express').Router();
const ctrl = require('../../controllers/platform/subAdmin.controller');
const verifyToken = require('../../middleware/verifyToken');
const requireRole = require('../../middleware/requireRole');

router.use(verifyToken, requireRole('platform'));

router.post('/create', ctrl.createSubAdmin);
router.post('/bulk-mail', ctrl.bulkMail);

module.exports = router;