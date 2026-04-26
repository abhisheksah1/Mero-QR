/**
 * Cron Job Service
 * Handles scheduled background tasks for the application
 * 
 * @module services/cron
 * @description
 * Automated jobs that run on schedule:
 * - Daily check for expired subscriptions
 * - Warning emails for expiring packages
 * - Cleanup of stale data
 * 
 * Uses node-cron for scheduling (Unix cron syntax)
 */

const cron = require('node-cron');
const Restaurant = require('../models/Restaurant.model');
const { sendPackageExpiryEmail } = require('./email.service');

/**
 * Start all scheduled cron jobs
 * 
 * @function startCronJobs
 * @description
 * Initializes all automated background tasks:
 * - Runs daily at midnight to check package expiration
 * - Deactivates expired restaurant accounts
 * - Sends warning emails to restaurants expiring soon
 */
const startCronJobs = () => {
  // Cron syntax: "0 0 * * *" = Run at midnight (00:00) every day
  cron.schedule('0 0 * * *', async () => {
    const now = new Date();

    // Find and deactivate restaurants with expired packages
    const expired = await Restaurant.find({
      isActive: true,
      packageExpiresAt: { $lt: now },  // Expired before now
    });

    // Deactivate each expired restaurant and send notification
    for (const r of expired) {
      r.isActive = false;
      await r.save();
      await sendPackageExpiryEmail(r.email, r.name, 0);
    }

    // Find restaurants expiring in next 3 days for warning
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const expiringSoon = await Restaurant.find({
      isActive: true,
      packageExpiresAt: {
        $gte: now,           // Not yet expired
        $lte: threeDaysLater // But expiring within 3 days
      },
    });

    for (const r of expiringSoon) {
      const daysLeft = Math.ceil((r.packageExpiresAt - now) / (1000 * 60 * 60 * 24));
      await sendPackageExpiryEmail(r.email, r.name, daysLeft);
    }

    console.log(`Cron: ${expired.length} deactivated, ${expiringSoon.length} warned`);
  });
};

module.exports = startCronJobs;