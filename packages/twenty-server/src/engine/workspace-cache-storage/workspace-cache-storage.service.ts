import { Injectable } from '@nestjs/common';

import crypto from 'crypto';

import { EntitySchemaOptions } from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export enum WorkspaceCacheKeys {
  GraphQLTypeDefs = 'graphql:type-defs',
  GraphQLUsedScalarNames = 'graphql:used-scalar-names',
  GraphQLOperations = 'graphql:operations',
  ORMEntitySchemas = 'orm:entity-schemas',
  GraphQLFeatureFlag = 'graphql:feature-flag',
  MetadataObjectMetadataMaps = 'metadata:object-metadata-maps',
  MetadataObjectMetadataOngoingCachingLock = 'metadata:object-metadata-ongoing-caching-lock',
  MetadataVersion = 'metadata:workspace-metadata-version',
  FeatureFlagMap = 'feature-flag:feature-flag-map',
  FeatureFlagMapVersion = 'feature-flag:feature-flag-map-version',
  FeatureFlagMapOngoingCachingLock = 'feature-flag-map-ongoing-caching-lock',
  MetadataPermissionsRolesPermissions = 'metadata:permissions:roles-permissions',
  MetadataPermissionsRolesPermissionsVersion = 'metadata:permissions:roles-permissions-version',
  MetadataPermissionsRolesPermissionsOngoingCachingLock = 'metadata:permissions:roles-permissions-ongoing-caching-lock',
  MetadataPermissionsUserWorkspaceRoleMap = 'metadata:permissions:user-workspace-role-map',
  MetadataPermissionsUserWorkspaceRoleMapVersion = 'metadata:permissions:user-workspace-role-map-version',
  MetadataPermissionsUserWorkspaceRoleMapOngoingCachingLock = 'metadata:permissions:user-workspace-role-map-ongoing-caching-lock',
}

const TTL_INFINITE = 0;

