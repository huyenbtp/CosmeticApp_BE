const mongoose = require("mongoose");

const InventoryBatchSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    import_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ImportItem",
      required: true
    },
    batch_code: {
      type: String,
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
    imported_qty: {
      type: Number,
      required: true,
      min: 0
    },
    remaining_qty: {
      type: Number,
      required: true,
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
