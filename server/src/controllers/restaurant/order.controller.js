const Order = require('../../models/Order.model');
const Table = require('../../models/Table.model');
const { emitNewOrder, emitOrderUpdate } = require('../../services/socket.service');
const { deductInventory } = require('../../services/inventory.service');
const { success, error } = require('../../utils/apiResponse');

exports.placeOrder = async (req, res) => {
  try {
    const { qrToken, items, note } = req.body;

    const table = await Table.findOne({ qrToken, isActive: true });
    if (!table) return error(res, 'Invalid QR code', 400);

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = await Order.create({
      restaurant: table.restaurant,
      table: table._id,
      items,
      totalAmount,
      note,
    });

    // Deduct inventory automatically
    await deductInventory(table.restaurant, items);

    // Emit to kitchen and restaurant dashboard in real time
    emitNewOrder(table.restaurant.toString(), order);

    return success(res, order, 'Order placed', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const restaurantId = req.user.restaurantId;

    const order = await Order.findOneAndUpdate(
      { _id: orderId, restaurant: restaurantId },
      { status },
      { new: true }
    );
    if (!order) return error(res, 'Order not found', 404);

    emitOrderUpdate(restaurantId.toString(), order);
    return success(res, order);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { restaurant: req.user.restaurantId };
    if (status) filter.status = status;

    const orders = await Order.find(filter).populate('table', 'tableNumber').sort({ createdAt: -1 });
    return success(res, orders);
  } catch (err) {
    return error(res, err.message, 500);
  }
};