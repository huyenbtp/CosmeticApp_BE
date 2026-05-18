const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Order'
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0,
    }
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

OrderItemSchema.index({
  order_id: 1,
  product_id: 1,
}, { unique: true });

module.exports = mongoose.model("OrderItem", OrderItemSchema);