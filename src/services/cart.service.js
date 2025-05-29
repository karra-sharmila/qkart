const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

const getCartByUser = async (user) => {
    const cart = await Cart.findOne({email : user.email});
    if(cart === null){
      throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart");
    }
    return cart;
};

const productInCol = async(productId) => {
  const product = await Product.findOne({_id :productId});
  if(product == null){
    throw new ApiError(httpStatus.BAD_REQUEST,"Product doesn't exist in database");
  }
  return product;
}

const addProductToCart = async (user, productId, quantity) => {
  try
    {
      const product = await productInCol(productId);
      if(product)
        {
          let cart = await Cart.findOne({email : user.email});
          if(cart !== null){
            const productPresent = cart.cartItems.find(item => item.product._id.equals(productId));
            if(productPresent){
              throw new ApiError(httpStatus.BAD_REQUEST,"Product already in cart. Use the cart sidebar to update or remove product from cart");
            }
            cart.cartItems.push({ product: product, quantity: quantity });
            await cart.save();
            return cart;
          }
          const cartObj = {
            email : user.email,
            cartItems : [{
              product : product,
              quantity : quantity,
            }],
            paymentOption : config.default_payment_option
          }
          cart = await Cart.create(cartObj); 
          if (cart == null) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User does not have a cart"
    );
  }
          return cart;
      }
    }
    catch(err){
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,"Internal Server Error");
    }
};

const updateProductInCart = async (user, productId, quantity) => {
  try{
      const product = await productInCol(productId);
      let cart = await Cart.findOne({email : user.email});
      if(cart == null){
        throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart. Use POST to create cart and add a product");
      }
      const productPresent = cart.cartItems.findIndex(item => item.product._id.equals(productId));
      if(productPresent === -1){
        throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart");
      }
      cart.cartItems[productPresent].quantity = quantity;
      await cart.save();
      return cart;
  }
  catch(err){
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,"Internal Server Error");
  }
};

const deleteProductFromCart = async (user, productId) => {
  try
  {  
    let cart = await Cart.findOne({email : user.email});
    if(cart === null){
      throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart");
    }
    const productPresent = cart.cartItems.findIndex(item => item.product._id.equals(productId));
    if(productPresent === -1){
      throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart");
    }
    cart.cartItems.splice(productPresent, 1);
    await cart.save();
    return cart;
  }
  catch(err){
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR,"Internal Server Error");
  }
};

const checkout = async (user) => {
    let cart = await Cart.findOne({email : user.email});
    if(cart == null){
      throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart");
    }
    const productPresent = cart.cartItems;
    if (productPresent.length === 0){
      throw new ApiError(httpStatus.BAD_REQUEST, "Cart does not have any products");
    }
    if (typeof user.hasSetNonDefaultAddress !== 'function' || !(await user.hasSetNonDefaultAddress())){   
      throw new ApiError(httpStatus.BAD_REQUEST, "User does not have an address other than the default address");
    }
    let sum = 0;
    productPresent.forEach((obj) => {
      sum += (obj.product.cost * obj.quantity);
    })
    if(sum > user.walletMoney){
      throw new ApiError(httpStatus.BAD_REQUEST,"Insufficient Wallet Balance");
    }
    let balance = user.walletMoney - sum;
    user.walletMoney = balance;
    await user.save();
    cart.cartItems = [];
    await cart.save();
    return user;
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
