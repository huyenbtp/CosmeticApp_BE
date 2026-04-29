const mongoose = require('mongoose')

const SkinTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: ""
    },
  },
  {
    timestamps: true, // tự tạo createdAt + updatedAt
  }
);

const SkinType = mongoose.model("SkinType", SkinTypeSchema);
module.exports = SkinType;
