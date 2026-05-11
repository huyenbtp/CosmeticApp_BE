const ProductViewHistoryService = require("../services/ProductViewHistoryService");

const ProductViewHistoryController = {
  async getAllByUserId(req, res) {
    try {
      const user_id = req.user.userId;

      const productViewHistorys = await ProductViewHistoryService.getAllByUserId(user_id);

      res.json(productViewHistorys);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async viewProduct(req, res) {
    try {
      const user_id = req.user.userId;
      const { product_id } = req.body;

      const productViewHistory = await ProductViewHistoryService.viewProduct(user_id, product_id);

      res.status(201).json({ message: "Product view history recorded" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await ProductViewHistoryService.deleteProductViewHistory(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Product view history not found" });

      res.json({ message: "Product view history deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = ProductViewHistoryController;