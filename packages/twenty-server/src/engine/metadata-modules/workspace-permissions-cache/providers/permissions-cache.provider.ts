import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
    type ObjectsPermissions,
    type ObjectsPermissionsByRoleId,
    type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceContextCache } from 'src/engine/workspace-context-cache/decorators/workspace-context-cache.decorator';
import { WorkspaceContextCacheProvider } from 'src/engine/workspace-context-cache/workspace-context-cache-provider.service';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

const WORKFLOW_STANDARD_OBJECT_IDS = [
  STANDARD_OBJECT_IDS.workflow,
  STANDARD_OBJECT_IDS.workflowRun,
  STANDARD_OBJECT_IDS.workflowVersion,
] as const;

@Injectable()
@WorkspaceContextCache('permissionsPerRoleId')
export class PermissionsCacheProvider extends WorkspaceContextCacheProvider<ObjectsPermissionsByRoleId> {
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
      relations: ['objectPermissions', 'permissionFlags', 'fieldPermissions'],
    });

    const workspaceObjectMetadataCollection =
      await this.getWorkspaceObjectMetadataCollection(workspaceId);

    const permissionsByRoleId: ObjectsPermissionsByRoleId = {};

    for (const role of roles) {
      const objectRecordsPermissions: ObjectsPermissions = {};

      for (const objectMetadata of workspaceObjectMetadataCollection) {
        const { id: objectMetadataId, isSystem, standardId } = objectMetadata;

        let canRead = role.canReadAllObjectRecords;
        let canUpdate = role.canUpdateAllObjectRecords;
        let canSoftDelete = role.canSoftDeleteAllObjectRecords;
        let canDestroy = role.canDestroyAllObjectRecords;
        const restrictedFields: RestrictedFieldsPermissions = {};

        if (
          standardId &&
          WORKFLOW_STANDARD_OBJECT_IDS.includes(
            standardId as (typeof WORKFLOW_STANDARD_OBJECT_IDS)[number],
          )
        ) {
          const hasWorkflowsPermissions = this.hasWorkflowsPermissions(role);

          canRead = hasWorkflowsPermissions;
          canUpdate = hasWorkflowsPermissions;
          canSoftDelete = hasWorkflowsPermissions;
          canDestroy = hasWorkflowsPermissions;
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
        };

        permissionsByRoleId[role.id] = objectRecordsPermissions;
      }
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
        'standardId',
        'labelIdentifierFieldMetadataId',
      ],
    });

    return workspaceObjectMetadata;
  }

  private hasWorkflowsPermissions(role: RoleEntity): boolean {
    const hasWorkflowsPermissionFromRole = role.canUpdateAllSettings;
    const hasWorkflowsPermissionsFromSettingPermissions = isDefined(
      role.permissionFlags.find(
        (permissionFlag) =>
          permissionFlag.flag === PermissionFlagType.WORKFLOWS,
      ),
    );

    return (
      hasWorkflowsPermissionFromRole ||
      hasWorkflowsPermissionsFromSettingPermissions
    );
  }

  dataCacheKey(workspaceId: string): string {
    return `metadata:permissions:roles-permissions:${workspaceId}`;
  }

  hashCacheKey(workspaceId: string): string {
    return `metadata:permissions:roles-permissions-version:${workspaceId}`;
  }
}

