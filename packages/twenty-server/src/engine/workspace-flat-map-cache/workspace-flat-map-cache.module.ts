import { Module } from '@nestjs/common';

import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';

@Module({
  imports: [CacheStorageModule],
  providers: [],
  exports: [],
})
export class WorkspaceFlatMapCacheModule {}
