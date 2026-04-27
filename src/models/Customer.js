const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    full_name: {
      type: String,
      required: true,
      maxlength: 50
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male"
    },
    phone: {
      type: String,
      required: true,
      maxlength: 10
    },
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model("Customer", CustomerSchema);