const router = require('express').Router();
const ctrl = require('../../controllers/restaurant/auth.controller');
const { authLimiter } = require('../../middleware/rateLimiter');

router.post('/register', authLimiter, ctrl.register);
router.post('/login',    authLimiter, ctrl.login);
router.post('/forgot-password', authLimiter, ctrl.forgotPassword);
router.post('/reset-password',  ctrl.resetPassword);

module.exports = router;