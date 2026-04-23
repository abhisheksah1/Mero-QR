const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { apiLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiLimiter);

// ── Platform routes (platform.yourdomain.com or /api/platform)
app.use("/api/platform/auth", require("./routes/platform/auth.routes"));
app.use(
  "/api/platform/restaurants",
  require("./routes/platform/restaurant.routes"),
);
app.use(
  "/api/platform/subscriptions",
  require("./routes/platform/subscription.routes"),
);
app.use("/api/platform/cms", require("./routes/platform/cms.routes"));
app.use("/api/platform/admins", require("./routes/platform/subAdmin.routes"));

// ── Restaurant routes
app.use("/api/restaurant/auth", require("./routes/restaurant/auth.routes"));
app.use("/api/restaurant/kyc", require("./routes/restaurant/kyc.routes"));
app.use(
  "/api/restaurant/employees",
  require("./routes/restaurant/employee.routes"),
);
app.use("/api/restaurant/menu", require("./routes/restaurant/menu.routes"));
app.use("/api/restaurant/tables", require("./routes/restaurant/table.routes"));
app.use("/api/restaurant/orders", require("./routes/restaurant/order.routes"));
app.use(
  "/api/restaurant/cashier",
  require("./routes/restaurant/cashier.routes"),
);
app.use(
  "/api/restaurant/package",
  require("./routes/restaurant/package.routes"),
);
// Add this line with the other restaurant routes
app.use(
  "/api/restaurant/inventory",
  require("./routes/restaurant/inventory.routes"),
);

app.use(errorHandler);

module.exports = app;
