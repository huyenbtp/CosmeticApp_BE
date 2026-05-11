const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const RecommendationController = require("../controllers/RecommendationController");

router.get("/", auth, RecommendationController.getRecommendations);
router.get("/new-products", RecommendationController.getNewestProducts);

module.exports = router;

/**
 * @openapi
 * /api/recommendations:
 *   get:
 *     summary: Get recommendation products for a user
 *     tags:
 *       - Recommendations
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Get recommendation products successfully
 */

/**
 * @openapi
 * /api/recommendations/new-products:
 *   get:
 *     summary: Get newest products
 *     tags:
 *       - Recommendations
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Get newest products successfully
 */