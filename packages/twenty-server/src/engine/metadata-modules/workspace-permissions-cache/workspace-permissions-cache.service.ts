import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  ObjectRecordsPermissions,
  ObjectRecordsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { UserWorkspaceRoleEntity } from 'src/engine/metadata-modules/role/user-workspace-role.entity';
import { WorkspaceFeatureFlagsMapCacheService } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.service';
import { UserWorkspaceRoleMap } from 'src/engine/metadata-modules/workspace-permissions-cache/types/user-workspace-role-map.type';
import { WorkspacePermissionsCacheStorageService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache-storage.service';
import { TwentyORMExceptionCode } from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { getFromCacheWithRecompute } from 'src/engine/utils/get-data-from-cache-with-recompute.util';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

type CacheResult<T, U> = {
  version: T;
  data: U;
};

export const USER_WORKSPACE_ROLE_MAP = 'User workspace role map';
export const ROLES_PERMISSIONS = 'Roles permissions';

@Injectable()
export class WorkspacePermissionsCacheService {
  logger = new Logger(WorkspacePermissionsCacheService.name);

  constructor(
    @InjectRepository(ObjectMetadataEntity, 'core')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserWorkspaceRoleEntity, 'core')
    private readonly userWorkspaceRoleRepository: Repository<UserWorkspaceRoleEntity>,
    private readonly workspacePermissionsCacheStorageService: WorkspacePermissionsCacheStorageService,
    private readonly workspaceFeatureFlagsMapCacheService: WorkspaceFeatureFlagsMapCacheService,
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
    const isAlreadyCaching =
      await this.workspacePermissionsCacheStorageService.getRolesPermissionsOngoingCachingLock(
        workspaceId,
      );

    if (isAlreadyCaching) {
      if (ignoreLock) {
        this.logger.warn(
          `RolesPermissions data is already being cached (workspace ${workspaceId}), ignoring lock`,
        );
      } else {
        this.logger.warn(
          `RolesPermissions data is already being cached (workspace ${workspaceId}), respecting lock and returning no data`,
        );

        return;
      }
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

      const workspaceFeatureFlagsMap =
        await this.workspaceFeatureFlagsMapCacheService.getWorkspaceFeatureFlagsMap(
          { workspaceId },
        );

      const isPermissionsV2Enabled =
        !!workspaceFeatureFlagsMap[FeatureFlagKey.IS_PERMISSIONS_V2_ENABLED];

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
    try {
      const isAlreadyCaching =
        await this.workspacePermissionsCacheStorageService.getUserWorkspaceRoleMapOngoingCachingLock(
          workspaceId,
        );

      if (isAlreadyCaching) {
        if (ignoreLock) {
          this.logger.warn(
            `UserWorkspaceRoleMap data is already being cached (workspace ${workspaceId}), ignoring lock`,
          );
        } else {
          this.logger.warn(
            `UserWorkspaceRoleMap data is already being cached (workspace ${workspaceId}), respecting lock and returning no data`,
          );

          return;
        }
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
    } catch (error) {
      // Flush stale userWorkspaceRoleMap
      await this.workspacePermissionsCacheStorageService.removeUserWorkspaceRoleMap(
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
      logger: this.logger,
    });
  }

  async getUserWorkspaceRoleMapFromCache({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<CacheResult<undefined, UserWorkspaceRoleMap>> {
    return getFromCacheWithRecompute<undefined, UserWorkspaceRoleMap>({
      workspaceId,
      getCacheData: () =>
        this.workspacePermissionsCacheStorageService.getUserWorkspaceRoleMap(
          workspaceId,
        ),
      recomputeCache: (params) =>
        this.recomputeUserWorkspaceRoleMapCache(params),
      cachedEntityName: USER_WORKSPACE_ROLE_MAP,
      exceptionCode:
        TwentyORMExceptionCode.USER_WORKSPACE_ROLE_MAP_VERSION_NOT_FOUND,
      logger: this.logger,
    });
  }

  async getRoleIdFromUserWorkspaceId({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
  }): Promise<string | undefined> {
    if (!isDefined(userWorkspaceId)) {
      return;
    }

    const userWorkspaceRoleMap = await this.getUserWorkspaceRoleMapFromCache({
      workspaceId,
    });

    // @ts-expect-error legacy noImplicitAny
    return userWorkspaceRoleMap[userWorkspaceId];
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
      relations: ['objectPermissions', 'settingPermissions'],
    });

    const workspaceObjectMetadataCollection =
      await this.getWorkspaceObjectMetadataCollection(workspaceId);

    const permissionsByRoleId: ObjectRecordsPermissionsByRoleId = {};

    for (const role of roles) {
      const objectRecordsPermissions: ObjectRecordsPermissions = {};

      for (const objectMetadata of workspaceObjectMetadataCollection) {
        const { id: objectMetadataId, isSystem, standardId } = objectMetadata;

        let canRead = role.canReadAllObjectRecords;
        let canUpdate = role.canUpdateAllObjectRecords;
        let canSoftDelete = role.canSoftDeleteAllObjectRecords;
        let canDestroy = role.canDestroyAllObjectRecords;

        if (isPermissionsV2Enabled) {
          if (
            standardId &&
            [
              STANDARD_OBJECT_IDS.workflow,
              STANDARD_OBJECT_IDS.workflowRun,
              STANDARD_OBJECT_IDS.workflowVersion,
            ].includes(standardId)
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
          }
        }

        objectRecordsPermissions[objectMetadataId] = {
          canRead,
          canUpdate,
          canSoftDelete,
          canDestroy,
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
      select: ['id', 'isSystem', 'standardId'],
    });

    return workspaceObjectMetadata;
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

  private hasWorkflowsPermissions(role: RoleEntity): boolean {
    const hasWorkflowsPermissionFromRole = role.canUpdateAllSettings;
    const hasWorkflowsPermissionsFromSettingPermissions = isDefined(
      role.settingPermissions.find(
        (settingPermission) =>
          settingPermission.setting === SettingPermissionType.WORKFLOWS,
      ),
    );

    return (
      hasWorkflowsPermissionFromRole ||
      hasWorkflowsPermissionsFromSettingPermissions
    );
  }
}
