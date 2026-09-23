import gql from 'graphql-tag';

export const getToolIndexQueryFactory = () => ({
  query: gql`
    query GetToolIndex {
      getToolIndex {
        name
        category
      }
    }
  `,
  variables: {},
});
