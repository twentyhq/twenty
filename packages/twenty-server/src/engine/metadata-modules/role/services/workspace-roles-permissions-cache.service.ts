import { Injectable } from '@nestjs/common';

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

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { entityFetchRequirement } from 'src/engine/workspace-cache/utils/entity-fetch-requirement.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';

const WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.workflow.universalIdentifier,
  STANDARD_OBJECTS.workflowRun.universalIdentifier,
  STANDARD_OBJECTS.workflowVersion.universalIdentifier,
] as const;
const WORKSPACE_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workspaceMember.universalIdentifier;

@Injectable()
@WorkspaceCache('rolesPermissions', { packingPonderation: 2 })
export class WorkspaceRolesPermissionsCacheService extends WorkspaceCacheProvider<ObjectsPermissionsByRoleId> {
  override readonly fetchRequirements = [
    entityFetchRequirement(RoleEntity),
    entityFetchRequirement(ObjectPermissionEntity),
    entityFetchRequirement(RolePermissionFlagEntity),
    entityFetchRequirement(PermissionFlagEntity),
    entityFetchRequirement(FieldPermissionEntity),
    entityFetchRequirement(RowLevelPermissionPredicateEntity),
    entityFetchRequirement(RowLevelPermissionPredicateGroupEntity),
    entityFetchRequirement(ObjectMetadataEntity, [
      'id',
      'isSystem',
      'universalIdentifier',
      'labelIdentifierFieldMetadataId',
    ]),
  ];

  computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): ObjectsPermissionsByRoleId {
    const roles = recomputeContext.getRows(RoleEntity);
    const objectPermissions = recomputeContext.getRows(ObjectPermissionEntity);
    const rolePermissionFlagRows = recomputeContext.getRows(
      RolePermissionFlagEntity,
    );
    const permissionFlags = recomputeContext.getRows(PermissionFlagEntity);
    const fieldPermissions = recomputeContext.getRows(FieldPermissionEntity);
    const rowLevelPermissionPredicateRows = recomputeContext.getRows(
      RowLevelPermissionPredicateEntity,
    );
    const rowLevelPermissionPredicateGroupRows = recomputeContext.getRows(
      RowLevelPermissionPredicateGroupEntity,
    );
    const workspaceObjectMetadataCollection =
      recomputeContext.getRows(ObjectMetadataEntity);

    // the recompute context cannot load relations: rebuild the permissionFlag
    // relation in memory (undefined when the FK is absent, so the legacy
    // `flag` fallback still applies)
    const permissionFlagById = new Map(
      permissionFlags.map((permissionFlag) => [
        permissionFlag.id,
        permissionFlag,
      ]),
    );
    const rolePermissionFlags = rolePermissionFlagRows.map(
      (rolePermissionFlagRow) =>
        ({
          ...rolePermissionFlagRow,
          permissionFlag: permissionFlagById.get(
            rolePermissionFlagRow.permissionFlagId,
          ),
        }) as RolePermissionFlagEntity,
    );

    // the recompute context fetches withDeleted: these two tables previously
    // excluded soft-deleted rows, so filter them out in memory
    const rowLevelPermissionPredicates = rowLevelPermissionPredicateRows.filter(
      (rowLevelPermissionPredicate) =>
        !isDefined(rowLevelPermissionPredicate.deletedAt),
    );
    const rowLevelPermissionPredicateGroups =
      rowLevelPermissionPredicateGroupRows.filter(
        (rowLevelPermissionPredicateGroup) =>
          !isDefined(rowLevelPermissionPredicateGroup.deletedAt),
      );

    const objectPermissionsByRoleId =
      regroupEntitiesByRelatedEntityId<'objectPermission'>({
        entities: objectPermissions,
        foreignKey: 'roleId',
      });
    const rolePermissionFlagsByRoleId =
      regroupEntitiesByRelatedEntityId<'rolePermissionFlag'>({
        entities: rolePermissionFlags,
        foreignKey: 'roleId',
      });
    const fieldPermissionsByRoleId =
      regroupEntitiesByRelatedEntityId<'fieldPermission'>({
        entities: fieldPermissions,
        foreignKey: 'roleId',
      });
    const rowLevelPermissionPredicatesByRoleId =
      regroupEntitiesByRelatedEntityId<'rowLevelPermissionPredicate'>({
        entities: rowLevelPermissionPredicates,
        foreignKey: 'roleId',
      });
    const rowLevelPermissionPredicateGroupsByRoleId =
      regroupEntitiesByRelatedEntityId<'rowLevelPermissionPredicateGroup'>({
        entities: rowLevelPermissionPredicateGroups,
        foreignKey: 'roleId',
      });

    const permissionsByRoleId: ObjectsPermissionsByRoleId = {};

    for (const role of roles) {
      const roleObjectPermissions =
        objectPermissionsByRoleId.get(role.id) ?? [];
      const roleRolePermissionFlags =
        rolePermissionFlagsByRoleId.get(role.id) ?? [];
      const roleFieldPermissions = fieldPermissionsByRoleId.get(role.id) ?? [];
      const roleRowLevelPermissionPredicates =
        rowLevelPermissionPredicatesByRoleId.get(role.id) ?? [];
      const roleRowLevelPermissionPredicateGroups =
        rowLevelPermissionPredicateGroupsByRoleId.get(role.id) ?? [];

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
