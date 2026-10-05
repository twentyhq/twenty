import gql from 'graphql-tag';

export const findCurrentWorkspaceInviteHashQueryFactory = () => ({
  query: gql`
    query CurrentWorkspaceInviteHash {
      currentWorkspace {
        id
        inviteHash
      }
    }
  `,
});
