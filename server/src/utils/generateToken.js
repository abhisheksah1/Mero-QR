/**
 * JWT Token Generator
 * Creates signed JSON Web Tokens for authentication
 * 
 * @module utils/generateToken
 * @description
 * Generates JWT tokens containing user payload data:
 * - Signs token using JWT_SECRET from environment
 * - Sets expiration time from JWT_EXPIRES_IN config
 * - Used for session management and API authentication
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

/**
 * Generates a signed JWT token with user payload
 * 
 * @function generateToken
 * @param {Object} payload - Data to encode in the token (user info)
 * @returns {string} Signed JWT token string
 * 
 * @description
 * - Signs payload with JWT_SECRET using HS256 algorithm
 * - Token automatically expires after configured duration
 * - Token contains: user id, scope, restaurantId, etc.
 * 
 * @example
 * const token = generateToken({
 *   id: '123',
 *   scope: 'restaurant',
 *   restaurantId: '456'
 * });
 * // Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

module.exports = generateToken;