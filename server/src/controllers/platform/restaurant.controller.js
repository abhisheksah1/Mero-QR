const Restaurant = require('../../models/Restaurant.model');
const KYC = require('../../models/KYC.model');
const bcrypt = require('bcryptjs');
const { success, error } = require('../../utils/apiResponse');
const { sendKYCStatusEmail } = require('../../services/email.service');

// Get all restaurants (no sensitive data)
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find()
      .select('name email phone slug isKYCVerified isActive packageExpiresAt createdAt')
      .lean();
    return success(res, restaurants);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// Verify or reject KYC
exports.updateKYCStatus = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status, rejectionReason } = req.body;

    const kyc = await KYC.findOne({ restaurant: restaurantId });
    if (!kyc) return error(res, 'KYC not found', 404);

    kyc.status = status;
    kyc.rejectionReason = rejectionReason || '';
    kyc.reviewedBy = req.user.id;
    await kyc.save();

    if (status === 'approved') {
      await Restaurant.findByIdAndUpdate(restaurantId, { isKYCVerified: true });
    } else if (status === 'rejected') {
      await Restaurant.findByIdAndUpdate(restaurantId, { isKYCVerified: false });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    await sendKYCStatusEmail(restaurant.email, status, rejectionReason);

    return success(res, null, `KYC ${status}`);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// Reset restaurant password
exports.resetRestaurantPassword = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { newPassword } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return error(res, 'Restaurant not found', 404);

    restaurant.password = newPassword; // pre-save hook hashes it
    await restaurant.save();

    return success(res, null, 'Password reset successfully');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// Activate / Deactivate restaurant
exports.toggleRestaurantStatus = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return error(res, 'Not found', 404);

    restaurant.isActive = !restaurant.isActive;
    await restaurant.save();
    return success(res, { isActive: restaurant.isActive });
  } catch (err) {
    return error(res, err.message, 500);
  }
};