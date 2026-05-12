const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const UserAddressController = require("../controllers/UserAddressController");

router.get("/", auth, UserAddressController.getAllByUserId);
router.get("/default", auth, UserAddressController.getDefaultByUserId);
router.post("/", auth, UserAddressController.create);
router.put("/:id", auth, UserAddressController.update);
router.delete("/:id", auth, UserAddressController.delete);

module.exports = router;

/**
 * @openapi
 * /api/user-addresses:
 *   get:
 *     summary: Get all addresses of the authenticated user
 *     tags:
 *       - User Addresses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user addresses (sorted by default first)
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/user-addresses/default:
 *   get:
 *     summary: Get default address of the authenticated user
 *     tags:
 *       - User Addresses
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default address
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/user-addresses:
 *   post:
 *     summary: Create a new address for the authenticated user
 *     tags:
 *       - User Addresses
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiver_name
 *               - phone
 *               - address_line
 *               - city
 *             properties:
 *               receiver_name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Nguyễn Văn A
 *               phone:
 *                 type: string
 *                 maxLength: 20
 *                 example: "0912345678"
 *               address_line:
 *                 type: string
 *                 maxLength: 255
 *                 example: 123 Đường Lê Lợi
 *               ward_code:
 *                 type: Number
 *                 example: 1
 *               district_code:
 *                 type: Number
 *                 example: 1
 *               city_code:
 *                 type: Number
 *                 example: 1
 *               ward:
 *                 type: string
 *                 maxLength: 100
 *                 example: Phường Bến Nghé
 *               district:
 *                 type: string
 *                 maxLength: 100
 *                 example: Quận 1
 *               city:
 *                 type: string
 *                 maxLength: 100
 *                 example: TP. Hồ Chí Minh
 *               is_default:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Invalid input or user not found
 */

/**
 * @openapi
 * /api/user-addresses/{id}:
 *   put:
 *     summary: Update an address by ID (must belong to authenticated user)
 *     tags:
 *       - User Addresses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiver_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               address_line:
 *                 type: string
 *               ward_code:
 *                 type: Number
 *               district_code:
 *                 type: Number
 *               city_code:
 *                 type: Number
 *               ward:
 *                 type: string
 *               district:
 *                 type: string
 *               city:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 */

/**
 * @openapi
 * /api/user-addresses/{id}:
 *   delete:
 *     summary: Delete an address by ID (must belong to authenticated user)
 *     tags:
 *       - User Addresses
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 */