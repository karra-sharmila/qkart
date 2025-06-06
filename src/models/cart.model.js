const mongoose = require('mongoose');
const { productSchema } = require('./product.model');
const config = require("../config/config")

const cartSchema = mongoose.Schema(
  {
    email :{ 
    type : String,
    unique : true,
    required : true
    },
    cartItems : {
      type : [{
        product : productSchema,
        quantity : {
          type : Number,
          min : 1,
        }
      }]
    },
    paymentOption : {
      type : String,
      default : config.default_payment_option,
    }
  },
  {
    timestamps: false,
  }
);


/**
 * @typedef Cart
 */
const Cart = mongoose.model('Cart', cartSchema);

module.exports.Cart = Cart;