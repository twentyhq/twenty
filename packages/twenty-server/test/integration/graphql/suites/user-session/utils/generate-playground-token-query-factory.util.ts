import gql from 'graphql-tag';

export const generatePlaygroundTokenQueryFactory = () => ({
  query: gql`
    mutation GeneratePlaygroundToken {
      generatePlaygroundToken {
        token
        expiresAt
      }
    }
  `,
  variables: {},
});
