import { type AgentRoleRestriction } from 'src/engine/core-modules/auth/types/agent-role-restriction.type';

export type ViewChildEntityKind =
  | 'viewField'
  | 'viewFieldGroup'
  | 'viewFilter'
  | 'viewFilterGroup'
  | 'viewGroup'
  | 'viewSort';

export type ViewAccessContext = {
  workspaceId: string;
  userWorkspaceId?: string;
  apiKeyId?: string;
  applicationId?: string;
  agentRoleRestriction?: AgentRoleRestriction;
};
