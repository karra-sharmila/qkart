const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const config = require("./config");
const { tokenTypes } = require("./tokens");
const { User } = require("../models");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest :ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  if(payload.type != tokenTypes.ACCESS){
    return done(new ApiError(httpStatus.UNAUTHORIZED,"Invalid token type"), false);
  }
  try{
    const user = await User.findById(payload.sub);
    if (user) {
      return done(null,user);
    }
    return done(null, false);
  }
  catch(err){
    return done(err, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
