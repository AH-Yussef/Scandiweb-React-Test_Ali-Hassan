import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './style.css';
import { CART } from '../../Const';
import { FETCH_SINGLE_PRODUCT } from '../../../GraphQl/queries';

export default class AddToCartPopUp extends Component {
  state = {
    product: null
  };

  async componentDidMount() {
    const { data } = await this.props.apolloClient.query({
      query: FETCH_SINGLE_PRODUCT,
      variables: { id: this.props.productId }
    });
    const product = { ...data.product };
    product.attributes = product.attributes.map((attribute) => ({ ...attribute, selected: 0 }));
    this.setState({ product });
  }

  render() {
    const { product } = this.state;

    if (product === null) return <></>;

    return (
      <div className="popup" id="popup-outer" onClick={(e) => this.handleClickOutside(e)}>
        <div className="popup_inner bg-white flex">
          <div className="flex">
            <div>
              <div className="fs-30 fw-semi-bold">{product.brand}</div>
              <div className="fs-30 fw-regular">{product.name}</div>
              <div className="popup-price fs-24 fw-bold">
                {this.formatCurrrency(product.prices)}
              </div>

              <div className="popup-attributes-area">
                {product.attributes.map((attribute) => (
                  <div key={attribute.name}>
                    <div className="flex">
                      {attribute.items.map((item, index) =>
                        this.formatAttrItem(item, index, attribute)
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="popup-right-side">
              <div className="popup-img-container">
                <img src={product.gallery[0]} alt="product" className="contained-img" />
              </div>
            </div>
          </div>
          <div className="popup-footer flex">
            <div
              className="popup-btn popup-cancel-btn fs-18 upper-case"
              onClick={this.props.onClosePopup}>
              Cancel
            </div>
            <div
              className="popup-btn popup-add-to-cart-btn fs-18 text-white upper-case bg-accent"
              onClick={this.addToCart}>
              add to cart
            </div>
          </div>
        </div>
      </div>
    );
  }

  formatCurrrency = (prices) => {
    const activeCurrency = this.props.currency;
    const { currency, amount } = prices[activeCurrency];
    return `${currency.symbol} ${amount}`;
  };

  formatAttrItem = (item, index, attribute) => {
    let classes = 'cart-item-attribute-box fs-16 fw-regular select-none vh-center ';

    if (attribute.type.toLowerCase() === 'swatch') {
      if (attribute.selected === index) classes += 'cart-item-attr-swatch-active text-white';
      return (
        <div
          key={item.value}
          className={classes}
          style={{ backgroundColor: item.value }}
          onClick={() => this.changeAttribute(attribute, index)}
        />
      );
    } else {
      if (attribute.selected === index) classes += 'bg-black text-white';
      return (
        <div
          key={item.value}
          className={classes}
          onClick={() => this.changeAttribute(attribute, index)}>
          <span>{item.value}</span>
        </div>
      );
    }
  };

  changeAttribute = (attribute, index) => {
    const product = { ...this.state.product };
    attribute.selected = index;
    this.setState({ product });
  };

  addToCart = () => {
    if (this.doesExistInCart()) {
      this.increaseQty();
      return;
    }

    const cartItem = { ...this.state.product, id: this.props.productId, quantity: 1 };
    delete cartItem.description;

    let cart = JSON.parse(sessionStorage.getItem(CART)) || [];
    cart.push(cartItem);
    sessionStorage.setItem(CART, JSON.stringify(cart));

    this.props.onClosePopup();
    this.props.onUpdateCart();
  };

  increaseQty = () => {
    const { product } = this.state;
    const cart = JSON.parse(sessionStorage.getItem(CART));

    for (const item of cart) {
      if (item.id === this.props.productId) {
        if (this.doesMatchAttributes(item, product)) {
          item.quantity += 1;
          break;
        }
      }
    }
    sessionStorage.setItem(CART, JSON.stringify(cart));

    this.props.onUpdateCart();
  };

  doesExistInCart = () => {
    const { product } = this.state;
    const cart = JSON.parse(sessionStorage.getItem(CART)) || [];

    const matchingCartItem = cart.filter((item) => item.id === this.props.productId);
    for (const cartItem of matchingCartItem) {
      if (this.doesMatchAttributes(cartItem, product)) return true;
    }
    return false;
  };

  doesMatchAttributes(copy, original) {
    let isMatch = true;
    for (let i = 0; i < copy.attributes.length; i++) {
      if (copy.attributes[i].selected !== original.attributes[i].selected) {
        isMatch = false;
        break;
      }
    }
    return isMatch;
  }

  handleClickOutside = (e) => {
    if (e.target.id === 'popup-outer') this.props.onClosePopup();
  };
}

AddToCartPopUp.propTypes = {
  productId: PropTypes.any,
  currency: PropTypes.any,
  apolloClient: PropTypes.any,
  onClosePopup: PropTypes.any,
  onUpdateCart: PropTypes.any
};
