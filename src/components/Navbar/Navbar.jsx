import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Query } from '@apollo/client/react/components';

import './style.css';
import { CART } from '../Const';
import { logo, cartDark, arrow } from '../../assets';
import { CartItemMini } from '../../components';
import { FETCH_CATEGORIES, FETCH_CURRENCIES } from '../../GraphQl/queries';

Navbar.propTypes = {
  cartTotalQty: PropTypes.any,
  onChangeCurrency: PropTypes.any,
  onUpdateCartOverlay: PropTypes.any
};

export default class Navbar extends Component {
  constructor(props) {
    super(props);
    this.wrapperRef = React.createRef();

    this.state = {
      currentCurrencyLabel: '$',
      currentCurrencyIndex: 0,
      activeCategory: 'all',

      cartTotalQty: props.cartTotalQty,

      isCurrencyMenuShown: false,
      isCartOverlayShown: false
    };
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  componentDidUpdate(prevProps) {
    const { cartTotalQty } = this.props;

    if (prevProps.cartTotalQty !== cartTotalQty) {
      this.setState({ cartTotalQty });
    }
  }

  render() {
    const { currentCurrencyLabel, cartTotalQty, isCurrencyMenuShown, isCartOverlayShown } =
      this.state;

    return (
      <div className="nav-bar flex">
        <div className="categories underline-indicators flex fs-16 fw-regular upper-case">
          {this.fetchCategories()}
        </div>

        <div className="logo vh-center">
          <img src={logo} alt="logo" />
        </div>

        <div className="cart-currency flex" ref={this.wrapperRef}>
          <div className="currency">
            <div onClick={this.toggleCurrecyMenu}>
              <span className="fs-18 fw-medium currency-icon select-none">
                {currentCurrencyLabel}
              </span>
              <img
                src={arrow}
                alt="arrow"
                width={9}
                className={isCurrencyMenuShown ? 'arrow-active' : 'arrow-inactive'}
              />
            </div>

            {isCurrencyMenuShown && (
              <div className="currency-menu bg-white">{this.fetchCurrencies()}</div>
            )}
          </div>

          <div className="cart vh-center" ref={this.wrapperRef}>
            <div className="vh-center" onClick={this.toggleCartOverlay}>
              <img src={cartDark} alt="cart" />
              {cartTotalQty > 0 && (
                <div className="qty-badge text-white fs-14 fw-bold select-none">{cartTotalQty}</div>
              )}
            </div>

            {isCartOverlayShown && (
              <div className="cart-overlay bg-white" id="cart-overlay">
                <div className="text-black fs-16">
                  <span className="fw-bold">My Bag,</span>
                  <span className="fw-medium"> {cartTotalQty} items</span>
                </div>
                <div className="cart-overlay-list">{this.fetchCart()}</div>
                <div className="cart-overlay-total flex">
                  <div className="text-black fs-16 fw-bold">Total</div>

                  <div className="text-black fs-16 fw-bold">{this.getTotalPrice()}</div>
                </div>
                <div className="cart-overlay-footer flex fs-14 fw-semi-bold upper-case">
                  <Link
                    to="/cart"
                    className="cart-overlay-footer-btn text-link cart-overlay-viewbag-btn text-black select-none"
                    onClick={this.toggleCartOverlay}>
                    view bag
                  </Link>
                  <div className="cart-overlay-footer-btn bg-accent text-white select-none">
                    checkout
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  fetchCategories = () => (
    <Query query={FETCH_CATEGORIES}>
      {({ loading, error, data }) => {
        if (loading) return <></>;
        if (error) console.log(error);
        else
          return data.categories.map(({ name }) => (
            <Link
              key={name}
              to={`/category/${name}`}
              className={this.setCategoryClasses(name)}
              onClick={() => this.selectCategory(name)}>
              {name}
            </Link>
          ));
      }}
    </Query>
  );

  selectCategory = (name) => this.setState({ activeCategory: name });

  setCategoryClasses = (name) => {
    let classes = 'category select-none vh-center text-link ';
    if (this.state.activeCategory === name) classes += 'active fw-semi-bold';
    return classes;
  };

  fetchCurrencies = () => (
    <Query query={FETCH_CURRENCIES}>
      {({ loading, error, data }) => {
        if (loading) return <></>;
        if (error) console.log(error);
        else {
          return data.currencies.map(({ label, symbol }, index) => (
            <div
              key={label}
              onClick={() => this.selectCurrency(index, symbol)}
              className="currency-option fs-18 fw-medium flex">
              <div className="currency-symbol">{symbol}</div>
              {label}
            </div>
          ));
        }
      }}
    </Query>
  );

  selectCurrency = (index, symbol) => {
    this.props.onChangeCurrency(index);
    this.setState({ currentCurrencyLabel: symbol });
    this.setStete({ currentCurrencyIndex: index });
    this.toggleCurrecyMenu();
  };

  toggleCurrecyMenu = () => {
    this.setState({
      isCurrencyMenuShown: !this.state.isCurrencyMenuShown,
      isCartOverlayShown: false
    });
  };

  toggleCartOverlay = () => {
    this.setState({
      isCartOverlayShown: !this.state.isCartOverlayShown,
      isCurrencyMenuShown: false
    });
  };

  closeAllMenus = () => {
    const { isCurrencyMenuShown, isCartOverlayShown } = this.state;
    if (isCurrencyMenuShown) this.setState({ isCurrencyMenuShown: false });
    if (isCartOverlayShown) this.setState({ isCartOverlayShown: false });
  };

  fetchCart = () => {
    const { currentCurrencyIndex } = this.state;
    const cart = JSON.parse(sessionStorage.getItem(CART)) || [];

    return cart.map((cartItem, index) => (
      <CartItemMini
        key={index}
        currency={currentCurrencyIndex}
        cartItem={cartItem}
        onUpdateCartOverlay={this.handleUpdateCart}
      />
    ));
  };

  handleUpdateCart = () => {
    const cart = JSON.parse(sessionStorage.getItem(CART)) || [];
    let cartTotalQty = 0;
    cart.forEach((item) => (cartTotalQty += item.quantity));
    this.setState({ cartTotalQty });

    this.props.onUpdateCartOverlay();
  };

  getTotalPrice = () => {
    const { currentCurrencyIndex } = this.state;
    const cart = JSON.parse(sessionStorage.getItem(CART)) || [];

    if (cart.length === 0) return `___`;

    let total = 0;
    cart.forEach((item) => (total += item.quantity * item.prices[currentCurrencyIndex].amount));
    const { currency } = cart[0].prices[currentCurrencyIndex];

    return `${currency.symbol} ${total.toFixed(2)}`;
  };

  handleClickOutside = (event) => {
    if (this.wrapperRef.current === null) return;
    if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
      this.closeAllMenus();
    }
  };
}
