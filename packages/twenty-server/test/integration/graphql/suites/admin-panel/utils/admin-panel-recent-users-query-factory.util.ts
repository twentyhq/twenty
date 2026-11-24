import gql from 'graphql-tag';

export const adminPanelRecentUsersQueryFactory = () => ({
  query: gql`
    query AdminPanelRecentUsers {
      adminPanelRecentUsers {
        workspaceId
      }
    }
  `,
});