@Injectable()
export class WorkspaceCacheStorageService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  setORMEntitySchema(
    workspaceId: string,
    metadataVersion: number,
    entitySchemas: EntitySchemaOptions<any>[],
  ) {
    return this.cacheStorageService.set<EntitySchemaOptions<any>[]>(
      `${WorkspaceCacheKeys.ORMEntitySchemas}:${workspaceId}:${metadataVersion}`,
      entitySchemas,
      TTL_INFINITE,
    );
  }

  getORMEntitySchema(
    workspaceId: string,
    metadataVersion: number,
  ): Promise<EntitySchemaOptions<any>[] | undefined> {
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
      TTL_INFINITE,
    );
  }

  getMetadataVersion(workspaceId: string): Promise<number | undefined> {
    return this.cacheStorageService.get<number>(
      `${WorkspaceCacheKeys.MetadataVersion}:${workspaceId}`,
    );
  }

  addObjectMetadataCollectionOngoingCachingLock(
    workspaceId: string,
    metadataVersion: number,
  ) {
    return this.cacheStorageService.set<boolean>(
      `${WorkspaceCacheKeys.MetadataObjectMetadataOngoingCachingLock}:${workspaceId}:${metadataVersion}`,
      true,
      1_000 * 60, // 1 minute
    );
  }

  removeObjectMetadataOngoingCachingLock(
    workspaceId: string,
    metadataVersion: number,
  ) {
    return this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataObjectMetadataOngoingCachingLock}:${workspaceId}:${metadataVersion}`,
    );
  }

  getObjectMetadataOngoingCachingLock(
    workspaceId: string,
    metadataVersion: number,
  ): Promise<boolean | undefined> {
    return this.cacheStorageService.get<boolean>(
      `${WorkspaceCacheKeys.MetadataObjectMetadataOngoingCachingLock}:${workspaceId}:${metadataVersion}`,
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
      TTL_INFINITE,
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

  setGraphQLTypeDefs(
    workspaceId: string,
    metadataVersion: number,
    typeDefs: string,
  ): Promise<void> {
    return this.cacheStorageService.set<string>(
      `${WorkspaceCacheKeys.GraphQLTypeDefs}:${workspaceId}:${metadataVersion}`,
      typeDefs,
      TTL_INFINITE,
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
      TTL_INFINITE,
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

  // TODO: remove this after the feature flag is droped
  setIsNewRelationEnabled(workspaceId: string, isNewRelationEnabled: boolean) {
    return this.cacheStorageService.set<boolean>(
      `${WorkspaceCacheKeys.GraphQLFeatureFlag}:${workspaceId}:${FeatureFlagKey.IsNewRelationEnabled}`,
      isNewRelationEnabled,
      TTL_INFINITE,
    );
  }

  // TODO: remove this after the feature flag is droped
  getIsNewRelationEnabled(workspaceId: string): Promise<boolean | undefined> {
    return this.cacheStorageService.get<boolean>(
      `${WorkspaceCacheKeys.GraphQLFeatureFlag}:${workspaceId}:${FeatureFlagKey.IsNewRelationEnabled}`,
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
      TTL_INFINITE,
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
        TTL_INFINITE,
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

  addFeatureFlagMapOngoingCachingLock(workspaceId: string) {
    return this.cacheStorageService.set<boolean>(
      `${WorkspaceCacheKeys.FeatureFlagMapOngoingCachingLock}:${workspaceId}`,
      true,
      1_000 * 60, // 1 minute
    );
  }

  removeFeatureFlagsMapOngoingCachingLock(workspaceId: string) {
    return this.cacheStorageService.del(
      `${WorkspaceCacheKeys.FeatureFlagMapOngoingCachingLock}:${workspaceId}`,
    );
  }

  getFeatureFlagsMapOngoingCachingLock(
    workspaceId: string,
  ): Promise<boolean | undefined> {
    return this.cacheStorageService.get<boolean>(
      `${WorkspaceCacheKeys.FeatureFlagMapOngoingCachingLock}:${workspaceId}`,
    );
  }

  async flushVersionedMetadata(
    workspaceId: string,
    metadataVersion: number,
  ): Promise<void> {
    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataObjectMetadataMaps}:${workspaceId}:${metadataVersion}`,
    );
    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataVersion}:${workspaceId}:${metadataVersion}`,
    );
    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.GraphQLTypeDefs}:${workspaceId}:${metadataVersion}`,
    );
    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.GraphQLUsedScalarNames}:${workspaceId}:${metadataVersion}`,
    );
    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.ORMEntitySchemas}:${workspaceId}:${metadataVersion}`,
    );
    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataObjectMetadataOngoingCachingLock}:${workspaceId}:${metadataVersion}`,
    );
  }

  async flush(workspaceId: string, metadataVersion: number): Promise<void> {
    await this.flushVersionedMetadata(workspaceId, metadataVersion);

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataPermissionsRolesPermissions}:${workspaceId}`,
    );

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataPermissionsRolesPermissionsVersion}:${workspaceId}`,
    );

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataPermissionsRolesPermissionsOngoingCachingLock}:${workspaceId}`,
    );

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataPermissionsUserWorkspaceRoleMap}:${workspaceId}`,
    );

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataPermissionsUserWorkspaceRoleMapVersion}:${workspaceId}`,
    );

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataPermissionsUserWorkspaceRoleMapOngoingCachingLock}:${workspaceId}`,
    );

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.FeatureFlagMap}:${workspaceId}`,
    );

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.FeatureFlagMapVersion}:${workspaceId}`,
    );

    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.FeatureFlagMapOngoingCachingLock}:${workspaceId}`,
    );

    // TODO: remove this after the feature flag is droped
    await this.cacheStorageService.del(
      `${FeatureFlagKey.IsNewRelationEnabled}:${workspaceId}`,
    );
  }
}
