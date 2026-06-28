const mongoose = require("mongoose");

const ProductReviewSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    user_full_name: {
      type: String,
      required: true,
    },
    order_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'OrderItem',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      minlength: 20,
      maxlength: 255,
    },
    anonymous: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ProductReviewSchema.index({
  product_id: 1,
  rating: 1,
});

ProductReviewSchema.index({
  user_id: 1,
});


module.exports = mongoose.model("ProductReview", ProductReviewSchema);
