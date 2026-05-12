const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const CartItemController = require("../controllers/CartItemController");

router.get("/", auth, CartItemController.getAllByUserId);
router.get("/count", auth, CartItemController.getTotalItemsByUserId);
router.post("/", auth, CartItemController.addToCart);
router.put("/:id", auth, CartItemController.updateQuantity);
router.delete("/:id", auth, CartItemController.delete);

module.exports = router;

/**
 * @openapi
 * /api/cart-items:
 *   get:
 *     summary: Get all cart items of the user who sent the request
 *     tags:
 *       - Cart Items
 *     responses:
 *       200:
 *         description: List of cart items
 */

/**
 * @openapi
 * /api/cart-items/count:
 *   get:
 *     summary: Get total cart items of the user who sent the request
 *     tags:
 *       - Cart Items
 *     responses:
 *       200:
 *         description: Total of cart items
 */


/**
 * @openapi
 * /api/cart-items:
 *   post:
 *     summary: Add a product to cart
 *     tags:
 *       - Cart Items
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 min: 1
 *                 max: 100
 *                 example: 1
 *     responses:
 *       201:
 *         description: Cart item created
 */

/**
 * @openapi
 * /api/cart-items/{id}:
 *   put:
 *     summary: Update cart item quantity
 *     tags:
 *       - Cart Items
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
 *                 min: 1
 *                 max: 100
 *                 example: 2
 *     responses:
 *       200:
 *         description: Cart item's quantity updated
 */

/**
 * @openapi
 * /api/cart-items/{id}:
 *   delete:
 *     summary: Delete cart item
 *     tags:
 *       - Cart Items
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