const express = require("express");
const router = express.Router();

const DiscountCodeController = require("../controllers/DiscountCodeController");

router.post("/", DiscountCodeController.create);
router.get("/", DiscountCodeController.getAll);
router.get("/:id", DiscountCodeController.getById);
router.put("/:id", DiscountCodeController.update);
router.delete("/:id", DiscountCodeController.delete);

module.exports = router;

/**
 * @openapi
 * /discount-codes:
 *   get:
 *     summary: Get all discount codes
 *     tags:
 *       - Discount Codes
 *     responses:
 *       200:
 *         description: List of discount codes
 */

/**
 * @openapi
 * /discount-codes:
 *   post:
 *     summary: Create a new discount code
 *     tags:
 *       - Discount Codes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 default: "string1"
 *               description:
 *                 type: string
 *                 default: "xxx"
 *               type:
 *                 type: string
 *                 default: percent
 *               value:
 *                 type: number
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               min_order_value:
 *                 type: number
 *               max_uses:
 *                 type: number
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Discount code created
 */

/**
 * @openapi
 * /discount-codes/{id}:
 *   get:
 *     summary: Get discount code by ID
 *     tags:
 *       - Discount Codes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the discount code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Discount code details
 */

/**
 * @openapi
 * /discount-codes/{id}:
 *   put:
 *     summary: Update discount code information
 *     tags:
 *       - Discount Codes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the discount code to be updated
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 default: percent
 *               value:
 *                 type: number
 *               start_date:
 *                 type: string
 *               end_date:
 *                 type: string
 *               min_order_value:
 *                 type: number
 *               max_uses:
 *                 type: number
 *               used_count:
 *                 type: number
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Discount code updated
 */

/**
 * @openapi
 * /discount-codes/{id}:
 *   delete:
 *     summary: Delete discount code
 *     tags:
 *       - Discount Codes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the discount code to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Discount code deleted
 */