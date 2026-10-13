import { isUndefined } from '@sniptt/guards';

import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

export const buildAgentRoleIdsBySource = (
  agentRoleId: string | null | undefined,
): Pick<RoleIdsBySource, 'agentRoleId'> =>
  isUndefined(agentRoleId) ? {} : { agentRoleId };
