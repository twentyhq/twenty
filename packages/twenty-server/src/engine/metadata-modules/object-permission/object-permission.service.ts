import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  type ObjectPermissionInput,
  type UpsertObjectPermissionsInput,
} from 'src/engine/metadata-modules/object-permission/dtos/upsert-object-permissions.input';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export class ObjectPermissionService {
  constructor(
    @InjectRepository(ObjectPermissionEntity)
    private readonly objectPermissionRepository: Repository<ObjectPermissionEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
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

      const { flatObjectMetadataMaps } =
        await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
          {
            workspaceId,
            flatMapsKeys: ['flatObjectMetadataMaps'],
          },
        );

      input.objectPermissions.forEach((objectPermission) => {
        const objectMetadataForObjectPermission =
          flatObjectMetadataMaps.byId[objectPermission.objectMetadataId];

        if (!isDefined(objectMetadataForObjectPermission)) {
          throw new PermissionsException(
            'Object metadata id not found',
            PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
            {
              userFriendlyMessage: msg`The object you are trying to set permissions for could not be found. It may have been deleted.`,
            },
          );
        }

        if (objectMetadataForObjectPermission.isSystem === true) {
          throw new PermissionsException(
            PermissionsExceptionMessage.CANNOT_ADD_OBJECT_PERMISSION_ON_SYSTEM_OBJECT,
            PermissionsExceptionCode.CANNOT_ADD_OBJECT_PERMISSION_ON_SYSTEM_OBJECT,
            {
              userFriendlyMessage: msg`You cannot set permissions on system objects as they are managed by the platform.`,
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

      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'rolesPermissions',
      ]);

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
              userFriendlyMessage: msg`You cannot grant edit permissions without also granting read permissions. Please enable read access first.`,
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
            userFriendlyMessage: msg`The role you are trying to modify could not be found. It may have been deleted or you may not have access to it.`,
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
            userFriendlyMessage: msg`One or more objects you are trying to set permissions for could not be found. They may have been deleted.`,
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
          userFriendlyMessage: msg`The role you are trying to modify could not be found. It may have been deleted or you may not have access to it.`,
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
          userFriendlyMessage: msg`This role cannot be modified because it is a system role. Only custom roles can be edited.`,
        },
      );
    }
  }
}
