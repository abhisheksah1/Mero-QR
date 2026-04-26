/**
 * JWT Token Verification Middleware
 * Validates Bearer tokens from Authorization header
 * 
 * @module middleware/verifyToken
 * @description
 * Authentication middleware that:
 * - Extracts JWT token from Authorization header
 * - Verifies token using JWT_SECRET from environment
 * - Attaches decoded user data to req.user
 * - Returns 401 if token is missing or invalid
 */

/**
 * Express middleware to verify JWT authentication token
 * 
 * @function verifyToken
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {JSON} Error response if token invalid, otherwise calls next()
 */
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { error } = require('../utils/apiResponse');

const verifyToken = (req, res, next) => {
  // Get Authorization header
  const authHeader = req.headers.authorization;
  
  // Check if header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return error(res, 'No token provided', 401);

  try {
    // Extract token from "Bearer <token>" format
    const token = authHeader.split(' ')[1];
    
    // Verify and decode the JWT token
    req.user = jwt.verify(token, JWT_SECRET);
    
    // Continue to next middleware/route handler
    next();
  } catch (err) {
    // Token is invalid or expired
    return error(res, 'Invalid or expired token', 401);
  }
};

module.exports = verifyToken;