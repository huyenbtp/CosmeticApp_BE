const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    order_code: {
      type: String,
      required: true,
      unique: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
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
    shipping_fee: {
      type: Number,
      default: 0
    },
    discount_amount: {
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
      enum: ["cod", "bank_transfer"],
      default: "cod"
    },
    payment_status: {
      type: String,
      enum: ["paid", "unpaid"],
      default: 'unpaid'
    },
    order_status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled", "returned"],
      default: 'pending'
    },
    notes: {
      type: String,
      default: ''
    },
    receiver_name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      maxlength: 20,
    },
    address_line: {
      type: String,
      required: true,
      maxlength: 255,
    },
    ward: {
      type: String,
      maxlength: 100,
    },
    district: {
      type: String,
      maxlength: 100,
    },
    city: {
      type: String,
      required: true,
      maxlength: 100,
    },
    receive_time: {
      type: Date,
      default: null
    },
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model("Order", OrderSchema);