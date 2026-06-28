const ProductReviewService = require("../services/ProductReviewService");

const ProductReviewController = {
  // POST /api/product-reviews  (cần đăng nhập)
  async create(req, res) {
    try {
      const userId = req.user.userId;
      const result = await ProductReviewService.createReviews(userId, req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // GET /api/product-reviews/product/:productId
  async getByProduct(req, res) {
    try {
      const data = await ProductReviewService.getReviewsByProduct(
        req.params.productId
      );
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = ProductReviewController;
