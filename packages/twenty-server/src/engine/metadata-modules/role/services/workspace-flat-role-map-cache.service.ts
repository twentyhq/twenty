import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { fromRoleEntityToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/from-role-entity-to-flat-role.util';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRoleMaps', { packingPonderation: 1 })
export class WorkspaceFlatRoleMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatRole>
> {
  override readonly fetchRequirements = [
    entityFetchRequirement(RoleEntity),
    entityFetchRequirement(ApplicationEntity, ['id', 'universalIdentifier']),
    entityFetchRequirement(RoleTargetEntity, [
      'id',
      'universalIdentifier',
      'roleId',
    ]),
    entityFetchRequirement(ObjectPermissionEntity, [
      'id',
      'universalIdentifier',
      'roleId',
    ]),
    entityFetchRequirement(RolePermissionFlagEntity, [
      'id',
      'universalIdentifier',
      'roleId',
    ]),
    entityFetchRequirement(FieldPermissionEntity, [
      'id',
      'universalIdentifier',
      'roleId',
    ]),
    entityFetchRequirement(RowLevelPermissionPredicateEntity, [
      'id',
      'universalIdentifier',
      'roleId',
    ]),
    entityFetchRequirement(RowLevelPermissionPredicateGroupEntity, [
      'id',
      'universalIdentifier',
      'roleId',
    ]),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): FlatEntityMaps<FlatRole> {
    const roles = recomputeContext.getRows(RoleEntity);
    const applications = recomputeContext.getRows(ApplicationEntity);
    const roleTargets = recomputeContext.getRows(RoleTargetEntity);
    const objectPermissions = recomputeContext.getRows(ObjectPermissionEntity);
    const rolePermissionFlags = recomputeContext.getRows(
      RolePermissionFlagEntity,
    );
    const fieldPermissions = recomputeContext.getRows(FieldPermissionEntity);
    const rowLevelPermissionPredicates = recomputeContext.getRows(
      RowLevelPermissionPredicateEntity,
    );
    const rowLevelPermissionPredicateGroups = recomputeContext.getRows(
      RowLevelPermissionPredicateGroupEntity,
    );

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
