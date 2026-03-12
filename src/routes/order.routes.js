const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");

const OrderController = require("../controllers/OrderController");

router.get("/", auth, OrderController.getAll);
router.get("/:id", auth, OrderController.getById);
router.post("/", auth, OrderController.create);
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
 *                 example: 64fa12abc1234567890defab
 *               discount_id:
 *                 type: string
 *                 nullable: true
 *                 description: Discount ID (optional)
 *                 example: 64fa12abc1234567890defab
 *               points_used:
 *                 type: number
 *                 minimum: 0
 *                 example: 100
 *               notes:
 *                 type: string
 *                 example: Customer wants quick checkout
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
 *                       example: 65a8b5c1c2a1e91234567891
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