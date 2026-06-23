import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Module({
  imports: [CacheStorageModule, DiscoveryModule, MetricsModule],
  providers: [WorkspaceCacheService],
  exports: [WorkspaceCacheService],
})
export class WorkspaceCacheModule {}
