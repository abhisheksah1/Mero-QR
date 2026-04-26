/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse and brute-force attacks
 * 
 * @module middleware/rateLimiter
 * @description
 * Provides two rate limit configurations:
 * - authLimiter: Strict limit for authentication endpoints (login, register)
 * - apiLimiter: General limit for all other API endpoints
 * 
 * @description
 * Rate limiting helps prevent:
 * - Brute force attacks on login/registration
 * - DDoS attacks
 * - API abuse from automated scripts
 */

const rateLimit = require('express-rate-limit');

/**
 * Authentication rate limiter
 * Strict limit: 10 requests per 15 minutes
 * 
 * @description
 * Applied to auth endpoints to prevent:
 * - Brute force password attempts
 * - Account enumeration
 * - OTP spamming
 * 
 * @constant {Object} authLimiter
 * @property {number} windowMs - Time window in milliseconds (15 minutes)
 * @property {number} max - Maximum requests allowed in window
 * @property {Object} message - Error response when limit exceeded
 */
const authLimiter = rateLimit({
  // 15 minutes window (15 * 60 * 1000 ms)
  windowMs: 15 * 60 * 1000,
  // Allow only 10 requests per window per IP
  max: 10,
  message: { success: false, message: 'Too many attempts, try again after 15 minutes' },
});

/**
 * General API rate limiter
 * Moderate limit: 100 requests per minute
 * 
 * @description
 * Applied to all API endpoints to prevent:
 * - Excessive API calls
 * - Resource exhaustion
 * - Automated abuse
 * 
 * @constant {Object} apiLimiter
 * @property {number} windowMs - Time window in milliseconds (1 minute)
 * @property {number} max - Maximum requests allowed in window
 * @property {Object} message - Error response when limit exceeded
 */
const apiLimiter = rateLimit({
  // 1 minute window (1 * 60 * 1000 ms)
  windowMs: 1 * 60 * 1000,
  // Allow 100 requests per minute per IP
  max: 100,
  message: { success: false, message: 'Too many requests' },
});

module.exports = { authLimiter, apiLimiter };