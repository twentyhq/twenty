import gql from 'graphql-tag';

export const generateTransientTokenQueryFactory = () => ({
  query: gql`
    mutation GenerateTransientToken {
      generateTransientToken {
        transientToken {
          token
        }
      }
    }
  `,
  variables: {},
});
