import gql from 'graphql-tag';

export const getInviteSuggestionsQueryFactory = () => ({
  query: gql`
    query GetInviteSuggestions {
      getInviteSuggestions {
        email
      }
    }
  `,
  variables: {},
});
