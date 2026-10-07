import { Module } from '@nestjs/common';

import { WorkspaceFlatConnectionProviderMapCacheService } from 'src/engine/metadata-modules/flat-connection-provider/services/workspace-flat-connection-provider-map-cache.service';

@Module({
  providers: [WorkspaceFlatConnectionProviderMapCacheService],
  exports: [WorkspaceFlatConnectionProviderMapCacheService],
})
export class FlatConnectionProviderModule {}
