import gql from 'graphql-tag';

export const signUpInWorkspaceOperationFactory = ({
  email,
  password = 'Test123!@#',
  workspaceId,
  workspaceInviteHash,
  workspacePersonalInviteToken,
}: {
  email: string;
  password?: string;
  workspaceId?: string;
  workspaceInviteHash?: string;
  workspacePersonalInviteToken?: string;
}) => ({
  query: gql`
    mutation SignUpInWorkspace(
      $email: String!
      $password: String!
      $workspaceId: UUID
      $workspaceInviteHash: String
      $workspacePersonalInviteToken: String
    ) {
      signUpInWorkspace(
        email: $email
        password: $password
        workspaceId: $workspaceId
        workspaceInviteHash: $workspaceInviteHash
        workspacePersonalInviteToken: $workspacePersonalInviteToken
      ) {
        workspace {
          id
        }
      }
    }
  `,
  variables: {
    email,
    password,
    workspaceId,
    workspaceInviteHash,
    workspacePersonalInviteToken,
  },
});
