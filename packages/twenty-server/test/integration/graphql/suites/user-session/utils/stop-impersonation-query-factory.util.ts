import gql from 'graphql-tag';

export const stopImpersonationQueryFactory = () => ({
  query: gql`
    mutation StopImpersonation {
      stopImpersonation {
        canRestoreImpersonatorSession
      }
    }
  `,
  variables: {},
});
