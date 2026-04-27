const mongoose = require("mongoose");
const User = require("../models/User");
const Customer = require("../models/Customer.js");
const Staff = require("../models/Staff");
const Role = require("../models/Role");
const { comparePassword, hashPassword } = require("../utils/hash");
const { signToken, verifyToken } = require("../utils/jwt");
const { sendMail } = require("../utils/mailer.js");

const AuthService = {
  async registerCustomer({
    email,
    password,
    full_name,
    gender,
    phone,
  }) {
    let user;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const existedEmail = await User.findOne({ email });
      if (existedEmail) throw new Error("Email already exists");

      const hashed = await hashPassword(password);

      const role = await Role.findOne({ name: "customer" }).session(session);
      if (!role) throw new Error("Role not found");

      const users = await User.create([{
        email,
        password_hash: hashed,
        role_id: role._id,
        is_verified: false
      }], { session });

      user = users[0];
      
      await Customer.create([{
        user_id: user._id,
        full_name,
        gender,
        phone
      }], { session });

      await session.commitTransaction();

    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }

    try {
      // tạo JWT verify token
      const token = signToken(
        {
          user_id: user._id,
          type: "verify_email"
        },
        "24h"
      );

      const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

      const mailOptions = {
        to: email,
        subject: "[Skintify] - Verify your email",
        text: `Please click on the link below to verify your email: ${link}`,
      };

      // gửi email
      await sendMail(mailOptions);
    } catch (e) {
      console.error("Send mail failed:", e.message);
    }

  },

  async verifyEmail(token) {
    const decoded = verifyToken(token);

    if (!decoded || !decoded.user_id || decoded.type !== "verify_email")
      throw new Error("Token invalid or expired");

    await User.updateOne(
      { _id: decoded.user_id },
      { is_verified: true }
    );

    return { message: "Email verified" };
  },

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
    }, '1d');

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
