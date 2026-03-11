const express = require("express");
const router = express.Router();

const ImportDetailController = require("../controllers/ImportItemController");

router.post("/", ImportDetailController.create);
router.get("/", ImportDetailController.getAll);
router.get("/:id", ImportDetailController.getById);
router.put("/:id", ImportDetailController.update);
router.delete("/:id", ImportDetailController.delete);

module.exports = router;

/**
 * @openapi
 * /api/import-details:
 *   get:
 *     summary: Get all import details
 *     tags:
 *       - Import Details
 *     responses:
 *       200:
 *         description: List of import details
 */

/**
 * @openapi
 * /api/import-details:
 *   post:
 *     summary: Create a new import detail
 *     tags:
 *       - Import Details
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
 *         description: Import detail created
 */

/**
 * @openapi
 * /api/import-details/{id}:
 *   put:
 *     summary: Update import detail information
 *     tags:
 *       - Import Details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the import detail to be updated
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
 *         description: Import detail updated
 */

/**
 * @openapi
 * /api/import-details/{id}:
 *   delete:
 *     summary: Delete import detail
 *     tags:
 *       - Import Details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the import detail to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Import detail deleted
 */