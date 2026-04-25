const MenuItem = require('../../models/Menu.model');
const Category = require('../../models/Category.model');
const { success, error } = require('../../utils/apiResponse');



// Create Category
exports.createCategory = async (req, res) => {
  try {
    const cat = await Category.create({
      ...req.body,
      restaurant: req.user.restaurantId
    });
    return success(res, cat, 'Category created', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};


// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      {
        _id: req.params.categoryId,
        restaurant: req.user.restaurantId
      },
      req.body,
      { new: true }
    );

    if (!category) return error(res, 'Category not found', 404);

    return success(res, category, 'Category updated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};


// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    // Optional: prevent delete if items exist
    const items = await MenuItem.find({ category: req.params.categoryId });

    if (items.length > 0) {
      return error(res, 'Cannot delete category with menu items', 400);
    }

    const category = await Category.findOneAndDelete({
      _id: req.params.categoryId,
      restaurant: req.user.restaurantId
    });

    if (!category) return error(res, 'Category not found', 404);

    return success(res, null, 'Category deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};


// Create Menu Item
exports.createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create({
      ...req.body,
      restaurant: req.user.restaurantId
    });
    return success(res, item, 'Menu item created', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};


// Get Menu
exports.getMenu = async (req, res) => {
  try {
    const restaurantId = req.user?.restaurantId || req.params.restaurantId;

    const categories = await Category.find({
      restaurant: restaurantId,
      isActive: true
    }).lean();

    const items = await MenuItem.find({
      restaurant: restaurantId
    }).lean();

    const menu = categories.map(cat => ({
      ...cat,
      items: items.filter(
        i => i.category.toString() === cat._id.toString()
      ),
    }));

    return success(res, menu);
  } catch (err) {
    return error(res, err.message, 500);
  }
};


// Update Menu Item
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOneAndUpdate(
      {
        _id: req.params.itemId,
        restaurant: req.user.restaurantId
      },
      req.body,
      { new: true }
    );

    if (!item) return error(res, 'Item not found', 404);

    return success(res, item, 'Menu item updated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};


// Delete Menu Item
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOneAndDelete({
      _id: req.params.itemId,
      restaurant: req.user.restaurantId
    });

    if (!item) return error(res, 'Item not found', 404);

    return success(res, null, 'Item deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};