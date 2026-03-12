const express = require("express");
const router = express.Router();

const OrderItemController = require("../controllers/OrderItemController");

router.post("/", OrderItemController.create);
router.get("/", OrderItemController.getAll);
router.get("/:id", OrderItemController.getById);
router.put("/:id", OrderItemController.update);
router.delete("/:id", OrderItemController.delete);

module.exports = router;

/**
 * @openapi
 * /api/order-items:
 *   get:
 *     summary: Get all order items
 *     tags:
 *       - Order Items
 *     responses:
 *       200:
 *         description: List of order items
 */

/**
 * @openapi
 * /order-items:
 *   post:
 *     summary: Create a new order item
 *     tags:
 *       - Order Items
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               product_name:
 *                 type: string
 *                 maxLength: 100
 *               quantity:
 *                 type: number
 *                 default: 1
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Order item created
 */

/**
 * @openapi
 * /order-items/{id}:
 *   put:
 *     summary: Update order item information
 *     tags:
 *       - Order Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the order item to be updated
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               product_name:
 *                 type: string
 *                 maxLength: 100
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Order item updated
 */

/**
 * @openapi
 * /order-items/{id}:
 *   delete:
 *     summary: Delete order item
 *     tags:
 *       - Order Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the order item to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order item deleted
 */