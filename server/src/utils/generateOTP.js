/**
 * OTP (One-Time Password) Generator
 * Generates a 6-digit numeric OTP for authentication
 * 
 * @module utils/generateOTP
 * @description
 * Creates a random 6-digit OTP between 100000 and 999999
 * Used for phone/email verification and password reset flows.
 */

/**
 * Generates a random 6-digit OTP
 * 
 * @function generateOTP
 * @returns {string} 6-digit OTP as string (e.g., "123456")
 * 
 * @description
 * - Generates number between 100000 and 999999
 * - Returns as string to preserve leading zeros if any
 * - Used for: phone verification, email verification, password reset
 * 
 * @example
 * const otp = generateOTP();
 * console.log(otp); // "452891" (random each time)
 */
const generateOTP = () => {
  // Generate random number between 100000 and 999999
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = generateOTP;