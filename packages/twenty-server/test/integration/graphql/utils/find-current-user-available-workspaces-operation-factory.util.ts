import gql from 'graphql-tag';

export const findCurrentUserAvailableWorkspacesOperationFactory = () => ({
  query: gql`
    query CurrentUserAvailableWorkspaces {
      currentUser {
        availableWorkspaces {
          availableWorkspacesForSignUp {
            id
            personalInviteToken
          }
        }
      }
    }
  `,
});
