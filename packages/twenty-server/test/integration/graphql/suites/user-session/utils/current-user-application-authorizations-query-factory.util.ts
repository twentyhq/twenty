import gql from 'graphql-tag';

export const currentUserApplicationAuthorizationsQueryFactory = () => ({
  query: gql`
    query CurrentUserApplicationAuthorizations {
      currentUserApplicationAuthorizations {
        id
        applicationId
        lastUsedAt
      }
    }
  `,
  variables: {},
});
