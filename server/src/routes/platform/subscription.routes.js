const router = require('express').Router();
const ctrl = require('../../controllers/platform/subscription.controller');
const verifyToken = require('../../middleware/verifyToken');
const requireRole = require('../../middleware/requireRole');

router.use(verifyToken, requireRole('platform'));

router.post('/plans', ctrl.createPlan);
router.get('/plans', ctrl.getAllPlans);
router.post('/assign', ctrl.assignPlanToRestaurant);

module.exports = router;