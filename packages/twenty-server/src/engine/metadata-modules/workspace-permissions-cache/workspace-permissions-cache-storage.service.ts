import { Injectable, Logger } from '@nestjs/common';

import { ObjectRecordsPermissionsByRoleId } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { UserWorkspaceRoleMap } from 'src/engine/metadata-modules/workspace-permissions-cache/types/user-workspace-role-map.type';
import { WorkspaceCacheKeys } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

const TTL_INFINITE = 0;

@Injectable()
export class WorkspacePermissionsCacheStorageService {
  logger = new Logger(WorkspacePermissionsCacheStorageService.name);

  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async setRolesPermissionsVersion(workspaceId: string): Promise<string> {
    const rolesPermissionsVersion = v4();

    await this.cacheStorageService.set<string>(
      `${WorkspaceCacheKeys.MetadataPermissionsRolesPermissionsVersion}:${workspaceId}`,
      rolesPermissionsVersion,
      TTL_INFINITE,
    );

    return rolesPermissionsVersion;
  }

  async setRolesPermissions(
    workspaceId: string,
    permissions: ObjectRecordsPermissionsByRoleId,
  ): Promise<{
    newRolesPermissionsVersion: string;
  }> {
    const [, newRolesPermissionsVersion] = await Promise.all([
      this.cacheStorageService.set<ObjectRecordsPermissionsByRoleId>(
        `${WorkspaceCacheKeys.MetadataPermissionsRolesPermissions}:${workspaceId}`,
        permissions,
        TTL_INFINITE,
      ),
      this.setRolesPermissionsVersion(workspaceId),
    ]);

    return { newRolesPermissionsVersion };
  }

  getRolesPermissions(
    workspaceId: string,
  ): Promise<ObjectRecordsPermissionsByRoleId | undefined> {
    return this.cacheStorageService.get<ObjectRecordsPermissionsByRoleId>(
      `${WorkspaceCacheKeys.MetadataPermissionsRolesPermissions}:${workspaceId}`,
    );
  }

  getRolesPermissionsVersion(workspaceId: string): Promise<string | undefined> {
    return this.cacheStorageService.get<string>(
      `${WorkspaceCacheKeys.MetadataPermissionsRolesPermissionsVersion}:${workspaceId}`,
    );
  }

  addRolesPermissionsOngoingCachingLock(workspaceId: string) {
    return this.cacheStorageService.set<boolean>(
      `${WorkspaceCacheKeys.MetadataPermissionsRolesPermissionsOngoingCachingLock}:${workspaceId}`,
      true,
      1_000 * 60, // 1 minute
    );
  }

  removeRolesPermissionsOngoingCachingLock(workspaceId: string) {
    return this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataPermissionsRolesPermissionsOngoingCachingLock}:${workspaceId}`,
    );
  }

  getRolesPermissionsOngoingCachingLock(
    workspaceId: string,
  ): Promise<boolean | undefined> {
    return this.cacheStorageService.get<boolean>(
      `${WorkspaceCacheKeys.MetadataPermissionsRolesPermissionsOngoingCachingLock}:${workspaceId}`,
    );
  }

  async setUserWorkspaceRoleMap(
    workspaceId: string,
    userWorkspaceRoleMap: UserWorkspaceRoleMap,
  ): Promise<{
    newUserWorkspaceRoleMapVersion: string;
  }> {
    const [, newUserWorkspaceRoleMapVersion] = await Promise.all([
      this.cacheStorageService.set<UserWorkspaceRoleMap>(
        `${WorkspaceCacheKeys.MetadataPermissionsUserWorkspaceRoleMap}:${workspaceId}`,
        userWorkspaceRoleMap,
        TTL_INFINITE,
      ),
      this.setUserWorkspaceRoleMapVersion(workspaceId),
    ]);

    return { newUserWorkspaceRoleMapVersion };
  }

  async setUserWorkspaceRoleMapVersion(workspaceId: string) {
    const userWorkspaceRoleMapVersion = v4();

    await this.cacheStorageService.set<string>(
      `${WorkspaceCacheKeys.MetadataPermissionsUserWorkspaceRoleMapVersion}:${workspaceId}`,
      userWorkspaceRoleMapVersion,
      TTL_INFINITE,
    );

    return userWorkspaceRoleMapVersion;
  }

  getUserWorkspaceRoleMap(
    workspaceId: string,
  ): Promise<Record<string, string> | undefined> {
    return this.cacheStorageService.get<Record<string, string>>(
      `${WorkspaceCacheKeys.MetadataPermissionsUserWorkspaceRoleMap}:${workspaceId}`,
    );
  }

  getUserWorkspaceRoleMapVersion(
    workspaceId: string,
  ): Promise<string | undefined> {
    return this.cacheStorageService.get<string>(
      `${WorkspaceCacheKeys.MetadataPermissionsUserWorkspaceRoleMapVersion}:${workspaceId}`,
    );
  }

  addUserWorkspaceRoleMapOngoingCachingLock(workspaceId: string) {
    return this.cacheStorageService.set<boolean>(
      `${WorkspaceCacheKeys.MetadataPermissionsUserWorkspaceRoleMapOngoingCachingLock}:${workspaceId}`,
      true,
      1_000 * 60, // 1 minute
    );
  }

  removeUserWorkspaceRoleMapOngoingCachingLock(workspaceId: string) {
    return this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataPermissionsUserWorkspaceRoleMapOngoingCachingLock}:${workspaceId}`,
    );
  }

  getUserWorkspaceRoleMapOngoingCachingLock(
    workspaceId: string,
  ): Promise<boolean | undefined> {
    return this.cacheStorageService.get<boolean>(
      `${WorkspaceCacheKeys.MetadataPermissionsUserWorkspaceRoleMapOngoingCachingLock}:${workspaceId}`,
    );
  }
}
