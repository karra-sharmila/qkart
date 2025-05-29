const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { cartService } = require("../services");

const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCartByUser(req.user);
  res.send(cart);
});

const addProductToCart = catchAsync(async (req, res) => {
  const cart = await cartService.addProductToCart(
    req.user,
    req.body.productId,
    req.body.quantity
  );
  res.status(httpStatus.CREATED).send(cart);
});

const updateProductInCart = catchAsync(async (req, res) => {
  if(req.body.quantity > 0){
    const cart = await cartService.updateProductInCart(
      req.user,
      req.body.productId,
      req.body.quantity
    );
    res.status(httpStatus.OK).send(cart); 
  }
  if(req.body.quantity == 0){
    const cart = await cartService.deleteProductFromCart(
      req.user,
      req.body.productId,
    );
    res.status(httpStatus.NO_CONTENT).send();  
  }
});

const checkout = catchAsync(async (req, res) => {
    await cartService.checkout(req.user);
  return (
    res.status(204).send()
  );
});

module.exports = {
  getCart,
  addProductToCart,
  updateProductInCart,
  checkout,
};
