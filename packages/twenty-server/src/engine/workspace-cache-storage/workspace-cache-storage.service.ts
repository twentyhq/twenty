import { Injectable } from '@nestjs/common';

import crypto from 'crypto';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

export const HASH_KEYED_WORKSPACE_CACHE_KEYS = {
  GraphQLTypeDefs: 'graphql:type-defs',
  GraphQLUsedScalarNames: 'graphql:used-scalar-names',
} as const;
export const WORKSPACE_CACHE_KEYS = {
  MetadataVersion: 'metadata:workspace-metadata-version',
  GraphQLOperations: 'graphql:operations',
  GraphQLFeatureFlag: 'graphql:feature-flag',
  FeatureFlagMap: 'feature-flag:feature-flag-map',
  FeatureFlagMapVersion: 'feature-flag:feature-flag-map-version',
  MetadataPermissionsRolesPermissions: 'metadata:permissions:roles-permissions',
  MetadataPermissionsRolesPermissionsVersion:
    'metadata:permissions:roles-permissions-version',
  MetadataPermissionsUserWorkspaceRoleMap:
    'metadata:permissions:user-workspace-role-map',
  MetadataPermissionsUserWorkspaceRoleMapVersion:
    'metadata:permissions:user-workspace-role-map-version',
  MetadataPermissionsApiKeyRoleMap: 'metadata:permissions:api-key-role-map',
  MetadataPermissionsApiKeyRoleMapVersion:
    'metadata:permissions:api-key-role-map-version',
} as const;

const TTL_ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

@Injectable()
export class WorkspaceCacheStorageService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  setMetadataVersion(
    workspaceId: string,
    metadataVersion: number,
  ): Promise<void> {
    return this.cacheStorageService.set<number>(
      `${WORKSPACE_CACHE_KEYS.MetadataVersion}:${workspaceId}`,
      metadataVersion,
      TTL_ONE_WEEK,
    );
  }

  getMetadataVersion(workspaceId: string): Promise<number | undefined> {
    return this.cacheStorageService.get<number>(
      `${WORKSPACE_CACHE_KEYS.MetadataVersion}:${workspaceId}`,
    );
  }

  setGraphQLTypeDefs(
    workspaceId: string,
    metadataCacheHash: string,
    typeDefs: string,
    applicationId?: string,
  ): Promise<void> {
    const applicationSuffix = applicationId ? `:${applicationId}` : '';

    return this.cacheStorageService.set<string>(
      `${HASH_KEYED_WORKSPACE_CACHE_KEYS.GraphQLTypeDefs}:${workspaceId}:${metadataCacheHash}${applicationSuffix}`,
      typeDefs,
      TTL_ONE_WEEK,
    );
  }

  getGraphQLTypeDefs(
    workspaceId: string,
    metadataCacheHash: string,
    applicationId?: string,
  ): Promise<string | undefined> {
    const applicationSuffix = applicationId ? `:${applicationId}` : '';

    return this.cacheStorageService.get<string>(
      `${HASH_KEYED_WORKSPACE_CACHE_KEYS.GraphQLTypeDefs}:${workspaceId}:${metadataCacheHash}${applicationSuffix}`,
    );
  }

  setGraphQLUsedScalarNames(
    workspaceId: string,
    metadataCacheHash: string,
    usedScalarNames: string[],
    applicationId?: string,
  ): Promise<void> {
    const applicationSuffix = applicationId ? `:${applicationId}` : '';

    return this.cacheStorageService.set<string[]>(
      `${HASH_KEYED_WORKSPACE_CACHE_KEYS.GraphQLUsedScalarNames}:${workspaceId}:${metadataCacheHash}${applicationSuffix}`,
      usedScalarNames,
      TTL_ONE_WEEK,
    );
  }

  getGraphQLUsedScalarNames(
    workspaceId: string,
    metadataCacheHash: string,
    applicationId?: string,
  ): Promise<string[] | undefined> {
    const applicationSuffix = applicationId ? `:${applicationId}` : '';

    return this.cacheStorageService.get<string[]>(
      `${HASH_KEYED_WORKSPACE_CACHE_KEYS.GraphQLUsedScalarNames}:${workspaceId}:${metadataCacheHash}${applicationSuffix}`,
    );
  }

  getFeatureFlagsMapVersionFromCache(
    workspaceId: string,
  ): Promise<string | undefined> {
    return this.cacheStorageService.get<string>(
      `${WORKSPACE_CACHE_KEYS.FeatureFlagMapVersion}:${workspaceId}`,
    );
  }

  async setFeatureFlagsMapVersion(workspaceId: string): Promise<string> {
    const featureFlagMapVersion = crypto.randomUUID();

    await this.cacheStorageService.set<string>(
      `${WORKSPACE_CACHE_KEYS.FeatureFlagMapVersion}:${workspaceId}`,
      featureFlagMapVersion,
      TTL_ONE_WEEK,
    );

    return featureFlagMapVersion;
  }

  async setFeatureFlagsMap(
    workspaceId: string,
    featureFlagMap: FeatureFlagMap,
  ): Promise<{
    newFeatureFlagMapVersion: string;
  }> {
    const [, newFeatureFlagMapVersion] = await Promise.all([
      this.cacheStorageService.set<FeatureFlagMap>(
        `${WORKSPACE_CACHE_KEYS.FeatureFlagMap}:${workspaceId}`,
        featureFlagMap,
        TTL_ONE_WEEK,
      ),
      this.setFeatureFlagsMapVersion(workspaceId),
    ]);

    return { newFeatureFlagMapVersion };
  }

  getFeatureFlagsMap(workspaceId: string): Promise<FeatureFlagMap | undefined> {
    return this.cacheStorageService.get<FeatureFlagMap>(
      `${WORKSPACE_CACHE_KEYS.FeatureFlagMap}:${workspaceId}`,
    );
  }

  async flushGraphQLOperation({
    operationName,
    workspaceId,
  }: {
    operationName: string;
    workspaceId: string;
  }): Promise<void> {
    await this.cacheStorageService.flushByPattern(
      `${WORKSPACE_CACHE_KEYS.GraphQLOperations}:${operationName}:${workspaceId}:*`,
    );
  }

  async flushHashKeyedWorkspaceCache(workspaceId: string): Promise<void> {
    await Promise.all(
      Object.values(HASH_KEYED_WORKSPACE_CACHE_KEYS).map((key) =>
        this.cacheStorageService.flushByPattern(`${key}:${workspaceId}:*`),
      ),
    );
  }

  async flush(workspaceId: string): Promise<void> {
    await this.flushHashKeyedWorkspaceCache(workspaceId);

    await Promise.all(
      Object.values(WORKSPACE_CACHE_KEYS).map(
        async (key) =>
          await this.cacheStorageService.del(`${key}:${workspaceId}`),
      ),
    );
  }
}
