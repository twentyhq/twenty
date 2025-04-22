import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  ObjectRecordsPermissions,
  ObjectRecordsPermissionsByRoleId,
} from 'twenty-shared/types';
import { In, Repository } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
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

const USER_WORKSPACE_ROLE_MAP = 'User workspace role map';
const ROLES_PERMISSIONS = 'Roles permissions';

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
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async recomputeRolesPermissionsCache({
    workspaceId,
    ignoreLock = false,
    roleIds,
  }: {
    workspaceId: string;
    ignoreLock?: boolean;
    roleIds?: string[];
  }): Promise<void> {
    const isPermissionsV2Enabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IsPermissionsV2Enabled,
        workspaceId,
      );

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

    try {
      let currentRolesPermissions: ObjectRecordsPermissionsByRoleId | undefined;

      if (roleIds) {
        currentRolesPermissions =
          await this.workspacePermissionsCacheStorageService.getRolesPermissions(
            workspaceId,
          );
      }

      const recomputedRolesPermissions =
        await this.getObjectRecordPermissionsForRoles({
          workspaceId,
          isPermissionsV2Enabled,
          roleIds,
        });

      const freshObjectRecordsPermissionsByRoleId = roleIds
        ? { ...currentRolesPermissions, ...recomputedRolesPermissions }
        : recomputedRolesPermissions;

      await this.workspacePermissionsCacheStorageService.setRolesPermissions(
        workspaceId,
        freshObjectRecordsPermissionsByRoleId,
      );
    } finally {
      await this.workspacePermissionsCacheStorageService.removeRolesPermissionsOngoingCachingLock(
        workspaceId,
      );
    }
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

    try {
      const freshUserWorkspaceRoleMap =
        await this.getUserWorkspaceRoleMapFromDatabase({
          workspaceId,
        });

      await this.workspacePermissionsCacheStorageService.setUserWorkspaceRoleMap(
        workspaceId,
        freshUserWorkspaceRoleMap,
      );
    } finally {
      await this.workspacePermissionsCacheStorageService.removeUserWorkspaceRoleMapOngoingCachingLock(
        workspaceId,
      );
    }
  }

  async getRolesPermissionsFromCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<CacheResult<string, ObjectRecordsPermissionsByRoleId>> {
    return getFromCacheWithRecompute<string, ObjectRecordsPermissionsByRoleId>({
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
      cachedEntityName: ROLES_PERMISSIONS,
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
      cachedEntityName: USER_WORKSPACE_ROLE_MAP,
      exceptionCode:
        TwentyORMExceptionCode.USER_WORKSPACE_ROLE_MAP_VERSION_NOT_FOUND,
    });
  }

  private async getObjectRecordPermissionsForRoles({
    workspaceId,
    isPermissionsV2Enabled,
    roleIds,
  }: {
    workspaceId: string;
    isPermissionsV2Enabled: boolean;
    roleIds?: string[];
  }): Promise<ObjectRecordsPermissionsByRoleId> {
    let roles: RoleEntity[] = [];

    roles = await this.roleRepository.find({
      where: {
        workspaceId,
        ...(roleIds ? { id: In(roleIds) } : {}),
      },
      relations: ['objectPermissions'],
    });

    const workspaceObjectMetadataNameIdMap =
      await this.getWorkspaceObjectMetadataNameIdMap(workspaceId);

    const permissionsByRoleId: ObjectRecordsPermissionsByRoleId = {};

    for (const role of roles) {
      const objectRecordsPermissions: ObjectRecordsPermissions = {};

      for (const objectMetadataNameSingular of Object.keys(
        workspaceObjectMetadataNameIdMap,
      )) {
        let canRead = role.canReadAllObjectRecords;
        let canUpdate = role.canUpdateAllObjectRecords;
        let canSoftDelete = role.canSoftDeleteAllObjectRecords;
        let canDestroy = role.canDestroyAllObjectRecords;

        if (isPermissionsV2Enabled) {
          const objectRecordPermissionsOverride = role.objectPermissions.find(
            (objectPermission) =>
              objectPermission.objectMetadataId ===
              workspaceObjectMetadataNameIdMap[objectMetadataNameSingular],
          );

          canRead =
            objectRecordPermissionsOverride?.canReadObjectRecords ?? canRead;
          canUpdate =
            objectRecordPermissionsOverride?.canUpdateObjectRecords ??
            canUpdate;
          canSoftDelete =
            objectRecordPermissionsOverride?.canSoftDeleteObjectRecords ??
            canSoftDelete;
          canDestroy =
            objectRecordPermissionsOverride?.canDestroyObjectRecords ??
            canDestroy;
        }

        objectRecordsPermissions[objectMetadataNameSingular] = {
          canRead,
          canUpdate,
          canSoftDelete,
          canDestroy,
        };
      }

      permissionsByRoleId[role.id] = objectRecordsPermissions;
    }

    return permissionsByRoleId;
  }

  private async getWorkspaceObjectMetadataNameIdMap(
    workspaceId: string,
  ): Promise<Record<string, string>> {
    let workspaceObjectMetadataMap: Record<string, string> = {};
    const metadataVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (metadataVersion) {
      const objectMetadataMaps =
        await this.workspaceCacheStorageService.getObjectMetadataMaps(
          workspaceId,
          metadataVersion,
        );

      workspaceObjectMetadataMap = Object.values(
        objectMetadataMaps?.byId ?? {},
      ).reduce(
        (acc, objectMetadata) => {
          acc[objectMetadata.nameSingular] = objectMetadata.id;

          return acc;
        },
        {} as Record<string, string>,
      );
    }

    if (
      !metadataVersion ||
      Object.keys(workspaceObjectMetadataMap).length === 0
    ) {
      const workspaceObjectMetadata = await this.objectMetadataRepository.find({
        where: {
          workspaceId,
        },
      });

      workspaceObjectMetadataMap = workspaceObjectMetadata.reduce(
        (acc, objectMetadata) => {
          acc[objectMetadata.nameSingular] = objectMetadata.id;

          return acc;
        },
        {} as Record<string, string>,
      );
    }

    return workspaceObjectMetadataMap;
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
