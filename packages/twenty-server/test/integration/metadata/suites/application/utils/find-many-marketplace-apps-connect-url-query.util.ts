import gql from 'graphql-tag';

export const findManyMarketplaceAppsConnectUrlQuery = gql`
  query FindManyMarketplaceApps {
    findManyMarketplaceApps {
      id
      connectUrl
    }
  }
`;
