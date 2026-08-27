import { Injectable } from '@nestjs/common';

import { IsNull, Not } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { fromRoleTargetEntityToFlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/utils/from-role-target-entity-to-flat-role-target.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';

const FLAT_ROLE_TARGET_BY_AGENT_ID_ROWS_REQUIREMENT = {
  roleTarget: {
    columns: true,
    groupBy: ['agentId'],
    where: { agentId: Not(IsNull()) },
  },
  application: ['id', 'universalIdentifier'],
  role: ['id', 'universalIdentifier'],
  agent: ['id', 'universalIdentifier'],
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('flatRoleTargetByAgentIdMaps', { packingPonderation: 1 })
export class WorkspaceFlatRoleTargetByAgentIdService extends WorkspaceCacheProvider<FlatRoleTargetByAgentIdMaps> {
  override readonly rowsRequirement =
    FLAT_ROLE_TARGET_BY_AGENT_ID_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_ROLE_TARGET_BY_AGENT_ID_ROWS_REQUIREMENT
  >): FlatRoleTargetByAgentIdMaps {
    const {
      roleTarget: roleTargets,
      application: applications,
      role: roles,
      agent: agents,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);
    const agentIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(agents);

    const flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps = {};

    for (const [agentId, agentRoleTargets] of roleTargets.byAgentId) {
      const roleTargetEntity = agentRoleTargets[agentRoleTargets.length - 1];

      flatRoleTargetByAgentIdMaps[agentId] =
        fromRoleTargetEntityToFlatRoleTarget({
          entity: roleTargetEntity,
          applicationIdToUniversalIdentifierMap,
          roleIdToUniversalIdentifierMap,
          agentIdToUniversalIdentifierMap,
        });
    }

    return flatRoleTargetByAgentIdMaps;
  }
}
