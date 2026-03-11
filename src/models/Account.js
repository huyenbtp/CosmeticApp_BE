const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["cashier", "admin"],
      default: "cashier"
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

module.exports = mongoose.model("Account", AccountSchema);
