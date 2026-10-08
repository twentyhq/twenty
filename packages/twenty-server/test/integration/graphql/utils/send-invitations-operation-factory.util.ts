import gql from 'graphql-tag';

export const sendInvitationsOperationFactory = ({
  emails,
  roleId,
}: {
  emails: string[];
  roleId?: string;
}) => ({
  query: gql`
    mutation SendInvitations($emails: [String!]!, $roleId: UUID) {
      sendInvitations(emails: $emails, roleId: $roleId) {
        success
      }
    }
  `,
  variables: { emails, roleId },
});
