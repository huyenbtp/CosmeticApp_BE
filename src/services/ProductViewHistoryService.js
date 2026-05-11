const ProductViewHistory = require("../models/ProductViewHistory");
const User = require("../models/User");
const Product = require("../models/Product");

const ProductViewHistoryService = {
  async getAllByUserId(user_id) {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const result = await ProductViewHistory.find({ user_id })
      .limit(20)
      .sort({ last_viewed_at: -1 })
      .populate("product_id", "name selling_price image avg_rating")
      .lean();

    return result.map(item => item.product_id)
  },

  async viewProduct(user_id, product_id) {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const product = await Product.findById(product_id);
    if (!product) {
      throw new Error("Product not found");
    }

    const viewHistory = await ProductViewHistory.findOne({ user_id, product_id });
    if (viewHistory) {
      viewHistory.view_count += 1;
      viewHistory.last_viewed_at = new Date();
      return viewHistory.save();
    }

    return await ProductViewHistory.create({ user_id, product_id, });
  },

  async deleteProductViewHistory(id) {
    return await ProductViewHistory.findByIdAndDelete(id);
  },
};

module.exports = ProductViewHistoryService;
