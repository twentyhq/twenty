import gql from 'graphql-tag';

export const findWorkspaceFromInviteHashQueryFactory = ({
  inviteHash,
  gqlFields = 'id displayName logo allowImpersonation',
}: {
  inviteHash: string;
  gqlFields?: string;
}) => ({
  query: gql`
    query FindWorkspaceFromInviteHash($inviteHash: String!) {
      findWorkspaceFromInviteHash(inviteHash: $inviteHash) {
        ${gqlFields}
      }
    }
  `,
  variables: { inviteHash },
});
