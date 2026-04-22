const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  restaurant:   { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', unique: true },
  ownerName:    { type: String, required: true },
  idType:       { type: String, enum: ['passport', 'national_id', 'driving_license'], required: true },
  idNumber:     { type: String, required: true },
  idDocument:   { type: String },  // file path / URL
  status:       { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  reviewedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'Platform' },
}, { timestamps: true });

module.exports = mongoose.model('KYC', kycSchema);