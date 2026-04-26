/**
 * Database Configuration Module
 * Handles MongoDB connection using Mongoose ODM
 * 
 * @module config/db
 */

const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

/**
 * Establishes connection to MongoDB database
 * Uses Mongoose for object data modeling
 * 
 * @async
 * @function connectDB
 * @returns {Promise<void>} Resolves when connected, exits on failure
 * @throws {Error} Logs error and exits process if connection fails
 * 
 * @description
 * - Connects to MongoDB using URI from environment config
 * - Sets timeout values to handle slow network scenarios
 * - Forces IPv4 to avoid DNS resolution issues on Windows with Node v18+
 * - Logs connection status and handles errors gracefully
 */
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');

    // Connect with configuration options
    await mongoose.connect(MONGO_URI, {
      // Time to wait for server selection (30 seconds)
      serverSelectionTimeoutMS: 30000,
      // Time to wait for operations to complete (45 seconds)
      socketTimeoutMS: 45000,
      // Force IPv4 - fixes Node v18+ DNS issues on Windows
      family: 4,
    });

    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('─────────────────────────────────');
    console.error('DB CONNECTION FAILED');
    console.error('Reason:', err.message);
    console.error('─────────────────────────────────');
    // Exit process to prevent running without database connection
    process.exit(1);
  }
};

module.exports = connectDB;