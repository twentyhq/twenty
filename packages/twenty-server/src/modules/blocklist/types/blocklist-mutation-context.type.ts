import { type AgentRoleRestriction } from 'src/engine/core-modules/auth/types/agent-role-restriction.type';

export type BlocklistMutationContext = {
  workspaceId: string;
  userWorkspaceId: string;
  workspaceMemberId: string;
  applicationId: string | undefined;
  agentRoleRestriction: AgentRoleRestriction | undefined;
};
