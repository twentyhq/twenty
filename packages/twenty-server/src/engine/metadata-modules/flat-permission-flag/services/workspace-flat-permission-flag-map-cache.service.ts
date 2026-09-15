import { Injectable } from '@nestjs/common';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPermissionFlagMaps } from 'src/engine/metadata-modules/flat-permission-flag/types/flat-permission-flag-maps.type';
import { fromPermissionFlagEntityToFlatPermissionFlag } from 'src/engine/metadata-modules/flat-permission-flag/utils/from-permission-flag-entity-to-flat-permission-flag.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_PERMISSION_FLAG_ROWS_REQUIREMENT = {
  permissionFlag: true,
  application: ['id', 'universalIdentifier'],
  rolePermissionFlag: {
    columns: true,
    groupBy: ['permissionFlagId'],
  },
} as const;

@Injectable()
@WorkspaceCache('flatPermissionFlagMaps', { packingPonderation: 1 })
export class WorkspaceFlatPermissionFlagMapCacheService extends MetadataFlatEntityMapsCacheProvider<'permissionFlag'> {
  override readonly rowsRequirement = FLAT_PERMISSION_FLAG_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_PERMISSION_FLAG_ROWS_REQUIREMENT
  >): FlatPermissionFlagMaps {
    const {
      permissionFlag: permissionFlags,
      application: applications,
      rolePermissionFlag: rolePermissionFlags,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const flatPermissionFlagMaps = createEmptyFlatEntityMaps();

    for (const definition of permissionFlags) {
      const flatDefinition = fromPermissionFlagEntityToFlatPermissionFlag({
        entity: {
          ...definition,
          rolePermissionFlags:
            rolePermissionFlags.byPermissionFlagId.get(definition.id) ?? [],
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
