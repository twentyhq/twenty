import gql from 'graphql-tag';

export const enterpriseSubscriptionStatusQueryFactory = () => ({
  query: gql`
    query EnterpriseSubscriptionStatus {
      enterpriseSubscriptionStatus {
        status
      }
    }
  `,
  variables: {},
});
