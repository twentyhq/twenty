import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { UpsertObjectPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-object-permissions.input';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

export class ObjectPermissionService {
  constructor(
    @InjectRepository(ObjectPermissionEntity, 'metadata')
    private readonly objectPermissionRepository: Repository<ObjectPermissionEntity>,
    @InjectRepository(RoleEntity, 'metadata')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
  ) {}

  public async upsertObjectPermissions({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: UpsertObjectPermissionsInput;
  }): Promise<ObjectPermissionEntity[]> {
    try {
      await this.validateRoleIsEditableOrThrow({
        roleId: input.roleId,
        workspaceId,
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
        );
      }
    }
  }

  private async validateRoleIsEditableOrThrow({
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
    });

    if (!role?.isEditable) {
      throw new PermissionsException(
        PermissionsExceptionMessage.ROLE_NOT_EDITABLE,
        PermissionsExceptionCode.ROLE_NOT_EDITABLE,
      );
    }
  }
}
