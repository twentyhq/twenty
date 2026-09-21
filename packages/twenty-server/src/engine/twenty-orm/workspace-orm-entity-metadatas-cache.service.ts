import { Injectable } from '@nestjs/common';

import { type EntityMetadata } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

// The v1 TypeORM EntityMetadata graph is no longer built now that the ORM v2
// read/write path is the only path. The cache key is kept because committed
// upgrade commands and the migration runner still invalidate it.
@Injectable()
@WorkspaceCache('ORMEntityMetadatas', {
  localDataOnly: true,
  packingPonderation: 128,
})
export class WorkspaceORMEntityMetadatasCacheService extends WorkspaceCacheProvider<
  EntityMetadata[]
> {
  async computeForCache(): Promise<EntityMetadata[]> {
    return [];
  }
}
