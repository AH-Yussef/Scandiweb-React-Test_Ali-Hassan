import React, { Component } from 'react'

import './style.css'
import { CartItem } from '../../components'

export default class Cart extends Component {
  render() {
    const { cart, currency } = this.props;

    return (
      <div>
        <div className='header text-black fs-32 fw-bold upper-case'>Cart</div>
        <div className='container'>
          { cart.map(cartItem => (
            <CartItem key={cartItem.id} currency={currency} cartItem={cartItem} onUpdateCart={this.handleUpdateCart}/>
          ))}
        </div>
      </div>
    )
  }

  handleUpdateCart = () => this.props.onUpdateCart();
}
