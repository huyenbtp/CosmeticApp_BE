const mongoose = require("mongoose");

const ImportDetailSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model("ImportDetail", ImportDetailSchema);
