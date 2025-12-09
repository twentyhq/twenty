import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Module({
  imports: [CacheStorageModule, DiscoveryModule],
  providers: [WorkspaceCacheService],
  exports: [WorkspaceCacheService],
})
export class WorkspaceCacheModule {}
