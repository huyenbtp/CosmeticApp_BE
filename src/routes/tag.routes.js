const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const TagController = require("../controllers/TagController");

router.post("/",TagController.create);
router.get("/", TagController.getAll);
router.get("/:id", TagController.getById);
router.put("/:id",  TagController.update);
router.delete("/:id", TagController.delete);

module.exports = router;

/**
 * @openapi
 * /api/tags:
 *   get:
 *     summary: Get all tags
 *     tags:
 *       - Tags
 *     responses:
 *       200:
 *         description: List of tags
 */

/**
 * @openapi
 * /api/tags:
 *   post:
 *     summary: Create a new tag
 *     tags:
 *       - Tags
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
 *         description: Tag created
 */

/**
 * @openapi
 * /api/tags/{id}:
 *   get:
 *     summary: Get tag by ID
 *     tags:
 *       - Tags
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the tag
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag details
 */

/**
 * @openapi
 * /api/tags/{id}:
 *   put:
 *     summary: Update tag information
 *     tags:
 *       - Tags
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the tag to be updated
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
 *         description: Tag updated
 */

/**
 * @openapi
 * /api/tags/{id}:
 *   delete:
 *     summary: Delete tag
 *     tags:
 *       - Tags
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the tag to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag deleted
 */