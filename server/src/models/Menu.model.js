const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurant:   { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  category:     { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name:         { type: String, required: true },
  description:  { type: String },
  price:        { type: Number, required: true },
  image:        { type: String },
  isAvailable:  { type: Boolean, default: true },
  taxPercent:   { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);