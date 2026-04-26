/**
 * Active Package Verification Middleware
 * Ensures restaurant has active subscription before allowing access
 * 
 * @module middleware/requireActivePackage
 * @description
 * Subscription check middleware that:
 * - Fetches restaurant by ID from database
 * - Verifies restaurant exists
 * - Checks if subscription is active (isActive flag)
 * - Blocks access if subscription has expired
 * 
 * @description
 * This middleware protects restaurant-specific endpoints from
 * users whose subscriptions have expired. It should be used after
 * verifyToken middleware to ensure req.user.restaurantId is available.
 */

const Restaurant = require('../models/Restaurant.model');
const { error } = require('../utils/apiResponse');

/**
 * Middleware to verify restaurant has active subscription
 * 
 * @function requireActivePackage
 * @async
 * @param {Object} req - Express request object (must have restaurantId from verifyToken)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {JSON} Error response if package inactive, otherwise calls next()
 */
const requireActivePackage = async (req, res, next) => {
  // Fetch restaurant from database using ID from authenticated user
  const restaurant = await Restaurant.findById(req.user.restaurantId);
  
  // Check if restaurant exists in database
  if (!restaurant) return error(res, 'Restaurant not found', 404);
  
  // Check if subscription is active
  if (!restaurant.isActive) return error(res, 'Your subscription has expired. Please renew your plan.', 403);
  
  // Package is active, allow access to protected route
  next();
};

module.exports = requireActivePackage;