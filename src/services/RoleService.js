const Role = require("../models/Role");

class RoleService {
  async createRole(data) {
    return await Role.create(data);
  }

  async getAllRoles() {
    return await Role.find();
  }

  async getRoleById(id) {
    return await Role.findById(id);
  }

  async updateRole(id, updateData) {
    return await Role.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async deleteRole(id) {
    return await Role.findByIdAndDelete(id);
  }
}

module.exports = new RoleService();