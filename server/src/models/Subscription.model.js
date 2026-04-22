const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  name:         { type: String, required: true },        // e.g. "Basic Monthly"
  planType:     { type: String, enum: ['basic', 'business'], required: true },
  duration:     { type: Number, required: true },          // in days: 30, 90, 180, 365, 1460
  durationLabel:{ type: String },                          // "1 month", "3 months" etc.
  price:        { type: Number, required: true },
  features:     [{ type: String }],
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);