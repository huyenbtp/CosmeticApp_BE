const mongoose = require("mongoose");

const PointTransactionSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Customer'
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Order'
    },
    points_change: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model("PointTransaction", PointTransactionSchema);