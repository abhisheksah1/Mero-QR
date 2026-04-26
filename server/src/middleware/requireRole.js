/**
 * Role-Based Access Control Middleware
 * Restricts access to specific user roles/scopes
 * 
 * @module middleware/requireRole
 * @description
 * Authorization middleware that:
 * - Accepts one or more roles as parameters
 * - Checks if req.user.scope matches any of the allowed roles
 * - Returns 403 Forbidden if role doesn't match
 * 
 * @example
 * // Single role check
 * router.get('/admin', verifyToken, requireRole('platform'), handler)
 * 
 * @example
 * // Multiple roles check (user must have at least one)
 * router.get('/kitchen', verifyToken, requireRole('kitchen', 'cashier'), handler)
 */

const { error } = require('../utils/apiResponse');

/**
 * Factory function that creates role-checking middleware
 * 
 * @function requireRole
 * @param {...string} roles - Allowed role scopes (platform, restaurant, kitchen, cashier, etc.)
 * @returns {Function} Express middleware function
 * 
 * @description
 * Returns a middleware that checks if the authenticated user's
 * scope matches one of the provided roles. Uses spread operator
 * to accept multiple roles.
 */
const requireRole = (...roles) => (req, res, next) => {
  // Check if user's scope is in the allowed roles list
  if (!roles.includes(req.user.scope))
    return error(res, 'Access denied', 403);
  
  // User has required role, continue to next middleware
  next();
};

module.exports = requireRole;