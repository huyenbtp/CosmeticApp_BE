const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const SkinTypeController = require("../controllers/SkinTypeController");

router.post("/",SkinTypeController.create);
router.get("/", SkinTypeController.getAll);
router.get("/:id", SkinTypeController.getById);
router.put("/:id",  SkinTypeController.update);
router.delete("/:id", SkinTypeController.delete);

module.exports = router;

/**
 * @openapi
 * /api/skin-types:
 *   get:
 *     summary: Get all skinTypes
 *     tags:
 *       - SkinTypes
 *     responses:
 *       200:
 *         description: List of skinTypes
 */

/**
 * @openapi
 * /api/skin-types:
 *   post:
 *     summary: Create a new skinType
 *     tags:
 *       - SkinTypes
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
 *         description: SkinType created
 */

/**
 * @openapi
 * /api/skin-types/{id}:
 *   get:
 *     summary: Get skinType by ID
 *     tags:
 *       - SkinTypes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the skinType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SkinType details
 */

/**
 * @openapi
 * /api/skin-types/{id}:
 *   put:
 *     summary: Update skinType information
 *     tags:
 *       - SkinTypes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the skinType to be updated
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
 *         description: SkinType updated
 */

/**
 * @openapi
 * /api/skin-types/{id}:
 *   delete:
 *     summary: Delete skinType
 *     tags:
 *       - SkinTypes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the skinType to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SkinType deleted
 */