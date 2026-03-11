const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");
const upload = require("../middleware/upload");

const BrandController = require("../controllers/BrandController");

router.post("/", auth, requireRole(["admin"]), upload.single("logo"), BrandController.create);
router.get("/", BrandController.getAll);
router.get("/:id", auth, BrandController.getById);
router.put("/:id", auth, requireRole(["admin"]), upload.single("logo"), BrandController.update);
router.delete("/:id", auth, requireRole(["admin"]), BrandController.delete);

module.exports = router;

/**
 * @openapi
 * /api/brands:
 *   get:
 *     summary: Get all brands
 *     tags:
 *       - Brands
 *     responses:
 *       200:
 *         description: List of brands
 */

/**
 * @openapi
 * /api/brands:
 *   post:
 *     summary: Create a new brand
 *     tags:
 *       - Brands
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Brand created
 */

/**
 * @openapi
 * /api/brands/{id}:
 *   put:
 *     summary: Update brand information
 *     tags:
 *       - Brands
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the brand to be updated
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 * 
 *     responses:
 *       200:
 *         description: Brand updated
 */

/**
 * @openapi
 * /api/brands/{id}:
 *   delete:
 *     summary: Delete brand
 *     tags:
 *       - Brands
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the brand to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand deleted
 */