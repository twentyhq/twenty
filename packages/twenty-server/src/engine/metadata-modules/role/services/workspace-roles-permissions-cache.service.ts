import { Injectable } from '@nestjs/common';

import { IsNull, Not } from 'typeorm';

import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { type WorkspaceCacheRowsRequirement } from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

const WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.workflow.universalIdentifier,
  STANDARD_OBJECTS.workflowRun.universalIdentifier,
  STANDARD_OBJECTS.workflowVersion.universalIdentifier,
] as const;
const WORKSPACE_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workspaceMember.universalIdentifier;

const ROLES_PERMISSIONS_ROWS_REQUIREMENT = {
  role: true,
  objectPermission: { columns: true, groupBy: ['roleId'] },
  rolePermissionFlag: { columns: true, groupBy: ['roleId'] },
  permissionFlag: true,
  fieldPermission: { columns: true, groupBy: ['roleId'] },
  rowLevelPermissionPredicate: {
    columns: true,
    groupBy: ['roleId'],
    where: { deletedAt: IsNull(), roleId: Not(IsNull()) },
  },
  rowLevelPermissionPredicateGroup: {
    columns: true,
    groupBy: ['roleId'],
    where: { deletedAt: IsNull(), roleId: Not(IsNull()) },
  },
  objectMetadata: [
    'id',
    'isSystem',
    'universalIdentifier',
    'labelIdentifierFieldMetadataId',
  ],
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
    } = rows;

    const permissionFlagById = new Map(
      permissionFlags.map((permissionFlag) => [
        permissionFlag.id,
        permissionFlag,
      ]),
    );

    const permissionsByRoleId: ObjectsPermissionsByRoleId = {};

    for (const role of roles) {
      const roleObjectPermissions =
        objectPermissions.byRoleId.get(role.id) ?? [];
      const roleRolePermissionFlags = (
        rolePermissionFlags.byRoleId.get(role.id) ?? []
      ).map(
        (rolePermissionFlagRow) =>
          ({
            ...rolePermissionFlagRow,
            permissionFlag: permissionFlagById.get(
              rolePermissionFlagRow.permissionFlagId,
            ),
          }) as RolePermissionFlagEntity,
      );
      const roleFieldPermissions = fieldPermissions.byRoleId.get(role.id) ?? [];

      const roleRowLevelPermissionPredicates =
        rowLevelPermissionPredicates.byRoleId.get(role.id) ?? [];
      const roleRowLevelPermissionPredicateGroups =
        rowLevelPermissionPredicateGroups.byRoleId.get(role.id) ?? [];

      const objectRecordsPermissions: ObjectsPermissions = {};

      for (const objectMetadata of workspaceObjectMetadataCollection) {
        const {
          id: objectMetadataId,
          isSystem,
          universalIdentifier,
        } = objectMetadata;

        let canRead = role.canReadAllObjectRecords;
        let canUpdate = role.canUpdateAllObjectRecords;
        let canSoftDelete = role.canSoftDeleteAllObjectRecords;
        let canDestroy = role.canDestroyAllObjectRecords;
        const restrictedFields: RestrictedFieldsPermissions = {};

        const isWorkspaceMemberObject =
          universalIdentifier === WORKSPACE_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER;
        const isWorkflowRelatedObject =
          WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
            universalIdentifier as (typeof WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS)[number],
          );

        if (isWorkflowRelatedObject) {
          const hasWorkflowsPermissions =
            this.hasSettingsGatedObjectPermissions(
              role,
              roleRolePermissionFlags,
              PermissionFlagType.WORKFLOWS,
            );

          canRead = hasWorkflowsPermissions;
          canUpdate = hasWorkflowsPermissions;
          canSoftDelete = hasWorkflowsPermissions;
          canDestroy = hasWorkflowsPermissions;
        } else {
          if (isWorkspaceMemberObject) {
            const hasWorkspaceMembersPermissions =
              this.hasSettingsGatedObjectPermissions(
                role,
                roleRolePermissionFlags,
                PermissionFlagType.WORKSPACE_MEMBERS,
              );

            canRead = true;
            canUpdate = hasWorkspaceMembersPermissions;
            canSoftDelete = hasWorkspaceMembersPermissions;
            canDestroy = hasWorkspaceMembersPermissions;
          } else {
            const objectRecordPermissionsOverride = roleObjectPermissions.find(
              (objectPermission) =>
                objectPermission.objectMetadataId === objectMetadataId,
            );

            const getPermissionValue = (
              overrideValue: boolean | undefined,
              defaultValue: boolean,
            ) => overrideValue ?? (isSystem ? true : defaultValue);

            canRead = getPermissionValue(
              objectRecordPermissionsOverride?.canReadObjectRecords,
              canRead,
            );
            canUpdate = getPermissionValue(
              objectRecordPermissionsOverride?.canUpdateObjectRecords,
              canUpdate,
            );
            canSoftDelete = getPermissionValue(
              objectRecordPermissionsOverride?.canSoftDeleteObjectRecords,
              canSoftDelete,
            );
            canDestroy = getPermissionValue(
              objectRecordPermissionsOverride?.canDestroyObjectRecords,
              canDestroy,
            );
          }

          const fieldPermissionsForObject = roleFieldPermissions.filter(
            (fieldPermission) =>
              fieldPermission.objectMetadataId === objectMetadataId,
          );

          for (const fieldPermission of fieldPermissionsForObject) {
            const isFieldLabelIdentifier =
              fieldPermission.fieldMetadataId ===
              objectMetadata.labelIdentifierFieldMetadataId;

            if (
              isDefined(fieldPermission.canReadFieldValue) ||
              isDefined(fieldPermission.canUpdateFieldValue)
            ) {
              restrictedFields[fieldPermission.fieldMetadataId] = {
                canRead: isFieldLabelIdentifier
                  ? true
                  : fieldPermission.canReadFieldValue,
                canUpdate: fieldPermission.canUpdateFieldValue,
              };
            }
          }
        }

        objectRecordsPermissions[objectMetadataId] = {
          canReadObjectRecords: canRead,
          canUpdateObjectRecords: canUpdate,
          canSoftDeleteObjectRecords: canSoftDelete,
          canDestroyObjectRecords: canDestroy,
          restrictedFields,
          rowLevelPermissionPredicates: roleRowLevelPermissionPredicates.filter(
            (rowLevelPermissionPredicate) =>
              rowLevelPermissionPredicate.objectMetadataId === objectMetadataId,
          ),
          rowLevelPermissionPredicateGroups:
            roleRowLevelPermissionPredicateGroups.filter(
              (rowLevelPermissionPredicateGroup) =>
                rowLevelPermissionPredicateGroup.objectMetadataId ===
                objectMetadataId,
            ),
        };
      }

      permissionsByRoleId[role.id] = objectRecordsPermissions;
    }

    return permissionsByRoleId;
  }

  private hasSettingsGatedObjectPermissions(
    role: RoleEntity,
    rolePermissionFlags: RolePermissionFlagEntity[],
    permissionFlagType: PermissionFlagType,
  ): boolean {
    const hasPermissionFromRole = role.canUpdateAllSettings;
    const permissionFlagUniversalIdentifier =
      SystemPermissionFlag[permissionFlagType];
    const hasPermissionFromSettingPermissions = isDefined(
      rolePermissionFlags.find(
        (rolePermissionFlag) =>
          this.getRolePermissionFlagUniversalIdentifier(rolePermissionFlag) ===
          permissionFlagUniversalIdentifier,
      ),
    );

    return hasPermissionFromRole || hasPermissionFromSettingPermissions;
  }

  private getRolePermissionFlagUniversalIdentifier(
    rolePermissionFlag: RolePermissionFlagEntity,
  ): string {
    // The `permissionFlag` relation is stripped during upgrades until the 2.6.0
    // cursor (@WasIntroducedInUpgrade), so fall back to the legacy `flag` column.
    return (
      rolePermissionFlag.permissionFlag?.universalIdentifier ??
      SystemPermissionFlag[rolePermissionFlag.flag as PermissionFlagType]
    );
  }
}
