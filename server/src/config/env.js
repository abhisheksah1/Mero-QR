/**
 * Environment Configuration Module
 * Loads and exports environment variables from .env file
 * 
 * @module config/env
 */

// Load environment variables from .env file into process.env
require("dotenv").config();

/**
 * Application Configuration Object
 * Centralized configuration for all environment-based settings
 * 
 * @description
 * All values are read from environment variables with fallback defaults
 * for development convenience. In production, all required variables
 * should be set in the .env file.
 * 
 * @constant {Object} config
 * @property {number} PORT - Server port number (default: 5000)
 * @property {string} MONGO_URI - MongoDB connection string
 * @property {string} JWT_SECRET - Secret key for JWT token generation
 * @property {string} JWT_EXPIRES_IN - JWT token expiration time (default: 7 days)
 * @property {string} MAIL_HOST - SMTP server hostname for sending emails
 * @property {string} MAIL_PORT - SMTP server port number
 * @property {string} MAIL_USER - SMTP authentication username
 * @property {string} MAIL_PASS - SMTP authentication password
 * @property {string} MAIL_FROM - Default sender email address
 * @property {string} CLIENT_URL - Frontend application URL
 * @property {string} PLATFORM_URL - Platform dashboard URL
 */
module.exports = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  
  // Database configuration
  MONGO_URI: process.env.MONGO_URI,
  
  // Authentication configuration
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  
  // Email/SMTP configuration
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT,
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  MAIL_FROM: process.env.MAIL_FROM,
  
  // External URLs
  CLIENT_URL: process.env.CLIENT_URL,
  PLATFORM_URL: process.env.PLATFORM_URL,
};
 