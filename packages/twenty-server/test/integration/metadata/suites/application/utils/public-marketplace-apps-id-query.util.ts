import gql from 'graphql-tag';

export const publicMarketplaceAppsIdQuery = gql`
  query PublicMarketplaceApps {
    publicMarketplaceApps {
      id
    }
  }
`;
