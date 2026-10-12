import { type AgentRoleRestriction } from 'src/engine/core-modules/auth/types/agent-role-restriction.type';
import { type ViewAccessContext } from 'src/engine/metadata-modules/view-permissions/types/view-permissions.type';

// Every view guard authorises the same three principals, so they read them in
// one place: a guard that builds the context by hand is how an application
// token silently lost its authorisation before.
export const resolveViewAccessContext = ({
  workspace,
  userWorkspaceId,
  apiKey,
  application,
  agentRoleRestriction,
}: {
  workspace: { id: string };
  userWorkspaceId?: string;
  apiKey?: { id: string };
  application?: { id: string };
  agentRoleRestriction?: AgentRoleRestriction;
}): ViewAccessContext => ({
  workspaceId: workspace.id,
  userWorkspaceId,
  apiKeyId: apiKey?.id,
  applicationId: application?.id,
  agentRoleRestriction,
});
