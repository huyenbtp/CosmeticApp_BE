const UserAddress = require("../models/UserAddress");
const User = require("../models/User");

class UserAddressService {
  /**
   * Create a new address for a user.
   * If is_default is true, unset all other default addresses of this user.
   */
  async createAddress(data) {
    const { user_id, ...rest } = data;

    // Verify user exists
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    // Handle default address logic
    if (rest.is_default) {
      await UserAddress.updateMany(
        { user_id, is_default: true },
        { is_default: false }
      );
    }

    const address = await UserAddress.create({ user_id, ...rest });
    return address;
  }

  /**
   * Get all addresses of a user, sorted by default first, then recent updated.
   */
  async getAddressesByUserId(user_id) {
    const user = await User.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }

    return await UserAddress.find({ user_id }).sort({ is_default: -1, updatedAt: -1 });
  }

  /**
   * Get a single address by its ID.
   */
  async getAddressById(id) {
    const address = await UserAddress.findById(id);
    if (!address) {
      throw new Error("Address not found");
    }
    return address;
  }

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
  }

  /**
   * Delete an address by its ID.
   */
  async deleteAddress(id) {
    const address = await UserAddress.findByIdAndDelete(id);
    if (!address) {
      throw new Error("Address not found");
    }
    return address;
  }
}

module.exports = new UserAddressService();