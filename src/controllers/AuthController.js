const AuthService = require("../services/AuthService");

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
    try {
      const { token } = req.query;
      if (!token) {
        return res.status(400).json({ message: "Token is required" });
      }

      await AuthService.verifyEmail(req.query.token);

      res.json({ message: "Email verified" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const { token, role, user } = await AuthService.login({
        username,
        password
      });

      res.cookie("auth_token", token, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
      });

      res.cookie("auth_role", role, {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
      });

      res.json({
        role,
        user,
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
