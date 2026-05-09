const UserAddressService = require("../services/UserAddressService");

class UserAddressController {
  async create(req, res) {
    try {
      const userAddress = await UserAddressService.createUserAddress(req.body);
      res.status(201).json(userAddress);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const userAddresss = await UserAddressService.getAllUserAddresss();
      res.json(userAddresss);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const userAddress = await UserAddressService.getUserAddressById(req.params.id);

      if (!userAddress) return res.status(404).json({ message: "UserAddress not found" });

      res.json(userAddress);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await UserAddressService.updateUserAddress(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "UserAddress not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await UserAddressService.deleteUserAddress(req.params.id);

      if (!deleted) return res.status(404).json({ message: "UserAddress not found" });

      res.json({ message: "UserAddress deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new UserAddressController();