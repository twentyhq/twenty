import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { UpsertObjectPermissionInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-object-permission-input';
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

  public async upsertObjectPermission({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: UpsertObjectPermissionInput;
  }): Promise<ObjectPermissionEntity | null> {
    try {
      await this.validateRoleIsEditableOrThrow({
        roleId: input.roleId,
        workspaceId,
      });

      const result = await this.objectPermissionRepository.upsert(
        {
          workspaceId,
          ...input,
        },
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

      return this.objectPermissionRepository.findOne({
        where: {
          id: objectPermissionId,
        },
      });
    } catch (error) {
      await this.handleForeignKeyError({
        error,
        roleId: input.roleId,
        workspaceId,
        objectMetadataId: input.objectMetadataId,
      });

      throw error;
    }
  }

  private async handleForeignKeyError({
    error,
    roleId,
    workspaceId,
    objectMetadataId,
  }: {
    error: Error;
    roleId: string;
    workspaceId: string;
    objectMetadataId: string;
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

      const objectMetadata = await this.objectMetadataRepository.findOne({
        where: {
          workspaceId,
          id: objectMetadataId,
        },
      });

      if (!isDefined(objectMetadata)) {
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
