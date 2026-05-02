const mongoose = require('mongoose');

const ExportItemSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model('ExportItem', ExportItemSchema);
