const cron = require('node-cron');
const Restaurant = require('../models/Restaurant.model');
const { sendPackageExpiryEmail } = require('./email.service');

const startCronJobs = () => {
  // Runs every day at midnight
  cron.schedule('0 0 * * *', async () => {
    const now = new Date();

    // Deactivate expired restaurants
    const expired = await Restaurant.find({
      isActive: true,
      packageExpiresAt: { $lt: now },
    });

    for (const r of expired) {
      r.isActive = false;
      await r.save();
      await sendPackageExpiryEmail(r.email, r.name, 0);
    }

    // Warn restaurants expiring in 3 days
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const expiringSoon = await Restaurant.find({
      isActive: true,
      packageExpiresAt: {
        $gte: now,
        $lte: threeDaysLater,
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