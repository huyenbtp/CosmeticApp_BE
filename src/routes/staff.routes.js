const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");
const upload = require("../middleware/upload");

const StaffController = require("../controllers/StaffController");

router.get("/", auth, requireRole(["admin"]), StaffController.getStaffs);
router.get("/:id", auth, StaffController.getById);
router.get("/admin-edit/:id", auth, StaffController.getByIdToAdminEdit);
router.post("/", auth, requireRole(["admin"]), upload.single("image"), StaffController.create);
router.put("/:id", auth, requireRole(["admin"]), upload.single("image"), StaffController.update);
router.delete("/:id", auth, requireRole(["admin"]), StaffController.delete);

module.exports = router;

/**
 * @openapi
 * /api/staffs:
 *   get:
 *     summary: Get staffs with pagination, search and filters
 *     tags:
 *       - Staffs
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 7 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search query
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, on_leave, terminated]
 *         description: Staff status
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: string
 *         description: Role id
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Account status
 *     responses:
 *       200:
 *         description: Staff list with pagination
 */

/**
 * @openapi
 * /api/staffs/{id}:
 *   get:
 *     summary: Get full staff information by id
 *     tags:
 *       - Staffs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the staff to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get full staff information successfully
 *       404:
 *         description: Staff not found
 */

/**
 * @openapi
 * /api/staffs/admin-edit/{id}:
 *   get:
 *     summary: Get staff information by id for admin to edit
 *     tags:
 *       - Staffs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the staff to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Get staff information successfully
 *       404:
 *         description: Staff not found
 */

/**
 * @openapi
 * /api/staffs:
 *   post:
 *     summary: Create a new staff with an account
 *     tags:
 *       - Staffs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role_id
 *               - full_name
 *               - phone
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               role_id:
 *                 type: string
 *                 example: 69f2285e7f3ef7c9cdbec50c
 *               is_active:
 *                 type: boolean
 *                 example: true
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
 *               status:
 *                 type: string
 *                 enum: [active, on_leave, terminated]
 *                 default: active
 *               image:
 *                 type: string
 *                 example: "https://picsum.photos/200/300"
 * 
 *     responses:
 *       200:
 *         description: Staff created successfully
 *       400:
 *         description: Invalid data
 */

/**
 * @openapi
 * /api/staffs/{id}:
 *   put:
 *     summary: Update staff (include their account) information
 *     tags:
 *       - Staffs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the staff to be updated
 *         schema:
 *           type: string
 *         example: "6945c582cad1d5e147c7dd03"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - phone
 *             properties:
 *               role_id:
 *                 type: string
 *                 example: 69f2285e7f3ef7c9cdbec50c
 *               is_active:
 *                 type: boolean
 *                 example: true
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: female
 *               dob:
 *                 type: string
 *               phone:
 *                 type: string
 *                 example: "0912345678"
 *               status:
 *                 type: string
 *                 enum: [active, on_leave, terminated]
 *                 default: active
 *               image:
 *                 type: string
 *                 example: "https://picsum.photos/200/300"
 *     responses:
 *       200:
 *         description: Staff updated successfully
 *       400:
 *         description: Invalid data
 */

/**
 * @openapi
 * /api/staffs/{id}:
 *   delete:
 *     summary: Delete staff (and their account) (TEST ONLY)
 *     tags:
 *       - Staffs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the staff to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff deleted
 */