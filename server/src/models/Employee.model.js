const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  restaurant:        { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  username:          { type: String, required: true },
  password:          { type: String, required: true },
  role:              { type: String, enum: ['kitchen', 'cashier', 'admin'], required: true },
  isPasswordChanged: { type: Boolean, default: false },
  isActive:          { type: Boolean, default: true },
  createdBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
}, { timestamps: true });

// Compound unique: username unique per restaurant
employeeSchema.index({ restaurant: 1, username: 1 }, { unique: true });

employeeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

employeeSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('Employee', employeeSchema);