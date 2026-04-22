const router = require('express').Router();
const ctrl = require('../../controllers/restaurant/employee.controller');
const verifyToken = require('../../middleware/verifyToken');
const requireRole = require('../../middleware/requireRole');
const requireKYC = require('../../middleware/requireKYC');
const requireActivePackage = require('../../middleware/requireActivePackage');

// Employee login (no auth needed)
router.post('/login', ctrl.employeeLogin);

// Employee changes own password (requires employee token)
router.patch('/change-password',
  verifyToken,
  requireRole('kitchen', 'cashier'),
  ctrl.changeEmployeePassword
);

// Restaurant admin manages employees
router.use(verifyToken, requireRole('restaurant'), requireKYC, requireActivePackage);

router.post('/',   ctrl.createEmployee);
router.get('/',    ctrl.listEmployees);
router.patch('/:employeeId/reset-password', ctrl.resetEmployeePassword);

module.exports = router;