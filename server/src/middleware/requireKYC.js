/**
 * KYC Verification Middleware
 * Ensures restaurant has completed KYC verification before allowing access
 * 
 * @module middleware/requireKYC
 * @description
 * Know Your Customer (KYC) verification middleware that:
 * - Fetches restaurant by ID from database
 * - Verifies KYC status (isKYCVerified flag)
 * - Blocks access if KYC is not verified
 * 
 * @description
 * KYC (Know Your Customer) is a mandatory verification process
 * required by payment gateways and regulatory authorities.
 * This middleware ensures users cannot access certain features
 * until their restaurant's KYC is verified.
 */

const Restaurant = require('../models/Restaurant.model');
const { error } = require('../utils/apiResponse');

/**
 * Middleware to verify restaurant has completed KYC
 * 
 * @function requireKYC
 * @async
 * @param {Object} req - Express request object (must have restaurantId from verifyToken)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {JSON} Error response if KYC not verified, otherwise calls next()
 */
const requireKYC = async (req, res, next) => {
  // Fetch restaurant from database using ID from authenticated user
  const restaurant = await Restaurant.findById(req.user.restaurantId);
  
  // Check if restaurant exists AND KYC is verified
  if (!restaurant || !restaurant.isKYCVerified)
    return error(res, 'Please verify your KYC to use this feature', 403);
  
  // KYC is verified, allow access to protected route
  next();
};

module.exports = requireKYC;