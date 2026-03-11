const mongoose = require('mongoose')

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
},
    logo: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active"
    },
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

const Brand = mongoose.model("Brand", BrandSchema);
module.exports = Brand;
