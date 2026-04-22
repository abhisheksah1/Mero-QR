const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema({
  key:       { type: String, required: true, unique: true }, // e.g. "homepage_hero", "about_us"
  title:     { type: String },
  content:   { type: String },
  type:      { type: String, enum: ['page', 'banner', 'faq', 'feature'], default: 'page' },
  isActive:  { type: Boolean, default: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform' },
}, { timestamps: true });

module.exports = mongoose.model('CMS', cmsSchema);