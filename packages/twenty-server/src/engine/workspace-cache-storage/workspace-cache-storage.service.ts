import { Injectable } from '@nestjs/common';

import crypto from 'crypto';

import { isDefined } from 'twenty-shared/utils';
import { EntitySchemaOptions } from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import {
  WorkspaceMetadataCacheException,
  WorkspaceMetadataCacheExceptionCode,
} from 'src/engine/metadata-modules/workspace-metadata-cache/exceptions/workspace-metadata-cache.exception';
import {
  WorkspaceMetadataVersionException,
  WorkspaceMetadataVersionExceptionCode,
} from 'src/engine/metadata-modules/workspace-metadata-version/exceptions/workspace-metadata-version.exception';

export enum WorkspaceCacheKeys {
  GraphQLTypeDefs = 'graphql:type-defs',
  GraphQLUsedScalarNames = 'graphql:used-scalar-names',
  GraphQLOperations = 'graphql:operations',
  ORMEntitySchemas = 'orm:entity-schemas',
  GraphQLFeatureFlag = 'graphql:feature-flag',
  MetadataObjectMetadataMaps = 'metadata:object-metadata-maps',
  MetadataVersion = 'metadata:workspace-metadata-version',
  FeatureFlagMap = 'feature-flag:feature-flag-map',
  FeatureFlagMapVersion = 'feature-flag:feature-flag-map-version',
  MetadataPermissionsRolesPermissions = 'metadata:permissions:roles-permissions',
  MetadataPermissionsRolesPermissionsVersion = 'metadata:permissions:roles-permissions-version',
  MetadataPermissionsUserWorkspaceRoleMap = 'metadata:permissions:user-workspace-role-map',
  MetadataPermissionsUserWorkspaceRoleMapVersion = 'metadata:permissions:user-workspace-role-map-version',
  MetadataPermissionsApiKeyRoleMap = 'metadata:permissions:api-key-role-map',
  MetadataPermissionsApiKeyRoleMapVersion = 'metadata:permissions:api-key-role-map-version',
}

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
      `${WorkspaceCacheKeys.ORMEntitySchemas}:${workspaceId}:${metadataVersion}`,
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
      `${WorkspaceCacheKeys.ORMEntitySchemas}:${workspaceId}:${metadataVersion}`,
    );
  }

  setMetadataVersion(
    workspaceId: string,
    metadataVersion: number,
  ): Promise<void> {
    return this.cacheStorageService.set<number>(
      `${WorkspaceCacheKeys.MetadataVersion}:${workspaceId}`,
      metadataVersion,
      TTL_ONE_WEEK,
    );
  }

  getMetadataVersion(workspaceId: string): Promise<number | undefined> {
    return this.cacheStorageService.get<number>(
      `${WorkspaceCacheKeys.MetadataVersion}:${workspaceId}`,
    );
  }

  setObjectMetadataMaps(
    workspaceId: string,
    metadataVersion: number,
    objectMetadataMaps: ObjectMetadataMaps,
  ) {
    return this.cacheStorageService.set<ObjectMetadataMaps>(
      `${WorkspaceCacheKeys.MetadataObjectMetadataMaps}:${workspaceId}:${metadataVersion}`,
      objectMetadataMaps,
      TTL_ONE_WEEK,
    );
  }

  getObjectMetadataMaps(
    workspaceId: string,
    metadataVersion: number,
  ): Promise<ObjectMetadataMaps | undefined> {
    return this.cacheStorageService.get<ObjectMetadataMaps>(
      `${WorkspaceCacheKeys.MetadataObjectMetadataMaps}:${workspaceId}:${metadataVersion}`,
    );
  }

  async getObjectMetadataMapsOrThrow(workspaceId: string) {
    const currentCacheVersion = await this.getMetadataVersion(workspaceId);

    if (currentCacheVersion === undefined) {
      throw new WorkspaceMetadataVersionException(
        `Metadata version not found for workspace ${workspaceId}`,
        WorkspaceMetadataVersionExceptionCode.METADATA_VERSION_NOT_FOUND,
      );
    }

    const objectMetadataMaps = await this.getObjectMetadataMaps(
      workspaceId,
      currentCacheVersion,
    );

    if (!objectMetadataMaps) {
      throw new WorkspaceMetadataCacheException(
        `Object metadata map not found for workspace ${workspaceId} and metadata version ${currentCacheVersion}`,
        WorkspaceMetadataCacheExceptionCode.OBJECT_METADATA_MAP_NOT_FOUND,
      );
    }

    return objectMetadataMaps;
  }

  setGraphQLTypeDefs(
    workspaceId: string,
    metadataVersion: number,
    typeDefs: string,
  ): Promise<void> {
    return this.cacheStorageService.set<string>(
      `${WorkspaceCacheKeys.GraphQLTypeDefs}:${workspaceId}:${metadataVersion}`,
      typeDefs,
      TTL_ONE_WEEK,
    );
  }

  getGraphQLTypeDefs(
    workspaceId: string,
    metadataVersion: number,
  ): Promise<string | undefined> {
    return this.cacheStorageService.get<string>(
      `${WorkspaceCacheKeys.GraphQLTypeDefs}:${workspaceId}:${metadataVersion}`,
    );
  }

  setGraphQLUsedScalarNames(
    workspaceId: string,
    metadataVersion: number,
    usedScalarNames: string[],
  ): Promise<void> {
    return this.cacheStorageService.set<string[]>(
      `${WorkspaceCacheKeys.GraphQLUsedScalarNames}:${workspaceId}:${metadataVersion}`,
      usedScalarNames,
      TTL_ONE_WEEK,
    );
  }

  getGraphQLUsedScalarNames(
    workspaceId: string,
    metadataVersion: number,
  ): Promise<string[] | undefined> {
    return this.cacheStorageService.get<string[]>(
      `${WorkspaceCacheKeys.GraphQLUsedScalarNames}:${workspaceId}:${metadataVersion}`,
    );
  }

  getFeatureFlagsMapVersionFromCache(
    workspaceId: string,
  ): Promise<string | undefined> {
    return this.cacheStorageService.get<string>(
      `${WorkspaceCacheKeys.FeatureFlagMapVersion}:${workspaceId}`,
    );
  }

  async setFeatureFlagsMapVersion(workspaceId: string): Promise<string> {
    const featureFlagMapVersion = crypto.randomUUID();

    await this.cacheStorageService.set<string>(
      `${WorkspaceCacheKeys.FeatureFlagMapVersion}:${workspaceId}`,
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
        `${WorkspaceCacheKeys.FeatureFlagMap}:${workspaceId}`,
        featureFlagMap,
        TTL_ONE_WEEK,
      ),
      this.setFeatureFlagsMapVersion(workspaceId),
    ]);

    return { newFeatureFlagMapVersion };
  }

  getFeatureFlagsMap(workspaceId: string): Promise<FeatureFlagMap | undefined> {
    return this.cacheStorageService.get<FeatureFlagMap>(
      `${WorkspaceCacheKeys.FeatureFlagMap}:${workspaceId}`,
    );
  }

  async flushVersionedMetadata(
    workspaceId: string,
    metadataVersion?: number,
  ): Promise<void> {
    const metadataVersionSuffix = isDefined(metadataVersion)
      ? `${metadataVersion}`
      : '*';

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataObjectMetadataMaps}:${workspaceId}:${metadataVersionSuffix}`,
    );
    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataVersion}:${workspaceId}:${metadataVersionSuffix}`,
    );
    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.GraphQLTypeDefs}:${workspaceId}:${metadataVersionSuffix}`,
    );
    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.GraphQLUsedScalarNames}:${workspaceId}:${metadataVersionSuffix}`,
    );
    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.ORMEntitySchemas}:${workspaceId}:${metadataVersionSuffix}`,
    );
  }

  async flush(workspaceId: string, metadataVersion?: number): Promise<void> {
    await this.flushVersionedMetadata(workspaceId, metadataVersion);

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataPermissionsRolesPermissions}:${workspaceId}`,
    );

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataPermissionsRolesPermissionsVersion}:${workspaceId}`,
    );

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataPermissionsUserWorkspaceRoleMap}:${workspaceId}`,
    );

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataPermissionsUserWorkspaceRoleMapVersion}:${workspaceId}`,
    );

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.FeatureFlagMap}:${workspaceId}`,
    );

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.FeatureFlagMapVersion}:${workspaceId}`,
    );
  }
}
