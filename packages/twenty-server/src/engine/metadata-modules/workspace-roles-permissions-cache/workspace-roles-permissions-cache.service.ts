import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  ObjectRecordsPermissions,
  ObjectRecordsPermissionsByRoleId,
} from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class WorkspaceRolesPermissionsCacheService {
  logger = new Logger(WorkspaceRolesPermissionsCacheService.name);

  constructor(
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(RoleEntity, 'metadata')
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async recomputeRolesPermissionsCache({
    workspaceId,
    ignoreLock = false,
  }: {
    workspaceId: string;
    ignoreLock?: boolean;
  }): Promise<void> {
    const isAlreadyCaching =
      await this.workspaceCacheStorageService.getRolesPermissionsOngoingCachingLock(
        workspaceId,
      );

    if (!ignoreLock && isAlreadyCaching) {
      return;
    }

    await this.workspaceCacheStorageService.addRolesPermissionsOngoingCachingLock(
      workspaceId,
    );

    const freshObjectRecordsPermissionsByRoleId =
      await this.getObjectRecordPermissionsForRoles({
        workspaceId,
      });

    await this.workspaceCacheStorageService.setRolesPermissions(
      workspaceId,
      freshObjectRecordsPermissionsByRoleId,
    );

    await this.workspaceCacheStorageService.removeRolesPermissionsOngoingCachingLock(
      workspaceId,
    );
  }

  private async getObjectRecordPermissionsForRoles({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<ObjectRecordsPermissionsByRoleId> {
    const roles = await this.roleRepository.find({
      where: {
        workspaceId,
      },
      relations: {
        objectPermissions: true,
      },
    });

    const workspaceObjectMetadata = await this.objectMetadataRepository.find({
      where: {
        workspaceId,
      },
    });

    const permissionsByRoleId: ObjectRecordsPermissionsByRoleId = {};

    for (const role of roles) {
      const objectRecordsPermissions: ObjectRecordsPermissions = {};

      for (const objectMetadata of workspaceObjectMetadata) {
        const objectPermission = role.objectPermissions.find(
          (objectPermission) =>
            objectPermission.objectMetadataId === objectMetadata.id,
        );

        objectRecordsPermissions[objectMetadata.nameSingular] = {
          canRead:
            objectPermission?.canReadObjectRecords ??
            role.canReadAllObjectRecords,
          canUpdate:
            objectPermission?.canUpdateObjectRecords ??
            role.canUpdateAllObjectRecords,
          canSoftDelete:
            objectPermission?.canSoftDeleteObjectRecords ??
            role.canSoftDeleteAllObjectRecords,
          canDestroy:
            objectPermission?.canDestroyObjectRecords ??
            role.canDestroyAllObjectRecords,
        };
      }

      permissionsByRoleId[role.id] = objectRecordsPermissions;
    }

    return permissionsByRoleId;
  }
}
