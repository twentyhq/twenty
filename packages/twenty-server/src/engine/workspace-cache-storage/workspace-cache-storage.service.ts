import { Injectable } from '@nestjs/common';

import { EntitySchemaOptions } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export enum WorkspaceCacheKeys {
  GraphQLTypeDefs = 'graphql:type-defs',
  GraphQLUsedScalarNames = 'graphql:used-scalar-names',
  GraphQLOperations = 'graphql:operations',
  ORMEntitySchemas = 'orm:entity-schemas',
  MetadataObjectMetadataMaps = 'metadata:object-metadata-maps',
  MetadataObjectMetadataOngoingCachingLock = 'metadata:object-metadata-ongoing-caching-lock',
  MetadataVersion = 'metadata:workspace-metadata-version',
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
      TTL_INFINITE,
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

  async flush(workspaceId: string, metadataVersion: number): Promise<void> {
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
}
