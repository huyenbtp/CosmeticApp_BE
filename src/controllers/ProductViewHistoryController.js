const ProductViewHistoryService = require("../services/ProductViewHistoryService");

class ProductViewHistoryController {
  async create(req, res) {
    try {
      const productViewHistory = await ProductViewHistoryService.createProductViewHistory(req.body);
      res.status(201).json(productViewHistory);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const productViewHistorys = await ProductViewHistoryService.getAllProductViewHistorys();
      res.json(productViewHistorys);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const productViewHistory = await ProductViewHistoryService.getProductViewHistoryById(req.params.id);

      if (!productViewHistory) return res.status(404).json({ message: "ProductViewHistory not found" });

      res.json(productViewHistory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await ProductViewHistoryService.updateProductViewHistory(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "ProductViewHistory not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await ProductViewHistoryService.deleteProductViewHistory(req.params.id);

      if (!deleted) return res.status(404).json({ message: "ProductViewHistory not found" });

      res.json({ message: "ProductViewHistory deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ProductViewHistoryController();