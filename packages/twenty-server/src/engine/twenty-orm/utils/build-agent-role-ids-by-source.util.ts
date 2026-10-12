import { isDefined } from 'twenty-shared/utils';

import { type AgentRoleRestriction } from 'src/engine/core-modules/auth/types/agent-role-restriction.type';
import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

export const buildAgentRoleIdsBySource = (
  agentRoleRestriction: AgentRoleRestriction | undefined,
): Pick<RoleIdsBySource, 'agentRoleId'> =>
  isDefined(agentRoleRestriction)
    ? { agentRoleId: agentRoleRestriction.roleId }
    : {};
