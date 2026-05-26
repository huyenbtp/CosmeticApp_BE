const mongoose = require("mongoose");

const InventoryBatchSchema = new mongoose.Schema(
  {
    batch_number: {
      type: String,       //số lô do hệ thống auto-generate
      required: true,     //sử dụng trong nội bộ hệ thống
      unique: true        //không trùng
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    batch_code: {
      type: String,       //mã lô nhận được từ nhà cung cấp
      required: true,     //cho phép trùng batch code
    },
    mfg_date: {
      type: Date,
      default: null,
    },
    exp_date: {
      type: Date,
      default: null,
    },
    remaining_qty: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true
  }
);

InventoryBatchSchema.index({
  product_id: 1,
  exp_date: 1,
  remaining_qty: 1
});

module.exports = mongoose.model("InventoryBatch", InventoryBatchSchema);
