const Inventory = require('../models/Inventory.model');

// Deduct inventory when an order is placed
const deductInventory = async (restaurantId, orderItems) => {
  for (const item of orderItems) {
    await Inventory.findOneAndUpdate(
      { restaurant: restaurantId, menuItem: item.menuItem },
      { $inc: { quantity: -item.quantity } },
      { new: true }
    );
  }
};

// Check low stock items
const getLowStockItems = async (restaurantId) => {
  return Inventory.find({
    restaurant: restaurantId,
    $expr: { $lte: ['$quantity', '$lowStockAt'] },
  });
};

module.exports = { deductInventory, getLowStockItems };