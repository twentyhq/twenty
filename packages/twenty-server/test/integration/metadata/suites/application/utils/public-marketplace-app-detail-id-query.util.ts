import gql from 'graphql-tag';

export const publicMarketplaceAppDetailIdQuery = gql`
  query PublicMarketplaceAppDetail($universalIdentifier: String!) {
    publicMarketplaceAppDetail(universalIdentifier: $universalIdentifier) {
      universalIdentifier
    }
  }
`;
