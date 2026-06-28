const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");
const AnalyticsController = require("../controllers/AnalyticsController");

const allowRoles = ["admin", "warehouse_manager", "order_processing"];
const guard = [auth, requireRole(allowRoles)];

router.get("/kpis", ...guard, AnalyticsController.getKpis);
router.get("/revenue-trend", ...guard, AnalyticsController.getRevenueTrend);
router.get("/category-share", ...guard, AnalyticsController.getCategoryShare);
router.get("/top-products", ...guard, AnalyticsController.getTopProducts);

module.exports = router;

