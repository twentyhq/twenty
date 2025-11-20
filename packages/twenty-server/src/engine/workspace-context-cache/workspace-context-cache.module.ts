import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { WorkspaceContextCacheService } from 'src/engine/workspace-context-cache/services/workspace-context-cache.service';

@Module({
  imports: [CacheStorageModule, DiscoveryModule],
  providers: [WorkspaceContextCacheService],
  exports: [WorkspaceContextCacheService],
})
export class WorkspaceContextCacheModule {}
