const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");

const getUserById = async (id) => {
    try{
        const user = await User.findOne({_id:id});
        return user;
    }
    catch(error){ 
        throw new ApiError(httpStatus.BAD_REQUEST, "\"\"userId\"\" must be a valid mongo id");
    }
}

 const getUserByEmail = async (email)=>{
    try{
        const user = await User.findOne({email:email});
        return user;
    }
    catch(error){ 
        throw new ApiError(httpStatus.BAD_REQUEST, "\"\"email\"\" must be a valid mongo email");
    }
}

const createUser = async (user) => {
    const emailExists = await User.isEmailTaken(user.email);
        if(!emailExists){
            try{
                const newUser = await User.create(user);
                return newUser;
            }
            catch(error){
                throw new ApiError(httpStatus.OK, "unable to create the user");
            }
        }
        else{
            throw new ApiError(httpStatus.OK, "Email already taken");
        }   
}

const getUserAddressById = async (id) => {
    const user = await User.findOne({ _id: id },{ email: 1, address: 1 });
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    return user;
};

const setAddress = async (user, newAddress) => {
  user.address = newAddress;
  await user.save();
  return user.address;
};

module.exports = {
    getUserById,getUserByEmail,createUser,getUserAddressById,setAddress
};
