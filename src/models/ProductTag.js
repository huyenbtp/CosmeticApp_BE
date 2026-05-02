const mongoose = require("mongoose");

const ProductTagSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    tag_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Tag'
    }
  }
);

module.exports = mongoose.model("ProductTag", ProductTagSchema);
