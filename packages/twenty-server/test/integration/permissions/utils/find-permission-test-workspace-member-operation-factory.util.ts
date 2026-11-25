import gql from 'graphql-tag';

export const findPermissionTestWorkspaceMemberOperationFactory = () => ({
  query: gql`
    query FindPermissionTestWorkspaceMember {
      currentUser {
        workspaceMember {
          id
        }
      }
    }
  `,
});
