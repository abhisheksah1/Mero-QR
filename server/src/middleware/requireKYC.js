const Restaurant = require('../models/Restaurant.model');
const { error } = require('../utils/apiResponse');

const requireKYC = async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.user.restaurantId);
  if (!restaurant || !restaurant.isKYCVerified)
    return error(res, 'Please verify your KYC to use this feature', 403);
  next();
};

module.exports = requireKYC;