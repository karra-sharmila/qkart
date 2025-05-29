const Joi = require("joi");
const { password } = require("./custom.validation");

const register ={body : Joi.object({
  email : Joi.string().email().required(),
  password: Joi.string().required().custom(password),
  name: Joi.string().required()
})
}
;

const login = {body : Joi.object({
  email : Joi.string().required().email(),
  password: Joi.string().required().custom(password),
})}


module.exports = {
  register,
  login,
};
