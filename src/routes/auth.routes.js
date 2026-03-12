const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");

const AuthController = require("../controllers/AuthController");

router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/change-password", auth, AuthController.changePassword);
router.post(
  "/reset-password",
  auth,
  requireRole(["admin"]),
  AuthController.resetPassword
);

module.exports = router;

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in
 *     tags:
 *       - Auth
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 format: username
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Log in successfully
 */

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log out
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Log out successfully
 */

/**
 * @openapi
 * /api/auth/change-password:
 *   post:
 *     summary: Change account's password
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Password changed successfully"
 *       400:
 *         description: "Error during password change process"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "The old password is incorrect."
 */


/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Admin resets the account password for a staff who forgot their password.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: "Password resetted successfully"
 */