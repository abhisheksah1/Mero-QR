const { error } = require('../utils/apiResponse');

// Usage: requireRole('platform') or requireRole('restaurant') or requireRole('kitchen','cashier')
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.scope))
    return error(res, 'Access denied', 403);
  next();
};

module.exports = requireRole;