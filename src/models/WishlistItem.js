const mongoose = require("mongoose");

const WishlistItemSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
  },
  {
    timestamps: true,
  }
);

WishlistItemSchema.index({
  user_id: 1,
  product_id: 1
}, { unique: true });

module.exports = mongoose.model("WishlistItem", WishlistItemSchema);
