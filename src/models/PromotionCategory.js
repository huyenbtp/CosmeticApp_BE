const mongoose = require("mongoose");

const PromotionCategorySchema = new mongoose.Schema(
  {
    promotion_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Promotion'
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category'
    },
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model("PromotionCategory", PromotionCategorySchema);
