const Restaurant = require('../../models/Restaurant.model');
const Subscription = require('../../models/Subscription.model');
const { success, error } = require('../../utils/apiResponse');

exports.getPackageStatus = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.user.restaurantId)
      .populate('currentPackage', 'name planType durationLabel price');

    const now = new Date();
    const daysLeft = restaurant.packageExpiresAt
      ? Math.max(0, Math.ceil((restaurant.packageExpiresAt - now) / (1000 * 60 * 60 * 24)))
      : 0;

    return success(res, {
      plan: restaurant.currentPackage,
      packageExpiresAt: restaurant.packageExpiresAt,
      daysLeft,
      isActive: restaurant.isActive,
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};