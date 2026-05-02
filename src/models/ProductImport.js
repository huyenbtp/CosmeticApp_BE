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
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model("ProductImport", ProductImportSchema);
