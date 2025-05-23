const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
    const cart = await Cart.findOne({email : user.email});
    if(cart === null){
      throw new ApiError(httpStatus.NOT_FOUND,"User does not have a cart");
    }
    return cart;
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
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

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
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

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
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

// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
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
