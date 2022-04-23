import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Query } from '@apollo/client/react/components';

import './style.css';
import { FETCH_PRODUCTS } from '../../GraphQl/queries';
import { ProductCard } from '../../components';

export default class ProductsGrid extends Component {
  render() {
    const { category } = this.props;

    return (
      <div>
        <div className="header text-black fs-42 fw-regular upper-case">{category}</div>
        <div className="products-grid container">{this.fetchProducts(category)}</div>
        <div className="footer" />
      </div>
    );
  }

  fetchProducts = (category) => (
    <Query query={FETCH_PRODUCTS} variables={{ title: category }}>
      {({ loading, error, data }) => {
        if (loading) return <></>;
        if (error) console.log(error);
        else {
          const { currency, apolloClient } = this.props;
          return data.category.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currency={currency}
              apolloClient={apolloClient}
              onUpdateCart={this.props.onUpdateCart}
            />
          ));
        }
      }}
    </Query>
  );
}

ProductsGrid.propTypes = {
  category: PropTypes.any,
  currency: PropTypes.any,
  apolloClient: PropTypes.any,
  onUpdateCart: PropTypes.any
};
