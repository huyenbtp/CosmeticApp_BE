const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const RoleController = require("../controllers/RoleController");

router.post("/",RoleController.create);
router.get("/", RoleController.getAll);
router.get("/:id", RoleController.getById);
router.put("/:id",  RoleController.update);
router.delete("/:id", RoleController.delete);

module.exports = router;

/**
 * @openapi
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags:
 *       - Roles
 *     responses:
 *       200:
 *         description: List of roles
 */

/**
 * @openapi
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     tags:
 *       - Roles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role created
 */

/**
 * @openapi
 * /api/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags:
 *       - Roles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the role
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role details
 */

/**
 * @openapi
 * /api/roles/{id}:
 *   put:
 *     summary: Update role information
 *     tags:
 *       - Roles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the role to be updated
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
 *     responses:
 *       200:
 *         description: Role updated
 */

/**
 * @openapi
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete role
 *     tags:
 *       - Roles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the role to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted
 */