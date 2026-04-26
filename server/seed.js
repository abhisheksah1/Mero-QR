require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ── Environment
const MONGO_URI = process.env.MONGO_URI;

// ── Inline Schema
// Defined here instead of importing the model to keep the seed script
// self-contained and runnable independently of the main app.
const platformSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "sub_admin"],
      default: "sub_admin",
    },
    permissions: {
      viewRestaurants: { type: Boolean, default: false }, // Can view all onboarded restaurants
      manageSubscriptions: { type: Boolean, default: false }, // Can create/edit subscription plans
      manageCMS: { type: Boolean, default: false }, // Can manage banners, announcements, etc.
      sendBulkMail: { type: Boolean, default: false }, // Can send bulk emails to restaurants/users
      verifyKYC: { type: Boolean, default: false }, // Can approve or reject KYC submissions
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Platform = mongoose.model("Platform", platformSchema);

// ── Seed Entry Point
async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    console.log("URI:", MONGO_URI);

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Timeout if no server found within 30s
      socketTimeoutMS: 45000, // Timeout if socket is idle for 45s
      family: 4, // Force IPv4 — fixes DNS resolution on Windows with Node v24
    });

    console.log("✅ MongoDB connected!");

    // ── Idempotency Check
    // Prevent duplicate super admin creation on repeated seed runs
    const existing = await Platform.findOne({
      email: "superadmin@platform.com",
    });
    if (existing) {
      console.log("⚠️  Super admin already exists!");
      console.log("Email:    superadmin@platform.com");
      console.log("Password: Admin@123");
      await mongoose.disconnect();
      process.exit(0);
    }

    // ── Hash Password
    // Salt rounds = 10 (good balance of security vs. performance for seeding)
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    // ── Create Super Admin
    // Granted all permissions by default as the top-level platform administrator
    await Platform.create({
      name: "Super Admin",
      email: "superadmin@platform.com",
      password: hashedPassword,
      role: "super_admin",
      permissions: {
        viewRestaurants: true,
        manageSubscriptions: true,
        manageCMS: true,
        sendBulkMail: true,
        verifyKYC: true,
      },
      isActive: true,
    });

    console.log("");
    console.log("✅ Super Admin created successfully!");
    console.log("─────────────────────────────────────");
    console.log("  Email:    superadmin@platform.com");
    console.log("  Password: Admin@123");
    console.log("─────────────────────────────────────");
    console.log("");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    // ── Error Handling
    // Ensure DB connection is always closed even on failure, then exit with error code
    console.error("❌ Seed failed:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
