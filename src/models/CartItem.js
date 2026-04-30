const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("CartItem", CartItemSchema);
