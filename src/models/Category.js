const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema(
  {
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null
    },
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;
