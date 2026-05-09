const ProductViewHistory = require("../models/ProductViewHistory");

const ProductViewHistoryService = {
  async createProductViewHistory(data) {
    return await ProductViewHistory.create(data);
  },

  async getAllProductViewHistorys() {
    return await ProductViewHistory.find().sort({ last_viewed_at: -1 });
  },

  async getProductViewHistoryById(id) {
    return await ProductViewHistory.findById(id);
  },

  async updateProductViewHistory(id, data) {
    return await ProductViewHistory.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  async deleteProductViewHistory(id) {
    return await ProductViewHistory.findByIdAndDelete(id);
  },
};

module.exports = ProductViewHistoryService;
