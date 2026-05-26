const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");

const InventoryBatchController = require("../controllers/InventoryBatchController");

router.get("/", auth, requireRole(["admin", "warehouse_manager", "order_processing"]), InventoryBatchController.getInventoryBatches);
router.get("/:id", auth, requireRole(["admin", "warehouse_manager", "order_processing"]), InventoryBatchController.getById);
router.get("/search-import/:number", auth, requireRole(["admin", "warehouse_manager"]), InventoryBatchController.getBatchByBatchNumber);
router.post("/", auth, requireRole(["admin", "warehouse_manager"]), InventoryBatchController.create);
router.put("/:id", auth, requireRole(["admin", "warehouse_manager"]), InventoryBatchController.update);
router.delete("/:id", auth, requireRole(["admin", "warehouse_manager"]), InventoryBatchController.delete);

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

/**
 * @openapi
 * /api/inventory-batches/search-import/{number}:
 *   get:
 *     summary: Get batch information by batch number for importing
 *     tags:
 *       - Inventory Batches
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         description: Batch number of the batch to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get batch information successfully
 */
/**
 * @openapi
 * /api/inventory-batches:
 *   post:
 *     summary: Register a new batch
 *     tags:
 *       - Inventory Batches
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *               batch_code:
 *                 type: string
 *                 example: LOT-000001
 *               mfg_date:
 *                 type: string
 *                 format: date-time
 *               exp_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Batch created
 */

/**
 * @openapi
 * /api/inventory-batches/{id}:
 *   put:
 *     summary: Update batch information
 *     tags:
 *       - Inventory Batches
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the batch to be updated
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *               batch_code:
 *                 type: string
 *                 example: LOT-000001
 *               mfg_date:
 *                 type: string
 *                 format: date-time
 *               exp_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Batch updated
 */

/**
 * @openapi
 * /api/inventory-batches/{id}:
 *   delete:
 *     summary: Delete batch
 *     tags:
 *       - Inventory Batches
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the batch to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Batch deleted
 */