const CartItem = require("../models/CartItem");
const User = require("../models/User");
const Product = require("../models/Product");

const CartItemService = {
  async getAllByUserId(user_id) {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }
    const result = await CartItem.find({ user_id })
      .sort({ updatedAt: -1 })
      .populate("product_id", "name selling_price image stock_quantity");

    return result.map(item => ({
      _id: item._id,
      product_id: item.product_id._id,
      product: {
        _id: item.product_id._id,
        name: item.product_id.name,
        price: item.product_id.selling_price,
        image: item.product_id.image,
        available_quantity: item.product_id.stock_quantity
      },
      quantity: item.quantity,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }))
  },

  async addToCart(user_id, product_id, quantity) {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const product = await Product.findById(product_id);
    if (!product) {
      throw new Error("Product not found");
    }

    if (quantity < 1) {
      throw new Error("Quantity must be greater than 1");
    }

    if (quantity > 100) {
      throw new Error("Quantity must be less than 100");
    }

    const cartItem = await CartItem.findOne({ user_id, product_id });
    if (cartItem) {
      cartItem.quantity = cartItem.quantity + quantity;
      return cartItem.save();
    }

    return await CartItem.create({ user_id, product_id, quantity });
  },

  async updateQuantity(id, quantity) {
    const cartItem = await CartItem.findById(id);
    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    if (quantity < 1) {
      throw new Error("Quantity must be greater than 1");
    }

    if (quantity > 100) {
      throw new Error("Quantity must be less than 100");
    }

    return await CartItem.findByIdAndUpdate(id, { quantity }, { new: true });
  },

  async deleteCartItem(id) {
    return await CartItem.findByIdAndDelete(id);
  }
};

module.exports = CartItemService;