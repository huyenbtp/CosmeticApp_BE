const StaffService = require("../services/StaffService");
const { validateCreateStaff, validateUpdateStaff } = require("../validators/staff.validator");

const StaffController = {
  async getStaffs(req, res) {
    try {
      const {
        page,
        limit,
        q,
        status,
        role_id,
        is_active,
      } = req.query;

      const result = await StaffService.getStaffs({
        page: Number(page) || 1,
        limit: Number(limit) || 7,
        q,
        status,
        role_id,
        is_active,
      });

      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const staff = await StaffService.getById(req.params.id);
      res.json(staff);
    } catch (e) {
      res.status(404).json({ message: e.message });
    }
  },

  async getByIdToAdminEdit(req, res) {
    try {
      const staff = await StaffService.getByIdToAdminEdit(req.params.id);
      res.json(staff);
    } catch (e) {
      res.status(404).json({ message: e.message });
    }
  },

  async create(req, res) {
    try {
      const data = {
        ...req.body,
        image: req.file?.path || "",
      };

      validateCreateStaff(data);

      const staff = await StaffService.create(data);
      res.status(201).json(staff);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async update(req, res) {
    try {
      const data = {
        ...req.body,
        ...(req.file && { image: req.file.path }),
      };

      validateUpdateStaff(data);

      const updated = await StaffService.update(req.params.id, data);

      if (!updated) return res.status(404).json({ message: "Staff not found" });

      res.json(updated);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async delete(req, res) {
    try {
      await StaffService.deleteStaff(req.params.id);
      res.json({ message: 'Staff & account deleted' });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

}

module.exports = StaffController;