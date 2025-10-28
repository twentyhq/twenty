import { Module } from '@nestjs/common';

import { GetDataFromCacheWithRecomputeService } from 'src/engine/workspace-cache-storage/services/get-data-from-cache-with-recompute.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Module({
  providers: [
    WorkspaceCacheStorageService,
    GetDataFromCacheWithRecomputeService,
  ],
  exports: [WorkspaceCacheStorageService, GetDataFromCacheWithRecomputeService],
})
export class WorkspaceCacheStorageModule {}
