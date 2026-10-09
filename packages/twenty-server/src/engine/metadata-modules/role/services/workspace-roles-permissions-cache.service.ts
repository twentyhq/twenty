import { Injectable } from '@nestjs/common';
import { IsNull } from 'typeorm';
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
import { isDefined, isMorphRelationGroup } from 'twenty-shared/utils';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { hasRoleWideAccessToPermissionFlag } from 'src/engine/metadata-modules/permissions/utils/has-role-wide-access-to-permission-flag.util';
import { type RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
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
  role: [
    'id',
    'canUpdateAllSettings',
    'canAccessAllTools',
    'canReadAllObjectRecords',
    'canUpdateAllObjectRecords',
    'canSoftDeleteAllObjectRecords',
    'canDestroyAllObjectRecords',
  ],
  fieldMetadata: [
    'id',
    'type',
    'universalIdentifier',
    'morphId',
    'objectMetadataId',
  ],
  objectPermission: { columns: true, groupBy: ['roleId'] },
  rolePermissionFlag: { columns: true, groupBy: ['roleId'] },
  permissionFlag: true,
  fieldPermission: {
    columns: [
      'objectMetadataId',
      'fieldMetadataId',
      'canReadFieldValue',
      'canUpdateFieldValue',
    ],
    groupBy: ['roleId'],
  },
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

    const morphTargetIdsByObjectAndMorphId = new Map<string, string[]>();
    for (const fieldMetadata of rows.fieldMetadata) {
      if (
        !isDefined(fieldMetadata.morphId) ||
        isMorphRelationGroup(fieldMetadata)
      ) {
        continue;
      }
      const key = `${fieldMetadata.objectMetadataId}:${fieldMetadata.morphId}`;
      const targetIds = morphTargetIdsByObjectAndMorphId.get(key) ?? [];
      targetIds.push(fieldMetadata.id);
      morphTargetIdsByObjectAndMorphId.set(key, targetIds);
    }
    const morphTargetIdsByGroupId = new Map<string, string[]>();
    for (const fieldMetadata of rows.fieldMetadata) {
      if (isMorphRelationGroup(fieldMetadata)) {
        morphTargetIdsByGroupId.set(
          fieldMetadata.id,
          morphTargetIdsByObjectAndMorphId.get(
            `${fieldMetadata.objectMetadataId}:${fieldMetadata.morphId}`,
          ) ?? [],
        );
      }
    }

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
          const hasWorkflowsPermissions = isRolePermissionFlagGranted(
            PermissionFlagType.WORKFLOWS,
          );

          canRead = hasWorkflowsPermissions;
          canUpdate = hasWorkflowsPermissions;
          canSoftDelete = hasWorkflowsPermissions;
          canDestroy = hasWorkflowsPermissions;
        } else {
          if (isWorkspaceMemberObject) {
            const hasWorkspaceMembersPermissions = isRolePermissionFlagGranted(
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
              overrideValue: boolean | null | undefined,
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
              for (const fieldMetadataId of [
                fieldPermission.fieldMetadataId,
                ...(morphTargetIdsByGroupId.get(
                  fieldPermission.fieldMetadataId,
                ) ?? []),
              ]) {
                const existingRestriction = restrictedFields[fieldMetadataId];
                restrictedFields[fieldMetadataId] = {
                  canRead: isFieldLabelIdentifier
                    ? true
                    : existingRestriction?.canRead === false
                      ? false
                      : fieldPermission.canReadFieldValue,
                  canUpdate:
                    existingRestriction?.canUpdate === false
                      ? false
                      : fieldPermission.canUpdateFieldValue,
                };
              }
            }
          }
        }

        if (
          universalIdentifier ===
          STANDARD_OBJECTS.agentChatThread.universalIdentifier
        ) {
          const hasAiPermission = isRolePermissionFlagGranted(
            PermissionFlagType.AI,
          );
          canRead = canRead && hasAiPermission;
          canUpdate = canUpdate && hasAiPermission;
          canSoftDelete = canSoftDelete && hasAiPermission;
          canDestroy = canDestroy && hasAiPermission;
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
