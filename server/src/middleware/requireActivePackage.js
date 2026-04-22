const Restaurant = require('../models/Restaurant.model');
const { error } = require('../utils/apiResponse');

const requireActivePackage = async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.user.restaurantId);
  if (!restaurant) return error(res, 'Restaurant not found', 404);
  if (!restaurant.isActive) return error(res, 'Your subscription has expired. Please renew your plan.', 403);
  next();
};

module.exports = requireActivePackage;