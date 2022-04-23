import { gql } from '@apollo/client';

export const FETCH_CATEGORIES = gql`
  query {
    categories {
      name
    }
  }
`;

export const FETCH_CURRENCIES = gql`
  query {
    currencies {
      label
      symbol
    }
  }
`;

export const FETCH_PRODUCTS = gql`
  query ($title: String!) {
    category(input: { title: $title }) {
      name
      products {
        id
        name
        inStock
        gallery
        prices {
          currency {
            label
            symbol
          }
          amount
        }
        attributes {
          name
        }
      }
    }
  }
`;

export const FETCH_SINGLE_PRODUCT = gql`
  query ($id: String!) {
    product(id: $id) {
      brand
      name
      gallery
      description
      inStock
      prices {
        currency {
          label
          symbol
        }
        amount
      }
      attributes {
        name
        type
        items {
          value
          displayValue
        }
      }
    }
  }
`;
