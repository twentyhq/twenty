import { InjectRepository } from '@nestjs/typeorm';

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

export class ObjectPermissionService {
  constructor(
    @InjectRepository(ObjectPermissionEntity, 'metadata')
    private readonly objectPermissionRepository: Repository<ObjectPermissionEntity>,
    @InjectRepository(RoleEntity, 'metadata')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {}

  public async upsertObjectPermission({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: UpsertObjectPermissionInput;
  }): Promise<ObjectPermissionEntity | null | undefined> {
    try {
      const result = await this.objectPermissionRepository.upsert(
        {
          workspaceId,
          ...input,
        },
        {
          conflictPaths: ['objectMetadataId', 'roleId'],
        },
      );

      const objectPermissionId = result.generatedMaps[0].id;

      return this.objectPermissionRepository.findOne({
        where: {
          id: objectPermissionId,
        },
      });
    } catch (error) {
      if (error.message.includes('violates foreign key constraint')) {
        const role = await this.roleRepository.findOne({
          where: {
            id: input.roleId,
          },
        });

        if (!role) {
          throw new PermissionsException(
            PermissionsExceptionMessage.ROLE_NOT_FOUND,
            PermissionsExceptionCode.ROLE_NOT_FOUND,
          );
        }

        const objectMetadata = await this.objectMetadataRepository.findOne({
          where: {
            id: input.objectMetadataId,
          },
        });

        if (!objectMetadata) {
          throw new PermissionsException(
            PermissionsExceptionMessage.OBJECT_METADATA_NOT_FOUND,
            PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
          );
        }
      }

      throw error;
    }
  }
}
