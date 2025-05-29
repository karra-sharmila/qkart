const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { tokenTypes } = require("../config/tokens");

const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  try {
    const payload = {
      sub: userId,
      type,
      exp: expires,
      iat: Date.now()/1000
    };
    const token = jwt.sign(payload, secret);
    return token;
  } catch (error) {
    throw error;
  }
};

const generateAuthTokens = async (user) => {
  const { _id } = user;
  const accessTokenExpiry = Math.floor(Date.now()/1000) + config.jwt.accessExpirationMinutes * 60; //minutes to seconds
  const type = tokenTypes.ACCESS;
  try {
    const token = await generateToken(_id, accessTokenExpiry, type);
    const response = {
      [type]: {
        token: token,
        expires: new Date(accessTokenExpiry * 1000), // miliseconds
      },
    };
    return response;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  generateToken,
  generateAuthTokens,
};
