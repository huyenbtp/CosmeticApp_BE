const UserAddressService = require("../services/UserAddressService");

const UserAddressController = {
  async getAllByUserId(req, res) {
    try {
      const user_id = req.user.userId;

      const userAddress = await UserAddressService.getAddressesByUserId(user_id);

      res.json(userAddress);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getDefaultByUserId(req, res) {
    try {
      const user_id = req.user.userId;

      const userAddress = await UserAddressService.getDefaultAddressByUserId(user_id);

      if (!userAddress) return res.status(404).json({ message: "Default user address not found" });

      res.json(userAddress);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async create(req, res) {
    try {
      const user_id = req.user.userId;
      const userAddress = await UserAddressService.createAddress(user_id, req.body);
      res.status(201).json(userAddress);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      const updated = await UserAddressService.updateAddress(req.params.id, req.body);

      if (!updated) return res.status(404).json({ message: "User address not found" });

      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await UserAddressService.deleteAddress(req.params.id);

      if (!deleted) return res.status(404).json({ message: "User address not found" });

      res.json({ message: "User address deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
}

module.exports = UserAddressController;