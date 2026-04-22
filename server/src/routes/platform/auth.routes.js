const router = require('express').Router();
const { login } = require('../../controllers/platform/auth.controller');
const { authLimiter } = require('../../middleware/rateLimiter');

router.post('/login', authLimiter, login);

module.exports = router;