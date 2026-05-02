const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    parent_id: {
      type: String,
      default: null,
    },   //phục vụ việc có nhiều variant trong tương lai
    name: {
      type: String,
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category'
    },
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Brand'
    },
    selling_price: {
      type: Number,
      required: true
    },
    import_price: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      default: ""
    },
    image: {
      type: String,
      default: ""
    },
    stock_quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["published", "unpublished"],
      default: "published"
    },
    avg_rating: {
      type: Number,
      default: 0,
      min: 1,
      max: 5,
    },
    review_count: {
      type: Number,
      default: 0,
      min: 0
    },
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model("Product", ProductSchema);
