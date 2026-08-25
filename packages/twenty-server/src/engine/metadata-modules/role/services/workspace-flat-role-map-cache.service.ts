import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { fromRoleEntityToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/from-role-entity-to-flat-role.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { type CacheEntityFetchShape } from 'src/engine/workspace-cache/types/cache-entity-fetch-shape.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRoleMaps', { packingPonderation: 1 })
export class WorkspaceFlatRoleMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatRole>
> {
  override readonly fetchRequirements = {
    role: true,
    application: ['id', 'universalIdentifier'],
    roleTarget: ['id', 'universalIdentifier', 'roleId'],
    objectPermission: ['id', 'universalIdentifier', 'roleId'],
    rolePermissionFlag: ['id', 'universalIdentifier', 'roleId'],
    fieldPermission: ['id', 'universalIdentifier', 'roleId'],
    rowLevelPermissionPredicate: ['id', 'universalIdentifier', 'roleId'],
    rowLevelPermissionPredicateGroup: ['id', 'universalIdentifier', 'roleId'],
  } as const satisfies CacheEntityFetchShape;

  computeForCache(
    workspaceId: string,
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

    const [
      roleTargetsByRoleId,
      objectPermissionsByRoleId,
      rolePermissionFlagsByRoleId,
      fieldPermissionsByRoleId,
      rowLevelPermissionPredicatesByRoleId,
      rowLevelPermissionPredicateGroupsByRoleId,
    ] = (
      [
        {
          entities: roleTargets,
          foreignKey: 'roleId',
        },
        {
          entities: objectPermissions,
          foreignKey: 'roleId',
        },
        {
          entities: rolePermissionFlags,
          foreignKey: 'roleId',
        },
        {
          entities: fieldPermissions,
          foreignKey: 'roleId',
        },
        {
          entities: rowLevelPermissionPredicates,
          foreignKey: 'roleId',
        },
        {
          entities: rowLevelPermissionPredicateGroups,
          foreignKey: 'roleId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const flatRoleMaps = createEmptyFlatEntityMaps();

    for (const roleEntity of roles) {
      const flatRole = fromRoleEntityToFlatRole({
        entity: {
          ...roleEntity,
          roleTargets: roleTargetsByRoleId.get(roleEntity.id) || [],
          objectPermissions: objectPermissionsByRoleId.get(roleEntity.id) || [],
          rolePermissionFlags:
            rolePermissionFlagsByRoleId.get(roleEntity.id) || [],
          fieldPermissions: fieldPermissionsByRoleId.get(roleEntity.id) || [],
          rowLevelPermissionPredicates:
            rowLevelPermissionPredicatesByRoleId.get(roleEntity.id) || [],
          rowLevelPermissionPredicateGroups:
            rowLevelPermissionPredicateGroupsByRoleId.get(roleEntity.id) || [],
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
