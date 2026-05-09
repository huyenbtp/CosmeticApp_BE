const express = require("express");
const router = express.Router();

const OrderStatusHistoryController = require("../controllers/OrderStatusHistoryController");

router.post("/", OrderStatusHistoryController.create);
router.get("/", OrderStatusHistoryController.getAll);
router.get("/order/:orderId", OrderStatusHistoryController.getByOrderId);
router.get("/:id", OrderStatusHistoryController.getById);
router.delete("/:id", OrderStatusHistoryController.delete);

module.exports = router;

/**
 * @openapi
 * /api/order-status-history:
 *   get:
 *     summary: Get all order status history records
 *     tags:
 *       - Order Status History
 *     responses:
 *       200:
 *         description: List of history records
 */

/**
 * @openapi
 * /api/order-status-history/order/{orderId}:
 *   get:
 *     summary: Get status history for a specific order
 *     tags:
 *       - Order Status History
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: List of history entries for the order
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
 *               - updatedBy
 *             properties:
 *               order_id:
 *                 type: string
 *               status:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *     responses:
 *       201:
 *         description: History record created
 */

/**
 * @openapi
 * /api/order-status-history/{id}:
 *   get:
 *     summary: Get history record by ID
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
 *         description: History record details
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