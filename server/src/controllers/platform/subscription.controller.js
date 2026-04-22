const Subscription = require('../../models/Subscription.model');
const Restaurant = require('../../models/Restaurant.model');
const { success, error } = require('../../utils/apiResponse');

exports.createPlan = async (req, res) => {
  try {
    const plan = await Subscription.create(req.body);
    return success(res, plan, 'Plan created', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Subscription.find({ isActive: true });
    return success(res, plans);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.assignPlanToRestaurant = async (req, res) => {
  try {
    const { restaurantId, planId } = req.body;
    const plan = await Subscription.findById(planId);
    if (!plan) return error(res, 'Plan not found', 404);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);

    await Restaurant.findByIdAndUpdate(restaurantId, {
      currentPackage: planId,
      packageExpiresAt: expiresAt,
      isActive: true,
    });

    return success(res, { expiresAt }, 'Plan assigned');
  } catch (err) {
    return error(res, err.message, 500);
  }
};