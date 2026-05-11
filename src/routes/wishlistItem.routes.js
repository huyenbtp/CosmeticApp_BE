const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const WishlistItemController = require("../controllers/WishlistItemController");

router.get("/", auth, WishlistItemController.getAllByUserId);
router.post("/", auth, WishlistItemController.create);
router.delete("/:id", auth, WishlistItemController.delete);

module.exports = router;

/**
 * @openapi
 * /api/wishlist-items:
 *   get:
 *     summary: Get all wishlist items of the user who sent the request
 *     tags:
 *       - Wishlist Items
 *     responses:
 *       200:
 *         description: List of wishlist items
 */

/**
 * @openapi
 * /api/wishlist-items:
 *   post:
 *     summary: Add a product to wishlist
 *     tags:
 *       - Wishlist Items
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *             required:
 *               - product_id
 *     responses:
 *       201:
 *         description: Wishlist item created
 */

/**
 * @openapi
 * /api/wishlist-items/{id}:
 *   delete:
 *     summary: Delete wishlist item
 *     tags:
 *       - Wishlist Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the wishlist item to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wishlist item deleted
 */