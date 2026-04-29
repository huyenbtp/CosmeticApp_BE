const mongoose = require("mongoose");

const ItemSimilaritySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  item_id: {
    type: String,
    required: true,
    ref: "Product",
  },
  similarity_score: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
});

module.exports = mongoose.model("ItemSimilarity", ItemSimilaritySchema);