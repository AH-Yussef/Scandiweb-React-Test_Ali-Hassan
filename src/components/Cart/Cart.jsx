import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './style.css';
import { CartItem } from '../../components';

Cart.propTypes = {
  cart: PropTypes.any,
  currency: PropTypes.any,
  onUpdateCart: PropTypes.any
};

export default class Cart extends Component {
  render() {
    const { cart, currency } = this.props;

    return (
      <div>
        <div className="header text-black fs-32 fw-bold upper-case">Cart</div>
        <div className="container">
          {cart.map((cartItem, index) => (
            <CartItem
              key={index}
              currency={currency}
              cartItem={cartItem}
              onUpdateCart={this.handleUpdateCart}
            />
          ))}
        </div>
      </div>
    );
  }

  handleUpdateCart = () => this.props.onUpdateCart();
}
