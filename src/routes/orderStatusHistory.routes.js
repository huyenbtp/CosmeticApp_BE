const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");

const OrderStatusHistoryController = require("../controllers/OrderStatusHistoryController");

router.get("/:id", auth, requireRole(["admin", "order_processing"]), OrderStatusHistoryController.getAllByOrderId);
router.post("/", auth, requireRole(["admin", "order_processing"]), OrderStatusHistoryController.create);
router.delete("/:id", auth, requireRole(["admin", "order_processing"]), OrderStatusHistoryController.delete);

module.exports = router;

/**
 * @openapi
 * /api/order-status-history/{id}:
 *   get:
 *     summary: Get status history for a specific order
 *     tags:
 *       - Order Status History
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: List of status history for the order
 */

/**
 * @openapi
 * /api/order-status-history:
 *   post:
 *     summary: Create a new order status history record
 *     tags:
 *       - Order Status History
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *               - status
 *               - notes
 *             properties:
 *               order_id:
 *                 type: string
 *               newStatus:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: History record created
 */

/**
 * @openapi
 * /api/order-status-history/{id}:
 *   delete:
 *     summary: Delete history record
 *     tags:
 *       - Order Status History
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: History record deleted
 */