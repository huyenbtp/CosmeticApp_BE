const mongoose = require("mongoose");

const DiscountCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      enum: ["percent", "amount"],
      default: "percent"
    },
    value: {
      type: Number,
      required: true,
    },
    start_date: {
      type: Date,
      default: Date.now
    },
    end_date: {
      type: Date,
      required: true,
    },
    min_order_value: {
      type: Number,
      default: 0
    },
    max_uses: {
      type: Number,
      default: null
    },
    used_count: {
      type: Number,
      default: 0
    },
    is_active: {
      type: Boolean,
      default: true
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DiscountCode", DiscountCodeSchema);