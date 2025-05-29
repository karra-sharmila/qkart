import { ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Card, message, Spin, InputNumber } from "antd";
import React from "react";
import { config } from "../App";
import "./Cart.css";

export default class Cart extends React.Component {
  constructor() {
    super();
    this.state = {
      items: [],
      loading: false,
    };
  }

 validateResponse = (errored, response) => {
    if (errored) {
      message.error(
        "Could not update cart. Check that the backend is running, reachable and returns valid JSON."
      );
      return false;
    } else if (response.message) {
      message.error(response.message);
      return false;
    }

    return true;
  };

  getCart = async () => {
    let response = {};
    let errored = false;

    this.setState({
      loading: true,
    });

    try {
      response = await (
        await fetch(`${config.endpoint}/cart`, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${this.props.token}`,
          },
        })
      ).json();
    } catch (e) {
      errored = true;
    }

    this.setState({
      loading: false,
    });

    if (this.validateResponse(errored, response)) {
      return response;
    }
  };

  postToCart = async (productId, qty) => {
    let response = {};
    let errored = false;
    let statusCode;

    this.setState({
      loading: true,
    });

    try {
      response = await (
        await fetch(`${config.endpoint}/cart`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.props.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: productId,
            quantity: qty,
          }),
        })
      ).json();
    } catch (e) {
      errored = true;
    }

    this.setState({
      loading: false,
    });

    if (this.validateResponse(errored, response, statusCode)) {
      await this.refreshCart();
    }
  };

  putToCart = async (productId, qty) => {
    let response = {};
    let errored = false;
    let statusCode;

    this.setState({
      loading: true,
    });

    try {
      let response_object = await fetch(`${config.endpoint}/cart`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.props.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productId,
          quantity: qty,
        }),
      });

      statusCode = response_object.status;
      if (statusCode !== 204) {
        response = await response_object.json();
      }
    } catch (e) {
      errored = true;
    }

    this.setState({
      loading: false,
    });
    if (
      statusCode === "204" ||
      this.validateResponse(errored, response, statusCode)
    ) {
      await this.refreshCart();
    }
  };
  refreshCart = async () => {
    const cart = await this.getCart();
    if (cart && cart.cartItems) {
      this.setState({
        items: cart.cartItems.map((item) => ({
          ...item,
          product: this.props.products.find(
            (product) => product._id === item.product._id
          ),
        })),
      });
    }
  };

  calculateTotal = () => {
    return this.state.items.length
      ? this.state.items.reduce(
          (total, item) => total + item.product.cost * item.quantity,
          0
        )
      : 0;
  };

  componentDidMount() {
    this.refreshCart();
  }

  getQuantityElement = (item) => {
    return this.props.checkout ? (
      <>
        <div className="cart-item-qty-fixed"></div>
        <div className="cart-item-qty-fixed">Qty: {item.quantity}</div>
      </>
    ) : (
      <InputNumber
        min={0}
        max={10}
        value={item.quantity}
        onChange={(value) => {
          this.putToCart(item.product._id, value);
        }}
      />
    );
  };

  render() {
    return (
      <div
        className={["cart", this.props.checkout ? "checkout" : ""].join(" ")}
      >
        {/* Display cart items or a text banner if cart is empty */}
        {this.state.items.length ? (
          <>
            {/* Display a card view for each product in the cart */}
            {this.state.items.map((item) => (
              <Card className="cart-item" key={item.productId}>
                {/* Display product image */}
                <img
                  className="cart-item-image"
                  alt={item.product.name}
                  src={item.product.image}
                />

                {/* Display product details*/}
                <div className="cart-parent">
                  {/* Display product name, category and total cost */}
                  <div className="cart-item-info">
                    <div>
                      <div className="cart-item-name">{item.product.name}</div>

                      <div className="cart-item-category">
                        {item.product.category}
                      </div>
                    </div>

                    <div className="cart-item-cost">
                      ₹{item.product.cost * item.quantity}
                    </div>
                  </div>

                  {/* Display field to update quantity or a static quantity text */}
                  <div className="cart-item-qty">
                    {this.getQuantityElement(item)}
                  </div>
                </div>
              </Card>
            ))}

            {/* Display cart summary */}
            <div className="total">
              <h2>Total</h2>

              {/* Display net quantity of items in the cart */}
              <div className="total-item">
                <div>Products</div>
                <div>
                  {this.state.items.reduce(function (sum, item) {
                    return sum + item.quantity;
                  }, 0)}
                </div>
              </div>

              {/* Display the total cost of items in the cart */}
              <div className="total-item">
                <div>Sub Total</div>
                <div>₹{this.calculateTotal()}</div>
              </div>

              {/* Display shipping cost */}
              <div className="total-item">
                <div>Shipping</div>
                <div>N/A</div>
              </div>
              <hr></hr>

              {/* Display the sum user has to pay while checking out */}
              <div className="total-item">
                <div>Total</div>
                <div>₹{this.calculateTotal()}</div>
              </div>
            </div>
          </>
        ) : (
          // Display a static text banner if cart is empty
          <div className="loading-text">
            Add an item to cart and it will show up here
            <br />
            <br />
          </div>
        )}

        {/* Display a "Checkout" button */}

        {!this.props.checkout && (
          <Button
            className="ant-btn-warning"
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              if (this.state.items.length) {
                this.props.history.push("/checkout");
              } else {
                message.error("You must add items to cart first");
              }
            }}
          >
            <strong> Checkout</strong>
          </Button>
        )}

        {/* Display a loading icon if the "loading" state variable is true */}
        {this.state.loading && (
          <div className="loading-overlay">
            <Spin size="large" />
          </div>
        )}
      </div>
    );
  }
}
