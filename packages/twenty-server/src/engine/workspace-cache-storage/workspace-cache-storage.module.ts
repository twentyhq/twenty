import { Module } from '@nestjs/common';

import { FindAllViewsCacheService } from 'src/engine/workspace-cache-storage/services/find-all-views-cache.service';
import { GetDataFromCacheWithRecomputeService } from 'src/engine/workspace-cache-storage/services/get-data-from-cache-with-recompute.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule],
  providers: [
    WorkspaceCacheStorageService,
    GetDataFromCacheWithRecomputeService,
    FindAllViewsCacheService,
  ],
  exports: [
    WorkspaceCacheStorageService,
    GetDataFromCacheWithRecomputeService,
    FindAllViewsCacheService,
  ],
})
export class WorkspaceCacheStorageModule {}
