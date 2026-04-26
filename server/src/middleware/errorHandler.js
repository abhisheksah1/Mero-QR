/**
 * Global Error Handler Middleware
 * Catches and formats all unhandled errors in the application
 * 
 * @module middleware/errorHandler
 * @description
 * Express error-handling middleware that:
 * - Logs full error stack trace for debugging
 * - Extracts status code from error or defaults to 500
 * - Returns consistent JSON error response to client
 */

/**
 * Express error handler middleware function
 * Must have 4 parameters to be recognized as error handler by Express
 * 
 * @function errorHandler
 * @param {Error} err - The error object from failed operations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {JSON} JSON response with error details
 */
const errorHandler = (err, req, res, next) => {
  // Log full error stack trace for debugging purposes
  console.error(err.stack);
  
  // Extract status code from error or default to 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;
  
  // Return consistent error response format
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;