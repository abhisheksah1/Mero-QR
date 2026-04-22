const Order = require('../../models/Order.model');
const Transaction = require('../../models/Transaction.model');
const { emitOrderUpdate } = require('../../services/socket.service');
const { success, error } = require('../../utils/apiResponse');

exports.processPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod } = req.body;
    const restaurantId = req.user.restaurantId;

    const order = await Order.findOne({ _id: orderId, restaurant: restaurantId, isPaid: false });
    if (!order) return error(res, 'Order not found or already paid', 404);

    order.isPaid = true;
    order.paymentMethod = paymentMethod;
    order.status = 'served';
    order.handledBy = req.user.employeeId;
    await order.save();

    const receiptNo = `RCP-${Date.now()}`;
    const transaction = await Transaction.create({
      restaurant: restaurantId,
      order: order._id,
      amount: order.totalAmount,
      paymentMethod,
      processedBy: req.user.employeeId,
      receiptNo,
    });

    emitOrderUpdate(restaurantId.toString(), order);
    return success(res, { transaction, receiptNo });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ restaurant: req.user.restaurantId })
      .populate('order', 'totalAmount items')
      .sort({ createdAt: -1 });
    return success(res, transactions);
  } catch (err) {
    return error(res, err.message, 500);
  }
};