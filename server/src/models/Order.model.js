const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem:  { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name:      { type: String },
  quantity:  { type: Number, default: 1 },
  price:     { type: Number },
  note:      { type: String },
});

const orderSchema = new mongoose.Schema({
  restaurant:  { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  table:       { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
  items:       [orderItemSchema],
  status:      { type: String, enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'], default: 'pending' },
  totalAmount: { type: Number },
  isPaid:      { type: Boolean, default: false },
  paymentMethod: { type: String, enum: ['cash', 'card', 'online'] },
  handledBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },  // cashier
  note:        { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);