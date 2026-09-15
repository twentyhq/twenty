import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatRoleTargetMaps } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target-maps.type';
import { fromRoleTargetEntityToFlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/utils/from-role-target-entity-to-flat-role-target.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_ROLE_TARGET_ROWS_REQUIREMENT = {
  roleTarget: true,
  application: ['id', 'universalIdentifier'],
  role: ['id', 'universalIdentifier'],
  agent: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatRoleTargetMaps', { packingPonderation: 1 })
export class WorkspaceFlatRoleTargetMapCacheService extends MetadataFlatEntityMapsCacheProvider<'roleTarget'> {
  override readonly rowsRequirement = FLAT_ROLE_TARGET_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_ROLE_TARGET_ROWS_REQUIREMENT
  >): FlatRoleTargetMaps {
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
