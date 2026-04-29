const mongoose = require("mongoose");

const WishListItemSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    product_id: {
      type: String,
      required: true,
      ref: "Product",
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("WishListItem", WishListItemSchema);
