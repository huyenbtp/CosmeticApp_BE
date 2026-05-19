const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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

TagSchema.index({
  status: 1,
});

const Tag = mongoose.model("Tag", TagSchema);
module.exports = Tag;