import { Injectable } from '@nestjs/common';

import { IsNull } from 'typeorm';

import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import {
  FieldMetadataType,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { buildResolveMorphRelationPermissionFieldIds } from 'src/engine/metadata-modules/role/utils/build-resolve-morph-relation-permission-field-ids.util';
import { computeObjectsPermissionsForRoleDefinition } from 'src/engine/permissions/role/utils/compute-objects-permissions-for-role-definition.util';
import { hasRoleWideAccessToPermissionFlag } from 'src/engine/permissions/role/utils/has-role-wide-access-to-permission-flag.util';
import { type RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
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
export class WorkspaceRolesPermissionsCacheService extends WorkspaceCacheProvider<ObjectsPermissionsByRoleId> {
  override readonly rowsRequirement = ROLES_PERMISSIONS_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof ROLES_PERMISSIONS_ROWS_REQUIREMENT
  >): ObjectsPermissionsByRoleId {
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

    const permissionsByRoleId: ObjectsPermissionsByRoleId = {};

    for (const role of roles) {
      const assignedPermissionFlagUniversalIdentifiers = new Set(
        (rolePermissionFlags.byRoleId.get(role.id) ?? []).map(
          (rolePermissionFlagRow) =>
            this.getRolePermissionFlagUniversalIdentifier({
              ...rolePermissionFlagRow,
              permissionFlag: permissionFlagById.get(
                rolePermissionFlagRow.permissionFlagId,
              ),
            } as RolePermissionFlagEntity),
        ),
      );
      const isRolePermissionFlagGranted = (
        permissionFlag: PermissionFlagType,
      ): boolean =>
        hasRoleWideAccessToPermissionFlag({ role, permissionFlag }) ||
        assignedPermissionFlagUniversalIdentifiers.has(
          SystemPermissionFlag[permissionFlag],
        );
      permissionsByRoleId[role.id] = computeObjectsPermissionsForRoleDefinition(
        {
          roleDefinition: {
            canReadAllObjectRecords: role.canReadAllObjectRecords,
            canUpdateAllObjectRecords: role.canUpdateAllObjectRecords,
            canSoftDeleteAllObjectRecords: role.canSoftDeleteAllObjectRecords,
            canDestroyAllObjectRecords: role.canDestroyAllObjectRecords,
            isPermissionFlagGranted: isRolePermissionFlagGranted,
            objectPermissions: objectPermissions.byRoleId.get(role.id) ?? [],
            fieldPermissions: fieldPermissions.byRoleId.get(role.id) ?? [],
            rowLevelPermissionPredicates:
              rowLevelPermissionPredicates.byRoleId.get(role.id) ?? [],
            rowLevelPermissionPredicateGroups:
              rowLevelPermissionPredicateGroups.byRoleId.get(role.id) ?? [],
          },
          objectMetadataCollection: workspaceObjectMetadataCollection,
          resolveMorphRelationPermissionFieldIds,
        },
      );
    }

    return permissionsByRoleId;
  }

  private getRolePermissionFlagUniversalIdentifier(
    rolePermissionFlag: RolePermissionFlagEntity,
  ): string {
    // The permissionFlag relation is stripped until the 2.6.0 upgrade cursor, so fall back to the legacy flag column
    return (
      rolePermissionFlag.permissionFlag?.universalIdentifier ??
      SystemPermissionFlag[rolePermissionFlag.flag as PermissionFlagType]
    );
  }
}
