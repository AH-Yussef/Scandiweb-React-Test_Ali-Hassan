import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './style.css';
import { CART } from '../../Const';
import { cartLight } from '../../../assets';
import { AddToCartPopUp } from '../../../components';

export default class Product extends Component {
  state = {
    isAddToCartBtnShown: false,
    isAddToCartPopupShown: false
  };

  render() {
    const { product, currency, apolloClient } = this.props;
    const { id, name, inStock, gallery } = product;
    const { isAddToCartBtnShown, isAddToCartPopupShown } = this.state;
    const primaryImage = gallery[0];

    return (
      <div
        className={`product-card flex bg-white fs-18 ${inStock ? 'text-black' : 'text-dark-gray'}`}
        onMouseEnter={this.toggleAddToCartBtn}
        onMouseLeave={this.toggleAddToCartBtn}>
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
        {isAddToCartBtnShown && inStock && (
          <button className="add-to-cart bg-accent vh-center" onClick={this.addToCartOrShowPopup}>
            <img src={cartLight} alt="add to cart" />
          </button>
        )}
        {isAddToCartPopupShown && (
          <AddToCartPopUp
            productId={id}
            currency={currency}
            apolloClient={apolloClient}
            onUpdateCart={this.props.onUpdateCart}
            onClosePopup={this.toggleAddToCartPopup}
          />
        )}
      </div>
    );
  }

  toggleAddToCartBtn = () => {
    this.setState({ isAddToCartBtnShown: !this.state.isAddToCartBtnShown });
  };

  toggleAddToCartPopup = () => {
    this.setState({
      isAddToCartPopupShown: !this.state.isAddToCartPopupShown,
      isAddToCartBtnShown: false
    });
  };

  formatCurrrency = () => {
    const currency = this.props.currency;
    const { prices } = this.props.product;
    return `${prices[currency].currency.symbol} ${prices[currency].amount}`;
  };

  addToCartOrShowPopup = () => {
    if (this.props.product.attributes.length > 0) {
      this.toggleAddToCartPopup();
      return;
    }

    this.addToCart();
  };

  addToCart = () => {
    if (this.doesExistInCart()) {
      this.increaseQty();
      return;
    }

    const cartItem = { ...this.props.product, quantity: 1 };

    let cart = JSON.parse(sessionStorage.getItem(CART)) || [];
    cart.push(cartItem);
    sessionStorage.setItem(CART, JSON.stringify(cart));

    this.props.onUpdateCart();
  };

  increaseQty = () => {
    const { product } = this.props;
    const cart = JSON.parse(sessionStorage.getItem(CART));

    for (const item of cart) {
      if (item.id === product.id) {
        item.quantity += 1;
        break;
      }
    }
    sessionStorage.setItem(CART, JSON.stringify(cart));

    this.props.onUpdateCart();
  };

  doesExistInCart = () => {
    const { product } = this.props;
    const cart = JSON.parse(sessionStorage.getItem(CART)) || [];

    if (cart.filter((item) => item.id === product.id).length > 0) return true;
    return false;
  };
}

Product.propTypes = {
  product: PropTypes.any,
  currency: PropTypes.any,
  apolloClient: PropTypes.any,
  onUpdateCart: PropTypes.any
};
