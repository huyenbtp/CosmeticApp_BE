const mongoose = require("mongoose");

const PromotionProductSchema = new mongoose.Schema(
  {
    promotion_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Promotion'
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model("PromotionProduct", PromotionProductSchema);
