const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  menuItem:   { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  itemName:   { type: String, required: true },
  unit:       { type: String, default: 'pcs' },
  quantity:   { type: Number, default: 0 },
  lowStockAt: { type: Number, default: 5 },  // alert threshold
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);