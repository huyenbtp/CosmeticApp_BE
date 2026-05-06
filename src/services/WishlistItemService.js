const WishlistItem = require("../models/WishListItem");

const WishlistItemService = {
  async createWishlistItem(user_id, product_id) {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const product = await Product.findById(product_id);
    if (!product) {
      throw new Error("Product not found");
    }
    
    return await WishlistItem.create({ user_id, product_id });
  },

  async getWishlistItemByUserId(user_id) {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }
    return await WishlistItem.find({ user_id }).populate("product_id");
  },

  async deleteWishlistItem(id) {
    return await WishlistItem.findByIdAndDelete(id);
  }
};

module.exports = WishlistItemService;