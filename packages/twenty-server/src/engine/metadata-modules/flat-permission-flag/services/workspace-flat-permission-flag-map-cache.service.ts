import { Injectable } from '@nestjs/common';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPermissionFlagMaps } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag-maps.type';
import { fromPermissionFlagEntityToFlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/utils/from-permission-flag-entity-to-flat-permission-flag.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { type CacheEntityFetchShape } from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatPermissionFlagMaps', { packingPonderation: 1 })
export class WorkspaceFlatPermissionFlagMapCacheService extends WorkspaceCacheProvider<FlatPermissionFlagMaps> {
  override readonly fetchRequirements = {
    permissionFlag: true,
    application: ['id', 'universalIdentifier'],
    rolePermissionFlag: true,
  } as const satisfies CacheEntityFetchShape;

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatPermissionFlagMaps {
    const {
      permissionFlag: permissionFlags,
      application: applications,
      rolePermissionFlag: rolePermissionFlags,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const rolePermissionFlagsByPermissionFlagId =
      regroupEntitiesByRelatedEntityId<'rolePermissionFlag'>({
        entities: rolePermissionFlags,
        foreignKey: 'permissionFlagId',
      });

    const flatPermissionFlagMaps = createEmptyFlatEntityMaps();

    for (const definition of permissionFlags) {
      const flatDefinition = fromPermissionFlagEntityToFlatPermissionFlag({
        entity: {
          ...definition,
          rolePermissionFlags:
            rolePermissionFlagsByPermissionFlagId.get(definition.id) ?? [],
        },
        applicationIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatDefinition,
        flatEntityMapsToMutate: flatPermissionFlagMaps,
      });
    }

    return flatPermissionFlagMaps;
  }
}
