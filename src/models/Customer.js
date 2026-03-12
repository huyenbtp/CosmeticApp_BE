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
      enum: ["male", "female"],
      default: "male"
    },
    dob: {
      type: Date,
      default: Date.now
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