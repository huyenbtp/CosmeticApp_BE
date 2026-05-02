const mongoose = require("mongoose");

const OrderStatusHistorySchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    status: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Staff",
    },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("OrderStatusHistory", OrderStatusHistorySchema);
