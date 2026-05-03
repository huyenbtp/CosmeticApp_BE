const AuthService = require("../services/AuthService");
const { getVerifySuccessHTML } = require("../utils/html/verifySuccess.js");
const { getVerifyErrorHTML } = require("../utils/html/verifyError.js");
const { getSetPassFormHTML } = require("../utils/html/setPassword.js");
const { getSetPassSuccessHTML } = require("../utils/html/setPasswordSuccess.js");
const { getErrorHTML } = require("../utils/html/error.js");
const { validateCreateCustomer } = require("../validators/customer.validator.js");

const AuthController = {
  async registerCustomer(req, res) {
    try {
      const data = req.body;

      validateCreateCustomer(data);

      const user = await AuthService.registerCustomer(data);

      res.status(201).json({
        message: "Check your email to verify account"
      });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async verifyEmail(req, res) {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(getVerifyErrorHTML("Token is required"));
    }

    try {
      await AuthService.verifyEmail(token);

      return res.send(getVerifySuccessHTML());

    } catch (e) {
      return res.status(400).send(getVerifyErrorHTML(e.message));
    }
  },

  async resendVerification(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const result = await AuthService.resendVerification(email);

      res.status(200).json(result);

    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required"
        });
      }

      const { accessToken, refreshToken, user, profile } = await AuthService.login({
        email,
        password
      });

      res.cookie("access_token", accessToken, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
        path: "/",
      });

      res.cookie("refresh_token", refreshToken, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
        path: "/",
      });

      res.cookie("auth_role", user.role, {
        httpOnly: false,
        secure: true,
        sameSite: "none",
        path: "/",
      });

      res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        user,
        profile,
      });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async refresh(req, res) {
    try {
      const refreshToken =
        req.cookies?.refresh_token ||
        req.body?.refresh_token;

      if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token" });
      }

      const { accessToken } = await AuthService.refresh(refreshToken);

      if (req.cookies?.refresh_token) {
        res.cookie("access_token", accessToken, {
          httpOnly: false,
          secure: true,
          sameSite: "none",
          path: "/",
        });
        return res.json({ message: "Refreshed" });
      }

      res.json({
        access_token: accessToken
      });

    } catch (err) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  },

  async logout(req, res) {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.clearCookie("auth_role");
    res.json({ message: "Logged out" });
  },

  async changePassword(req, res) {
    try {
      await AuthService.changePassword(
        req.user.userId,
        req.body.oldPassword,
        req.body.newPassword
      );
      res.json({ message: 'Password changed successfully' });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" }); // Nếu không có email, trả về lỗi 400
    }

    try {
      const response = await AuthService.sendResetPasswordEmail(email); // Gọi service để gửi email
      res.json(response); // Trả về phản hồi khi email đã được gửi
    } catch (error) {
      res.status(400).json({ error: error.message }); // Nếu có lỗi, trả về lỗi với mã 400
    }
  },

  async getResetPasswordPage(req, res) {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(getErrorHTML("Invalid or missing token"));
    }

    return res.send(getSetPassFormHTML(token));
  },

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).send(getErrorHTML("Missing data"));
      }

      await AuthService.resetPassword(token, newPassword);

      return res.send(getSetPassSuccessHTML());
    } catch (e) {
      return res.status(400).send(getErrorHTML(e.message));
    }
  },

  async me(req, res) {
    try {
      const user = await AuthService.me(req.user.userId);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
}

module.exports = AuthController;
