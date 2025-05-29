const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");
const { User } = require("../models");

const getUser = catchAsync(async (req, res) => {
    const id = req.params.userId;
    const uid = req.user._id;
    const qParam = req.query.q;
    if(uid != id){
      throw new ApiError(httpStatus.FORBIDDEN, "Invalid authentication");
    }
    try{
      if(qParam === "address"){
        const user = await userService.getUserAddressById(id);
        return res.status(200).json({"address" : user.address}); 
      }
      const validData = await userService.getUserById(id);
      return res.status(200).json(validData);
    }
    catch(error){
      console.log("err is ", err);
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
});

const getUserEmail = catchAsync(async (req, res) => {
  const email = req.params.email;
  try{
    const validData = await userService.getUserByEmail(email);
    return res.status(200).json(validData);;
  }
  catch(error){
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
});

const createUser = catchAsync(async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    return res.status(201).json(newUser);
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Unable to create user");
  }
});

const setAddress = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.email != req.user.email) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "User not authorized to access this resource"
    );
  }

  const address = await userService.setAddress(user, req.body.address);

  res.send({
    address: address,
  });
});

module.exports = {
  getUserEmail,createUser,
  getUser,
  setAddress,
};
