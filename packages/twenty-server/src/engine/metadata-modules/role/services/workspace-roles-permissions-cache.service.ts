import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PermissionFlagType } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

const WORKFLOW_STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.workflow.universalIdentifier,
  STANDARD_OBJECTS.workflowRun.universalIdentifier,
  STANDARD_OBJECTS.workflowVersion.universalIdentifier,
] as const;
const WORKSPACE_MEMBER_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.workspaceMember.universalIdentifier;

@Injectable()
@WorkspaceCache('rolesPermissions')
export class WorkspaceRolesPermissionsCacheService extends WorkspaceCacheProvider<ObjectsPermissionsByRoleId> {
  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<ObjectsPermissionsByRoleId> {
    const roles = await this.roleRepository.find({
      where: {
        workspaceId,
      },
      relations: [
        'objectPermissions',
        'permissionFlags',
        'fieldPermissions',
        'rowLevelPermissionPredicates',
        'rowLevelPermissionPredicateGroups',
      ],
    });

    const workspaceObjectMetadataCollection =
      await this.getWorkspaceObjectMetadataCollection(workspaceId);

    const permissionsByRoleId: ObjectsPermissionsByRoleId = {};

    for (const role of roles) {
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
                PermissionFlagType.WORKSPACE_MEMBERS,
              );

            canRead = hasWorkspaceMembersPermissions;
            canUpdate = hasWorkspaceMembersPermissions;
            canSoftDelete = hasWorkspaceMembersPermissions;
            canDestroy = hasWorkspaceMembersPermissions;
          } else {
            const objectRecordPermissionsOverride = role.objectPermissions.find(
              (objectPermission) =>
                objectPermission.objectMetadataId === objectMetadataId,
            );

            const getPermissionValue = (
              overrideValue: boolean | undefined,
              defaultValue: boolean,
            ) => (isSystem ? true : (overrideValue ?? defaultValue));

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

          const fieldPermissions = role.fieldPermissions.filter(
            (fieldPermission) =>
              fieldPermission.objectMetadataId === objectMetadataId,
          );

          for (const fieldPermission of fieldPermissions) {
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
          rowLevelPermissionPredicates:
            role.rowLevelPermissionPredicates.filter(
              (rowLevelPermissionPredicate) =>
                rowLevelPermissionPredicate.objectMetadataId ===
                objectMetadataId,
            ),
          rowLevelPermissionPredicateGroups:
            role.rowLevelPermissionPredicateGroups.filter(
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

  private async getWorkspaceObjectMetadataCollection(
    workspaceId: string,
  ): Promise<ObjectMetadataEntity[]> {
    const workspaceObjectMetadata = await this.objectMetadataRepository.find({
      where: {
        workspaceId,
      },
      select: [
        'id',
        'isSystem',
        'universalIdentifier',
        'labelIdentifierFieldMetadataId',
      ],
    });

    return workspaceObjectMetadata;
  }

  private hasSettingsGatedObjectPermissions(
    role: RoleEntity,
    permissionFlagType: PermissionFlagType,
  ): boolean {
    const hasPermissionFromRole = role.canUpdateAllSettings;
    const hasPermissionFromSettingPermissions = isDefined(
      role.permissionFlags.find(
        (permissionFlag) => permissionFlag.flag === permissionFlagType,
      ),
    );

    return hasPermissionFromRole || hasPermissionFromSettingPermissions;
  }
}
