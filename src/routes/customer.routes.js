const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const CustomerController = require("../controllers/CustomerController");

router.post("/", auth, CustomerController.create);
router.get("/", auth, CustomerController.getAll);
router.get("/:id", auth, CustomerController.getById);
router.get("/phone/:phone", auth, CustomerController.getCustomerByPhone);
router.put("/:id", auth, CustomerController.update);
router.delete("/:id", auth, CustomerController.delete);

module.exports = router;

/**
 * @openapi
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     tags:
 *       - Customers
 *     responses:
 *       200:
 *         description: List of customers
 */

/**
 * @openapi
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     tags:
 *       - Customers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Customer created
 */

/**
 * @openapi
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags:
 *       - Customers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the customer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details
 */

/**
 * @openapi
 * /api/customers/phone/{phone}:
 *   get:
 *     summary: Get customer by phone number (during checkout)
 *     tags:
 *       - Customers
 *     parameters:
 *       - in: path
 *         name: phone
 *         required: true
 *         description: Phone number of the customer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer basic details
 */

/**
 * @openapi
 * /api/customers/{id}:
 *   put:
 *     summary: Update customer information
 *     tags:
 *       - Customers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the customer to be updated
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
 *               phone:
 *                 type: string
 *               points:
 *                 type: number
 *     responses:
 *       200:
 *         description: Customer updated
 */

/**
 * @openapi
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete customer
 *     tags:
 *       - Customers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the customer to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted
 */