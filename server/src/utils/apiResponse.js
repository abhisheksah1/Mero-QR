/**
 * API Response Utility Functions
 * Provides consistent response formatting for all API endpoints
 * 
 * @module utils/apiResponse
 * @description
 * Standardizes API responses across the entire application
 * to ensure consistent format for success and error responses.
 */

/**
 * Sends a successful API response
 * 
 * @function success
 * @param {Object} res - Express response object
 * @param {Object} [data={}] - Response data payload
 * @param {string} [message='Success'] - Success message
 * @param {number} [statusCode=200] - HTTP status code
 * @returns {JSON} JSON response with success flag
 * 
 * @example
 * // Basic success
 * success(res)
 * // => { success: true, message: 'Success', data: {} }
 * 
 * @example
 * // With data
 * success(res, { user: { id: 1 } }, 'User created', 201)
 * // => { success: true, message: 'User created', data: { user: { id: 1 } } }
 */
const success = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

/**
 * Sends an error API response
 * 
 * @function error
 * @param {Object} res - Express response object
 * @param {string} [message='Error'] - Error message
 * @param {number} [statusCode=400] - HTTP status code
 * @param {Object|null} [errors=null] - Additional error details
 * @returns {JSON} JSON response with failure flag
 * 
 * @example
 * // Basic error
 * error(res)
 * // => { success: false, message: 'Error' }
 * 
 * @example
 * // With custom status
 * error(res, 'Unauthorized', 401)
 * // => { success: false, message: 'Unauthorized' }
 */
const error = (res, message = 'Error', statusCode = 400, errors = null) => {
  return res.status(statusCode).json({ success: false, message, errors });
};

module.exports = { success, error };