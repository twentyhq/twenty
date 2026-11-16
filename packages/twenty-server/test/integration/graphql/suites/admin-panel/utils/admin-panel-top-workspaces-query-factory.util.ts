import gql from 'graphql-tag';

export const adminPanelTopWorkspacesQueryFactory = () => ({
  query: gql`
    query AdminPanelTopWorkspaces {
      adminPanelTopWorkspaces {
        id
      }
    }
  `,
});
