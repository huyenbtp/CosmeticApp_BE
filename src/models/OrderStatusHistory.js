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
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled", "returned"],
      required: true,
    },
    notes: {
      type: String,
      maxlength: 100,
      default: ""
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Staff",
    },
  },
  {
    timestamps: { updatedAt: true },
  }
);

module.exports = mongoose.model("OrderStatusHistory", OrderStatusHistorySchema);
