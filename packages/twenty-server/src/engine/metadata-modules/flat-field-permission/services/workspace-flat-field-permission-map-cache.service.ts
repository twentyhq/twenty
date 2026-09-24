import { Injectable } from '@nestjs/common';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFieldPermissionMaps } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission-maps.type';
import { fromFieldPermissionEntityToFlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/utils/from-field-permission-entity-to-flat-field-permission.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_FIELD_PERMISSION_ROWS_REQUIREMENT = {
  fieldPermission: true,
  application: ['id', 'universalIdentifier'],
  role: ['id', 'universalIdentifier'],
  objectMetadata: ['id', 'universalIdentifier'],
  fieldMetadata: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatFieldPermissionMaps', { packingPonderation: 1 })
export class WorkspaceFlatFieldPermissionMapCacheService extends MetadataFlatEntityMapsCacheProvider<'fieldPermission'> {
  override readonly rowsRequirement = FLAT_FIELD_PERMISSION_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_FIELD_PERMISSION_ROWS_REQUIREMENT
  >): FlatFieldPermissionMaps {
    const {
      fieldPermission: fieldPermissions,
      application: applications,
      role: roles,
      objectMetadata: objectMetadatas,
      fieldMetadata: fieldMetadatas,
    } = rows;

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
