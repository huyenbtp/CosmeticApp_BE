const mongoose = require("mongoose");

const SimilarItemSchema = new mongoose.Schema(
  {
    similar_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  { _id: false }
);

const ItemSimilaritySchema = new mongoose.Schema(
  {
    item_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    similarItems: [SimilarItemSchema],
  },
  {
    timestamps: true,
  }
);

ItemSimilaritySchema.index({ item_id: 1}, { unique: true });

module.exports = mongoose.model("ItemSimilarity", ItemSimilaritySchema);
