const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { authService, userService, tokenService } = require("../services");

const register = catchAsync(async (req, res) => {
  try{
    const user = await userService.createUser(req.body);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.CREATED).send({user,tokens});
  }
  catch(error){
    return res
  .status(error.statusCode)
  .json({ message: error.message });
  }
});

const login = catchAsync(async (req, res) => {
    const user = await authService.loginUserWithEmailAndPassword(req.body.email,req.body.password);
    const tokens = await tokenService.generateAuthTokens(user);
    res.status(httpStatus.OK).send({user,tokens});
});

module.exports = {
  register,
  login,
};
