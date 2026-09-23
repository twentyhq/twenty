import gql from 'graphql-tag';

export const enrichWorkspaceCompanyQueryFactory = () => ({
  query: gql`
    mutation EnrichWorkspaceCompany {
      enrichWorkspaceCompany {
        outcome
      }
    }
  `,
  variables: {},
});
