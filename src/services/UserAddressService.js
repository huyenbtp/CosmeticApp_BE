const UserAddress = require("../models/UserAddress");
const User = require("../models/User");

const UserAddressService = {
  /**
   * Get all addresses of a user, sorted by default first, then recent updated.
   */
  async getAddressesByUserId(user_id) {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    return await UserAddress.find({ user_id }).sort({ is_default: -1, updatedAt: -1 });
  },

  /**
   * Get default address of a user
   */
  async getDefaultAddressByUserId(user_id) {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const defaultAddress = await UserAddress.findOne({
      user_id, is_default: true
    });

    return defaultAddress || null;
  },

  /**
   * Create a new address for a user.
   * If is_default is true, unset all other default addresses of this user.
   */
  async createAddress(user_id, data) {
    // Verify user exists
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    // Handle default address logic
    const defaultAddress = await UserAddress.findOne({
      user_id, is_default: true
    })

    if (!defaultAddress) data.is_default = true;
    else if (data.is_default) {
      defaultAddress.is_default = false;
      defaultAddress.save();
    }

    const address = await UserAddress.create({ user_id, ...data });
    return address;
  },

  /**
   * Update an address.
   * If setting is_default to true, unset other defaults for the same user.
   */
  async updateAddress(id, updateData) {
    const address = await UserAddress.findById(id);
    if (!address) {
      throw new Error("Address not found");
    }

    if (updateData.is_default) {
      await UserAddress.updateMany(
        { user_id: address.user_id, is_default: true, _id: { $ne: id } },
        { is_default: false }
      );
    }

    Object.assign(address, updateData);
    await address.save();
    return address;
  },

  /**
   * Delete an address by its ID.
   */
  async deleteAddress(id) {
    const address = await UserAddress.findById(id);
    if (!address) {
      throw new Error("Address not found");
    }
    if (address.is_default) {
      throw new Error("Default address can not be deleted");
    }
    return await address.deleteOne();
  },
}

module.exports = UserAddressService;