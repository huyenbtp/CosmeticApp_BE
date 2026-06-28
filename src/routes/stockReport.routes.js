const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");
const StockReportController = require("../controllers/StockReportController");

const allowRoles = ["admin", "warehouse_manager", "order_processing"];

router.get("/overview", auth, requireRole(allowRoles), StockReportController.getOverview);

module.exports = router;
