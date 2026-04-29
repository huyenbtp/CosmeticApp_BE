const mongoose = require("mongoose");

const UserAddressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    provider_name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address_line1: {
      type: String,
      required: true
    },
    address_line2: {
      type: String,
      default: null
    },
    district: {
      type: String,
      default: null
    },
    city: {
      type: String,
      required: true
    },
    receive_time: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("UserAddress", UserAddressSchema);
