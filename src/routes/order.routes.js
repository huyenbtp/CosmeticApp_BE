const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");

const OrderController = require("../controllers/OrderController");

router.get("/", auth, OrderController.getAll);
router.get("/pagination", auth, requireRole(["admin", "warehouse_manager", "order_processing"]), OrderController.getOrders);
router.get("/user", auth, OrderController.getByUserId);
router.get("/:id", auth, OrderController.getById);
router.post("/", auth, OrderController.create);
router.post("/:id/cancel", auth, OrderController.customerCancel);
router.put("/pay", auth, OrderController.pay);
router.put("/:id", auth, OrderController.update);
router.delete("/:id", auth, OrderController.delete);

module.exports = router;

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     tags:
 *       - Orders
 *     responses:
 *       200:
 *         description: List of orders
 */

/**
 * @openapi
 * /api/orders/pagination:
 *   get:
 *     summary: Get orders with pagination, search and filters
 *     tags:
 *       - Orders
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
 *         name: fromDate
 *         schema: { type: Date }
 *       - in: query
 *         name: toDate
 *         schema: { type: Date }
 *       - in: query
 *         name: payment_method
 *         schema:
 *           type: string
 *           enum: [cod, bank_transfer]
 *       - in: query
 *         name: order_status
 *         schema:
 *           type: string
 *           enum: ["pending", "confirmed", "packed", "shipping", "delivered", "cancelled", "returned"]
 *     responses:
 *       200:
 *         description: Orders list with pagination
 */

/**
 * @openapi
 * /api/orders/user:
 *   get:
 *     summary: Get orders of the authenticated user 
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["pending", "confirmed", "packed", "shipping", "delivered", "cancelled", "returned"]
 *         description: Order status
 *     responses:
 *       200:
 *         description: Order list
 */

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the order to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 */

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     description: >
 *       Create a new order.
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: Customer's user ID
 *                 example: 69f8d3315d94135bf5f59911
 *               shipping_fee:
 *                 type: number
 *                 example: 0
 *               payment_method:
 *                 type: string
 *                 example: cod
 *               notes:
 *                 type: string
 *               receiver_name:
 *                 type: string
 *                 example: Bich La
 *               phone:
 *                 type: string
 *                 example: 0912345678
 *               address_line:
 *                 type: string
 *                 example: 123 duong A
 *               ward:
 *                 type: string
 *                 example: Phuong B
 *               district:
 *                 type: string
 *                 example: Thanh pho Thu Duc
 *               city:
 *                 type: string
 *                 example: Thanh pho Ho Chi Minh
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                     - unit_price
 *                     - quantity
 *                   properties:
 *                     product_id:
 *                       type: string
 *                       example: 69fd0e8ea6f3f75746cfa6b2
 *                     unit_price:
 *                       type: number
 *                       example: 120000
 *                     quantity:
 *                       type: number
 *                       minimum: 1
 *                       example: 2
 *     responses:
 *       201:
 *         description: Order created successfully
 */

/**
 * @openapi
 * /api/orders/{id}/cancel:
 *   post:
 *     summary: Customer cancel their order
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the order to be cancelled
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 */

/**
 * @openapi
 * /api/orders/pay:
 *   put:
 *     summary: Update order's payment status to "paid" with payment method
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *                 example: 694c4eed15b3de6c9014fd81
 *               payment_method:
 *                 type: string
 *                 example: bank_transfer
 *     responses:
 *       200:
 *         description: Order paid
 */

/**
 * @openapi
 * /api/orders/{id}:
 *   put:
 *     summary: Update order information
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the order to be updated
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_code:
 *                 type: string
 *               discount_amount:
 *                 type: number
 *               customer_id:
 *                 type: string
 *               total_items:
 *                 type: number
 *               subtotal:
 *                 type: number
 *               points_used:
 *                 type: number
 *               total:
 *                 type: number
 *               payment_method:
 *                 type: string
 *               payment_status:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order updated
 */

/**
 * @openapi
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete order
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the order to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted
 */