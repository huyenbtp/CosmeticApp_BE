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
      enum: ["pending", "confirmed", "packed", "shipping", "delivered", "cancelled", "returned"],
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
      ref: "User",
    },
    updated_by_name: {
      type: String,
      default: ""
    },
    updated_by_type: {
      type: String,
      enum: ["staff", "customer"],
      default: "staff",
    }
  },
  {
    timestamps: { updatedAt: true },
  }
);

OrderStatusHistorySchema.index({
  order_id: 1,
});

OrderStatusHistorySchema.index({
  status: 1,
});

module.exports = mongoose.model("OrderStatusHistory", OrderStatusHistorySchema);
