import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  ObjectRecordsPermissions,
  ObjectRecordsPermissionsByRoleId,
} from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';
import { UserWorkspaceRoleMap } from 'src/engine/metadata-modules/workspace-permissions-cache/types/user-workspace-role-map.type';
import { WorkspacePermissionsCacheStorageService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache-storage.service';
import { TwentyORMExceptionCode } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { getFromCacheWithRecompute } from 'src/engine/utils/get-data-from-cache-with-recompute.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

type CacheResult<T, U> = {
  version: T;
  data: U;
};

@Injectable()
export class WorkspacePermissionsCacheService {
  logger = new Logger(WorkspacePermissionsCacheService.name);

  constructor(
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(RoleEntity, 'metadata')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserWorkspaceRoleEntity, 'metadata')
    private readonly userWorkspaceRoleRepository: Repository<UserWorkspaceRoleEntity>,
    private readonly workspacePermissionsCacheStorageService: WorkspacePermissionsCacheStorageService,
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
      await this.workspacePermissionsCacheStorageService.getRolesPermissionsOngoingCachingLock(
        workspaceId,
      );

    if (!ignoreLock && isAlreadyCaching) {
      return;
    }

    await this.workspacePermissionsCacheStorageService.addRolesPermissionsOngoingCachingLock(
      workspaceId,
    );

    const freshObjectRecordsPermissionsByRoleId =
      await this.getObjectRecordPermissionsForRoles({
        workspaceId,
      });

    await this.workspacePermissionsCacheStorageService.setRolesPermissions(
      workspaceId,
      freshObjectRecordsPermissionsByRoleId,
    );

    await this.workspacePermissionsCacheStorageService.removeRolesPermissionsOngoingCachingLock(
      workspaceId,
    );
  }

  async recomputeUserWorkspaceRoleMapCache({
    workspaceId,
    ignoreLock = false,
  }: {
    workspaceId: string;
    ignoreLock?: boolean;
  }): Promise<void> {
    const isAlreadyCaching =
      await this.workspacePermissionsCacheStorageService.getUserWorkspaceRoleMapOngoingCachingLock(
        workspaceId,
      );

    if (!ignoreLock && isAlreadyCaching) {
      return;
    }

    await this.workspacePermissionsCacheStorageService.addUserWorkspaceRoleMapOngoingCachingLock(
      workspaceId,
    );

    const freshUserWorkspaceRoleMap =
      await this.getUserWorkspaceRoleMapFromDatabase({
        workspaceId,
      });

    await this.workspacePermissionsCacheStorageService.setUserWorkspaceRoleMap(
      workspaceId,
      freshUserWorkspaceRoleMap,
    );

    await this.workspacePermissionsCacheStorageService.removeUserWorkspaceRoleMapOngoingCachingLock(
      workspaceId,
    );
  }

  async getRolesPermissionsFromCache({
    workspaceId,
    isPermissionsV2Enabled,
  }: {
    workspaceId: string;
    isPermissionsV2Enabled?: boolean;
  }): Promise<
    CacheResult<
      string | undefined,
      ObjectRecordsPermissionsByRoleId | undefined
    >
  > {
    if (!isPermissionsV2Enabled) {
      return { version: undefined, data: undefined };
    }

    return getFromCacheWithRecompute<
      string | undefined,
      ObjectRecordsPermissionsByRoleId | undefined
    >({
      workspaceId,
      getCacheData: () =>
        this.workspacePermissionsCacheStorageService.getRolesPermissions(
          workspaceId,
        ),
      getCacheVersion: () =>
        this.workspacePermissionsCacheStorageService.getRolesPermissionsVersion(
          workspaceId,
        ),
      recomputeCache: (params) => this.recomputeRolesPermissionsCache(params),
      cachedEntityName: 'Roles permissions',
      exceptionCode: TwentyORMExceptionCode.ROLES_PERMISSIONS_VERSION_NOT_FOUND,
    });
  }

  async getUserWorkspaceRoleMapFromCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<CacheResult<string, UserWorkspaceRoleMap>> {
    return getFromCacheWithRecompute<string, UserWorkspaceRoleMap>({
      workspaceId,
      getCacheData: () =>
        this.workspacePermissionsCacheStorageService.getUserWorkspaceRoleMap(
          workspaceId,
        ),
      getCacheVersion: () =>
        this.workspacePermissionsCacheStorageService.getUserWorkspaceRoleMapVersion(
          workspaceId,
        ),
      recomputeCache: (params) =>
        this.recomputeUserWorkspaceRoleMapCache(params),
      cachedEntityName: 'User workspace role map',
      exceptionCode:
        TwentyORMExceptionCode.USER_WORKSPACE_ROLE_MAP_VERSION_NOT_FOUND,
    });
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
    });

    const workspaceObjectMetadataNames =
      await this.getWorkspaceObjectMetadataNames(workspaceId);

    const permissionsByRoleId: ObjectRecordsPermissionsByRoleId = {};

    for (const role of roles) {
      const objectRecordsPermissions: ObjectRecordsPermissions = {};

      for (const objectMetadataNameSingular of workspaceObjectMetadataNames) {
        objectRecordsPermissions[objectMetadataNameSingular] = {
          canRead: role.canReadAllObjectRecords,
          canUpdate: role.canUpdateAllObjectRecords,
          canSoftDelete: role.canSoftDeleteAllObjectRecords,
          canDestroy: role.canDestroyAllObjectRecords,
        };
      }

      permissionsByRoleId[role.id] = objectRecordsPermissions;
    }

    return permissionsByRoleId;
  }

  private async getWorkspaceObjectMetadataNames(
    workspaceId: string,
  ): Promise<string[]> {
    let workspaceObjectMetadataNames: string[] = [];
    const metadataVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (metadataVersion) {
      const objectMetadataMaps =
        await this.workspaceCacheStorageService.getObjectMetadataMaps(
          workspaceId,
          metadataVersion,
        );

      workspaceObjectMetadataNames = Object.values(
        objectMetadataMaps?.byId ?? {},
      ).map((objectMetadata) => objectMetadata.nameSingular);
    }

    if (!metadataVersion || workspaceObjectMetadataNames.length === 0) {
      const workspaceObjectMetadata = await this.objectMetadataRepository.find({
        where: {
          workspaceId,
        },
      });

      workspaceObjectMetadataNames = workspaceObjectMetadata.map(
        (objectMetadata) => objectMetadata.nameSingular,
      );
    }

    return workspaceObjectMetadataNames;
  }

  private async getUserWorkspaceRoleMapFromDatabase({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<UserWorkspaceRoleMap> {
    const userWorkspaceRoleMap = await this.userWorkspaceRoleRepository.find({
      where: {
        workspaceId,
      },
    });

    return userWorkspaceRoleMap.reduce((acc, userWorkspaceRole) => {
      acc[userWorkspaceRole.userWorkspaceId] = userWorkspaceRole.roleId;

      return acc;
    }, {} as UserWorkspaceRoleMap);
  }
}
