import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, Card, Rate } from "antd";
import React from "react";
import "./Product.css";

export default function Product(props) {
  return (
    // Use Antd Card component to create a card-like view for individual products
    <Card className="product" hoverable>
      {/* Display product image */}
      <img className="product-image" alt="product" src={props.product.image} />

      {/* Display product information */}
      <div className="product-info">
        {/* Display product name and category */}
        <div className="product-info-text">
          <div className="product-title">{props.product.name}</div>
          <div className="product-category">{`Category: ${props.product.category}`}</div>
        </div>

        {/* Display utility elements */}
        <div className="product-info-utility">
          {/* Display product cost */}
          <div className="product-cost">{`₹${props.product.cost}`}</div>

          {/* Display star rating for the product on a scale of 5 */}
          <div>
            <Rate
              className="product-rating"
              disabled={true}
              defaultValue={props.product.rating}
            />
          </div>

          {/* Display the "Add to Cart" button */}
          <Button
            shape="round"
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={props.addToCart}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
}
