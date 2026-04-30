const mongoose = require("mongoose");

const ItemSimilaritySchema = new mongoose.Schema(
  {
    item_id_1: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    item_id_2: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    similarity_score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: true,
  }
);

ItemSimilaritySchema.index({ item_id_1: 1, item_id_2: 1 }, { unique: true });

module.exports = mongoose.model("ItemSimilarity", ItemSimilaritySchema);
