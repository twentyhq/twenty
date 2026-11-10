import { Injectable } from '@nestjs/common';

import { IsNull } from 'typeorm';

import {
  type PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { buildResolveMorphRelationPermissionFieldIds } from 'src/engine/metadata-modules/role/utils/build-resolve-morph-relation-permission-field-ids.util';
import { computeRoleRecordsPermissions } from 'src/engine/permissions/role/utils/compute-role-records-permissions.util';
import { buildIsPermissionFlagGranted } from 'src/engine/permissions/role/utils/build-is-permission-flag-granted.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { type PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const ROLES_PERMISSIONS_ROWS_REQUIREMENT = {
  role: true,
  objectPermission: { columns: true, groupBy: ['roleId'] },
  rolePermissionFlag: { columns: true, groupBy: ['roleId'] },
  permissionFlag: true,
  fieldPermission: { columns: true, groupBy: ['roleId'] },
  rowLevelPermissionPredicate: {
    columns: true,
    groupBy: ['roleId'],
    where: { deletedAt: IsNull() },
  },
  rowLevelPermissionPredicateGroup: {
    columns: true,
    groupBy: ['roleId'],
    where: { deletedAt: IsNull() },
  },
  objectMetadata: [
    'id',
    'isSystem',
    'universalIdentifier',
    'labelIdentifierFieldMetadataId',
  ],
  fieldMetadata: {
    columns: ['id', 'type', 'universalIdentifier', 'morphId'],
    where: { type: FieldMetadataType.MORPH_RELATION },
  },
} as const satisfies WorkspaceCacheRowsRequirement;

@Injectable()
@WorkspaceCache('rolesPermissions', { packingPonderation: 2 })
export class WorkspaceRolesPermissionsCacheService extends WorkspaceCacheProvider<
  Record<string, RoleRecordsPermissions>
> {
  override readonly rowsRequirement = ROLES_PERMISSIONS_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof ROLES_PERMISSIONS_ROWS_REQUIREMENT
  >): Record<string, RoleRecordsPermissions> {
    const {
      role: roles,
      objectPermission: objectPermissions,
      rolePermissionFlag: rolePermissionFlags,
      permissionFlag: permissionFlags,
      fieldPermission: fieldPermissions,
      rowLevelPermissionPredicate: rowLevelPermissionPredicates,
      rowLevelPermissionPredicateGroup: rowLevelPermissionPredicateGroups,
      objectMetadata: workspaceObjectMetadataCollection,
      fieldMetadata: morphRelationFieldMetadatas,
    } = rows;

    const resolveMorphRelationPermissionFieldIds =
      buildResolveMorphRelationPermissionFieldIds(morphRelationFieldMetadatas);

    const permissionFlagById = new Map(
      permissionFlags.map((permissionFlag) => [
        permissionFlag.id,
        permissionFlag,
      ]),
    );

    const permissionsByRoleId: Record<string, RoleRecordsPermissions> = {};

    for (const role of roles) {
      const isPermissionFlagGranted = buildIsPermissionFlagGranted({
        role,
        permissionFlagUniversalIdentifiers: (
          rolePermissionFlags.byRoleId.get(role.id) ?? []
        ).map((rolePermissionFlagRow) =>
          this.getRolePermissionFlagUniversalIdentifier({
            flag: rolePermissionFlagRow.flag,
            permissionFlag: permissionFlagById.get(
              rolePermissionFlagRow.permissionFlagId,
            ),
          }),
        ),
      });

      permissionsByRoleId[role.id] = computeRoleRecordsPermissions({
        roleDefinition: {
          canCreateAllObjectRecords: role.canCreateAllObjectRecords,
          canReadAllObjectRecords: role.canReadAllObjectRecords,
          canUpdateAllObjectRecords: role.canUpdateAllObjectRecords,
          canSoftDeleteAllObjectRecords: role.canSoftDeleteAllObjectRecords,
          canDestroyAllObjectRecords: role.canDestroyAllObjectRecords,
          isPermissionFlagGranted,
          objectPermissions: objectPermissions.byRoleId.get(role.id) ?? [],
          fieldPermissions: fieldPermissions.byRoleId.get(role.id) ?? [],
          rowLevelPermissionPredicates:
            rowLevelPermissionPredicates.byRoleId.get(role.id) ?? [],
          rowLevelPermissionPredicateGroups:
            rowLevelPermissionPredicateGroups.byRoleId.get(role.id) ?? [],
        },
        objectMetadataCollection: workspaceObjectMetadataCollection,
        resolveMorphRelationPermissionFieldIds,
      });
    }

    return permissionsByRoleId;
  }

  private getRolePermissionFlagUniversalIdentifier({
    flag,
    permissionFlag,
  }: {
    flag: PermissionFlagType;
    permissionFlag:
      | Pick<PermissionFlagEntity, 'universalIdentifier'>
      | undefined;
  }): string {
    // The permissionFlag relation is stripped until the 2.6.0 upgrade cursor, so fall back to the legacy flag column
    return permissionFlag?.universalIdentifier ?? SystemPermissionFlag[flag];
  }
}
