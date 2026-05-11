const WishlistItem = require("../models/WishlistItem");
const User = require("../models/User");
const Product = require("../models/Product");

const WishlistItemService = {
  async getAllByUserId(user_id) {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const result = await WishlistItem.find({ user_id })
      .sort({ createdAt: -1 })
      .populate("product_id", "name selling_price image avg_rating")
      .lean();

    return result.map(item => item.product_id)
  },

  async createWishlistItem(user_id, product_id) {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const product = await Product.findById(product_id);
    if (!product) {
      throw new Error("Product not found");
    }

    const wishlistItem = await WishlistItem.findOne({ user_id, product_id });
    if (wishlistItem) return;

    return await WishlistItem.create({ user_id, product_id });
  },

  async deleteWishlistItem(user_id, product_id) {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const product = await Product.findById(product_id);
    if (!product) {
      throw new Error("Product not found");
    }
    
    return await WishlistItem.findOneAndDelete({ user_id, product_id });
  }
};

module.exports = WishlistItemService;