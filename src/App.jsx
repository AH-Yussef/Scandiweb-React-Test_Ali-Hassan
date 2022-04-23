import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import { CART } from './components/Const';
import { Navbar, ProductDetails, ProductsGrid, Cart } from './components';

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      alert(`GraphQl error ${message}`);
    });
  }
});

const link = from([errorLink, new HttpLink({ uri: 'http://localhost:4000/graphql' })]);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: link
});

export default class App extends Component {
  state = {
    activeCurrency: 0,
    activeCategory: 'all'
  };

  render() {
    const { activeCurrency } = this.state;

    return (
      <ApolloProvider client={client}>
        <Router>
          <Navbar
            cartTotalQty={this.getCartQty()}
            onChangeCurrency={this.hanldeChangeCurrency}
            onUpdateCartOverlay={this.handleUpdateCartOverlay}
            onToggleCurrencyMenu={this.toggleCurrecyMenu}
            onToggleCartOverlayMenu={this.toggleCartOverlay}
          />
          <Switch>
            <Route
              exact
              path="/category/:category"
              component={(props) => (
                <ProductsGrid
                  category={props.match.params.category}
                  currency={activeCurrency}
                  apolloClient={client}
                  onUpdateCart={this.handleUpdateCartBadge}
                  onSettingActiveCategory={this.handleSettingActiveCategory}
                />
              )}
            />
            <Route
              exact
              path="/products/:productId"
              component={(props) => (
                <ProductDetails
                  productId={props.match.params.productId}
                  currency={activeCurrency}
                  apolloClient={client}
                  onUpdateCart={this.handleUpdateCartBadge}
                />
              )}
            />
            <Route
              exact
              path="/cart"
              component={() => (
                <Cart
                  currency={activeCurrency}
                  cart={this.fetchCart()}
                  onUpdateCart={this.handleUpdateCartBadge}
                />
              )}
            />
            <Redirect exact from="/" to="category/all" />
          </Switch>
        </Router>
      </ApolloProvider>
    );
  }

  hanldeChangeCategory = (name) => this.setState({ activeCategory: name });

  hanldeChangeCurrency = (index) => this.setState({ activeCurrency: index });

  handleUpdateCartBadge = () => {
    this.setState({ cartTotalQty: null });
  };

  handleUpdateCartOverlay = () => {
    this.setState({ cart: null });
  };

  getCartQty = () => {
    const cart = JSON.parse(sessionStorage.getItem(CART)) || [];
    let cartTotalQty = 0;
    cart.forEach((item) => (cartTotalQty += item.quantity));
    return cartTotalQty;
  };

  fetchCart = () => JSON.parse(sessionStorage.getItem(CART)) || [];
}
