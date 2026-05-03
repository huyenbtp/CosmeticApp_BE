const jwt = require('jsonwebtoken');
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

const signToken = (payload, expireTime = '8h') => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: expireTime
  });
};
const signRefreshToken = (payload, expireTime = '7d') => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: expireTime
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};
const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

module.exports = {
  signToken,
  signRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
