/**
 * Restaurant Model
 * Mongoose schema for restaurant/tenant data
 * 
 * @module models/Restaurant
 * @description
 * Represents a restaurant/tenant in the multi-tenant system:
 * - Stores restaurant profile and authentication data
 * - Tracks KYC and subscription status
 * - Manages OTP for phone verification
 * 
 * @schema Restaurant
 * @property {string} name - Restaurant name (required)
 * @property {string} email - Contact email (required, unique)
 * @property {string} phone - Contact phone (required)
 * @property {string} password - Hashed password (required)
 * @property {string} slug - URL-friendly identifier (unique)
 * @property {string} logo - Logo image URL
 * @property {string} address - Physical address
 * @property {boolean} isKYCVerified - KYC verification status
 * @property {boolean} isActive - Subscription active status
 * @property {string} otp - Current OTP for verification
 * @property {Date} otpExpiry - OTP expiration time
 * @property {ObjectId} currentPackage - Active subscription reference
 * @property {Date} packageExpiresAt - Subscription expiration date
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define restaurant schema with all fields
const restaurantSchema = new mongoose.Schema({
  // Basic restaurant information
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  phone:        { type: String, required: true },
  password:     { type: String, required: true },
  slug:         { type: String, unique: true },
  logo:         { type: String },
  address:      { type: String },
  
  // Verification and status flags
  isKYCVerified:{ type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
  
  // OTP verification fields (for phone verification)
  otp:          { type: String },
  otpExpiry:    { type: Date },
  
  // Subscription management
  currentPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  packageExpiresAt: { type: Date },
}, { timestamps: true }); // Automatically add createdAt and updatedAt

/**
 * Pre-save middleware - Hash password before saving
 * Only hashes if password field has been modified
 * Uses bcrypt with salt rounds of 10
 */
restaurantSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/**
 * Password comparison method
 * Used for login authentication
 * 
 * @method matchPassword
 * @param {string} plain - Plain text password to compare
 * @returns {Promise<boolean>} True if passwords match
 */
restaurantSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('Restaurant', restaurantSchema);