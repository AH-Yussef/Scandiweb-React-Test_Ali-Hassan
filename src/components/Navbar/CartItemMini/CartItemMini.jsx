import React, { Component } from 'react'

import './style.css';
import { rightArrow, plus, minus, remove } from '../../../assets';
import { CART } from '../../Const'

const INCREASE = 1;
const DECREASE = -1;

export default class CartItemMini extends Component {
  state = {
    cartItem: this.props.cartItem,
  };

  render() {
    const { cartItem } = this.state;
    
    if (cartItem == null) return <></>

    return (
      <div className='cart-item-mini flex'>
        <div className='main-props'>
          <div className='fs-16 fw-regular'>{ cartItem.brand }</div>
          <div className='fs-16 fw-light'>{ cartItem.name }</div>
          <div className='cart-item-mini-price fs-16 fw-medium'>{ this.formatCurrrency(cartItem.prices) }</div>

          <div className='cart-item-mini-attributes-area'>
            {
              cartItem.attributes.map(attribute => (
                <div key={attribute.name} className='cart-item-mini-attributes-line flex'>
                  <div className='flex'>
                    { attribute.items.map((item, index) => this.formatAttrItem(item, index, attribute)) }
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        <div className='cart-item-mini-right-side flex'>
          <div className='mini-qty-control flex select-none'>
            <div className='mini-qty-control-btn fs-32 fw-regular vh-center' onClick={() => this.changeQty(INCREASE)}>
              <img src={plus} alt="increase quantity" />
            </div>
            <div className='fs-16 fw-medium'>{cartItem.quantity}</div>
            {
              cartItem.quantity > 1 && 
              <div className='mini-qty-control-btn vh-center' onClick={() => this.changeQty(DECREASE)}>
                <img src={minus} alt="decrease quantity" />
              </div>
            }
            {
              cartItem.quantity === 1 && 
              <div className='mini-qty-control-btn vh-center mini-remove-item-btn' onClick={this.removeItem}>
                <img src={remove} alt="decrease quantity" className='mini-remove-item-icon'/>
              </div>
            }
          </div>
          
          <div className='cart-item-mini-img-container'>
            <img src={cartItem.gallery[0]} alt='cart item' className='contained-img'/>
          </div>
        </div>
      </div>
    )
  }

  formatCurrrency = prices => {
    const activeCurrency = this.props.currency;
    const { currency, amount } = prices[activeCurrency];
    return `${currency.symbol} ${amount}`
  };

  formatAttrItem = (item, index, attribute) => {
    let classes = 'cart-item-mini-attribute-box fs-14 fw-regular vh-center ';
    
    if (attribute.type.toLowerCase() === "swatch") {
      if (attribute.selected === index) classes += 'cart-item-mini-attr-swatch-active text-white';
      return (
        <div 
          key={item.value} 
          className={classes} 
          style={{backgroundColor:item.value}}
        />
      )
    }
    else {
      if (attribute.selected === index) classes += 'bg-black text-white';
      return (
        <div key={item.value} className={classes}>
          <span>{ item.value }</span>
        </div>
      )
    }
  }

  changeQty = (change) => {
    const { cartItem } = this.state;
    const cart = JSON.parse(sessionStorage.getItem(CART));
    for (const item of cart) {
      if (item.id === cartItem.id) {
        item.quantity += change;
        this.setState({ cartItem: item });
        break;
      }
    }
    sessionStorage.setItem(CART, JSON.stringify(cart));

    this.props.onUpdateCartOverlay();
  }

  removeItem = () => {
    const { cartItem } = this.state;
    let cart = JSON.parse(sessionStorage.getItem(CART));
    cart = cart.filter(item => item.id !== cartItem.id);
    this.setState({ cartItem: null })
    sessionStorage.setItem(CART, JSON.stringify(cart));

    this.props.onUpdateCartOverlay();
  };
}
