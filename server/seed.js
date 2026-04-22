require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

const platformSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['super_admin', 'sub_admin'], default: 'sub_admin' },
  permissions: {
    viewRestaurants:     { type: Boolean, default: false },
    manageSubscriptions: { type: Boolean, default: false },
    manageCMS:           { type: Boolean, default: false },
    sendBulkMail:        { type: Boolean, default: false },
    verifyKYC:           { type: Boolean, default: false },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Platform = mongoose.model('Platform', platformSchema);

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', MONGO_URI);

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,   // 👈 This fixes the Windows Node v24 DNS issue
    });

    console.log('✅ MongoDB connected!');

    const existing = await Platform.findOne({ email: 'superadmin@platform.com' });
    if (existing) {
      console.log('⚠️  Super admin already exists!');
      console.log('Email:    superadmin@platform.com');
      console.log('Password: Admin@123');
      await mongoose.disconnect();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    await Platform.create({
      name: 'Super Admin',
      email: 'superadmin@platform.com',
      password: hashedPassword,
      role: 'super_admin',
      permissions: {
        viewRestaurants:     true,
        manageSubscriptions: true,
        manageCMS:           true,
        sendBulkMail:        true,
        verifyKYC:           true,
      },
      isActive: true,
    });

    console.log('');
    console.log('✅ Super Admin created successfully!');
    console.log('─────────────────────────────────────');
    console.log('  Email:    superadmin@platform.com');
    console.log('  Password: Admin@123');
    console.log('─────────────────────────────────────');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();