const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/checkPermission");

const TagController = require("../controllers/TagController");

router.get("/", TagController.getAll);
router.get("/pagination", auth, requireRole(["admin"]), TagController.getTagsPaginated);
router.get("/:id", auth, requireRole(["admin"]), TagController.getById);
router.post("/", auth, requireRole(["admin"]), TagController.create);
router.put("/:id", auth, requireRole(["admin"]), TagController.update);
router.patch("/:id/status", auth, requireRole(["admin"]), TagController.updateStatus);
router.delete("/:id", auth, requireRole(["admin"]), TagController.delete);

module.exports = router;

/**
 * @openapi
 * /api/tags:
 *   get:
 *     summary: Get all tags by status filter
 *     tags:
 *       - Tags
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, archived]
 *     responses:
 *       200:
 *         description: List of tags
 */

/**
 * @openapi
 * /api/tags/pagination:
 *   get:
 *     summary: Get tags pagination, search and filters
 *     tags:
 *       - Tags
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
 *           enum: [active, archived]
 *     responses:
 *       200:
 *         description: List of tags with pagination
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
 *               status:
 *                 type: string
 *                 example: active
 *     responses:
 *       201:
 *         description: Tag created
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
 *               status:
 *                 type: string
 *                 example: active
 *     responses:
 *       200:
 *         description: Tag updated
 */

/**
 * @openapi
 * /api/tags/{id}/status:
 *   patch:
 *     summary: Update tag status
 *     tags:
 *       - Tags
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Id of the tag to be updated
 *         schema:
 *           type: string
 *         example: "6943db6002bfd4a421467504"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, archived]
 *                 example: active
 * 
 *     responses:
 *       200:
 *         description: Tag's status updated
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