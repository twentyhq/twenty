import { Injectable } from '@nestjs/common';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { fromRolePermissionFlagEntityToFlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/utils/from-role-permission-flag-entity-to-flat-role-permission-flag.util';
import { FlatEntityMapCacheProvider } from 'src/engine/workspace-cache/interfaces/flat-entity-map-cache-provider.service';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRolePermissionFlagMaps', { packingPonderation: 1 })
export class WorkspaceFlatRolePermissionFlagMapCacheService extends FlatEntityMapCacheProvider<'rolePermissionFlag'> {
  override readonly fetchRequirements = {
    rolePermissionFlag: true,
    application: ['id', 'universalIdentifier'],
    role: ['id', 'universalIdentifier'],
    permissionFlag: ['id', 'universalIdentifier'],
  } as const;

  computeForCache(
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatRolePermissionFlagMaps {
    const {
      rolePermissionFlag: rolePermissionFlags,
      application: applications,
      role: roles,
      permissionFlag: permissionFlags,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);
    const permissionFlagIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(permissionFlags);

    const flatRolePermissionFlagMaps = createEmptyFlatEntityMaps();

    for (const rolePermissionFlagEntity of rolePermissionFlags) {
      const flatRolePermissionFlag =
        fromRolePermissionFlagEntityToFlatRolePermissionFlag({
          entity: rolePermissionFlagEntity,
          applicationIdToUniversalIdentifierMap,
          permissionFlagIdToUniversalIdentifierMap,
          roleIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRolePermissionFlag,
        flatEntityMapsToMutate: flatRolePermissionFlagMaps,
      });
    }

    return flatRolePermissionFlagMaps;
  }
}
