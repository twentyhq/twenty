import { Injectable } from '@nestjs/common';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatObjectPermissionMaps } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission-maps.type';
import { fromObjectPermissionEntityToFlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/utils/from-object-permission-entity-to-flat-object-permission.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatObjectPermissionMaps', { packingPonderation: 1 })
export class WorkspaceFlatObjectPermissionMapCacheService extends WorkspaceCacheProvider<FlatObjectPermissionMaps> {
  override readonly fetchRequirements = [
    entityFetchRequirement(ObjectPermissionEntity),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(RoleEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(ObjectMetadataEntity, ['id', 'universalIdentifier']),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatObjectPermissionMaps {
    const objectPermissions = recomputeContext.getRows(ObjectPermissionEntity);
    const applications = recomputeContext.getRows(ApplicationEntity);
    const roles = recomputeContext.getRows(RoleEntity);
    const objectMetadatas = recomputeContext.getRows(ObjectMetadataEntity);

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
