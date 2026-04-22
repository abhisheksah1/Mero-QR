const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  restaurant:  { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableNumber: { type: String, required: true },
  qrCode:      { type: String },   // base64 or URL
  qrToken:     { type: String },   // unique token embedded in QR URL
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

tableSchema.index({ restaurant: 1, tableNumber: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);