import { Module } from '@nestjs/common';

import { WorkspaceFlatFrontComponentMapCacheService } from 'src/engine/metadata-modules/flat-front-component/services/workspace-flat-front-component-map-cache.service';

@Module({
  providers: [WorkspaceFlatFrontComponentMapCacheService],
  exports: [WorkspaceFlatFrontComponentMapCacheService],
})
export class FlatFrontComponentModule {}
