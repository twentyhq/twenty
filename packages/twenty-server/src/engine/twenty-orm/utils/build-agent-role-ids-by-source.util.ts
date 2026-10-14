import { isDefined } from 'twenty-shared/utils';

import { type FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

// An agent without a role, or a deleted one, resolves to null, which denies
export const buildAgentRoleIdsBySource = ({
  agentId,
  flatRoleTargetByAgentIdMaps,
}: {
  agentId: string | undefined;
  flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps;
}): Pick<RoleIdsBySource, 'agentRoleId'> =>
  isDefined(agentId)
    ? { agentRoleId: flatRoleTargetByAgentIdMaps[agentId]?.roleId ?? null }
    : {};
