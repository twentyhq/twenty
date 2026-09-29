import gql from 'graphql-tag';

export const getAiProvidersQueryFactory = () => ({
  query: gql`
    query GetAiProviders {
      getAiProviders
    }
  `,
  variables: {},
});
