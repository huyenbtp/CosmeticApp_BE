const AuthService = require("../services/AuthService");
const { getSuccessHTML } = require("../utils/html/verifySuccess.js");
const { getErrorHTML } = require("../utils/html/verifyError.js");

const AuthController = {
  async registerCustomer(req, res) {
    try {
      const user = await AuthService.registerCustomer(req.body);
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
      return res.status(400).send(getErrorHTML("Token is required"));
    }

    try {
      await AuthService.verifyEmail(token);

      return res.send(getSuccessHTML());

    } catch (e) {
      return res.status(400).send(getErrorHTML(e.message));
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

      const { token, user, profile } = await AuthService.login({
        email,
        password
      });

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });

      res.cookie("auth_role", user.role, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });

      res.json({
        access_token: token,
        user,
        profile,
      });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async logout(req, res) {
    res.clearCookie("auth_token");
    res.clearCookie("auth_role");
    res.json({ message: "Logged out" });
  },

  async changePassword(req, res) {
    try {
      await AuthService.changePassword(
        req.user.accountId,
        req.body.oldPassword,
        req.body.newPassword
      );
      res.json({ message: 'Password changed successfully' });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async resetPassword(req, res) {
    try {
      const { accountId, newPassword } = req.body;
      await AuthService.resetPassword(accountId, newPassword);
      res.json({ message: 'Password reset successfully' });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },
}

module.exports = AuthController;
