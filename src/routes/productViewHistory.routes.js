const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const ProductViewHistoryController = require("../controllers/ProductViewHistoryController");

router.get("/", auth, ProductViewHistoryController.getAllByUserId);
router.post("/", auth, ProductViewHistoryController.viewProduct);
router.delete("/:id", auth, ProductViewHistoryController.delete);

module.exports = router;

/**
 * @openapi
 * /api/product-view-history:
 *   get:
 *     summary: Get all product view history records of the user who sent the request
 *     tags:
 *       - Product View History
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
 *       - Product View History
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: string
 *                 description: ID of the product
 *     responses:
 *       201:
 *         description: Product view history recorded
 */

/**
 * @openapi
 * /api/product-view-history/{id}:
 *   delete:
 *     summary: Delete a product view history record
 *     tags:
 *       - Product View History
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