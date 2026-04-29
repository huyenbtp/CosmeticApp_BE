const mongoose = require("mongoose");
const User = require("../models/User");
const Customer = require("../models/Customer.js");
const Staff = require("../models/Staff");
const Role = require("../models/Role");
const { comparePassword, hashPassword } = require("../utils/hash");
const { signToken, verifyToken } = require("../utils/jwt");
const { sendMail } = require("../utils/mailer.js");
const { verifyEmailTemplate } = require("../utils/emailTemplates/verifyEmail.js");
const { resetPasswordTemplate } = require("../utils/emailTemplates/resetPassword.js");

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
      const existedEmail = await User.findOne({ email }).session(session);
      if (existedEmail) {
        if (!existedEmail.is_verified) {
          // ❗ cho phép đăng ký lại
          await Customer.deleteOne({ user_id: existedEmail._id }).session(session);
          await User.deleteOne({ _id: existedEmail._id }).session(session);
        } else {
          throw new Error("Email already exists");
        }
      }

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

    if (!user) {
      console.error("User not created, skip sending email");
      return;
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

      const link = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;
      const html = verifyEmailTemplate(link, full_name);

      const mailOptions = {
        to: email,
        subject: "[Skintify] - Verify your email",
        html
      };

      // gửi email
      await sendMail(mailOptions);
    } catch (e) {
      console.error("Send mail failed:", e.message);
    }

    return user;
  },

  async verifyEmail(token) {
    let decoded;

    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new Error("Token expired, please request a new verification email");
      }
      throw new Error("Invalid token");
    }

    if (!decoded || !decoded.user_id || decoded.type !== "verify_email")
      throw new Error("Invalid token");

    const user = await User.findById(decoded.user_id);

    if (!user) throw new Error("User not found");

    if (user.is_verified) {
      return { message: "Already verified" };
    }

    user.is_verified = true;
    await user.save();

    return { message: "Email verified" };
  },

  async resendVerification(email) {
    const user = await User.findOne({ email });

    if (!user || user.is_verified) {
      return {
        message: "If the email exists, a verification email has been sent"
      };
    }

    const token = signToken(
      {
        user_id: user._id,
        type: "verify_email"
      },
      "24h"
    );

    const link = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;
    const html = verifyEmailTemplate(link);

    await sendMail({
      to: user.email,
      subject: "[Skintify] - Verify your email",
      html
    });

    return { message: "Verification email resent" };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email })
      .populate("role_id");

    if (!user) throw new Error("Invalid email or password");

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) throw new Error("Invalid email or password");

    if (!user.is_active)
      throw new Error("User is inactive");

    if (!user.is_verified) {
      throw new Error("Email not verified. Please check your email or resend verification.");
    }

    if (!user.password_hash) {
      throw new Error("Please set your password via email");
    }

    const token = signToken({
      userId: user._id.toString(),
      role: user.role_id.name
    }, '7d');

    let profile = null;

    if (user.role_id.name === "customer") {
      profile = await Customer.findOne({ user_id: user._id });
    } else {
      profile = await Staff.findOne({ user_id: user._id });
    }

    return {
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role_id.name
      },
      profile
    };
  },

  async changePassword(userId, oldPass, newPass) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const isMatch = await comparePassword(oldPass, user.password_hash);
    if (!isMatch) throw new Error("The old password is incorrect.");

    if (oldPass === newPass) {
      throw new Error("The new password cannot be the same as the old password.");
    }

    user.password_hash = await hashPassword(newPass);
    await user.save();
  },

  async sendResetPasswordEmail(email) {
    const user = await User.findOne({ email });

    if (!user) {
      return {
        message: "If the email exists, a verification email has been sent"
      };
    }

    const token = signToken(
      {
        user_id: user._id,
        type: "set_password"
      },
      "24h"
    );

    const link = `${process.env.CLIENT_URL}/auth/reset-password?token=${token}`;
    const html = resetPasswordTemplate(link);

    await sendMail({
      to: user.email,
      subject: "[Skintify] - Reset your password",
      html
    });

    return { message: "Reset password email sent" };
  },

  async resetPassword(token, newPassword) {
    let decoded;

    try {
      decoded = verifyToken(token);
    } catch (err) {
      throw new Error("Token invalid or expired");
    }

    if (!decoded || !decoded.user_id || decoded.type !== "set_password")
      throw new Error("Invalid token");

    const user = await User.findById(decoded.user_id);

    if (!user) throw new Error("User not found");

    const hashed = await hashPassword(newPassword);

    user.password_hash = hashed;

    await user.save();

    return { message: "Password set successfully" };
  },
}

module.exports = AuthService;
