import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatRoleTargetMaps } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target-maps.type';
import { fromRoleTargetEntityToFlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/utils/from-role-target-entity-to-flat-role-target.util';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRoleTargetMaps', { packingPonderation: 1 })
export class WorkspaceFlatRoleTargetMapCacheService extends WorkspaceCacheProvider<FlatRoleTargetMaps> {
  override readonly fetchRequirements = [
    entityFetchRequirement(RoleTargetEntity),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(RoleEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(AgentEntity, ['id', 'universalIdentifier']),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatRoleTargetMaps {
    const roleTargets = recomputeContext.getRows(RoleTargetEntity);
    const applications = recomputeContext.getRows(ApplicationEntity);
    const roles = recomputeContext.getRows(RoleEntity);
    const agents = recomputeContext.getRows(AgentEntity);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);
    const agentIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(agents);

    const flatRoleTargetMaps = createEmptyFlatEntityMaps();

    for (const roleTargetEntity of roleTargets) {
      const flatRoleTarget = fromRoleTargetEntityToFlatRoleTarget({
        entity: roleTargetEntity,
        applicationIdToUniversalIdentifierMap,
        roleIdToUniversalIdentifierMap,
        agentIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRoleTarget,
        flatEntityMapsToMutate: flatRoleTargetMaps,
      });
    }

    return flatRoleTargetMaps;
  }
}
