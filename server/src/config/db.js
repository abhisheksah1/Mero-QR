const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,  // Force IPv4 — fixes Node v18+ DNS issues on Windows
    });

    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('─────────────────────────────────');
    console.error('DB CONNECTION FAILED');
    console.error('Reason:', err.message);
    console.error('─────────────────────────────────');
    process.exit(1);
  }
};

module.exports = connectDB;