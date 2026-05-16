const mongoose = require('mongoose');

const ExportItemSchema = new mongoose.Schema(
  {
    export_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'ProductExport'
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product'
    },
    batch_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'InventoryBatch'
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    notes: {
      type: String,
      maxlength: 50,
      default: ''
    }
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model('ExportItem', ExportItemSchema);
