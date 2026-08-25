import { Injectable } from '@nestjs/common';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatObjectPermissionMaps } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission-maps.type';
import { fromObjectPermissionEntityToFlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/utils/from-object-permission-entity-to-flat-object-permission.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { FlatEntityMapCacheProvider } from 'src/engine/workspace-cache/interfaces/flat-entity-map-cache-provider.service';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatObjectPermissionMaps', { packingPonderation: 1 })
export class WorkspaceFlatObjectPermissionMapCacheService extends FlatEntityMapCacheProvider<'objectPermission'> {
  override readonly fetchRequirements = {
    objectPermission: true,
    application: ['id', 'universalIdentifier'],
    role: ['id', 'universalIdentifier'],
    objectMetadata: ['id', 'universalIdentifier'],
  } as const;

  computeForCache(
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatObjectPermissionMaps {
    const {
      objectPermission: objectPermissions,
      application: applications,
      role: roles,
      objectMetadata: objectMetadatas,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);

    const flatObjectPermissionMaps = createEmptyFlatEntityMaps();

    for (const objectPermissionEntity of objectPermissions) {
      const flatObjectPermission =
        fromObjectPermissionEntityToFlatObjectPermission({
          entity: objectPermissionEntity,
          applicationIdToUniversalIdentifierMap,
          roleIdToUniversalIdentifierMap,
          objectMetadataIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatObjectPermission,
        flatEntityMapsToMutate: flatObjectPermissionMaps,
      });
    }

    return flatObjectPermissionMaps;
  }
}
