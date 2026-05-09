const RecommendationService = require("../services/RecommendationService");

const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const limit =
      Number(req.query.limit) || 10;

    const products =
      await RecommendationService.getRecommendations(
        userId,
        limit
      );

    res.json(products);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get recommendations",
    });
  }
};

module.exports = {
  getRecommendations,
};