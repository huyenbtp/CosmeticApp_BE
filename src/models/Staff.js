const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema(
  {
    account_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Account'
    },
    staff_code: {
      type: String,
      unique: true,
      required: true,
    },
    full_name: {
      type: String,
      required: true,
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
    },
    position: {
      type: String,
      enum: ["cashier", "admin"],
      default: "cashier"
    },
    status: {
      type: String,
      enum: ["active", "on_leave", "terminated"],
      default: "active"
    },
    image: {
      type: String,
      default: ""
    },
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model("Staff", StaffSchema);
