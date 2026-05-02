const mongoose = require("mongoose");

const ProductSkinTypeSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    skin_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'SkinType'
    },
  }
);

module.exports = mongoose.model("ProductSkinType", ProductSkinTypeSchema);
