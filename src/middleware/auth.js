const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
  const token = req.cookies.auth_token;

  console.log("COOKIE:", req.cookies); // 🔍 TEST
  if (!token) {
    return res.status(401).json({ message: "Unauthenticated" });
  }
  
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
