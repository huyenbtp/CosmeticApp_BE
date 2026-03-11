const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 50
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      maxlength: 10
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model("Customer", CustomerSchema);