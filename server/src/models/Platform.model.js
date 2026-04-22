const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const platformSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['super_admin', 'sub_admin'], default: 'sub_admin' },
  permissions: {
    viewRestaurants:    { type: Boolean, default: false },
    manageSubscriptions:{ type: Boolean, default: false },
    manageCMS:          { type: Boolean, default: false },
    sendBulkMail:       { type: Boolean, default: false },
    verifyKYC:          { type: Boolean, default: false },
  },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Platform' },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

platformSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

platformSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('Platform', platformSchema);