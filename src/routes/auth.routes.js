const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");

const AuthController = require("../controllers/AuthController");

router.post("/register-customer", AuthController.registerCustomer);
router.get("/verify-email", AuthController.verifyEmail);
router.post("/resend-verification", AuthController.resendVerification);
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
 * /api/auth/register-customer:
 *   post:
 *     summary: Register a new customer account
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - full_name
 *               - phone
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               full_name:
 *                 type: string
 *                 example: Nguyen Van A
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: male
 *               phone:
 *                 type: string
 *                 example: "0912345678"
 *     responses:
 *       201:
 *         description: Registration successful, please check email to verify account
 *       400:
 *         description: Invalid input or email already exists
 */
/**
 * @openapi
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify user email
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token sent via email
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */

/**
 * @openapi
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *     responses:
 *       200:
 *         description: Verification email resent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Verification email resent
 *       400:
 *         description: Invalid request or email already verified
 */

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
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Log in successfully
 *       400:
 *         description: Invalid email or password
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