const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  restaurant:    { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  order:         { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount:        { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'online'] },
  processedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  receiptNo:     { type: String, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);