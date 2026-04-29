const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
      ref: "User",
    },
    product_id: {
      type: String,
      required: true,
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be greater than 0"],
    },
    unit_price: {
      type: Number,
      required: true,
      min: [0, "Unit price must be greater than or equal to 0"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CartItem", CartItemSchema);
