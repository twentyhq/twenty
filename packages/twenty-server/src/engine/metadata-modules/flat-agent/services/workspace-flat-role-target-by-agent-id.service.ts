import { Injectable } from '@nestjs/common';

import { NonNullableRequired } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { fromRoleTargetEntityToFlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/utils/from-role-target-entity-to-flat-role-target.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import {
  type CacheEntityFetchShape,
  type CacheFetchableEntity,
} from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';

@Injectable()
@WorkspaceCache('flatRoleTargetByAgentIdMaps', { packingPonderation: 1 })
export class WorkspaceFlatRoleTargetByAgentIdService extends WorkspaceCacheProvider<FlatRoleTargetByAgentIdMaps> {
  override readonly fetchRequirements = {
    roleTarget: true,
    application: ['id', 'universalIdentifier'],
    role: ['id', 'universalIdentifier'],
    agent: ['id', 'universalIdentifier'],
  } as const satisfies CacheEntityFetchShape;

  computeForCache(
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatRoleTargetByAgentIdMaps {
    const {
      roleTarget: roleTargets,
      application: applications,
      role: roles,
      agent: agents,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    // the recompute context only filters on workspaceId: the previous
    // agentId IS NOT NULL condition moved in memory
    const roleTargetEntities = roleTargets.filter((roleTarget) =>
      isDefined(roleTarget.agentId),
    );

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);
    const agentIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(agents);

    const flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps = {};

    for (const roleTargetEntity of roleTargetEntities as Array<
      Omit<CacheFetchableEntity<'roleTarget'>, 'agentId'> &
        NonNullableRequired<Pick<CacheFetchableEntity<'roleTarget'>, 'agentId'>>
    >) {
      const flatRoleTarget = fromRoleTargetEntityToFlatRoleTarget({
        entity: roleTargetEntity,
        applicationIdToUniversalIdentifierMap,
        roleIdToUniversalIdentifierMap,
        agentIdToUniversalIdentifierMap,
      });

      flatRoleTargetByAgentIdMaps[roleTargetEntity.agentId] = flatRoleTarget;
    }

    return flatRoleTargetByAgentIdMaps;
  }
}
