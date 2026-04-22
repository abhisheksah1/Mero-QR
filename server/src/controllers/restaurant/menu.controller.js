const MenuItem = require('../../models/Menu.model');
const Category = require('../../models/Category.model');
const { success, error } = require('../../utils/apiResponse');

exports.createCategory = async (req, res) => {
  try {
    const cat = await Category.create({ ...req.body, restaurant: req.user.restaurantId });
    return success(res, cat, 'Category created', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create({ ...req.body, restaurant: req.user.restaurantId });
    return success(res, item, 'Menu item created', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getMenu = async (req, res) => {
  try {
    const restaurantId = req.user?.restaurantId || req.params.restaurantId;
    const categories = await Category.find({ restaurant: restaurantId, isActive: true }).lean();
    const items = await MenuItem.find({ restaurant: restaurantId }).lean();

    const menu = categories.map(cat => ({
      ...cat,
      items: items.filter(i => i.category.toString() === cat._id.toString()),
    }));

    return success(res, menu);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.itemId, restaurant: req.user.restaurantId },
      req.body,
      { new: true }
    );
    if (!item) return error(res, 'Item not found', 404);
    return success(res, item);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    await MenuItem.findOneAndDelete({ _id: req.params.itemId, restaurant: req.user.restaurantId });
    return success(res, null, 'Item deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};