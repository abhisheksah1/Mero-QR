const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const restaurantSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  phone:        { type: String, required: true },
  password:     { type: String, required: true },
  slug:         { type: String, unique: true },
  logo:         { type: String },
  address:      { type: String },
  isKYCVerified:{ type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
  otp:          { type: String },
  otpExpiry:    { type: Date },
  currentPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  packageExpiresAt: { type: Date },
}, { timestamps: true });

restaurantSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

restaurantSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('Restaurant', restaurantSchema);