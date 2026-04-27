const mongoose = require('mongoose')

const RolePermissionSchema = new mongoose.Schema(
  {
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Role'
    },
    permission_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Permission'
    },
  },
);

const RolePermission = mongoose.model("RolePermission", RolePermissionSchema);
module.exports = RolePermission;
