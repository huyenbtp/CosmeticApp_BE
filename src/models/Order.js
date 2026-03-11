const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    order_code: {
      type: String,
      required: true,
      unique: true
    },
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null
    },
    discount_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DiscountCode",
      default: null
    },
    total_items: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
    discount_amount: {
      type: Number,
      default: 0
    },
    points_used: {
      type: Number,
      default: 0
    },
    total_estimated: {
      type: Number,
      required: true
    },
    total_paid: {
      type: Number,
      default: 0,
    },
    payment_method: {
      type: String,
      enum: ["cash", "bank_transfer"],
      default: "cash"
    },
    payment_status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: 'unpaid'
    },
    note: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model("Order", OrderSchema);