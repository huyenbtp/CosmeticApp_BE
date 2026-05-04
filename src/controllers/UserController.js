const UserService = require("../services/UserService");
const { validateUpdateCustomer } = require("../validators/customer.validator");
const { validateUpdateStaff } = require("../validators/staff.validator");

class UserController {
  async updateByStaff(req, res) {
    try {
      const data = {
        ...req.body,
        ...(req.file && { image: req.file.path }),
      };

      validateUpdateStaff(data);

      const updated = await UserService.updatePersonalProfile(req.user.userId, data, false);

      if (!updated) return res.status(404).json({ message: "User not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateByCustomer(req, res) {
    try {
      const data = req.body;

      validateUpdateCustomer(data);

      const updated = await UserService.updatePersonalProfile(req.user.userId, data, true);

      if (!updated) return res.status(404).json({ message: "User not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async changeUserStatus(req, res) {
    try {
      const { is_active } = req.body;

      if (is_active === undefined) {
        return res.status(400).json({ message: "is_active is required" });
      }

      const updated = await UserService.changeUserStatus(req.params.id, is_active);

      if (!updated) return res.status(404).json({ message: "User not found" });

      res.json({ message: "User's status changed" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new UserController();