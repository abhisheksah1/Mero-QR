const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { apiLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ── Core Middleware
app.use(helmet()); // Set secure HTTP headers
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON request bodies
app.use(apiLimiter); // Apply global rate limiting to prevent abuse

// ── Platform Routes (platform.yourdomain.com or /api/platform)
// Handles super-admin level operations: managing restaurants, subscriptions, and CMS
app.use("/api/platform/auth", require("./routes/platform/auth.routes")); // Platform admin authentication (login, logout, token refresh)
app.use(
  "/api/platform/restaurants",
  require("./routes/platform/restaurant.routes"),
); // CRUD operations for onboarded restaurants
app.use(
  "/api/platform/subscriptions",
  require("./routes/platform/subscription.routes"),
); // Subscription plan management for restaurants
app.use("/api/platform/cms", require("./routes/platform/cms.routes")); // Content management (banners, announcements, etc.)
app.use("/api/platform/admins", require("./routes/platform/subAdmin.routes")); // Sub-admin creation and permission management

// ── Restaurant Routes (/api/restaurant)
// Handles restaurant-level operations: staff, menu, orders, and more
app.use("/api/restaurant/auth", require("./routes/restaurant/auth.routes")); // Restaurant owner/staff authentication
app.use("/api/restaurant/kyc", require("./routes/restaurant/kyc.routes")); // Know Your Customer verification and document uploads
app.use(
  "/api/restaurant/employees",
  require("./routes/restaurant/employee.routes"),
); // Employee management (roles, shifts, access)
app.use("/api/restaurant/menu", require("./routes/restaurant/menu.routes")); // Menu items, categories, and pricing
app.use("/api/restaurant/tables", require("./routes/restaurant/table.routes")); // Table layout and availability management
app.use("/api/restaurant/orders", require("./routes/restaurant/order.routes")); // Order lifecycle (create, update, status tracking)
app.use(
  "/api/restaurant/cashier",
  require("./routes/restaurant/cashier.routes"),
); // Cashier/POS operations and billing
app.use(
  "/api/restaurant/package",
  require("./routes/restaurant/package.routes"),
); // Restaurant subscription package handling
app.use(
  "/api/restaurant/inventory",
  require("./routes/restaurant/inventory.routes"),
); // Inventory tracking and stock management

// ── Global Error Handler
// Catches and formats all unhandled errors thrown across routes and middleware
app.use(errorHandler);

module.exports = app;
