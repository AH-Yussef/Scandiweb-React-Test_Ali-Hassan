import React, { Component } from 'react'

import './style.css';
import { rightArrow, plus, minus, remove } from '../../../assets';
import { CART } from '../../Const'

const INCREASE = 1;
const DECREASE = -1;

export default class CartItem extends Component {
  state = {
    cartItem: this.props.cartItem,
    currImgIdx: 0,
  };

  render() {
    const { cartItem, currImgIdx } = this.state;
    
    if (cartItem == null) return <></>

    return (
      <div className='cart-item flex'>
        <div>
          <div className='fs-30 fw-semi-bold'>{ cartItem.brand }</div>
          <div className='fs-30 fw-regular'>{ cartItem.name }</div>
          <div className='cart-item-price fs-24 fw-bold'>{ this.formatCurrrency(cartItem.prices) }</div>

          <div className='cart-item-attributes-area'>
            {
              cartItem.attributes.map(attribute => (
                <div key={attribute.name}>
                  <div className='flex'>
                    { attribute.items.map((item, index) => this.formatAttrItem(item, index, attribute)) }
                  </div>
                </div>
              ))
            }
          </div>
        </div>
        <div className='cart-item-right-side flex'>
          <div className='qty-control flex select-none'>
            <div className='qty-control-btn fs-32 fw-regular vh-center' onClick={() => this.changeQty(INCREASE)}>
              <img src={plus} alt="increase quantity" />
            </div>
            <div className='fs-24 fw-medium'>{cartItem.quantity}</div>
            {
              cartItem.quantity > 1 && 
              <div className='qty-control-btn fs-32 fw-regular vh-center' onClick={() => this.changeQty(DECREASE)}>
                <img src={minus} alt="decrease quantity" />
              </div>
            }
            {
              cartItem.quantity === 1 && 
              <div className='qty-control-btn fs-32 fw-regular vh-center remove-item-btn' onClick={this.removeItem}>
                <img src={remove} alt="decrease quantity" className='remove-item-icon'/>
              </div>
            }
          </div>
          <div className='cart-item-gallery flex'>
            <div className='cart-item-img-container'>
              <img src={cartItem.gallery[currImgIdx]} alt='cart item' className='contained-img'/>
            </div>

            <div className='switch-img-btn vh-center switch-img-forward select-none' onClick={this.goToNextImg}>
              <img src={rightArrow} alt="switch to next image" width={6} height={12}/>
            </div>
            <div className='switch-img-btn vh-center switch-img-back select-none' onClick={this.goToPrevImg}>
              <img src={rightArrow} alt="switch to next image" width={6} height={12}/>
            </div>
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
    let classes = 'cart-item-attribute-box fs-16 fw-regular vh-center ';
    
    if (attribute.type.toLowerCase() === "swatch") {
      if (attribute.selected === index) classes += 'cart-item-attr-swatch-active text-white';
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

  goToNextImg = () => {
    const { currImgIdx } = this.state;
    if(currImgIdx === this.props.cartItem.gallery.length -1) return;
    const newImgIdx = currImgIdx +1;
    this.setState({ currImgIdx: newImgIdx });
  }

  goToPrevImg = () => {
    const { currImgIdx } = this.state;
    if(currImgIdx === 0) return;
    const newImgIdx = currImgIdx -1;
    this.setState({ currImgIdx: newImgIdx });
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

    this.props.onUpdateCart();
  }

  removeItem = () => {
    const { cartItem } = this.state;
    let cart = JSON.parse(sessionStorage.getItem(CART));
    cart = cart.filter(item => item.id !== cartItem.id);
    this.setState({ cartItem: null })
    sessionStorage.setItem(CART, JSON.stringify(cart));

    this.props.onUpdateCart();
  }
}
