const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
  //console.log("COOKIE:", req.cookies); // 🔍 TEST

  const token =
    req.cookies?.access_token ||
    req.headers.authorization?.split(" ")[1];

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
