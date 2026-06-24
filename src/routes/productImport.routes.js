const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");

const ProductImportController = require("../controllers/ProductImportController");

router.post("/", auth, requireRole(["admin", "warehouse_manager"]), ProductImportController.create);
router.put("/:id", auth, requireRole(["admin", "warehouse_manager"]), ProductImportController.update);
router.post("/:id/confirm", auth, requireRole(["admin", "warehouse_manager"]), ProductImportController.confirmImport);
router.delete("/:id", auth, requireRole(["admin", "warehouse_manager"]), ProductImportController.deleteImport);
router.get("/", auth, requireRole(["admin", "warehouse_manager"]), ProductImportController.getProductImports);
router.get("/stats", auth, requireRole(["admin", "warehouse_manager"]), ProductImportController.getStats);
router.get("/:id", auth, ProductImportController.getById);
router.patch("/:id/notes", auth, requireRole(["admin", "warehouse_manager"]), ProductImportController.updateNotes);

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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, confirmed]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [purchase, returned_order]
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
 *               notes:
 *                 type: string
 *                 example: "Nhập hàng đầu tháng"
 *               status:
 *                 type: string
 *                 enum: [draft, confirmed]
 *                 example: draft
 *               type:
 *                 type: string
 *                 enum: [purchase, customer_return]
 *                 example: purchase
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - batch_id
 *                     - unit_price
 *                     - quantity
 *                   properties:
 *                     batch_id:
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
 * /api/product-imports/{id}:
 *   put:
 *     summary: Update product import
 *     tags:
 *       - Product Imports
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the product import to be updated
 *         schema:
 *           type: string
 *         example: "6943db6002bfd4a421467504"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Nhập hàng đầu tháng"
 *               type:
 *                 type: string
 *                 enum: [purchase, customer_return]
 *                 example: purchase
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - batch_id
 *                     - unit_price
 *                     - quantity
 *                   properties:
 *                     batch_id:
 *                       type: string
 *                       example: "65a8b5c1c2a1e91234567891"
 *                     unit_price:
 *                       type: number
 *                       example: 120000
 *                     quantity:
 *                       type: number
 *                       example: 10
 *     responses:
 *       200:
 *         description: Product import updated successfully
 */

/**
 * @openapi
 * /api/product-imports/{id}/confirm:
 *   post:
 *     summary: Confirm draft product import to create batch inventory
 *     tags:
 *       - Product Imports
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the import to be confirmed
 *         schema:
 *           type: string
 *         example: "6943db6002bfd4a421467504"
 *     responses:
 *       200:
 *         description: Product import confirmed, batch(es) created
 */

/**
 * @openapi
 * /api/product-imports/{id}:
 *   delete:
 *     summary: Delete draft product import
 *     tags:
 *       - Product Imports
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the import to be deleted
 *         schema:
 *           type: string
 *         example: "6943db6002bfd4a421467504"
 *     responses:
 *       200:
 *         description: Product import deleted
 */

/**
 * @openapi
 * /api/product-imports/{id}/notes:
 *   patch:
 *     summary: Update product import notes
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
 *               notes:
 *                 type: string
 *                 example: "some notes for this import"
 * 
 *     responses:
 *       200:
 *         description: Product import's notes updated
 */