const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");

const DashboardController = require("../controllers/DashboardController");

const allowRoles = ["admin", "warehouse_manager", "order_processing"];
const guard = [auth, requireRole(allowRoles)];

router.get("/summary", ...guard, DashboardController.getSummary);
router.get("/sales-overview", ...guard, DashboardController.getSalesOverview);
router.get("/categories", ...guard, DashboardController.getCategories);
router.get("/customer-growth", ...guard, DashboardController.getCustomerGrowth);
router.get("/orders-by-status", ...guard, DashboardController.getOrdersByStatus);
router.get("/brands", ...guard, DashboardController.getBrands);
router.get("/top-products", ...guard, DashboardController.getTopProducts);

module.exports = router;
