const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");
const upload = require("../middleware/upload");

const ProductController = require("../controllers/ProductController");

router.post("/", auth, requireRole(["admin"]), upload.single("image"), ProductController.create);
router.get("/pagination", auth, requireRole(["admin"]), ProductController.getProductsPaginated);
router.get("/infinite", auth, ProductController.getProductsInfinite);
router.get("/stats", auth, ProductController.getStats);
router.get("/:id", auth, ProductController.getById);
router.get("/import-item/:sku", auth, ProductController.getImportProductBySKU);
router.put("/:id", auth, requireRole(["admin"]), upload.single("image"), ProductController.update);
router.patch("/:id/status", auth, requireRole(["admin"]), ProductController.updateStatus);
router.delete("/:id", auth, requireRole(["admin"]), ProductController.delete);

module.exports = router;

/**
 * @openapi
 * /api/products/infinite:
 *   get:
 *     summary: Get products with infinite scroll
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search query (name or sku)
 *     responses:
 *       200:
 *         description: Product list with infinite scroll
 */

/**
 * @openapi
 * /api/products/pagination:
 *   get:
 *     summary: Get products with pagination, search and filters
 *     tags:
 *       - Products
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
 *         name: category_slug
 *         schema: { type: string }
 *       - in: query
 *         name: brand_id
 *         schema: { type: string }
 *         description: Fields to search by
 *       - in: query
 *         name: minStock
 *         schema: { type: number }
 *       - in: query
 *         name: maxStock
 *         schema: { type: number }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [published, unpublished]
 *     responses:
 *       200:
 *         description: Product list with pagination
 */

/**
 * @openapi
 * /api/products/stats:
 *   get:
 *     summary: Get product filter statistics
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Min/max values for product filters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 price:
 *                   type: object
 *                   properties:
 *                     min:
 *                       type: number
 *                     max:
 *                       type: number
 *                 stock:
 *                   type: object
 *                   properties:
 *                     min:
 *                       type: number
 *                     max:
 *                       type: number
 */

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Get product information by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the product to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get product information successfully
 */

/**
 * @openapi
 * /api/products/import-item/{sku}:
 *   get:
 *     summary: Get product information by SKU for importing
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: sku
 *         required: true
 *         description: SKU of the product to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get product information successfully
 */

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category_id
 *               - brand_id
 *               - selling_price
 *             properties:
 *               sku:
 *                 type: string
 *                 example: "SER-LOR-251204215107"
 *               name:
 *                 type: string
 *                 example: "L'Oréal Vitamin C Serum 30ml"
 *               category_id:
 *                 type: string
 *                 example: "693f37950839c3f4df722788"
 *               brand_id:
 *                 type: string
 *                 example: "693f37d10839c3f4df72278b"
 *               selling_price:
 *                 type: number
 *                 example: 299000
 *               description:
 *                 type: string
 *                 example: "Brightening serum with 10% vitamin C"
 *               image:
 *                 type: string
 *                 example: "https://picsum.photos/200/300"
 *               status:
 *                 type: string
 *                 enum: [published, unpublished]
 *                 example: unpublished
 *     responses:
 *       201:
 *         description: Product created
 */

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: Update product information
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the product to be updated
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
 *               - name
 *               - category_id
 *               - brand_id
 *               - selling_price
 *             properties:
 *               sku:
 *                 type: string
 *                 example: "LOR-VC-30ML"
 *               name:
 *                 type: string
 *                 example: "L'Oréal Vitamin C Serum 30ml (New)"
 *               category_id:
 *                 type: string
 *                 example: "693f37950839c3f4df722788"
 *               brand_id:
 *                 type: string
 *                 example: "693f37d10839c3f4df72278b"
 *               selling_price:
 *                 type: number
 *                 example: 319000
 *               description:
 *                 type: string
 *                 example: "Brightening serum with 10% vitamin C"
 *               image:
 *                 type: string
 *                 example: "https://picsum.photos/200/300"
 *               status:
 *                 type: string
 *                 enum: [published, unpublished]
 *                 example: published
 * 
 *     responses:
 *       200:
 *         description: Product updated
 */

/**
 * @openapi
 * /api/products/{id}/status:
 *   patch:
 *     summary: Update product status
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the product to be updated
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
 *               status:
 *                 type: string
 *                 enum: [published, unpublished]
 *                 example: published
 * 
 *     responses:
 *       200:
 *         description: Product's status updated
 */

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the product to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted
 */