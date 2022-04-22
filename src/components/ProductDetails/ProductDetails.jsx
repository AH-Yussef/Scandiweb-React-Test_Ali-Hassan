import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parse from 'html-react-parser';

import './style.css';
import { FETCH_SINGLE_PRODUCT } from '../../GraphQl/queries';
import { CART } from '../Const';

ProductDetails.propTypes = {
  apolloClient: PropTypes.any,
  productId: PropTypes.any,
  currency: PropTypes.any,
  onUpdateCart: PropTypes.any
};

export default class ProductDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      product: null,
      primaryImg: 0
    };
  }

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
    if (this.state.product === null) return <></>;

    const { primaryImg } = this.state;
    const { brand, name, gallery, description, prices, attributes, inStock } = this.state.product;

    return (
      <div className="product-details container flex">
        <div className="secondary-img-col flex">
          {gallery.map((imgUrl, index) => (
            <div
              key={index}
              className={this.setSecondaryImgContainerClasses(index)}
              onClick={() => this.changePrimaryImg(index)}>
              <img src={imgUrl} alt="primary" className="contained-img" />
            </div>
          ))}
        </div>
        <div className="primary-img-container">
          <img src={gallery[primaryImg]} alt="primary" className="contained-img" />
        </div>
        <div className="info-container flex text-black">
          <div className="fs-30 fw-semi-bold">{brand}</div>
          <div className="product-name fs-30 fw-regular">{name}</div>
          {!inStock && <div className="fs-24 text-red fw-light upper-case">out of stock</div>}
          <div className="attributes-area">
            {attributes.map((attribute) => (
              <div key={attribute.name}>
                <div className="fs-18 fw-bold upper-case">{attribute.name}:</div>
                <div className="flex">
                  {attribute.items.map((item, index) =>
                    this.formatAttrItem(item, index, attribute)
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="product-price fs-18 fw-bold upper-case">price:</div>
          <div className="fs-24 fw-bold">{this.formatCurrrency(prices)}</div>
          <button
            className={this.setAddToCartBtnClasses()}
            disabled={!inStock}
            onClick={() => this.addToCart()}>
            <span>add to cart</span>
          </button>
          <div className="desc fs-16 fw-regular">{parse(description)}</div>
        </div>
      </div>
    );
  }

  setSecondaryImgContainerClasses = (index) => {
    let classes = 'secondary-img-container ';
    if (this.state.primaryImg === index) classes += 'active';
    return classes;
  };

  formatCurrrency = (prices) => {
    const activeCurrency = this.props.currency;
    const { currency, amount } = prices[activeCurrency];
    return `${currency.symbol} ${amount}`;
  };

  changePrimaryImg = (index) => this.setState({ primaryImg: index });

  addNewAttributesSelection = (attributes) => {
    const selected = { ...this.state.selected };
    for (const attribute in attributes) {
      selected[attribute] = 0;
    }
    this.setState({ selected });
  };

  formatAttrItem = (item, index, attribute) => {
    let classes = 'attribute-box fs-16 fw-regular select-none vh-center ';

    if (attribute.type.toLowerCase() === 'swatch') {
      if (attribute.selected === index) classes += 'attr-swatch-active text-white';
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

  setAddToCartBtnClasses = () => {
    const { inStock } = this.state.product;
    let classes =
      'add-to-cart-btn bg-accent text-white fs-16 fw-semi-bold upper-case vh-center select-none';
    if (!inStock) classes += ' add-to-cart-disabled';
    return classes;
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
}
