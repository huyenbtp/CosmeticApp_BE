const mongoose = require("mongoose");

const ProductExportSchema = new mongoose.Schema(
  {
    export_code: {
      type: String,
      required: true,
      unique: true,
      maxlength: 50
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Staff'
    },
    products_updated: {
      type: Number,
      required: true,
      min: 1
    },
    items_exported: {
      type: Number,
      required: true,
      min: 1
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0
    },
    notes: {
      type: String,
      maxlength: 1000,
      default: ""
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ProductExport", ProductExportSchema);