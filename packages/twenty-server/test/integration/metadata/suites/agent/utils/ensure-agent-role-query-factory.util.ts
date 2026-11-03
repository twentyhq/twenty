import gql from 'graphql-tag';

export const ensureAgentRoleQueryFactory = ({
  agentId,
}: {
  agentId: string;
}) => ({
  query: gql`
    mutation EnsureAgentRole($agentId: UUID!) {
      ensureAgentRole(agentId: $agentId) {
        id
        label
        canUpdateAllSettings
        canAccessAllTools
        canAccessAllAgentChatChannels
        canReadAllObjectRecords
        canUpdateAllObjectRecords
        canSoftDeleteAllObjectRecords
        canDestroyAllObjectRecords
        canBeAssignedToUsers
        canBeAssignedToAgents
        canBeAssignedToApiKeys
        agents {
          id
        }
      }
    }
  `,
  variables: { agentId },
});
