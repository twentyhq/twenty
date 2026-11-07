import gql from 'graphql-tag';

export const signInOperationFactory = ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => ({
  query: gql`
    mutation SignIn($email: String!, $password: String!) {
      signIn(email: $email, password: $password) {
        availableWorkspaces {
          availableWorkspacesForSignUp {
            id
            personalInviteToken
          }
        }
      }
    }
  `,
  variables: { email, password },
});
