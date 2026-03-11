const express = require("express");
const router = express.Router();

const OrderDetailController = require("../controllers/OrderDetailController");

router.post("/", OrderDetailController.create);
router.get("/", OrderDetailController.getAll);
router.get("/:id", OrderDetailController.getById);
router.put("/:id", OrderDetailController.update);
router.delete("/:id", OrderDetailController.delete);

module.exports = router;

/**
 * @openapi
 * /api/order-details:
 *   get:
 *     summary: Get all order details
 *     tags:
 *       - Order Details
 *     responses:
 *       200:
 *         description: List of order details
 */

/**
 * @openapi
 * /order-details:
 *   post:
 *     summary: Create a new order detail
 *     tags:
 *       - Order Details
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
 *         description: Order detail created
 */

/**
 * @openapi
 * /order-details/{id}:
 *   put:
 *     summary: Update order detail information
 *     tags:
 *       - Order Details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the order detail to be updated
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
 *         description: Order detail updated
 */

/**
 * @openapi
 * /order-details/{id}:
 *   delete:
 *     summary: Delete order detail
 *     tags:
 *       - Order Details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the order detail to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order detail deleted
 */