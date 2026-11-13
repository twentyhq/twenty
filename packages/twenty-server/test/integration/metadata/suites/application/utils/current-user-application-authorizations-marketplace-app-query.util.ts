import gql from 'graphql-tag';

export const currentUserApplicationAuthorizationsMarketplaceAppQuery = gql`
  query CurrentUserApplicationAuthorizations {
    currentUserApplicationAuthorizations {
      applicationId
      marketplaceAppUniversalIdentifier
    }
  }
`;
