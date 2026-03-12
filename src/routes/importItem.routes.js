const express = require("express");
const router = express.Router();

const ImportItemController = require("../controllers/ImportItemController");

router.post("/", ImportItemController.create);
router.get("/", ImportItemController.getAll);
router.get("/:id", ImportItemController.getById);
router.put("/:id", ImportItemController.update);
router.delete("/:id", ImportItemController.delete);

module.exports = router;

/**
 * @openapi
 * /api/import-items:
 *   get:
 *     summary: Get all import items
 *     tags:
 *       - Import Items
 *     responses:
 *       200:
 *         description: List of import items
 */

/**
 * @openapi
 * /api/import-items:
 *   post:
 *     summary: Create a new import item
 *     tags:
 *       - Import Items
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               import_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               unit_price:
 *                 type: number
 *               quantity:
 *                 type: number
 *                 default: 1
 *     responses:
 *       201:
 *         description: Import item created
 */

/**
 * @openapi
 * /api/import-items/{id}:
 *   put:
 *     summary: Update import item information
 *     tags:
 *       - Import Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the import item to be updated
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               import_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               unit_price:
 *                 type: number
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Import item updated
 */

/**
 * @openapi
 * /api/import-items/{id}:
 *   delete:
 *     summary: Delete import item
 *     tags:
 *       - Import Items
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the import item to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Import item deleted
 */