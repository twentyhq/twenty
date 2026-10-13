import { isDefined } from 'twenty-shared/utils';

import { type FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';

// undefined when no agent takes part; null when the agent has no role or was deleted, which denies
export const resolveAgentRoleId = ({
  agentId,
  flatRoleTargetByAgentIdMaps,
}: {
  agentId: string | undefined;
  flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps;
}): string | null | undefined =>
  isDefined(agentId)
    ? (flatRoleTargetByAgentIdMaps[agentId]?.roleId ?? null)
    : undefined;
