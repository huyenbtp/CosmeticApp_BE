const CartItem = require("../models/CartItem");

const CartItemService = {
  async createCartItem(user_id, product_id, quantity) {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const product = await Product.findById(product_id);
    if (!product) {
      throw new Error("Product not found");
    }

    return await CartItem.create({ user_id, product_id, quantity });
  },

  async getCartItemsByUserId(user_id) {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }
    return await CartItem.find({ user_id }).populate("product_id");
  },

  async updateCartItem(id, data) {
    const user = await User.findById(data.user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const product = await Product.findById(data.product_id);
    if (!product) {
      throw new Error("Product not found");
    }

    return await CartItem.findByIdAndUpdate(id, data, { new: true }).populate("user_id").populate("product_id");
  },

  async deleteCartItem(id) {
    return await CartItem.findByIdAndDelete(id);
  }
};

module.exports = CartItemService;