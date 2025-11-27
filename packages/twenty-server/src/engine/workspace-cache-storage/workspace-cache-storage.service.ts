import { Injectable } from '@nestjs/common';

import crypto from 'crypto';

import { isDefined } from 'twenty-shared/utils';
import { type EntitySchemaOptions } from 'typeorm';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

export const METADATA_VERSIONED_WORKSPACE_CACHE_KEY = {
  GraphQLTypeDefs: 'graphql:type-defs',
  MetadataVersion: 'metadata:workspace-metadata-version',
  MetadataObjectMetadataMaps: 'metadata:object-metadata-maps',
  GraphQLUsedScalarNames: 'graphql:used-scalar-names',
  ORMEntitySchemas: 'orm:entity-schemas',
} as const;
export const WORKSPACE_CACHE_KEYS = {
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

  setORMEntitySchema(
    workspaceId: string,
    metadataVersion: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entitySchemas: EntitySchemaOptions<any>[],
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.cacheStorageService.set<EntitySchemaOptions<any>[]>(
      `${METADATA_VERSIONED_WORKSPACE_CACHE_KEY.ORMEntitySchemas}:${workspaceId}:${metadataVersion}`,
      entitySchemas,
      TTL_ONE_WEEK,
    );
  }

  getORMEntitySchema(
    workspaceId: string,
    metadataVersion: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<EntitySchemaOptions<any>[] | undefined> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.cacheStorageService.get<EntitySchemaOptions<any>[]>(
      `${METADATA_VERSIONED_WORKSPACE_CACHE_KEY.ORMEntitySchemas}:${workspaceId}:${metadataVersion}`,
    );
  }

  setMetadataVersion(
    workspaceId: string,
    metadataVersion: number,
  ): Promise<void> {
    return this.cacheStorageService.set<number>(
      `${METADATA_VERSIONED_WORKSPACE_CACHE_KEY.MetadataVersion}:${workspaceId}`,
      metadataVersion,
      TTL_ONE_WEEK,
    );
  }

  getMetadataVersion(workspaceId: string): Promise<number | undefined> {
    return this.cacheStorageService.get<number>(
      `${METADATA_VERSIONED_WORKSPACE_CACHE_KEY.MetadataVersion}:${workspaceId}`,
    );
  }

  setGraphQLTypeDefs(
    workspaceId: string,
    metadataVersion: number,
    typeDefs: string,
  ): Promise<void> {
    return this.cacheStorageService.set<string>(
      `${METADATA_VERSIONED_WORKSPACE_CACHE_KEY.GraphQLTypeDefs}:${workspaceId}:${metadataVersion}`,
      typeDefs,
      TTL_ONE_WEEK,
    );
  }

  getGraphQLTypeDefs(
    workspaceId: string,
    metadataVersion: number,
  ): Promise<string | undefined> {
    return this.cacheStorageService.get<string>(
      `${METADATA_VERSIONED_WORKSPACE_CACHE_KEY.GraphQLTypeDefs}:${workspaceId}:${metadataVersion}`,
    );
  }

  setGraphQLUsedScalarNames(
    workspaceId: string,
    metadataVersion: number,
    usedScalarNames: string[],
  ): Promise<void> {
    return this.cacheStorageService.set<string[]>(
      `${METADATA_VERSIONED_WORKSPACE_CACHE_KEY.GraphQLUsedScalarNames}:${workspaceId}:${metadataVersion}`,
      usedScalarNames,
      TTL_ONE_WEEK,
    );
  }

  getGraphQLUsedScalarNames(
    workspaceId: string,
    metadataVersion: number,
  ): Promise<string[] | undefined> {
    return this.cacheStorageService.get<string[]>(
      `${METADATA_VERSIONED_WORKSPACE_CACHE_KEY.GraphQLUsedScalarNames}:${workspaceId}:${metadataVersion}`,
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

  async flushVersionedMetadata(
    workspaceId: string,
    metadataVersion?: number,
  ): Promise<void> {
    const metadataVersionSuffix = isDefined(metadataVersion)
      ? `${metadataVersion}`
      : '*';

    await Promise.all(
      Object.values(METADATA_VERSIONED_WORKSPACE_CACHE_KEY).map(
        async (key) =>
          await this.cacheStorageService.del(
            `${key}:${workspaceId}:${metadataVersionSuffix}`,
          ),
      ),
    );
  }

  async flush(workspaceId: string, metadataVersion?: number): Promise<void> {
    await this.flushVersionedMetadata(workspaceId, metadataVersion);

    await Promise.all(
      Object.values(WORKSPACE_CACHE_KEYS).map(
        async (key) =>
          await this.cacheStorageService.del(`${key}:${workspaceId}`),
      ),
    );
  }
}
