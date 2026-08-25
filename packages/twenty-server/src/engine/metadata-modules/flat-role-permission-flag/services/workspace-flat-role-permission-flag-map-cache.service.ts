import { Injectable } from '@nestjs/common';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatRolePermissionFlagMaps } from 'src/engine/metadata-modules/flat-role-permission-flag/types/flat-role-permission-flag-maps.type';
import { fromRolePermissionFlagEntityToFlatRolePermissionFlag } from 'src/engine/metadata-modules/flat-role-permission-flag/utils/from-role-permission-flag-entity-to-flat-role-permission-flag.util';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRolePermissionFlagMaps', { packingPonderation: 1 })
export class WorkspaceFlatRolePermissionFlagMapCacheService extends WorkspaceCacheProvider<FlatRolePermissionFlagMaps> {
  override readonly fetchRequirements = [
    entityFetchRequirement(RolePermissionFlagEntity),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(RoleEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(PermissionFlagEntity, ['id', 'universalIdentifier']),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatRolePermissionFlagMaps {
    const rolePermissionFlags = recomputeContext.getRows(
      RolePermissionFlagEntity,
    );
    const applications = recomputeContext.getRows(ApplicationEntity);
    const roles = recomputeContext.getRows(RoleEntity);
    const permissionFlags = recomputeContext.getRows(PermissionFlagEntity);

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
