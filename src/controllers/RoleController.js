const RoleService = require("../services/RoleService");

class RoleController {
  async create(req, res) {
    try {
      const role = await RoleService.createRole(req.body);
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const roles = await RoleService.getAllRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const role = await RoleService.getRoleById(req.params.id);

      if (!role) return res.status(404).json({ message: "Role not found" });

      res.json(role);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await RoleService.updateRole(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "Role not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await RoleService.deleteRole(req.params.id);

      if (!deleted) return res.status(404).json({ message: "Role not found" });

      res.json({ message: "Role deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new RoleController();