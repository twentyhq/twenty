import gql from 'graphql-tag';

export const resendWorkspaceInvitationOperationFactory = ({
  appTokenId,
}: {
  appTokenId: string;
}) => ({
  query: gql`
    mutation ResendWorkspaceInvitation($appTokenId: String!) {
      resendWorkspaceInvitation(appTokenId: $appTokenId) {
        success
      }
    }
  `,
  variables: { appTokenId },
});
