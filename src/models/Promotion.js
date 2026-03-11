const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      default: ""
    },
    start_date: {
      type: Date,
      required: true, // nếu bắt buộc phải có
    },
    end_date: {
      type: Date,
      required: true,
    },
    apply_scope: {
      type: String,
      enum: ['store', 'product', 'brand', 'category'],
      required: true,
    },
    min_order_value: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },

  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model("Promotion", PromotionSchema);
