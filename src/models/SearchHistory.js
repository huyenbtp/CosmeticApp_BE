const mongoose = require("mongoose");

const SearchHistorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    keyword: {
      type: String,
      required: true,
      maxlength: 100
    },
    results_count: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SearchHistory", SearchHistorySchema);