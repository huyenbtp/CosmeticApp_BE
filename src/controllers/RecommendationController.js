const RecommendationService = require("../services/RecommendationService");

const RecommendationController = {
  async getRecommendations(req, res) {
    try {
      const userId = req.user.userId;

      const limit = Number(req.query.limit) || 10;

      const products = await RecommendationService.getRecommendations(
        userId,
        limit
      );

      res.json(products);

    } catch (error) {
      console.error(error);

      return res.status(500).json({ message: "Failed to get recommendations" });
    }
  },

  async getNewestProducts(req, res) {
    try {
      const limit = Number(req.query.limit) || 10;

      const products = await RecommendationService.getNewestProducts(limit);

      res.json(products);

    } catch (error) {
      console.error(error);

      return res.status(500).json({ message: "Failed to get newest products" });
    }
  }
}

module.exports = RecommendationController;