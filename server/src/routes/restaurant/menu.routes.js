const router = require("express").Router();
const ctrl = require("../../controllers/restaurant/menu.controller");

const verifyToken = require("../../middleware/verifyToken");
const requireRole = require("../../middleware/requireRole");
const requireKYC = require("../../middleware/requireKYC");
const requireActivePackage = require("../../middleware/requireActivePackage");

// Public menu (QR scan access)
router.get("/public/:restaurantId", ctrl.getMenu);

router.use(
  verifyToken,
  requireRole("restaurant"),
  requireKYC,
  requireActivePackage,
);

// Create Category
router.post("/categories", ctrl.createCategory);

// Get Menu (includes categories + items)
router.get("/", ctrl.getMenu);

// Update Category
router.patch("/categories/:categoryId", ctrl.updateCategory);

// Delete Category
router.delete("/categories/:categoryId", ctrl.deleteCategory);

// Create Item
router.post("/items", ctrl.createMenuItem);

// Update Item
router.patch("/items/:itemId", ctrl.updateMenuItem);

// Delete Item
router.delete("/items/:itemId", ctrl.deleteMenuItem);

module.exports = router;
