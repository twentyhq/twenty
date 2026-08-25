import { Injectable } from '@nestjs/common';

import { FlatEntityMapCacheProvider } from 'src/engine/workspace-cache/interfaces/flat-entity-map-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { fromRoleEntityToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/from-role-entity-to-flat-role.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRoleMaps', { packingPonderation: 1 })
export class WorkspaceFlatRoleMapCacheService extends FlatEntityMapCacheProvider<'role'> {
  override readonly fetchRequirements = {
    role: true,
    application: ['id', 'universalIdentifier'],
    roleTarget: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['roleId'],
    },
    objectPermission: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['roleId'],
    },
    rolePermissionFlag: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['roleId'],
    },
    fieldPermission: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['roleId'],
    },
    rowLevelPermissionPredicate: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['roleId'],
    },
    rowLevelPermissionPredicateGroup: {
      columns: ['id', 'universalIdentifier'],
      groupBy: ['roleId'],
    },
  } as const;

  computeForCache(
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatEntityMaps<FlatRole> {
    const {
      role: roles,
      application: applications,
      roleTarget: roleTargets,
      objectPermission: objectPermissions,
      rolePermissionFlag: rolePermissionFlags,
      fieldPermission: fieldPermissions,
      rowLevelPermissionPredicate: rowLevelPermissionPredicates,
      rowLevelPermissionPredicateGroup: rowLevelPermissionPredicateGroups,
    } = recomputeContext.getRowsByName(this.fetchRequirements);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const flatRoleMaps = createEmptyFlatEntityMaps();

    for (const roleEntity of roles) {
      const flatRole = fromRoleEntityToFlatRole({
        entity: {
          ...roleEntity,
          roleTargets: roleTargets.byRoleId.get(roleEntity.id) || [],
          objectPermissions:
            objectPermissions.byRoleId.get(roleEntity.id) || [],
          rolePermissionFlags:
            rolePermissionFlags.byRoleId.get(roleEntity.id) || [],
          fieldPermissions: fieldPermissions.byRoleId.get(roleEntity.id) || [],
          rowLevelPermissionPredicates:
            rowLevelPermissionPredicates.byRoleId.get(roleEntity.id) || [],
          rowLevelPermissionPredicateGroups:
            rowLevelPermissionPredicateGroups.byRoleId.get(roleEntity.id) || [],
        },
        applicationIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRole,
        flatEntityMapsToMutate: flatRoleMaps,
      });
    }

    return flatRoleMaps;
  }
}
