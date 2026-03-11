const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");

const CategoryController = require("../controllers/CategoryController");

router.post("/", auth, requireRole(["admin"]), CategoryController.create);
router.get("/", CategoryController.getAll);
router.get("/:id/child", auth, CategoryController.getChildIds);
router.get("/:id", auth, CategoryController.getById);
router.put("/:id", auth, requireRole(["admin"]), CategoryController.update);
router.delete("/:id", auth, requireRole(["admin"]), CategoryController.delete);

module.exports = router;

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: List of categories
 */

/**
 * @openapi
 * /api/categories/{id}/child:
 *   get:
 *     summary: Get all subcategories's id of the category.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the category to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of subcategories's id
 */

/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags:
 *       - Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *               slug: 
 *                 type: string
 *               parent_id:
 *                 type: string
 *                 example: "693f37950839c3f4df722788"
 *     responses:
 *       201:
 *         description: Category created
 */

/**
 * @openapi
 * /api/categories/{id}:
 *   put:
 *     summary: Update category information
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the category to be updated
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
 *               slug: 
 *                 type: string
 *               parent_id:
 *                 type: string
 *                 example: "693f37950839c3f4df722788"
 * 
 *     responses:
 *       200:
 *         description: Category updated
 */

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the category to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category deleted
 */