const User = require("../models/User");
const Staff = require("../models/Staff");
const { comparePassword, hashPassword } = require("../utils/hash");
const { signToken } = require("../utils/jwt");

const AuthService = {
  async login({ username, password }) {
    const user = await User.findOne({ username });
    if (!user) throw new Error("Username does not exist");

    if (user.status === "inactive")
      throw new Error("User is inactive");

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) throw new Error("Wrong password");

    const staff = await Staff.findOne({ user_id: user._id });

    const token = signToken({
      userId: user._id.toString(),
      role: user.role
    });

    return {
      token,
      role: user.role,
      user: {
        _id: staff._id,
        full_name: staff.full_name,
        image: staff.image,
        position: staff.position,
      },
    };
  },

  async changePassword(userId, oldPass, newPass) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const isMatch = await comparePassword(oldPass, user.password);
    if (!isMatch) throw new Error("The old password is incorrect.");

    if (oldPass === newPass) {
      throw new Error("The new password cannot be the same as the old password.");
    }

    user.password = await hashPassword(newPass);
    await user.save();
  },

  async resetPassword(userId, newPass) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    user.password = await hashPassword(newPass);
    await user.save();
  }
}

module.exports = AuthService;
