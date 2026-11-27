import gql from 'graphql-tag';

export const findManyMarketplaceAppsQueryFactory = () => ({
  query: gql`
    query FindManyMarketplaceApps {
      findManyMarketplaceApps {
        id
        hasMcpServers
      }
    }
  `,
});
