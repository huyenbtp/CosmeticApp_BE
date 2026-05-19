const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");

const ProductExportController = require("../controllers/ProductExportController");

router.post("/", auth, requireRole(["admin", "warehouse_manager"]), ProductExportController.createNormalExport);
router.get("/", auth, requireRole(["admin", "warehouse_manager", "order_processing"]), ProductExportController.getProductExports);
router.get("/:id", auth, requireRole(["admin", "warehouse_manager", "order_processing"]), ProductExportController.getById);
router.patch("/:id/notes", auth, requireRole(["admin", "warehouse_manager", "order_processing"]), ProductExportController.updateNotes);

module.exports = router;

/**
 * @openapi
 * /api/product-exports:
 *   get:
 *     summary: Get product exports with pagination, search and filters
 *     tags:
 *       - Product Exports
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: ["sales", "discard", "adjust"]
 *     responses:
 *       200:
 *         description: Product export list with pagination
 */

/**
 * @openapi
 * /api/product-exports/{id}:
 *   get:
 *     summary: Get product export information by ID
 *     tags:
 *       - Product Exports
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the export to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get product export information successfully
 */

/**
 * @openapi
 * /api/product-exports:
 *   post:
 *     summary: Create a new product export (sales export can not be created here)
 *     tags:
 *       - Product Exports
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - items
 *             properties:
 *               notes:
 *                 type: string
 *                 example: "Hàng hết hạn"
 *               type:
 *                 type: string
 *                 enum: ["discard", "adjust"]
 *                 example: discard
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
 *                     batch_id:
 *                       type: string
 *                       example: "65a8b5c1c2a1e91234567891"
 *                     unit_price:
 *                       type: number
 *                       example: 120000
 *                     quantity:
 *                       type: number
 *                       example: 10
 *                     notes:
 *                       type: string
 *                       example: ""
 *     responses:
 *       201:
 *         description: Product export created successfully
 */

/**
 * @openapi
 * /api/product-exports/{id}/notes:
 *   patch:
 *     summary: Update product export notes
 *     tags:
 *       - Product Exports
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the export to be updated
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
 *                 example: "some notes for this export"
 * 
 *     responses:
 *       200:
 *         description: Product export's notes updated
 */