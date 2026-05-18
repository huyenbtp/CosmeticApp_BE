const mongoose = require("mongoose");

const ImportItemSchema = new mongoose.Schema(
  {
    import_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'ProductImport'
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    batch_code: {
      type: String,
      required: true,
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    mfg_date: {
      type: Date,
      default: null,
    },
    exp_date: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

ImportItemSchema.index({
  import_id: 1,
});

ImportItemSchema.index({
  product_id: 1,
});

module.exports = mongoose.model("ImportItem", ImportItemSchema);
