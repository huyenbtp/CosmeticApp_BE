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
    ward_code: {
      type: Number,
      required: true,
    },
    district_code: {
      type: Number,
      required: true,
    },
    city_code: {
      type: Number,
      required: true,
    },
    ward: {
      type: String,
      required: true,
      maxlength: 100,
    },
    district: {
      type: String,
      required: true,
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

UserAddressSchema.index({
  user_id: 1,
});

module.exports = mongoose.model("UserAddress", UserAddressSchema);
