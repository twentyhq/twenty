import gql from 'graphql-tag';

export const findMarketplaceAppDetailConnectUrlQuery = gql`
  query FindMarketplaceAppDetail($universalIdentifier: String!) {
    findMarketplaceAppDetail(universalIdentifier: $universalIdentifier) {
      universalIdentifier
      connectUrl
    }
  }
`;
