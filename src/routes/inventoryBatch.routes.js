const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");

const InventoryBatchController = require("../controllers/InventoryBatchController");

router.get("/", auth, requireRole(["admin", "warehouse_manager"]), InventoryBatchController.getInventoryBatches);

module.exports = router;

/**
 * @openapi
 * /api/inventory-batches:
 *   get:
 *     summary: Get inventory batch with pagination, search and filters
 *     tags:
 *       - Inventory Batches
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 7 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search query
 *       - in: query
 *         name: expiredStatus
 *         schema:
 *           type: string
 *           enum: ["less-than-1-month", "1-3-months", "3-6-months"]
 *       - in: query
 *         name: stockStatus
 *         schema:
 *           type: string
 *           enum: ["low", "out"]
 *     responses:
 *       200:
 *         description: Inventory batches list with pagination
 */
