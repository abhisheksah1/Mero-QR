const router = require('express').Router();
const ctrl = require('../../controllers/platform/cms.controller');
const verifyToken = require('../../middleware/verifyToken');
const requireRole = require('../../middleware/requireRole');

router.use(verifyToken, requireRole('platform'));

router.post('/', ctrl.upsertContent);
router.get('/', ctrl.getContent);

module.exports = router;