import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  ObjectPermissionInput,
  UpsertObjectPermissionsInput,
} from 'src/engine/metadata-modules/object-permission/dtos/upsert-object-permissions.input';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

export class ObjectPermissionService {
  constructor(
    @InjectRepository(ObjectPermissionEntity, 'core')
    private readonly objectPermissionRepository: Repository<ObjectPermissionEntity>,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  public async upsertObjectPermissions({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: UpsertObjectPermissionsInput;
  }): Promise<ObjectPermissionEntity[]> {
    try {
      const role = await this.getRoleOrThrow({
        roleId: input.roleId,
        workspaceId,
      });

      await this.validateRoleIsEditableOrThrow({
        role,
      });

      await this.validateObjectPermissionsReadAndWriteConsistencyOrThrow({
        objectPermissions: input.objectPermissions,
        roleWithObjectPermissions: role,
      });

      const { byId: objectMetadataMapsById } =
        await this.workspaceCacheStorageService.getObjectMetadataMapsOrThrow(
          workspaceId,
        );

      input.objectPermissions.forEach((objectPermission) => {
        const objectMetadataForObjectPermission =
          objectMetadataMapsById[objectPermission.objectMetadataId];

        if (!isDefined(objectMetadataForObjectPermission)) {
          throw new PermissionsException(
            'Object metadata id not found',
            PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
            {
              userFriendlyMessage:
                'The object you are trying to set permissions for could not be found. It may have been deleted.',
            },
          );
        }

        if (objectMetadataForObjectPermission.isSystem === true) {
          throw new PermissionsException(
            PermissionsExceptionMessage.CANNOT_ADD_OBJECT_PERMISSION_ON_SYSTEM_OBJECT,
            PermissionsExceptionCode.CANNOT_ADD_OBJECT_PERMISSION_ON_SYSTEM_OBJECT,
            {
              userFriendlyMessage:
                'You cannot set permissions on system objects as they are managed by the platform.',
            },
          );
        }
      });

      const objectPermissions = input.objectPermissions.map(
        (objectPermission) => ({
          ...objectPermission,
          roleId: input.roleId,
          workspaceId,
        }),
      );

      const result = await this.objectPermissionRepository.upsert(
        objectPermissions,
        {
          conflictPaths: ['objectMetadataId', 'roleId'],
        },
      );

      const objectPermissionId = result.generatedMaps?.[0]?.id;

      if (!isDefined(objectPermissionId)) {
        throw new Error('Failed to upsert object permission');
      }

      await this.workspacePermissionsCacheService.recomputeRolesPermissionsCache(
        {
          workspaceId,
          roleIds: [input.roleId],
        },
      );

      return this.objectPermissionRepository.find({
        where: {
          roleId: input.roleId,
          objectMetadataId: In(
            input.objectPermissions.map(
              (objectPermission) => objectPermission.objectMetadataId,
            ),
          ),
        },
      });
    } catch (error) {
      await this.handleForeignKeyError({
        error,
        roleId: input.roleId,
        workspaceId,
        objectMetadataIds: input.objectPermissions.map(
          (objectPermission) => objectPermission.objectMetadataId,
        ),
      });

      throw error;
    }
  }

  private async validateObjectPermissionsReadAndWriteConsistencyOrThrow({
    objectPermissions: newObjectPermissions,
    roleWithObjectPermissions,
  }: {
    objectPermissions: ObjectPermissionInput[];
    roleWithObjectPermissions: RoleEntity;
  }) {
    const existingObjectPermissions =
      roleWithObjectPermissions.objectPermissions;

    for (const newObjectPermission of newObjectPermissions) {
      const existingObjectRecordPermission = existingObjectPermissions.find(
        (objectPermission) =>
          objectPermission.objectMetadataId ===
          newObjectPermission.objectMetadataId,
      );

      const hasReadPermissionAfterUpdate =
        newObjectPermission.canReadObjectRecords ??
        existingObjectRecordPermission?.canReadObjectRecords ??
        roleWithObjectPermissions.canReadAllObjectRecords;

      if (hasReadPermissionAfterUpdate === false) {
        const hasUpdatePermissionAfterUpdate =
          newObjectPermission.canUpdateObjectRecords ??
          existingObjectRecordPermission?.canUpdateObjectRecords ??
          roleWithObjectPermissions.canUpdateAllObjectRecords;

        const hasSoftDeletePermissionAfterUpdate =
          newObjectPermission.canSoftDeleteObjectRecords ??
          existingObjectRecordPermission?.canSoftDeleteObjectRecords ??
          roleWithObjectPermissions.canSoftDeleteAllObjectRecords;

        const hasDestroyPermissionAfterUpdate =
          newObjectPermission.canDestroyObjectRecords ??
          existingObjectRecordPermission?.canDestroyObjectRecords ??
          roleWithObjectPermissions.canDestroyAllObjectRecords;

        if (
          hasUpdatePermissionAfterUpdate ||
          hasSoftDeletePermissionAfterUpdate ||
          hasDestroyPermissionAfterUpdate
        ) {
          throw new PermissionsException(
            PermissionsExceptionMessage.CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT,
            PermissionsExceptionCode.CANNOT_GIVE_WRITING_PERMISSION_ON_NON_READABLE_OBJECT,
            {
              userFriendlyMessage:
                'You cannot grant edit permissions without also granting read permissions. Please enable read access first.',
            },
          );
        }
      }
    }
  }

  private async handleForeignKeyError({
    error,
    roleId,
    workspaceId,
    objectMetadataIds,
  }: {
    error: Error;
    roleId: string;
    workspaceId: string;
    objectMetadataIds: string[];
  }) {
    if (error.message.includes('violates foreign key constraint')) {
      const role = await this.roleRepository.findOne({
        where: {
          id: roleId,
          workspaceId,
        },
      });

      if (!isDefined(role)) {
        throw new PermissionsException(
          PermissionsExceptionMessage.ROLE_NOT_FOUND,
          PermissionsExceptionCode.ROLE_NOT_FOUND,
          {
            userFriendlyMessage:
              'The role you are trying to modify could not be found. It may have been deleted or you may not have access to it.',
          },
        );
      }

      const objectMetadata = await this.objectMetadataRepository.find({
        where: {
          workspaceId,
          id: In(objectMetadataIds),
        },
      });

      if (objectMetadata.length !== objectMetadataIds.length) {
        throw new PermissionsException(
          PermissionsExceptionMessage.OBJECT_METADATA_NOT_FOUND,
          PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
          {
            userFriendlyMessage:
              'One or more objects you are trying to set permissions for could not be found. They may have been deleted.',
          },
        );
      }
    }
  }

  private async getRoleOrThrow({
    roleId,
    workspaceId,
  }: {
    roleId: string;
    workspaceId: string;
  }) {
    const role = await this.roleRepository.findOne({
      where: {
        id: roleId,
        workspaceId,
      },
      relations: ['objectPermissions'],
    });

    if (!isDefined(role)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_FOUND,
        PermissionsExceptionCode.ROLE_NOT_FOUND,
        {
          userFriendlyMessage:
            'The role you are trying to modify could not be found. It may have been deleted or you may not have access to it.',
        },
      );
    }

    return role;
  }

  private async validateRoleIsEditableOrThrow({ role }: { role: RoleEntity }) {
    if (!role.isEditable) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_EDITABLE,
        PermissionsExceptionCode.ROLE_NOT_EDITABLE,
        {
          userFriendlyMessage:
            'This role cannot be modified because it is a system role. Only custom roles can be edited.',
        },
      );
    }
  }
}
