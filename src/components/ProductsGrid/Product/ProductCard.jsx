import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './style.css';
import { CART } from '../../Const';
import { cartLight } from '../../../assets';

Product.propTypes = {
  product: PropTypes.any,
  currency: PropTypes.any
};

export default class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAddToCartShown: false,
      inCart: this.doesExistInCart()
    };
  }

  render() {
    const { id, name, inStock, gallery, attributes } = this.props.product;
    const { isAddToCartShown, inCart } = this.state;
    const primaryImage = gallery[0];

    return (
      <div
        className={`product-card flex bg-white fs-18 ${inStock ? 'text-black' : 'text-dark-gray'}`}
        onMouseEnter={this.toggleAddToCart}
        onMouseLeave={this.toggleAddToCart}>
        <Link to={`/products/${id}`} className="text-link product-card-body">
          {!inStock && (
            <div className="out-of-stock fs-24 fw-regular upper-case vh-center text-dark-gray">
              out of stock
            </div>
          )}
          <div className="img-container">
            <img src={primaryImage} alt="product" className="contained-img" />
          </div>
          <div className="fw-light">{name}</div>
          <div className="fw-bold">{this.formatCurrrency()}</div>
        </Link>
        {isAddToCartShown && inStock && attributes.length === 0 && (
          <button
            className={this.setAddToCartBtnClasses()}
            onClick={this.addToCart}
            disabled={inCart}>
            <img src={cartLight} alt="add to cart" />
          </button>
        )}
      </div>
    );
  }

  toggleAddToCart = () => {
    this.setState({ isAddToCartShown: !this.state.isAddToCartShown });
  };

  formatCurrrency = () => {
    const currency = this.props.currency;
    const { prices } = this.props.product;
    return `${prices[currency].currency.symbol} ${prices[currency].amount}`;
  };

  addToCart = () => {
    const cartItem = { ...this.props.product, quantity: 1 };

    let cart = JSON.parse(sessionStorage.getItem(CART)) || [];
    cart.push(cartItem);
    sessionStorage.setItem(CART, JSON.stringify(cart));

    this.setState({ inCart: true });
  };

  doesExistInCart = () => {
    const cart = JSON.parse(sessionStorage.getItem(CART)) || [];
    if (cart.filter((item) => item.id === this.props.product.id).length > 0) return true;
    return false;
  };

  setAddToCartBtnClasses = () => {
    let classes = 'add-to-cart bg-accent vh-center';
    if (this.doesExistInCart()) classes += ' add-to-cart-disabled';
    return classes;
  };
}
