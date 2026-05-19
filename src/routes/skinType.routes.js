const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");

const SkinTypeController = require("../controllers/SkinTypeController");

router.get("/", SkinTypeController.getAll);
router.get("/:id", auth, requireRole(["admin"]), SkinTypeController.getById);
router.post("/", auth, requireRole(["admin"]), SkinTypeController.create);
router.put("/:id", auth, requireRole(["admin"]), SkinTypeController.update);
router.delete("/:id", auth, requireRole(["admin"]), SkinTypeController.delete);

module.exports = router;

/**
 * @openapi
 * /api/skin-types:
 *   get:
 *     summary: Get all skin types
 *     tags:
 *       - Skin Types
 *     responses:
 *       200:
 *         description: List of skin types
 */

/**
 * @openapi
 * /api/skin-types:
 *   post:
 *     summary: Create a new skin type
 *     tags:
 *       - Skin Types
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string 
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Skin type created
 */

/**
 * @openapi
 * /api/skin-types/{id}:
 *   get:
 *     summary: Get skin type by ID
 *     tags:
 *       - Skin Types
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the skin type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skin type details
 */

/**
 * @openapi
 * /api/skin-types/{id}:
 *   put:
 *     summary: Update skin type information
 *     tags:
 *       - Skin Types
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the skin type to be updated
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
 *         description: Skin type updated
 */

/**
 * @openapi
 * /api/skin-types/{id}:
 *   delete:
 *     summary: Delete skin type
 *     tags:
 *       - SkinTypes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the skin type to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skin type deleted
 */