import { Module } from '@nestjs/common';

import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Module({
  providers: [WorkspaceCacheStorageService],
  exports: [WorkspaceCacheStorageService],
})
export class WorkspaceCacheStorageModule {}
