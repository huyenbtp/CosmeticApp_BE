const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");
const upload = require("../middleware/upload");

const UserController = require("../controllers/UserController");

router.put("/staff/:id", auth, upload.single("image"), UserController.updateByStaff);
router.put("/customer/:id", auth, UserController.updateByCustomer);
router.patch("/:id/status", auth, requireRole(["admin"]), UserController.changeUserStatus);

module.exports = router;

/**
 * @openapi
 * /api/users/staff/{id}:
 *   put:
 *     summary: Staff update their personal information
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: male
 *               dob:
 *                 type: string
 *               phone:
 *                 type: string
 *                 example: "0912345678"
 *               image:
 *                 type: string
 *                 example: "https://picsum.photos/200/300"
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Invalid data
 */

/**
 * @openapi
 * /api/users/customer/{id}:
 *   put:
 *     summary: Customer update their personal information
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: male
 *               dob:
 *                 type: string
 *               phone:
 *                 type: string
 *                 example: "0912345678"
 *     responses:
 *       200:
 *         description: User updated
 *       400:
 *         description: Invalid data
 */

/**
 * @openapi
 * /api/users/{id}/status:
 *   patch:
 *     summary: Update user status (is_active)
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the user (both staff and customer) to be updated
 *         schema:
 *           type: string
 *         example: "69f5790f3d5feedf49ac1f43"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_active:
 *                 type: boolean
 *                 example: true
 * 
 *     responses:
 *       200:
 *         description: Status updated
 */
