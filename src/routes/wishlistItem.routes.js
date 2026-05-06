const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const WishlistItemController = require("../controllers/WishlistItemController");

router.post("/", auth, WishlistItemController.create);
router.get("/", auth, WishlistItemController.getAll);
router.get("/:id", auth, WishlistItemController.getById);
router.put("/:id", auth, WishlistItemController.update);
router.delete("/:id", auth, WishlistItemController.delete);

module.exports = router;

/**
 * @openapi
 * /api/wishlist-items:
 *   get:
 *     summary: Get all wishlist items
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
 *     summary: Create a new wishlist item
 *     tags:
 *       - Wishlist Items
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
 *             required:
 *               - user_id
 *               - product_id
 *     responses:
 *       201:
 *         description: Wishlist item created
 */

/**
 * @openapi
 * /api/wishlist-items/{id}:
 *   get:
 *     summary: Get wishlist item by ID
 *     tags:
 *       - Wishlist Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the wishlist item
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wishlist item details
 */

/**
 * @openapi
 * /api/wishlist-items/{id}:
 *   put:
 *     summary: Update wishlist item information
 *     tags:
 *       - Wishlist Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the wishlist item to be updated
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Wishlist item updated
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