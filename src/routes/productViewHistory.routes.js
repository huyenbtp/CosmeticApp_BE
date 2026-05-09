const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const ProductViewHistoryController = require("../controllers/ProductViewHistoryController");

router.post("/", ProductViewHistoryController.create);
router.get("/", ProductViewHistoryController.getAll);
router.get("/:id", ProductViewHistoryController.getById);
router.put("/:id", ProductViewHistoryController.update);
router.delete("/:id", ProductViewHistoryController.delete);

module.exports = router;

/**
 * @openapi
 * /api/product-view-history:
 *   get:
 *     summary: Get all product view history records
 *     tags:
 *       - ProductViewHistory
 *     responses:
 *       200:
 *         description: List of product view history records
 */

/**
 * @openapi
 * /api/product-view-history:
 *   post:
 *     summary: Create a new product view history record
 *     tags:
 *       - ProductViewHistory
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - product_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: ID of the user
 *               product_id:
 *                 type: string
 *                 description: ID of the product
 *               view_count:
 *                 type: number
 *                 description: Number of views (defaults to 1)
 *                 default: 1
 *               last_viewed_at:
 *                 type: string
 *                 format: date-time
 *                 description: Timestamp of last view
 *     responses:
 *       201:
 *         description: Product view history record created
 */

/**
 * @openapi
 * /api/product-view-history/{id}:
 *   get:
 *     summary: Get product view history record by ID
 *     tags:
 *       - ProductViewHistory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product view history record
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product view history record details
 */

/**
 * @openapi
 * /api/product-view-history/{id}:
 *   put:
 *     summary: Update a product view history record
 *     tags:
 *       - ProductViewHistory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the record to update
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
 *               view_count:
 *                 type: number
 *               last_viewed_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Product view history record updated
 */

/**
 * @openapi
 * /api/product-view-history/{id}:
 *   delete:
 *     summary: Delete a product view history record
 *     tags:
 *       - ProductViewHistory
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the record to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product view history record deleted
 */