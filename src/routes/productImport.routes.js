const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");

const ProductImportController = require("../controllers/ProductImportController");

router.post("/", auth, requireRole(["admin"]), ProductImportController.create);
router.get("/", auth, ProductImportController.getProductImports);
router.get("/stats", auth, ProductImportController.getStats);
router.get("/:id", auth, ProductImportController.getById);
router.patch("/:id/note", auth, requireRole(["admin"]), ProductImportController.updateNote);

module.exports = router;

/**
 * @openapi
 * /api/product-imports:
 *   get:
 *     summary: Get product imports with pagination, search and filters
 *     tags:
 *       - Product Imports
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
 *         name: by
 *         schema:
 *           type: string
 *           enum: [import_code, staff_name, staff_code]
 *         description: Fields to search by
 *       - in: query
 *         name: fromDate
 *         schema: { type: Date }
 *       - in: query
 *         name: toDate
 *         schema: { type: Date }
 *       - in: query
 *         name: minTotal
 *         schema: { type: number }
 *       - in: query
 *         name: maxTotal
 *         schema: { type: number }
 *     responses:
 *       200:
 *         description: Product import list with pagination
 */

/**
 * @openapi
 * /api/product-imports/stats:
 *   get:
 *     summary: Get product import filter statistics
 *     tags:
 *       - Product Imports
 *     responses:
 *       200:
 *         description: Min/max values for product import filters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAmount:
 *                   type: object
 *                   properties:
 *                     min:
 *                       type: number
 *                     max:
 *                       type: number
 */

/**
 * @openapi
 * /api/product-imports/{id}:
 *   get:
 *     summary: Get product import information by ID
 *     tags:
 *       - Product Imports
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the import to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get product import information successfully
 */

/**
 * @openapi
 * /api/product-imports:
 *   post:
 *     summary: Create a new product import
 *     tags:
 *       - Product Imports
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               note:
 *                 type: string
 *                 example: "Nhập hàng đầu tháng"
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
 *                       example: "65a8b5c1c2a1e91234567891"
 *                     unit_price:
 *                       type: number
 *                       example: 120000
 *                     quantity:
 *                       type: number
 *                       example: 10
 *     responses:
 *       201:
 *         description: Product import created successfully
 */

/**
 * @openapi
 * /api/product-imports/{id}/note:
 *   patch:
 *     summary: Update product import note
 *     tags:
 *       - Product Imports
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the import to be updated
 *         schema:
 *           type: string
 *         example: "6943db6002bfd4a421467504"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 example: "some note for this import"
 * 
 *     responses:
 *       200:
 *         description: Product import's note updated
 */