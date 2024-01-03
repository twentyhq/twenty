import { Injectable } from '@nestjs/common';

import { InjectMemoryStorage } from 'src/integrations/memory-storage/decorators/inject-memory-storage.decorator';
import { MemoryStorageService } from 'src/integrations/memory-storage/memory-storage.service';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { WorkspaceCacheVersionService } from 'src/metadata/workspace-cache-version/workspace-cache-version.service';

@Injectable()
export class WorkspaceSchemaStorageService {
  constructor(
    @InjectMemoryStorage('objectMetadataCollection')
    private readonly objectMetadataMemoryStorageService: MemoryStorageService<
      ObjectMetadataEntity[]
    >,
    @InjectMemoryStorage('typeDefs')
    private readonly typeDefsMemoryStorageService: MemoryStorageService<string>,
    @InjectMemoryStorage('usedScalarNames')
    private readonly usedScalarNamesMemoryStorageService: MemoryStorageService<
      string[]
    >,
    @InjectMemoryStorage('cacheVersion')
    private readonly cacheVersionMemoryStorageService: MemoryStorageService<string>,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
  ) {}

  async validateCacheVersion(workspaceId: string): Promise<void> {
    const currentVersion =
      (await this.cacheVersionMemoryStorageService.read({
        key: workspaceId,
      })) ?? '0';
    const latestVersion =
      await this.workspaceCacheVersionService.getVersion(workspaceId);

    if (currentVersion !== latestVersion) {
      // Invalidate cache if version mismatch is detected
      await this.invalidateCache(workspaceId);

      // Update the cache version after invalidation
      await this.cacheVersionMemoryStorageService.write({
        key: workspaceId,
        data: latestVersion,
      });
    }
  }

  setObjectMetadata(
    workspaceId: string,
    objectMetadata: ObjectMetadataEntity[],
  ) {
    return this.objectMetadataMemoryStorageService.write({
      key: workspaceId,
      data: objectMetadata,
    });
  }

  getObjectMetadata(
    workspaceId: string,
  ): Promise<ObjectMetadataEntity[] | null> {
    return this.objectMetadataMemoryStorageService.read({
      key: workspaceId,
    });
  }

  setTypeDefs(workspaceId: string, typeDefs: string): Promise<void> {
    return this.typeDefsMemoryStorageService.write({
      key: workspaceId,
      data: typeDefs,
    });
  }

  getTypeDefs(workspaceId: string): Promise<string | null> {
    return this.typeDefsMemoryStorageService.read({
      key: workspaceId,
    });
  }

  setUsedScalarNames(
    workspaceId: string,
    scalarsUsed: string[],
  ): Promise<void> {
    return this.usedScalarNamesMemoryStorageService.write({
      key: workspaceId,
      data: scalarsUsed,
    });
  }

  getUsedScalarNames(workspaceId: string): Promise<string[] | null> {
    return this.usedScalarNamesMemoryStorageService.read({
      key: workspaceId,
    });
  }

  async invalidateCache(workspaceId: string): Promise<void> {
    await this.objectMetadataMemoryStorageService.delete({ key: workspaceId });
    await this.typeDefsMemoryStorageService.delete({ key: workspaceId });
    await this.usedScalarNamesMemoryStorageService.delete({ key: workspaceId });
  }
}
