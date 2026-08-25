import { Injectable } from '@nestjs/common';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFieldPermissionMaps } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission-maps.type';
import { fromFieldPermissionEntityToFlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/utils/from-field-permission-entity-to-flat-field-permission.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatFieldPermissionMaps', { packingPonderation: 1 })
export class WorkspaceFlatFieldPermissionMapCacheService extends WorkspaceCacheProvider<FlatFieldPermissionMaps> {
  override readonly fetchRequirements = [
    entityFetchRequirement(FieldPermissionEntity),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(RoleEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(ObjectMetadataEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(FieldMetadataEntity, ['id', 'universalIdentifier']),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatFieldPermissionMaps {
    const fieldPermissions = recomputeContext.getRows(FieldPermissionEntity);
    const applications = recomputeContext.getRows(ApplicationEntity);
    const roles = recomputeContext.getRows(RoleEntity);
    const objectMetadatas = recomputeContext.getRows(ObjectMetadataEntity);
    const fieldMetadatas = recomputeContext.getRows(FieldMetadataEntity);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);

    const flatFieldPermissionMaps = createEmptyFlatEntityMaps();

    for (const fieldPermissionEntity of fieldPermissions) {
      const flatFieldPermission =
        fromFieldPermissionEntityToFlatFieldPermission({
          entity: fieldPermissionEntity,
          applicationIdToUniversalIdentifierMap,
          roleIdToUniversalIdentifierMap,
          objectMetadataIdToUniversalIdentifierMap,
          fieldMetadataIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatFieldPermission,
        flatEntityMapsToMutate: flatFieldPermissionMaps,
      });
    }

    return flatFieldPermissionMaps;
  }
}
