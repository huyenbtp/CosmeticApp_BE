const mongoose = require("mongoose");

const ProductImportSchema = new mongoose.Schema(
  {
    import_code: {
      type: String,
      required: true,
      unique: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Staff',
    },
    confirmed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
    },
    confirmedAt: {
      type: Date,
      default: null
    },
    products_updated: {
      type: Number,
      required: true,
      min: 0
    },
    items_imported: {
      type: Number,
      required: true,
      min: 0
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0
    },
    notes: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["draft", "confirmed"],
      default: "draft"
    },
    type: {
      type: String,
      enum: ["purchase", "customer_return"],
      default: "purchase"
    },
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model("ProductImport", ProductImportSchema);
