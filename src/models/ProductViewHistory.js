const mongoose = require("mongoose");

const ProductViewHistorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    view_count: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },
    last_viewed_at: {
      type: Date,
      default: Date.now
    },
  },
);

module.exports = mongoose.model("ProductViewHistory", ProductViewHistorySchema);
