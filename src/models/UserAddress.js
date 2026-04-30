const mongoose = require("mongoose");

const UserAddressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    receiver_name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      maxlength: 20,
    },
    address_line: {
      type: String,
      required: true,
      maxlength: 255,
    },
    ward: {
      type: String,
      maxlength: 100,
    },
    district: {
      type: String,
      maxlength: 100,
    },
    city: {
      type: String,
      required: true,
      maxlength: 100,
    },
    is_default: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserAddress", UserAddressSchema);
