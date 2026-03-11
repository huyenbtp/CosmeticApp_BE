const express = require("express");
const router = express.Router();

const PointTransactionController = require("../controllers/PointTransactionController");

router.post("/", PointTransactionController.create);
router.get("/", PointTransactionController.getAll);
router.get("/:id", PointTransactionController.getById);
router.put("/:id", PointTransactionController.update);
router.delete("/:id", PointTransactionController.delete);

module.exports = router;

/**
 * @openapi
 * /api/point-transactions:
 *   get:
 *     summary: Get all point transactions
 *     tags:
 *       - Point Transactions
 *     responses:
 *       200:
 *         description: List of point transactions
 */

/**
 * @openapi
 * /api/point-transactions:
 *   post:
 *     summary: Create a new point transaction
 *     tags:
 *       - Point Transactions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
 *                 type: string
 *               order_id:
 *                 type: string
 *               points_change:
 *                 type: number
 *     responses:
 *       201:
 *         description: Point transaction created
 */

/**
 * @openapi
 * /api/point-transactions/{id}:
 *   put:
 *     summary: Update point transaction information
 *     tags:
 *       - Point Transactions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the point transaction to be updated
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id:
 *                 type: string
 *               order_id:
 *                 type: string
 *               points_change:
 *                 type: number
 *     responses:
 *       200:
 *         description: Point transaction updated
 */

/**
 * @openapi
 * /api/point-transactions/{id}:
 *   delete:
 *     summary: Delete point transaction
 *     tags:
 *       - Point Transactions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the point transaction to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Point transaction deleted
 */