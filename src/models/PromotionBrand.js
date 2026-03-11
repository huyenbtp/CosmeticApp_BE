const mongoose = require("mongoose");

const PromotionBrandSchema = new mongoose.Schema(
  {
    promotion_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Promotion'
    },
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Brand'
    },
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model("PromotionBrand", PromotionBrandSchema);
