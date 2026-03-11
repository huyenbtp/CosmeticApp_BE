const Account = require("../models/Account");
const Staff = require("../models/Staff");
const { comparePassword, hashPassword } = require("../utils/hash");
const { signToken } = require("../utils/jwt");

const AuthService = {
  async login({ username, password }) {
    const account = await Account.findOne({ username });
    if (!account) throw new Error("Username does not exist");

    if (account.status === "inactive")
      throw new Error("Account is inactive");

    const isMatch = await comparePassword(password, account.password_hash);
    if (!isMatch) throw new Error("Wrong password");

    const staff = await Staff.findOne({ account_id: account._id });

    const token = signToken({
      accountId: account._id.toString(),
      role: account.role
    });

    return {
      token,
      role: account.role,
      user: {
        _id: staff._id,
        full_name: staff.full_name,
        image: staff.image,
        position: staff.position,
      },
    };
  },

  async changePassword(accountId, oldPass, newPass) {
    const acc = await Account.findById(accountId);
    if (!acc) throw new Error("Account not found");

    const isMatch = await comparePassword(oldPass, acc.password);
    if (!isMatch) throw new Error("The old password is incorrect.");

    if (oldPass === newPass) {
      throw new Error("The new password cannot be the same as the old password.");
    }

    acc.password = await hashPassword(newPass);
    await acc.save();
  },

  async resetPassword(accountId, newPass) {
    const account = await Account.findById(accountId);
    if (!account) throw new Error("Account not found");

    account.password = await hashPassword(newPass);
    await account.save();
  }
}

module.exports = AuthService;
