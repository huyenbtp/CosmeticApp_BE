const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const CartItemController = require("../controllers/CartItemController");

router.post("/", CartItemController.create);
router.get("/", CartItemController.getAll);
router.get("/:id", CartItemController.getById);
router.put("/:id", CartItemController.update);
router.delete("/:id", CartItemController.delete);

module.exports = router;

/**
 * @openapi
 * /api/cart-items:
 *   get:
 *     summary: Get all cart items
 *     tags:
 *       - CartItems
 *     responses:
 *       200:
 *         description: List of cart items
 */

/**
 * @openapi
 * /api/cart-items:
 *   post:
 *     summary: Create a new cart item
 *     tags:
 *       - CartItems
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               quantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Cart item created
 */

/**
 * @openapi
 * /api/cart-items/{id}:
 *   get:
 *     summary: Get cart item by ID
 *     tags:
 *       - CartItems
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the cart item
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart item details
 */

/**
 * @openapi
 * /api/cart-items/{id}:
 *   put:
 *     summary: Update cart item information
 *     tags:
 *       - CartItems
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the cart item to be updated
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart item updated
 */

/**
 * @openapi
 * /api/cart-items/{id}:
 *   delete:
 *     summary: Delete cart item
 *     tags:
 *       - CartItems
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the cart item to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cart item deleted
 */