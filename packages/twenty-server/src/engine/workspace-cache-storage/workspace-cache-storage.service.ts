import { Injectable } from '@nestjs/common';

import { EntitySchemaOptions } from 'typeorm';

import { CacheStorageService } from 'src/engine/integrations/cache-storage/cache-storage.service';
import { InjectCacheStorage } from 'src/engine/integrations/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageNamespace } from 'src/engine/integrations/cache-storage/types/cache-storage-namespace.enum';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

enum WorkspaceCacheKeys {
  GraphQLTypeDefs = 'graphql:type-defs',
  GraphQLUsedScalarNames = 'graphql:used-scalar-names',
  GraphQLOperations = 'graphql:operations',
  ORMEntitySchemas = 'orm:entity-schemas',
  MetadataObjectMetadataCollection = 'metadata:object-metadata-collection',
  MetadataVersion = 'metadata:workspace-metadata-version',
}

@Injectable()
export class WorkspaceCacheStorageService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  setORMEntitySchema(
    workspaceId: string,
    entitySchemas: EntitySchemaOptions<any>[],
  ) {
    return this.cacheStorageService.set<EntitySchemaOptions<any>[]>(
      `${WorkspaceCacheKeys.ORMEntitySchemas}:${workspaceId}`,
      entitySchemas,
    );
  }

  getORMEntitySchema(
    workspaceId: string,
  ): Promise<EntitySchemaOptions<any>[] | undefined> {
    return this.cacheStorageService.get<EntitySchemaOptions<any>[]>(
      `${WorkspaceCacheKeys.ORMEntitySchemas}:${workspaceId}`,
    );
  }

  setMetadataVersion(workspaceId: string, version: number): Promise<void> {
    return this.cacheStorageService.set<number>(
      `${WorkspaceCacheKeys.MetadataVersion}:${workspaceId}`,
      version,
    );
  }

  getMetadataVersion(workspaceId: string): Promise<number | undefined> {
    return this.cacheStorageService.get<number>(
      `${WorkspaceCacheKeys.MetadataVersion}:${workspaceId}`,
    );
  }

  setObjectMetadataCollection(
    workspaceId: string,
    objectMetadataCollection: ObjectMetadataEntity[],
  ) {
    return this.cacheStorageService.set<ObjectMetadataEntity[]>(
      `${WorkspaceCacheKeys.MetadataObjectMetadataCollection}:${workspaceId}`,
      objectMetadataCollection,
    );
  }

  getObjectMetadataCollection(
    workspaceId: string,
  ): Promise<ObjectMetadataEntity[] | undefined> {
    return this.cacheStorageService.get<ObjectMetadataEntity[]>(
      `${WorkspaceCacheKeys.MetadataObjectMetadataCollection}:${workspaceId}`,
    );
  }

  setGraphQLTypeDefs(workspaceId: string, typeDefs: string): Promise<void> {
    return this.cacheStorageService.set<string>(
      `${WorkspaceCacheKeys.GraphQLTypeDefs}:${workspaceId}`,
      typeDefs,
    );
  }

  getGraphQLTypeDefs(workspaceId: string): Promise<string | undefined> {
    return this.cacheStorageService.get<string>(
      `${WorkspaceCacheKeys.GraphQLTypeDefs}:${workspaceId}`,
    );
  }

  setGraphQLUsedScalarNames(
    workspaceId: string,
    usedScalarNames: string[],
  ): Promise<void> {
    return this.cacheStorageService.set<string[]>(
      `${WorkspaceCacheKeys.GraphQLUsedScalarNames}:${workspaceId}`,
      usedScalarNames,
    );
  }

  getGraphQLUsedScalarNames(
    workspaceId: string,
  ): Promise<string[] | undefined> {
    return this.cacheStorageService.get<string[]>(
      `${WorkspaceCacheKeys.GraphQLUsedScalarNames}:${workspaceId}`,
    );
  }

  async flush(workspaceId: string): Promise<void> {
    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataObjectMetadataCollection}:${workspaceId}`,
    );
    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.MetadataVersion}:${workspaceId}`,
    );
    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.GraphQLTypeDefs}:${workspaceId}`,
    );
    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.GraphQLUsedScalarNames}:${workspaceId}`,
    );
    await this.cacheStorageService.del(
      `${WorkspaceCacheKeys.ORMEntitySchemas}:${workspaceId}`,
    );
  }
}
