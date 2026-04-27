const jwt = require('jsonwebtoken');

const signToken = (payload, expireTime = '1d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expireTime
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  signToken,
  verifyToken
};
