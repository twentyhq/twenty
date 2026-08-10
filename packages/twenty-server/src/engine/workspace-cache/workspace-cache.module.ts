import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { MetricsModule } from 'src/engine/core-modules/metrics/metrics.module';
import { WorkspaceCacheMetricsService } from 'src/engine/workspace-cache/services/workspace-cache-metrics.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Module({
  imports: [CacheStorageModule, DiscoveryModule, MetricsModule],
  providers: [WorkspaceCacheService, WorkspaceCacheMetricsService],
  exports: [WorkspaceCacheService],
})
export class WorkspaceCacheModule {}
